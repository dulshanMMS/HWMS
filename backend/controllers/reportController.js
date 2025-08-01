import mongoose from 'mongoose';
import ParkingSlot from '../models/ParkingSlots.js';
import SeatingSlot from '../models/SeatingSlots.js';
import User from '../models/User.js';
import Team from '../models/Team.js';

export const floorUsage = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-01-01');
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const dateInRange = (date) => {
      const d = new Date(date);
      return d >= start && d <= end;
    };

    const bookings = [];
    const users = await User.find().select('username teamId firstName lastName');
    const teams = await Team.find().select('teamId teamName color');
    const teamMap = {};
    teams.forEach(team => {
      teamMap[team.teamId] = { teamName: team.teamName, color: team.color };
    });

    const userTeamMap = {};
    users.forEach(user => {
      const teamInfo = teamMap[user.teamId] || { teamName: 'No Team', color: '#6B7280' };
      userTeamMap[user.username] = {
        teamName: teamInfo.teamName,
        teamColor: teamInfo.color,
        fullName: `${user.firstName} ${user.lastName}`,
        teamId: user.teamId || null
      };
    });

    const seatingMembers = await SeatingSlot.find();
    seatingMembers.forEach(member => {
      member.bookings.forEach(booking => {
        if (dateInRange(booking.date)) {
          const userInfo = userTeamMap[member.userName] || {
            teamName: member.teamName || 'No Team',
            teamColor: member.teamColor || '#6B7280',
            fullName: member.userName,
            teamId: member.teamId || null
          };
          bookings.push({
            type: 'seat',
            slot: {
              slotNumber: booking.seatId,
              floor: booking.floor
            },
            team: userInfo.teamName,
            teamColor: userInfo.teamColor,
            teamId: userInfo.teamId,
            user: {
              username: member.userName,
              fullName: userInfo.fullName
            },
            date: booking.date,
            entryTime: booking.entryTime,
            exitTime: booking.exitTime
          });
        }
      });
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching floor usage:', error);
    res.status(500).json({ error: 'Failed to fetch floor usage data' });
  }
};

export const userLookup = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const user = await User.findOne({
      $or: [
        { firstName: new RegExp(`^${name}$`, 'i') },
        { lastName: new RegExp(`^${name}$`, 'i') },
        { $and: [
            { firstName: new RegExp(`^${name.split(' ')[0]}$`, 'i') },
            { lastName: new RegExp(`^${name.split(' ')[1] || ''}$`, 'i') }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const team = await Team.findOne({ teamId: user.teamId });

    const seatingMember = await SeatingSlot.findOne({ 
      userName: new RegExp(`^${user.username}$`, 'i') 
    });

    const parkingSlots = await ParkingSlot.find();

    const seatBookings = seatingMember ? seatingMember.bookings.map(booking => ({
      ...booking.toObject(),
      type: 'seat',
      slotNumber: booking.seatId,
      floor: booking.floor,
      teamName: seatingMember.teamName || team?.teamName || 'No Team'
    })) : [];

    const parkingBookings = parkingSlots.flatMap(slot =>
      slot.bookings
        .filter(b =>
          b.userId?.toString() === user._id.toString() ||
          b.userName?.toLowerCase() === user.username.toLowerCase()
        )
        .map(b => ({
          ...b.toObject(),
          type: 'parking',
          slotNumber: slot.slotNumber,
          floor: slot.floor,
          teamName: team?.teamName || 'No Team'
        }))
    );

    const allBookings = [...seatBookings, ...parkingBookings];

    res.json({
      user: {
        id: user._id,
        username: user.username,
        name: `${user.firstName} ${user.lastName}`,
        team: team?.teamName || 'No Team',
      },
      parkingCount: parkingBookings.length,
      seatCount: seatBookings.length,
      bookings: allBookings
    });
  } catch (error) {
    console.error('Error in user lookup:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const teamLookup = async (req, res) => {
  try {
    const { team } = req.query;
    if (!team) return res.status(400).json({ error: 'team required' });

    console.log('Searching for team:', team);

    const teamData = await Team.findOne({ 
      teamName: new RegExp(`^${team.trim()}$`, 'i') 
    });

    if (!teamData) {
      console.log('Team not found in database');
      return res.status(404).json({ error: 'Team not found' });
    }

    console.log('Found team:', teamData.teamName, 'ID:', teamData.teamId);

    const users = await User.find({ teamId: teamData.teamId })
      .select("username firstName lastName teamId _id vehicleNumber");
    
    if (!users.length) {
      console.log('No users found for team ID:', teamData.teamId);
      return res.status(404).json({ error: 'No users found for this team' });
    }

    console.log('Found users:', users.map(u => u.username));

    const seatingMembers = await SeatingSlot.find({ teamId: teamData.teamId });
    console.log('Found seating members:', seatingMembers.length);
    
    const parkingSlots = await ParkingSlot.find();

    const results = await Promise.all(users.map(async (user) => {
      const userSeatingMember = seatingMembers.find(
        member => member.userName.toLowerCase() === user.username.toLowerCase()
      );
      const seatBookings = userSeatingMember ? userSeatingMember.bookings : [];

      const parkingBookings = parkingSlots.flatMap(slot =>
        slot.bookings.filter(b => 
          b.userId?.toString() === user._id.toString() ||
          b.userName?.toLowerCase() === user.username.toLowerCase()
        )
      );

      console.log(`User ${user.username}: ${seatBookings.length} seat bookings, ${parkingBookings.length} parking bookings`);

      return {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        username: user.username,
        team: teamData.teamName,
        totalParkingBookings: parkingBookings.length,
        totalSeatingBookings: seatBookings.length,
        vehicleNumber: user.vehicleNumber || 'N/A',
        parkingCount: parkingBookings.length,
        seatCount: seatBookings.length,
        bookings: [
          ...seatBookings.map(b => ({
            date: b.date,
            entryTime: b.entryTime,
            exitTime: b.exitTime,
            type: 'seat',
            slotNumber: b.seatId,
            floor: b.floor
          })),
          ...parkingBookings.map(b => ({
            date: b.date,
            entryTime: b.entryTime,
            exitTime: b.exitTime,
            type: 'parking'
          }))
        ]
      };
    }));

    console.log('Returning results for', results.length, 'users');
    res.json(results);
  } catch (err) {
    console.error('Error in team lookup:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


export const analytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-01-01');

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const dateInRange = (date) => {
      const d = new Date(date);
      return d >= start && d <= end;
    };

    const getCounts = (bookings) => {
      const daily = {};
      const monthly = {};
      for (const { date } of bookings) {
        const day = new Date(date).toISOString().slice(0, 10);
        const month = day.slice(0, 7);
        daily[day] = (daily[day] || 0) + 1;
        monthly[month] = (monthly[month] || 0) + 1;
      }
      return { daily, monthly };
    };

    const seatingSlots = await SeatingSlot.find();
    const seatBookings = seatingSlots.flatMap(slot =>
      slot.bookings.filter(b => dateInRange(b.date))
    );

    const parkingSlots = await ParkingSlot.find();
    const parkingBookings = parkingSlots.flatMap(slot =>
      slot.bookings.filter(b => dateInRange(b.date))
    );

    const seatCounts = getCounts(seatBookings);
    const parkingCounts = getCounts(parkingBookings);

    const allDates = Array.from(new Set([
      ...Object.keys(seatCounts.daily),
      ...Object.keys(parkingCounts.daily)
    ])).sort();

    const dailyTrends = allDates.map(date => ({
      _id: { date },
      seatsCount: seatCounts.daily[date] || 0,
      parkingCount: parkingCounts.daily[date] || 0,
    }));

    const allMonths = Array.from(new Set([
      ...Object.keys(seatCounts.monthly),
      ...Object.keys(parkingCounts.monthly)
    ])).sort();

    const monthlyStats = allMonths.map(month => ({
      _id: { month },
      seatsCount: seatCounts.monthly[month] || 0,
      parkingCount: parkingCounts.monthly[month] || 0,
    }));

    res.json({
      dailyTrends,
      monthlyStats,
      overallStats: {
        totalBookings: seatBookings.length + parkingBookings.length,
        totalSeats: seatBookings.length,
        totalParking: parkingBookings.length
      },
      programBookings: []
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
};

export const userBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    const seatingData = await SeatingSlot.aggregate([
      { $unwind: '$bookings' },
      { $match: { 'bookings.userId': userId } },
      { $project: {
          slotType: { $literal: 'seating' },
          slotNumber: '$slotNumber',
          floor: '$floor',
          booking: '$bookings'
      }}
    ]);

    const parkingData = await ParkingSlot.aggregate([
      { $unwind: '$bookings' },
      { $match: { 'bookings.userId': userId } },
      { $project: {
          slotType: { $literal: 'parking' },
          slotNumber: '$slotNumber',
          floor: '$floor',
          booking: '$bookings'
      }}
    ]);

    const allBookings = [...seatingData, ...parkingData]
      .sort((a, b) => new Date(b.booking.date) - new Date(a.booking.date))
      .slice(0, 20);

    res.json(allBookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
};


export const recentBookings = async (req, res) => {
  try {
    const seatingMembers = await SeatingSlot.find();
    const parkingSlots = await ParkingSlot.find();
    const users = await User.find().select('username teamId firstName lastName');
    const teams = await Team.find().select('teamId teamName color');
    
    const teamMap = {};
    teams.forEach(team => {
      teamMap[team.teamId] = {
        teamName: team.teamName,
        color: team.color
      };
    });

    const userTeamMap = {};
    users.forEach(user => {
      const teamInfo = teamMap[user.teamId] || { teamName: 'No Team', color: '#6B7280' };
      userTeamMap[user.username] = {
        teamName: teamInfo.teamName,
        teamColor: teamInfo.color,
        fullName: `${user.firstName} ${user.lastName}`,
        teamId: user.teamId || null
      };
    });

    const today = new Date('2025-07-20T00:00:00+05:30');
    const seatingData = seatingMembers.flatMap(member =>
      member.bookings
        .filter(booking => {
          const bookingDate = new Date(booking.date);
          return booking.date && !isNaN(bookingDate) && bookingDate >= today;
        })
        .map(booking => ({
          slotType: 'seating',
          slotNumber: booking.seatId,
          floor: booking.floor,
          booking: {
            ...booking.toObject(),
            userName: member.userName,
            team: member.teamName || 'No Team',
            teamColor: member.teamColor || '#6B7280',
            teamId: member.teamId || null,
            createdAt: booking.bookedAt || new Date()
          }
        }))
    );

    const parkingData = parkingSlots.flatMap(slot =>
      slot.bookings
        .filter(booking => {
          const bookingDate = new Date(booking.date);
          return booking.date && !isNaN(bookingDate) && bookingDate >= today;
        })
        .map(booking => {
          const userInfo = userTeamMap[booking.userName] || {
            teamName: 'No Team',
            teamColor: '#6B7280',
            fullName: booking.userName,
            teamId: null
          };
          return {
            slotType: 'parking',
            slotNumber: slot.slotNumber,
            floor: slot.floor,
            booking: {
              ...booking.toObject(),
              team: userInfo.teamName,
              teamColor: userInfo.teamColor,
              teamId: userInfo.teamId,
              createdAt: booking.createdAt || new Date()
            }
          };
        })
    );

    const allBookings = [...seatingData, ...parkingData]
      .sort((a, b) => new Date(a.booking.date) - new Date(b.booking.date))
      .slice(0, 10);

    res.json(allBookings);
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    res.status(500).json({ error: 'Failed to fetch recent bookings' });
  }
};



export const allBookings = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : new Date('2000-01-01');
      const end = endDate ? new Date(endDate) : new Date('2100-01-01');
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const dateInRange = (date) => {
        const d = new Date(date);
        return d >= start && d <= end;
      };

      const seatingMembers = await SeatingSlot.find();
      const parkingSlots = await ParkingSlot.find();
      const users = await User.find().select('username teamId firstName lastName');
      const teams = await Team.find().select('teamId teamName color');

      const teamMap = {};
      teams.forEach(team => {
        teamMap[team.teamId] = {
          teamName: team.teamName,
          color: team.color
        };
      });

      const userTeamMap = {};
      users.forEach(user => {
        const teamInfo = teamMap[user.teamId] || { teamName: 'No Team', color: '#6B7280' };
        userTeamMap[user.username] = {
          teamName: teamInfo.teamName,
          teamColor: teamInfo.color,
          fullName: `${user.firstName} ${user.lastName}`,
          teamId: user.teamId || null
        };
      });

      const formattedSeatBookings = seatingMembers.flatMap(member => 
        member.bookings
          .filter(booking => dateInRange(booking.date))
          .map(booking => {
            const userInfo = userTeamMap[member.userName] || {
              teamName: member.teamName || 'No Team',
              teamColor: member.teamColor || '#6B7280',
              fullName: member.userName,
              teamId: member.teamId || null
            };
            return {
              id: `seat-${member._id}-${booking.date}-${booking.entryTime}`,
              _id: `seat-${member._id}-${booking.bookingId}`,
              user: { 
                name: member.userName,
                username: member.userName,
                fullName: userInfo.fullName
              },
              slot: { 
                slotNumber: booking.seatId, 
                floor: booking.floor 
              },
              type: "seat",
              date: booking.date,
              entryTime: booking.entryTime,
              exitTime: booking.exitTime,
              createdAt: new Date(booking.date),
              team: userInfo.teamName,
              teamId: userInfo.teamId,
              teamColor: userInfo.teamColor
            };
          })
      );

      const formattedParkingBookings = parkingSlots.flatMap(slot =>
        slot.bookings
          .filter(booking => dateInRange(booking.date))
          .map(booking => {
            const userInfo = userTeamMap[booking.userName] || {
              teamName: 'No Team',
              teamColor: '#6B7280',
              fullName: booking.userName,
              teamId: null
            };
            return {
              id: `parking-${slot._id}-${booking.date}-${booking.entryTime}`,
              _id: `parking-${slot._id}-${booking.date}-${booking.entryTime}`,
              user: { 
                name: booking.userName,
                username: booking.userName,
                fullName: userInfo.fullName
              },
              slot: { 
                slotNumber: slot.slotNumber, 
                floor: slot.floor 
              },
              type: "parking",
              date: booking.date,
              entryTime: booking.entryTime,
              exitTime: booking.exitTime,
              createdAt: new Date(booking.date),
              team: userInfo.teamName,
              teamId: userInfo.teamId,
              teamColor: userInfo.teamColor
            };
          })
      );

      const allBookings = [...formattedSeatBookings, ...formattedParkingBookings]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      res.json(allBookings);
    } catch (error) {
      console.error('Detailed error in all-bookings endpoint:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  };// All bookings can get for date range

export const getTeamStats = async (req, res) => {
  try {
    const { teamName, startDate, endDate } = req.query;
    if (!teamName) return res.status(400).json({ message: 'Team name is required' });

    console.log('Getting team stats for:', teamName);

    const team = await Team.findOne({ 
      teamName: new RegExp(`^${teamName.trim()}$`, 'i') 
    });

    if (!team) {
      console.log('Team not found:', teamName);
      return res.status(404).json({ message: 'Team not found' });
    }

    console.log('Found team:', team.teamName, 'ID:', team.teamId);

    const members = await User.find({ teamId: team.teamId });
    const memberUsernames = members.map(m => m.username);

    console.log('Team members:', memberUsernames);

    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-01-01');
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    console.log('Date range:', start.toISOString(), 'to', end.toISOString());

    const dateInRange = (date) => {
      const d = new Date(date);
      return d >= start && d <= end;
    };

    const [seatingMembers, parkingSlots] = await Promise.all([
      SeatingSlot.find({}),
      ParkingSlot.find({})
    ]);

    const memberStats = await Promise.all(
      members.map(async (user) => {
        const seatBookings = seatingMembers
          .filter(member => member.userName.toLowerCase() === user.username.toLowerCase())
          .flatMap(member => member.bookings)
          .filter(booking => dateInRange(booking.date)).length;

        const parkingBookings = parkingSlots
          .flatMap(slot => slot.bookings)
          .filter(booking => 
            (booking.userName.toLowerCase() === user.username.toLowerCase()) && 
            dateInRange(booking.date)
          ).length;

        const totalBookings = seatBookings + parkingBookings;

        return {
          id: user._id,
          username: user.username,
          name: `${user.firstName} ${user.lastName}`,
          vehicleNo: user.vehicleNumber || null,
          seatCount: seatBookings,
          parkingCount: parkingBookings,
          totalBookings: totalBookings
        };
      })
    );

    const totalSeatBookings = memberStats.reduce((sum, member) => sum + member.seatCount, 0);
    const totalParkingBookings = memberStats.reduce((sum, member) => sum + member.parkingCount, 0);
    const totalTeamBookings = totalSeatBookings + totalParkingBookings;

    const result = {
      team: {
        name: team.teamName,
        color: team.color || '#6B7280',
        totalMembers: members.length,
        totalSeatBookings: totalSeatBookings,
        totalParkingBookings: totalParkingBookings,
        totalBookings: totalTeamBookings
      },
      members: memberStats
    };

    console.log('Returning team stats:', result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching team stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTeamSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 1) {
      return res.json([]);
    }

    // Normalize query: remove "team" prefix, trim spaces, and convert to lowercase
    const normalizedQuery = query
      .replace(/^team\s+/i, '') // Remove "team" or "Team" prefix
      .trim()
      .toLowerCase();

    if (!normalizedQuery) {
      return res.json([]);
    }

    const teams = await Team.find({
      teamName: new RegExp(normalizedQuery, 'i')
    })
    .select('teamName teamId')
    .limit(10);

    const suggestions = teams.map(team => ({
      value: team.teamName,
      label: team.teamName,
      id: team.teamId
    }));

    res.json(suggestions);
  } catch (error) {
    console.error('Error getting team suggestions:', error);
    res.status(500).json({ error: 'Failed to get team suggestions' });
  }
};



// In reportController.js
export const getUserSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 1) {
      return res.json([]);
    }
    const users = await User.find({
      $or: [
        { username: new RegExp(query, 'i') },
        { firstName: new RegExp(query, 'i') },
        { lastName: new RegExp(query, 'i') }
      ]
    })
      .select('username firstName lastName teamId _id')
      .populate('teamId', 'teamName')
      .limit(10);
    const suggestions = users.map(user => ({
      value: `${user.firstName} ${user.lastName}`, // Use full name
      label: `${user.firstName} ${user.lastName}`,
      name: `${user.firstName} ${user.lastName}`,
      team: user.teamId?.teamName || 'No Team',
      id: user._id.toString()
    }));
    res.json(suggestions);
  } catch (error) {
    console.error('Error getting user suggestions:', error);
    res.status(500).json({ error: 'Failed to get user suggestions' });
  }
};
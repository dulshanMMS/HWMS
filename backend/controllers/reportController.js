import ParkingSlot from '../models/ParkingSlots.js';
import SeatingSlot from '../models/SeatingSlots.js';
import User from '../models/User.js';
import Team from '../models/Team.js';

/**
 * Get combined floor usage data (seating + parking) between a date range.
 * Useful for visualizations grouped by floor and type (seat/parking).
 *
 * Query Params:
 * - startDate: Start of date range (inclusive)
 * - endDate: End of date range (inclusive)
 */
export const floorUsage = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const dateInRange = (date) => {
      const d = new Date(date);
      return d >= start && d <= end;
    };

    const bookings = [];

    const seatingSlots = await SeatingSlot.find();
    seatingSlots.forEach(slot => {
      slot.bookings.forEach(b => {
        if (dateInRange(b.date)) {
          bookings.push({
            ...b.toObject(),
            team: b.team,
            details: `Floor ${slot.floor}`,
            type: 'seat'
          });
        }
      });
    });

    const parkingSlots = await ParkingSlot.find();
    parkingSlots.forEach(slot => {
      slot.bookings.forEach(b => {
        if (dateInRange(b.date)) {
          bookings.push({
            ...b.toObject(),
            team: b.team,
            details: `Floor ${slot.floor}`,
            type: 'parking'
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
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: 'username required' });
    }

    const user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const seatingSlots = await SeatingSlot.find();
    const parkingSlots = await ParkingSlot.find();

    const seatBookings = seatingSlots.flatMap(slot =>
      slot.bookings.filter(b => b.userId?.toString() === user._id.toString())
    );

    const parkingBookings = parkingSlots.flatMap(slot =>
      slot.bookings.filter(b => b.userId?.toString() === user._id.toString())
    );

    res.json({
      user: {
        id: user._id,
        username: user.username,
        name: `${user.firstName} ${user.lastName}`,
        team: user.team,
      },
      parkingCount: parkingBookings.length,
      seatCount: seatBookings.length,
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

    const users = await User.find({ team }).select("username firstName lastName team _id");
    if (!users.length) return res.status(404).json({ error: 'No users found for this team' });

    const results = await Promise.all(users.map(async (user) => {
      const seatingSlots = await SeatingSlot.find();
      const parkingSlots = await ParkingSlot.find();

      const seatBookings = seatingSlots.flatMap(slot =>
        slot.bookings.filter(b => b.userName === user.username)
      );

      const parkingBookings = parkingSlots.flatMap(slot =>
        slot.bookings.filter(b => b.userName === user.username)
      );

      return {
        id: user._id,
        username: user.username,
        name: `${user.firstName} ${user.lastName}`,
        team: user.team,
        parkingCount: parkingBookings.length,
        seatCount: seatBookings.length,
        bookings: [...seatBookings, ...parkingBookings].map(b => ({
          date: b.date,
          entryTime: b.entryTime,
          exitTime: b.exitTime,
          type: seatBookings.includes(b) ? 'seat' : 'parking'
        }))
      };
    }));

    res.json(results);
  } catch (err) {
    console.error('Error in team lookup:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// export const analytics = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
//     // const start = new Date(startDate);
//     // const end = new Date(endDate);

//     // ✅ Add default values to include all data if no range is selected
//     const start = startDate ? new Date(startDate) : new Date('2000-01-01');
//     const end = endDate ? new Date(endDate) : new Date('2100-01-01');

//     // Normalize times to cover full day
//     start.setHours(0, 0, 0, 0);
//     end.setHours(23, 59, 59, 999);

//     const dateInRange = (date) => {
//       const d = new Date(date);
//       return d >= start && d <= end;
//     };

//     const getCounts = (bookings) => {
//       const daily = {};
//       const monthly = {};

//       for (const { date } of bookings) {
//         const day = new Date(date).toISOString().slice(0, 10);
//         const month = day.slice(0, 7);
//         daily[day] = (daily[day] || 0) + 1;
//         monthly[month] = (monthly[month] || 0) + 1;
//       }

//       return { daily, monthly };
//     };

//     const seatingSlots = await SeatingSlot.find();
//     const seatBookings = seatingSlots.flatMap(slot =>
//       slot.bookings.filter(b => dateInRange(b.date))
//     );

//     const parkingSlots = await ParkingSlot.find();
//     const parkingBookings = parkingSlots.flatMap(slot =>
//       slot.bookings.filter(b => dateInRange(b.date))
//     );

//     const seatCounts = getCounts(seatBookings);
//     const parkingCounts = getCounts(parkingBookings);

//     const allDates = Array.from(new Set([...Object.keys(seatCounts.daily), ...Object.keys(parkingCounts.daily)])).sort();
//     const dailyTrends = allDates.map(date => ({
//       _id: { date },
//       seatsCount: seatCounts.daily[date] || 0,
//       parkingCount: parkingCounts.daily[date] || 0,
//     }));

//     const allMonths = Array.from(new Set([...Object.keys(seatCounts.monthly), ...Object.keys(parkingCounts.monthly)])).sort();
//     const monthlyStats = allMonths.map(month => ({
//       _id: { month },
//       seatsCount: seatCounts.monthly[month] || 0,
//       parkingCount: parkingCounts.monthly[month] || 0,
//     }));

//     res.json({
//       dailyTrends,
//       monthlyStats,
//       overallStats: {
//         totalBookings: seatBookings.length + parkingBookings.length,
//         totalSeats: seatBookings.length,
//         totalParking: parkingBookings.length
//       },
//       programBookings: []
//     });
//   } catch (error) {
//     console.error('Error fetching analytics:', error);
//     res.status(500).json({ error: 'Failed to fetch analytics data' });
//   }
// };
// import SeatingSlot from '../models/SeatingSlots.js';
// import ParkingSlot from '../models/ParkingSlots.js';

export const analytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // ✅ Apply default range if not provided
    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-01-01');

    // ✅ Normalize times to include the full start & end days
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const dateInRange = (date) => {
      const d = new Date(date);
      return d >= start && d <= end;
    };

    // ✅ Helper function to group by day & month
    const getCounts = (bookings) => {
      const daily = {};
      const monthly = {};
      for (const { date } of bookings) {
        const day = new Date(date).toISOString().slice(0, 10);   // yyyy-mm-dd
        const month = day.slice(0, 7);                            // yyyy-mm
        daily[day] = (daily[day] || 0) + 1;
        monthly[month] = (monthly[month] || 0) + 1;
      }
      return { daily, monthly };
    };

    // ✅ Fetch and filter seat bookings
    const seatingSlots = await SeatingSlot.find();
    const seatBookings = seatingSlots.flatMap(slot =>
      slot.bookings.filter(b => dateInRange(b.date))
    );

    // ✅ Fetch and filter parking bookings
    const parkingSlots = await ParkingSlot.find();
    const parkingBookings = parkingSlots.flatMap(slot =>
      slot.bookings.filter(b => dateInRange(b.date))
    );

    // ✅ Generate daily & monthly counts
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

    // ✅ Final response
    res.json({
      dailyTrends,
      monthlyStats,
      overallStats: {
        totalBookings: seatBookings.length + parkingBookings.length,
        totalSeats: seatBookings.length,
        totalParking: parkingBookings.length
      },
      programBookings: [] // Optional field for future expansion
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
    const seatingData = await SeatingSlot.aggregate([
      { $unwind: '$bookings' },
      { $project: {
          slotType: { $literal: 'seating' },
          slotNumber: '$slotNumber',
          floor: '$floor',
          booking: '$bookings'
      }}
    ]);

    const parkingData = await ParkingSlot.aggregate([
      { $unwind: '$bookings' },
      { $project: {
          slotType: { $literal: 'parking' },
          slotNumber: '$slotNumber',
          floor: '$floor',
          booking: '$bookings'
      }}
    ]);

    const allBookings = [...seatingData, ...parkingData]
      .sort((a, b) => new Date(b.booking.date) - new Date(a.booking.date))
      .slice(0, 10);

    res.json(allBookings);
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    res.status(500).json({ error: 'Failed to fetch recent bookings' });
  }
};

export const allBookings = async (req, res) => {
  try {
    const seatSlots = await SeatingSlot.find();
    const parkingSlots = await ParkingSlot.find();

    const formattedSeatBookings = seatSlots.flatMap(slot =>
      slot.bookings.map(b => ({
        id: `${slot._id}-${b.date}`,
        user: { name: b.userName },
        slot: { slotNumber: slot.slotNumber, floor: slot.floor },
        type: "seat",
        date: b.date,
        entryTime: b.entryTime,
        exitTime: b.exitTime,
        createdAt: new Date(b.date)
      }))
    );

    const formattedParkingBookings = parkingSlots.flatMap(slot =>
      slot.bookings.map(b => ({
        id: `${slot._id}-${b.date}`,
        user: { name: b.userName },
        slot: { slotNumber: slot.slotNumber, floor: slot.floor },
        type: "parking",
        date: b.date,
        entryTime: b.entryTime,
        exitTime: b.exitTime,
        createdAt: new Date(b.date)
      }))
    );

    const allBookings = [...formattedSeatBookings, ...formattedParkingBookings]
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(allBookings);
  } catch (error) {
    console.error('Detailed error in all-bookings endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};



export const getTeamStats = async (req, res) => {
  try {
    const { teamName } = req.query;
    if (!teamName) return res.status(400).json({ message: 'Team name is required' });

    // Find the team
    const cleanedTeamName = teamName.trim().replace(/\s+/g, '\\s*');  // convert "team a" => "team\\s*a"
    const regex = new RegExp(`^${cleanedTeamName}$`, 'i');             // full word match, case-insensitive
    const team = await Team.findOne({ teamName: regex });

    // const team = await Team.findOne({ teamName });
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Find team members
    const members = await User.find({ teamId: team.teamId });
    const memberUsernames = members.map(m => m.username);

    // Calculate previous month
    const now = new Date();
    const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Helper to count bookings in a slot array
    const countBookings = (slots, usernames) => {
      let count = 0;
      for (const slot of slots) {
        for (const booking of slot.bookings) {
          if (
            usernames.includes(booking.userName) &&
            booking.date >= firstDayPrevMonth.toISOString().slice(0, 10) &&
            booking.date <= lastDayPrevMonth.toISOString().slice(0, 10)
          ) {
            count++;
          }
        }
      }
      return count;
    };

    // Fetch all seating and parking slots
    const [seatingSlots, parkingSlots] = await Promise.all([
      SeatingSlot.find({}),
      ParkingSlot.find({})
    ]);

    // Count seat and parking bookings for team members
    const totalSeatBookings = countBookings(seatingSlots, memberUsernames);
    const totalParkingBookings = countBookings(parkingSlots, memberUsernames);

    // Team bookings = seat + parking
    const totalTeamBookings = totalSeatBookings + totalParkingBookings;

    res.json({
      teamMembers: members.map(m => ({
        id: m._id,
        username: m.username,
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email
      })),
      totalSeatBookings,
      totalParkingBookings,
      totalTeamBookings
    });
  } catch (error) {
    console.error('Error fetching team stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';


const getDeskUsageStats = async (startDate, endDate) => {
    try {
      // Aggregate desk bookings by floor
      const deskUsage = await Booking.aggregate([
        {
          $match: {
            bookingType: 'seat',
            date: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $group: {
            _id: '$floor',
            totalBookings: { $sum: 1 }
          }
        }
      ]);
  
      // Define total desks per floor (you should adjust these numbers according to your actual floor capacity)
      const totalDesksPerFloor = {
        1: 64, 
        2: 64,
        3: 64,
        4: 64
      };
  
      // Calculate usage percentages
      const usageStats = Object.entries(totalDesksPerFloor).map(([floor, totalDesks]) => {
        const floorData = deskUsage.find(d => d._id === parseInt(floor)) || { totalBookings: 0 };
        const used = (floorData.totalBookings / totalDesks) * 100;
        return {
          floor: `Floor ${floor}`,
          used: parseFloat(used.toFixed(2)),
          unused: parseFloat((100 - used).toFixed(2))
        };
      });
  
      return usageStats;
    } catch (error) {
      console.error('Error calculating desk usage stats:', error);
      throw error;
    }
  };

// Function to handle team lookup
export const teamLookup = async (req, res) => {
    try {
        const { team } = req.query;
        if (!team) {
            return res.status(400).json({ error: "team required" });
        }

        const users = await User.find({ team }).select("username firstName lastName team _id");
        if (!users.length) return res.status(404).json({ error: "No users found for this team" });

        const results = await Promise.all(users.map(async (user) => { //parallelize DB queries for each user
            const bookings = await Booking.find({ userId: user._id });
            const parkingCount = bookings.filter(b => b.type === "parking").length;
            const seatCount = bookings.filter(b => b.type === "seat").length;

            const bookingDetails = bookings.map(b => ({
                date: b.date,
                type: b.type
            }));

            return {
                id: user._id,
                username: user.username,
                name: `${user.firstName} ${user.lastName}`,
                team: user.team,
                parkingCount,
                seatCount,
                bookings: bookingDetails
            };
        }));

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

// Function to handle user lookup
export const userLookup = async (req, res) => {
    try {
        const { username } = req.query;

        // Validate input
        if (!username) {
            return res.status(400).json({ error: 'username required' });
        }

        // Perform a case-insensitive search
        const user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const bookings = await Booking.find({ userId: user._id });
        const parkingCount = bookings.filter(b => b.type === "parking").length;
        const seatCount = bookings.filter(b => b.type === "seat").length;

        res.json({
            user: {
                id: user._id,
                username: user.username,
                name: `${user.firstName} ${user.lastName}`,
                team: user.team,
            },
            parkingCount,
            seatCount,
        });
    } catch (error) {
        console.error('Error in user lookup:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Function to handle analytics
export const analytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = {};
        
        if (startDate && endDate) {
            dateFilter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const dailyTrends = await Booking.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: {
                        date: { 
                            $dateToString: { 
                                format: "%Y-%m-%d",
                                date: { $toDate: "$date" }
                            }
                        }
                    },
                    seatsCount: {
                        $sum: { $cond: [{ $eq: ["$type", "seat"] }, 1, 0] }
                    },
                    parkingCount: {
                        $sum: { $cond: [{ $eq: ["$type", "parking"] }, 1, 0] }
                    }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);

        const monthlyStats = await Booking.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: {
                        month: { 
                            $dateToString: { 
                                format: "%Y-%m",
                                date: { $toDate: "$date" }
                            }
                        }
                    },
                    seatsCount: {
                        $sum: { $cond: [{ $eq: ["$type", "seat"] }, 1, 0] }
                    },
                    parkingCount: {
                        $sum: { $cond: [{ $eq: ["$type", "parking"] }, 1, 0] }
                    }
                }
            },
            { $sort: { "_id.month": 1 } }
        ]);

        const overallStats = await Booking.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    totalSeats: {
                        $sum: { $cond: [{ $eq: ["$type", "seat"] }, 1, 0] }
                    },
                    totalParking: {
                        $sum: { $cond: [{ $eq: ["$type", "parking"] }, 1, 0] }
                    }
                }
            }
        ]);

        const programBookings = await Booking.aggregate([
            { 
                $match: { 
                    ...dateFilter,
                    type: "seat"
                }
            },
            {
                $group: {
                    _id: {
                        month: { 
                            $dateToString: { 
                                format: "%Y-%m",
                                date: { $toDate: "$date" }
                            }
                        },
                        program: "$program"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.month",
                    programs: {
                        $push: {
                            program: "$_id.program",
                            count: "$count"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    "Team A": {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$programs",
                                        as: "prog",
                                        cond: { $eq: ["$$prog.program", "Team A"] }
                                    }
                                },
                                as: "filtered",
                                in: "$$filtered.count"
                            }
                        }
                    },
                    "Team B": {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$programs",
                                        as: "prog",
                                        cond: { $eq: ["$$prog.program", "Team B"] }
                                    }
                                },
                                as: "filtered",
                                in: "$$filtered.count"
                            }
                        }
                    },
                    "Team C": {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$programs",
                                        as: "prog",
                                        cond: { $eq: ["$$prog.program", "Team C"] }
                                    }
                                },
                                as: "filtered",
                                in: "$$filtered.count"
                            }
                        }
                    }
                }
            },
            { $sort: { month: 1 } }
        ]);

        res.json({
            dailyTrends,
            monthlyStats,
            overallStats: overallStats[0] || {
                totalBookings: 0,
                totalSeats: 0,
                totalParking: 0
            },
            programBookings
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
};

// Function to handle user bookings
export const userBookings = async (req, res) => {
    try {
        const { userId } = req.params;
        const bookings = await Booking.find({ userId }).sort({ date: -1 }).limit(20);
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ error: 'Failed to fetch user bookings' });
    }
};

// Function to handle recent bookings
export const recentBookings = async (req, res) => {
    try {
        const recentBookings = await Booking.find()
            .sort({ date: -1 })
            .limit(10);
        res.json(recentBookings);
    } catch (error) {
        console.error('Error fetching recent bookings:', error);
        res.status(500).json({ error: 'Failed to fetch recent bookings' });
    }
};

// Function to handle floor usage
export const floorUsage = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = {};
        
        if (startDate && endDate) {
            dateFilter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const floorBookings = await Booking.aggregate([
            {
                $match: {
                    ...dateFilter,
                    type: "seat"
                }
            },
            {
                $group: {
                    _id: "$floor",
                    bookingCount: { $sum: 1 }
                }
            }
        ]);

        const totalSeatsPerFloor = {
            'Floor 14': 64,
            'Floor 30': 64,
            'Floor 31': 64,
            'Floor 32': 64
        };

        const floorUsage = Object.entries(totalSeatsPerFloor).map(([floorName, totalSeats]) => {
            const floorData = floorBookings.find(b => b._id === floorName) || { bookingCount: 0 };
            const usedPercentage = (floorData.bookingCount / totalSeats) * 100;

            return {
                floor: floorName,
                used: parseFloat(usedPercentage.toFixed(2)),
                unused: parseFloat((100 - usedPercentage).toFixed(2))
            };
        });

        res.json(floorUsage);
    } catch (error) {
        console.error('Error fetching floor usage:', error);
        res.status(500).json({ error: 'Failed to fetch floor usage data' });
    }
};

// Function to handle all bookings
export const allBookings = async (req, res) => {
    try {
        const rawBookings = await Booking.find().sort({ date: -1 });

        const bookings = await Booking.find()
            .sort({ date: -1 })
            .populate({
                path: 'userId',
                select: 'firstName lastName email team',
                model: 'User'
            })
            .populate({
                path: 'slotId',
                select: 'slotNumber floor',
                model: 'SeatingSlots'
            });

        const formattedBookings = bookings.map(booking => {
            const user = booking.userId ? {
                id: booking.userId._id,
                name: `${booking.userId.firstName || ''} ${booking.userId.lastName || ''}`.trim(),
                email: booking.userId.email || '',
                team: booking.userId.team || ''
            } : null;

            const slot = booking.slotId ? {
                slotNumber: booking.slotId.slotNumber,
                floor: booking.slotId.floor
            } : null;

            return {
                id: booking._id,
                user,
                slot,
                type: booking.type || '',
                date: booking.date,
                details: booking.details || '',
                status: booking.status || 'active',
                team: booking.team || '',
                createdAt: booking.createdAt
            };
        });

        res.json(formattedBookings);
    } catch (error) {
        console.error('Detailed error in all-bookings endpoint:', error);
        res.status(500).json({ 
            error: 'Failed to fetch bookings',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Function to handle parking stream
export const handleParkingStream = async (req, res) => {
    try {
        const parkingStream = await Booking.watch();

        parkingStream.on('change', async (change) => {
            console.log('Change detected:', change); // Log all changes
            if (change.operationType === 'insert') {
                const { userName, slotNumber, floor, date, entryTime, exitTime } = change.fullDocument;
                
                // Find the user by username to get the user ID
                const user = await User.findOne({ username: userName });
                if (!user) {
                    console.error(`User not found for username: ${userName}. Skipping notification creation.`);
                    return; // Skip this booking if user not found
                }

                // Create a notification for the new booking
                const message = `${userName} has booked Parking Slot ${slotNumber} on Floor ${floor} from ${entryTime} to ${exitTime} on ${date}`;
                const notification = new Notification({
                    title: 'New Parking Booking',
                    message,
                    type: 'parking_booking',
                    recipient: user._id, // Set the recipient to the user's ID
                });

                await notification.save();
                console.log('Notification saved:', message);
            }
        });

        res.status(200).json({ message: 'Parking stream monitoring started' });
    } catch (error) {
        console.error('Error setting up parking stream:', error);
        res.status(500).json({ error: 'Failed to set up parking stream' });
    }
};
import express from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';


const router = express.Router();



// Admin: Lookup users by team and their bookings
router.get('/team-lookup', async (req, res) => {
    try {
        const { team } = req.query;
        if (!team) {
            return res.status(400).json({ error: "team required" });
        }

        // Find all users in the team
        const users = await User.find({ team }).select("username firstName lastName team _id");
        if (!users.length) return res.status(404).json({ error: "No users found for this team" });

        // For each user, get their bookings and counts
        const results = await Promise.all(users.map(async (user) => {
            const bookings = await Booking.find({ userId: user._id });
            const parkingCount = bookings.filter(b => b.type === "parking").length;
            const seatCount = bookings.filter(b => b.type === "seat").length;

            // Map bookings to include date and type
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
});
// Admin: Lookup user info and booking counts
router.get('/user-lookup', async (req, res) => {
    try {
        const { userId, username } = req.query;
        if (!userId && !username) {
            return res.status(400).json({ error: "userId or username required" });
        }

        // Find user by ID or username
        const user = await User.findOne(
            userId ? { _id: userId } : { username }
        ).select("username firstName lastName team");
        if (!user) return res.status(404).json({ error: "User not found" });

        // Get bookings for this user
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
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Analytics route
router.get('/analytics', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = {};
        
        if (startDate && endDate) {
            dateFilter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Get daily trends
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

        // Get monthly stats
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

        // Get overall stats
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

        // Program bookings
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
});

// Get user bookings
router.get('/user-bookings/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const bookings = await Booking.find({ userId }).sort({ date: -1 }).limit(20);
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ error: 'Failed to fetch user bookings' });
    }
});

// Recent bookings endpoint
router.get('/recent', async (req, res) => {
    try {
        const recentBookings = await Booking.find()
            .sort({ date: -1 })
            .limit(10);
        res.json(recentBookings);
    } catch (error) {
        console.error('Error fetching recent bookings:', error);
        res.status(500).json({ error: 'Failed to fetch recent bookings' });
    }
});

// Floor usage endpoint
router.get('/floor-usage', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = {};
        
        if (startDate && endDate) {
            dateFilter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Get bookings count for each floor
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

        console.log('Raw floor bookings data:', floorBookings); // Debug log

        // Define total seats per floor
        const totalSeatsPerFloor = {
            'Floor 14': 50,
            'Floor 30': 50,
            'Floor 31': 50,
            'Floor 32': 50
        };

        // Calculate usage percentages for all floors
        const floorUsage = Object.entries(totalSeatsPerFloor).map(([floorName, totalSeats]) => {
            const floorData = floorBookings.find(b => b._id === floorName) || { bookingCount: 0 };
            const usedPercentage = (floorData.bookingCount / totalSeats) * 100;

            return {
                floor: floorName,
                used: parseFloat(usedPercentage.toFixed(2)),
                unused: parseFloat((100 - usedPercentage).toFixed(2))
            };
        });

        console.log('Floor usage data:', floorUsage); // Debug log
        res.json(floorUsage);
    } catch (error) {
        console.error('Error fetching floor usage:', error);
        res.status(500).json({ error: 'Failed to fetch floor usage data' });
    }
});

export default router;
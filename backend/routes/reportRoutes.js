import express from 'express';
import Booking from '../models/Booking.js';

const router = express.Router();

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
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
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
                        month: { $dateToString: { format: "%Y-%m", date: "$date" } }
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

        // programBookings
const programBookings = await Booking.aggregate([
    { $match: { 
        ...dateFilter,
        type: "seat"
    }},
    {
        $group: {
            _id: {
                month: { $dateToString: { format: "%Y-%m", date: "$date" } },
                program: "$program" // Changed from department to program
            },
            count: { $sum: 1 }
        }
    },
    {
        $group: {
            _id: "$_id.month",
            programs: { // Changed from departments to programs
                $push: {
                    program: "$_id.program", // Changed from department to program
                    count: "$count"
                }
            }
        }
    },
    {
        $project: {
            _id: 0,
            month: "$_id",
            SENG: { // Update these program names according to your actual programs
                $sum: {
                    $map: {
                        input: {
                            $filter: {
                                input: "$programs",
                                as: "prog",
                                cond: { $eq: ["$$prog.program", "SENG"] }
                            }
                        },
                        as: "filtered",
                        in: "$$filtered.count"
                    }
                }
            },
            BM: {
                $sum: {
                    $map: {
                        input: {
                            $filter: {
                                input: "$programs",
                                as: "prog",
                                cond: { $eq: ["$$prog.program", "BM"] }
                            }
                        },
                        as: "filtered",
                        in: "$$filtered.count"
                    }
                }
            },
            IT: {
                $sum: {
                    $map: {
                        input: {
                            $filter: {
                                input: "$programs",
                                as: "prog",
                                cond: { $eq: ["$$prog.program", "IT"] }
                            }
                        },
                        as: "filtered",
                        in: "$$filtered.count"
                    }
                }
            },
            // Add other programs as needed
        }
    },
    { $sort: { month: 1 } }
]);

// Update the response to use programBookings instead of departmentBookings
res.json({
    dailyTrends,
    monthlyStats,
    overallStats: overallStats[0] || {
        totalBookings: 0,
        totalSeats: 0,
        totalParking: 0
    },
    programBookings // Changed from departmentBookings
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
        const bookings = await Booking.find({ userId })
            .sort({ date: -1 })
            .limit(20);
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ error: 'Failed to fetch user bookings' });
    }
});

// Add the missing recent bookings endpoint
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

export default router;
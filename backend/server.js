import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import parkingRoutes from "./routes/parkingRoutes.js";
import authRoutes from "./routes/auth.js";
import reportRoutes from "./routes/reportRoutes.js";
import Booking from "./models/Booking.js";

// Initialize App
dotenv.config(); // Load .env variables

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

const server = http.createServer(app); // Create HTTP server
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }
}); // Enable WebSocket

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/reports", reportRoutes);

// Test Route to Check Server Status
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Test API endpoint for connection
app.get("/api/test", (req, res) => {
    res.json({ 
        message: "Connection successful!", 
        timestamp: new Date().toISOString() 
    });
});

// MongoDB Connection
const mongoURI = process.env.MONGO_URI; // Use environment variable for connection string

mongoose.connect(mongoURI)
    .then(() => {
        console.log('MongoDB Connected');
        // Log the number of documents in the bookings collection
        return Booking.countDocuments();
    })
    .then(count => {
        console.log(`Number of bookings in database: ${count}`);
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Analytics Route
app.get("/api/reports/analytics", async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = {};
        
        if (startDate && endDate) {
            dateFilter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        console.log('Fetching analytics with filter:', dateFilter);

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

        console.log('Daily trends:', dailyTrends);

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

        console.log('Monthly stats:', monthlyStats);

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

        console.log('Overall stats:', overallStats);

        res.json({
            dailyTrends,
            monthlyStats,
            overallStats: overallStats[0] || {
                totalBookings: 0,
                totalSeats: 0,
                totalParking: 0
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
});

// Get user bookings
app.get('/api/reports/user-bookings/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Fetching bookings for user:', userId);
        
        const bookings = await Booking.find({ userId })
            .sort({ date: -1 })
            .limit(20);
            
        console.log('Found bookings:', bookings);
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ error: 'Failed to fetch user bookings' });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Socket.io connection
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
});
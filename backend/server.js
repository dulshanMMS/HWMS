import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

// Route Imports
import parkingRoutes from "./routes/parkingRoutes.js";
import authRoutes from "./routes/auth.js";
import reportRoutes from "./routes/reportRoutes.js";
import Booking from "./models/Booking.js";
import historyRoutes from "./routes/historyRoutes.js";
import bookingRoutes from './routes/bookingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import eventRoutes from './routes/events.js'; 

// Initialize App
dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/history", historyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/events', eventRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "Connection successful!",
    timestamp: new Date().toISOString()
  });
});

// WebSocket
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
});

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB Connected');
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
    const bookings = await Booking.find({ userId })
      .sort({ date: -1 })
      .limit(20);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

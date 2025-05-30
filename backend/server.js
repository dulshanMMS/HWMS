import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import parkingRoutes from "./routes/parkingRoutes.js";
import authRoutes from "./routes/auth.js";
import reportRoutes from "./routes/reportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import Booking from "./models/Booking.js";
import Notification from "./models/Notification.js";
import historyRoutes from "./routes/historyRoutes.js";
import bookingRoutes from './routes/bookingRoutes.js';
import eventRoutes from './routes/events.js';
import parkingAdminRoutes from "./routes/parkingAdminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import bookingViewRoutes from './routes/bookingViewRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import teamRoutes from "./routes/teamRoutes.js";

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
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/admin/parking", parkingAdminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/calendar", calendarRoutes);
app.use('/api/calendar', bookingViewRoutes);
app.use('/api/support', supportRoutes);
app.use("/api", teamRoutes);

// Test Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Connection successful!", timestamp: new Date().toISOString() });
});

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB Connected');
    const bookingCount = await Booking.countDocuments();
    const notificationCount = await Notification.countDocuments();
    console.log(`Bookings: ${bookingCount}, Notifications: ${notificationCount}`);
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
          _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } },
          seatsCount: { $sum: { $cond: [{ $eq: ["$type", "seat"] }, 1, 0] } },
          parkingCount: { $sum: { $cond: [{ $eq: ["$type", "parking"] }, 1, 0] } }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    const monthlyStats = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { month: { $dateToString: { format: "%Y-%m", date: "$date" } } },
          seatsCount: { $sum: { $cond: [{ $eq: ["$type", "seat"] }, 1, 0] } },
          parkingCount: { $sum: { $cond: [{ $eq: ["$type", "parking"] }, 1, 0] } }
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
          totalSeats: { $sum: { $cond: [{ $eq: ["$type", "seat"] }, 1, 0] } },
          totalParking: { $sum: { $cond: [{ $eq: ["$type", "parking"] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      dailyTrends,
      monthlyStats,
      overallStats: overallStats[0] || { totalBookings: 0, totalSeats: 0, totalParking: 0 }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// User bookings route
app.get('/api/reports/user-bookings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ userId }).sort({ date: -1 }).limit(20);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
});

// WebSocket Setup
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("newNotification", async (notification) => {
    try {
      const newNotification = new Notification(notification);
      await newNotification.save();
      io.emit("notificationReceived", newNotification);
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

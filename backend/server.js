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
import { initializeNotificationSystem } from './services/notificationService.js';

import ParkingSlot from './models/ParkingSlots.js';
import SeatingSlot from './models/SeatingSlots.js';
import Notification from "./models/Notification.js";

import parkinghistoryRoutes from "./routes/parkinghistoryRoutes.js"; //history
import parkingAdminRoutes from "./routes/parkingAdminRoutes.js";   //parking_admin
import bookingRoutes from './routes/bookingRoutes.js';
import eventRoutes from './routes/events.js';
import userRoutes from "./routes/user.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import bookingViewRoutes from './routes/bookingViewRoutes.js';
import teamRoutes from './routes/teamRoutes.js';

import messageRoutes from './routes/messageRoutes.js';
import { socketController } from './controllers/socketController.js';

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
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/history", parkinghistoryRoutes);  // history
app.use("/api/admin/parking", parkingAdminRoutes);  // parking admin
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/user", userRoutes);
app.use("/api/calendar", calendarRoutes);
app.use('/api/calendar', bookingViewRoutes);
app.use('/api', teamRoutes);
app.use('/api/messages', messageRoutes);

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

    // Compute total bookings from SeatingSlot and ParkingSlot
    const seatingSlots = await SeatingSlot.find();
    const parkingSlots = await ParkingSlot.find();

    const totalSeatBookings = seatingSlots.reduce((sum, slot) => sum + slot.bookings.length, 0);
    const totalParkingBookings = parkingSlots.reduce((sum, slot) => sum + slot.bookings.length, 0);
    const notificationCount = await Notification.countDocuments();

    console.log(`Bookings: ${totalSeatBookings + totalParkingBookings}, Notifications: ${notificationCount}`);

    initializeNotificationSystem();
  })
  .catch(err => console.error('MongoDB connection error:', err));

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
  socketController.handleMessagingEvents(socket, io);
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

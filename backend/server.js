import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import seatbookingRoutes from "./routes/seatBookings.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import authRoutes from './routes/auth.js';
import seatHistoryRoutes from "./routes/seatHistoryRoutes.js";
import parkingRoutes from "./routes/parkingRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js"; // New rating routes
import { initializeNotificationSystem } from './services/notificationService.js';

// import { deleteAllNotificationsInDatabase } from './services/NotificationService.js'; //For testing only Sjay


import ParkingSlot from './models/ParkingSlots.js';
import SeatingSlot from './models/SeatingSlots.js';
import Notification from "./models/Notification.js";
import Rating from "./models/ratingModel.js"; // New rating model

import parkinghistoryRoutes from "./routes/parkinghistoryRoutes.js";
import parkingAdminRoutes from "./routes/parkingAdminRoutes.js";
import eventRoutes from './routes/events.js';
import userRoutes from "./routes/user.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import bookingViewRoutes from './routes/bookingViewRoutes.js';
import announcementRoutes from "./routes/announcementRoutes.js";
import emailRoutes from './routes/emailRoutes.js';

import messageRoutes from './routes/messageRoutes.js';
import { socketController } from './controllers/socketController.js';
import supportRoutes from "./routes/supportRoutes.js";

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
app.use("/api/seathistory", seatHistoryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/history", parkinghistoryRoutes);
app.use("/api/admin/parking", parkingAdminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/bookings", seatbookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/user", userRoutes);
app.use("/api/calendar", calendarRoutes);
app.use('/api/calendar', bookingViewRoutes);
app.use('/api', teamRoutes);
app.use('/api/email', emailRoutes);

app.use("/api/ratings", ratingRoutes); // New rating routes

app.use("/api/announcements", announcementRoutes);
app.use('/api/messages', messageRoutes);
app.use("/api/support", supportRoutes);


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

    try {
      console.log('Initializing notification system...');
      initializeNotificationSystem();
      console.log('Notification system initialized successfully');
    } catch (error) {
      console.error('Error initializing notification system:', error);
    }
    // Compute total bookings from SeatingSlot and ParkingSlot
    const seatingSlots = await SeatingSlot.find();
    const parkingSlots = await ParkingSlot.find();

    const totalSeatBookings = seatingSlots.reduce((sum, slot) => sum + slot.bookings.length, 0);
    const totalParkingBookings = parkingSlots.reduce((sum, slot) => sum + slot.bookings.length, 0);
    const notificationCount = await Notification.countDocuments();

    console.log(`Bookings: ${totalSeatBookings + totalParkingBookings}, Notifications: ${notificationCount}`);
    // await deleteAllNotificationsInDatabase(); // Only for testing Sjay
    // initializeNotificationSystem();
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
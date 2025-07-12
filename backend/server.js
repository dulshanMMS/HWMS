import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import bookingRoutes from "./routes/seatBookings.js";
import teamRoutes from "./routes/teamRoutes.js";
import authRoutes from './routes/auth.js';

import parkingRoutes from "./routes/parkingRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { initializeNotificationSystem } from './services/notificationService.js';

import ParkingSlot from './models/ParkingSlots.js';
import SeatingSlot from './models/SeatingSlots.js';
import Notification from "./models/Notification.js";

import parkinghistoryRoutes from "./routes/parkinghistoryRoutes.js";
import parkingAdminRoutes from "./routes/parkingAdminRoutes.js";
import eventRoutes from './routes/events.js';
import userRoutes from "./routes/user.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import bookingViewRoutes from './routes/bookingViewRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// FIXED: Proper CORS configuration for Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"], // Multiple origins
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Export io so other files can use it
export { io };

// FIXED: Proper CORS for Express with multiple origins
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/history", parkinghistoryRoutes);
app.use("/api/admin/parking", parkingAdminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/user", userRoutes);
app.use("/api/calendar", calendarRoutes);
app.use('/api/calendar', bookingViewRoutes);
app.use('/api', teamRoutes);

// Test Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Connection successful!", timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development'
  };
  res.json(health);
});

// FIXED: Single MongoDB connection with proper error handling
const connectDB = async () => {
  let retries = 3;
  let retryDelay = 2000;

  while (retries > 0) {
    try {
      console.log(`🔄 MongoDB connection attempt ${4 - retries}...`);
      
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,
        maxPoolSize: 10,
        minPoolSize: 2,
      });
      
      console.log("✅ MongoDB connected successfully");
      
      // Set up connection event listeners
      mongoose.connection.on('error', (err) => {
        console.error("❌ MongoDB connection error:", err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log("⚠️ MongoDB disconnected");
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log("🔄 MongoDB reconnected");
      });

      // MOVED: Initialize notification system and compute bookings here
      await initializeApp();
      
      return; // Success, exit the retry loop
      
    } catch (err) {
      retries--;
      console.error(`❌ MongoDB connection attempt ${4 - retries} failed:`, err.message);
      
      if (retries === 0) {
        console.error("💥 All MongoDB connection attempts failed. Exiting...");
        process.exit(1);
      }
      
      console.log(`⏳ Retrying MongoDB connection in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      retryDelay *= 2;
    }
  }
};

// FIXED: Initialize app services after DB connection
const initializeApp = async () => {
  try {
    // Compute total bookings from SeatingSlot and ParkingSlot
    const seatingSlots = await SeatingSlot.find();
    const parkingSlots = await ParkingSlot.find();

    const totalSeatBookings = seatingSlots.reduce((sum, slot) => sum + slot.bookings.length, 0);
    const totalParkingBookings = parkingSlots.reduce((sum, slot) => sum + slot.bookings.length, 0);
    const notificationCount = await Notification.countDocuments();

    console.log(`📊 Bookings: ${totalSeatBookings + totalParkingBookings}, Notifications: ${notificationCount}`);

    // Initialize notification system
    initializeNotificationSystem();
  } catch (error) {
    console.error("❌ Error initializing app:", error);
  }
};

// FIXED: Single Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  // Handle new notifications
  socket.on("newNotification", async (notification) => {
    try {
      const newNotification = new Notification(notification);
      await newNotification.save();
      io.emit("notificationReceived", newNotification);
      console.log("📬 New notification created and broadcasted");
    } catch (error) {
      console.error("❌ Error creating notification:", error);
      socket.emit("notificationError", { error: "Failed to create notification" });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Graceful shutdown...`);
  try {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed.');
    server.close(() => {
      console.log('🔌 HTTP server closed.');
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// FIXED: Start server after DB connection
const startServer = async () => {
  try {
    // Initialize database connection first
    await connectDB();
    
    // Start the server
    const PORT = process.env.PORT || 5004;
    server.listen(PORT, (err) => {
      if (err) {
        console.error(`❌ Failed to start server on port ${PORT}:`, err.message);
        process.exit(1);
      }
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔌 Socket.IO enabled with CORS for localhost:5173`);
    });
    
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the application
startServer();
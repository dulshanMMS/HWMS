import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import bookingRoutes from "./routes/seatBookings.js";
import parkingRoutes from './routes/parkingRoutes.js';
import teamRoutes from "./routes/teamRoutes.js";
import authRoutes from './routes/auth.js';

// Comment out missing imports - uncomment these as you create the files
// import reportRoutes from './routes/reports.js';
// import parkinghistoryRoutes from './routes/parkingHistory.js';
// import parkingAdminRoutes from './routes/parkingAdmin.js';
// import notificationRoutes from './routes/notifications.js';
// import eventRoutes from './routes/events.js';
// import userRoutes from './routes/user.js';
// import calendarRoutes from './routes/calendar.js';
// import bookingViewRoutes from './routes/bookingView.js';

dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Specific origin instead of "*"
    methods: ["GET", "POST"],
    credentials: true // Allow credentials
  }
});

// Export io so other files can use it
export { io };

app.use(cors());
app.use(express.json());

// Routes - only include existing routes, comment out missing ones
app.use("/api/auth", authRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use('/api', teamRoutes);

// Comment out these routes until you create the corresponding files
// app.use("/api/reports", reportRoutes);
// app.use("/api/history", parkinghistoryRoutes);
// app.use("/api/admin/parking", parkingAdminRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/events", eventRoutes);
// app.use("/api/user", userRoutes);
// app.use("/api/calendar", calendarRoutes);
// app.use('/api/calendar', bookingViewRoutes);

// Test Routes - removed duplicate res.send()
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Connection successful!", timestamp: new Date().toISOString() });
});

// MongoDB connection with proper error handling and retry logic
const connectDB = async () => {
  let retries = 3;
  let retryDelay = 2000; // Start with 2 seconds

  while (retries > 0) {
    try {
      console.log(`🔄 MongoDB connection attempt ${4 - retries}...`);
      
      // Clean connection options - removed unsupported options
      await mongoose.connect(process.env.MONGO_URI, {
        // Modern connection options that are actually supported
        serverSelectionTimeoutMS: 10000, // 10 seconds
        socketTimeoutMS: 45000, // 45 seconds
        family: 4, // Use IPv4, skip trying IPv6
        maxPoolSize: 10, // Maintain up to 10 socket connections
        minPoolSize: 2, // Maintain a minimum of 2 socket connections
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
      retryDelay *= 2; // Exponential backoff
    }
  }
};

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

// Initialize database connection
connectDB();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
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
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  try {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
  try {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

// Start the server - use server.listen instead of app.listen
const PORT = process.env.PORT || 5004;
server.listen(PORT, (err) => {
  if (err) {
    console.error(`❌ Failed to start server on port ${PORT}:`, err.message);
    process.exit(1);
  }
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
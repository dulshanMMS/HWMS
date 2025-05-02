import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

// Route Imports
import parkingRoutes from "./routes/parkingRoutes.js";
import authRoutes from "./routes/auth.js";
import bookingRoutes from './routes/bookingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import eventRoutes from './routes/events.js'; 

// Initialize App
dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: "*" }
});

// Middleware
app.use(express.json());
app.use(cors());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/parking", parkingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/bookings/events', eventRoutes); // ✅ Mount the event routes here

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// WebSocket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

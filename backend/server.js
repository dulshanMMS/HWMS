import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import parkingRoutes from "./routes/parkingRoutes.js";
import authRoutes from "./routes/auth.js";

// Initialize App
dotenv.config(); // Load .env variables


const app = express();
// Middleware
app.use(express.json());
app.use(cors());     // Allow frontend to access API

const server = http.createServer(app); // Create HTTP server
export const io = new Server(server, { cors: { origin: "*" } }); // Enable WebSocket

// Routes
app.use("/api/auth", authRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log(" MongoDB Connected"))
  .catch(err => console.log(" MongoDB Connection Error:", err));

io.on("connection", (socket) => {
    console.log(" User connected:", socket.id);
});
   
app.use("/api/parking", parkingRoutes); // Use API routes

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));

 
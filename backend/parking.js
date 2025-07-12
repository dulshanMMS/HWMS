import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import parkingRoutes from "./routes/parkingRoutes.js";

dotenv.config(); // Load .env variables

const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend to access API

const server = http.createServer(app); // Create HTTP server
export const io = new Server(server, { cors: { origin: "*" } }); // Enable WebSocket

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log(" MongoDB Connected"))
  .catch(err => console.log(" MongoDB Connection Error:", err));

io.on("connection", (socket) => {
    console.log("🔗 User connected:", socket.id);
});

app.use("/api", parkingRoutes); // Use API routes

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));


import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bookingRoutes from "./routes/seatBookings.js";  // Import booking routes
import teamRoutes from "./routes/teamRoutes.js";  // Import team routes

dotenv.config();  // Load environment variables

const app = express();
app.use(cors());  // Enable CORS to allow requests from different origins
app.use(express.json());  // Parse incoming JSON requests

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);  // Mongo URI stored in .env file
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);  // Exit the application if connection fails
  }
};

connectDB();  // Establish MongoDB connection

// Use the booking and team routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/teams", teamRoutes);  // Add this line to handle team-related requests

// Start the server on the specified port
const PORT = process.env.PORT || 5004; // Changed default to 5004 to match API calls
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

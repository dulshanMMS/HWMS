import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

// Initialize App
dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);

// Test Route to Check Server Status
app.get("/", (req, res) => {
    res.send("API is running...");
});

// MongoDB Connection
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error("MongoDB connection error:", err));
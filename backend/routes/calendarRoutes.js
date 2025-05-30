import express from "express";
import { getAllEvents, getUserBookings } from "../controllers/calendarController.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

// Route to get all public holidays and events
// No authentication required - publicly accessible
router.get("/events", getAllEvents);

// Route to get bookings for the logged-in user
// Requires valid JWT token (authentication)
router.get("/bookings", verifyToken, getUserBookings);

export default router;

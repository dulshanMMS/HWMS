import express from "express";
import { getAllEvents, getUserBookings } from "../controllers/calendarController.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

// Public holidays/events
router.get("/events", getAllEvents);

// Authenticated user’s bookings
router.get("/bookings", verifyToken, getUserBookings);

export default router;

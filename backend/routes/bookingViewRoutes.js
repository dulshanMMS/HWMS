import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import {
  getRecentUserBookings,
  getUserBookingsByDate,
  getUserBookingsView
} from "../controllers/bookingViewController.js";

const router = express.Router();

// ✅ Route for calendar view: fetch all bookings for visible month
router.get("/user-view", verifyToken, getUserBookingsView);

// 🗓️ Route for calendar view: fetch bookings for a given date (optional usage)
router.get("/calendar/:date", verifyToken, getUserBookingsByDate);

// 📌 Route for dashboard cards: fetch recent bookings
router.get("/recent", verifyToken, getRecentUserBookings);

export default router;
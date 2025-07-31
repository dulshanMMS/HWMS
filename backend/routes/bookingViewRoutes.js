import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import {
  getRecentUserBookings,
  getUserBookingsByDate,
  getUserBookingsView,
  getRecentParkingBookings,
  getUserBookingStats,        // NEW
  getTodayUserBookingStats,   // NEW
  getTodayBookingsPaginated,
  getRecentBookingsPaginated
} from "../controllers/bookingViewController.js";

const router = express.Router();

// Fetch all bookings for calendar view of the logged-in user
// Protected route requiring authentication
router.get("/user-view", verifyToken, getUserBookingsView);

// Fetch bookings for a specific date (used by calendar UI)
// Protected route
router.get("/calendar/:date", verifyToken, getUserBookingsByDate);

// Fetch recent bookings for dashboard summary (seat + parking)
// Protected route
router.get("/recent", verifyToken, getRecentUserBookings);

// Fetch recent parking bookings only, limited to 3 results
// Protected route
router.get("/parking-recent", verifyToken, getRecentParkingBookings);

// NEW: Get separated booking statistics for the logged-in user
// Protected route
router.get("/stats", verifyToken, getUserBookingStats);

// NEW: Get today's booking statistics for the logged-in user
// Protected route
router.get("/stats/today", verifyToken, getTodayUserBookingStats);

// Get today's bookings with pagination
router.get("/bookings/today", verifyToken, getTodayBookingsPaginated);

// Get recent past bookings with pagination
router.get("/bookings/recent", verifyToken, getRecentBookingsPaginated);



export default router;
import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import {
  getRecentUserBookings,
  getUserBookingsByDate,
  getUserBookingsView,
  getRecentParkingBookings, 
} from "../controllers/bookingViewController.js";

const router = express.Router();

// Calendar view (all bookings for current user)
router.get("/user-view", verifyToken, getUserBookingsView);

//Bookings for a specific date (optional, used by calendar)
router.get("/calendar/:date", verifyToken, getUserBookingsByDate);

// Dashboard summary bookings
router.get("/recent", verifyToken, getRecentUserBookings);

// ast 3 parking bookings only
router.get("/parking-recent", verifyToken, getRecentParkingBookings); // 

router.get("/recent-parking", verifyToken, getRecentParkingBookings);

export default router;

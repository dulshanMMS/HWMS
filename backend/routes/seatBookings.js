// routes/seatBookings.js - Updated for member-wise bookings
import express from "express";

import {
  getUserByUsername,
  getTeamMembers,
  getFilteredBookingsController,
  getAllBookingsController,
  getAllBookingsForDate, // ✅ included here only once
  bookSeatForMember,
  bookSeatForTeamMember,
  unbookSeat,
  getMemberStats
} from "../controllers/seatBookingController.js";

import {
  sanitizeSeatBookingInput,
  validateRequiredParams,
  validateQueryParams,
  logSeatBookingOperation,
  handleSeatBookingErrors
} from "../middleware/seatBookingMiddleware.js";

const router = express.Router();

// ==================== User Routes ====================
router.get("/users/:username", 
  validateRequiredParams(['username']),
  getUserByUsername
);

router.get("/users/team/:teamId", 
  validateRequiredParams(['teamId']),
  getTeamMembers
);

// ==================== Booking Display Routes ====================
router.get("/filtered", 
  validateQueryParams(['date', 'floor']),
  getFilteredBookingsController
);

router.get("/all-bookings", 
  validateQueryParams(['date', 'floor']), 
  getAllBookingsForDate // ✅ now wired up
);

router.get("/", getAllBookingsController);

// ==================== Member Statistics Route ====================
router.get("/stats/:userName", 
  validateRequiredParams(['userName']),
  getMemberStats
);

// ==================== Seat Booking Routes ====================
router.post("/member/:userName/seat/:seatId",
  validateRequiredParams(['userName', 'seatId']),
  sanitizeSeatBookingInput,
  logSeatBookingOperation('member_booking'),
  bookSeatForMember
);

router.post("/leader/:userName/member/:teamMemberName/seat/:seatId",
  validateRequiredParams(['userName', 'teamMemberName', 'seatId']),
  sanitizeSeatBookingInput,
  logSeatBookingOperation('leader_booking'),
  bookSeatForTeamMember
);

// ==================== Seat Unbooking Route ====================
router.delete("/unbook/:roomId/:seatId/:floor/:date",
  validateRequiredParams(['roomId', 'seatId', 'floor', 'date']),
  logSeatBookingOperation('unbooking'),
  unbookSeat
);

// ==================== Error Handler ====================
router.use(handleSeatBookingErrors);

export default router;

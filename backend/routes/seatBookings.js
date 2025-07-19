// routes/seatBookings.js - Self-booking routes only
import express from "express";

import {
  getUserByUsername,
  getTeamMembers,
  getFilteredBookingsController,
  getAllBookingsController,
  getAllBookingsForDate,
  bookSeatForMember, // Only self-booking
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
  getAllBookingsForDate
);

router.get("/", getAllBookingsController);

// ==================== Member Statistics Route ====================
router.get("/stats/:userName", 
  validateRequiredParams(['userName']),
  getMemberStats
);

// ==================== Self-Booking Route Only ====================
// MODIFIED: Only allow users to book for themselves
router.post("/member/:userName/seat/:seatId",
  validateRequiredParams(['userName', 'seatId']),
  sanitizeSeatBookingInput,
  logSeatBookingOperation('self_booking'),
  bookSeatForMember
);

// REMOVED: Leader booking route - no longer needed
// router.post("/leader/:userName/member/:teamMemberName/seat/:seatId", ...)

// ==================== Seat Unbooking Route ====================
router.delete("/unbook/:roomId/:seatId/:floor/:date",
  validateRequiredParams(['roomId', 'seatId', 'floor', 'date']),
  logSeatBookingOperation('unbooking'),
  unbookSeat
);

// ==================== Error Handler ====================
router.use(handleSeatBookingErrors);

export default router;
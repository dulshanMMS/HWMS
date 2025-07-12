// routes/seatBookings.js - Updated for member-wise bookings
import express from "express";
import {
  getUserByUsername,
  getTeamMembers,
  getFilteredBookingsController,
  getAllBookingsController,
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

// User routes
router.get("/users/:username", 
  validateRequiredParams(['username']),
  getUserByUsername
);

router.get("/users/team/:teamId", 
  validateRequiredParams(['teamId']),
  getTeamMembers
);

// Booking display routes
router.get("/filtered", 
  validateQueryParams(['date', 'floor']),
  getFilteredBookingsController
);

router.get("/", getAllBookingsController);

// Member statistics route
router.get("/stats/:userName", 
  validateRequiredParams(['userName']),
  getMemberStats
);

// Seat booking routes - member-wise approach
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

// Seat unbooking route
router.delete("/unbook/:roomId/:seatId/:floor/:date",
  validateRequiredParams(['roomId', 'seatId', 'floor', 'date']),
  logSeatBookingOperation('unbooking'),
  unbookSeat
);

// Apply error handling middleware to all routes
router.use(handleSeatBookingErrors);

export default router;
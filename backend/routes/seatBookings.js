// routes/seatBookings.js - Complete file with conflict check functionality
import express from "express";

// Regular booking controllers
import {
  getUserByUsername,
  getTeamMembers,
  getFilteredBookingsController,
  getAllBookingsController,
  getAllBookingsForDate,
  bookSeatForMember,
  unbookSeat,
  getMemberStats
} from "../controllers/seatBookingController.js";

// Admin controllers
import {
  bookSeatForAdmin,
  unbookSeatForAdmin,
  fixDatabaseSchema,
  getTodayBookingCount,
  getTeamBookingCount,
  getFloorBookingCount
} from "../controllers/adminBookingController.js";

// NEW: Conflict check controller
import {
  checkUserBookingConflict
} from "../controllers/conflictCheckController.js";

// Middleware
import {
  sanitizeSeatBookingInput,
  validateRequiredParams,
  validateQueryParams,
  logSeatBookingOperation,
  handleSeatBookingErrors,
  validateConflictCheckParams
} from "../middleware/seatBookingMiddleware.js";

const router = express.Router();

// ==================== DATABASE FIX ROUTE ====================
router.get("/admin/fix-username-only", fixDatabaseSchema);

// ==================== USER ROUTES ====================
router.get("/users/:username", 
  validateRequiredParams(['username']),
  getUserByUsername
);

router.get("/users/team/:teamId", 
  validateRequiredParams(['teamId']),
  getTeamMembers
);

// ==================== NEW: CONFLICT CHECK ROUTE ====================
router.post("/check-user-conflict", 
  validateConflictCheckParams,
  checkUserBookingConflict
);

// ==================== BOOKING DISPLAY ROUTES ====================
router.get("/filtered", 
  validateQueryParams(['date', 'floor']),
  getFilteredBookingsController
);

router.get("/all-bookings", 
  validateQueryParams(['date', 'floor']), 
  getAllBookingsForDate
);

router.get("/", getAllBookingsController);

// ==================== ADMIN DASHBOARD ROUTES ====================
router.get('/count/today', getTodayBookingCount);
router.get('/count-by-team/today', getTeamBookingCount);
router.get('/count-by-floor', getFloorBookingCount);

// ==================== STATISTICS ROUTES ====================
router.get("/stats/:userName", 
  validateRequiredParams(['userName']),
  getMemberStats
);

// ==================== ADMIN BOOKING ROUTES ====================
router.post("/admin/:userName/seat/:seatId",
  validateRequiredParams(['userName', 'seatId']),
  sanitizeSeatBookingInput,
  logSeatBookingOperation('admin_booking'),
  bookSeatForAdmin
);

router.delete("/admin/unbook/:roomId/:seatId/:floor/:date",
  validateRequiredParams(['roomId', 'seatId', 'floor', 'date']),
  logSeatBookingOperation('admin_unbooking'),
  unbookSeatForAdmin
);

// ==================== USER BOOKING ROUTES ====================
router.post("/member/:userName/seat/:seatId",
  validateRequiredParams(['userName', 'seatId']),
  sanitizeSeatBookingInput,
  logSeatBookingOperation('self_booking'),
  bookSeatForMember
);

router.delete("/unbook/:roomId/:seatId/:floor/:date",
  validateRequiredParams(['roomId', 'seatId', 'floor', 'date']),
  logSeatBookingOperation('unbooking'),
  unbookSeat
);

// ==================== ERROR HANDLER ====================
router.use(handleSeatBookingErrors);

export default router;
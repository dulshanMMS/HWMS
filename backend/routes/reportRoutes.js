import express from 'express';
import ParkingSlot from '../models/ParkingSlots.js';
import SeatingSlot from '../models/SeatingSlots.js';
import { teamLookup, userLookup, analytics, userBookings, recentBookings, floorUsage, allBookings, getTeamStats } from '../controllers/reportController.js';


const router = express.Router();

// Admin: Lookup users by team and their bookings
router.get('/team-lookup', teamLookup);

// Admin: Lookup user info and booking counts
router.get('/user-lookup', userLookup);

// Analytics route
router.get('/analytics', analytics);

// Get user bookings
router.get('/user-bookings/:userId', userBookings);

// Recent bookings endpoint
router.get('/recent', recentBookings);

// Floor usage endpoint
router.get('/floor-usage', floorUsage);

// Get all bookings (admin only)
router.get('/all-bookings', allBookings);

// Team stats for a given team name

router.get('/team-stats', getTeamStats);


export default router;
import express from 'express';
import {
  getTodayBookingCount,
  getBookingsByDate,
  getTeamBookingsToday,
  getFloorBookingCount,
} from '../controllers/bookingController.js';

const router = express.Router();

router.get('/count/today', getTodayBookingCount);
router.get('/events/:date', getBookingsByDate);
router.get('/count-by-team/today', getTeamBookingsToday);
router.get('/count-by-floor', getFloorBookingCount);

export default router;

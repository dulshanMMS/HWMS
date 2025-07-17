import express from 'express';
import {
  getAdminOwnNotifications,
  getUserOwnNotifications,
  getUnreadNotificationCount,
  getAdminUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  
  sendBulkNotification,
  
  createBookingNotification,
  createCancellationNotification,
  
  updateNotificationPreferences,
  getNotificationPreferences,
} from '../controllers/notificationController.js';

import { verifyToken, authenticateUser, isAdmin } from '../middleware/authMiddleware.js';
const router = express.Router();

// User routes

router.get('/user/own', verifyToken, getUserOwnNotifications);
router.get('/unread-count', verifyToken, getUnreadNotificationCount);
router.put('/:id/mark-read', verifyToken, markAsRead);
router.put('/mark-all-read', verifyToken, markAllAsRead);
router.delete('/:id', verifyToken, deleteNotification);

// Admin routes

// router.get('/admin/unread-count', verifyToken, getAdminUnreadCount);
// router.get('/admin/own', verifyToken, getAdminOwnNotifications);
router.get('/admin/unread-count', verifyToken, isAdmin, getAdminUnreadCount);
router.get('/admin/own', verifyToken, isAdmin, getAdminOwnNotifications);

router.post('/send-bulk', verifyToken, sendBulkNotification);

// Booking notification routes
router.post('/booking', verifyToken, createBookingNotification);
router.post('/cancellation', verifyToken, createCancellationNotification);



// Notification preferences routes - using authenticateUser for better user validation
router.get('/preferences', authenticateUser, getNotificationPreferences);
router.put('/preferences', authenticateUser, updateNotificationPreferences);

export default router;
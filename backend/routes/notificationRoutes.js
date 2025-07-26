import express from 'express';
import {
  getAdminOwnNotifications,
  getUserOwnNotifications,
  getUnreadNotificationCount,
  getAdminUnreadCount,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  markAllAsUnread,
  deleteNotification,
  deleteAllNotifications,
  sendBulkNotification,
  createBookingNotification,
  createCancellationNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../controllers/notificationController.js';
import { verifyToken, authenticateUser, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User routes
router.get('/user/own', verifyToken, getUserOwnNotifications);
router.get('/unread-count', verifyToken, getUnreadNotificationCount);
router.put('/:id([0-9a-fA-F]{24})/mark-read', verifyToken, markAsRead);
router.put('/:id([0-9a-fA-F]{24})/mark-unread', verifyToken, markAsUnread);
router.put('/mark-all-read', verifyToken, markAllAsRead);
router.put('/mark-all-unread', verifyToken, markAllAsUnread);
router.delete('/delete-all', verifyToken, deleteAllNotifications); // Moved before /:id
router.delete('/:id([0-9a-fA-F]{24})', verifyToken, deleteNotification); // Restrict to ObjectId

// Admin routes
router.get('/admin/unread-count', verifyToken, isAdmin, getAdminUnreadCount);
router.get('/admin/own', verifyToken, isAdmin, getAdminOwnNotifications);
router.post('/send-bulk', verifyToken, isAdmin, sendBulkNotification);

// Booking notifications
router.post('/booking', verifyToken, createBookingNotification);
router.post('/cancellation', verifyToken, createCancellationNotification);

// Notification preferences
router.get('/preferences', authenticateUser, getNotificationPreferences);
router.put('/preferences', authenticateUser, updateNotificationPreferences);

export default router;
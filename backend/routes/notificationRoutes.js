import express from 'express';
import auth from './auth.js';
import {
  getAllNotifications,
  getAdminNotifications,
  getUnreadNotificationCount,
  getAdminUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
  sendNotification,
  sendBulkNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// Authenticated routes
router.use(auth);

// User routes
router.get('/user', getAllNotifications);
router.get('/unread-count', getUnreadNotificationCount);
router.put('/:id/mark-read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

// Admin routes
router.get('/admin', getAdminNotifications);
router.get('/admin/unread-count', getAdminUnreadCount);
router.post('/send', sendNotification);
router.post('/send-bulk', sendBulkNotification);

export default router;
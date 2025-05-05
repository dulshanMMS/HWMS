import express from 'express';
import auth from './auth.js';
import {
  getAllNotifications,
  getUnreadNotificationCount,
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

router.get('/user', getAllNotifications);
router.get('/unread-count', getUnreadNotificationCount);
router.put('/:id/mark-read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

// Admin routes
router.post('/send', sendNotification);
router.post('/send-bulk', sendBulkNotification);

export default router;
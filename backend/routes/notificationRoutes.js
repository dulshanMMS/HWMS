import express from 'express';
import {
  getAllNotifications,
  getAdminNotifications,
  getUnreadNotificationCount,
  getAdminUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendNotification,
  sendBulkNotification,
  getNotifications,
  createBookingNotification,
  createCancellationNotification,
  getAdminOwnNotifications
} from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getNotificationPreferences, updateNotificationPreferences } from '../services/notificationService.js';
import { authenticateUser } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// User routes
router.get('/user', verifyToken, getAllNotifications);
router.get('/unread-count', verifyToken, getUnreadNotificationCount);
router.put('/:id/mark-read', verifyToken, markAsRead);
router.put('/mark-all-read', verifyToken, markAllAsRead);
router.delete('/:id', verifyToken, deleteNotification);

// Admin routes
router.get('/admin', verifyToken, getAdminNotifications);
router.get('/admin/unread-count', verifyToken, getAdminUnreadCount);
router.get('/admin/own', verifyToken, getAdminOwnNotifications);
router.post('/send', verifyToken, sendNotification);
router.post('/send-bulk', verifyToken, sendBulkNotification);

// Booking notification routes
router.post('/booking', verifyToken, createBookingNotification);
router.post('/cancellation', verifyToken, createCancellationNotification);

// General routes
router.get('/', verifyToken, getNotifications);

// Notification preferences routes
router.get('/preferences', verifyToken, async (req, res) => {
  try {
    const preferences = await getNotificationPreferences(req.user.id);
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get notification preferences' });
  }
});

router.put('/preferences', verifyToken, async (req, res) => {
  try {
    const updatedPreferences = await updateNotificationPreferences(req.user.id, req.body.preferences);
    res.json(updatedPreferences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

export default router;
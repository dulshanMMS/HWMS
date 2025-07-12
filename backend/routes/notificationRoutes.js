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
  sendNotification,
  sendBulkNotification,
  getNotifications
} from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getNotificationPreferences, updateNotificationPreferences } from '../services/notificationService.js';
import { authenticateUser } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Authenticated routes
router.use(auth);

// User routes
router.get('/user', getAllNotifications);
router.get('/unread-count', getUnreadNotificationCount);
router.put('/:id/mark-read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:id', verifyToken, deleteNotification);


// Admin routes
router.get('/admin', getAdminNotifications);
router.get('/admin/unread-count', getAdminUnreadCount);
router.post('/send', sendNotification);
router.post('/send-bulk', authenticateUser, sendBulkNotification);

// Route to get all notifications
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
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get all notifications
router.get('/', notificationController.getAllNotifications);

// Get unread notifications
router.get('/unread', notificationController.getUnreadNotifications);

// Mark notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

// Create new notification (admin only)
router.post('/', notificationController.createNotification);

module.exports = router; 
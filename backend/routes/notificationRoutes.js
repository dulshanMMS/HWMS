const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const NotificationService = require('../services/notificationService');
const auth = require('../middleware/auth');

// Get all notifications for a user
router.get('/user', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      recipient: req.user.id,
      deleted: false 
    })
    .sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a notification as read
router.put('/:id/mark-read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if the notification belongs to the user
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a notification (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if the notification belongs to the user
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.deleted = true;
    await notification.save();

    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread notification count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      read: false,
      deleted: false
    });
    
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { 
        recipient: req.user.id,
        read: false,
        deleted: false
      },
      { read: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user notification preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const preferences = await NotificationService.getNotificationPreferences(req.user.id);
    res.json(preferences);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user notification preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const preferences = await NotificationService.updateNotificationPreferences(
      req.user.id,
      req.body.preferences
    );
    res.json(preferences);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a notification (admin only)
router.post('/send', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { recipient, title, message, type, emailSubject } = req.body;
    const notification = await NotificationService.sendNotification({
      recipient,
      title,
      message,
      type,
      emailSubject
    });

    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send bulk notifications (admin only)
router.post('/send-bulk', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { recipients, title, message, type, emailSubject } = req.body;
    const notifications = await NotificationService.sendBulkNotifications({
      recipients,
      title,
      message,
      type,
      emailSubject
    });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
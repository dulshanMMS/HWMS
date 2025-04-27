import express from 'express';
import Notification from '../models/Notification.js';
import NotificationService from '../services/notificationService.js';
import verifyToken, { isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all notifications for a user
router.get('/user', verifyToken, async (req, res) => {
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
router.put('/:id/mark-read', verifyToken, async (req, res) => {
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
router.delete('/:id', verifyToken, async (req, res) => {
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
router.get('/unread-count', verifyToken, async (req, res) => {
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
router.put('/mark-all-read', verifyToken, async (req, res) => {
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
router.get('/preferences', verifyToken, async (req, res) => {
  try {
    const preferences = await NotificationService.getNotificationPreferences(req.user.id);
    res.json(preferences);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user notification preferences
router.put('/preferences', verifyToken, async (req, res) => {
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
router.post('/send', verifyToken, isAdmin, async (req, res) => {
  try {
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
router.post('/send-bulk', verifyToken, isAdmin, async (req, res) => {
  try {
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

// Get all notifications (admin route)
router.get('/admin/all', verifyToken, isAdmin, async (req, res) => {
  try {
    console.log('Fetching all notifications');
    const notifications = await Notification.find({ deleted: false })
      .sort({ createdAt: -1 });
    
    console.log('Found notifications:', notifications);
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
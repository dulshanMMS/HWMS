import Notification from '../models/Notification.js';
import * as NotificationService from '../services/notificationService.js';

// Get all notifications for a user
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id,
      deleted: false,
    })
    .sort({ createdAt: -1 })
    .populate('bookingId', 'type details date');

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// Get admin notifications (all notifications)
export const getAdminNotifications = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const notifications = await Notification.find({
      type: 'important',
      deleted: false,
    })
    .sort({ createdAt: -1 })
    .populate('recipient', 'firstName lastName email')
    .populate('bookingId', 'type details date');

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin notifications', error: error.message });
  }
};

// Get unread notifications count
export const getUnreadNotificationCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      read: false,
      deleted: false,
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unread count', error: error.message });
  }
};

// Get admin unread notifications count
export const getAdminUnreadCount = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const count = await Notification.countDocuments({
      type: 'important',
      read: false,
      deleted: false,
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin unread count', error: error.message });
  }
};

// Mark a single notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (notification.recipient.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error marking as read', error: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false, deleted: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking all as read', error: error.message });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (notification.recipient.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    notification.deleted = true;
    await notification.save();

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
};

//create notification
export const createNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const notification = new Notification({
      title,
      message,
      type: type || 'info'
    });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error creating notification', error: error.message });
  }
};

// Get preferences
export const getPreferences = async (req, res) => {
  try {
    const preferences = await NotificationService.getNotificationPreferences(req.user.id);
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching preferences', error: error.message });
  }
};

// Update preferences
export const updatePreferences = async (req, res) => {
  try {
    const preferences = await NotificationService.updateNotificationPreferences(
      req.user.id,
      req.body.preferences
    );
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ message: 'Error updating preferences', error: error.message });
  }
};

// Send a notification (admin only)
export const sendNotification = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Not authorized' });

    const { recipient, title, message, type, emailSubject } = req.body;
    const notification = await NotificationService.sendNotification({
      recipient,
      title,
      message,
      type,
      emailSubject,
    });

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error sending notification', error: error.message });
  }
};

// Send bulk notifications (admin only)
export const sendBulkNotification = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Not authorized' });

    const { recipients, title, message, type, emailSubject } = req.body;

    const notifications = await NotificationService.sendBulkNotifications({
      recipients,
      title,
      message,
      type,
      emailSubject,
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error sending bulk notifications', error: error.message });
  }
};



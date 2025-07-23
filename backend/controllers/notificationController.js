

import * as NotificationService from '../services/notificationService.js';
import {
  getNotificationPreferences as getPreferencesService,
  updateNotificationPreferences as updatePreferencesService,
} from '../services/notificationService.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

export const getUserOwnNotifications = async (req, res) => {
  try {
    console.log('req.user:', req.user);
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated', user: req.user });
    }
    const { page = 1, limit = 10, filter = 'all' } = req.query;
    const userId = req.user.id;
    console.log(`Fetching notifications for userId: ${userId}`);
    const notifications = await NotificationService.getNotifications(page, limit, userId, filter);
    res.json(notifications);
  } catch (error) {
    console.error('Error in getUserOwnNotifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAdminOwnNotifications = async (req, res) => {
  try {
    console.log('req.user:', req.user);
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated', user: req.user });
    }
    const user = await User.findById(req.user.id).select('role');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    const { page = 1, limit = 10, filter = 'all' } = req.query;
    const userId = req.user.id;
    console.log(`Fetching admin notifications for userId: ${userId}`);
    const notifications = await NotificationService.getNotifications(page, limit, userId, filter);
    res.json(notifications);
  } catch (error) {
    console.error('Error in getAdminOwnNotifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await NotificationService.getUnreadNotificationCount(userId);
    res.json({ count });
  } catch (error) {
    console.error('Error in getUnreadNotificationCount:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAdminUnreadCount = async (req, res) => {
  try {
    const count = await NotificationService.getAdminUnreadCount();
    res.json({ count });
  } catch (error) {
    console.error('Error in getAdminUnreadCount:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const notification = await NotificationService.markAsRead(id, userId);
    res.json(notification);
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(400).json({ message: error.message });
  }
};

export const markAsUnread = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const notification = await NotificationService.markAsUnread(id, userId);
    res.json(notification);
  } catch (error) {
    console.error('Error in markAsUnread:', error);
    res.status(400).json({ message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await NotificationService.markAllAsRead(userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const markAllAsUnread = async (req, res) => {
  try {
    const userId = req.user.id;
    await NotificationService.markAllAsUnread(userId);
    res.json({ message: 'All notifications marked as unread' });
  } catch (error) {
    console.error('Error in markAllAsUnread:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const notification = await NotificationService.deleteNotification(id, userId);
    res.json(notification);
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    await NotificationService.deleteAllNotifications(userId);
    res.json({ message: 'All notifications deleted' });
  } catch (error) {
    console.error('Error in deleteAllNotifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add or update in notificationController.js
  

 

export const sendBulkNotification = async (req, res) => {
  try {
    const { recipients, title, message, type, emailSubject } = req.body;
    const notifications = await NotificationService.sendBulkNotifications({ recipients, title, message, type, emailSubject });
    res.json(notifications);
  } catch (error) {
    console.error('Error in sendBulkNotification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createBookingNotification = async (req, res) => {
  try {
    const { type, bookingRecord, latestBooking } = req.body;
    const bookingId = `${bookingRecord._id}-${latestBooking.date}-${latestBooking.entryTime}-${latestBooking.userName}`;
    const existingNotification = await Notification.findOne({
      bookingId,
      type: `${type}_booking`,
    });
    if (existingNotification) {
      return res.status(200).json({ message: 'Notification already exists', notification: existingNotification });
    }
    const notification = await NotificationService.createBookingNotifications(type, bookingRecord, latestBooking);
    res.json(notification);
  } catch (error) {
    console.error('Error in createBookingNotification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createCancellationNotification = async (req, res) => {
  try {
    const { slotId, userName, date, entryTime, type } = req.body;
    console.log(`Received cancellation request: slotId=${slotId}, userName=${userName}, date=${date}, entryTime=${entryTime}, type=${type}`);
    const notification = await NotificationService.triggerCancellationNotification({
      slotId,
      userName,
      date,
      entryTime,
      type
    });
    res.json(notification);
  } catch (error) {
    console.error('Error in createCancellationNotification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = await getPreferencesService(userId);
    console.log(`Fetched preferences for user ${userId}: ${JSON.stringify(preferences)}`);
    res.json(preferences);
  } catch (error) {
    console.error('Error in getNotificationPreferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;
    console.log(`Updating preferences for user ${userId}: ${JSON.stringify(preferences)}`);
    // Validate preferences
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ message: 'Invalid preferences format' });
    }
    const updatedPreferences = await updatePreferencesService(userId, {
      ...preferences,
      bookingReminder: { ...preferences.bookingReminder, inApp: true }
    });
    console.log(`Updated preferences for user ${userId}: ${JSON.stringify(updatedPreferences)}`);
    res.json(updatedPreferences);
  } catch (error) {
    console.error('Error in updateNotificationPreferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const triggerBookingReminderEmails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('role');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    await NotificationService.sendBookingReminderEmails();
    res.json({ message: 'Booking reminder emails triggered successfully' });
  } catch (error) {
    console.error('Error in triggerBookingReminderEmails:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
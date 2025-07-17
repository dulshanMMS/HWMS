
import * as NotificationService from '../services/notificationService.js';
import { 
  getNotificationPreferences as getPreferencesService,
  updateNotificationPreferences as updatePreferencesService 
} from '../services/notificationService.js';

export const getUserOwnNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;
    const notifications = await NotificationService.getNotifications(page, limit, userId);
    res.json(notifications);
  } catch (error) {
    console.error('Error in getUserOwnNotifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAdminOwnNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;
    const notifications = await NotificationService.getNotifications(page, limit, userId);
    res.json(notifications);
  } catch (error) {
    console.error('Error in getAdminOwnNotifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user._id;
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
    const userId = req.user._id;
    const notification = await NotificationService.markAsRead(id, userId);
    res.json(notification);
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(400).json({ message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await NotificationService.markAllAsRead(userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const notification = await NotificationService.deleteNotification(id, userId);
    res.json(notification);
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    res.status(400).json({ message: error.message });
  }
};

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
    const notification = await NotificationService.createBookingNotifications(type, bookingRecord, latestBooking);
    res.json(notification);
  } catch (error) {
    console.error('Error in createBookingNotification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createCancellationNotification = async (req, res) => {
  try {
    const { userId, slotNumber, floor, type, date, bookingId } = req.body;
    const notification = await NotificationService.createCancellationNotifications({ userId, slotNumber, floor, type, date, bookingId });
    res.json(notification);
  } catch (error) {
    console.error('Error in createCancellationNotification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const preferences = await getPreferencesService(userId);
    res.json(preferences);
  } catch (error) {
    console.error('Error in getNotificationPreferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const preferences = req.body;
    const updatedPreferences = await updatePreferencesService(userId, preferences);
    res.json(updatedPreferences);
  } catch (error) {
    console.error('Error in updateNotificationPreferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

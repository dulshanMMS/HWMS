import * as NotificationService from '../services/notificationService.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js'; // Ensure this is imported



export const getAllNotifications = async (req, res) => {
  try {
    const data = await NotificationService.getAllNotifications(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

export const getAdminNotifications = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Not authorized' });
    const data = await NotificationService.getAdminNotifications();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin notifications', error: error.message });
  }
};

export const getUnreadNotificationCount = async (req, res) => {
  try {
    const count = await NotificationService.getUnreadNotificationCount(req.user.id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unread count', error: error.message });
  }
};

export const getAdminUnreadCount = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Not authorized' });
    const count = await NotificationService.getAdminUnreadCount();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin unread count', error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await NotificationService.markAsRead(req.params.id, req.user.id);
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await NotificationService.markAllAsRead(req.user.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking all as read', error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await NotificationService.deleteNotification(req.params.id, req.user.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
};

export const sendNotification = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Not authorized' });

    const notification = await NotificationService.sendNotification(req.body);
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error sending notification', error: error.message });
  }
};

export const sendBulkNotification = async (req, res) => {
  try {
    if (!req.user?.role || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const users = await User.find({}, "_id");
    const recipients = users.map(u => u._id);
    console.log("📬 Sending announcement to:", recipients.length, "users");

    console.log("📬 Total users to notify:", recipients.length);

    if (!recipients.length) {
      return res.status(400).json({ message: "No users found to notify" });
    }

    const result = await NotificationService.sendBulkNotifications({
      recipients,
      title: "Announcement",
      message,
      type: "important",
      emailSubject: "New Announcement from Admin"
    });

    res.json({ success: true, message: "Announcement sent", count: result.length });
  } catch (error) {
    console.error("❌ Error in sendBulkNotification:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// export const getNotifications = async (req, res) => {
//   try {
//     const { page = 1, limit = 20 } = req.query;
//     const data = await NotificationService.getNotifications(page, limit);
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal Server Error', message: error.message });
//   }
// };

export const getNotifications = async (req, res) => {
  console.log(">>> getNotifications hit");
  
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    console.log(`Fetching notifications: page=${page}, limit=${limit}, skip=${skip}`);

    // Fetch notifications
    const notifications = await Notification.find({ deleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log("✅ Notifications found:", notifications.length);

    // Count total
    const total = await Notification.countDocuments({ deleted: false });
    console.log("✅ Total notifications:", total);

    res.json({ notifications, total });
  } catch (err) {
    console.error("🔥 Error in getNotifications:", err);
    res.status(500).json({ error: "Internal server error", message: err.message });
  }
};




import { getNotificationsForAdmin } from '../services/notificationService.js';

export const getAdminOwnNotifications = async (req, res) => {
  try {
    const adminId = req.user.id; // assuming authentication middleware sets req.user
    const notifications = await getNotificationsForAdmin(adminId);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching admin notifications' });
  }
};

// New method to manually trigger booking notification
export const createBookingNotification = async (req, res) => {
  try {
    const { userId, slotNumber, floor, type, date, entryTime, exitTime, bookingId } = req.body;
    
    const result = await NotificationService.createBookingNotifications({
      userId,
      slotNumber,
      floor,
      type,
      date,
      entryTime,
      exitTime,
      bookingId
    });
    
    res.status(201).json({
      message: 'Booking notifications created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating booking notification:', error);
    res.status(500).json({ 
      message: 'Error creating booking notification', 
      error: error.message 
    });
  }
};

// New method to manually trigger cancellation notification
export const createCancellationNotification = async (req, res) => {
  try {
    const { userId, slotNumber, floor, type, date, bookingId } = req.body;
    
    const result = await NotificationService.createCancellationNotifications({
      userId,
      slotNumber,
      floor,
      type,
      date,
      bookingId
    });
    
    res.status(201).json({
      message: 'Cancellation notifications created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating cancellation notification:', error);
    res.status(500).json({ 
      message: 'Error creating cancellation notification', 
      error: error.message 
    });
  }
};


export const getUserOwnNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // Fetch notifications where:
    // - This user is a direct recipient (in array)
    // OR
    // - It is an announcement to all users (broadcast)
    const notifications = await Notification.find({
      recipients: { $in: [userId] },  // matches personal notifications
      deleted: false
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Notification.countDocuments({
      recipients: { $in: [userId] },
      deleted: false
    });

    res.status(200).json({ notifications, total });

  } catch (error) {
    console.error('🔥 Error fetching user own notifications:', error);
    res.status(500).json({ message: 'Server error fetching user notifications' });
  }
};


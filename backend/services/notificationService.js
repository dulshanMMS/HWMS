import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import ParkingSlot from '../models/ParkingSlots.js';
import SeatingSlots from '../models/SeatingSlots.js';
import User from '../models/User.js';
import Announcement from '../models/Announcement.js';
import sendEmail from './emailService.js';
import cron from 'node-cron';
import { io } from '../server.js';

// Track processed booking IDs to prevent duplicates
const processedBookingIds = new Set();

// Unread count
export async function getUnreadNotificationCount(userId) {
  return Notification.countDocuments({ 
    recipients: { $in: [userId] }, 
    read: false, 
    deleted: false 
  });
}

export async function getAdminUnreadCount() {
  return Notification.countDocuments({ type: 'important', read: false, deleted: false });
}

// Mark as read
export async function markAsRead(notificationId, userId) {
  const notification = await Notification.findById(notificationId);
  if (!notification) throw new Error('Notification not found');
  
  const user = await User.findById(userId).select('role');
  if (!user) throw new Error('User not found');
  
  if (user.role === 'admin' && notification.type === 'important') {
    notification.read = true;
    return notification.save();
  }
  
  if (!notification.recipients.map(r => r.toString()).includes(userId)) {
    throw new Error('Not authorized');
  }
  
  notification.read = true;
  return notification.save();
}

// Mark as unread
export async function markAsUnread(notificationId, userId) {
  const notification = await Notification.findById(notificationId);
  if (!notification) throw new Error('Notification not found');
  
  const user = await User.findById(userId).select('role');
  if (!user) throw new Error('User not found');
  
  if (user.role === 'admin' && notification.type === 'important') {
    notification.read = false;
    return notification.save();
  }
  
  if (!notification.recipients.map(r => r.toString()).includes(userId)) {
    throw new Error('Not authorized');
  }
  
  notification.read = false;
  return notification.save();
}

export async function markAllAsRead(userId) {
  const user = await User.findById(userId).select('role');
  if (!user) throw new Error('User not found');
  
  if (user.role === 'admin') {
    return Notification.updateMany(
      {
        $or: [
          { recipients: { $in: [userId] }, deleted: false },
          { type: 'important', deleted: false }
        ]
      },
      { read: true }
    );
  }
  
  return Notification.updateMany({ 
    recipients: { $in: [userId] }, 
    read: false, 
    deleted: false 
  }, { read: true });
}

export async function markAllAsUnread(userId) {
  const user = await User.findById(userId).select('role');
  if (!user) throw new Error('User not found');
  
  if (user.role === 'admin') {
    return Notification.updateMany(
      {
        $or: [
          { recipients: { $in: [userId] }, deleted: false },
          { type: 'important', deleted: false }
        ]
      },
      { read: false }
    );
  }
  
  return Notification.updateMany({ 
    recipients: { $in: [userId] }, 
    read: true, 
    deleted: false 
  }, { read: false });
}

export async function deleteAllNotifications(userId) {
  return Notification.updateMany({ 
    recipients: { $in: [userId] }, 
    deleted: false 
  }, { deleted: true });
}

export async function deleteNotification(notificationId, userId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      console.error(`Invalid notificationId format: ${notificationId}`);
      throw new Error('Invalid notification ID');
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      console.error(`Notification not found: ${notificationId}`);
      throw new Error('Notification not found');
    }

    if (!notification.recipients.map(r => r.toString()).includes(userId)) {
      console.error(`Unauthorized access attempt for notification ${notificationId} by user ${userId}`);
      throw new Error('Not authorized');
    }

    notification.deleted = true;
    await notification.save();
    return notification;
  } catch (error) {
    console.error(`Error in deleteNotification: ${error.message}`, error.stack);
    throw error;
  }
}

// Fetch notifications
export async function getNotifications(page = 1, limit = 10, userId, filter = 'all') {
  try {
    if (!userId) {
      console.error('userId is undefined');
      throw new Error('userId is undefined');
    }

    const user = await User.findById(userId).select('role username');
    if (!user) {
      console.error(`User not found for userId: ${userId}`);
      throw new Error('User not found');
    }

    const skip = (page - 1) * limit;
    let query = { deleted: false };

    if (user.role === 'admin') {
      if (filter === 'parking') {
        query.$or = [
          { recipients: userId, type: { $in: ['parking_booking', 'parking_cancellation'] } },
          { type: 'important', message: { $regex: 'parking', $options: 'i' } }
        ];
      } else if (filter === 'seating') {
        query.$or = [
          { recipients: userId, type: { $in: ['seat_booking', 'seat_cancellation'] } },
          { type: 'important', message: { $regex: 'seat', $options: 'i' } }
        ];
      } else if (filter === 'announcements') {
        query.type = 'admin_announcement';
      } else {
        query.$or = [
          { recipients: userId },
          { type: 'important' }
        ];
      }
    } else {
      query.recipients = userId;
      if (filter === 'parking') {
        query.type = { $in: ['parking_booking', 'parking_cancellation'] };
      } else if (filter === 'seating') {
        query.type = { $in: ['seat_booking', 'seat_cancellation'] };
      } else if (filter === 'announcements') {
        query.type = 'admin_announcement';
      }
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'bookingId',
        select: 'type details date',
        strictPopulate: false
      });

    return {
      notifications,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit) || 1
    };
  } catch (error) {
    console.error('Error in getNotifications:', error.message, error.stack);
    throw error;
  }
}

export async function createParkingBookingNotifications(parkingSlot, latestBooking) {
  try {
    const bookingId = `${parkingSlot._id}-${latestBooking.date}-${latestBooking.entryTime}-${latestBooking.userName}`;
    if (processedBookingIds.has(bookingId)) {
      return null;
    }

    const user = await User.findOne({ username: latestBooking.userName }).select('username email notificationPreferences firstName lastName');
    if (!user) {
      console.error(`User not found: ${latestBooking.userName}`);
      throw new Error(`User not found: ${latestBooking.userName}`);
    }

    const preferences = user.notificationPreferences || {};
    if (!preferences.bookingConfirmation) {
      preferences.bookingConfirmation = { email: false, inApp: true };
    }

    const bookingDate = new Date(latestBooking.date).toLocaleDateString();

    let userNotification = null;
    if (preferences.bookingConfirmation?.inApp === true) {
      userNotification = new Notification({
        recipients: [user._id],
        title: 'Parking Booking Confirmed',
        message: `Your parking slot ${parkingSlot.slotNumber} on Floor ${parkingSlot.floor} has been booked for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
        type: 'parking_booking',
        bookingId,
        category: 'parking'
      });
      await userNotification.save();
      io.emit('notificationReceived', userNotification);
    }

    if (user.email && preferences.bookingConfirmation?.email === true) {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Parking Booking Confirmation',
          message: `Your parking slot ${parkingSlot.slotNumber} on Floor ${parkingSlot.floor} has been booked for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`
        });
      } catch (emailError) {
        console.error(`Failed to send email to user ${user.email}: ${emailError.message}`);
      }
    }

    const admins = await User.find({ role: 'admin' }).select('email notificationPreferences firstName lastName');
    let adminNotification = null;
    if (admins.some(admin => admin.notificationPreferences?.adminAnnouncements?.inApp)) {
      adminNotification = new Notification({
        recipients: admins.map(admin => admin._id),
        title: 'New Parking Booking Alert',
        message: `${user.firstName} ${user.lastName} (${user.username}) has booked parking slot ${parkingSlot.slotNumber} on Floor ${parkingSlot.floor} for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
        type: 'important',
        bookingId,
        category: 'parking'
      });
      await adminNotification.save();
      io.emit('notificationReceived', adminNotification);
    }

    const adminEmails = admins.filter(admin => admin.email && admin.notificationPreferences?.adminAnnouncements?.email);
    for (const admin of adminEmails) {
      try {
        await sendEmail({
          to: admin.email,
          subject: 'New Parking Booking - Admin Alert',
          message: `${user.firstName} ${user.lastName} (${user.username}) has booked parking slot ${parkingSlot.slotNumber} on Floor ${parkingSlot.floor} for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`
        });
      } catch (emailError) {
        console.error(`Failed to send email to admin ${admin.email}: ${emailError.message}`);
      }
    }

    processedBookingIds.add(bookingId);
    return { userNotification, adminNotification };
  } catch (error) {
    console.error('Error creating parking booking notifications:', error.message, error.stack);
    throw error;
  }
}

export async function createSeatingBookingNotifications(seatingRecord, latestBooking) {
  try {
    const bookingId = latestBooking.bookingId;
    if (processedBookingIds.has(bookingId)) {
      return null;
    }

    if (!seatingRecord.userName) {
      console.error(`userName is undefined in seatingRecord`);
      throw new Error(`userName is undefined in seatingRecord`);
    }

    const user = await User.findOne({ username: seatingRecord.userName }).select('username email notificationPreferences firstName lastName');
    if (!user) {
      console.error(`User not found: ${seatingRecord.userName}`);
      throw new Error(`User not found: ${seatingRecord.userName}`);
    }

    const preferences = user.notificationPreferences || {};
    if (!preferences.bookingConfirmation) {
      preferences.bookingConfirmation = { email: false, inApp: true };
    }

    const bookingDate = new Date(latestBooking.date).toLocaleDateString();

    let userNotification = null;
    if (preferences.bookingConfirmation?.inApp === true) {
      userNotification = new Notification({
        recipients: [user._id],
        title: 'Seat Booking Confirmed',
        message: `Your seat ${latestBooking.seatId} on Floor ${latestBooking.floor} has been booked for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
        type: 'seat_booking',
        bookingId,
        category: 'seating'
      });
      await userNotification.save();
      io.emit('notificationReceived', userNotification);
    }

    if (user.email && preferences.bookingConfirmation?.email === true) {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Seat Booking Confirmation',
          message: `Your seat ${latestBooking.seatId} on Floor ${latestBooking.floor} has been booked for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`
        });
      } catch (emailError) {
        console.error(`Failed to send email to user ${user.email}: ${emailError.message}`);
      }
    }

    const admins = await User.find({ role: 'admin' }).select('email notificationPreferences firstName lastName');
    let adminNotification = null;
    if (admins.some(admin => admin.notificationPreferences?.adminAnnouncements?.inApp)) {
      adminNotification = new Notification({
        recipients: admins.map(admin => admin._id),
        title: 'New Seat Booking Alert',
        message: `${user.firstName} ${user.lastName} (${user.username}) has booked seat ${latestBooking.seatId} on Floor ${latestBooking.floor} for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
        type: 'important',
        bookingId,
        category: 'seating'
      });
      await adminNotification.save();
      io.emit('notificationReceived', adminNotification);
    }

    const adminEmails = admins.filter(admin => admin.email && admin.notificationPreferences?.adminAnnouncements?.email);
    for (const admin of adminEmails) {
      try {
        await sendEmail({
          to: admin.email,
          subject: 'New Seat Booking - Admin Alert',
          message: `${user.firstName} ${user.lastName} (${user.username}) has booked seat ${latestBooking.seatId} on Floor ${latestBooking.floor} for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`
        });
      } catch (emailError) {
        console.error(`Failed to send email to admin ${admin.email}: ${emailError.message}`);
      }
    }

    processedBookingIds.add(bookingId);
    return { userNotification, adminNotification };
  } catch (error) {
    console.error('Error creating seating booking notifications:', error.message, error.stack);
    throw error;
  }
}

// Create booking notifications
export async function createBookingNotifications(type, bookingRecord, latestBooking) {
  try {
    if (type === 'parking') {
      return await createParkingBookingNotifications(bookingRecord, latestBooking);
    } else if (type === 'seating') {
      return await createSeatingBookingNotifications(bookingRecord, latestBooking);
    } else if (type === 'feedback_reply') {
      const bookingId = `${bookingRecord._id}-feedback_reply`;
      if (processedBookingIds.has(bookingId)) {
        return null;
      }

      const user = await User.findById(bookingRecord.userId).select('username email notificationPreferences firstName lastName');
      if (!user) {
        console.error(`User not found: ${bookingRecord.userId}`);
        throw new Error(`User not found: ${bookingRecord.userId}`);
      }

      const preferences = user.notificationPreferences || {};
      if (!preferences.feedbackReply) {
        preferences.feedbackReply = { email: false, inApp: true };
      }

      let userNotification = null;
      if (preferences.feedbackReply?.inApp === true) {
        userNotification = new Notification({
          recipients: [user._id],
          title: 'Feedback Reply',
          message: `Admin response: ${latestBooking.adminReply}`,
          type: 'feedback_reply',
          bookingId,
          category: 'feedback',
          rating: bookingRecord.rating,
          feedback: bookingRecord.feedback,
          bookingType: bookingRecord.bookingType
        });
        await userNotification.save();
        io.emit('notificationReceived', userNotification);
      }

      if (user.email && preferences.feedbackReply?.email === true) {
        try {
          await sendEmail({
            to: user.email,
            subject: 'Feedback Reply',
            message: `Thank you for your feedback on your ${bookingRecord.bookingType} booking. Admin response: ${latestBooking.adminReply}`
          });
        } catch (emailError) {
          console.error(`Failed to send feedback reply email to user ${user.email}: ${emailError.message}`);
        }
      }

      processedBookingIds.add(bookingId);
      return { userNotification };
    } else {
      throw new Error(`Unknown booking type: ${type}`);
    }
  } catch (error) {
    console.error('Error creating booking notifications:', error.message, error.stack);
    throw error;
  }
}

// Booking reminder emails
export async function sendBookingReminderEmails() {
  try {
    const now = new Date();
    const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return { hours, minutes };
    };

    const parkingSlots = await ParkingSlot.find({
      'bookings.date': {
        $gte: now.toISOString().split('T')[0],
        $lte: tomorrowEnd.toISOString().split('T')[0]
      }
    });

    for (const slot of parkingSlots) {
      for (const booking of slot.bookings) {
        const bookingDate = new Date(booking.date);
        const { hours, minutes } = parseTime(booking.entryTime);
        bookingDate.setHours(hours, minutes, 0, 0);
        const timeDiff = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (timeDiff > 5.5 && timeDiff <= 6.5) {
          const user = await User.findOne({ username: booking.userName }).select('username email notificationPreferences');
          if (!user) {
            console.warn(`User not found for parking booking: ${booking.userName}`);
            continue;
          }
          const preferences = user.notificationPreferences || {};
          if (user.email && preferences.bookingReminder?.email === true) {
            try {
              await sendEmail({
                to: user.email,
                subject: 'Parking Booking Reminder',
                message: `Reminder: Your parking slot ${slot.slotNumber} on Floor ${slot.floor} is booked for ${booking.date} from ${booking.entryTime} to ${booking.exitTime}. Your booking starts in approximately 6 hours.`
              });
            } catch (emailError) {
              console.error(`Failed to send reminder email to user ${user.email}: ${emailError.message}`);
            }
          }
        }
      }
    }

    const seatingRecords = await SeatingSlots.find({
      'bookings.date': {
        $gte: now.toISOString().split('T')[0],
        $lte: tomorrowEnd.toISOString().split('T')[0]
      }
    });

    for (const record of seatingRecords) {
      for (const booking of record.bookings) {
        const bookingDate = new Date(booking.date);
        const { hours, minutes } = parseTime(booking.entryTime);
        bookingDate.setHours(hours, minutes, 0, 0);
        const timeDiff = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (timeDiff > 5.5 && timeDiff <= 6.5) {
          const user = await User.findOne({ username: booking.userName }).select('username email notificationPreferences');
          if (!user) {
            console.warn(`User not found for seating booking: ${booking.userName}`);
            continue;
          }
          const preferences = user.notificationPreferences || {};
          if (user.email && preferences.bookingReminder?.email === true) {
            try {
              await sendEmail({
                to: user.email,
                subject: 'Seat Booking Reminder',
                message: `Reminder: Your seat ${booking.seatId} on Floor ${booking.floor} is booked for ${booking.date} from ${booking.entryTime} to ${booking.exitTime}. Your booking starts in approximately 6 hours.`
              });
            } catch (emailError) {
              console.error(`Failed to send reminder email to user ${user.email}: ${emailError.message}`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error sending 6-hour booking reminder emails:', error.message, error.stack);
    throw error;
  }
}

// Announcement notifications
export async function createAnnouncementNotifications(announcement) {
  try {
    const users = await User.find({}).select('username email notificationPreferences _id');

    for (const user of users) {
      const preferences = user.notificationPreferences || {};
      if (user.email && preferences.adminAnnouncements?.email === true) {
        try {
          await sendEmail({
            to: user.email,
            subject: 'Admin Announcement',
            message: announcement.message
          });
        } catch (emailError) {
          console.error(`Failed to send announcement email to ${user.email}: ${emailError.message}`);
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error sending announcement emails:', error.message, error.stack);
    throw error;
  }
}

// Cancellation notifications
export async function createCancellationNotifications({ userId, slotNumber, floor, type, date, bookingId }) {
  try {
    if (!userId || !slotNumber || !floor || !type || !date || !bookingId) {
      console.error('Missing required parameters:', { userId, slotNumber, floor, type, date, bookingId });
      throw new Error('Missing required parameters');
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`Invalid userId format: ${userId}`);
      throw new Error('Invalid userId format');
    }

    const user = await User.findById(userId).select('username email notificationPreferences firstName lastName');
    if (!user) {
      console.error(`User not found for userId: ${userId}`);
      throw new Error('User not found');
    }

    const preferences = user.notificationPreferences || {};
    const bookingDate = new Date(date).toLocaleDateString();

    let userNotification = null;
    if (preferences.cancellationAlert?.inApp === true) {
      userNotification = new Notification({
        recipients: [user._id],
        title: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancelled`,
        message: `Your ${type === 'parking' ? 'parking slot' : 'seat'} ${slotNumber} on Floor ${floor} booking for ${bookingDate} has been cancelled.`,
        type: `${type}_cancellation`,
        bookingId,
        category: type
      });
      await userNotification.save();
      io.emit('notificationReceived', userNotification);
    }

    if (user.email && preferences.cancellationAlert?.email === true) {
      try {
        await sendEmail({
          to: user.email,
          subject: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancellation`,
          message: `Your ${type === 'parking' ? 'parking slot' : 'seat'} ${slotNumber} on Floor ${floor} booking for ${bookingDate} has been cancelled.`
        });
      } catch (emailError) {
        console.error(`Failed to send cancellation email to user ${user.email}: ${emailError.message}`);
      }
    }

    const admins = await User.find({ role: 'admin' }).select('email notificationPreferences firstName lastName');
    let adminNotification = null;
    if (admins.some(admin => admin.notificationPreferences?.adminAnnouncements?.inApp)) {
      adminNotification = new Notification({
        recipients: admins.map(admin => admin._id),
        title: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancelled`,
        message: `${user.firstName} ${user.lastName} (${user.username}) has cancelled their ${type === 'parking' ? 'parking slot' : 'seat'} ${slotNumber} on Floor ${floor} booking for ${bookingDate}.`,
        type: 'important',
        bookingId,
        category: type
      });
      await adminNotification.save();
      io.emit('notificationReceived', adminNotification);
    }

    const adminEmails = admins.filter(admin => admin.email && admin.notificationPreferences?.adminAnnouncements?.email);
    for (const admin of adminEmails) {
      try {
        await sendEmail({
          to: admin.email,
          subject: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancellation - Admin Alert`,
          message: `${user.firstName} ${user.lastName} (${user.username}) has cancelled their ${type === 'parking' ? 'parking slot' : 'seat'} ${slotNumber} on Floor ${floor} booking for ${bookingDate}.`
        });
      } catch (emailError) {
        console.error(`Failed to send cancellation email to admin ${admin.email}: ${emailError.message}`);
      }
    }

    processedBookingIds.add(bookingId);
    return { userNotification, adminNotification };
  } catch (error) {
    console.error('Error creating cancellation notifications:', error.message, error.stack);
    throw error;
  }
}

// Notification preferences
export async function getNotificationPreferences(userId) {
  try {
    const user = await User.findById(userId).select('notificationPreferences username email');
    
    if (!user) {
      console.error(`User not found for userId: ${userId}`);
      throw new Error('User not found');
    }
    
    const preferences = user.notificationPreferences || {
      bookingConfirmation: { email: true, inApp: true },
      cancellationAlert: { email: true, inApp: true },
      adminAnnouncements: { email: true, inApp: true },
      bookingReminder: { email: true, inApp: true },
      feedbackReply: { email: true, inApp: true }
    };
    
    return preferences;
  } catch (error) {
    console.error('Error in getNotificationPreferences service:', error);
    throw error;
  }
}

export async function updateNotificationPreferences(userId, preferences) {
  try {
    if (!preferences || typeof preferences !== 'object') {
      console.error('Invalid preferences format');
      throw new Error('Invalid preferences format');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        notificationPreferences: {
          ...preferences,
          bookingReminder: { ...preferences.bookingReminder, inApp: true },
          feedbackReply: { ...preferences.feedbackReply, inApp: true }
        }
      },
      { new: true }
    ).select('notificationPreferences username');
    
    if (!user) {
      console.error(`User not found for userId: ${userId}`);
      throw new Error('User not found');
    }
    
    return user.notificationPreferences;
  } catch (error) {
    console.error('Error in updateNotificationPreferences service:', error);
    throw error;
  }
}

// Delete all notifications in database (hard delete)
export async function deleteAllNotificationsInDatabase() {
  try {
    const result = await Notification.deleteMany({});
    
    processedBookingIds.clear();
    
    return {
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} notifications`
    };
  } catch (error) {
    console.error('Error deleting all notifications:', error.message, error.stack);
    throw error;
  }
}

// Initialize notification system
export function initializeNotificationSystem() {
  cron.schedule('*/30 * * * *', () => {
    sendBookingReminderEmails();
  }, {
    timezone: 'Asia/Kolkata'
  });
}
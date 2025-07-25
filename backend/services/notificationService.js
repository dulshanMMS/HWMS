
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import ParkingSlot from '../models/ParkingSlots.js';
import SeatingSlots from '../models/SeatingSlots.js';
import User from '../models/User.js';
import Announcement from '../models/Announcement.js';
import sendEmail from './emailService.js';
import cron from 'node-cron';

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

  // Allow admins to mark 'important' notifications as read without checking recipients
  if (user.role === 'admin' && notification.type === 'important') {
    notification.read = true;
    return notification.save();
  }

  // For non-important notifications or non-admins, check recipients
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

  // Allow admins to mark 'important' notifications as unread without checking recipients
  if (user.role === 'admin' && notification.type === 'important') {
    notification.read = false;
    return notification.save();
  }

  // For non-important notifications or non-admins, check recipients
  if (!notification.recipients.map(r => r.toString()).includes(userId)) {
    throw new Error('Not authorized');
  }

  notification.read = false;
  return notification.save();
}

export async function markAllAsRead(userId) {
  const user = await User.findById(userId).select('role');
  if (!user) throw new Error('User not found');

  // For admins, mark all 'important' and their own notifications as read
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

  // For non-admins, mark only their own notifications
  return Notification.updateMany({
    recipients: { $in: [userId] },
    read: false,
    deleted: false
  }, { read: true });
}

export async function markAllAsUnread(userId) {
  const user = await User.findById(userId).select('role');
  if (!user) throw new Error('User not found');

  // For admins, mark all 'important' and their own notifications as unread
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

  // For non-admins, mark only their own notifications
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

// Delete (soft)
export async function deleteNotification(notificationId, userId) {
  const notification = await Notification.findById(notificationId);
  if (!notification) throw new Error('Notification not found');

  if (!notification.recipients.map(r => r.toString()).includes(userId)) {
    throw new Error('Not authorized');
  }

  notification.deleted = true;
  return notification.save();
}

// Fetch notifications
export async function getNotifications(page = 1, limit = 10, userId, filter = 'all') {
  try {
    console.log(`getNotifications called with page=${page}, limit=${limit}, userId=${userId}, filter=${filter}`);

    if (!userId) {
      console.error('userId is undefined');
      throw new Error('userId is undefined');
    }

    const user = await User.findById(userId).select('role username');
    if (!user) {
      console.error(`User not found for userId: ${userId}`);
      throw new Error('User not found');
    }
    console.log(`User found: ${user.username}, role: ${user.role}`);

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

    console.log('Query:', JSON.stringify(query));
    const total = await Notification.countDocuments(query);
    console.log('Total notifications for filter', filter, ':', total);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'bookingId',
        select: 'type details date',
        strictPopulate: false
      });

    console.log('Fetched notifications for filter', filter, ':', notifications.length);
    if (notifications.length === 0) {
      console.warn(`No notifications found for filter '${filter}' and userId '${userId}'`);
    } else {
      console.log('Notifications:', JSON.stringify(notifications, null, 2));
    }

    return {
      notifications,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit) || 1
    };
  } catch (error) {
    console.error('Error in getNotifications:', error.message, error.stack);
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }
}



// export async function getNotifications(page = 1, userId, filter = 'all') {
//   try {
//     console.log(`getNotifications called with page=${page}, userId=${userId}, filter=${filter}`);

//     if (!userId) {
//       console.error('userId is undefined');
//       throw new Error('userId is undefined');
//     }

//     const user = await User.findById(userId).select('role username');
//     if (!user) {
//       console.error(`User not found for userId: ${userId}`);
//       throw new Error('User not found');
//     }
//     console.log(`User found: ${user.username}, role: ${user.role}`);

//     let query = { deleted: false };

//     if (user.role === 'admin') {
//       if (filter === 'parking') {
//         query.$or = [
//           { recipients: userId, type: { $in: ['parking_booking', 'parking_cancellation'] } },
//           { type: 'important', message: { $regex: 'parking', $options: 'i' } }
//         ];
//       } else if (filter === 'seating') {
//         query.$or = [
//           { recipients: userId, type: { $in: ['seat_booking', 'seat_cancellation'] } },
//           { type: 'important', message: { $regex: 'seat', $options: 'i' } }
//         ];
//       } else if (filter === 'announcements') {
//         query.type = 'admin_announcement';
//       } else {
//         query.$or = [
//           { recipients: userId },
//           { type: 'important' }
//         ];
//       }
//     } else {
//       query.recipients = userId;
//       if (filter === 'parking') {
//         query.type = { $in: ['parking_booking', 'parking_cancellation'] };
//       } else if (filter === 'seating') {
//         query.type = { $in: ['seat_booking', 'seat_cancellation'] };
//       } else if (filter === 'announcements') {
//         query.type = 'admin_announcement';
//       }
//     }

//     console.log('Query:', JSON.stringify(query));
//     const total = await Notification.countDocuments(query);
//     console.log('Total notifications for filter', filter, ':', total);

//     // Fetch all notifications without a limit
//     const notifications = await Notification.find(query)
//       .sort({ createdAt: -1 })
//       .populate({
//         path: 'bookingId',
//         select: 'type details date',
//         strictPopulate: false
//       });

//     console.log('Fetched notifications for filter', filter, ':', notifications.length);
//     if (notifications.length === 0) {
//       console.warn(`No notifications found for filter '${filter}' and userId '${userId}'`);
//     } else {
//       console.log('Notifications:', JSON.stringify(notifications, null, 2));
//     }

//     return {
//       notifications,
//       total,
//       page: parseInt(page),
//       totalPages: Math.ceil(total / 10) || 1 // Assuming 10 notifications per page for frontend
//     };
//   } catch (error) {
//     console.error('Error in getNotifications:', error.message, error.stack);
//     throw new Error(`Failed to fetch notifications: ${error.message}`);
//   }
// }

// Parking booking notifications

export async function createParkingBookingNotifications(parkingSlot, latestBooking) {
  try {
    console.log(`🚗 Processing parking booking: ${latestBooking.userName} -> Slot ${parkingSlot.slotNumber}`);

    const bookingId = `${parkingSlot._id}-${latestBooking.date}-${latestBooking.entryTime}-${latestBooking.userName}`;
    if (processedBookingIds.has(bookingId)) {
      console.log(`🚗 Booking ${bookingId} already processed, skipping...`);
      return null;
    }

    const user = await User.findOne({ username: latestBooking.userName }).select('username email notificationPreferences firstName lastName');
    if (!user) {
      console.error(`❌ User not found: ${latestBooking.userName}`);
      throw new Error(`User not found: ${latestBooking.userName}`);
    }

    const preferences = user.notificationPreferences || {};
    console.log(`📋 User preferences for ${user.username}: ${JSON.stringify(preferences)}`);
    console.log(`📋 Creating in-app notification: ${preferences.bookingConfirmation?.inApp ? 'Yes' : 'No'}`);
    console.log(`📋 Sending email: ${user.email && preferences.bookingConfirmation?.email ? 'Yes' : 'No'}`);

    if (!preferences.bookingConfirmation) {
      console.warn(`⚠️ bookingConfirmation preferences missing for ${user.username}, using defaults: { email: false, inApp: true }`);
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
      console.log(`✅ User notification created for ${user.username}: ${userNotification._id}`);
    } else {
      console.log(`⛔ In-app notification skipped for ${user.username} due to preferences: bookingConfirmation.inApp=${preferences.bookingConfirmation?.inApp}`);
    }

    if (user.email && preferences.bookingConfirmation?.email === true) {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Parking Booking Confirmation',
          message: `Your parking slot ${parkingSlot.slotNumber} on Floor ${parkingSlot.floor} has been booked for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`
        });
        console.log(`📧 Email sent to user: ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to user ${user.email}: ${emailError.message}`);
      }
    } else {
      console.log(`⛔ Email not sent to ${user.email || 'no email'}: bookingConfirmation.email=${preferences.bookingConfirmation?.email}`);
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
      console.log(`✅ Single admin notification saved with recipients: ${admins.length}`);
    } else {
      console.log(`⛔ Admin in-app notification skipped: no admins with adminAnnouncements.inApp=true`);
    }

    const adminEmails = admins.filter(admin => admin.email && admin.notificationPreferences?.adminAnnouncements?.email);
    for (const admin of adminEmails) {
      try {
        await sendEmail({
          to: admin.email,
          subject: 'New Parking Booking - Admin Alert',
          message: `${user.firstName} ${user.lastName} (${user.username}) has booked parking slot ${parkingSlot.slotNumber} on Floor ${parkingSlot.floor} for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`
        });
        console.log(`📧 Admin email sent to: ${admin.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to admin ${admin.email}: ${emailError.message}`);
      }
    }

    processedBookingIds.add(bookingId);
    console.log(`✅ Booking ${bookingId} marked as processed`);

    return { userNotification, adminNotification };
  } catch (error) {
    console.error('❌ Error creating parking booking notifications:', error.message, error.stack);
    throw error;
  }
}

// Seating booking notifications
export async function createSeatingBookingNotifications(seatingRecord, latestBooking) {
  try {
    console.log(`🪑 Processing seating booking: ${latestBooking.userName} -> Seat ${latestBooking.seatId}`);

    const bookingId = `${seatingRecord._id}-${latestBooking.date}-${latestBooking.entryTime}-${latestBooking.userName}`;
    if (processedBookingIds.has(bookingId)) {
      console.log(`🪑 Booking ${bookingId} already processed, skipping...`);
      return null;
    }

    const user = await User.findOne({ username: latestBooking.userName }).select('username email notificationPreferences firstName lastName');
    if (!user) {
      console.error(`❌ User not found: ${latestBooking.userName}`);
      throw new Error(`User not found: ${latestBooking.userName}`);
    }

    const preferences = user.notificationPreferences || {};
    console.log(`📋 User preferences for ${user.username}: ${JSON.stringify(preferences)}`);
    console.log(`📋 Creating in-app notification: ${preferences.bookingConfirmation?.inApp ? 'Yes' : 'No'}`);
    console.log(`📋 Sending email: ${user.email && preferences.bookingConfirmation?.email ? 'Yes' : 'No'}`);

    if (!preferences.bookingConfirmation) {
      console.warn(`⚠️ bookingConfirmation preferences missing for ${user.username}, using defaults: { email: false, inApp: true }`);
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
      console.log(`✅ User notification created for ${user.username}: ${userNotification._id}`);
    } else {
      console.log(`⛔ In-app notification skipped for ${user.username} due to preferences: bookingConfirmation.inApp=${preferences.bookingConfirmation?.inApp}`);
    }

    if (user.email && preferences.bookingConfirmation?.email === true) {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Seat Booking Confirmation',
          message: `Your seat ${latestBooking.seatId} on Floor ${latestBooking.floor} has been booked for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`
        });
        console.log(`📧 Email sent to user: ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to user ${user.email}: ${emailError.message}`);
      }
    } else {
      console.log(`⛔ Email not sent to ${user.email || 'no email'}: bookingConfirmation.email=${preferences.bookingConfirmation?.email}`);
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
      console.log(`✅ Single admin notification saved with recipients: ${admins.length}`);
    } else {
      console.log(`⛔ Admin in-app notification skipped: no admins with adminAnnouncements.inApp=true`);
    }

    const adminEmails = admins.filter(admin => admin.email && admin.notificationPreferences?.adminAnnouncements?.email);
    for (const admin of adminEmails) {
      try {
        await sendEmail({
          to: admin.email,
          subject: 'New Seat Booking - Admin Alert',
          message: `${user.firstName} ${user.lastName} (${user.username}) has booked seat ${latestBooking.seatId} on Floor ${latestBooking.floor} for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`
        });
        console.log(`📧 Admin email sent to: ${admin.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to admin ${admin.email}: ${emailError.message}`);
      }
    }

    processedBookingIds.add(bookingId);
    console.log(`✅ Booking ${bookingId} marked as processed`);

    return { userNotification, adminNotification };
  } catch (error) {
    console.error('❌ Error creating seating booking notifications:', error.message, error.stack);
    throw error;
  }
}

// Booking reminder emails
export async function sendBookingReminderEmails() {
  try {
    console.log('⏰ Sending booking reminder emails...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // Parking bookings
    const parkingSlots = await ParkingSlot.find({
      'bookings.date': {
        $gte: tomorrow.toISOString().split('T')[0],
        $lte: tomorrowEnd.toISOString().split('T')[0]
      }
    });

    for (const slot of parkingSlots) {
      for (const booking of slot.bookings) {
        if (booking.date === tomorrow.toISOString().split('T')[0]) {
          const user = await User.findOne({ username: booking.userName }).select('username email notificationPreferences');
          if (!user) {
            console.warn(`⚠️ User not found for parking booking: ${booking.userName}`);
            continue;
          }
          const preferences = user.notificationPreferences || {};
          console.log(`📋 Reminder preferences for ${user.username}: ${JSON.stringify(preferences)}`);
          if (user.email && preferences.bookingReminder?.email === true) {
            try {
              await sendEmail({
                to: user.email,
                subject: 'Parking Booking Reminder',
                message: `Reminder: Your parking slot ${slot.slotNumber} on Floor ${slot.floor} is booked for tomorrow, ${booking.date}, from ${booking.entryTime} to ${booking.exitTime}`
              });
              console.log(`📧 Reminder email sent to user: ${user.email}`);
            } catch (emailError) {
              console.error(`❌ Failed to send reminder email to user ${user.email}: ${emailError.message}`);
            }
          } else {
            console.log(`⛔ Reminder email not sent to ${user.email || 'no email'}: bookingReminder.email=${preferences.bookingReminder?.email}`);
          }
        }
      }
    }

    // Seating bookings
    const seatingRecords = await SeatingSlots.find({
      'bookings.date': {
        $gte: tomorrow.toISOString().split('T')[0],
        $lte: tomorrowEnd.toISOString().split('T')[0]
      }
    });

    for (const record of seatingRecords) {
      for (const booking of record.bookings) {
        if (booking.date === tomorrow.toISOString().split('T')[0]) {
          const user = await User.findOne({ username: booking.userName }).select('username email notificationPreferences');
          if (!user) {
            console.warn(`⚠️ User not found for seating booking: ${booking.userName}`);
            continue;
          }
          const preferences = user.notificationPreferences || {};
          console.log(`📋 Reminder preferences for ${user.username}: ${JSON.stringify(preferences)}`);
          if (user.email && preferences.bookingReminder?.email === true) {
            try {
              await sendEmail({
                to: user.email,
                subject: 'Seat Booking Reminder',
                message: `Reminder: Your seat ${booking.seatId} on Floor ${booking.floor} is booked for tomorrow, ${booking.date}, from ${booking.entryTime} to ${booking.exitTime}`
              });
              console.log(`📧 Reminder email sent to user: ${user.email}`);
            } catch (emailError) {
              console.error(`❌ Failed to send reminder email to user ${user.email}: ${emailError.message}`);
            }
          } else {
            console.log(`⛔ Reminder email not sent to ${user.email || 'no email'}: bookingReminder.email=${preferences.bookingReminder?.email}`);
          }
        }
      }
    }

    console.log('✅ Finished sending booking reminder emails');
  } catch (error) {
    console.error('❌ Error sending booking reminder emails:', error.message, error.stack);
    throw error;
  }
}

// Announcement notifications
export async function createAnnouncementNotifications(announcement) {
  try {
    console.log(`📢 Processing announcement: ${announcement.message}`);

    const users = await User.find({}).select('username email notificationPreferences _id');
    const userIds = users
      .filter(user => user.notificationPreferences?.adminAnnouncements?.inApp === true)
      .map(user => user._id);
    let notification = null;

    if (userIds.length > 0) {
      notification = new Notification({
        recipients: userIds,
        title: 'Admin Announcement',
        message: announcement.message,
        type: 'admin_announcement',
        bookingId: null,
        category: 'announcement'
      });
      await notification.save();
      console.log(`✅ Announcement notification created for ${userIds.length} users: ${userIds.join(', ')}`);
    } else {
      console.log(`⛔ No in-app announcement notification created: no users with adminAnnouncements.inApp=true`);
    }

    for (const user of users) {
      const preferences = user.notificationPreferences || {};
      console.log(`📋 Announcement preferences for ${user.username}: ${JSON.stringify(preferences)}`);
      if (user.email && preferences.adminAnnouncements?.email === true) {
        try {
          await sendEmail({
            to: user.email,
            subject: 'Admin Announcement',
            message: announcement.message
          });
          console.log(`📧 Announcement email sent to: ${user.email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send announcement email to ${user.email}: ${emailError.message}`);
        }
      } else {
        console.log(`⛔ Announcement email not sent to ${user.email || 'no email'}: adminAnnouncements.email=${preferences.adminAnnouncements?.email}`);
      }
    }

    return notification;
  } catch (error) {
    console.error('❌ Error creating announcement notifications:', error.message, error.stack);
    throw error;
  }
}

// Cancellation notifications
export async function createCancellationNotifications({ userId, slotNumber, floor, type, date, bookingId }) {
  try {
    console.log(`🚫 Creating cancellation notifications for ${type} booking, userId: ${userId}, slot: ${slotNumber}, floor: ${floor}, date: ${date}, bookingId: ${bookingId}`);

    if (!userId || !slotNumber || !floor || !type || !date || !bookingId) {
      console.error('❌ Missing required parameters:', { userId, slotNumber, floor, type, date, bookingId });
      throw new Error('Missing required parameters');
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`❌ Invalid userId format: ${userId}`);
      throw new Error('Invalid userId format');
    }

    const user = await User.findById(userId).select('username email notificationPreferences firstName lastName');
    if (!user) {
      console.error(`❌ User not found for userId: ${userId}`);
      throw new Error('User not found');
    }
    console.log(`✅ User found: ${user.username}, email: ${user.email}`);

    const preferences = user.notificationPreferences || {};
    console.log(`📋 Cancellation preferences for ${user.username}: ${JSON.stringify(preferences)}`);
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
      console.log(`🚫 About to save user notification for ${user.username}:`, JSON.stringify(userNotification));
      await userNotification.save();
      console.log(`✅ Cancellation notification created in-app for user ${user.username}: ${userNotification._id}`);
    } else {
      console.log(`⛔ Cancellation in-app notification skipped for ${user.username} due to preferences: cancellationAlert.inApp=${preferences.cancellationAlert?.inApp}`);
    }

    if (user.email && preferences.cancellationAlert?.email === true) {
      try {
        await sendEmail({
          to: user.email,
          subject: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancellation`,
          message: `Your ${type === 'parking' ? 'parking slot' : 'seat'} ${slotNumber} on Floor ${floor} booking for ${bookingDate} has been cancelled.`
        });
        console.log(`📧 Cancellation email sent to user: ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send cancellation email to user ${user.email}: ${emailError.message}`);
      }
    } else {
      console.log(`⛔ Cancellation email not sent to ${user.email || 'no email'}: email=${user.email}, cancellationAlert.email=${preferences.cancellationAlert?.email}`);
    }

    const admins = await User.find({ role: 'admin' }).select('email notificationPreferences firstName lastName');
    console.log(`✅ Admins found: ${admins.length}`);
    const adminIds = admins.map(admin => admin._id);
    let adminNotification = null;
    if (admins.some(admin => admin.notificationPreferences?.adminAnnouncements?.inApp)) {
      adminNotification = new Notification({
        recipients: adminIds,
        title: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancelled`,
        message: `${user.firstName} ${user.lastName} (${user.username}) has cancelled their ${type === 'parking' ? 'parking slot' : 'seat'} ${slotNumber} on Floor ${floor} booking for ${bookingDate}.`,
        type: 'important',
        bookingId,
        category: type
      });
      console.log(`🚫 About to save admin notification:`, JSON.stringify(adminNotification));
      await adminNotification.save();
      console.log(`✅ Single admin notification saved with recipients: ${adminIds.length}`);
    } else {
      console.log(`⛔ Admin in-app notification skipped: no admins with adminAnnouncements.inApp=true`);
    }

    const adminEmails = admins.filter(admin => admin.email && admin.notificationPreferences?.adminAnnouncements?.email);
    console.log(`✅ Admins with email notifications enabled: ${adminEmails.length}`);
    for (const admin of adminEmails) {
      try {
        await sendEmail({
          to: admin.email,
          subject: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancellation - Admin Alert`,
          message: `${user.firstName} ${user.lastName} (${user.username}) has cancelled their ${type === 'parking' ? 'parking slot' : 'seat'} ${slotNumber} on Floor ${floor} booking for ${bookingDate}.`
        });
        console.log(`📧 Cancellation admin email sent to: ${admin.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send cancellation email to admin ${admin.email}: ${emailError.message}`);
      }
    }

    processedBookingIds.add(bookingId);
    console.log(`✅ Booking ${bookingId} marked as processed`);

    return { userNotification, adminNotification };
  } catch (error) {
    console.error('❌ Error creating cancellation notifications:', error.message, error.stack);
    throw error;
  }
}

// Create booking notifications
export async function createBookingNotifications(type, bookingRecord, latestBooking) {
  if (type === 'parking') {
    return await createParkingBookingNotifications(bookingRecord, latestBooking);
  } else if (type === 'seating') {
    return await createSeatingBookingNotifications(bookingRecord, latestBooking);
  } else {
    throw new Error(`Unknown booking type: ${type}`);
  }
}

// Notification preferences
export async function getNotificationPreferences(userId) {
  try {
    const user = await User.findById(userId).select('notificationPreferences username email');

    if (!user) {
      console.error(`❌ User not found for userId: ${userId}`);
      throw new Error('User not found');
    }

    const preferences = user.notificationPreferences || {
      bookingConfirmation: { email: true, inApp: true },
      cancellationAlert: { email: true, inApp: true },
      adminAnnouncements: { email: true, inApp: true },
      bookingReminder: { email: true, inApp: true }
    };

    console.log(`📋 Fetched preferences for user ${user.username} (${userId}): ${JSON.stringify(preferences)}`);
    if (!user.notificationPreferences) {
      console.warn(`⚠️ No notificationPreferences found for user ${userId}, using defaults`);
    }

    return preferences;
  } catch (error) {
    console.error('Error in getNotificationPreferences service:', error);
    throw error;
  }
}

export async function updateNotificationPreferences(userId, preferences) {
  try {
    console.log(`📋 Updating preferences for user ${userId}: ${JSON.stringify(preferences)}`);
    if (!preferences || typeof preferences !== 'object') {
      console.error('❌ Invalid preferences format');
      throw new Error('Invalid preferences format');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        notificationPreferences: {
          ...preferences,
          bookingReminder: { ...preferences.bookingReminder, inApp: true }
        }
      },
      { new: true }
    ).select('notificationPreferences username');

    if (!user) {
      console.error(`❌ User not found for userId: ${userId}`);
      throw new Error('User not found');
    }

    console.log(`✅ Updated preferences for user ${user.username} (${userId}): ${JSON.stringify(user.notificationPreferences)}`);
    return user.notificationPreferences;
  } catch (error) {
    console.error('Error in updateNotificationPreferences service:', error);
    throw error;
  }
}

// Initialize notification system
export function initializeNotificationSystem() {
  console.log('🚀 Initializing notification system...');
  cron.schedule('0 8 * * *', () => {
    console.log('⏰ Running daily booking reminder email job...');
    sendBookingReminderEmails();
  }, {
    timezone: 'Asia/Kolkata'
  });
  console.log('✅ Notification system initialized successfully');
}
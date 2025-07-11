import Notification from '../models/Notification.js';
import ParkingSlot from '../models/ParkingSlots.js';
import SeatingSlot from '../models/SeatingSlots.js';
import User from '../models/User.js';
import sendEmail from './emailService.js';

// Fetch all notifications for a user
export async function getAllNotifications(userId) {
  return Notification.find({ recipient: userId, deleted: false })
    .sort({ createdAt: -1 })
    .populate('bookingId', 'type details date');
}

// Fetch all admin notifications with pagination
export async function getAdminNotifications(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await Notification.countDocuments({ type: 'important', deleted: false });
  
  const notifications = await Notification.find({ type: 'important', deleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('recipient', 'firstName lastName email username')
    .populate('bookingId', 'type details date');
    
  return {
    notifications,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit)
  };
}

// Unread count
export async function getUnreadNotificationCount(userId) {
  return Notification.countDocuments({ recipient: userId, read: false, deleted: false });
}

export async function getAdminUnreadCount() {
  return Notification.countDocuments({ type: 'important', read: false, deleted: false });
}

// Mark as read
export async function markAsRead(notificationId, userId) {
  const notification = await Notification.findById(notificationId);
  if (!notification) throw new Error('Notification not found');
  if (notification.recipient.toString() !== userId) throw new Error('Not authorized');
  notification.read = true;
  return notification.save();
}

// Mark all as read
export async function markAllAsRead(userId) {
  return Notification.updateMany({ recipient: userId, read: false, deleted: false }, { read: true });
}

// Delete (soft)
export async function deleteNotification(notificationId, userId) {
  const notification = await Notification.findById(notificationId);
  if (!notification) throw new Error('Notification not found');
  if (notification.recipient.toString() !== userId) throw new Error('Not authorized');
  notification.deleted = true;
  return notification.save();
}

// Paginated fetch for all notifications
export async function getNotifications(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await Notification.countDocuments({ deleted: false });
  
  const notifications = await Notification.find({ deleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('recipient', 'firstName lastName email username')
    .populate('bookingId', 'type details date');
    
  return {
    notifications,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit)
  };
}

// Manual notification creation for admins
export async function sendNotification({ recipient, title, message, type, emailSubject }) {
  const notification = new Notification({ recipient, title, message, type });
  await notification.save();

  const user = await User.findById(recipient);
  if (user?.email && emailSubject) {
    await sendEmail({ to: user.email, subject: emailSubject, message });
  }

  return notification;
}

// Bulk notification creation
export async function sendBulkNotifications({ recipients, title, message, type, emailSubject }) {
  const savedNotifications = [];

  for (const recipient of recipients) {
    const notification = new Notification({
      recipient,
      title,
      message,
      type
    });

    const saved = await notification.save(); // ✅ triggers all schema defaults
    savedNotifications.push(saved);

  if (emailSubject) {
  const users = await User.find({ _id: { $in: recipients } });
  for (const user of users) {
      if (user?.email) {
      await sendEmail({ to: user.email, subject: emailSubject, message });
      }
    }
  }

  console.log(`✅ Saved ${savedNotifications.length} notifications`);
  return savedNotifications;
}

// Main function to create booking notifications
export async function createBookingNotifications(bookingData) {
  const { userId, slotNumber, floor, type, date, entryTime, exitTime, bookingId } = bookingData;
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create notification for the user
  const userNotification = new Notification({
      recipient: userId,
      title: `${type === 'seat' ? 'Seat' : 'Parking'} Booking Confirmed`,
      message: `Your ${type === 'seat' ? 'seat' : 'parking slot'} ${slotNumber} on Floor ${floor} has been booked for ${date} from ${entryTime} to ${exitTime}`,
      type: type === 'seat' ? 'seat_booking' : 'parking_booking',
      bookingId: bookingId
  });
  await userNotification.save();

    // Send email to user
  if (user.email) {
    await sendEmail({
      to: user.email,
      subject: userNotification.title,
      message: userNotification.message
    });
  }

    // Create notifications for all admins
  const admins = await User.find({ role: 'admin' });
    const adminNotifications = [];
    
  for (const admin of admins) {
    const adminNotification = new Notification({
      recipient: admin._id,
        title: `New Booking`,
        message: `${user.firstName} ${user.lastName} (${user.username}) has booked ${type === 'seat' ? 'seat' : 'parking slot'} ${slotNumber} on Floor ${floor} for ${date} from ${entryTime} to ${exitTime}`,
      type: 'important',
        bookingId: bookingId
      });
      await adminNotification.save();
      adminNotifications.push(adminNotification);

      // Send email to admin
      if (admin.email) {
        await sendEmail({
          to: admin.email,
          subject: adminNotification.title,
          message: adminNotification.message
        });
      }
    }

    console.log(`Notifications created: 1 user notification, ${adminNotifications.length} admin notifications`);
    return { userNotification, adminNotifications };
    
  } catch (error) {
    console.error('Error creating booking notifications:', error);
    throw error;
  }
}

// Function to handle cancellation notifications
export async function createCancellationNotifications(cancellationData) {
  const { userId, slotNumber, floor, type, date, bookingId } = cancellationData;
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create notification for the user
    const userNotification = new Notification({
      recipient: userId,
      title: `${type === 'seat' ? 'Seat' : 'Parking'} Booking Cancelled`,
      message: `Your ${type === 'seat' ? 'seat' : 'parking slot'} ${slotNumber} on Floor ${floor} booking for ${date} has been cancelled`,
      type: type === 'seat' ? 'seat_cancellation' : 'parking_cancellation',
      bookingId: bookingId
    });
    await userNotification.save();

    // Send email to user
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: userNotification.title,
        message: userNotification.message
      });
    }

    // Create notifications for all admins
    const admins = await User.find({ role: 'admin' });
    const adminNotifications = [];
    
    for (const admin of admins) {
      const adminNotification = new Notification({
        recipient: admin._id,
        title: `Booking Cancelled`,
        message: `${user.firstName} ${user.lastName} (${user.username}) has cancelled ${type === 'seat' ? 'seat' : 'parking slot'} ${slotNumber} on Floor ${floor} for ${date}`,
        type: 'important',
        bookingId: bookingId
    });
    await adminNotification.save();
      adminNotifications.push(adminNotification);

      // Send email to admin
      if (admin.email) {
        await sendEmail({
          to: admin.email,
          subject: adminNotification.title,
          message: adminNotification.message
        });
      }
    }

    return { userNotification, adminNotifications };
    
  } catch (error) {
    console.error('Error creating cancellation notifications:', error);
    throw error;
  }
}

// Change stream listeners for real-time notifications
export function listenForBookingChanges() {
  const seatingStream = SeatingSlot.watch();

  seatingStream.on('change', async (change) => {
    console.log('SeatingSlot change detected:', change.operationType);

    // Detect when a booking is added (update to bookings array)
    if (change.operationType === 'update' && change.updateDescription.updatedFields && change.updateDescription.updatedFields['bookings']) {
      // Get the slot document after the update
      const slotId = change.documentKey._id;
      const slot = await SeatingSlot.findById(slotId);
      if (slot && slot.bookings.length > 0) {
        // Get the latest booking (the one just added)
        const latestBooking = slot.bookings[slot.bookings.length - 1];
        const user = await User.findOne({ username: latestBooking.userName });
      if (user) {
          await createBookingNotifications({
            userId: user._id,
            slotNumber: slot.slotNumber,
            floor: slot.floor,
            type: 'seat',
            date: latestBooking.date,
            entryTime: latestBooking.entryTime,
            exitTime: latestBooking.exitTime,
            bookingId: latestBooking._id // optional, if you have booking IDs
          });
        }
      }
    }
  });
}

// Notification Preferences
export async function getNotificationPreferences(userId) {
  const user = await User.findById(userId).select('notificationPreferences');
  return user?.notificationPreferences || {
    email: true,
    push: true,
    bookingConfirmation: true,
    cancellationAlert: true,
    adminUpdates: true
  };
}

export async function updateNotificationPreferences(userId, preferences) {
  const user = await User.findByIdAndUpdate(
    userId, 
    { notificationPreferences: preferences }, 
    { new: true }
  ).select('notificationPreferences');
  return user.notificationPreferences;
}

// Fetch notifications for a specific admin
export async function getNotificationsForAdmin(adminId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await Notification.countDocuments({ recipient: adminId, deleted: false });
  
  const notifications = await Notification.find({ recipient: adminId, deleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('bookingId', 'type details date');
    
  return {
    notifications,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit)
  };
}

// Initialize the notification system
export function initializeNotificationSystem() {
  console.log('Initializing notification system...');
  listenForBookingChanges();
  console.log('Notification system initialized successfully');
}

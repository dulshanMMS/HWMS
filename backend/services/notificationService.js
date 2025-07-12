import Notification from '../models/Notification.js';
import ParkingSlot from '../models/ParkingSlots.js';
import SeatingSlot from '../models/SeatingSlots.js';
import User from '../models/User.js';
import sendEmail from './emailService.js'; // ✅ FIXED: Import sendEmail

// Fetch all notifications for a user
export async function getAllNotifications(userId) {
  return Notification.find({ recipient: userId, deleted: false }).sort({ createdAt: -1 });
}

// Fetch all admin notifications
export async function getAdminNotifications() {
  return Notification.find({ type: 'important', deleted: false })
    .sort({ createdAt: -1 })
    .populate('recipient', 'firstName lastName email')
    .populate('bookingId', 'type details date');
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

// Paginated fetch
export async function getNotifications(page, limit) {
  const total = await Notification.countDocuments();
  const notifications = await Notification.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  return { notifications, total };
}

// Manual notification creation
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

    // Optional: Send email
    const user = await User.findById(recipient);
    if (user?.email && emailSubject) {
      await sendEmail({
        to: user.email,
        subject: emailSubject,
        message
      });
    }
  }

  console.log(`✅ Saved ${savedNotifications.length} notifications`);
  return savedNotifications;
}

// Booking Notification to User + Admins
export async function sendBookingNotification({ booking, user, type }) {
  const userNotification = new Notification({
    recipient: user._id,
    title: type === 'seat_booking' ? 'Seat Booking Confirmed' : 'Parking Booking Confirmed',
    message: `Your ${type === 'seat_booking' ? 'seat' : 'parking'} booking has been confirmed.`,
    type,
    bookingId: booking._id
  });
  await userNotification.save();

  if (user.email) {
    await sendEmail({
      to: user.email,
      subject: userNotification.title,
      message: userNotification.message
    });
  }

  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    const adminNotification = new Notification({
      recipient: admin._id,
      title: `New ${type === 'seat_booking' ? 'Seat' : 'Parking'} Booking`,
      message: `${user.firstName} ${user.lastName} has made a ${type === 'seat_booking' ? 'seat' : 'parking'} booking.`,
      type: 'important',
      bookingId: booking._id
    });
    await adminNotification.save();
  }

  return [userNotification, ...admins.map(admin => admin._id)];
}

// Slot Booking Change Stream Listeners
export function listenForChanges() {
  const parkingStream = ParkingSlot.watch();
  const seatingStream = SeatingSlot.watch();

  seatingStream.on('change', async (change) => {
    console.log('SeatingSlot change detected:', change);
    if (change.operationType === 'insert' && change.fullDocument.bookings && change.fullDocument.bookings.length > 0) {
      const { userName, slotNumber, floor, date, entryTime, exitTime } = change.fullDocument.bookings[0];
      const user = await User.findOne({ username: userName });
      if (user) {
        console.log('User found for seating booking:', user);
        await createNotification(user._id, slotNumber, floor, 'seat', date, entryTime, exitTime);
      } else {
        console.log('User not found for seating booking with username:', userName);
      }
    }
  });

  parkingStream.on('change', async (change) => {
    console.log('ParkingSlot change detected:', change);
    if (change.operationType === 'insert' && change.fullDocument.bookings && change.fullDocument.bookings.length > 0) {
      const { userName, slotNumber, floor, date, entryTime, exitTime } = change.fullDocument.bookings[0];
      const user = await User.findOne({ username: userName });
      if (user) {
        console.log('User found for parking booking:', user);
        await createNotification(user._id, slotNumber, floor, 'parking', date, entryTime, exitTime);
      } else {
        console.log('User not found for parking booking with username:', userName);
      }
    }
  });
}

// Helper for real-time notification creation
export async function createNotification(userId, slotNumber, floor, type, date, entryTime, exitTime) {
  const user = await User.findById(userId);
  const userName = user?.username || 'Unknown User';
  const admins = await User.find({ role: 'admin' });

  // Create notification for the user
  const userNotification = new Notification({
    title: 'Booking Confirmation',
    message: `You booked ${type === 'seat' ? 'Seat' : 'Parking Slot'} ${slotNumber} on Floor ${floor} on ${date} from ${entryTime} to ${exitTime}`,
    type: type === 'seat' ? 'seat_booking' : 'parking_booking',
    recipient: userId,
  });
  await userNotification.save();

  // Create a general notification for each admin
  const adminMessage = `${userName} has booked a ${type === 'seat' ? 'Seat' : 'Parking Slot'} on Floor ${floor} on ${date}.`;
  for (const admin of admins) {
    const adminNotification = new Notification({
      title: 'New Booking',
      message: adminMessage,
      type: 'important',
      recipient: admin._id,
    });
    await adminNotification.save();
  }
}

// Notification Preferences
export async function getNotificationPreferences(userId) {
  const user = await User.findById(userId).select('notificationPreferences');
  return user.notificationPreferences;
}

export async function updateNotificationPreferences(userId, preferences) {
  const user = await User.findByIdAndUpdate(userId, { notificationPreferences: preferences }, { new: true })
    .select('notificationPreferences');
  return user.notificationPreferences;
}

export async function generateNotificationsForExistingBookings() {
  // Fetch all seating bookings
  const seatingSlots = await SeatingSlot.find({ 'bookings.0': { $exists: true } });
  for (const slot of seatingSlots) {
    for (const booking of slot.bookings) {
      const { userName, slotNumber, floor, date, entryTime, exitTime } = booking;
      const user = await User.findOne({ username: userName });
      if (user) {
        console.log('Generating notification for existing seating booking:', booking);
        await createNotification(user._id, slotNumber, floor, 'seat', date, entryTime, exitTime);
      }
    }
  }

  // Fetch all parking bookings
  const parkingSlots = await ParkingSlot.find({ 'bookings.0': { $exists: true } });
  for (const slot of parkingSlots) {
    for (const booking of slot.bookings) {
      const { userName, slotNumber, floor, date, entryTime, exitTime } = booking;
      const user = await User.findOne({ username: userName });
      if (user) {
        console.log('Generating notification for existing parking booking:', booking);
        await createNotification(user._id, slotNumber, floor, 'parking', date, entryTime, exitTime);
      }
    }
  }
}

// Call this function once to generate notifications for existing bookings
//generateNotificationsForExistingBookings();

listenForChanges();

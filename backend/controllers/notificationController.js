import Notification from '../models/Notification.js';
import * as NotificationService from '../services/notificationService.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import ParkingSlot from '../models/ParkingSlots.js';
import SeatingSlot from '../models/SeatingSlots.js';

// Get all notifications for a user
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ deleted: false }).sort({ createdAt: -1 });
    console.log('Fetched notifications:', notifications);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
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

// Delete a notification (soft delete)
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

// Get notification preferences
export const getPreferences = async (req, res) => {
  try {
    const preferences = await NotificationService.getNotificationPreferences(req.user.id);
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching preferences', error: error.message });
  }
};

// Update notification preferences
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

// const bookSlot = async (req, res) => {
//   try {
//     const { userId, slotNumber, floor } = req.body;

//     // Create the booking
//     const booking = new Booking({ userId, slotNumber, floor });
//     await booking.save();

//     // Fetch the user's username
//     const user = await User.findById(userId);
//     const username = user.username;

//     // Create a notification
//     await createNotification(userId, slotNumber, floor, 'parking', new Date(), '00:00', '23:59');

//     res.status(201).json({ message: 'Booking successful' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to book slot' });
//   }
// };

//Paginated Notification Fetching- recent 20 notifications showing
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Calculate total notifications
    const total = await Notification.countDocuments();

    // Fetch notifications with pagination
    const notifications = await Notification.find()
      .sort({ createdAt: -1 }) // Sort by creation date, most recent first
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Send response with notifications and total count
    res.json({ notifications, total });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to create a notification
const createNotification = async (userId, slotNumber, floor, type, date, entryTime, exitTime) => {
  // Fetch the user's username
  const user = await User.findById(userId);
  const userName = user ? user.username : 'Unknown User';

  // Fetch all admins
  const admins = await User.find({ role: 'admin' });

  // Create notification for the user
  const userMessage = `You booked the ${type === 'seat' ? 'Seat' : 'Parking Slot'} ${slotNumber} on Floor ${floor} on ${date} from ${entryTime} to ${exitTime}`;
  const userNotification = new Notification({
    title: 'Booking Confirmation',
    message: userMessage,
    type: type === 'seat' ? 'seat_booking' : 'parking_booking',
    recipient: userId, // Use the user's ID as the recipient
  });
  await userNotification.save();

  // Create notifications for each admin
  const adminMessage = `${userName} has booked ${type === 'seat' ? 'Seat' : 'Parking Slot'} ${slotNumber} on Floor ${floor} on ${date} from ${entryTime} to ${exitTime}`;
  for (const admin of admins) {
    const adminNotification = new Notification({
      title: 'New Booking',
      message: adminMessage,
      type: type === 'seat' ? 'seat_booking' : 'parking_booking',
      recipient: admin._id, // Use the admin's ID as the recipient
    });
    await adminNotification.save();
  }
};

// Function to listen for changes in both seating and parking slots
const listenForChanges = () => {
  const parkingStream = ParkingSlot.watch();
  const seatingStream = SeatingSlot.watch();

  // Handle changes in seating slots
  seatingStream.on('change', async (change) => {
    console.log('Change detected in seating slots:', change); // Log all changes
    if (change.operationType === 'insert') {
      const { userName, slotNumber, floor, date, entryTime, exitTime } = change.fullDocument.bookings[0];
      console.log(`Processing booking for user: ${userName}, slot: ${slotNumber}, floor: ${floor}`);

      try {
        // Find the user by username to get the user ID
        const user = await User.findOne({ username: userName });
        if (!user) {
          console.error(`User not found for username: ${userName}. Skipping notification creation.`);
          return; // Skip this booking if user not found
        }

        // Create a notification for the new booking
        await createNotification(user._id, slotNumber, floor, 'seat', date, entryTime, exitTime);
      } catch (error) {
        console.error('Error creating notification for seating slot:', error);
      }
    }
  });

  // Handle changes in parking slots
  parkingStream.on('change', async (change) => {
    console.log('Change detected in parking slots:', change); // Log all changes
    if (change.operationType === 'insert') {
      const { userName, slotNumber, floor, date, entryTime, exitTime } = change.fullDocument.bookings[0];
      console.log(`Processing booking for user: ${userName}, slot: ${slotNumber}, floor: ${floor}`);

      try {
        // Find the user by username to get the user ID
        const user = await User.findOne({ username: userName });
        if (!user) {
          console.error(`User not found for username: ${userName}. Skipping notification creation.`);
          return; // Skip this booking if user not found
        }

        // Create a notification for the new booking
        await createNotification(user._id, slotNumber, floor, 'parking', date, entryTime, exitTime);
      } catch (error) {
        console.error('Error creating notification for parking slot:', error);
      }
    }
  });
};

// Call this function when your server starts
listenForChanges();

// const generateNotificationsForParkingBookings = async () => {
//   try {
//     // Fetch all parking slots
//     const parkingSlots = await ParkingSlot.find();
//     console.log(`

// Function to create notifications for seating bookings
// const createNotificationsForSeatingBookings = async () => {
//   try {
//     // Fetch all seating slots
//     const seatingSlots = await SeatingSlot.find();

//     // Iterate over each seating slot
//     for (const slot of seatingSlots) {
//       const { slotNumber, floor, bookings } = slot;

//       // Iterate over each booking in the slot
//       for (const booking of bookings) {
//         const { userName, date, entryTime, exitTime } = booking;

//         // Find the user by username to get the user ID
//         const user = await User.findOne({ username: userName });
//         if (!user) {
//           console.error(`User not found for username: ${userName}. Skipping notification creation.`);
//           continue; // Skip this booking if user not found
//         }

//         // Call the createNotification function
//         await createNotification(user._id, slotNumber, floor, 'seat', date, entryTime, exitTime);
//       }
//     }

//     console.log('Notifications created for all seating bookings.');
//   } catch (error) {
//     console.error('Error creating notifications for seating bookings:', error);
//   }
// };

// Call this function to create notifications for existing seating bookings
//createNotificationsForSeatingBookings();
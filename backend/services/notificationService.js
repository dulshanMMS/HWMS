import Notification from '../models/Notification.js';
import ParkingSlot from '../models/ParkingSlots.js';
import SeatingSlots from '../models/SeatingSlots.js';
import User from '../models/User.js';
import sendEmail from './emailService.js';



// Fetch all admin notifications with pagination (UPDATED to use recipients array)


// Unread count (UPDATED to use recipients array)
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

// Mark as read (UPDATED to use recipients array)
export async function markAsRead(notificationId, userId) {
  const notification = await Notification.findById(notificationId);
  if (!notification) throw new Error('Notification not found');
  
  if (!notification.recipients.map(r => r.toString()).includes(userId)) {
    throw new Error('Not authorized');
  }
  
  notification.read = true;
  return notification.save();
}

export async function markAllAsRead(userId) {
  return Notification.updateMany({ 
    recipients: { $in: [userId] }, 
    read: false, 
    deleted: false 
  }, { read: true });
}

// Delete (soft) (UPDATED to use recipients array)
export async function deleteNotification(notificationId, userId) {
  const notification = await Notification.findById(notificationId);
  if (!notification) throw new Error('Notification not found');
  
  if (!notification.recipients.map(r => r.toString()).includes(userId)) {
    throw new Error('Not authorized');
  }
  
  notification.deleted = true;
  return notification.save();
}




// export async function getNotifications(page = 1, limit = 10, userId) {
//   try {
//     console.log(`getNotifications called with page=${page}, limit=${limit}, userId=${userId}`);
    
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

//     const skip = (page - 1) * limit;
//     let query;

//     if (user.role === 'admin') {
//       // Admins see their own notifications and all important notifications
//       query = { deleted: false, $or: [{ recipients: userId }, { type: 'important' }] };
//     } else {
//       // Regular users see only their own notifications
//       query = { deleted: false, recipients: userId };
//     }

//     console.log('Query:', JSON.stringify(query));
//     const total = await Notification.countDocuments(query);
//     console.log('Total notifications:', total);

//     const notifications = await Notification.find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit))
//       .populate({
//         path: 'bookingId',
//         select: 'type details date',
//         strictPopulate: false
//       });

//     console.log('Fetched notifications:', notifications.length);

//     return {
//       notifications,
//       total,
//       page: parseInt(page),
//       limit: parseInt(limit),
//       totalPages: Math.ceil(total / limit)
//     };
//   } catch (error) {
//     console.error('Error in getNotifications:', error);
//     throw new Error(`Failed to fetch notifications: ${error.message}`);
//   }
// }
export async function getNotifications(page = 1, limit = 10, userId) {
  try {
    console.log(`getNotifications called with page=${page}, limit=${limit}, userId=${userId}`);
    
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
    let query;

    if (user.role === 'admin') {
      // Admins see their own notifications and all important notifications
      query = { deleted: false, $or: [{ recipients: userId }, { type: 'important' }] };
    } else {
      // Regular users see only their own notifications
      query = { deleted: false, recipients: userId };
    }

    console.log('Query:', JSON.stringify(query));
    const total = await Notification.countDocuments(query);
    console.log('Total notifications:', total);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'bookingId',
        select: 'type details date',
        strictPopulate: false
      });

    console.log('Fetched notifications:', notifications.length);

    return {
      notifications,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error in getNotifications:', error);
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }
}

// Manual notification creation for admins (UPDATED to use recipients array)
// export async function sendNotification({ recipients, title, message, type, emailSubject }) {
//   // Ensure recipients is an array
//   const recipientArray = Array.isArray(recipients) ? recipients : [recipients];
  
//   const notification = new Notification({ 
//     recipients: recipientArray, 
//     title, 
//     message, 
//     type 
//   });
//   await notification.save();

//   // Send emails to all recipients
//   if (emailSubject) {
//     const users = await User.find({ _id: { $in: recipientArray } });
//     for (const user of users) {
//       if (user?.email) {
//         await sendEmail({ to: user.email, subject: emailSubject, message });
//       }
//     }
//   }

//   return notification;
// }
export async function sendNotification({ recipients, title, message, type, emailSubject }) {
  // Ensure recipients is an array
  const recipientArray = Array.isArray(recipients) ? recipients : [recipients];
  
  const notification = new Notification({ 
    recipients: recipientArray, 
    title, 
    message, 
    type 
  });
  await notification.save();

  // Send emails based on notification type
  if (emailSubject) {
    if (type === 'important') {
      // For important notifications, send email only to DESIGNATED_ADMIN_EMAIL
      const designatedAdminEmail = process.env.DESIGNATED_ADMIN_EMAIL || 'hwmsbooking@gmail.com';
      try {
        await sendEmail({
          to: designatedAdminEmail,
          subject: emailSubject,
          message
        });
        console.log(`📧 Admin email sent to: ${designatedAdminEmail}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to admin ${designatedAdminEmail}: ${emailError.message}`);
      }
    } else {
      // For non-important notifications, send emails to recipients based on preferences
      const users = await User.find({ _id: { $in: recipientArray } });
      for (const user of users) {
        const preferences = user.notificationPreferences || {};
        if (user?.email && preferences.email && (preferences.bookingConfirmation || preferences.cancellationAlert)) {
          try {
            await sendEmail({
              to: user.email,
              subject: emailSubject,
              message
            });
            console.log(`📧 Email sent to user: ${user.email}`);
          } catch (emailError) {
            console.error(`❌ Failed to send email to user ${user.email}: ${emailError.message}`);
          }
        } else {
          console.warn(`⚠️ Email not sent to user ${user.email}: email=${user.email}, preferences.email=${preferences.email}, preferences.bookingConfirmation=${preferences.bookingConfirmation}, preferences.cancellationAlert=${preferences.cancellationAlert}`);
        }
      }
    }
  }

  return notification;
}

// Bulk notification creation (UPDATED to use recipients array)
// export async function sendBulkNotifications({ recipients, title, message, type, emailSubject }) {
//   const savedNotifications = [];

//   for (const recipient of recipients) {
//     const notification = new Notification({
//       recipients: [recipient], // Use recipients array
//       title,
//       message,
//       type
//     });

//     const saved = await notification.save();
//     savedNotifications.push(saved);
//   }

//   if (emailSubject) {
//     const users = await User.find({ _id: { $in: recipients } });
//     for (const user of users) {
//       if (user?.email) {
//         await sendEmail({ to: user.email, subject: emailSubject, message });
//       }
//     }
//   }

//   console.log(`✅ Saved ${savedNotifications.length} notifications`);
//   return savedNotifications;
// }
export async function sendBulkNotifications({ recipients, title, message, type, emailSubject }) {
  const savedNotifications = [];

  for (const recipient of recipients) {
    const notification = new Notification({
      recipients: [recipient], // Use recipients array
      title,
      message,
      type
    });

    const saved = await notification.save();
    savedNotifications.push(saved);
  }

  if (emailSubject) {
    if (type === 'important') {
      // For important notifications, send email only to DESIGNATED_ADMIN_EMAIL
      const designatedAdminEmail = process.env.DESIGNATED_ADMIN_EMAIL || 'hwmsbooking@gmail.com';
      try {
        await sendEmail({
          to: designatedAdminEmail,
          subject: emailSubject,
          message
        });
        console.log(`📧 Admin email sent to: ${designatedAdminEmail}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to admin ${designatedAdminEmail}: ${emailError.message}`);
      }
    } else {
      // For non-important notifications, send emails to recipients based on preferences
      const users = await User.find({ _id: { $in: recipients } });
      for (const user of users) {
        const preferences = user.notificationPreferences || {};
        if (user?.email && preferences.email && (preferences.bookingConfirmation || preferences.cancellationAlert)) {
          try {
            await sendEmail({
              to: user.email,
              subject: emailSubject,
              message
            });
            console.log(`📧 Email sent to user: ${user.email}`);
          } catch (emailError) {
            console.error(`❌ Failed to send email to user ${user.email}: ${emailError.message}`);
          }
        } else {
          console.warn(`⚠️ Email not sent to user ${user.email}: email=${user.email}, preferences.email=${preferences.email}, preferences.bookingConfirmation=${preferences.bookingConfirmation}, preferences.cancellationAlert=${preferences.cancellationAlert}`);
        }
      }
    }
  }

  console.log(`✅ Saved ${savedNotifications.length} notifications`);
  return savedNotifications;
}


// async function createParkingBookingNotifications(parkingSlot, latestBooking) {
//   try {
//     console.log(`🚗 Processing parking booking: ${latestBooking.userName} -> Slot ${parkingSlot.slotNumber}`);

//     const user = await User.findOne({ username: latestBooking.userName });
//     if (!user) {
//       console.error(`❌ User not found: ${latestBooking.userName}`);
//       return;
//     }

//     const preferences = user.notificationPreferences || {};

//     // USER NOTIFICATION
//     const userNotification = new Notification({
//       recipients: [user._id],
//       title: 'Parking Booking Confirmed',
//       message: `Your parking slot ${parkingSlot.slotNumber} on Floor ${parkingSlot.floor} has been booked for ${latestBooking.date} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
//       type: 'parking_booking',
//       bookingId: null
//     });
//     await userNotification.save();
//     console.log(`✅ User notification created for ${user.username}`);

//     if (user.email && preferences.email && preferences.bookingConfirmation) {
//       try {
//         await sendEmail({
//           to: user.email,
//           subject: 'Parking Booking Confirmation',
//           message: userNotification.message
//         });
//         console.log(`📧 Email sent to user: ${user.email}`);
//       } catch (emailError) {
//         console.error('❌ Failed to send email to user:', emailError);
//       }
//     }

//     // ADMIN NOTIFICATION
//     const admins = await User.find({ role: 'admin' });
//     const adminIds = admins.map(admin => admin._id);

//     const adminNotification = new Notification({
//       recipients: adminIds,
//       title: 'New Parking Booking Alert',
//       message: `${user.firstName} ${user.lastName} (${user.username}) has booked parking slot ${parkingSlot.slotNumber} on Floor ${parkingSlot.floor} for ${latestBooking.date} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
//       type: 'important'
//     });
//     await adminNotification.save();
//     console.log(`✅ Single admin notification saved with recipients: ${adminIds.length}`);

//     // Send email to each admin individually if preferences allow
//     for (const admin of admins) {
//       const adminPreferences = admin.notificationPreferences || {};
//       if (admin.email && adminPreferences.email && adminPreferences.adminUpdates) {
//         try {
//           await sendEmail({
//             to: admin.email,
//             subject: 'New Parking Booking - Admin Alert',
//             message: adminNotification.message
//           });
//           console.log(`📧 Admin email sent to: ${admin.email}`);
//         } catch (emailError) {
//           console.error('❌ Failed to send email to admin:', emailError);
//         }
//       }
//     }

//     return { userNotification, adminNotification };

//   } catch (error) {
//     console.error('❌ Error creating parking booking notifications:', error);
//     throw error;
//   }
// }

async function createParkingBookingNotifications(parkingSlot, latestBooking) {
  try {
    console.log(`🚗 Processing parking booking: ${latestBooking.userName} -> Slot ${parkingSlot.slotNumber}`);

    const user = await User.findOne({ username: new RegExp(`^${latestBooking.userName}$`, 'i') });
    if (!user) {
      console.error(`❌ User not found: ${latestBooking.userName}`);
      throw new Error(`User not found: ${latestBooking.userName}`);
    }

    const preferences = user.notificationPreferences || {};
    console.log(`📋 User preferences: ${JSON.stringify(preferences)}`);

    // USER NOTIFICATION
    const userNotification = new Notification({
      recipients: [user._id],
      title: 'Parking Booking Confirmed',
      message: `Your parking slot ${parkingSlot.slotNumber} on Floor ${parkingSlot.floor} has been booked for ${latestBooking.date} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
      type: 'parking_booking',
      bookingId: null
    });
    await userNotification.save();
    console.log(`✅ User notification created for ${user.username}`);

    if (user.email && preferences.email && preferences.bookingConfirmation) {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Parking Booking Confirmation',
          message: userNotification.message
        });
        console.log(`📧 Email sent to user: ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to user ${user.email}: ${emailError.message}`);
      }
    } else {
      console.warn(`⚠️ Email not sent to user ${user.email}: email=${user.email}, preferences.email=${preferences.email}, preferences.bookingConfirmation=${preferences.bookingConfirmation}`);
    }

    // ADMIN NOTIFICATION
    const admins = await User.find({ role: 'admin' });
    const adminIds = admins.map(admin => admin._id);

    const adminNotification = new Notification({
      recipients: adminIds,
      title: 'New Parking Booking Alert',
      message: `${user.firstName} ${user.lastName} (${user.username}) has booked parking slot ${parkingSlot.slotNumber} on Floor ${parkingSlot.floor} for ${latestBooking.date} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
      type: 'important'
    });
    await adminNotification.save();
    console.log(`✅ Single admin notification saved with recipients: ${adminIds.length}`);

    // Send email to designated admin
    const designatedAdminEmail = process.env.DESIGNATED_ADMIN_EMAIL || 'realadmin@example.com';
    try {
      await sendEmail({
        to: designatedAdminEmail,
        subject: 'New Parking Booking - Admin Alert',
        message: adminNotification.message
      });
      console.log(`📧 Admin email sent to: ${designatedAdminEmail}`);
    } catch (emailError) {
      console.error(`❌ Failed to send email to admin ${designatedAdminEmail}: ${emailError.message}`);
    }

    return { userNotification, adminNotification };
  } catch (error) {
    console.error('❌ Error creating parking booking notifications:', error);
    throw error;
  }
}

// async function createSeatingBookingNotifications(seatingRecord, latestBooking) {
//   try {
//     console.log(`🪑 Processing seating booking: ${seatingRecord.userName} -> Seat ${latestBooking.seatId}`);

//     const user = await User.findOne({ username: seatingRecord.userName });
//     if (!user) {
//       console.error(`❌ User not found: ${seatingRecord.userName}`);
//       return;
//     }

//     const preferences = user.notificationPreferences || {};
//     const bookingDate = new Date(latestBooking.date).toLocaleDateString();

//     // USER NOTIFICATION
//     const userNotification = new Notification({
//       recipients: [user._id],
//       title: 'Seat Booking Confirmed',
//       message: `Your seat ${latestBooking.seatId} on Floor ${latestBooking.floor} has been booked for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
//       type: 'seat_booking',
//       bookingId: null
//     });
//     await userNotification.save();
//     console.log(`✅ User notification created for ${user.username}`);

//     if (user.email && preferences.email && preferences.bookingConfirmation) {
//       try {
//         await sendEmail({
//           to: user.email,
//           subject: 'Seat Booking Confirmation',
//           message: userNotification.message
//         });
//         console.log(`📧 Email sent to user: ${user.email}`);
//       } catch (emailError) {
//         console.error('❌ Failed to send email to user:', emailError);
//       }
//     }

//     // ADMIN NOTIFICATION
//     const admins = await User.find({ role: 'admin' });
//     const adminIds = admins.map(admin => admin._id);

//     const adminNotification = new Notification({
//       recipients: adminIds,
//       title: 'New Seat Booking Alert',
//       message: `${user.firstName} ${user.lastName} (${user.username}) has booked seat ${latestBooking.seatId} on Floor ${latestBooking.floor} for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
//       type: 'important'
//     });
//     await adminNotification.save();
//     console.log(`✅ Single admin notification saved with recipients: ${adminIds.length}`);

//     // Email per admin if preferences allow
//     for (const admin of admins) {
//       const adminPreferences = admin.notificationPreferences || {};
//       if (admin.email && adminPreferences.email && adminPreferences.adminUpdates) {
//         try {
//           await sendEmail({
//             to: admin.email,
//             subject: 'New Seat Booking - Admin Alert',
//             message: adminNotification.message
//           });
//           console.log(`📧 Admin email sent to: ${admin.email}`);
//         } catch (emailError) {
//           console.error('❌ Failed to send email to admin:', emailError);
//         }
//       }
//     }

//     return { userNotification, adminNotification };

//   } catch (error) {
//     console.error('❌ Error creating seating booking notifications:', error);
//     throw error;
//   }
// }
async function createSeatingBookingNotifications(seatingRecord, latestBooking) {
  try {
    console.log(`🪑 Processing seating booking: ${seatingRecord.userName} -> Seat ${latestBooking.seatId}`);

    const user = await User.findOne({ username: new RegExp(`^${seatingRecord.userName}$`, 'i') });
    if (!user) {
      console.error(`❌ User not found: ${seatingRecord.userName}`);
      throw new Error(`User not found: ${seatingRecord.userName}`);
    }

    const preferences = user.notificationPreferences || {};
    const bookingDate = new Date(latestBooking.date).toLocaleDateString();

    // USER NOTIFICATION
    const userNotification = new Notification({
      recipients: [user._id],
      title: 'Seat Booking Confirmed',
      message: `Your seat ${latestBooking.seatId} on Floor ${latestBooking.floor} has been booked for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
      type: 'seat_booking',
      bookingId: null
    });
    await userNotification.save();
    console.log(`✅ User notification created for ${user.username}`);

    if (user.email && preferences.email && preferences.bookingConfirmation) {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Seat Booking Confirmation',
          message: userNotification.message
        });
        console.log(`📧 Email sent to user: ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to user ${user.email}: ${emailError.message}`);
      }
    } else {
      console.warn(`⚠️ Email not sent to user ${user.email}: email=${user.email}, preferences.email=${preferences.email}, preferences.bookingConfirmation=${preferences.bookingConfirmation}`);
    }

    // ADMIN NOTIFICATION
    const admins = await User.find({ role: 'admin' });
    const adminIds = admins.map(admin => admin._id);

    const adminNotification = new Notification({
      recipients: adminIds,
      title: 'New Seat Booking Alert',
      message: `${user.firstName} ${user.lastName} (${user.username}) has booked seat ${latestBooking.seatId} on Floor ${latestBooking.floor} for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
      type: 'important'
    });
    await adminNotification.save();
    console.log(`✅ Single admin notification saved with recipients: ${adminIds.length}`);

    // Send email to designated admin
    const designatedAdminEmail = process.env.DESIGNATED_ADMIN_EMAIL || 'realadmin@example.com';
    try {
      await sendEmail({
        to: designatedAdminEmail,
        subject: 'New Seat Booking - Admin Alert',
        message: adminNotification.message
      });
      console.log(`📧 Admin email sent to: ${designatedAdminEmail}`);
    } catch (emailError) {
      console.error(`❌ Failed to send email to admin ${designatedAdminEmail}: ${emailError.message}`);
    }

    return { userNotification, adminNotification };
  } catch (error) {
    console.error('❌ Error creating seating booking notifications:', error);
    throw error;
  }
}



export function listenForBookingChanges() {
  console.log('🔄 Starting enhanced database change listeners...');

  // ========== PARKING SLOT LISTENER ==========
  const parkingStream = ParkingSlot.watch([
    {
      $match: { $or: [{ operationType: 'insert' }, { operationType: 'update' }] }
    }
  ], { fullDocument: 'updateLookup' });

  parkingStream.on('change', async (change) => {
    try {
      console.log('🚗 ParkingSlot change event received (all events):', JSON.stringify(change));
      if (change.operationType === 'update' || change.operationType === 'insert') {
        const slotId = change.documentKey._id;
        const parkingSlot = await ParkingSlot.findById(slotId);
        console.log('🚗 ParkingSlot fetched:', parkingSlot ? parkingSlot.bookings.length : 'null');
        
        if (parkingSlot) {
          const previousLength = change.fullDocumentBeforeChange ? change.fullDocumentBeforeChange.bookings.length : 0;
          const currentLength = parkingSlot.bookings.length;
          console.log('🚗 Bookings: previous=', previousLength, 'current=', currentLength);
          
          if (currentLength > previousLength) {
            const latestBooking = parkingSlot.bookings[parkingSlot.bookings.length - 1];
            console.log('📍 New parking booking detected, creating notifications...', latestBooking);
            await createParkingBookingNotifications(parkingSlot, latestBooking);
          } else {
            console.log('🚗 No new booking detected, update details:', JSON.stringify(change.updateDescription));
          }
        } else {
          console.log('🚗 Parking slot not found.');
        }
      }
    } catch (error) {
      console.error('❌ Error processing parking slot change:', error);
    }
  });

  // ========== SEATING SLOT LISTENER ==========
  const seatingStream = SeatingSlots.watch([
    {
      $match: { $or: [{ operationType: 'insert' }, { operationType: 'update' }] }
    }
  ], { fullDocument: 'updateLookup' });

  seatingStream.on('change', async (change) => {
    try {
      console.log('🪑 SeatingSlots change event received (all events):', JSON.stringify(change));
      if (change.operationType === 'update' || change.operationType === 'insert') {
        const recordId = change.documentKey._id;
        const seatingRecord = await SeatingSlots.findById(recordId);
        console.log('🪑 SeatingRecord fetched:', seatingRecord ? seatingRecord.bookings.length : 'null');
        
        if (seatingRecord) {
          const previousLength = change.fullDocumentBeforeChange ? change.fullDocumentBeforeChange.bookings.length : 0;
          const currentLength = seatingRecord.bookings.length;
          console.log('🪑 Bookings: previous=', previousLength, 'current=', currentLength);
          
          if (currentLength > previousLength) {
            const latestBooking = seatingRecord.bookings[seatingRecord.bookings.length - 1];
            console.log('📍 New seating booking detected, creating notifications...', latestBooking);
            await createSeatingBookingNotifications(seatingRecord, latestBooking);
          } else {
            console.log('🪑 No new booking detected, update details:', JSON.stringify(change.updateDescription));
          }
        } else {
          console.log('🪑 Seating record not found.');
        }
      }
    } catch (error) {
      console.error('❌ Error processing seating slot change:', error);
    }
  });

  // ... (error handling and shutdown remain unchanged)
}

// Notification Preferences (UPDATED to use recipients array)
export async function getNotificationPreferences(userId) {
  try {
    const user = await User.findById(userId).select('notificationPreferences');
    
    // Check if user exists
    if (!user) {
      throw new Error('User not found');
    }
    
    return user.notificationPreferences || {
      email: true,
      push: true,
      bookingConfirmation: true,
      cancellationAlert: true,
      adminUpdates: true
    };
  } catch (error) {
    console.error('Error in getNotificationPreferences service:', error);
    throw error;
  }
}

export async function updateNotificationPreferences(userId, preferences) {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { notificationPreferences: preferences },
      { new: true }
    ).select('notificationPreferences');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user.notificationPreferences;
  } catch (error) {
    console.error('Error in updateNotificationPreferences service:', error);
    throw error;
  }
}

// Fet


// Initialize the notification system
export function initializeNotificationSystem() {
  console.log('🚀 Initializing notification system...');
  listenForBookingChanges();
  console.log('✅ Notification system initialized successfully');
}

export async function createBookingNotifications(type, bookingRecord, latestBooking) {
  if (type === 'parking') {
    return await createParkingBookingNotifications(bookingRecord, latestBooking);
  } else if (type === 'seating') {
    return await createSeatingBookingNotifications(bookingRecord, latestBooking);
  } else {
    throw new Error(`Unknown booking type: ${type}`);
  }
}

// export async function createCancellationNotifications({ userId, slotNumber, floor, type, date, bookingId }) {
//   try {
//     console.log(`🚫 Creating cancellation notifications for ${type} booking`);
    
//     // Find the user
//     const user = await User.findById(userId);
//     if (!user) {
//       throw new Error('User not found');
//     }

//     // Check user's notification preferences
//     const preferences = user.notificationPreferences || {};
    
//     // Create notification for the user
//     const userNotification = new Notification({
//       recipients: [user._id],
//       title: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancelled`,
//       message: `Your ${type === 'parking' ? 'parking slot' : 'seat'} ${slotNumber} on Floor ${floor} booking for ${date} has been cancelled.`,
//       type: `${type}_cancellation`,
//       bookingId: bookingId
//     });
    
//     await userNotification.save();
//     console.log(`✅ Cancellation notification created for user ${user.username}`);

//     // Send email to user if preferences allow
//     if (user.email && preferences.email && preferences.cancellationAlert) {
//       try {
//         await sendEmail({
//           to: user.email,
//           subject: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancellation`,
//           message: userNotification.message
//         });
//         console.log(`📧 Cancellation email sent to user: ${user.email}`);
//       } catch (emailError) {
//         console.error('❌ Failed to send cancellation email to user:', emailError);
//       }
//     }

//     // Create notifications for all admins
//     const admins = await User.find({ role: 'admin' });
//     const adminNotifications = [];
    
//     for (const admin of admins) {
//       const adminNotification = new Notification({
//         recipients: [admin._id],
//         title: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancelled`,
//         message: `${user.firstName} ${user.lastName} (${user.username}) has cancelled their ${type === 'parking' ? 'parking slot' : 'seat'} ${slotNumber} on Floor ${floor} booking for ${date}.`,
//         type: 'important'
//       });
      
//       await adminNotification.save();
//       adminNotifications.push(adminNotification);

//       // Send email to admin if preferences allow
//       const adminPreferences = admin.notificationPreferences || {};
//       if (admin.email && adminPreferences.email && adminPreferences.adminUpdates) {
//         try {
//           await sendEmail({
//             to: admin.email,
//             subject: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancellation - Admin Alert`,
//             message: adminNotification.message
//           });
//           console.log(`📧 Cancellation admin email sent to: ${admin.email}`);
//         } catch (emailError) {
//           console.error('❌ Failed to send cancellation email to admin:', emailError);
//         }
//       }
//     }

//     console.log(`✅ Created cancellation notifications: 1 user, ${adminNotifications.length} admins`);
//     return { userNotification, adminNotifications };
    
//   } catch (error) {
//     console.error('❌ Error creating cancellation notifications:', error);
//     throw error;
//   }
// }
async function createCancellationNotifications({ userId, slotNumber, floor, type, date, bookingId }) {
  try {
    console.log(`🚫 Creating cancellation notifications for ${type} booking`);

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      console.error(`❌ User not found for userId: ${userId}`);
      throw new Error('User not found');
    }

    const preferences = user.notificationPreferences || {};

    // USER NOTIFICATION
    const userNotification = new Notification({
      recipients: [user._id],
      title: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancelled`,
      message: `Your ${type === 'parking' ? 'parking slot' : 'seat'} ${slotNumber} on Floor ${floor} booking for ${date} has been cancelled.`,
      type: `${type}_cancellation`,
      bookingId: bookingId
    });
    await userNotification.save();
    console.log(`✅ Cancellation notification created for user ${user.username}`);

    if (user.email && preferences.email && preferences.cancellationAlert) {
      try {
        await sendEmail({
          to: user.email,
          subject: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancellation`,
          message: userNotification.message
        });
        console.log(`📧 Cancellation email sent to user: ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send cancellation email to user ${user.email}: ${emailError.message}`);
      }
    } else {
      console.warn(`⚠️ Email not sent to user ${user.email}: email=${user.email}, preferences.email=${preferences.email}, preferences.cancellationAlert=${preferences.cancellationAlert}`);
    }

    // ADMIN NOTIFICATION
    const admins = await User.find({ role: 'admin' });
    const adminIds = admins.map(admin => admin._id);

    const adminNotification = new Notification({
      recipients: adminIds,
      title: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancelled`,
      message: `${user.firstName} ${user.lastName} (${user.username}) has cancelled their ${type === 'parking' ? 'parking slot' : 'seat'} ${slotNumber} on Floor ${floor} booking for ${date}.`,
      type: 'important'
    });
    await adminNotification.save();
    console.log(`✅ Single admin notification saved with recipients: ${adminIds.length}`);

    // Send email to designated admin
    const designatedAdminEmail = process.env.DESIGNATED_ADMIN_EMAIL || 'realadmin@example.com';
    try {
      await sendEmail({
        to: designatedAdminEmail,
        subject: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancellation - Admin Alert`,
        message: adminNotification.message
      });
      console.log(`📧 Cancellation admin email sent to: ${designatedAdminEmail}`);
    } catch (emailError) {
      console.error(`❌ Failed to send cancellation email to admin ${designatedAdminEmail}: ${emailError.message}`);
    }

    return { userNotification, adminNotification };
  } catch (error) {
    console.error('❌ Error creating cancellation notifications:', error);
    throw error;
  }
}



export async function generateNotificationsForPastBookings() {
  console.log('🔄 Generating notifications for all bookings...');

  let createdCount = 0;

  // 1. === PARKING BOOKINGS ===
  console.log('🚗 Processing parking bookings...');
  const parkingSlots = await ParkingSlot.find();
  console.log(`📊 Found ${parkingSlots.length} parking slots`);

  for (const slot of parkingSlots) {
    console.log(`📍 Processing slot ${slot.slotNumber} on floor ${slot.floor} with ${slot.bookings.length} bookings`);
    for (const booking of slot.bookings) {
      const user = await User.findOne({ username: new RegExp(`^${booking.userName}$`, 'i') });
      if (!user) {
        console.warn(`⚠️ Skipping parking booking: user '${booking.userName}' not found for slot ${slot.slotNumber}`);
        continue;
      }
      console.log(`✅ Creating notification for parking booking: user ${user.username}, slot ${slot.slotNumber}, date ${booking.date}`);
      await createBookingNotifications('parking', slot, booking);
      createdCount++;
    }
  }

  // 2. === SEATING BOOKINGS ===
  console.log('🪑 Processing seating bookings...');
  const seatingBookings = await SeatingSlots.find();
  console.log(`📊 Found ${seatingBookings.length} seating records`);

  for (const seatingRecord of seatingBookings) {
    console.log(`📍 Processing seating record for user ${seatingRecord.userName} with ${seatingRecord.bookings.length} bookings`);
    for (const booking of seatingRecord.bookings) {
      const user = await User.findOne({ username: new RegExp(`^${seatingRecord.userName}$`, 'i') });
      if (!user) {
        console.warn(`⚠️ Skipping seating booking: user '${seatingRecord.userName}' not found for seat ${booking.seatId}`);
        continue;
      }
      console.log(`✅ Creating notification for seating booking: user ${user.username}, seat ${booking.seatId}, date ${booking.date}`);
      await createBookingNotifications('seating', seatingRecord, booking);
      createdCount++;
    }
  }

  console.log(`✅ Finished generating ${createdCount} booking notifications`);
  return createdCount;
}


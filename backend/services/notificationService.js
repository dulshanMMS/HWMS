


// import Notification from '../models/Notification.js';
// import ParkingSlot from '../models/ParkingSlots.js';
// import SeatingSlots from '../models/SeatingSlots.js';
// import User from '../models/User.js';
// import Announcement from '../models/Announcement.js';
// import sendEmail from './emailService.js';
// import cron from 'node-cron';

// // Track processed booking IDs to prevent duplicates
// const processedBookingIds = new Set();

// // Unread count
// export async function getUnreadNotificationCount(userId) {
//   return Notification.countDocuments({ 
//     recipients: { $in: [userId] }, 
//     read: false, 
//     deleted: false 
//   });
// }

// export async function getAdminUnreadCount() {
//   return Notification.countDocuments({ type: 'important', read: false, deleted: false });
// }

// // Mark as read
// export async function markAsRead(notificationId, userId) {
//   const notification = await Notification.findById(notificationId);
//   if (!notification) throw new Error('Notification not found');
  
//   if (!notification.recipients.map(r => r.toString()).includes(userId)) {
//     throw new Error('Not authorized');
//   }
  
//   notification.read = true;
//   return notification.save();
// }

// // Mark as unread
// export async function markAsUnread(notificationId, userId) {
//   const notification = await Notification.findById(notificationId);
//   if (!notification) throw new Error('Notification not found');
  
//   if (!notification.recipients.map(r => r.toString()).includes(userId)) {
//     throw new Error('Not authorized');
//   }
  
//   notification.read = false;
//   return notification.save();
// }

// // Mark all as read
// export async function markAllAsRead(userId) {
//   return Notification.updateMany({ 
//     recipients: { $in: [userId] }, 
//     read: false, 
//     deleted: false 
//   }, { read: true });
// }

// // Delete (soft)
// export async function deleteNotification(notificationId, userId) {
//   const notification = await Notification.findById(notificationId);
//   if (!notification) throw new Error('Notification not found');
  
//   if (!notification.recipients.map(r => r.toString()).includes(userId)) {
//     throw new Error('Not authorized');
//   }
  
//   notification.deleted = true;
//   return notification.save();
// }

// // Fetch notifications
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
//       query = { deleted: false, $or: [{ recipients: userId }, { type: 'important' }] };
//     } else {
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

// // Manual notification creation
// export async function sendNotification({ recipients, title, message, type, emailSubject }) {
//   const recipientArray = Array.isArray(recipients) ? recipients : [recipients];
  
//   const notification = new Notification({ 
//     recipients: recipientArray, 
//     title, 
//     message, 
//     type 
//   });
//   await notification.save();

//   if (emailSubject) {
//     if (type === 'important') {
//       const admins = await User.find({ role: 'admin' });
//       for (const admin of admins) {
//         const preferences = admin.notificationPreferences || {};
//         if (admin.email && preferences.adminAnnouncements?.email) {
//           try {
//             await sendEmail({
//               to: admin.email,
//               subject: emailSubject,
//               message
//             });
//             console.log(`📧 Admin email sent to: ${admin.email}`);
//           } catch (emailError) {
//             console.error(`❌ Failed to send email to admin ${admin.email}: ${emailError.message}`);
//           }
//         }
//       }
//     } else {
//       const users = await User.find({ _id: { $in: recipientArray } });
//       for (const user of users) {
//         const preferences = user.notificationPreferences || {};
//         if (user.email && preferences[type]?.email) {
//           try {
//             await sendEmail({
//               to: user.email,
//               subject: emailSubject,
//               message
//             });
//             console.log(`📧 Email sent to user: ${user.email}`);
//           } catch (emailError) {
//             console.error(`❌ Failed to send email to user ${user.email}: ${emailError.message}`);
//           }
//         }
//       }
//     }
//   }

//   return notification;
// }

// // Bulk notification creation
// export async function sendBulkNotifications({ recipients, title, message, type, emailSubject }) {
//   const savedNotifications = [];

//   for (const recipient of recipients) {
//     const user = await User.findById(recipient);
//     const preferences = user?.notificationPreferences || {};
//     if (preferences[type]?.inApp || type === 'important') {
//       const notification = new Notification({
//         recipients: [recipient],
//         title,
//         message,
//         type
//       });
//       const saved = await notification.save();
//       savedNotifications.push(saved);
//     }
//   }

//   if (emailSubject) {
//     if (type === 'important') {
//       const admins = await User.find({ role: 'admin' });
//       for (const admin of admins) {
//         const preferences = admin.notificationPreferences || {};
//         if (admin.email && preferences.adminAnnouncements?.email) {
//           try {
//             await sendEmail({
//               to: admin.email,
//               subject: emailSubject,
//               message
//             });
//             console.log(`📧 Admin email sent to: ${admin.email}`);
//           } catch (emailError) {
//             console.error(`❌ Failed to send email to admin ${admin.email}: ${emailError.message}`);
//           }
//         }
//       }
//     } else {
//       const users = await User.find({ _id: { $in: recipients } });
//       for (const user of users) {
//         const preferences = user.notificationPreferences || {};
//         if (user.email && preferences[type]?.email) {
//           try {
//             await sendEmail({
//               to: user.email,
//               subject: emailSubject,
//               message
//             });
//             console.log(`📧 Email sent to user: ${user.email}`);
//           } catch (emailError) {
//             console.error(`❌ Failed to send email to user ${user.email}: ${emailError.message}`);
//           }
//         }
//       }
//     }
//   }

//   console.log(`✅ Saved ${savedNotifications.length} notifications`);
//   return savedNotifications;
// }

// // Parking booking notifications
// async function createParkingBookingNotifications(parkingSlot, latestBooking) {
//   try {
//     console.log(`🚗 Processing parking booking: ${latestBooking.userName} -> Slot ${parkingSlot.slotNumber}`);

//     const bookingId = `${parkingSlot._id}-${latestBooking.date}-${latestBooking.entryTime}`;
//     if (processedBookingIds.has(bookingId)) {
//       console.log(`🚗 Booking ${bookingId} already processed, skipping...`);
//       return null;
//     }

//     const user = await User.findOne({ username: new RegExp(`^${latestBooking.userName}$`, 'i') });
//     if (!user) {
//       console.error(`❌ User not found: ${latestBooking.userName}`);
//       throw new Error(`User not found: ${latestBooking.userName}`);
//     }

//     const preferences = user.notificationPreferences || {};
//     console.log(`📋 User preferences: ${JSON.stringify(preferences)}`);

//     let userNotification = null;
//     if (preferences.bookingConfirmation?.inApp) {
//       userNotification = new Notification({
//         recipients: [user._id],
//         title: 'Parking Booking Confirmed',
//         message: `Your parking slot ${parkingSlot.slotNumber} on Floor ${parkingSlot.floor} has been booked for ${latestBooking.date} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
//         type: 'parking_booking',
//         bookingId: null
//       });
//       await userNotification.save();
//       console.log(`✅ User notification created for ${user.username}`);
//     }

//     if (user.email && preferences.bookingConfirmation?.email) {
//       try {
//         await sendEmail({
//           to: user.email,
//           subject: 'Parking Booking Confirmation',
//           message: `Your parking slot ${parkingSlot.slotNumber} on Floor ${parkingSlot.floor} has been booked for ${latestBooking.date} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`
//         });
//         console.log(`📧 Email sent to user: ${user.email}`);
//       } catch (emailError) {
//         console.error(`❌ Failed to send email to user ${user.email}: ${emailError.message}`);
//       }
//     }

//     const admins = await User.find({ role: 'admin' });
//     const adminIds = admins.map(admin => admin._id);
//     let adminNotification = null;
//     if (admins.some(admin => admin.notificationPreferences?.adminAnnouncements?.inApp)) {
//       adminNotification = new Notification({
//         recipients: adminIds,
//         title: 'New Parking Booking Alert',
//         message: `${user.firstName} ${user.lastName} (${user.username}) has booked parking slot ${parkingSlot.slotNumber} on Floor ${parkingSlot.floor} for ${latestBooking.date} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
//         type: 'important'
//       });
//       await adminNotification.save();
//       console.log(`✅ Single admin notification saved with recipients: ${adminIds.length}`);
//     }

//     const adminEmails = admins.filter(admin => admin.email && admin.notificationPreferences?.adminAnnouncements?.email);
//     for (const admin of adminEmails) {
//       try {
//         await sendEmail({
//           to: admin.email,
//           subject: 'New Parking Booking - Admin Alert',
//           message: `${user.firstName} ${user.lastName} (${user.username}) has booked parking slot ${parkingSlot.slotNumber} on Floor ${parkingSlot.floor} for ${latestBooking.date} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`
//         });
//         console.log(`📧 Admin email sent to: ${admin.email}`);
//       } catch (emailError) {
//         console.error(`❌ Failed to send email to admin ${admin.email}: ${emailError.message}`);
//       }
//     }

//     processedBookingIds.add(bookingId);
//     console.log(`✅ Booking ${bookingId} marked as processed`);

//     return { userNotification, adminNotification };
//   } catch (error) {
//     console.error('❌ Error creating parking booking notifications:', error);
//     throw error;
//   }
// }

// // Seating booking notifications
// async function createSeatingBookingNotifications(seatingRecord, latestBooking) {
//   try {
//     console.log(`🪑 Processing seating booking: ${seatingRecord.userName} -> Seat ${latestBooking.seatId}`);

//     const bookingId = `${seatingRecord._id}-${latestBooking.date}-${latestBooking.entryTime}`;
//     if (processedBookingIds.has(bookingId)) {
//       console.log(`🪑 Booking ${bookingId} already processed, skipping...`);
//       return null;
//     }

//     const user = await User.findOne({ username: new RegExp(`^${seatingRecord.userName}$`, 'i') });
//     if (!user) {
//       console.error(`❌ User not found: ${seatingRecord.userName}`);
//       throw new Error(`User not found: ${seatingRecord.userName}`);
//     }

//     const preferences = user.notificationPreferences || {};
//     const bookingDate = new Date(latestBooking.date).toLocaleDateString();

//     let userNotification = null;
//     if (preferences.bookingConfirmation?.inApp) {
//       userNotification = new Notification({
//         recipients: [user._id],
//         title: 'Seat Booking Confirmed',
//         message: `Your seat ${latestBooking.seatId} on Floor ${latestBooking.floor} has been booked for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
//         type: 'seat_booking',
//         bookingId: null
//       });
//       await userNotification.save();
//       console.log(`✅ User notification created for ${user.username}`);
//     }

//     if (user.email && preferences.bookingConfirmation?.email) {
//       try {
//         await sendEmail({
//           to: user.email,
//           subject: 'Seat Booking Confirmation',
//           message: `Your seat ${latestBooking.seatId} on Floor ${latestBooking.floor} has been booked for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`
//         });
//         console.log(`📧 Email sent to user: ${user.email}`);
//       } catch (emailError) {
//         console.error(`❌ Failed to send email to user ${user.email}: ${emailError.message}`);
//       }
//     }

//     const admins = await User.find({ role: 'admin' });
//     const adminIds = admins.map(admin => admin._id);
//     let adminNotification = null;
//     if (admins.some(admin => admin.notificationPreferences?.adminAnnouncements?.inApp)) {
//       adminNotification = new Notification({
//         recipients: adminIds,
//         title: 'New Seat Booking Alert',
//         message: `${user.firstName} ${user.lastName} (${user.username}) has booked seat ${latestBooking.seatId} on Floor ${latestBooking.floor} for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
//         type: 'important'
//       });
//       await adminNotification.save();
//       console.log(`✅ Single admin notification saved with recipients: ${adminIds.length}`);
//     }

//     const adminEmails = admins.filter(admin => admin.email && admin.notificationPreferences?.adminAnnouncements?.email);
//     for (const admin of adminEmails) {
//       try {
//         await sendEmail({
//           to: admin.email,
//           subject: 'New Seat Booking - Admin Alert',
//           message: `${user.firstName} ${user.lastName} (${user.username}) has booked seat ${latestBooking.seatId} on Floor ${latestBooking.floor} for ${bookingDate} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`
//         });
//         console.log(`📧 Admin email sent to: ${admin.email}`);
//       } catch (emailError) {
//         console.error(`❌ Failed to send email to admin ${admin.email}: ${emailError.message}`);
//       }
//     }

//     processedBookingIds.add(bookingId);
//     console.log(`✅ Booking ${bookingId} marked as processed`);

//     return { userNotification, adminNotification };
//   } catch (error) {
//     console.error('❌ Error creating seating booking notifications:', error);
//     throw error;
//   }
// }

// // Booking reminder emails
// export async function sendBookingReminderEmails() {
//   try {
//     console.log('⏰ Sending booking reminder emails...');
//     const tomorrow = new Date();
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     tomorrow.setHours(0, 0, 0, 0);
//     const tomorrowEnd = new Date(tomorrow);
//     tomorrowEnd.setHours(23, 59, 59, 999);

//     // Parking bookings
//     const parkingSlots = await ParkingSlot.find({
//       'bookings.date': {
//         $gte: tomorrow.toISOString().split('T')[0],
//         $lte: tomorrowEnd.toISOString().split('T')[0]
//       }
//     });

//     for (const slot of parkingSlots) {
//       for (const booking of slot.bookings) {
//         if (booking.date === tomorrow.toISOString().split('T')[0]) {
//           const user = await User.findOne({ username: new RegExp(`^${booking.userName}$`, 'i') });
//           if (!user) {
//             console.warn(`⚠️ User not found for parking booking: ${booking.userName}`);
//             continue;
//           }
//           const preferences = user.notificationPreferences || {};
//           if (user.email && preferences.bookingReminder?.email) {
//             try {
//               await sendEmail({
//                 to: user.email,
//                 subject: 'Parking Booking Reminder',
//                 message: `Reminder: Your parking slot ${slot.slotNumber} on Floor ${slot.floor} is booked for tomorrow, ${booking.date}, from ${booking.entryTime} to ${booking.exitTime}`
//               });
//               console.log(`📧 Reminder email sent to user: ${user.email}`);
//             } catch (emailError) {
//               console.error(`❌ Failed to send reminder email to user ${user.email}: ${emailError.message}`);
//             }
//           }
//         }
//       }
//     }

//     // Seating bookings
//     const seatingRecords = await SeatingSlots.find({
//       'bookings.date': {
//         $gte: tomorrow,
//         $lte: tomorrowEnd
//       }
//     });

//     for (const record of seatingRecords) {
//       for (const booking of record.bookings) {
//         const bookingDate = new Date(booking.date).toDateString();
//         if (bookingDate === tomorrow.toDateString()) {
//           const user = await User.findOne({ username: new RegExp(`^${record.userName}$`, 'i') });
//           if (!user) {
//             console.warn(`⚠️ User not found for seating booking: ${record.userName}`);
//             continue;
//           }
//           const preferences = user.notificationPreferences || {};
//           if (user.email && preferences.bookingReminder?.email) {
//             try {
//               await sendEmail({
//                 to: user.email,
//                 subject: 'Seat Booking Reminder',
//                 message: `Reminder: Your seat ${booking.seatId} on Floor ${booking.floor} is booked for tomorrow, ${bookingDate}, from ${booking.entryTime} to ${booking.exitTime}`
//               });
//               console.log(`📧 Reminder email sent to user: ${user.email}`);
//             } catch (emailError) {
//               console.error(`❌ Failed to send reminder email to user ${user.email}: ${emailError.message}`);
//             }
//           }
//         }
//       }
//     }

//     console.log('✅ Finished sending booking reminder emails');
//   } catch (error) {
//     console.error('❌ Error sending booking reminder emails:', error);
//     throw error;
//   }
// }

// // Announcement notifications
// async function createAnnouncementNotifications(announcement) {
//   try {
//     console.log(`📢 Processing announcement: ${announcement.message}`);

//     const users = await User.find({});
//     const userIds = users.map(user => user._id);
//     let notification = null;

//     if (users.some(user => user.notificationPreferences?.adminAnnouncements?.inApp)) {
//       notification = new Notification({
//         recipients: userIds,
//         title: 'Admin Announcement',
//         message: announcement.message,
//         type: 'admin_announcement',
//         bookingId: null
//       });
//       await notification.save();
//       console.log(`✅ Announcement notification created for ${userIds.length} users`);
//     }

//     for (const user of users) {
//       const preferences = user.notificationPreferences || {};
//       if (user.email && preferences.adminAnnouncements?.email) {
//         try {
//           await sendEmail({
//             to: user.email,
//             subject: 'Admin Announcement',
//             message: announcement.message
//           });
//           console.log(`📧 Announcement email sent to: ${user.email}`);
//         } catch (emailError) {
//           console.error(`❌ Failed to send announcement email to ${user.email}: ${emailError.message}`);
//         }
//       }
//     }

//     return notification;
//   } catch (error) {
//     console.error('❌ Error creating announcement notifications:', error);
//     throw error;
//   }
// }

// // Cancellation notifications
// async function createCancellationNotifications({ userId, slotNumber, floor, type, date, bookingId }) {
//   try {
//     console.log(`🚫 Creating cancellation notifications for ${type} booking`);

//     const user = await User.findById(userId);
//     if (!user) {
//       console.error(`❌ User not found for userId: ${userId}`);
//       throw new Error('User not found');
//     }

//     const preferences = user.notificationPreferences || {};
//     const bookingDate = new Date(date).toLocaleDateString();

//     let userNotification = null;
//     if (preferences.cancellationAlert?.inApp) {
//       userNotification = new Notification({
//         recipients: [user._id],
//         title: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancelled`,
//         message: `Your ${type === 'parking' ? 'parking slot' : 'seat'} ${slotNumber} on Floor ${floor} booking for ${bookingDate} has been cancelled.`,
//         type: `${type}_cancellation`,
//         bookingId
//       });
//       await userNotification.save();
//       console.log(`✅ Cancellation notification created for user ${user.username}`);
//     }

//     if (user.email && preferences.cancellationAlert?.email) {
//       try {
//         await sendEmail({
//           to: user.email,
//           subject: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancellation`,
//           message: `Your ${type === 'parking' ? 'parking slot' : 'seat'} ${slotNumber} on Floor ${floor} booking for ${bookingDate} has been cancelled.`
//         });
//         console.log(`📧 Cancellation email sent to user: ${user.email}`);
//       } catch (emailError) {
//         console.error(`❌ Failed to send cancellation email to user ${user.email}: ${emailError.message}`);
//       }
//     }

//     const admins = await User.find({ role: 'admin' });
//     const adminIds = admins.map(admin => admin._id);
//     let adminNotification = null;
//     if (admins.some(admin => admin.notificationPreferences?.adminAnnouncements?.inApp)) {
//       adminNotification = new Notification({
//         recipients: adminIds,
//         title: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancelled`,
//         message: `${user.firstName} ${user.lastName} (${user.username}) has cancelled their ${type === 'parking' ? 'parking slot' : 'seat'} ${slotNumber} on Floor ${floor} booking for ${bookingDate}.`,
//         type: 'important',
//         bookingId
//       });
//       await adminNotification.save();
//       console.log(`✅ Single admin notification saved with recipients: ${adminIds.length}`);
//     }

//     const adminEmails = admins.filter(admin => admin.email && admin.notificationPreferences?.adminAnnouncements?.email);
//     for (const admin of adminEmails) {
//       try {
//         await sendEmail({
//           to: admin.email,
//           subject: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancellation - Admin Alert`,
//           message: `${user.firstName} ${user.lastName} (${user.username}) has cancelled their ${type === 'parking' ? 'parking slot' : 'seat'} ${slotNumber} on Floor ${floor} booking for ${bookingDate}.`
//         });
//         console.log(`📧 Cancellation admin email sent to: ${admin.email}`);
//       } catch (emailError) {
//         console.error(`❌ Failed to send cancellation email to admin ${admin.email}: ${emailError.message}`);
//       }
//     }

//     return { userNotification, adminNotification };
//   } catch (error) {
//     console.error('❌ Error creating cancellation notifications:', error);
//     throw error;
//   }
// }

// // Booking change listener
// export function listenForBookingChanges() {
//   console.log('🔄 Starting enhanced database change listeners...');

//   const parkingStream = ParkingSlot.watch([
//     {
//       $match: { $or: [{ operationType: 'insert' }, { operationType: 'update' }] }
//     }
//   ], { fullDocument: 'updateLookup', fullDocumentBeforeChange: 'whenAvailable' });

//   parkingStream.on('change', async (change) => {
//     try {
//       console.log('🚗 ParkingSlot change event received:', JSON.stringify(change));
//       if (change.operationType === 'update') {
//         const slotId = change.documentKey._id;
//         const parkingSlot = await ParkingSlot.findById(slotId);
//         console.log('🚗 ParkingSlot fetched:', parkingSlot ? parkingSlot.bookings.length : 'null');

//         if (parkingSlot) {
//           const previousBookings = change.fullDocumentBeforeChange?.bookings || [];
//           const currentBookings = parkingSlot.bookings || [];
//           const previousLength = previousBookings.length;
//           const currentLength = currentBookings.length;
//           console.log('🚗 Bookings: previous=', previousLength, 'current=', currentLength);

//           if (currentLength > previousLength) {
//             const latestBooking = currentBookings[currentBookings.length - 1];
//             const bookingId = `${parkingSlot._id}-${latestBooking.date}-${latestBooking.entryTime}`;
//             if (processedBookingIds.has(bookingId)) {
//               console.log(`🚗 Booking ${bookingId} already processed, skipping...`);
//               return;
//             }
//             console.log('📍 New parking booking detected, creating notifications...', latestBooking);
//             await createParkingBookingNotifications(parkingSlot, latestBooking);
//           } else if (currentLength < previousLength) {
//             const removedBookings = previousBookings.filter(pb => 
//               !currentBookings.some(cb => 
//                 cb.userName === pb.userName && 
//                 cb.date === pb.date && 
//                 cb.entryTime === pb.entryTime
//               )
//             );
//             for (const booking of removedBookings) {
//               const user = await User.findOne({ username: new RegExp(`^${booking.userName}$`, 'i') });
//               if (user) {
//                 console.log(`🚫 Cancellation detected for parking booking: ${booking.userName}`);
//                 await createCancellationNotifications({
//                   userId: user._id,
//                   slotNumber: parkingSlot.slotNumber,
//                   floor: parkingSlot.floor,
//                   type: 'parking',
//                   date: booking.date,
//                   bookingId: `${parkingSlot._id}-${booking.date}-${booking.entryTime}`
//                 });
//               }
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error processing parking slot change:', error);
//     }
//   });

//   const seatingStream = SeatingSlots.watch([
//     {
//       $match: { $or: [{ operationType: 'insert' }, { operationType: 'update' }] }
//     }
//   ], { fullDocument: 'updateLookup', fullDocumentBeforeChange: 'whenAvailable' });

//   seatingStream.on('change', async (change) => {
//     try {
//       console.log('🪑 SeatingSlots change event received:', JSON.stringify(change));
//       if (change.operationType === 'update') {
//         const recordId = change.documentKey._id;
//         const seatingRecord = await SeatingSlots.findById(recordId);
//         console.log('🪑 SeatingRecord fetched:', seatingRecord ? seatingRecord.bookings.length : 'null');

//         if (seatingRecord) {
//           const previousBookings = change.fullDocumentBeforeChange?.bookings || [];
//           const currentBookings = seatingRecord.bookings || [];
//           const previousLength = previousBookings.length;
//           const currentLength = currentBookings.length;
//           console.log('🪑 Bookings: previous=', previousLength, 'current=', currentLength);

//           if (currentLength > previousLength) {
//             const latestBooking = currentBookings[currentBookings.length - 1];
//             const bookingId = `${seatingRecord._id}-${latestBooking.date}-${latestBooking.entryTime}`;
//             if (processedBookingIds.has(bookingId)) {
//               console.log(`🪑 Booking ${bookingId} already processed, skipping...`);
//               return;
//             }
//             console.log('📍 New seating booking detected, creating notifications...', latestBooking);
//             await createSeatingBookingNotifications(seatingRecord, latestBooking);
//           } else if (currentLength < previousLength) {
//             const removedBookings = previousBookings.filter(pb => 
//               !currentBookings.some(cb => 
//                 cb.seatId === pb.seatId && 
//                 cb.date.toISOString() === pb.date.toISOString() && 
//                 cb.entryTime === pb.entryTime
//               )
//             );
//             for (const booking of removedBookings) {
//               const user = await User.findOne({ username: new RegExp(`^${seatingRecord.userName}$`, 'i') });
//               if (user) {
//                 console.log(`🚫 Cancellation detected for seating booking: ${seatingRecord.userName}`);
//                 await createCancellationNotifications({
//                   userId: user._id,
//                   slotNumber: booking.seatId,
//                   floor: booking.floor,
//                   type: 'seating',
//                   date: booking.date,
//                   bookingId: `${seatingRecord._id}-${booking.date}-${booking.entryTime}`
//                 });
//               }
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error processing seating slot change:', error);
//     }
//   });

//   const announcementStream = Announcement.watch([
//     {
//       $match: { operationType: 'insert' }
//     }
//   ], { fullDocument: 'updateLookup' });

//   announcementStream.on('change', async (change) => {
//     try {
//       console.log('📢 Announcement change event received:', JSON.stringify(change));
//       if (change.operationType === 'insert') {
//         const announcement = change.fullDocument;
//         console.log('📢 New announcement detected:', announcement.message);
//         await createAnnouncementNotifications(announcement);
//       }
//     } catch (error) {
//       console.error('❌ Error processing announcement change:', error);
//     }
//   });
// }

// // Notification preferences
// export async function getNotificationPreferences(userId) {
//   try {
//     const user = await User.findById(userId).select('notificationPreferences');
    
//     if (!user) {
//       throw new Error('User not found');
//     }
    
//     return user.notificationPreferences || {
//       bookingConfirmation: { email: true, inApp: true },
//       cancellationAlert: { email: true, inApp: true },
//       adminAnnouncements: { email: true, inApp: true },
//       bookingReminder: { email: true, inApp: true }
//     };
//   } catch (error) {
//     console.error('Error in getNotificationPreferences service:', error);
//     throw error;
//   }
// }

// export async function updateNotificationPreferences(userId, preferences) {
//   try {
//     const user = await User.findByIdAndUpdate(
//       userId,
//       { 
//         notificationPreferences: {
//           ...preferences,
//           bookingReminder: { ...preferences.bookingReminder, inApp: true }
//         }
//       },
//       { new: true }
//     ).select('notificationPreferences');
    
//     if (!user) {
//       throw new Error('User not found');
//     }
    
//     return user.notificationPreferences;
//   } catch (error) {
//     console.error('Error in updateNotificationPreferences service:', error);
//     throw error;
//   }
// }

// // Initialize notification system
// export function initializeNotificationSystem() {
//   console.log('🚀 Initializing notification system...');
//   listenForBookingChanges();
//   cron.schedule('0 8 * * *', () => {
//     console.log('⏰ Running daily booking reminder email job...');
//     sendBookingReminderEmails();
//   }, {
//     timezone: 'Asia/Kolkata'
//   });
//   console.log('✅ Notification system initialized successfully');
// }

// // Create booking notifications
// export async function createBookingNotifications(type, bookingRecord, latestBooking) {
//   if (type === 'parking') {
//     return await createParkingBookingNotifications(bookingRecord, latestBooking);
//   } else if (type === 'seating') {
//     return await createSeatingBookingNotifications(bookingRecord, latestBooking);
//   } else {
//     throw new Error(`Unknown booking type: ${type}`);
//   }
// }

// // Generate notifications for past bookings
// export async function generateNotificationsForPastBookings() {
//   console.log('🔄 Generating notifications for all bookings...');

//   let createdCount = 0;

//   console.log('🚗 Processing parking bookings...');
//   const parkingSlots = await ParkingSlot.find();
//   console.log(`📊 Found ${parkingSlots.length} parking slots`);

//   for (const slot of parkingSlots) {
//     console.log(`📍 Processing slot ${slot.slotNumber} on floor ${slot.floor} with ${slot.bookings.length} bookings`);
//     for (const booking of slot.bookings) {
//       const bookingId = `${slot._id}-${booking.date}-${booking.entryTime}`;
//       if (processedBookingIds.has(bookingId)) {
//         console.log(`🚗 Booking ${bookingId} already processed, skipping...`);
//         continue;
//       }
//       const user = await User.findOne({ username: new RegExp(`^${booking.userName}$`, 'i') });
//       if (!user) {
//         console.warn(`⚠️ Skipping parking booking: user '${booking.userName}' not found for slot ${slot.slotNumber}`);
//         continue;
//       }
//       console.log(`✅ Creating notification for parking booking: user ${user.username}, slot ${slot.slotNumber}, date ${booking.date}`);
//       await createBookingNotifications('parking', slot, booking);
//       processedBookingIds.add(bookingId);
//       createdCount++;
//     }
//   }

//   console.log('🪑 Processing seating bookings...');
//   const seatingBookings = await SeatingSlots.find();
//   console.log(`📊 Found ${seatingBookings.length} seating records`);

//   for (const seatingRecord of seatingBookings) {
//     console.log(`📍 Processing seating record for user ${seatingRecord.userName} with ${seatingRecord.bookings.length} bookings`);
//     for (const booking of seatingRecord.bookings) {
//       const bookingId = `${seatingRecord._id}-${booking.date}-${booking.entryTime}`;
//       if (processedBookingIds.has(bookingId)) {
//         console.log(`🪑 Booking ${bookingId} already processed, skipping...`);
//         continue;
//       }
//       const user = await User.findOne({ username: new RegExp(`^${seatingRecord.userName}$`, 'i') });
//       if (!user) {
//         console.warn(`⚠️ Skipping seating booking: user '${seatingRecord.userName}' not found for seat ${booking.seatId}`);
//         continue;
//       }
//       console.log(`✅ Creating notification for seating booking: user ${user.username}, seat ${booking.seatId}, date ${booking.date}`);
//       await createBookingNotifications('seating', seatingRecord, booking);
//       processedBookingIds.add(bookingId);
//       createdCount++;
//     }
//   }

//   console.log(`✅ Finished generating ${createdCount} booking notifications`);
//   return createdCount;
// }

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
  
  if (!notification.recipients.map(r => r.toString()).includes(userId)) {
    throw new Error('Not authorized');
  }
  
  notification.read = false;
  return notification.save();
}

// Mark all as read
export async function markAllAsRead(userId) {
  return Notification.updateMany({ 
    recipients: { $in: [userId] }, 
    read: false, 
    deleted: false 
  }, { read: true });
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
      query = { 
        deleted: false, 
        $or: [
          { recipients: userId }, 
          { type: 'important' }
        ]
      };
    } else {
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
    console.log('Notifications:', JSON.stringify(notifications, null, 2));

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

// Manual notification creation
export async function sendNotification({ recipients, title, message, type, emailSubject }) {
  const recipientArray = Array.isArray(recipients) ? recipients : [recipients];
  
  const notifications = [];
  for (const recipient of recipientArray) {
    const user = await User.findById(recipient);
    if (!user) {
      console.warn(`⚠️ Skipping notification for recipient ${recipient}: user not found`);
      continue;
    }
    const preferences = user.notificationPreferences || {};
    if (type === 'admin_announcement' ? preferences.adminAnnouncements?.inApp === true : preferences[type]?.inApp === true || type === 'important') {
      const notification = new Notification({ 
        recipients: [recipient], 
        title, 
        message, 
        type 
      });
      await notification.save();
      notifications.push(notification);
      console.log(`✅ Notification created for ${user.username}: ${notification._id}`);
    } else {
      console.log(`⛔ In-app notification skipped for ${user.username} due to preferences: ${JSON.stringify(preferences)}`);
    }
  }

  if (emailSubject) {
    if (type === 'important') {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        const preferences = admin.notificationPreferences || {};
        if (admin.email && preferences.adminAnnouncements?.email) {
          try {
            await sendEmail({
              to: admin.email,
              subject: emailSubject,
              message
            });
            console.log(`📧 Admin email sent to: ${admin.email}`);
          } catch (emailError) {
            console.error(`❌ Failed to send email to admin ${admin.email}: ${emailError.message}`);
          }
        } else {
          console.log(`⛔ Email not sent to admin ${admin.email || 'no email'}: adminAnnouncements.email=${preferences.adminAnnouncements?.email}`);
        }
      }
    } else {
      const users = await User.find({ _id: { $in: recipientArray } });
      for (const user of users) {
        const preferences = user.notificationPreferences || {};
        const emailEnabled = type === 'admin_announcement' ? preferences.adminAnnouncements?.email : preferences[type]?.email;
        if (user.email && emailEnabled === true) {
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
          console.log(`⛔ Email not sent to user ${user.email || 'no email'}: ${type}.email=${emailEnabled}`);
        }
      }
    }
  }

  return notifications.length === 1 ? notifications[0] : notifications;
}

// Bulk notification creation
export async function sendBulkNotifications({ recipients, title, message, type, emailSubject }) {
  const savedNotifications = [];

  for (const recipient of recipients) {
    const user = await User.findById(recipient);
    if (!user) {
      console.warn(`⚠️ Skipping notification for recipient ${recipient}: user not found`);
      continue;
    }
    const preferences = user.notificationPreferences || {};
    if (type === 'admin_announcement' ? preferences.adminAnnouncements?.inApp === true : preferences[type]?.inApp === true || type === 'important') {
      const notification = new Notification({
        recipients: [recipient],
        title,
        message,
        type
      });
      const saved = await notification.save();
      savedNotifications.push(saved);
      console.log(`✅ Bulk notification created for ${user.username}: ${saved._id}`);
    } else {
      console.log(`⛔ Bulk in-app notification skipped for ${user.username} due to preferences: ${JSON.stringify(preferences)}`);
    }
  }

  if (emailSubject) {
    if (type === 'important') {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        const preferences = admin.notificationPreferences || {};
        if (admin.email && preferences.adminAnnouncements?.email) {
          try {
            await sendEmail({
              to: admin.email,
              subject: emailSubject,
              message
            });
            console.log(`📧 Admin email sent to: ${admin.email}`);
          } catch (emailError) {
            console.error(`❌ Failed to send email to admin ${admin.email}: ${emailError.message}`);
          }
        } else {
          console.log(`⛔ Email not sent to admin ${admin.email || 'no email'}: adminAnnouncements.email=${preferences.adminAnnouncements?.email}`);
        }
      }
    } else {
      const users = await User.find({ _id: { $in: recipients } });
      for (const user of users) {
        const preferences = user.notificationPreferences || {};
        const emailEnabled = type === 'admin_announcement' ? preferences.adminAnnouncements?.email : preferences[type]?.email;
        if (user.email && emailEnabled === true) {
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
          console.log(`⛔ Email not sent to user ${user.email || 'no email'}: ${type}.email=${emailEnabled}`);
        }
      }
    }
  }

  console.log(`✅ Saved ${savedNotifications.length} notifications`);
  return savedNotifications;
}

// Parking booking notifications
async function createParkingBookingNotifications(parkingSlot, latestBooking) {
  try {
    console.log(`🚗 Processing parking booking: ${latestBooking.userName} -> Slot ${parkingSlot.slotNumber}`);

    const bookingId = `${parkingSlot._id}-${latestBooking.date}-${latestBooking.entryTime}`;
    if (processedBookingIds.has(bookingId)) {
      console.log(`🚗 Booking ${bookingId} already processed, skipping...`);
      return null;
    }

    const user = await User.findOne({ username: new RegExp(`^${latestBooking.userName}$`, 'i') });
    if (!user) {
      console.error(`❌ User not found: ${latestBooking.userName}`);
      throw new Error(`User not found: ${latestBooking.userName}`);
    }

    const preferences = user.notificationPreferences || {};
    console.log(`📋 User preferences for ${user.username}: ${JSON.stringify(preferences)}`);
    console.log(`📋 Creating in-app notification: ${preferences.bookingConfirmation?.inApp ? 'Yes' : 'No'}`);
    console.log(`📋 Sending email: ${user.email && preferences.bookingConfirmation?.email ? 'Yes' : 'No'}`);

    if (!preferences.bookingConfirmation) {
      console.warn(`⚠️ bookingConfirmation preferences missing for ${user.username}, using defaults: { email: false, inApp: false }`);
    }

    let userNotification = null;
    if (preferences.bookingConfirmation?.inApp === true) {
      userNotification = new Notification({
        recipients: [user._id],
        title: 'Parking Booking Confirmed',
        message: `Your parking slot ${parkingSlot.slotNumber} on Floor ${parkingSlot.floor} has been booked for ${latestBooking.date} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
        type: 'parking_booking',
        bookingId: null
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
          message: `Your parking slot ${parkingSlot.slotNumber} on Floor ${parkingSlot.floor} has been booked for ${latestBooking.date} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`
        });
        console.log(`📧 Email sent to user: ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to user ${user.email}: ${emailError.message}`);
      }
    } else {
      console.log(`⛔ Email not sent to ${user.email || 'no email'}: bookingConfirmation.email=${preferences.bookingConfirmation?.email}`);
    }

    const admins = await User.find({ role: 'admin' });
    const adminIds = admins.map(admin => admin._id);
    let adminNotification = null;
    if (admins.some(admin => admin.notificationPreferences?.adminAnnouncements?.inApp)) {
      adminNotification = new Notification({
        recipients: adminIds,
        title: 'New Parking Booking Alert',
        message: `${user.firstName} ${user.lastName} (${user.username}) has booked parking slot ${parkingSlot.slotNumber} on Floor ${parkingSlot.floor} for ${latestBooking.date} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
        type: 'important'
      });
      await adminNotification.save();
      console.log(`✅ Single admin notification saved with recipients: ${adminIds.length}`);
    }

    const adminEmails = admins.filter(admin => admin.email && admin.notificationPreferences?.adminAnnouncements?.email);
    for (const admin of adminEmails) {
      try {
        await sendEmail({
          to: admin.email,
          subject: 'New Parking Booking - Admin Alert',
          message: `${user.firstName} ${user.lastName} (${user.username}) has booked parking slot ${parkingSlot.slotNumber} on Floor ${parkingSlot.floor} for ${latestBooking.date} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`
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
    console.error('❌ Error creating parking booking notifications:', error);
    throw error;
  }
}

// Seating booking notifications
async function createSeatingBookingNotifications(seatingRecord, latestBooking) {
  try {
    console.log(`🪑 Processing seating booking: ${seatingRecord.userName} -> Seat ${latestBooking.seatId}`);

    const bookingId = `${seatingRecord._id}-${latestBooking.date}-${latestBooking.entryTime}`;
    if (processedBookingIds.has(bookingId)) {
      console.log(`🪑 Booking ${bookingId} already processed, skipping...`);
      return null;
    }

    const user = await User.findOne({ username: new RegExp(`^${seatingRecord.userName}$`, 'i') });
    if (!user) {
      console.error(`❌ User not found: ${seatingRecord.userName}`);
      throw new Error(`User not found: ${seatingRecord.userName}`);
    }

    const preferences = user.notificationPreferences || {};
    console.log(`📋 User preferences for ${user.username}: ${JSON.stringify(preferences)}`);
    console.log(`📋 Creating in-app notification: ${preferences.bookingConfirmation?.inApp ? 'Yes' : 'No'}`);
    console.log(`📋 Sending email: ${user.email && preferences.bookingConfirmation?.email ? 'Yes' : 'No'}`);

    if (!preferences.bookingConfirmation) {
      console.warn(`⚠️ bookingConfirmation preferences missing for ${user.username}, using defaults: { email: false, inApp: false }`);
    }

    let userNotification = null;
    if (preferences.bookingConfirmation?.inApp === true) {
      userNotification = new Notification({
        recipients: [user._id],
        title: 'Seat Booking Confirmed',
        message: `Your seat ${latestBooking.seatId} on Floor ${latestBooking.floor} has been booked for ${new Date(latestBooking.date).toLocaleDateString()} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
        type: 'seat_booking',
        bookingId: null
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
          message: `Your seat ${latestBooking.seatId} on Floor ${latestBooking.floor} has been booked for ${new Date(latestBooking.date).toLocaleDateString()} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`
        });
        console.log(`📧 Email sent to user: ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to user ${user.email}: ${emailError.message}`);
      }
    } else {
      console.log(`⛔ Email not sent to ${user.email || 'no email'}: bookingConfirmation.email=${preferences.bookingConfirmation?.email}`);
    }

    const admins = await User.find({ role: 'admin' });
    const adminIds = admins.map(admin => admin._id);
    let adminNotification = null;
    if (admins.some(admin => admin.notificationPreferences?.adminAnnouncements?.inApp)) {
      adminNotification = new Notification({
        recipients: adminIds,
        title: 'New Seat Booking Alert',
        message: `${user.firstName} ${user.lastName} (${user.username}) has booked seat ${latestBooking.seatId} on Floor ${latestBooking.floor} for ${new Date(latestBooking.date).toLocaleDateString()} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`,
        type: 'important'
      });
      await adminNotification.save();
      console.log(`✅ Single admin notification saved with recipients: ${adminIds.length}`);
    }

    const adminEmails = admins.filter(admin => admin.email && admin.notificationPreferences?.adminAnnouncements?.email);
    for (const admin of adminEmails) {
      try {
        await sendEmail({
          to: admin.email,
          subject: 'New Seat Booking - Admin Alert',
          message: `${user.firstName} ${user.lastName} (${user.username}) has booked seat ${latestBooking.seatId} on Floor ${latestBooking.floor} for ${new Date(latestBooking.date).toLocaleDateString()} from ${latestBooking.entryTime} to ${latestBooking.exitTime}`
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
    console.error('❌ Error creating seating booking notifications:', error);
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
          const user = await User.findOne({ username: new RegExp(`^${booking.userName}$`, 'i') });
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
        $gte: tomorrow,
        $lte: tomorrowEnd
      }
    });

    for (const record of seatingRecords) {
      for (const booking of record.bookings) {
        const bookingDate = new Date(booking.date).toDateString();
        if (bookingDate === tomorrow.toDateString()) {
          const user = await User.findOne({ username: new RegExp(`^${record.userName}$`, 'i') });
          if (!user) {
            console.warn(`⚠️ User not found for seating booking: ${record.userName}`);
            continue;
          }
          const preferences = user.notificationPreferences || {};
          console.log(`📋 Reminder preferences for ${user.username}: ${JSON.stringify(preferences)}`);
          if (user.email && preferences.bookingReminder?.email === true) {
            try {
              await sendEmail({
                to: user.email,
                subject: 'Seat Booking Reminder',
                message: `Reminder: Your seat ${booking.seatId} on Floor ${booking.floor} is booked for tomorrow, ${bookingDate}, from ${booking.entryTime} to ${booking.exitTime}`
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
    console.error('❌ Error sending booking reminder emails:', error);
    throw error;
  }
}

// Announcement notifications
async function createAnnouncementNotifications(announcement) {
  try {
    console.log(`📢 Processing announcement: ${announcement.message}`);

    const users = await User.find({});
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
        bookingId: null
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
    console.error('❌ Error creating announcement notifications:', error);
    throw error;
  }
}

// Cancellation notifications
export async function createCancellationNotifications({ userId, slotNumber, floor, type, date, bookingId }) {
  try {
    console.log(`🚫 Creating cancellation notifications for ${type} booking, userId: ${userId}, slot: ${slotNumber}, floor: ${floor}, date: ${date}, bookingId: ${bookingId}`);

    const user = await User.findById(userId).select('username email notificationPreferences firstName lastName');
    if (!user) {
      console.error(`❌ User not found for userId: ${userId}`);
      throw new Error('User not found');
    }

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
        bookingId
      });
      console.log(`🚫 About to save user notification for ${user.username}:`, JSON.stringify(userNotification));
      await userNotification.save();
      console.log(`✅ Cancellation notification created for user ${user.username}: ${userNotification._id}`);
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

    const admins = await User.find({ role: 'admin' }).select('email notificationPreferences');
    const adminIds = admins.map(admin => admin._id);
    let adminNotification = null;
    if (admins.some(admin => admin.notificationPreferences?.adminAnnouncements?.inApp)) {
      adminNotification = new Notification({
        recipients: adminIds,
        title: `${type === 'parking' ? 'Parking' : 'Seat'} Booking Cancelled`,
        message: `${user.firstName} ${user.lastName} (${user.username}) has cancelled their ${type === 'parking' ? 'parking slot' : 'seat'} ${slotNumber} on Floor ${floor} booking for ${bookingDate}.`,
        type: 'important',
        bookingId
      });
      console.log(`🚫 About to save admin notification:`, JSON.stringify(adminNotification));
      await adminNotification.save();
      console.log(`✅ Single admin notification saved with recipients: ${adminIds.length}`);
    }

    const adminEmails = admins.filter(admin => admin.email && admin.notificationPreferences?.adminAnnouncements?.email);
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

    return { userNotification, adminNotification };
  } catch (error) {
    console.error('❌ Error creating cancellation notifications:', error);
    throw error;
  }
}

// Booking change listener
export function listenForBookingChanges() {
  console.log('🔄 Starting database change listeners for booking confirmations...');

  const parkingStream = ParkingSlot.watch([
    {
      $match: { operationType: 'update' }
    }
  ], { fullDocument: 'updateLookup', fullDocumentBeforeChange: 'whenAvailable' });

  parkingStream.on('change', async (change) => {
    try {
      console.log('🚗 ParkingSlot change event received:', JSON.stringify(change, null, 2));
      if (change.operationType === 'update') {
        const slotId = change.documentKey._id;
        const parkingSlot = await ParkingSlot.findById(slotId);
        console.log('🚗 ParkingSlot fetched:', parkingSlot ? `Slot ${parkingSlot.slotNumber}, bookings: ${parkingSlot.bookings.length}` : 'null');

        if (parkingSlot) {
          const previousBookings = change.fullDocumentBeforeChange?.bookings || [];
          const currentBookings = parkingSlot.bookings || [];
          const previousLength = previousBookings.length;
          const currentLength = currentBookings.length;
          console.log('🚗 Bookings: previous=', previousLength, 'current=', currentLength);

          if (currentLength > previousLength) {
            const latestBooking = currentBookings[currentBookings.length - 1];
            const bookingId = `${parkingSlot._id}-${latestBooking.date}-${latestBooking.entryTime}`;
            if (processedBookingIds.has(bookingId)) {
              console.log(`🚗 Booking ${bookingId} already processed, skipping...`);
              return;
            }
            console.log('📍 New parking booking detected:', JSON.stringify(latestBooking));
            await createParkingBookingNotifications(parkingSlot, latestBooking);
          } else {
            console.log('🚗 No new bookings detected, ignoring update...');
          }
        } else {
          console.warn(`⚠️ ParkingSlot not found for slotId: ${slotId}`);
        }
      } else {
        console.log(`🚗 Ignoring operationType: ${change.operationType}`);
      }
    } catch (error) {
      console.error('❌ Error processing parking slot change:', error);
    }
  });

  parkingStream.on('error', (error) => {
    console.error('❌ Parking change stream error:', error);
  });

  const seatingStream = SeatingSlots.watch([
    {
      $match: { operationType: 'update' }
    }
  ], { fullDocument: 'updateLookup', fullDocumentBeforeChange: 'whenAvailable' });

  seatingStream.on('change', async (change) => {
    try {
      console.log('🪑 SeatingSlots change event received:', JSON.stringify(change, null, 2));
      if (change.operationType === 'update') {
        const recordId = change.documentKey._id;
        const seatingRecord = await SeatingSlots.findById(recordId);
        console.log('🪑 SeatingRecord fetched:', seatingRecord ? `Record for ${seatingRecord.userName}, bookings: ${seatingRecord.bookings.length}` : 'null');

        if (seatingRecord) {
          const previousBookings = change.fullDocumentBeforeChange?.bookings || [];
          const currentBookings = seatingRecord.bookings || [];
          const previousLength = previousBookings.length;
          const currentLength = currentBookings.length;
          console.log('🪑 Bookings: previous=', previousLength, 'current=', currentLength);

          if (currentLength > previousLength) {
            const latestBooking = currentBookings[currentBookings.length - 1];
            const bookingId = `${seatingRecord._id}-${latestBooking.date}-${latestBooking.entryTime}`;
            if (processedBookingIds.has(bookingId)) {
              console.log(`🪑 Booking ${bookingId} already processed, skipping...`);
              return;
            }
            console.log('📍 New seating booking detected:', JSON.stringify(latestBooking));
            await createSeatingBookingNotifications(seatingRecord, latestBooking);
          } else {
            console.log('🪑 No new bookings detected, ignoring update...');
          }
        } else {
          console.warn(`⚠️ SeatingRecord not found for recordId: ${recordId}`);
        }
      } else {
        console.log(`🪑 Ignoring operationType: ${change.operationType}`);
      }
    } catch (error) {
      console.error('❌ Error processing seating slot change:', error);
    }
  });

  seatingStream.on('error', (error) => {
    console.error('❌ Seating change stream error:', error);
  });

  const announcementStream = Announcement.watch([
    {
      $match: { operationType: 'insert' }
    }
  ], { fullDocument: 'updateLookup' });

  announcementStream.on('change', async (change) => {
    try {
      console.log('📢 Announcement change event received:', JSON.stringify(change));
      if (change.operationType === 'insert') {
        const announcement = change.fullDocument;
        console.log('📢 New announcement detected:', announcement.message);
        await createAnnouncementNotifications(announcement);
      }
    } catch (error) {
      console.error('❌ Error processing announcement change:', error);
    }
  });

  announcementStream.on('error', (error) => {
    console.error('❌ Announcement change stream error:', error);
  });
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
  listenForBookingChanges();
  cron.schedule('0 8 * * *', () => {
    console.log('⏰ Running daily booking reminder email job...');
    sendBookingReminderEmails();
  }, {
    timezone: 'Asia/Kolkata'
  });
  console.log('✅ Notification system initialized successfully');
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

// Generate notifications for past bookings
export async function generateNotificationsForPastBookings() {
  console.log('🔄 Generating notifications for all bookings...');

  let createdCount = 0;

  console.log('🚗 Processing parking bookings...');
  const parkingSlots = await ParkingSlot.find();
  console.log(`📊 Found ${parkingSlots.length} parking slots`);

  for (const slot of parkingSlots) {
    console.log(`📍 Processing slot ${slot.slotNumber} on floor ${slot.floor} with ${slot.bookings.length} bookings`);
    for (const booking of slot.bookings) {
      const bookingId = `${slot._id}-${booking.date}-${booking.entryTime}`;
      if (processedBookingIds.has(bookingId)) {
        console.log(`🚗 Booking ${bookingId} already processed, skipping...`);
        continue;
      }
      const user = await User.findOne({ username: new RegExp(`^${booking.userName}$`, 'i') });
      if (!user) {
        console.warn(`⚠️ Skipping parking booking: user '${booking.userName}' not found for slot ${slot.slotNumber}`);
        continue;
      }
      console.log(`✅ Creating notification for parking booking: user ${user.username}, slot ${slot.slotNumber}, date ${booking.date}`);
      await createBookingNotifications('parking', slot, booking);
      processedBookingIds.add(bookingId);
      createdCount++;
    }
  }

  console.log('🪑 Processing seating bookings...');
  const seatingBookings = await SeatingSlots.find();
  console.log(`📊 Found ${seatingBookings.length} seating records`);

  for (const seatingRecord of seatingBookings) {
    console.log(`📍 Processing seating record for user ${seatingRecord.userName} with ${seatingRecord.bookings.length} bookings`);
    for (const booking of seatingRecord.bookings) {
      const bookingId = `${seatingRecord._id}-${booking.date}-${booking.entryTime}`;
      if (processedBookingIds.has(bookingId)) {
        console.log(`🪑 Booking ${bookingId} already processed, skipping...`);
        continue;
      }
      const user = await User.findOne({ username: new RegExp(`^${seatingRecord.userName}$`, 'i') });
      if (!user) {
        console.warn(`⚠️ Skipping seating booking: user '${seatingRecord.userName}' not found for seat ${booking.seatId}`);
        continue;
      }
      console.log(`✅ Creating notification for seating booking: user ${user.username}, seat ${booking.seatId}, date ${booking.date}`);
      await createBookingNotifications('seating', seatingRecord, booking);
      processedBookingIds.add(bookingId);
      createdCount++;
    }
  }

  console.log(`✅ Finished generating ${createdCount} booking notifications`);
  return createdCount;
}
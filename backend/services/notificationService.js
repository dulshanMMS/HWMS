import nodemailer from 'nodemailer';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send booking notification to user and admin
export async function sendBookingNotification({ booking, user, type }) {
  try {
    const notifications = [];
    
    // Notification for the user who made the booking
    const userNotification = new Notification({
      recipient: user._id,
      title: type === 'seat_booking' ? 'Seat Booking Confirmed' : 'Parking Booking Confirmed',
      message: `Your ${type === 'seat_booking' ? 'seat' : 'parking'} booking has been confirmed.`,
      type,
      bookingId: booking._id
    });
    notifications.push(userNotification);

    // Notification for all admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      const adminNotification = new Notification({
        recipient: admin._id,
        title: 'New Booking Created',
        message: `${user.firstName} ${user.lastName} has made a ${type === 'seat_booking' ? 'seat' : 'parking'} booking.`,
        type: 'important',
        bookingId: booking._id
      });
      notifications.push(adminNotification);
    }

    await Notification.insertMany(notifications);

    // Send emails
    const emailPromises = notifications.map(notification => 
      sendEmail({
        to: notification.recipient.email,
        subject: notification.title,
        message: notification.message
      })
    );

    await Promise.all(emailPromises);
    return notifications;
  } catch (error) {
    console.error('Error sending booking notification:', error);
    throw error;
  }
}

// Send cancellation notification
export async function sendCancellationNotification({ booking, user, type }) {
  try {
    const notifications = [];
    
    // Notification for the user who cancelled
    const userNotification = new Notification({
      recipient: user._id,
      title: type === 'seat_cancellation' ? 'Seat Booking Cancelled' : 'Parking Booking Cancelled',
      message: `Your ${type === 'seat_cancellation' ? 'seat' : 'parking'} booking has been cancelled.`,
      type,
      bookingId: booking._id
    });
    notifications.push(userNotification);

    // Notification for all admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      const adminNotification = new Notification({
        recipient: admin._id,
        title: 'Booking Cancelled',
        message: `${user.firstName} ${user.lastName} has cancelled their ${type === 'seat_cancellation' ? 'seat' : 'parking'} booking.`,
        type: 'important',
        bookingId: booking._id
      });
      notifications.push(adminNotification);
    }

    await Notification.insertMany(notifications);

    // Send emails
    const emailPromises = notifications.map(notification => 
      sendEmail({
        to: notification.recipient.email,
        subject: notification.title,
        message: notification.message
      })
    );

    await Promise.all(emailPromises);
    return notifications;
  } catch (error) {
    console.error('Error sending cancellation notification:', error);
    throw error;
  }
}

// Send team booking notification
export async function sendTeamBookingNotification({ booking, user, teamMembers }) {
  try {
    const notifications = [];
    
    // Notification for team members
    for (const member of teamMembers) {
      const teamNotification = new Notification({
        recipient: member._id,
        title: 'Team Booking Created',
        message: `${user.firstName} ${user.lastName} has made a booking for the team.`,
        type: 'team_booking',
        bookingId: booking._id
      });
      notifications.push(teamNotification);
    }

    // Notification for all admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      const adminNotification = new Notification({
        recipient: admin._id,
        title: 'New Team Booking',
        message: `${user.firstName} ${user.lastName} has made a booking for team ${user.team}.`,
        type: 'important',
        bookingId: booking._id
      });
      notifications.push(adminNotification);
    }

    await Notification.insertMany(notifications);

    // Send emails
    const emailPromises = notifications.map(notification => 
      sendEmail({
        to: notification.recipient.email,
        subject: notification.title,
        message: notification.message
      })
    );

    await Promise.all(emailPromises);
    return notifications;
  } catch (error) {
    console.error('Error sending team booking notification:', error);
    throw error;
  }
}

export async function sendNotification({ recipient, title, message, type, emailSubject }) {
  try {
    const notification = new Notification({
      recipient,
      title,
      message,
      type,
      read: false,
      deleted: false
    });
    await notification.save();

    if (['seat_booking', 'parking_booking', 'important'].includes(type)) {
      await sendEmail({
        to: recipient.email,
        subject: emailSubject || title,
        message
      });
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

export async function sendEmail({ to, subject, message }) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #052E19; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Wiley Booking Notification</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <h3 style="color: #333;">${subject}</h3>
            <p style="color: #666; line-height: 1.6;">${message}</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888;">
              <small>This is an automated message from Wiley Booking System</small>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendBulkNotifications({ recipients, title, message, type, emailSubject }) {
  try {
    const notifications = [];
    const emailPromises = [];

    for (const recipient of recipients) {
      const notification = new Notification({
        recipient: recipient._id,
        title,
        message,
        type,
        read: false,
        deleted: false
      });
      notifications.push(notification);

      if (['seat_booking', 'parking_booking', 'important'].includes(type)) {
        emailPromises.push(
          sendEmail({
            to: recipient.email,
            subject: emailSubject || title,
            message
          })
        );
      }
    }

    await Notification.insertMany(notifications);
    if (emailPromises.length > 0) {
      await Promise.all(emailPromises);
    }

    return notifications;
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    throw error;
  }
}

export async function getNotificationPreferences(userId) {
  try {
    const user = await User.findById(userId).select('notificationPreferences');
    return user.notificationPreferences;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
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
    return user.notificationPreferences;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
}

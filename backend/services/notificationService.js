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

import Announcement from "../models/Announcement.js";
import { createAnnouncementNotifications } from "../services/notificationService.js";
import User from "../models/User.js"; // Import User model for preference checking

export const createAnnouncement = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Fetch users with their notification preferences
    const users = await User.find({}).select('notificationPreferences _id');
    
    // Create announcements only for users who have in-app announcements enabled
    const announcements = [];
    for (const user of users) {
      const preferences = user.notificationPreferences || {};
      if (preferences.adminAnnouncements?.inApp !== false) { // Default to true if not specified
        const newAnnouncement = new Announcement({
          message,
          sender: req.user._id,
          type: 'announcement',
          read: false,
          recipient: user._id, // Add recipient field to target specific user
        });
        await newAnnouncement.save();
        announcements.push(newAnnouncement);
        console.log(`✅ Announcement created for user ${user._id}: ${newAnnouncement._id}`);
      } else {
        console.log(`⛔ In-app announcement skipped for user ${user._id}: adminAnnouncements.inApp=${preferences.adminAnnouncements?.inApp}`);
      }
    }

    // Trigger email notifications
    if (announcements.length > 0) {
       createAnnouncementNotifications(announcements[0]); // Pass the first announcement for email notifications
      console.log(`✅ Notifications triggered for announcement: ${announcements[0]._id}`);
    }

    res.status(201).json({ 
      message: "Announcements processed successfully", 
      announcements: announcements 
    });
  } catch (err) {
    console.error("❌ Error processing announcements:", err);
    res.status(500).json({ error: "Server error" });
  }
};
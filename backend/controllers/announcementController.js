// import Announcement from "../models/Announcement.js";

// export const createAnnouncement = async (req, res) => {
//   try {
//     if (!req.user || req.user.role !== "admin") {
//       return res.status(403).json({ error: "Not authorized" });
//     }

//     const { message } = req.body;
//     if (!message || !message.trim()) {
//       return res.status(400).json({ error: "Message is required" });
//     }

//     const newAnnouncement = new Announcement({
//       message,
//       sender: req.user._id,
//     });

//     await newAnnouncement.save();

//     res.status(201).json({ message: "Announcement saved successfully" });
//   } catch (err) {
//     console.error("❌ Error saving announcement:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// announcementController.js
import Announcement from "../models/Announcement.js";
import { createAnnouncementNotifications } from "../services/notificationService.js"; // Import the function

export const createAnnouncement = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const newAnnouncement = new Announcement({
      message,
      sender: req.user._id,
      type: 'announcement',
      read: false,
    });

    await newAnnouncement.save();
    console.log(`✅ Announcement created: ${newAnnouncement._id}`);

    // Trigger notifications (in-app and email)
   createAnnouncementNotifications(newAnnouncement);
    console.log(`✅ Notifications triggered for announcement: ${newAnnouncement._id}`);

    res.status(201).json({ message: "Announcement saved successfully", announcement: newAnnouncement });
  } catch (err) {
    console.error("❌ Error saving announcement:", err);
    res.status(500).json({ error: "Server error" });
  }
};

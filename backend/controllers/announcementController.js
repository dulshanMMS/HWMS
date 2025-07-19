import Announcement from "../models/Announcement.js";

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
    });

    await newAnnouncement.save();

    res.status(201).json({ message: "Announcement saved successfully" });
  } catch (err) {
    console.error("❌ Error saving announcement:", err);
    res.status(500).json({ error: "Server error" });
  }
};

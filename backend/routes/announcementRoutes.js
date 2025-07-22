
// announcementRoutes.js
import express from "express";
import { createAnnouncement } from "../controllers/announcementController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import Announcement from "../models/Announcement.js";

const router = express.Router();

router.post("/", authenticateUser, createAnnouncement);

router.get("/", authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 10, filter = 'all' } = req.query;
    const skip = (page - 1) * limit;
    let query = {};

    if (filter === 'announcements') {
      query.type = 'announcement';
    }

    const announcements = await Announcement.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate('sender', 'name email'); // Populate sender details if needed

    const total = await Announcement.countDocuments(query);

    res.json({
      announcements,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Failed to fetch announcements', error: error.message });
  }
});

router.put('/:id/mark-read', authenticateUser, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    announcement.read = true;
    await announcement.save();
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id/mark-unread', authenticateUser, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    announcement.read = false;
    await announcement.save();
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    await announcement.remove();
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
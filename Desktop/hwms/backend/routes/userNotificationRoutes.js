const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Get all notifications for the logged-in user
router.get('/my-notifications', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get unread notifications count
router.get('/unread-count', auth, async (req, res) => {
    try {
        const count = await Notification.countDocuments({ 
            userId: req.user._id,
            isRead: false
        });
        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark a notification as read
router.patch('/:id/mark-read', auth, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark all notifications as read
router.post('/mark-all-read', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get notifications by type (booking, reminder, etc.)
router.get('/by-type/:type', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.user._id,
            type: req.params.type.toUpperCase()
        })
        .sort({ createdAt: -1 })
        .limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 
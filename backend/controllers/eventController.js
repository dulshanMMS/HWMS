import Event from "../models/Event.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { createAnnouncementNotifications } from "../services/notificationService.js";
import { io } from "../server.js"; // Import io for WebSocket emission

// Track processed event IDs to prevent duplicates
const processedEventIds = new Set();

// Add new event
export const addEvent = async (req, res) => {
  const { date, title, description, time } = req.body;

  // Validate required fields
  if (!date || !title) {
    return res.status(400).json({ success: false, message: "Date and title are required" });
  }

  try {
    // Verify user is admin
    const user = await User.findById(req.user._id).select('role'); // Changed req.user.id to req.user._id
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }

    // Create and save the event
    const newEvent = new Event({ date, title, description, time });
    await newEvent.save();

    // Prevent duplicate notifications
    const eventKey = `create-${newEvent._id}`;
    if (processedEventIds.has(eventKey)) {
      console.log(`Duplicate event creation notification skipped for event: ${eventKey}`);
      return res.json({ success: true, event: newEvent });
    }

    // Fetch all users for notifications
    const users = await User.find({}).select('_id notificationPreferences');
    const userIds = users.map(u => u._id);
    const formattedDate = new Date(date).toLocaleDateString();

    // Create in-app notification for users with adminAnnouncements.inApp enabled
    const notificationMessage = `New event: ${title} on ${formattedDate}${time ? ` at ${time}` : ''}${description ? ` - ${description}` : ''}`;
    const notification = new Notification({
      recipients: userIds,
      title: "New Event Created",
      message: notificationMessage,
      type: "admin_announcement",
      createdAt: new Date(),
    });
     notification.save();
    console.log(`Notification created for event creation: ${notification._id}`);

    // Emit notification via WebSocket
    io.emit("notificationReceived", notification);
    console.log(`WebSocket notification emitted for event creation: ${notification._id}`);

    // Send emails to users with adminAnnouncements.email enabled
     createAnnouncementNotifications({
      message: notificationMessage,
      title: "New Event Created",
    });

    // Mark event as processed
    processedEventIds.add(eventKey);

    res.json({ success: true, event: newEvent });
  } catch (err) {
    console.error("Error creating event or sending notifications:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json({ success: true, events });
  } catch (err) {
    console.error("Error fetching all events:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get events by date
export const getEventsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const events = await Event.find({ date });
    res.json({ success: true, events });
  } catch (err) {
    console.error("Error fetching events for date:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    // Verify user is admin
    const user = await User.findById(req.user._id).select('role'); // Changed req.user.id to req.user._id
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }

    // Fetch event before deletion
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Prevent duplicate notifications
    const eventKey = `delete-${event._id}`;
    if (processedEventIds.has(eventKey)) {
      console.log(`Duplicate event deletion notification skipped for event: ${eventKey}`);
      await Event.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: "Event deleted" });
    }

    // Delete the event
    await Event.findByIdAndDelete(req.params.id);

    // Fetch all users for notifications
    const users = await User.find({}).select('_id notificationPreferences');
    const userIds = users.map(u => u._id);
    const formattedDate = new Date(event.date).toLocaleDateString();

    // Create in-app notification for users with adminAnnouncements.inApp enabled
    const notificationMessage = `Event cancelled: ${event.title} on ${formattedDate}`;
    const notification = new Notification({
      recipients: userIds,
      title: "Event Cancelled",
      message: notificationMessage,
      type: "admin_announcement",
      createdAt: new Date(),
    });
     notification.save();
    console.log(`Notification created for event deletion: ${notification._id}`);

    // Emit notification via WebSocket
    io.emit("notificationReceived", notification);
    console.log(`WebSocket notification emitted for event deletion: ${notification._id}`);

    // Send emails to users with adminAnnouncements.email enabled
     createAnnouncementNotifications({
      message: notificationMessage,
      title: "Event Cancelled",
    });

    // Mark event as processed
    processedEventIds.add(eventKey);

    res.json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error("Error deleting event or sending notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
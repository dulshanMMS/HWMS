import Event from "../models/Event.js";

// Add new event
export const addEvent = async (req, res) => {
  const { date, title, description, time } = req.body;

  if (!date || !title) {
    return res.status(400).json({ success: false, message: "Date and title are required" });
  }

  try {
    const newEvent = new Event({ date, title, description, time });
    await newEvent.save();
    res.json({ success: true, event: newEvent });
  } catch (err) {
    console.error("Error creating event:", err);
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
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

import express from "express";
import Event from "../models/Event.js"; 
const router = express.Router();

// Add new event
router.post("/", async (req, res) => {
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
});

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.json({ success: true, events });
  } catch (err) {
    console.error("Error fetching all events:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get events by date
router.get("/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const events = await Event.find({ date });
    res.json({ success: true, events });
  } catch (err) {
    console.error("Error fetching events for date:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// DELETE /api/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
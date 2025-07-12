import Event from "../models/Event.js";
import Booking from "../models/Booking.js";

// Fetches all public holidays and events from the database
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({});
    res.json(events);
  } catch (err) {
    console.error("Failed to fetch events:", err);
    res.status(500).json({ error: "Failed to load events" });
  }
};

// Fetches all bookings associated with the logged-in user
export const getUserBookings = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user.id;

    // Find bookings matching user ID
    const bookings = await Booking.find({ userId });

    res.json(bookings);
  } catch (err) {
    console.error("Failed to fetch bookings:", err);
    res.status(500).json({ error: "Failed to load bookings" });
  }
};

import Event from "../models/Event.js";
import ParkingSlot from "../models/ParkingSlots.js";
import SeatingSlot from "../models/SeatingSlots.js";

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

// Fetches all bookings associated with the logged-in user from both ParkingSlots and SeatingSlots
export const getUserBookings = async (req, res) => {
  try {
    const username = req.user.username;
    const matchedBookings = [];

    // Fetch seating and parking slots in parallel
    const [seating, parking] = await Promise.all([
      SeatingSlot.find({}),
      ParkingSlot.find({}),
    ]);

    // Helper to collect all bookings for the user from parking slots
    parking.forEach((slot) => {
      slot.bookings.forEach((b) => {
        if (b.userName === username) {
          matchedBookings.push({
            type: "parking",
            date: b.date,
            details: b.details || `Parking Slot ${slot.slotNumber}`,
            floor: slot.floor || null,
            entryTime: b.entryTime,
            exitTime: b.exitTime,
            slotNumber: slot.slotNumber,
            location: `Floor ${slot.floor}, Slot ${slot.slotNumber}`
          });
        }
      });
    });

    // Helper to collect all bookings for the user from seating slots
    seating.forEach((userDoc) => {
      if (userDoc.userName === username && userDoc.bookings) {
        userDoc.bookings.forEach((b) => {
          matchedBookings.push({
            type: "seat",
            date: b.date instanceof Date ? b.date.toISOString().split('T')[0] : b.date.split('T')[0],
            details: b.details || `Seat ${b.seatId || 'Unknown'}`,
            floor: b.floor || null,
            entryTime: b.entryTime,
            exitTime: b.exitTime,
            seatId: b.seatId,
            areaId: b.areaId,
            location: `Floor ${b.floor}, Area ${b.areaId}, Seat ${b.seatId}`
          });
        });
      }
    });

    res.json(matchedBookings);
  } catch (err) {
    console.error("Failed to fetch bookings:", err);
    res.status(500).json({ error: "Failed to load bookings" });
  }
};
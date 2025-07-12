import ParkingSlot from '../models/ParkingSlots.js';
import SeatingSlot from '../models/SeatingSlots.js';

// Fetch recent bookings (both seat and parking) for the logged-in user
export const getRecentUserBookings = async (req, res) => {
  try {
    const username = req.user.username;
    const limit = parseInt(req.query.limit) || 3; // max number of bookings to return
    const matchedBookings = [];

    // Helper to extract bookings matching the username from slots
    const collectRecent = (slots, type) => {
      slots.forEach((slot) => {
        slot.bookings.forEach((b) => {
          if (b.userName === username) {
            matchedBookings.push({
              type,
              date: b.date,
              details: b.details || `${slot.slotNumber || slot.name || type} Booking`,
              floor: slot.floor || null,
              entryTime: b.entryTime,
              exitTime: b.exitTime,
            });
          }
        });
      });
    };

    // Fetch all parking and seating slots in parallel
    const [parking, seating] = await Promise.all([
      ParkingSlot.find({}),
      SeatingSlot.find({}),
    ]);

    // Collect bookings from both types
    collectRecent(parking, 'parking');
    collectRecent(seating, 'seat');

    // Sort by date descending and limit results
    const sorted = matchedBookings
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    res.json(sorted);
  } catch (err) {
    console.error('Failed to get recent bookings:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Fetch bookings for a specific date for the logged-in user
export const getUserBookingsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const username = req.user.username;
    const matchedBookings = [];

    // Find seating slots where booking matches username and date prefix
    const seating = await SeatingSlot.find({
      bookings: { $elemMatch: { userName: username, date: { $regex: `^${date}` } } },
    });

    seating.forEach((slot) => {
      slot.bookings.forEach((b) => {
        if (b.userName === username && b.date.startsWith(date)) {
          matchedBookings.push({
            type: "seat",
            date: b.date,
            details: b.details || `Seat ${slot.slotNumber || ""} on Floor ${slot.floor || ""}`,
          });
        }
      });
    });

    // Same for parking slots
    const parking = await ParkingSlot.find({
      bookings: { $elemMatch: { userName: username, date: { $regex: `^${date}` } } },
    });

    parking.forEach((slot) => {
      slot.bookings.forEach((b) => {
        if (b.userName === username && b.date.startsWith(date)) {
          matchedBookings.push({
            type: "parking",
            date: b.date,
            details: b.details || `Parking Slot ${slot.slotNumber || ""} on Floor ${slot.floor || ""}`,
          });
        }
      });
    });

    res.json(matchedBookings);
  } catch (err) {
    console.error("Failed to fetch user bookings:", err);
    res.status(500).json({ error: "Server error while fetching bookings" });
  }
};

// Fetch all bookings for the user for calendar view (no date filter)
export const getUserCalendarView = async (req, res) => {
  try {
    const username = req.user.username;
    const matchedBookings = [];

    // Fetch seating and parking slots in parallel
    const [seating, parking] = await Promise.all([
      SeatingSlot.find({}),
      ParkingSlot.find({}),
    ]);

    // Helper to collect all bookings for the user
    const collect = (slots, type) => {
      slots.forEach((slot) => {
        slot.bookings.forEach((b) => {
          if (b.userName === username) {
            matchedBookings.push({
              type,
              date: b.date,
              details: b.details || `${type === 'seat' ? "Seat" : "Parking"} ${slot.slotNumber || slot.name}`,
              floor: slot.floor || null,
              entryTime: b.entryTime,
              exitTime: b.exitTime,
            });
          }
        });
      });
    };

    collect(seating, 'seat');
    collect(parking, 'parking');

    res.json(matchedBookings);
  } catch (err) {
    console.error("Failed to fetch user calendar view bookings:", err);
    res.status(500).json({ error: "Server error while loading calendar view" });
  }
};

// Fetch recent parking bookings only for the logged-in user
export const getRecentParkingBookings = async (req, res) => {
  try {
    const username = req.user.username;
    const matched = [];

    // Fetch all parking slots
    const parkingSlots = await ParkingSlot.find({});

    parkingSlots.forEach(slot => {
      slot.bookings.forEach(b => {
        if (b.userName === username) {
          matched.push({
            date: b.date,
            floor: slot.floor,
            entryTime: b.entryTime,
            exitTime: b.exitTime,
            slot: slot.slotNumber || "Unknown",
          });
        }
      });
    });

    // Sort and limit to 3 recent
    const sorted = matched
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    res.json(sorted);
  } catch (err) {
    console.error("Recent parking bookings error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Alias of getUserCalendarView (seems redundant but kept for consistency)
export const getUserBookingsView = async (req, res) => {
  try {
    const username = req.user.username;
    const matchedBookings = [];

    const [seating, parking] = await Promise.all([
      SeatingSlot.find({}),
      ParkingSlot.find({}),
    ]);

    const collect = (slots, type) => {
      slots.forEach((slot) => {
        slot.bookings.forEach((b) => {
          if (b.userName === username) {
            matchedBookings.push({
              type,
              date: b.date,
              details: b.details || `${type === 'seat' ? "Seat" : "Parking"} ${slot.slotNumber || slot.name}`,
              floor: slot.floor || null,
              entryTime: b.entryTime,
              exitTime: b.exitTime,
            });
          }
        });
      });
    };

    collect(seating, 'seat');
    collect(parking, 'parking');

    res.json(matchedBookings);
  } catch (err) {
    console.error("Failed to fetch user calendar view bookings:", err);
    res.status(500).json({ error: "Server error while loading calendar view" });
  }
};

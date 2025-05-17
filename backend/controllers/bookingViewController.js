import ParkingSlot from '../models/ParkingSlots.js';
import SeatingSlot from '../models/SeatingSlots.js';

// ✅ Fetch recent bookings for dashboard (seat + parking)
export const getRecentUserBookings = async (req, res) => {
  try {
    const username = req.user.username;
    const limit = parseInt(req.query.limit) || 3;
    const matchedBookings = [];

    const collectRecent = (slots, type) => {
      slots.forEach((slot) => {
        slot.bookings.forEach((b) => {
          if (b.userName === username) {
            matchedBookings.push({
              type,
              date: b.date,
              details:
                b.details || `${slot.slotNumber || slot.name || type} Booking`,
              floor: slot.floor || null,
              entryTime: b.entryTime,
              exitTime: b.exitTime,
            });
          }
        });
      });
    };

    const [parking, seating] = await Promise.all([
      ParkingSlot.find({}),
      SeatingSlot.find({}),
    ]);

    collectRecent(parking, 'parking');
    collectRecent(seating, 'seat');

    const sorted = matchedBookings
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    res.json(sorted);
  } catch (err) {
    console.error('Failed to get recent bookings:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Fetch bookings for a specific date (calendar)
export const getUserBookingsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const username = req.user.username;
    const matchedBookings = [];

    const seating = await SeatingSlot.find({
      bookings: { $elemMatch: { userName: username, date: { $regex: `^${date}` } } },
    });

    seating.forEach((slot) => {
      slot.bookings.forEach((b) => {
        if (b.userName === username && b.date.startsWith(date)) {
          matchedBookings.push({
            type: "seat",
            date: b.date,
            details:
              b.details || `Seat ${slot.slotNumber || ""} on Floor ${slot.floor || ""}`,
          });
        }
      });
    });

    const parking = await ParkingSlot.find({
      bookings: { $elemMatch: { userName: username, date: { $regex: `^${date}` } } },
    });

    parking.forEach((slot) => {
      slot.bookings.forEach((b) => {
        if (b.userName === username && b.date.startsWith(date)) {
          matchedBookings.push({
            type: "parking",
            date: b.date,
            details:
              b.details || `Parking Slot ${slot.slotNumber || ""} on Floor ${slot.floor || ""}`,
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

// ✅ Unified: Fetch all bookings for calendar view (month-based, no per-date param)
export const getUserCalendarView = async (req, res) => {
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
              details:
                b.details || `${type === 'seat' ? "Seat" : "Parking"} ${slot.slotNumber || slot.name}`,
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

// ✅ Unified: Fetch all bookings for calendar view (month-based, no per-date param)
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
                details:
                  b.details ||
                  `${type === 'seat' ? "Seat" : "Parking"} ${slot.slotNumber || slot.name}`,
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
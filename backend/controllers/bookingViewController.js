import ParkingSlot from '../models/ParkingSlots.js';
import SeatingSlot from '../models/SeatingSlots.js';

// Fetch recent bookings (both seat and parking) for the logged-in user
export const getRecentUserBookings = async (req, res) => {
  try {
    const username = req.user.username;
    const limit = parseInt(req.query.limit) || 3; // max number of bookings to return
    const matchedBookings = [];

    // Helper to extract bookings matching the username from parking slots
    const collectRecentParking = (slots) => {
      slots.forEach((slot) => {
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
    };

    // Helper to extract bookings matching the username from seating slots
    const collectRecentSeating = (userDocs) => {
      userDocs.forEach((userDoc) => {
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
    };

    // Fetch all parking and seating slots in parallel
    const [parking, seating] = await Promise.all([
      ParkingSlot.find({}),
      SeatingSlot.find({}),
    ]);

    // Collect bookings from both types
    collectRecentParking(parking);
    collectRecentSeating(seating);

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

    // Find parking bookings for the specific date
    const parking = await ParkingSlot.find({
      bookings: { $elemMatch: { userName: username, date: { $regex: `^${date}` } } },
    });

    parking.forEach((slot) => {
      slot.bookings.forEach((b) => {
        if (b.userName === username && b.date.startsWith(date)) {
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

    // Find seating bookings for the specific date
    const seating = await SeatingSlot.find({ userName: username });

    seating.forEach((userDoc) => {
      if (userDoc.bookings) {
        userDoc.bookings.forEach((b) => {
          const bookingDate = b.date instanceof Date ? b.date.toISOString().split('T')[0] : b.date.split('T')[0];
          if (bookingDate.startsWith(date)) {
            matchedBookings.push({
              type: "seat",
              date: bookingDate,
              details: b.details || `Seat ${b.seatId || 'Unknown'}`,
              floor: b.floor || null,
              entryTime: b.entryTime,
              exitTime: b.exitTime,
              seatId: b.seatId,
              areaId: b.areaId,
              location: `Floor ${b.floor}, Area ${b.areaId}, Seat ${b.seatId}`
            });
          }
        });
      }
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

    // Collect parking bookings
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

    // Collect seating bookings
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
    console.error("Failed to fetch user calendar view bookings:", err);
    res.status(500).json({ error: "Server error while loading calendar view" });
  }
};

// NEW: Get separated booking counts for the logged-in user
export const getUserBookingStats = async (req, res) => {
  try {
    const username = req.user.username;
    let parkingCount = 0;
    let seatCount = 0;

    // Count parking bookings for this user
    const parkingSlots = await ParkingSlot.find({});
    parkingSlots.forEach(slot => {
      const userBookings = slot.bookings.filter(booking => booking.userName === username);
      parkingCount += userBookings.length;
    });

    // Count seating bookings for this user
    const seatingSlots = await SeatingSlot.find({});
    seatingSlots.forEach(userDoc => {
      // Check if this document belongs to the current user
      if (userDoc.userName === username) {
        seatCount += userDoc.bookings ? userDoc.bookings.length : 0;
      }
    });

    const totalCount = parkingCount + seatCount;

    res.json({
      success: true,
      data: {
        parkingCount,
        seatCount,
        totalCount,
        breakdown: {
          parkingPercentage: totalCount > 0 ? Math.round((parkingCount / totalCount) * 100) : 0,
          seatPercentage: totalCount > 0 ? Math.round((seatCount / totalCount) * 100) : 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user booking stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking statistics'
    });
  }
};

// NEW: Get today's booking counts for the logged-in user
export const getTodayUserBookingStats = async (req, res) => {
  try {
    const username = req.user.username;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    let todayParkingCount = 0;
    let todaySeatCount = 0;

    // Count today's parking bookings
    const parkingSlots = await ParkingSlot.find({});
    parkingSlots.forEach(slot => {
      const todayBookings = slot.bookings.filter(booking => 
        booking.userName === username && booking.date === today
      );
      todayParkingCount += todayBookings.length;
    });

    // Count today's seating bookings
    const seatingSlots = await SeatingSlot.find({});
    seatingSlots.forEach(userDoc => {
      if (userDoc.userName === username && userDoc.bookings) {
        const todayBookings = userDoc.bookings.filter(booking => {
          // Handle both Date object and string formats
          const bookingDate = booking.date instanceof Date 
            ? booking.date.toISOString().split('T')[0]
            : booking.date.split('T')[0];
          return bookingDate === today;
        });
        todaySeatCount += todayBookings.length;
      }
    });

    const todayTotalCount = todayParkingCount + todaySeatCount;

    res.json({
      success: true,
      data: {
        today: {
          parkingCount: todayParkingCount,
          seatCount: todaySeatCount,
          totalCount: todayTotalCount
        }
      }
    });

  } catch (error) {
    console.error('Error fetching today\'s booking stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch today\'s booking statistics'
    });
  }
};
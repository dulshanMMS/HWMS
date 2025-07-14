import ParkingSlot from '../models/ParkingSlots.js';
import SeatingSlot from '../models/SeatingSlots.js';
import User from '../models/User.js';
import Team from '../models/Team.js';
import { isSameDay } from 'date-fns';

// 1. TOTAL TODAY BOOKINGS..................
export const getTodayBookingCount = async (req, res) => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize

    // --- PARKING BOOKINGS ---
    const parkingSlots = await ParkingSlot.find({});
    const parkingCount = parkingSlots.reduce((sum, slot) => {
      const todayBookings = slot.bookings.filter(b => {
        const bDate = new Date(b.date);
        bDate.setHours(0, 0, 0, 0);
        return bDate.getTime() === now.getTime();
      });
      return sum + todayBookings.length;
    }, 0);

    // --- SEATING BOOKINGS ---
    const seatingSlots = await SeatingSlot.find({});
    let seatingCount = 0;

    for (const user of seatingSlots) {
      const bookings = user.bookings || [];
      for (const booking of bookings) {
        const bookingDate = new Date(booking.date);
        bookingDate.setHours(0, 0, 0, 0);
        if (bookingDate.getTime() === now.getTime()) {
          seatingCount += 1;
        }
      }
    }

    const total = parkingCount + seatingCount;
    res.json({ success: true, count: total });
  } catch (err) {
    console.error("❌ Error in getTodayBookingCount:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 2. EVENT LIST FOR A SPECIFIC DATE............................
export const getBookingsByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const [parkingSlots, seatingSlots] = await Promise.all([
      ParkingSlot.find({}),
      SeatingSlot.find({})
    ]);

    const collectEvents = (slots) => {
      return slots.flatMap(slot =>
        slot.bookings
          .filter(b => b.date === date)
          .map(b => ({
            title: `Booking - ${b.userName || 'Unknown User'}`,
            description: `Slot ${slot.slotNumber}, Floor ${slot.floor}`,
            time: `${b.entryTime} - ${b.exitTime}`,
            status: 'confirmed'
          }))
      );
    };

    const events = [...collectEvents(parkingSlots), ...collectEvents(seatingSlots)];

    res.status(200).json({ success: true, events });
  } catch (err) {
    console.error('Error in getBookingsByDate:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 3. TEAM-WISE TODAY BOOKING COUNTS...............................
export const getTeamBookingsToday = async (req, res) => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const teamBookingMap = {};

    const [parkingSlots, seatingSlots, users, teams] = await Promise.all([
      ParkingSlot.find({}),
      SeatingSlot.find({}),
      User.find({}),
      Team.find({})
    ]);

    // 🔄 Build user → teamId map
    const userMap = {};
    users.forEach(user => {
      userMap[user.username] = user.teamId;
    });

    // 🔄 Build teamId → name/color map
    const teamMap = {};
    teams.forEach(team => {
      teamMap[team.teamId] = {
        name: team.teamName,
        color: team.color || '#ccc'
      };
    });

    // 🚗 Count PARKING bookings per team
    for (const slot of parkingSlots) {
      for (const booking of slot.bookings || []) {
        const bookingDate = new Date(booking.date);
        bookingDate.setHours(0, 0, 0, 0);
        if (bookingDate.getTime() !== now.getTime()) continue;

        const teamId = userMap[booking.userName];
        if (!teamId) continue;

        if (!teamBookingMap[teamId]) {
          const team = teamMap[teamId] || { name: "Unknown", color: "#ccc" };
          teamBookingMap[teamId] = { count: 0, name: team.name, color: team.color };
        }

        teamBookingMap[teamId].count += 1;
      }
    }

    // 💺 Count SEATING bookings per team
    for (const member of seatingSlots) {
      const bookings = member.bookings || [];

      for (const booking of bookings) {
        const bookingDate = new Date(booking.date);
        bookingDate.setHours(0, 0, 0, 0);
        if (bookingDate.getTime() !== now.getTime()) continue;

        const teamId = member.teamId;
        if (!teamId) continue;

        if (!teamBookingMap[teamId]) {
          const team = teamMap[teamId] || { name: "Unknown", color: "#ccc" };
          teamBookingMap[teamId] = { count: 0, name: team.name, color: team.color };
        }

        teamBookingMap[teamId].count += 1;
      }
    }

    const teamsResult = Object.values(teamBookingMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({ success: true, teams: teamsResult });
  } catch (err) {
    console.error("❌ Error in getTeamBookingsToday:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 4. FLOOR-WISE BOOKING COUNTS....
export const getFloorBookingCount = async (req, res) => {
  try {
    const parkingSlots = await ParkingSlot.find({});
    const seatingSlots = await SeatingSlot.find({}); // One doc per user

    const parkingMap = {};
    const seatingMap = {};

    // Count all bookings in parking slots (grouped by floor)
    parkingSlots.forEach(slot => {
      const floor = slot.floor?.toString();
      if (!floor) return;

      const count = slot.bookings?.length || 0;
      parkingMap[floor] = (parkingMap[floor] || 0) + count;
    });

    // Count all bookings in seating slots (nested array in each user doc)
    seatingSlots.forEach(member => {
      const bookings = member.bookings || [];
      bookings.forEach(booking => {
        const floor = booking.floor?.toString();
        if (!floor) return;
        seatingMap[floor] = (seatingMap[floor] || 0) + 1;
      });
    });

    const parking = Object.entries(parkingMap).map(([floor, count]) => ({ floor, count }));
    const seating = Object.entries(seatingMap).map(([floor, count]) => ({ floor, count }));

    res.json({ success: true, parking, seating });
  } catch (err) {
    console.error("❌ Error in getFloorBookingCount:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


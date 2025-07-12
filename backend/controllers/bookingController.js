import ParkingSlot from '../models/ParkingSlots.js';
import SeatingSlot from '../models/SeatingSlots.js';
import User from '../models/User.js';
import Team from '../models/Team.js';
import { isSameDay } from 'date-fns';

// 1. TOTAL TODAY BOOKINGS..................
export const getTodayBookingCount = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Count bookings in parkingSlots
    const parkingSlots = await ParkingSlot.find({});
    const parkingCount = parkingSlots.reduce((sum, slot) => {
      const todayBookings = slot.bookings.filter(b => {
        const bDate = new Date(b.date);
        return bDate >= startOfDay && bDate <= endOfDay;
      });
      return sum + todayBookings.length;
    }, 0);

    // Count bookings in seatingSlots (each chair with teamId inside today documents)
    let seatingCount = 0;
    const seatingSlots = await SeatingSlot.find({});
    seatingSlots.forEach(slot => {
      if (!slot.date) return;
      const slotDate = new Date(slot.date);
      if (!isSameDay(slotDate, now)) return;

      const chairs = slot.chairs || {};
      for (const key in chairs) {
        if (chairs[key]?.teamId) seatingCount += 1;
      }
    });

    const total = parkingCount + seatingCount;
    res.json({ success: true, count: total });
  } catch (err) {
    console.error("Error in getTodayBookingCount:", err);
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
    const teamBookingMap = {};

    const parkingSlots = await ParkingSlot.find({});

    for (const slot of parkingSlots) {
      for (const booking of slot.bookings || []) {
        const bookingDate = new Date(booking.date);
        if (!isSameDay(bookingDate, now)) continue;

        const user = await User.findOne({ username: booking.userName }); 

        if (!user || !user.teamId) continue;

        const teamId = user.teamId;

        if (!teamBookingMap[teamId]) {
          teamBookingMap[teamId] = { count: 0, name: "Unknown", color: "#ccc" };
        }

        teamBookingMap[teamId].count += 1;
      }
    }

    const teamsResult = await Promise.all(Object.keys(teamBookingMap).map(async (teamId) => {
      const team = await Team.findOne({ teamId });
      if (team) {
        teamBookingMap[teamId].name = team.teamName;
        teamBookingMap[teamId].color = team.color; 
      }
      return {
        name: teamBookingMap[teamId].name,
        count: teamBookingMap[teamId].count,
        color: teamBookingMap[teamId].color
      };
    }));


    //console.log("📊 Final teams result:", teamsResult);
    res.json({ success: true, teams: teamsResult });
  } catch (err) {
    //console.error("❌ Error in getTeamBookingsToday:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 4. FLOOR-WISE BOOKING COUNTS....
export const getFloorBookingCount = async (req, res) => {
  try {
    const parkingSlots = await ParkingSlot.find({});
    const seatingSlots = await SeatingSlot.find({});

    const parkingMap = {};
    const seatingMap = {};

    parkingSlots.forEach(slot => {
      const floor = slot.floor?.toString();
      if (!floor) return;

      const count = slot.bookings?.length || 0;
      parkingMap[floor] = (parkingMap[floor] || 0) + count;
    });

    seatingSlots.forEach(slot => {
      const floor = slot.floor?.toString();
      if (!floor) return;

      seatingMap[floor] = (seatingMap[floor] || 0) + 1;
    });

    const parking = Object.entries(parkingMap).map(([floor, count]) => ({ floor, count }));
    const seating = Object.entries(seatingMap).map(([floor, count]) => ({ floor, count }));

    res.json({ success: true, parking, seating });
  } catch (err) {
    console.error("Error in getFloorBookingCount:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

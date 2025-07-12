import ParkingSlot from '../models/ParkingSlots.js';
import SeatingSlot from '../models/SeatingSlots.js';
import User from '../models/User.js';
import Team from '../models/Team.js';

// 1. TOTAL TODAY BOOKINGS..................
export const getTodayBookingCount = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Count bookings in parkingSlots
    const parkingSlots = await ParkingSlot.find({});
    const parkingCount = parkingSlots.reduce((sum, slot) => {
      const todayBookings = slot.bookings.filter(b => {
        const bDate = new Date(b.date);
        return bDate >= startOfDay && bDate <= endOfDay;
      });
      return sum + todayBookings.length;
    }, 0);

    // Count seatingSlot entries where the root-level date is today
    const seatingCount = await SeatingSlot.countDocuments({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
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
    const today = new Date().toISOString().split('T')[0];
    const [parkingSlots, seatingSlots] = await Promise.all([
      ParkingSlot.find({}),
      SeatingSlot.find({})
    ]);

    const teamBookingMap = {};

    const processBookings = async (slots) => {
      for (const slot of slots) {
        for (const booking of slot.bookings) {
          if (booking.date === today) {
            const user = await User.findOne({ userName: booking.userName });
            const teamId = user?.teamId;

            if (!teamId) continue;

            if (!teamBookingMap[teamId]) {
              teamBookingMap[teamId] = { count: 0, name: "Unknown", color: "#cccccc" };
            }

            teamBookingMap[teamId].count += 1;
          }
        }
      }
    };

    await Promise.all([
      processBookings(parkingSlots),
      processBookings(seatingSlots)
    ]);

    await Promise.all(Object.keys(teamBookingMap).map(async (teamId) => {
      const team = await Team.findOne({ teamId });
      if (team) {
        teamBookingMap[teamId].name = team.teamName;
        teamBookingMap[teamId].color = team.color;
      }
    }));

    const teams = Object.values(teamBookingMap)
      .map(({ name, count, color }) => ({ name, count, color }))
      .sort((a, b) => b.count - a.count);

    res.json({ success: true, teams });
  } catch (err) {
    console.error("Error in getTeamBookingsToday:", err);
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

    // Count parking bookings per floor
    parkingSlots.forEach(slot => {
      const floor = slot.floor?.toString();
      if (!floor) return;

      const count = slot.bookings?.length || 0;
      parkingMap[floor] = (parkingMap[floor] || 0) + count;
    });

    // Count seating *documents* per floor
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

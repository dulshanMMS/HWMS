import ParkingSlot from '../models/ParkingSlots.js';
import SeatingSlot from '../models/SeatingSlots.js';
import User from '../models/User.js';
import Team from '../models/Team.js';

// 1. TOTAL TODAY BOOKINGS..................
export const getTodayBookingCount = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [parkingSlots, seatingSlots] = await Promise.all([
      ParkingSlot.find({}),
      SeatingSlot.find({})
    ]);

    const countTodayBookings = (slots) => {
      return slots.reduce((sum, slot) => {
        const todayBookings = slot.bookings.filter(b => b.date === today);
        return sum + todayBookings.length;
      }, 0);
    };

    const total = countTodayBookings(parkingSlots) + countTodayBookings(seatingSlots);

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
    const [parkingSlots, seatingSlots] = await Promise.all([
      ParkingSlot.find({}),
      SeatingSlot.find({})
    ]);

    const floorMap = {};

    const countByFloor = (slots) => {
      slots.forEach(slot => {
        const floor = slot.floor;
        floorMap[floor] = (floorMap[floor] || 0) + slot.bookings.length;
      });
    };

    countByFloor(parkingSlots);
    countByFloor(seatingSlots);

    const data = Object.entries(floorMap)
      .map(([floor, count]) => ({ floor, count }))
      .sort((a, b) => a.floor - b.floor);

    res.json({ success: true, data });
  } catch (err) {
    console.error("Error in getFloorBookingCount:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



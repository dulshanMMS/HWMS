import express from "express";
import Booking from "../models/seatBooking.js";
import Team from "../models/Team.js";

const router = express.Router();

// Helper functions to parse and compare times
function parseTimeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function timesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

// GET - Fetch all bookings (seats)
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find();
    const result = { chairs: {} };
    bookings.forEach(b => {
      if (b.chairs) {
        b.chairs.forEach((chairData, chairId) => {
          result.chairs[chairId] = {
            memberName: chairData.memberName,
            teamColor: chairData.teamColor
          };
        });
      }
    });
    res.json(result);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// POST - Book a seat for a team member (team member can book their own seat)
router.post("/member/:userName/seat/:seatId", async (req, res) => {
  const { userName, seatId } = req.params;
  const { roomId, teamName, teamColor, memberName, floor, date, entryTime, exitTime } = req.body;

  try {
    if (!memberName || !teamColor || !date || !entryTime || !exitTime || !floor) {
      return res.status(400).json({ message: "All booking details are required" });
    }

    // Parse date & times
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0); // Normalize to midnight for date comparison
    const entryMinutes = parseTimeToMinutes(entryTime);
    const exitMinutes = parseTimeToMinutes(exitTime);

    // Find existing bookings for same floor and date
    const bookingsOnDateFloor = await Booking.find({ floor, date: bookingDate });

    // Check seat overlap in time range
    for (const booking of bookingsOnDateFloor) {
      if (booking.chairs.has(seatId)) {
        const existingEntry = parseTimeToMinutes(booking.entryTime);
        const existingExit = parseTimeToMinutes(booking.exitTime);

        if (timesOverlap(entryMinutes, exitMinutes, existingEntry, existingExit)) {
          return res.status(400).json({ message: "Seat already booked for overlapping time slot" });
        }
      }
    }

    // Validate team and member
    const team = await Team.findOne({ teamName });
    if (!team) return res.status(404).json({ message: "Team not found" });
    const member = team.members.find(m => m.name === userName);
    if (!member) return res.status(404).json({ message: "Member not found in the team" });

    // Find existing booking document for same room, floor, and date
    let booking = await Booking.findOne({ areaId: roomId, floor, date: bookingDate });

    if (!booking) {
      // ===== New booking: set all fields including floor, date, entryTime, exitTime =====
      booking = new Booking({
        areaId: roomId,
        teamName,
        floor,
        date: bookingDate,
        entryTime,
        exitTime,
        chairs: new Map([[seatId, { memberName, teamColor }]])
      });
    } else {
      booking.chairs.set(seatId, { memberName, teamColor });

      // ===== IMPORTANT: Add these lines to update floor and date on existing booking =====
      booking.floor = floor;
      booking.date = bookingDate;

      booking.entryTime = entryTime;
      booking.exitTime = exitTime;
      booking.teamName = teamName;
    }

    await booking.save();
    res.json({ message: "Chair booked successfully!", success: true });
  } catch (err) {
    console.error("Error booking chair:", err);
    res.status(500).json({ error: "Failed to book chair" });
  }
});

// POST - Book a seat for the team leader (team leader can book for any member)
router.post("/leader/:userName/member/:teamMemberName/seat/:seatId", async (req, res) => {
  const { userName, seatId, teamMemberName } = req.params;
  const { roomId, teamName, teamColor, memberName, floor, date, entryTime, exitTime } = req.body;

  try {
    if (!memberName || !teamColor || !date || !entryTime || !exitTime || !floor) {
      return res.status(400).json({ message: "All booking details are required" });
    }

    // Parse date & times
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    const entryMinutes = parseTimeToMinutes(entryTime);
    const exitMinutes = parseTimeToMinutes(exitTime);

    // Find bookings on the same floor and date
    const bookingsOnDateFloor = await Booking.find({ floor, date: bookingDate });

    // Check overlapping bookings
    for (const booking of bookingsOnDateFloor) {
      if (booking.chairs.has(seatId)) {
        const existingEntry = parseTimeToMinutes(booking.entryTime);
        const existingExit = parseTimeToMinutes(booking.exitTime);

        if (timesOverlap(entryMinutes, exitMinutes, existingEntry, existingExit)) {
          return res.status(400).json({ message: "Seat already booked for overlapping time slot" });
        }
      }
    }

    // Validate leader role
    const team = await Team.findOne({ teamName });
    if (!team) return res.status(404).json({ message: "Team not found" });
    const leader = team.members.find(m => m.name === userName && m.role === 'leader');
    if (!leader) return res.status(403).json({ message: "Only team leaders can book for members" });

    // Find or create booking document for room/floor/date
    let booking = await Booking.findOne({ areaId: roomId, floor, date: bookingDate });

    if (!booking) {
      // ===== New booking: set all fields including floor, date, entryTime, exitTime =====
      booking = new Booking({
        areaId: roomId,
        teamName,
        floor,
        date: bookingDate,
        entryTime,
        exitTime,
        chairs: new Map([[seatId, { memberName: teamMemberName, teamColor }]])
      });
    } else {
      booking.chairs.set(seatId, { memberName: teamMemberName, teamColor });

      // ===== IMPORTANT: Add these lines to update floor and date on existing booking =====
      booking.floor = floor;
      booking.date = bookingDate;

      booking.entryTime = entryTime;
      booking.exitTime = exitTime;
      booking.teamName = teamName;
    }

    await booking.save();
    res.json({ message: `Seat ${seatId} booked for ${teamMemberName} successfully!`, success: true });
  } catch (err) {
    console.error("Error booking chair:", err);
    res.status(500).json({ error: "Failed to book chair" });
  }
});

// DELETE - Unbook a seat
router.delete("/unbook/:roomId/:seatId/:floor/:date", async (req, res) => {
  const { roomId, seatId, floor, date } = req.params;

  try {
    console.log("Unbooking seat request params:", { roomId, seatId, floor, date });

    // Normalize date using UTC midnight to avoid timezone issues
    const bookingDate = new Date(date);
    bookingDate.setUTCHours(0, 0, 0, 0);

    // Find the booking document by room, floor (as number), date
    const booking = await Booking.findOne({ 
      areaId: roomId, 
      floor: Number(floor), 
      date: bookingDate 
    });
    console.log("Booking found:", booking);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found for given room/floor/date" });
    }

    const chairKeys = Array.from(booking.chairs.keys());
    console.log("Chairs in booking:", chairKeys);

    if (!booking.chairs.has(seatId)) {
      console.log(`Seat ID ${seatId} not found in booking chairs`);
      return res.status(404).json({ error: "Seat not found in this booking" });
    }

    // Remove the seat from chairs map
    const chairsObj = Object.fromEntries(booking.chairs);
    delete chairsObj[seatId];
    booking.chairs = chairsObj;

    // Save updated booking
    await booking.save();
    console.log(`Seat ${seatId} successfully unbooked and booking saved`);

    return res.json({ message: `Seat ${seatId} unbooked successfully!`, success: true });
  } catch (err) {
    console.error("Error unbooking seat:", err);
    return res.status(500).json({ error: "Failed to unbook seat due to server error" });
  }
});



export default router;

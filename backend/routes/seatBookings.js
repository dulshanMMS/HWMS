import express from "express";
import Booking from "../models/seatBooking.js"; // Import the Booking model

const router = express.Router();

// GET - Fetch all bookings (seats)
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find();
    const result = { chairs: {} };
    bookings.forEach(b => {
      const chairs = Object.fromEntries(b.chairs || []);
      Object.entries(chairs).forEach(([chairId, userName]) => {
        result.chairs[chairId] = userName;
      });
    });
    res.json(result);  // Return { chairs: { "chairId": "userName" } }
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// POST - Book a chair (team leader can book for any member)
router.post("/leader/:userName/member/:teamMemberName/seat/:seatId", async (req, res) => {
  const { userName, seatId, teamMemberName } = req.params;
  const { roomId, teamName } = req.body; // Extract teamName from request body

  console.log(`Team Leader ${userName} is booking seat ${seatId} for member ${teamMemberName} in room ${roomId} with team ${teamName}`);

  try {
    // Find the booking for the room (areaId)
    let booking = await Booking.findOne({ areaId: roomId });

    if (!booking) {
      // If the room doesn't have a booking yet, create one
      booking = new Booking({
        areaId: roomId,
        teamName: teamName || null,  // Save teamName
        teamColor: null,
        chairs: { [seatId]: teamMemberName },  // Assign seat to the team member
      });
      await booking.save();  // Save the booking
    } else {
      // If the room is already booked, assign the seat to the team member
      booking.teamName = teamName || booking.teamName;  // Update teamName if provided
      booking.chairs.set(seatId, teamMemberName);
      await booking.save();  // Save the updated booking
    }

    res.json({ message: `Seat ${seatId} booked for ${teamMemberName} successfully!`, success: true });
  } catch (err) {
    console.error("Error booking chair:", err);
    res.status(500).json({ error: "Failed to book chair" });
  }
});

// POST - Book a seat for the user (team member can book their own seat)
router.post("/member/:userName/seat/:seatId", async (req, res) => {
  const { userName, seatId } = req.params;
  const { roomId, teamName } = req.body; // Extract teamName from request body

  console.log(`Booking seat ${seatId} in room ${roomId} for user ${userName} with team ${teamName}`);

  try {
    let booking = await Booking.findOne({ areaId: roomId });

    if (!booking) {
      // If no booking for the room, create a new one
      booking = new Booking({
        areaId: roomId,
        teamName: teamName || null,  // Save teamName
        teamColor: null,
        chairs: { [seatId]: userName },
      });
      await booking.save();  // Save the new booking
    } else {
      // If the room exists, book the chair for the user
      booking.teamName = teamName || booking.teamName;  // Update teamName if provided
      booking.chairs.set(seatId, userName);
      await booking.save();  // Save the updated booking
    }

    res.json({ message: "Chair booked successfully!", success: true });
  } catch (err) {
    console.error("Error booking chair:", err);
    res.status(500).json({ error: "Failed to book chair" });
  }
});

// DELETE - Unbook a seat
router.delete("/unbook/:seatId", async (req, res) => {
  const { seatId } = req.params;

  try {
    // Find the booking containing the seat
    const booking = await Booking.findOne({ "chairs": { $exists: true, $ne: null } });
    if (booking && booking.chairs.has(seatId)) {
      booking.chairs.delete(seatId);
      await booking.save();
      res.json({ message: `Seat ${seatId} unbooked successfully!`, success: true });
    } else {
      res.status(404).json({ error: "Seat not found" });
    }
  } catch (err) {
    console.error("Error unbooking seat:", err);
    res.status(500).json({ error: "Failed to unbook seat" });
  }
});

export default router;
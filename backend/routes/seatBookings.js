import express from "express";
import Booking from "../models/seatBooking.js";
import Team from "../models/Team.js";

const router = express.Router();

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
  const { roomId, teamName, teamColor, memberName } = req.body;

  try {
    console.log("Booking seat for member:", { userName, seatId, roomId, teamName, teamColor, memberName });

    // Validate required fields
    if (!memberName || !teamColor) {
      return res.status(400).json({ message: "memberName and teamColor are required" });
    }

    // Find the team in the database
    const team = await Team.findOne({ teamName: teamName });
    console.log("Found team:", team ? team.teamName : "Not found");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Find the member in the team
    const member = team.members.find(member => member.name === userName);
    console.log("Found member:", member ? member.name : "Not found");

    if (!member) {
      return res.status(404).json({ message: "Member not found in the team" });
    }

    // If the member exists, proceed to book the seat
    let booking = await Booking.findOne({ areaId: roomId });
    console.log("Existing booking for room:", booking ? booking.areaId : "Not found");

    if (!booking) {
      // If no booking exists for the room, create a new one
      console.log("Creating new booking for room:", roomId);
      booking = new Booking({
        areaId: roomId,
        teamName: teamName,
        chairs: new Map([
          [seatId, { memberName, teamColor }]
        ])
      });
      await booking.save();
      console.log("New booking saved:", booking);
    } else {
      // Check if the seat is already booked
      if (booking.chairs.has(seatId)) {
        return res.status(400).json({ message: "Seat is already booked" });
      }
      // Update the booking with the member's seat
      console.log("Updating existing booking with seat:", seatId);
      booking.teamName = teamName;
      booking.chairs.set(seatId, { memberName, teamColor });
      await booking.save();
      console.log("Updated booking saved:", booking);
    }

    res.json({ message: "Chair booked successfully!", success: true });
  } catch (err) {
    console.error("Error booking chair:", err.message, err.stack);
    res.status(500).json({ error: "Failed to book chair: " + err.message });
  }
});

// POST - Book a seat for the team leader (team leader can book for any member)
router.post("/leader/:userName/member/:teamMemberName/seat/:seatId", async (req, res) => {
  const { userName, seatId, teamMemberName } = req.params;
  const { roomId, teamName, teamColor, memberName } = req.body;

  try {
    console.log("Booking seat for leader:", { userName, teamMemberName, seatId, roomId, teamName, teamColor, memberName });

    // Validate required fields
    if (!memberName || !teamColor) {
      return res.status(400).json({ message: "memberName and teamColor are required" });
    }

    // Check if the user is a team leader
    const team = await Team.findOne({ teamName: teamName });
    console.log("Found team:", team ? team.teamName : "Not found");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const leader = team.members.find(member => member.name === userName && member.role === 'leader');
    console.log("Found leader:", leader ? leader.name : "Not found");

    if (!leader) {
      return res.status(403).json({ message: "Only team leaders can book for members" });
    }

    // Removed teamMemberName validation to allow booking for new members
    // Proceed with the booking if the user is a team leader
    let booking = await Booking.findOne({ areaId: roomId });
    console.log("Existing booking for room:", booking ? booking.areaId : "Not found");

    if (!booking) {
      // If no booking exists for the room, create a new one
      console.log("Creating new booking for room:", roomId);
      booking = new Booking({
        areaId: roomId,
        teamName: teamName,
        chairs: new Map([
          [seatId, { memberName: teamMemberName, teamColor }]
        ])
      });
      await booking.save();
      console.log("New booking saved:", booking);
    } else {
      // Check if the seat is already booked
      if (booking.chairs.has(seatId)) {
        return res.status(400).json({ message: "Seat is already booked" });
      }
      // Update the booking with the member's seat
      console.log("Updating existing booking with seat:", seatId);
      booking.teamName = teamName;
      booking.chairs.set(seatId, { memberName: teamMemberName, teamColor });
      await booking.save();
      console.log("Updated booking saved:", booking);
    }

    res.json({ message: `Seat ${seatId} booked for ${teamMemberName} successfully!`, success: true });
  } catch (err) {
    console.error("Error booking chair:", err.message, err.stack);
    res.status(500).json({ error: "Failed to book chair: " + err.message });
  }
});

// DELETE - Unbook a seat
router.delete("/unbook/:roomId/:seatId", async (req, res) => {
  const { roomId, seatId } = req.params;

  try {
    const booking = await Booking.findOne({ areaId: roomId });
    if (booking && booking.chairs.has(seatId)) {
      booking.chairs.delete(seatId);
      await booking.save();
      res.json({ message: `Seat ${seatId} unbooked successfully!`, success: true });
    } else {
      res.status(404).json({ error: "Seat not found in this room" });
    }
  } catch (err) {
    console.error("Error unbooking seat:", err);
    res.status(500).json({ error: "Failed to unbook seat" });
  }
});

export default router;
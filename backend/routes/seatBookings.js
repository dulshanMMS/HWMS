import express from "express";
import Booking from "../models/seatBooking.js";
import Team from "../models/Team.js";
import User from "../models/User.js";  

const router = express.Router();

// Helper functions to parse and compare times
function parseTimeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

// Helper function: Check if two time ranges overlap
function timesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

// GET user info by username
router.get("/users/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Map the role field from the new model (admin/user) to the old expected format (leader/member)
    const userResponse = {
      ...user.toObject(),
      role: user.role === "admin" ? "leader" : "member"
    };
    
    res.json(userResponse);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// REMOVED: Duplicate team route - now handled in teamRoutes.js
// This was causing the conflict

// GET team members by teamId
router.get("/users/team/:teamId", async (req, res) => {
  try {
    const users = await User.find({ teamId: req.params.teamId }).select("-password");
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found for this team" });
    }
    
    // Map the role field for each user
    const mappedUsers = users.map(user => ({
      ...user.toObject(),
      role: user.role === "admin" ? "leader" : "member"
    }));
    
    res.json(mappedUsers);
  } catch (err) {
    console.error("Error fetching team members:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET - Fetch bookings filtered by date and floor
router.get("/filtered", async (req, res) => {
  try {
    const { date, floor } = req.query;
    
    console.log("🔍 Fetching filtered bookings:", { date, floor });
    
    if (!date || !floor) {
      return res.status(400).json({ error: "Date and floor are required" });
    }
    
    // Parse the date
    const inputDate = new Date(date + 'T00:00:00.000Z');
    const startOfDay = new Date(inputDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(inputDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log("📅 Date range:", { start: startOfDay, end: endOfDay });
    
    // Find bookings for the specific date and floor
    const bookings = await Booking.find({
      floor: Number(floor),
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: 'active'
    });
    
    console.log("📊 Found bookings:", bookings.length);
    
    const result = { chairs: {} };

    // Process each booking to extract chair data
    bookings.forEach(booking => {
      console.log("📋 Processing booking:", {
        id: booking._id,
        areaId: booking.areaId,
        chairs: Array.from(booking.chairs.keys())
      });
      
      if (booking.chairs instanceof Map) {
        for (const [chairId, chairData] of booking.chairs.entries()) {
          result.chairs[chairId] = {
            memberName: chairData.memberName,
            teamColor: chairData.teamColor,
            teamId: chairData.teamId,
            bookedAt: chairData.bookedAt
          };
        }
      } else {
        console.warn("Chairs is not a Map:", booking.chairs);
      }
    });
    
    console.log("✅ Filtered result:", {
      totalChairs: Object.keys(result.chairs).length,
      chairs: Object.keys(result.chairs)
    });

    res.json(result);
  } catch (err) {
    console.error("Error fetching filtered bookings:", err);
    res.status(500).json({ error: "Failed to fetch filtered bookings" });
  }
});

// GET - Fetch all bookings (seats) - keep existing route for backward compatibility
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'active' });
    const result = { chairs: {} };

    bookings.forEach(b => {
      if (b.chairs instanceof Map) {
        for (const [chairId, chairData] of b.chairs.entries()) {
          result.chairs[chairId] = {
            memberName: chairData.memberName,
            teamColor: chairData.teamColor
          };
        }
      } else {
        console.warn("Chairs is not a Map:", b.chairs);
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
  const { roomId, teamName, teamColor, color, memberName, floor, date, entryTime, exitTime } = req.body;

  // Use either teamColor or color field
  const actualTeamColor = teamColor || color;

  try {
    if (!memberName || !actualTeamColor || !date || !entryTime || !exitTime || !floor) {
      return res.status(400).json({ message: "All booking details are required" });
    }

    console.log("🔍 === BOOKING DEBUG START ===");
    console.log("📋 Booking request:", {
      userName,
      seatId,
      roomId,
      teamName,
      actualTeamColor,
      memberName,
      floor,
      date,
      entryTime,
      exitTime
    });

    // Parse date more carefully to avoid timezone issues
    const bookingDate = new Date(date + 'T00:00:00.000Z'); // Force UTC interpretation
    console.log("📅 Original date string:", date);
    console.log("📅 Parsed booking date:", bookingDate);
    console.log("📅 Booking date ISO:", bookingDate.toISOString());
    
    const entryMinutes = parseTimeToMinutes(entryTime);
    const exitMinutes = parseTimeToMinutes(exitTime);

    // Check for existing bookings with overlapping time slots
    const bookingsOnDateFloor = await Booking.find({ 
      floor, 
      date: bookingDate,
      status: 'active'
    });

    console.log("🔍 Existing bookings on this date/floor:", bookingsOnDateFloor.length);

    for (const booking of bookingsOnDateFloor) {
      if (booking.chairs.has(seatId)) {
        const existingEntry = parseTimeToMinutes(booking.entryTime);
        const existingExit = parseTimeToMinutes(booking.exitTime);

        if (timesOverlap(entryMinutes, exitMinutes, existingEntry, existingExit)) {
          return res.status(400).json({ message: "Seat already booked for overlapping time slot" });
        }
      }
    }

    // Find team by teamName
    const team = await Team.findOne({ teamName });
    if (!team) return res.status(404).json({ message: "Team not found" });

    // Find user by username and teamId
    const member = await User.findOne({ username: userName, teamId: team.teamId });
    if (!member) return res.status(404).json({ message: "Member not found in the team" });

    // FIXED: Look for existing booking with the EXACT same parameters
    let booking = await Booking.findOne({ 
      areaId: roomId, 
      floor, 
      date: bookingDate,
      entryTime,
      exitTime,
      teamName,
      status: 'active'
    });

    console.log("🔍 Found existing booking:", booking ? "YES" : "NO");

    if (!booking) {
      // Create new booking
      booking = new Booking({
        areaId: roomId,
        teamName,
        floor,
        date: bookingDate,
        entryTime,
        exitTime,
        bookedBy: userName,
        status: 'active',
        chairs: new Map([[seatId, { 
          memberName, 
          teamColor: actualTeamColor, 
          teamId: team.teamId,
          bookedAt: new Date() 
        }]])
      });
      console.log("✅ Created new booking");
    } else {
      // Update existing booking
      booking.chairs.set(seatId, { 
        memberName, 
        teamColor: actualTeamColor, 
        teamId: team.teamId,
        bookedAt: new Date() 
      });
      console.log("✅ Updated existing booking");
    }

    await booking.save();
    console.log("✅ Booking saved successfully!");
    console.log("📊 Saved booking details:", {
      id: booking._id,
      areaId: booking.areaId,
      floor: booking.floor,
      date: booking.date,
      formattedDate: booking.date.toISOString().split('T')[0],
      entryTime: booking.entryTime,
      exitTime: booking.exitTime,
      chairs: Array.from(booking.chairs.entries()).map(([key, value]) => ({
        chairId: key,
        memberName: value.memberName,
        teamColor: value.teamColor,
        teamId: value.teamId
      }))
    });
    console.log("🔍 === BOOKING DEBUG END ===");
    
    res.json({ message: "Chair booked successfully!", success: true });
  } catch (err) {
    console.error("Error booking chair:", err);
    res.status(500).json({ error: "Failed to book chair" });
  }
});

// POST - Book a seat for the team leader (team leader can book for any member)
router.post("/leader/:userName/member/:teamMemberName/seat/:seatId", async (req, res) => {
  const { userName, seatId, teamMemberName } = req.params;
  const { roomId, teamName, teamColor, color, memberName, floor, date, entryTime, exitTime } = req.body;

  console.log("🛬 Leader booking request received:", {
    userName,
    seatId,
    teamMemberName,
    roomId,
    teamName,
    teamColor,
    memberName,
    floor,
    date,
    entryTime,
    exitTime,
  });

  const actualTeamColor = teamColor || color;

  try {
    if (!memberName || !actualTeamColor || !date || !entryTime || !exitTime || !floor) {
      return res.status(400).json({ message: "All booking details are required" });
    }

    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    console.log("📅 Leader booking date set to:", bookingDate);
    
    const entryMinutes = parseTimeToMinutes(entryTime);
    const exitMinutes = parseTimeToMinutes(exitTime);

    // Check for existing bookings with overlapping time slots
    const bookingsOnDateFloor = await Booking.find({ 
      floor, 
      date: bookingDate,
      status: 'active'
    });

    console.log("🔍 Leader booking - Existing bookings on this date/floor:", bookingsOnDateFloor.length);

    for (const booking of bookingsOnDateFloor) {
      if (booking.chairs.has(seatId)) {
        const existingEntry = parseTimeToMinutes(booking.entryTime);
        const existingExit = parseTimeToMinutes(booking.exitTime);

        if (timesOverlap(entryMinutes, exitMinutes, existingEntry, existingExit)) {
          return res.status(400).json({ message: "Seat already booked for overlapping time slot" });
        }
      }
    }

    // Find team by teamName
    const team = await Team.findOne({ teamName });
    if (!team) return res.status(404).json({ message: "Team not found" });

    // Check if the booking user is an admin (leader)
    const leader = await User.findOne({ username: userName, teamId: team.teamId, role: "admin" });
    if (!leader) return res.status(403).json({ message: "Only team leaders can book for members" });

    // Find the team member to book for
    const teamMember = await User.findOne({ username: teamMemberName, teamId: team.teamId });
    if (!teamMember) return res.status(404).json({ message: "Team member not found in the team" });

    // FIXED: Look for existing booking with the EXACT same parameters
    let booking = await Booking.findOne({ 
      areaId: roomId, 
      floor, 
      date: bookingDate,
      entryTime,
      exitTime,
      teamName,
      status: 'active'
    });

    console.log("🔍 Leader booking - Found existing booking:", booking ? "YES" : "NO");

    if (!booking) {
      // Create new booking
      booking = new Booking({
        areaId: roomId,
        teamName,
        floor,
        date: bookingDate,
        entryTime,
        exitTime,
        bookedBy: userName,
        status: 'active',
        chairs: new Map([[seatId, { 
          memberName: teamMemberName, 
          teamColor: actualTeamColor, 
          teamId: team.teamId,
          bookedAt: new Date() 
        }]])
      });
      console.log("✅ Leader booking - Created new booking");
    } else {
      // Update existing booking
      booking.chairs.set(seatId, { 
        memberName: teamMemberName, 
        teamColor: actualTeamColor, 
        teamId: team.teamId,
        bookedAt: new Date() 
      });
      console.log("✅ Leader booking - Updated existing booking");
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
    console.log("🔍 === UNBOOKING DEBUG START ===");
    console.log("📋 Request params:", { roomId, seatId, floor, date });

    // Parse the incoming date
    const inputDate = new Date(date);
    console.log("📅 Input date parsed:", inputDate);
    
    // Create date range for the entire day
    const startOfDay = new Date(inputDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(inputDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log("🔍 Date range:", { start: startOfDay, end: endOfDay });

    // FIRST: Check what bookings exist for this room/floor (any date)
    const allBookingsForRoom = await Booking.find({ 
      areaId: roomId, 
      floor: Number(floor) 
    });
    
    console.log("📊 All bookings for room/floor:", allBookingsForRoom.map(b => ({
      id: b._id,
      areaId: b.areaId,
      floor: b.floor,
      date: b.date,
      formattedDate: b.date.toISOString().split('T')[0],
      chairs: Array.from(b.chairs.keys())
    })));

    // SECOND: Check if ANY booking exists for this exact date (any room/floor)
    const allBookingsForDate = await Booking.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });
    
    console.log("📊 All bookings for this date:", allBookingsForDate.map(b => ({
      id: b._id,
      areaId: b.areaId,
      floor: b.floor,
      date: b.date,
      chairs: Array.from(b.chairs.keys())
    })));

    // THIRD: Search for bookings that contain the specific seat
    const bookingsWithSeat = await Booking.find({
      areaId: roomId,
      floor: Number(floor),
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: 'active'
    });

    console.log("🔍 Bookings with date/room/floor:", bookingsWithSeat.length);
    
    // Find the booking that actually contains this seat
    let booking = null;
    for (const b of bookingsWithSeat) {
      if (b.chairs.has(seatId)) {
        booking = b;
        console.log("🎯 Found booking with seat:", {
          bookingId: b._id,
          chairs: Array.from(b.chairs.keys())
        });
        break;
      }
    }

    console.log("🎯 Final booking found:", booking ? "YES" : "NO");
    
    if (!booking) {
      console.log("❌ BOOKING NOT FOUND");
      console.log("🔍 Search criteria:", {
        areaId: roomId,
        floor: Number(floor),
        dateRange: { start: startOfDay, end: endOfDay }
      });
      
      return res.status(404).json({ 
        error: "Booking not found for given room/floor/date",
        debug: {
          searchParams: { roomId, floor: Number(floor), date: inputDate },
          dateRange: { start: startOfDay, end: endOfDay },
          totalBookingsForRoom: allBookingsForRoom.length,
          totalBookingsForDate: allBookingsForDate.length,
          allRoomBookings: allBookingsForRoom.map(b => ({
            date: b.date.toISOString().split('T')[0],
            chairs: Array.from(b.chairs.keys())
          }))
        }
      });
    }

    console.log("🪑 Booking found! Chairs:", Array.from(booking.chairs.keys()));
    console.log("🎯 Looking for seat:", seatId);
    
    if (!booking.chairs.has(seatId)) {
      console.log("❌ SEAT NOT FOUND IN BOOKING");
      return res.status(404).json({ 
        error: "Seat not found in this booking",
        debug: {
          requestedSeat: seatId,
          availableSeats: Array.from(booking.chairs.keys()),
          bookingDate: booking.date.toISOString().split('T')[0]
        }
      });
    }

    // Get seat data before removing
    const seatData = booking.chairs.get(seatId);
    console.log("🗑️ Removing seat data:", seatData);
    
    // Remove seat from Map
    booking.chairs.delete(seatId);
    
    // Save the booking
    await booking.save();

    console.log("✅ Seat unbooked successfully!");
    console.log("🔍 === UNBOOKING DEBUG END ===");
    
    return res.json({ 
      message: `Seat ${seatId} unbooked successfully!`, 
      success: true,
      debug: {
        removedSeat: seatData,
        remainingSeats: Array.from(booking.chairs.keys())
      }
    });
  } catch (err) {
    console.error("❌ Error unbooking seat:", err);
    return res.status(500).json({ 
      error: "Failed to unbook seat due to server error",
      details: err.message 
    });
  }
});

export default router;
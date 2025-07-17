// controllers/seatBookingController.js - OPTION 1: Complete fixed version
import User from "../models/User.js";
import { 
  addBookingToMember,
  removeBookingFromMember,
  verifyUserPermissions,
  getAllBookingsForDisplay,
  getFilteredBookings,
  getMemberBookingStats,
  findBookingForUnbooking
} from "../services/seatBookingService.js";

// Color conversion helper function
const convertToHexColor = (teamColor) => {
  if (!teamColor) return '#22c55e';
  if (teamColor.startsWith('#')) return teamColor;
  
  const colorMap = {
    'bg-red-500': '#ef4444',
    'bg-green-500': '#22c55e',
    'bg-blue-500': '#3b82f6',
    'bg-yellow-500': '#eab308',
    'bg-purple-500': '#a855f7',
    'bg-pink-500': '#ec4899',
    'bg-indigo-500': '#6366f1',
    'bg-orange-500': '#f97316',
    'bg-teal-500': '#14b8a6',
    'bg-cyan-500': '#06b6d4'
  };
  
  return colorMap[teamColor] || '#22c55e';
};

// OPTION 1: Controller functions - query with username, return userName
export const getUserByUsername = async (req, res) => {
  try {
    // Query database with username field (what's actually in database)
    const user = await User.findOne({ username: req.params.username }).select("-password");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Map the response to provide userName for frontend
    const userResponse = {
      ...user.toObject(),
      userName: user.username, // Map username to userName for frontend
      role: user.role === "admin" ? "leader" : "member"
    };
    
    res.json(userResponse);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getTeamMembers = async (req, res) => {
  try {
    // Query with username field
    const users = await User.find({ teamId: req.params.teamId }).select("-password");
    
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found for this team" });
    }
    
    // Map each user to provide userName field
    const mappedUsers = users.map(user => ({
      ...user.toObject(),
      userName: user.username, // Map username to userName for frontend
      role: user.role === "admin" ? "leader" : "member"
    }));
    
    res.json(mappedUsers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Booking display controllers
export const getFilteredBookingsController = async (req, res) => {
  try {
    const { date, floor } = req.query;
    
    if (!date || !floor) {
      return res.status(400).json({ 
        error: "Missing required parameters", 
        details: ["date and floor are required"]
      });
    }
    
    console.log("🔍 Fetching filtered bookings:", { date, floor });
    
    // Get filtered bookings using service
    const result = await getFilteredBookings(date, floor);
    
    console.log("✅ Filtered result:", {
      totalChairs: Object.keys(result.chairs).length,
      chairs: Object.keys(result.chairs)
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching filtered bookings:", error);
    res.status(500).json({ error: "Failed to fetch filtered bookings" });
  }
};

export const getAllBookingsController = async (req, res) => {
  try {
    const result = await getAllBookingsForDisplay();
    res.json(result);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

// Add this to your backend controller
export const getAllBookingsForDate = async (req, res) => {
  try {
    const { date, floor } = req.query;

    // Get ALL bookings for the date/floor
    const result = await getFilteredBookings(date, floor);

    // Transform chair data to use `userName` consistently
    const transformedChairs = {};
    for (const [chairId, booking] of Object.entries(result.chairs)) {
      transformedChairs[chairId] = {
        userName: booking.userName, // Keep userName consistent
        username: booking.userName, // Provide username for backward compatibility
        color: booking.teamColor,
        timeSlot: booking.timeSlot,
      };
    }

    res.json({ chairs: transformedChairs });
  } catch (error) {
    console.error('Error getting all bookings:', error);
    res.status(500).json({ error: error.message });
  }
};

// OPTION 1: Member booking controller
export const bookSeatForMember = async (req, res) => {
  const { userName, seatId } = req.params;

  try {
    console.log("🔍 === MEMBER BOOKING DEBUG START ===");
    console.log("📋 Raw request body:", req.body);
    console.log("📋 Route params:", req.params);
    
    // Extract booking data from request
    const { roomId, areaId, teamName, floor, date, entryTime, exitTime, memberName, teamColor, color } = req.body;
    const actualAreaId = areaId || roomId; // Support both field names
    const actualTeamColor = teamColor || color;
    
    // Basic validation
    if (!actualAreaId || !teamName || !floor || !date || !entryTime || !exitTime) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ 
        message: "Missing required fields",
        required: ["areaId/roomId", "teamName", "floor", "date", "entryTime", "exitTime"],
        received: Object.keys(req.body)
      });
    }

    // Date validation - no past dates
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return res.status(400).json({ 
        message: "Cannot book seats for past dates",
        requestedDate: date,
        todayDate: today.toISOString().split('T')[0]
      });
    }

    console.log("📋 Processed booking request:", { 
      userName, 
      seatId, 
      actualAreaId, 
      teamName, 
      floor, 
      date, 
      entryTime, 
      exitTime,
      actualTeamColor 
    });

    // Prepare booking data
    const bookingData = {
      areaId: actualAreaId,
      floor: Number(floor),
      date: date,
      entryTime: entryTime,
      exitTime: exitTime,
      seatId: seatId
    };

    console.log("📋 bookingData being passed to addBookingToMember:", bookingData);

    // Use userName consistently
    const result = await addBookingToMember(userName, bookingData);
    
    console.log("✅ Booking saved successfully!");
    console.log("📊 Booking details:", {
      userName: userName,
      bookingId: result.bookingId,
      totalBookings: result.totalBookings
    });
    console.log("🔍 === MEMBER BOOKING DEBUG END ===");
    
    // Get the updated member record with team info for frontend
    const updatedRecord = result.memberRecord;
    const hexColor = convertToHexColor(updatedRecord.teamColor);
    
    res.json({ 
      message: "Chair booked successfully!", 
      success: true,
      booking: {
        bookingId: result.bookingId,
        userName: userName,
        username: userName,  // Provide both for compatibility
        seatId: seatId,
        date: date,
        timeSlot: `${entryTime} - ${exitTime}`,
        totalBookings: result.totalBookings,
        teamColor: hexColor,
        teamName: updatedRecord.teamName,
        teamId: updatedRecord.teamId
      }
    });
  } catch (error) {
    console.error("Error booking chair for member:", error);
    
    // Handle specific error types
    if (error.message.includes('conflict') || error.message.includes('already booked')) {
      return res.status(409).json({ message: error.message });
    }
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message.includes('past dates')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ 
      error: "Failed to book chair",
      details: error.message 
    });
  }
};

// OPTION 1: Leader booking for team member
export const bookSeatForTeamMember = async (req, res) => {
  const { userName, seatId, teamMemberName } = req.params;

  try {
    console.log("🛬 === LEADER BOOKING DEBUG START ===");
    console.log("📋 Raw request body:", req.body);
    console.log("📋 Route params:", req.params);
    
    // Extract booking data from request
    const { roomId, areaId, teamName, floor, date, entryTime, exitTime, teamColor, color } = req.body;
    const actualAreaId = areaId || roomId;
    const actualTeamColor = teamColor || color;
    
    // Basic validation
    if (!actualAreaId || !teamName || !floor || !date || !entryTime || !exitTime) {
      return res.status(400).json({ 
        message: "Missing required fields",
        required: ["areaId/roomId", "teamName", "floor", "date", "entryTime", "exitTime"],
        received: Object.keys(req.body)
      });
    }

    // Date validation - no past dates
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return res.status(400).json({ 
        message: "Cannot book seats for past dates",
        requestedDate: date,
        todayDate: today.toISOString().split('T')[0]
      });
    }

    console.log("📋 Leader booking request:", { 
      userName, 
      seatId, 
      teamMemberName, 
      actualAreaId, 
      teamName, 
      floor, 
      date, 
      entryTime, 
      exitTime 
    });

    // Verify leader permissions (optional - for security)
    try {
      await verifyUserPermissions(userName, teamName, teamMemberName);
      console.log("✅ Leader permissions verified");
    } catch (permissionError) {
      if (permissionError.message.includes('Only team leaders')) {
        return res.status(403).json({ message: permissionError.message });
      }
      console.log("⚠️ Permission check failed but continuing:", permissionError.message);
    }

    // Prepare booking data
    const bookingData = {
      areaId: actualAreaId,
      floor: Number(floor),
      date: date,
      entryTime: entryTime,
      exitTime: exitTime,
      seatId: seatId
    };

    console.log("📋 bookingData being passed to addBookingToMember:", bookingData);

    // Use teamMemberName consistently
    const result = await addBookingToMember(teamMemberName, bookingData);
    
    console.log("✅ Leader booking saved successfully!");
    console.log("📊 Leader booking details:", {
      bookedFor: teamMemberName,
      bookedBy: userName,
      bookingId: result.bookingId,
      totalBookings: result.totalBookings
    });
    console.log("🔍 === LEADER BOOKING DEBUG END ===");
    
    // Get the updated member record with team info for frontend
    const updatedRecord = result.memberRecord;
    const hexColor = convertToHexColor(updatedRecord.teamColor);
    
    res.json({ 
      message: `Seat ${seatId} booked for ${teamMemberName} successfully!`, 
      success: true,
      booking: {
        bookingId: result.bookingId,
        userName: teamMemberName,
        username: teamMemberName,  // Provide both for compatibility
        bookedBy: userName,
        seatId: seatId,
        date: date,
        timeSlot: `${entryTime} - ${exitTime}`,
        totalBookings: result.totalBookings,
        teamColor: hexColor,
        teamName: updatedRecord.teamName,
        teamId: updatedRecord.teamId
      }
    });
  } catch (error) {
    console.error("Error booking chair for team member:", error);
    
    // Handle specific error types
    if (error.message.includes('conflict') || error.message.includes('already booked')) {
      return res.status(409).json({ message: error.message });
    }
    
    if (error.message.includes('Only team leaders')) {
      return res.status(403).json({ message: error.message });
    }
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ 
      error: "Failed to book chair",
      details: error.message 
    });
  }
};

// OPTION 1: Unbook seat controller
export const unbookSeat = async (req, res) => {
  const { roomId, seatId, floor, date } = req.params;

  try {
    console.log("🔍 === UNBOOKING DEBUG START ===");
    console.log("📋 Request params:", { roomId, seatId, floor, date });

    // Basic validation
    if (!roomId || !seatId || !floor || !date) {
      return res.status(400).json({ 
        error: "Missing required parameters", 
        details: ["roomId", "seatId", "floor", "date are all required"]
      });
    }

    // For unbooking, we need to find the booking first
    const foundBooking = await findBookingForUnbooking(seatId, floor, date);
    
    if (!foundBooking) {
      console.log("❌ BOOKING NOT FOUND");
      return res.status(404).json({ 
        error: "Booking not found for given seat/floor/date",
        debug: {
          searchParams: { roomId, seatId, floor: Number(floor), date }
        }
      });
    }

    const { memberRecord, booking } = foundBooking;
    
    // Use consistent userName field
    const memberName = memberRecord.userName;
    
    console.log("🎯 Found booking:", {
      userName: memberName,
      bookingId: booking.bookingId,
      seatId: booking.seatId,
      timeSlot: `${booking.entryTime} - ${booking.exitTime}`
    });

    // Remove booking
    const result = await removeBookingFromMember(
      memberName,
      memberRecord.teamId,
      booking.seatId,
      booking.date,
      booking.entryTime,
      booking.exitTime
    );

    console.log("✅ Seat unbooked successfully!");
    console.log("📊 Remaining bookings:", result.remainingBookings);
    console.log("🔍 === UNBOOKING DEBUG END ===");
    
    return res.json({ 
      message: `Seat ${seatId} unbooked successfully!`, 
      success: true,
      details: {
        userName: memberName,
        removedBookingId: booking.bookingId,
        remainingBookings: result.remainingBookings,
        timeSlot: `${booking.entryTime} - ${booking.exitTime}`
      }
    });
  } catch (error) {
    console.error("❌ Error unbooking seat:", error);
    return res.status(500).json({ 
      error: "Failed to unbook seat due to server error",
      details: error.message 
    });
  }
};

// Get member's booking statistics
export const getMemberStats = async (req, res) => {
  const { userName } = req.params;
  const { teamId } = req.query;

  try {
    const stats = await getMemberBookingStats(userName, teamId);
    
    res.json({
      userName: userName,
      ...stats
    });
  } catch (error) {
    console.error("Error getting member stats:", error);
    res.status(500).json({ 
      error: "Failed to get member statistics",
      details: error.message 
    });
  }
};
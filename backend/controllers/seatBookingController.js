// controllers/seatBookingController.js - Member-wise booking controller
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

// Controller functions for user management
export const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Map the role field from the new model (admin/user) to the old expected format (leader/member)
    const userResponse = {
      ...user.toObject(),
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

// Member booking controller
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
    const actualMemberName = memberName || userName;
    
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
      actualMemberName,
      actualTeamColor 
    });

    // Try to verify user permissions, but continue if it fails
    let teamData;
    try {
      const permissions = await verifyUserPermissions(userName, teamName);
      teamData = {
        teamId: permissions.team.teamId,
        teamName: permissions.team.teamName,
        teamColor: actualTeamColor || '#FF5733' // Default color if not provided
      };
    } catch (permissionError) {
      console.log("⚠️ Permission check failed, creating mock team data:", permissionError.message);
      // Create mock team data for backward compatibility
      teamData = {
        teamId: teamName, // Use team name as ID if team not found
        teamName: teamName,
        teamColor: actualTeamColor || '#FF5733'
      };
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

    // Add booking to member's record
    const result = await addBookingToMember(actualMemberName, teamData, bookingData);
    
    console.log("✅ Booking saved successfully!");
    console.log("📊 Booking details:", {
      memberName: actualMemberName,
      bookingId: result.bookingId,
      totalBookings: result.totalBookings,
      teamName: teamData.teamName
    });
    console.log("🔍 === MEMBER BOOKING DEBUG END ===");
    
    res.json({ 
      message: "Chair booked successfully!", 
      success: true,
      booking: {
        bookingId: result.bookingId,
        memberName: actualMemberName,
        seatId: seatId,
        date: date,
        timeSlot: `${entryTime} - ${exitTime}`,
        totalBookings: result.totalBookings,
        teamName: teamData.teamName
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

// Leader booking for team member
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

    // Verify leader permissions
    let teamData;
    try {
      const permissions = await verifyUserPermissions(userName, teamName, teamMemberName);
      teamData = {
        teamId: permissions.team.teamId,
        teamName: permissions.team.teamName,
        teamColor: actualTeamColor || '#FF5733'
      };
    } catch (permissionError) {
      if (permissionError.message.includes('Only team leaders')) {
        return res.status(403).json({ message: permissionError.message });
      }
      
      console.log("⚠️ Permission check failed, creating mock team data:", permissionError.message);
      teamData = {
        teamId: teamName,
        teamName: teamName,
        teamColor: actualTeamColor || '#FF5733'
      };
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

    // Add booking to team member's record
    const result = await addBookingToMember(teamMemberName, teamData, bookingData);
    
    console.log("✅ Leader booking saved successfully!");
    console.log("📊 Leader booking details:", {
      bookedFor: teamMemberName,
      bookedBy: userName,
      bookingId: result.bookingId,
      totalBookings: result.totalBookings
    });
    console.log("🔍 === LEADER BOOKING DEBUG END ===");
    
    res.json({ 
      message: `Seat ${seatId} booked for ${teamMemberName} successfully!`, 
      success: true,
      booking: {
        bookingId: result.bookingId,
        memberName: teamMemberName,
        bookedBy: userName,
        seatId: seatId,
        date: date,
        timeSlot: `${entryTime} - ${exitTime}`,
        totalBookings: result.totalBookings,
        teamName: teamData.teamName
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

// Unbook seat controller
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
    // Since we don't have entryTime/exitTime in the delete route, we need to find by other criteria
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
    
    console.log("🎯 Found booking:", {
      memberName: memberRecord.memberName,
      bookingId: booking.bookingId,
      seatId: booking.seatId,
      timeSlot: `${booking.entryTime} - ${booking.exitTime}`
    });

    // Remove booking from member's record
    const result = await removeBookingFromMember(
      memberRecord.memberName,
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
        memberName: memberRecord.memberName,
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
      memberName: userName,
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
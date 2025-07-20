// controllers/seatBookingController.js - Self-booking only version
import User from "../models/User.js";
import { 
  addBookingToMember,
  removeBookingFromMember,
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

export const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const userResponse = {
      ...user.toObject(),
      userName: user.username,
      role: "member" // Everyone is treated as member for self-booking
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
    
    const mappedUsers = users.map(user => ({
      ...user.toObject(),
      userName: user.username,
      role: "member" // Everyone is treated as member
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

export const getAllBookingsForDate = async (req, res) => {
  try {
    const { date, floor } = req.query;

    const result = await getFilteredBookings(date, floor);

    const transformedChairs = {};
    for (const [chairId, booking] of Object.entries(result.chairs)) {
      transformedChairs[chairId] = {
        userName: booking.userName,
        username: booking.userName,
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

// MODIFIED: Self-booking only - user can only book for themselves
export const bookSeatForMember = async (req, res) => {
  const { userName, seatId } = req.params;

  try {
    console.log("🔍 === SELF BOOKING START ===");
    console.log("📋 Request params:", req.params);
    console.log("📋 Request body:", req.body);
    
    // Extract booking data from request
    const { roomId, areaId, teamName, floor, date, entryTime, exitTime, teamColor, color } = req.body;
    const actualAreaId = areaId || roomId;
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

    console.log("📋 Self-booking request:", { 
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

    // Add booking - only for the user themselves
    const result = await addBookingToMember(userName, bookingData);
    
    console.log("✅ Self-booking saved successfully!");
    console.log("📊 Booking details:", {
      userName: userName,
      bookingId: result.bookingId,
      totalBookings: result.totalBookings
    });
    console.log("🔍 === SELF BOOKING END ===");
    
    const updatedRecord = result.memberRecord;
    const hexColor = convertToHexColor(updatedRecord.teamColor);
    
    res.json({ 
      message: "Chair booked successfully!", 
      success: true,
      booking: {
        bookingId: result.bookingId,
        userName: userName,
        username: userName,
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

// REMOVED: Leader booking functionality - no longer needed

export const unbookSeat = async (req, res) => {
  const { roomId, seatId, floor, date } = req.params;

  try {
    console.log("🔍 === UNBOOKING DEBUG START ===");
    console.log("📋 Request params:", { roomId, seatId, floor, date });

    if (!roomId || !seatId || !floor || !date) {
      return res.status(400).json({ 
        error: "Missing required parameters", 
        details: ["roomId", "seatId", "floor", "date are all required"]
      });
    }

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
    const memberName = memberRecord.userName;
    
    console.log("🎯 Found booking:", {
      userName: memberName,
      bookingId: booking.bookingId,
      seatId: booking.seatId,
      timeSlot: `${booking.entryTime} - ${booking.exitTime}`
    });

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
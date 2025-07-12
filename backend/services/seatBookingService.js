// services/seatBookingService.js - Member-wise booking service
import SeatingSlots from "../models/SeatingSlots.js";
import Team from "../models/Team.js";
import User from "../models/User.js";
import { 
  parseTimeToMinutes, 
  timesOverlap,
  parseDateSafely 
} from "./seatValidationService.js";

// Utility functions moved from model
export const generateBookingId = (userName) => {
  return `${userName}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
};

export const addBookingToRecord = (memberRecord, bookingData) => {
  const bookingId = generateBookingId(memberRecord.userName);
  
  memberRecord.bookings.push({
    bookingId,
    areaId: bookingData.areaId,
    floor: bookingData.floor,
    date: new Date(bookingData.date),
    entryTime: bookingData.entryTime,
    exitTime: bookingData.exitTime,
    seatId: bookingData.seatId,
    bookedAt: new Date()
  });
  
  memberRecord.totalBookings = memberRecord.bookings.length;
  return bookingId;
};

export const removeBookingFromRecord = (memberRecord, bookingId) => {
  const initialLength = memberRecord.bookings.length;
  memberRecord.bookings = memberRecord.bookings.filter(booking => booking.bookingId !== bookingId);
  
  if (memberRecord.bookings.length < initialLength) {
    memberRecord.totalBookings = memberRecord.bookings.length;
    return true;
  }
  return false;
};

export const removeBookingBySeat = (memberRecord, seatId, date, entryTime, exitTime) => {
  const targetDate = new Date(date).toISOString().split('T')[0];
  const initialLength = memberRecord.bookings.length;
  
  memberRecord.bookings = memberRecord.bookings.filter(booking => {
    const bookingDate = new Date(booking.date).toISOString().split('T')[0];
    return !(
      booking.seatId === seatId &&
      bookingDate === targetDate &&
      booking.entryTime === entryTime &&
      booking.exitTime === exitTime
    );
  });
  
  if (memberRecord.bookings.length < initialLength) {
    memberRecord.totalBookings = memberRecord.bookings.length;
    return true;
  }
  return false;
};

export const getBookingsByDateRange = (memberRecord, startDate, endDate) => {
  return memberRecord.bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    return bookingDate >= startDate && bookingDate <= endDate;
  });
};

export const getFutureBookings = (memberRecord) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return memberRecord.bookings.filter(booking => new Date(booking.date) >= now);
};

// Database query functions moved from model statics
export const findMemberCurrentRecord = async (userName) => {
  return await SeatingSlots.findOne({ userName, status: 'active' });
};

export const findMemberByTeam = async (userName, teamId) => {
  return await SeatingSlots.findOne({ userName, teamId, status: 'active' });
};

export const findBookingsByDateAndFloor = async (date, floor) => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const endDate = new Date(targetDate);
  endDate.setHours(23, 59, 59, 999);
  
  return await SeatingSlots.find({
    status: 'active',
    'bookings.date': { $gte: targetDate, $lte: endDate },
    'bookings.floor': floor
  });
};

// Get or create member's booking record for current team
export const getOrCreateMemberRecord = async (userName, teamData) => {
  // First, try to find existing record for current team
  let memberRecord = await findMemberByTeam(userName, teamData.teamId);
  
  if (!memberRecord) {
    // Create new record for this member-team combination
    memberRecord = new SeatingSlots({
      userName,
      teamId: teamData.teamId,
      teamName: teamData.teamName,
      teamColor: teamData.teamColor,
      bookings: [],
      totalBookings: 0,
      status: 'active'
    });
    
    await memberRecord.save();
    console.log(`✅ Created new member record for ${userName} in team ${teamData.teamName}`);
  }
  
  return memberRecord;
};

// Business validation functions - moved from model
export const validateBookingConflict = (memberRecord, seatId, date, entryTime, exitTime) => {
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const timesOverlap = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
  };
  
  const requestDate = new Date(date).toISOString().split('T')[0];
  const requestStart = parseTime(entryTime);
  const requestEnd = parseTime(exitTime);
  
  return memberRecord.bookings.some(booking => {
    const bookingDate = new Date(booking.date).toISOString().split('T')[0];
    
    if (bookingDate === requestDate && booking.seatId === seatId) {
      const bookingStart = parseTime(booking.entryTime);
      const bookingEnd = parseTime(booking.exitTime);
      return timesOverlap(requestStart, requestEnd, bookingStart, bookingEnd);
    }
    
    return false;
  });
};

// Check seat availability across all members - moved from model
export const checkSeatAvailability = async (seatId, floor, date, entryTime, exitTime) => {
  try {
    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const timesOverlap = (start1, end1, start2, end2) => {
      return start1 < end2 && start2 < end1;
    };
    
    const targetDate = new Date(date).toISOString().split('T')[0];
    const requestStart = parseTime(entryTime);
    const requestEnd = parseTime(exitTime);
    
    // Find all member records that have bookings on this date and floor
    const memberRecords = await findBookingsByDateAndFloor(date, floor);
    
    for (const memberRecord of memberRecords) {
      for (const booking of memberRecord.bookings) {
        const bookingDate = new Date(booking.date).toISOString().split('T')[0];
        
        if (bookingDate === targetDate && booking.seatId === seatId && booking.floor === floor) {
          const bookingStart = parseTime(booking.entryTime);
          const bookingEnd = parseTime(booking.exitTime);
          
          if (timesOverlap(requestStart, requestEnd, bookingStart, bookingEnd)) {
            return {
              available: false,
              conflict: {
                userName: memberRecord.userName,
                teamName: memberRecord.teamName,
                existingTime: `${booking.entryTime} - ${booking.exitTime}`,
                requestedTime: `${entryTime} - ${exitTime}`,
                bookingId: booking.bookingId
              }
            };
          }
        }
      }
    }
    
    return { available: true };
  } catch (error) {
    console.error("Error checking seat availability:", error);
    throw new Error(`Failed to check seat availability: ${error.message}`);
  }
};

// Add booking to member's record with all validation logic
export const addBookingToMember = async (userName, teamData, bookingData) => {
  try {
    // Get or create member record
    const memberRecord = await getOrCreateMemberRecord(userName, teamData);
    
    // Business validation 1: Check for conflicts within this member's bookings
    const hasConflict = validateBookingConflict(
      memberRecord,
      bookingData.seatId,
      bookingData.date,
      bookingData.entryTime,
      bookingData.exitTime
    );
    
    if (hasConflict) {
      throw new Error(`You already have a booking conflict for seat ${bookingData.seatId} at this time`);
    }
    
    // Business validation 2: Check availability across all members
    const availability = await checkSeatAvailability(
      bookingData.seatId,
      bookingData.floor,
      bookingData.date,
      bookingData.entryTime,
      bookingData.exitTime
    );
    
    if (!availability.available) {
      throw new Error(`Seat ${bookingData.seatId} is already booked by ${availability.conflict.userName} from ${availability.conflict.existingTime}`);
    }
    
    // Business validation 3: Date validation (moved from model)
    const bookingDate = new Date(bookingData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      throw new Error('Cannot create bookings for past dates');
    }
    
    // Business validation 4: Time validation
    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const entryMinutes = parseTime(bookingData.entryTime);
    const exitMinutes = parseTime(bookingData.exitTime);
    
    if (exitMinutes <= entryMinutes) {
      throw new Error('Exit time must be after entry time');
    }
    
    const duration = exitMinutes - entryMinutes;
    if (duration > 480) { // 8 hours max
      throw new Error('Booking duration cannot exceed 8 hours');
    }
    
    // Business validation 5: Advance booking limit
    const maxAdvanceDate = new Date();
    maxAdvanceDate.setDate(maxAdvanceDate.getDate() + 30);
    if (bookingDate > maxAdvanceDate) {
      throw new Error('Cannot book more than 30 days in advance');
    }
    
    // All validations passed - add booking to member's record
    const bookingId = addBookingToRecord(memberRecord, bookingData);
    
    // Save the record
    await memberRecord.save();
    
    console.log(`✅ Added booking ${bookingId} for member ${userName}`);
    
    return {
      memberRecord,
      bookingId,
      totalBookings: memberRecord.totalBookings
    };
    
  } catch (error) {
    console.error("Error adding booking to member:", error);
    throw error;
  }
};

// Remove booking from member's record
export const removeBookingFromMember = async (userName, teamId, seatId, date, entryTime, exitTime) => {
  try {
    // Find member's record
    const memberRecord = await findMemberByTeam(userName, teamId);
    
    if (!memberRecord) {
      throw new Error(`No booking record found for member ${userName} in team ${teamId}`);
    }
    
    // Remove booking by seat and date
    const removed = removeBookingBySeat(memberRecord, seatId, date, entryTime, exitTime);
    
    if (!removed) {
      throw new Error(`No booking found for seat ${seatId} on ${date} from ${entryTime} to ${exitTime}`);
    }
    
    // Save the updated record
    await memberRecord.save();
    
    console.log(`✅ Removed booking for seat ${seatId} from member ${userName}`);
    
    return {
      memberRecord,
      remainingBookings: memberRecord.totalBookings
    };
    
  } catch (error) {
    console.error("Error removing booking from member:", error);
    throw error;
  }
};

// Get user and team information
export const getUserAndTeam = async (username, teamName) => {
  const team = await Team.findOne({ teamName });
  if (!team) {
    throw new Error('Team not found');
  }

  const user = await User.findOne({ username, teamId: team.teamId });
  if (!user) {
    throw new Error('User not found in the team');
  }

  return { user, team };
};

// Verify user permissions
export const verifyUserPermissions = async (username, teamName, targetMemberName = null) => {
  const { user, team } = await getUserAndTeam(username, teamName);
  
  // If booking for someone else, user must be admin
  if (targetMemberName && targetMemberName !== username) {
    if (user.role !== 'admin') {
      throw new Error('Only team leaders can book for other members');
    }
    
    // Verify target member exists in team
    const targetMember = await User.findOne({ 
      username: targetMemberName, 
      teamId: team.teamId 
    });
    
    if (!targetMember) {
      throw new Error('Target team member not found in the team');
    }
    
    return { user, team, targetMember };
  }
  
  return { user, team };
};

// Get all bookings for display (transform to old format for compatibility)
export const getAllBookingsForDisplay = async () => {
  try {
    const memberRecords = await SeatingSlots.find({ status: 'active' });
    const result = { chairs: {} };
    
    memberRecords.forEach(memberRecord => {
      memberRecord.bookings.forEach(booking => {
        // Only include future/current bookings
        const bookingDate = new Date(booking.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (bookingDate >= today) {
          result.chairs[booking.seatId] = {
            userName: memberRecord.userName,
            teamColor: memberRecord.teamColor,
            teamName: memberRecord.teamName,
            teamId: memberRecord.teamId,
            bookedAt: booking.bookedAt,
            bookingId: booking.bookingId,
            floor: booking.floor,
            date: booking.date,
            timeSlot: `${booking.entryTime} - ${booking.exitTime}`
          };
        }
      });
    });
    
    return result;
  } catch (error) {
    console.error("Error getting all bookings for display:", error);
    throw error;
  }
};

// Get filtered bookings by date and floor
export const getFilteredBookings = async (date, floor) => {
  try {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);
    
    const memberRecords = await SeatingSlots.find({
      status: 'active',
      'bookings.date': { $gte: targetDate, $lte: endDate },
      'bookings.floor': Number(floor)
    });
    
    const result = { chairs: {} };
    
    memberRecords.forEach(memberRecord => {
      memberRecord.bookings.forEach(booking => {
        const bookingDate = new Date(booking.date);
        
        // Check if booking matches our filter criteria
        if (bookingDate >= targetDate && bookingDate <= endDate && booking.floor === Number(floor)) {
          result.chairs[booking.seatId] = {
            userName: memberRecord.userName,
            teamColor: memberRecord.teamColor,
            teamName: memberRecord.teamName,
            teamId: memberRecord.teamId,
            bookedAt: booking.bookedAt,
            bookingId: booking.bookingId,
            floor: booking.floor,
            date: booking.date,
            timeSlot: `${booking.entryTime} - ${booking.exitTime}`
          };
        }
      });
    });
    
    return result;
  } catch (error) {
    console.error("Error getting filtered bookings:", error);
    throw error;
  }
};

// Find booking for unbooking
export const findBookingForUnbooking = async (seatId, floor, date, entryTime, exitTime) => {
  try {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);
    
    const memberRecords = await SeatingSlots.find({
      status: 'active',
      'bookings.date': { $gte: targetDate, $lte: endDate },
      'bookings.floor': Number(floor),
      'bookings.seatId': seatId
    });
    
    for (const memberRecord of memberRecords) {
      for (const booking of memberRecord.bookings) {
        const bookingDate = new Date(booking.date);
        
        if (
          bookingDate >= targetDate && 
          bookingDate <= endDate && 
          booking.floor === Number(floor) && 
          booking.seatId === seatId &&
          booking.entryTime === entryTime &&
          booking.exitTime === exitTime
        ) {
          return {
            memberRecord,
            booking
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error finding booking for unbooking:", error);
    throw error;
  }
};

// Get member's booking statistics
export const getMemberBookingStats = async (userName, teamId = null) => {
  try {
    let query = { userName, status: 'active' };
    if (teamId) {
      query.teamId = teamId;
    }
    
    const memberRecord = await SeatingSlots.findOne(query);
    
    if (!memberRecord) {
      return {
        totalBookings: 0,
        futureBookings: 0,
        pastBookings: 0
      };
    }
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const futureBookings = memberRecord.bookings.filter(booking => new Date(booking.date) >= now);
    const pastBookings = memberRecord.bookings.filter(booking => new Date(booking.date) < now);
    
    return {
      totalBookings: memberRecord.totalBookings,
      futureBookings: futureBookings.length,
      pastBookings: pastBookings.length,
      teamName: memberRecord.teamName,
      teamColor: memberRecord.teamColor
    };
  } catch (error) {
    console.error("Error getting member booking stats:", error);
    throw error;
  }
};
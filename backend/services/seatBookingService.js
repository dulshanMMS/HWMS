// services/seatBookingService.js - UPDATED to work with userName model and fix validation
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
  const bookingId = generateBookingId(memberRecord.userName || memberRecord.memberName);
  
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

// UPDATED: Database query functions - handle userName model with memberName database compatibility
export const findMemberCurrentRecord = async (userName) => {
  // Try userName first (for new records), then memberName (for old records)
  let record = await SeatingSlots.findOne({ userName, status: 'active' });
  if (!record) {
    record = await SeatingSlots.findOne({ memberName: userName, status: 'active' });
  }
  return record;
};

export const findMemberByTeam = async (userName, teamId) => {
  // Try userName first (for new records), then memberName (for old records)  
  let record = await SeatingSlots.findOne({ userName, teamId, status: 'active' });
  if (!record) {
    record = await SeatingSlots.findOne({ memberName: userName, teamId, status: 'active' });
  }
  return record;
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

// UPDATED: Get or create member's booking record - handle userName model
export const getOrCreateMemberRecord = async (userName, teamData) => {
  // First, try to find existing record for current team using userName
  let memberRecord = await SeatingSlots.findOne({ userName, teamId: teamData.teamId, status: 'active' });
  
  // If not found with userName, try with memberName (for old records)
  if (!memberRecord) {
    memberRecord = await SeatingSlots.findOne({ memberName: userName, teamId: teamData.teamId, status: 'active' });
  }
  
  if (!memberRecord) {
    // Create new record using userName field (to match your model)
    const recordData = {
      userName: userName,  // Use userName field from your model
      teamId: teamData.teamId,
      teamName: teamData.teamName,
      teamColor: teamData.teamColor,
      bookings: [],
      totalBookings: 0,
      status: 'active'
    };
    
    memberRecord = new SeatingSlots(recordData);
    
    try {
      await memberRecord.save();
      console.log(`✅ Created new member record for ${userName} in team ${teamData.teamName}`);
    } catch (saveError) {
      // If save fails due to index conflict, try to find existing record again
      if (saveError.code === 11000) {
        console.log(`⚠️ Index conflict, searching for existing record...`);
        memberRecord = await SeatingSlots.findOne({ 
          $or: [
            { userName, teamId: teamData.teamId },
            { memberName: userName, teamId: teamData.teamId }
          ],
          status: 'active' 
        });
        
        if (!memberRecord) {
          throw new Error(`Unable to create or find member record for ${userName}`);
        }
      } else {
        throw saveError;
      }
    }
  }
  
  return memberRecord;
};

// UPDATED: Enhanced validation function to allow multiple bookings with proper time gaps
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
  
  // UPDATED: Only check conflicts for the SAME seat on the SAME date
  return memberRecord.bookings.some(booking => {
    const bookingDate = new Date(booking.date).toISOString().split('T')[0];
    
    // Only check conflicts for the SAME seat on the SAME date
    if (bookingDate === requestDate && booking.seatId === seatId) {
      const bookingStart = parseTime(booking.entryTime);
      const bookingEnd = parseTime(booking.exitTime);
      return timesOverlap(requestStart, requestEnd, bookingStart, bookingEnd);
    }
    
    return false; // No conflict if different seat or different date
  });
};

// FIXED: Enhanced validation for same-day bookings on same floor with corrected logic
export const validateSameDayFloorBookings = (memberRecord, floor, date, entryTime, exitTime) => {
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const requestDate = new Date(date).toISOString().split('T')[0];
  const requestStart = parseTime(entryTime);
  const requestEnd = parseTime(exitTime);
  
  const memberName = memberRecord.userName || memberRecord.memberName;
  
  console.log(`🔍 === SAME DAY FLOOR VALIDATION START ===`);
  console.log(`👤 Member: ${memberName}`);
  console.log(`📅 Request: Floor ${floor}, Date ${requestDate}`);
  console.log(`⏰ Request Time: ${entryTime}-${exitTime} (${requestStart}-${requestEnd} minutes)`);
  console.log(`📊 Total member bookings: ${memberRecord.bookings.length}`);
  
  // Find all bookings for the same date and floor (regardless of seat)
  const sameDayFloorBookings = memberRecord.bookings.filter(booking => {
    const bookingDate = new Date(booking.date).toISOString().split('T')[0];
    const matches = bookingDate === requestDate && booking.floor === floor;
    
    if (matches) {
      console.log(`📋 Found existing booking: Seat ${booking.seatId}, Time ${booking.entryTime}-${booking.exitTime}`);
    }
    
    return matches;
  });
  
  console.log(`📊 Found ${sameDayFloorBookings.length} existing bookings on same day/floor`);
  
  // If no existing bookings on same day/floor, allow it
  if (sameDayFloorBookings.length === 0) {
    console.log(`✅ No existing bookings on same day/floor - ALLOWED`);
    console.log(`🔍 === SAME DAY FLOOR VALIDATION END - SUCCESS ===`);
    return { valid: true };
  }
  
  // Check each existing booking for conflicts
  for (let i = 0; i < sameDayFloorBookings.length; i++) {
    const existingBooking = sameDayFloorBookings[i];
    const existingStart = parseTime(existingBooking.entryTime);
    const existingEnd = parseTime(existingBooking.exitTime);
    
    console.log(`🔍 Conflict check ${i + 1}:`);
    console.log(`  Existing: ${existingBooking.entryTime}(${existingStart}) - ${existingBooking.exitTime}(${existingEnd}) [Seat: ${existingBooking.seatId}]`);
    console.log(`  New:      ${entryTime}(${requestStart}) - ${exitTime}(${requestEnd})`);
    
    // Check if times overlap
    const condition1 = requestStart < existingEnd;
    const condition2 = existingStart < requestEnd;
    const timesOverlap = condition1 && condition2;
    
    console.log(`  requestStart < existingEnd: ${requestStart} < ${existingEnd} = ${condition1}`);
    console.log(`  existingStart < requestEnd: ${existingStart} < ${requestEnd} = ${condition2}`);
    console.log(`  Times overlap: ${condition1} && ${condition2} = ${timesOverlap}`);
    
    if (timesOverlap) {
      console.log(`❌ BOOKING REJECTED - Time overlap detected with ${existingBooking.seatId}`);
      console.log(`🔍 === SAME DAY FLOOR VALIDATION END - FAILED ===`);
      
      return {
        valid: false,
        error: `Time conflict: You already have a booking from ${existingBooking.entryTime} to ${existingBooking.exitTime} on floor ${floor}. New bookings must start at or after ${existingBooking.exitTime}.`,
        conflictingBooking: {
          seatId: existingBooking.seatId,
          timeSlot: `${existingBooking.entryTime} - ${existingBooking.exitTime}`
        }
      };
    } else {
      console.log(`✅ No overlap with this booking`);
    }
  }
  
  console.log(`✅ All time validations passed - ALLOWED`);
  console.log(`🔍 === SAME DAY FLOOR VALIDATION END - SUCCESS ===`);
  return { valid: true };
};

// UPDATED: Check seat availability across all members
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
    
    const memberRecords = await findBookingsByDateAndFloor(date, floor);
    
    for (const memberRecord of memberRecords) {
      for (const booking of memberRecord.bookings) {
        const bookingDate = new Date(booking.date).toISOString().split('T')[0];
        
        if (bookingDate === targetDate && booking.seatId === seatId && booking.floor === floor) {
          const bookingStart = parseTime(booking.entryTime);
          const bookingEnd = parseTime(booking.exitTime);
          
          if (timesOverlap(requestStart, requestEnd, bookingStart, bookingEnd)) {
            // Get member name - prefer userName over memberName
            const memberName = memberRecord.userName || memberRecord.memberName;
            return {
              available: false,
              conflict: {
                userName: memberName,
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

// UPDATED: Modified addBookingToMember function with enhanced validation
export const addBookingToMember = async (userName, teamData, bookingData) => {
  try {
    console.log(`🎯 === BOOKING VALIDATION START for ${userName} ===`);
    
    // Get or create member record
    const memberRecord = await getOrCreateMemberRecord(userName, teamData);
    
    // Business validation 1: Check for conflicts within this member's bookings (for SAME SEAT only)
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
    
    // CRITICAL: Same-day same-floor time sequencing validation
    console.log(`🔍 Running same-day floor validation...`);
    const sameDayFloorValidation = validateSameDayFloorBookings(
      memberRecord,
      bookingData.floor,
      bookingData.date,
      bookingData.entryTime,
      bookingData.exitTime
    );
    
    if (!sameDayFloorValidation.valid) {
      console.log(`❌ Same-day floor validation FAILED: ${sameDayFloorValidation.error}`);
      throw new Error(sameDayFloorValidation.error);
    }
    
    console.log(`✅ Same-day floor validation PASSED`);
    
    // Business validation 2: Check availability across all members (SAME SEAT only)
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
    
    // Business validation 3: Date validation
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
    console.log(`🎯 === BOOKING VALIDATION END ===`);
    
    return {
      memberRecord,
      bookingId,
      totalBookings: memberRecord.totalBookings
    };
    
  } catch (error) {
    console.error("❌ Error adding booking to member:", error);
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

// UPDATED: Get all bookings for display (includes time information and handles field mapping)
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
          // Get member name - prefer userName (new model) over memberName (old data)
          const memberName = memberRecord.userName || memberRecord.memberName;
          
          result.chairs[booking.seatId] = {
            userName: memberName, // Always return as userName for frontend
            teamColor: memberRecord.teamColor,
            teamName: memberRecord.teamName,
            teamId: memberRecord.teamId,
            bookedAt: booking.bookedAt,
            bookingId: booking.bookingId,
            floor: booking.floor,
            date: booking.date,
            entryTime: booking.entryTime,
            exitTime: booking.exitTime,
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

// UPDATED: Get filtered bookings by date and floor (includes time information and handles field mapping)
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
        
        if (bookingDate >= targetDate && bookingDate <= endDate && booking.floor === Number(floor)) {
          // Get member name - prefer userName (new model) over memberName (old data)
          const memberName = memberRecord.userName || memberRecord.memberName;
          
          result.chairs[booking.seatId] = {
            userName: memberName, // Always return as userName for frontend
            teamColor: memberRecord.teamColor,
            teamName: memberRecord.teamName,
            teamId: memberRecord.teamId,
            bookedAt: booking.bookedAt,
            bookingId: booking.bookingId,
            floor: booking.floor,
            date: booking.date,
            entryTime: booking.entryTime,
            exitTime: booking.exitTime,
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

// UPDATED: Enhanced findBookingForUnbooking to handle multiple bookings same day/floor and field mapping
export const findBookingForUnbooking = async (seatId, floor, date, entryTime = null, exitTime = null) => {
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
        
        // If specific time provided, match exactly
        if (entryTime && exitTime) {
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
        } else {
          // If no specific time provided, return the first matching booking
          if (
            bookingDate >= targetDate && 
            bookingDate <= endDate && 
            booking.floor === Number(floor) && 
            booking.seatId === seatId
          ) {
            return {
              memberRecord,
              booking
            };
          }
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
    let memberRecord = await findMemberCurrentRecord(userName);
    
    if (!memberRecord && teamId) {
      memberRecord = await findMemberByTeam(userName, teamId);
    }
    
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
// services/seatBookingService.js - FIXED to work with User and Team models consistently
import SeatingSlots from "../models/SeatingSlots.js";
import Team from "../models/Team.js";
import User from "../models/User.js";
import { 
  parseTimeToMinutes, 
  timesOverlap,
  parseDateSafely 
} from "./seatValidationService.js";

// ADDED: Missing convertToHexColor function
const convertToHexColor = (color) => {
  // If it's already a hex color, return as is
  if (color && color.startsWith('#')) {
    return color;
  }
  
  // If it's an RGB color, convert to hex
  if (color && color.startsWith('rgb')) {
    const rgbMatch = color.match(/\d+/g);
    if (rgbMatch) {
      const [r, g, b] = rgbMatch.map(Number);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
  }
  
  // For named colors, convert to hex
  const namedColors = {
    'red': '#FF0000',
    'blue': '#0000FF',
    'green': '#00FF00',
    'yellow': '#FFFF00',
    'purple': '#800080',
    'orange': '#FFA500',
    'pink': '#FFC0CB',
    'cyan': '#00FFFF',
    'magenta': '#FF00FF',
    'lime': '#00FF00',
    'indigo': '#4B0082',
    'violet': '#8A2BE2',
    'brown': '#A52A2A',
    'gray': '#808080',
    'grey': '#808080',
    'black': '#000000',
    'white': '#FFFFFF'
  };
  
  // Return hex color if found, otherwise return original color or default
  return namedColors[color?.toLowerCase()] || color || '#000000';
};

// Utility functions moved from model
export const generateBookingId = (username) => {
  return `${username}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
};

export const addBookingToRecord = (memberRecord, bookingData) => {
  const bookingId = generateBookingId(memberRecord.username);
  
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
  // SAFE DATE HANDLING
  let targetDate;
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error(`Invalid date provided: ${date}`);
    }
    targetDate = dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error(`❌ Date parsing error in removeBookingBySeat:`, error);
    throw new Error(`Invalid date format: ${date}`);
  }
  
  const initialLength = memberRecord.bookings.length;
  
  memberRecord.bookings = memberRecord.bookings.filter(booking => {
    // SAFE BOOKING DATE HANDLING
    let bookingDate;
    try {
      const bookingDateObj = new Date(booking.date);
      if (isNaN(bookingDateObj.getTime())) {
        console.warn(`⚠️ Invalid booking date found: ${booking.date}, keeping booking`);
        return true; // Keep bookings with invalid dates
      }
      bookingDate = bookingDateObj.toISOString().split('T')[0];
    } catch (error) {
      console.warn(`⚠️ Error parsing booking date: ${booking.date}, keeping booking`);
      return true; // Keep bookings with invalid dates
    }
    
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
    // SAFE BOOKING DATE HANDLING
    try {
      const bookingDate = new Date(booking.date);
      if (isNaN(bookingDate.getTime())) {
        console.warn(`⚠️ Invalid booking date found: ${booking.date}, excluding from range`);
        return false;
      }
      return bookingDate >= startDate && bookingDate <= endDate;
    } catch (error) {
      console.warn(`⚠️ Error parsing booking date: ${booking.date}, excluding from range`);
      return false;
    }
  });
};

export const getFutureBookings = (memberRecord) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return memberRecord.bookings.filter(booking => {
    // SAFE BOOKING DATE HANDLING
    try {
      const bookingDate = new Date(booking.date);
      if (isNaN(bookingDate.getTime())) {
        console.warn(`⚠️ Invalid booking date found: ${booking.date}, excluding from future bookings`);
        return false;
      }
      return bookingDate >= now;
    } catch (error) {
      console.warn(`⚠️ Error parsing booking date: ${booking.date}, excluding from future bookings`);
      return false;
    }
  });
};

// FIXED: Database query functions - use username consistently
export const findMemberCurrentRecord = async (username) => {
  const record = await SeatingSlots.findOne({ username, status: 'active' });
  return record;
};

export const findMemberByTeam = async (username, teamId) => {
  const record = await SeatingSlots.findOne({ username, teamId, status: 'active' });
  return record;
};

export const findBookingsByDateAndFloor = async (date, floor) => {
  // SAFE DATE HANDLING
  let targetDate, endDate;
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error(`Invalid date provided: ${date}`);
    }
    targetDate = new Date(dateObj);
    targetDate.setHours(0, 0, 0, 0);
    endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);
  } catch (error) {
    console.error(`❌ Date parsing error in findBookingsByDateAndFloor:`, error);
    throw new Error(`Invalid date format: ${date}`);
  }
  
  return await SeatingSlots.find({
    status: 'active',
    'bookings.date': { $gte: targetDate, $lte: endDate },
    'bookings.floor': floor
  });
};

// FIXED: Get or create member's booking record - properly handle User and Team models
export const getOrCreateMemberRecord = async (username) => {
  try {
    console.log(`🔍 Looking for member: ${username}`);
    
    // 1. Find user by username in User collection
    const user = await User.findOne({ username: username });
    if (!user) {
      console.log(`❌ User not found: ${username}`);
      throw new Error(`User with username ${username} not found in User collection`);
    }
    
    console.log(`✅ User found: ${user.username}, teamId: ${user.teamId}`);
    
    // 2. Check if user has teamId
    if (!user.teamId) {
      console.log(`❌ User ${username} has no teamId assigned`);
      throw new Error(`User ${username} has no team assigned`);
    }
    
    // 3. Get team info from Team model
    const team = await Team.findOne({ teamId: user.teamId });
    if (!team) {
      console.log(`❌ Team not found: ${user.teamId}`);
      throw new Error(`Team with ID ${user.teamId} not found in Team collection`);
    }
    
    console.log(`✅ Team found: ${team.teamName}, color: ${team.color}`);
    
    // 4. Find or create member record in SeatingSlots
    let memberRecord = await SeatingSlots.findOne({ username: username, teamId: user.teamId, status: 'active' });
    
    if (!memberRecord) {
      console.log(`📝 Creating new member record for: ${username}`);
      memberRecord = new SeatingSlots({
        username: username,           // Use username field consistently
        teamId: user.teamId,
        teamName: team.teamName,
        teamColor: team.color,
        bookings: [],
        totalBookings: 0,
        status: 'active'
      });
      
      try {
        await memberRecord.save();
        console.log(`✅ Member record created successfully`);
      } catch (saveError) {
        // If save fails due to index conflict, try to find existing record again
        if (saveError.code === 11000) {
          console.log(`⚠️ Index conflict, searching for existing record...`);
          memberRecord = await SeatingSlots.findOne({ 
            username: username, 
            teamId: user.teamId,
            status: 'active' 
          });
          
          if (!memberRecord) {
            throw new Error(`Unable to create or find member record for ${username}`);
          }
        } else {
          throw saveError;
        }
      }
    } else {
      console.log(`✅ Member record found: ${memberRecord.username}`);
    }

    return memberRecord;
    
  } catch (error) {
    console.error('❌ Error in getOrCreateMemberRecord:', error.message);
    throw error;
  }
};

// FIXED: Enhanced validation function with safe date handling
export const validateBookingConflict = (memberRecord, seatId, date, entryTime, exitTime) => {
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const timesOverlap = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
  };
  
  // SAFE DATE HANDLING - Fix for Invalid time value error
  let requestDate;
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error(`Invalid date provided: ${date}`);
    }
    requestDate = dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error(`❌ Date parsing error in validateBookingConflict:`, error);
    throw new Error(`Invalid date format: ${date}`);
  }
  
  const requestStart = parseTime(entryTime);
  const requestEnd = parseTime(exitTime);
  
  // Only check conflicts for the SAME seat on the SAME date
  return memberRecord.bookings.some(booking => {
    // SAFE BOOKING DATE HANDLING
    let bookingDate;
    try {
      const bookingDateObj = new Date(booking.date);
      if (isNaN(bookingDateObj.getTime())) {
        console.warn(`⚠️ Invalid booking date found: ${booking.date}, skipping validation`);
        return false; // Skip invalid booking dates
      }
      bookingDate = bookingDateObj.toISOString().split('T')[0];
    } catch (error) {
      console.warn(`⚠️ Error parsing booking date: ${booking.date}, skipping`);
      return false; // Skip invalid booking dates
    }
    
    // Only check conflicts for the SAME seat on the SAME date
    if (bookingDate === requestDate && booking.seatId === seatId) {
      const bookingStart = parseTime(booking.entryTime);
      const bookingEnd = parseTime(booking.exitTime);
      return timesOverlap(requestStart, requestEnd, bookingStart, bookingEnd);
    }
    
    return false; // No conflict if different seat or different date
  });
};

// FIXED: Enhanced validation for same-day bookings with safe date handling
export const validateSameDayFloorBookings = (memberRecord, floor, date, entryTime, exitTime) => {
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  // SAFE DATE HANDLING
  let requestDate;
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error(`Invalid date provided: ${date}`);
    }
    requestDate = dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error(`❌ Date parsing error in validateSameDayFloorBookings:`, error);
    throw new Error(`Invalid date format: ${date}`);
  }
  
  const requestStart = parseTime(entryTime);
  const requestEnd = parseTime(exitTime);
  
  const memberName = memberRecord.username;
  
  console.log(`🔍 === SAME DAY FLOOR VALIDATION START ===`);
  console.log(`👤 Member: ${memberName}`);
  console.log(`📅 Request: Floor ${floor}, Date ${requestDate}`);
  console.log(`⏰ Request Time: ${entryTime}-${exitTime} (${requestStart}-${requestEnd} minutes)`);
  console.log(`📊 Total member bookings: ${memberRecord.bookings.length}`);
  
  // Find all bookings for the same date and floor (regardless of seat)
  const sameDayFloorBookings = memberRecord.bookings.filter(booking => {
    // SAFE BOOKING DATE HANDLING
    let bookingDate;
    try {
      const bookingDateObj = new Date(booking.date);
      if (isNaN(bookingDateObj.getTime())) {
        console.warn(`⚠️ Invalid booking date found: ${booking.date}, skipping`);
        return false; // Skip invalid booking dates
      }
      bookingDate = bookingDateObj.toISOString().split('T')[0];
    } catch (error) {
      console.warn(`⚠️ Error parsing booking date: ${booking.date}, skipping`);
      return false; // Skip invalid booking dates
    }
    
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

// FIXED: Check seat availability with safe date handling
export const checkSeatAvailability = async (seatId, floor, date, entryTime, exitTime) => {
  try {
    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const timesOverlap = (start1, end1, start2, end2) => {
      return start1 < end2 && start2 < end1;
    };
    
    // SAFE DATE HANDLING
    let targetDate;
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new Error(`Invalid date provided: ${date}`);
      }
      targetDate = dateObj.toISOString().split('T')[0];
    } catch (error) {
      console.error(`❌ Date parsing error in checkSeatAvailability:`, error);
      throw new Error(`Invalid date format: ${date}`);
    }
    
    const requestStart = parseTime(entryTime);
    const requestEnd = parseTime(exitTime);
    
    const memberRecords = await findBookingsByDateAndFloor(date, floor);
    
    for (const memberRecord of memberRecords) {
      for (const booking of memberRecord.bookings) {
        // SAFE BOOKING DATE HANDLING
        let bookingDate;
        try {
          const bookingDateObj = new Date(booking.date);
          if (isNaN(bookingDateObj.getTime())) {
            console.warn(`⚠️ Invalid booking date found: ${booking.date}, skipping availability check`);
            continue; // Skip invalid booking dates
          }
          bookingDate = bookingDateObj.toISOString().split('T')[0];
        } catch (error) {
          console.warn(`⚠️ Error parsing booking date: ${booking.date}, skipping`);
          continue; // Skip invalid booking dates
        }
        
        if (bookingDate === targetDate && booking.seatId === seatId && booking.floor === floor) {
          const bookingStart = parseTime(booking.entryTime);
          const bookingEnd = parseTime(booking.exitTime);
          
          if (timesOverlap(requestStart, requestEnd, bookingStart, bookingEnd)) {
            return {
              available: false,
              conflict: {
                username: memberRecord.username,
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

// FIXED: Modified addBookingToMember function - simplified to work with User/Team models
export const addBookingToMember = async (username, bookingData) => {
  try {
    console.log(`🎯 === BOOKING VALIDATION START for ${username} ===`);
    
    // Get or create member record (this handles User and Team lookups internally)
    const memberRecord = await getOrCreateMemberRecord(username);
    
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
      throw new Error(`Seat ${bookingData.seatId} is already booked by ${availability.conflict.username} from ${availability.conflict.existingTime}`);
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
    
    console.log(`✅ Added booking ${bookingId} for member ${username}`);
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
export const removeBookingFromMember = async (username, teamId, seatId, date, entryTime, exitTime) => {
  try {
    // Find member's record
    const memberRecord = await findMemberByTeam(username, teamId);
    
    if (!memberRecord) {
      throw new Error(`No booking record found for member ${username} in team ${teamId}`);
    }
    
    // Remove booking by seat and date
    const removed = removeBookingBySeat(memberRecord, seatId, date, entryTime, exitTime);
    
    if (!removed) {
      throw new Error(`No booking found for seat ${seatId} on ${date} from ${entryTime} to ${exitTime}`);
    }
    
    // Save the updated record
    await memberRecord.save();
    
    console.log(`✅ Removed booking for seat ${seatId} from member ${username}`);
    
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

// FIXED: Get all bookings for display (handles username field consistently + safe dates)
export const getAllBookingsForDisplay = async () => {
  try {
    const memberRecords = await SeatingSlots.find({ status: 'active' });
    const result = { chairs: {} };
    
    memberRecords.forEach(memberRecord => {
      memberRecord.bookings.forEach(booking => {
        // SAFE BOOKING DATE HANDLING
        let bookingDate;
        try {
          bookingDate = new Date(booking.date);
          if (isNaN(bookingDate.getTime())) {
            console.warn(`⚠️ Invalid booking date found: ${booking.date}, skipping display`);
            return;
          }
        } catch (error) {
          console.warn(`⚠️ Error parsing booking date: ${booking.date}, skipping display`);
          return;
        }
        
        // Only include future/current bookings
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (bookingDate >= today) {
          result.chairs[booking.seatId] = {
            username: memberRecord.username,
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

// FIXED: Get filtered bookings by date and floor (handles username field consistently + safe dates)
export const getFilteredBookings = async (date, floor) => {
  try {
    // SAFE DATE HANDLING
    let targetDate, endDate;
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new Error(`Invalid date provided: ${date}`);
      }
      targetDate = new Date(dateObj);
      targetDate.setHours(0, 0, 0, 0);
      endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);
    } catch (error) {
      console.error(`❌ Date parsing error in getFilteredBookings:`, error);
      throw new Error(`Invalid date format: ${date}`);
    }
    
    const memberRecords = await SeatingSlots.find({
      status: 'active',
      'bookings.date': { $gte: targetDate, $lte: endDate },
      'bookings.floor': Number(floor)
    });
    
    const result = { chairs: {} };
    
    memberRecords.forEach(memberRecord => {
      memberRecord.bookings.forEach(booking => {
        // SAFE BOOKING DATE HANDLING
        let bookingDate;
        try {
          bookingDate = new Date(booking.date);
          if (isNaN(bookingDate.getTime())) {
            console.warn(`⚠️ Invalid booking date found: ${booking.date}, skipping display`);
            return;
          }
        } catch (error) {
          console.warn(`⚠️ Error parsing booking date: ${booking.date}, skipping display`);
          return;
        }
        
        if (bookingDate >= targetDate && bookingDate <= endDate && booking.floor === Number(floor)) {
          // FRONTEND COMPATIBLE FORMAT - provide both userName and username + convert colors
          const hexColor = convertToHexColor(memberRecord.teamColor);
          
          result.chairs[booking.seatId] = {
            userName: memberRecord.username,           // Frontend expects userName
            username: memberRecord.username,           // Backup field
            teamColor: hexColor,                       // Convert to hex color
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
          
          console.log(`📋 Adding booking to result: ${booking.seatId} -> ${memberRecord.username} (${hexColor})`);
        }
      });
    });
    
    console.log("🎯 Filtered bookings result:", {
      totalChairs: Object.keys(result.chairs).length,
      chairs: Object.keys(result.chairs),
      sampleBooking: Object.keys(result.chairs).length > 0 ? result.chairs[Object.keys(result.chairs)[0]] : null
    });
    
    return result;
  } catch (error) {
    console.error("Error getting filtered bookings:", error);
    throw error;
  }
};

// FIXED: Enhanced findBookingForUnbooking to handle username field consistently + safe dates
export const findBookingForUnbooking = async (seatId, floor, date, entryTime = null, exitTime = null) => {
  try {
    // SAFE DATE HANDLING
    let targetDate, endDate;
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new Error(`Invalid date provided: ${date}`);
      }
      targetDate = new Date(dateObj);
      targetDate.setHours(0, 0, 0, 0);
      endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);
    } catch (error) {
      console.error(`❌ Date parsing error in findBookingForUnbooking:`, error);
      throw new Error(`Invalid date format: ${date}`);
    }
    
    const memberRecords = await SeatingSlots.find({
      status: 'active',
      'bookings.date': { $gte: targetDate, $lte: endDate },
      'bookings.floor': Number(floor),
      'bookings.seatId': seatId
    });
    
    for (const memberRecord of memberRecords) {
      for (const booking of memberRecord.bookings) {
        // SAFE BOOKING DATE HANDLING
        let bookingDate;
        try {
          bookingDate = new Date(booking.date);
          if (isNaN(bookingDate.getTime())) {
            console.warn(`⚠️ Invalid booking date found: ${booking.date}, skipping unbooking check`);
            continue;
          }
        } catch (error) {
          console.warn(`⚠️ Error parsing booking date: ${booking.date}, skipping unbooking check`);
          continue;
        }
        
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

// Get member's booking statistics with safe date handling
export const getMemberBookingStats = async (username, teamId = null) => {
  try {
    let memberRecord = await findMemberCurrentRecord(username);
    
    if (!memberRecord && teamId) {
      memberRecord = await findMemberByTeam(username, teamId);
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
    
    // SAFE DATE HANDLING for booking statistics
    const futureBookings = memberRecord.bookings.filter(booking => {
      try {
        const bookingDate = new Date(booking.date);
        if (isNaN(bookingDate.getTime())) {
          console.warn(`⚠️ Invalid booking date found: ${booking.date}, excluding from stats`);
          return false;
        }
        return bookingDate >= now;
      } catch (error) {
        console.warn(`⚠️ Error parsing booking date: ${booking.date}, excluding from stats`);
        return false;
      }
    });
    
    const pastBookings = memberRecord.bookings.filter(booking => {
      try {
        const bookingDate = new Date(booking.date);
        if (isNaN(bookingDate.getTime())) {
          console.warn(`⚠️ Invalid booking date found: ${booking.date}, excluding from stats`);
          return false;
        }
        return bookingDate < now;
      } catch (error) {
        console.warn(`⚠️ Error parsing booking date: ${booking.date}, excluding from stats`);
        return false;
      }
    });
    
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
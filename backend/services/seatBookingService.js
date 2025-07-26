// services/seatBookingService.js - Self-booking service only - PART 1 of 2
import SeatingSlots from "../models/SeatingSlots.js";
import Team from "../models/Team.js";
import User from "../models/User.js";
import { createBookingNotifications, createCancellationNotifications } from "./notificationService.js";

const convertToHexColor = (color) => {
  if (color && color.startsWith('#')) {
    return color;
  }
  
  if (color && color.startsWith('rgb')) {
    const rgbMatch = color.match(/\d+/g);
    if (rgbMatch) {
      const [r, g, b] = rgbMatch.map(Number);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
  }
  
  const namedColors = {
    'red': '#FF0000', 'blue': '#0000FF', 'green': '#00FF00', 'yellow': '#FFFF00',
    'purple': '#800080', 'orange': '#FFA500', 'pink': '#FFC0CB', 'cyan': '#00FFFF',
    'magenta': '#FF00FF', 'lime': '#00FF00', 'indigo': '#4B0082', 'violet': '#8A2BE2',
    'brown': '#A52A2A', 'gray': '#808080', 'grey': '#808080', 'black': '#000000', 'white': '#FFFFFF'
  };
  
  return namedColors[color?.toLowerCase()] || color || '#000000';
};

// Utility functions - always use userName
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


export const removeBookingBySeat = async (memberRecord, seatId, date, entryTime, exitTime) => {
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
  
  console.log(`🔍 Attempting to remove booking for user: ${memberRecord.userName}, seat: ${seatId}, date: ${targetDate}, time: ${entryTime}-${exitTime}`);
  
  const initialLength = memberRecord.bookings.length;
  
  const bookingToRemove = memberRecord.bookings.find(booking => {
    let bookingDate;
    try {
      const bookingDateObj = new Date(booking.date);
      if (isNaN(bookingDateObj.getTime())) {
        console.warn(`⚠️ Invalid booking date found: ${booking.date}, keeping booking`);
        return false;
      }
      bookingDate = bookingDateObj.toISOString().split('T')[0];
    } catch (error) {
      console.warn(`⚠️ Error parsing booking date: ${booking.date}, keeping booking`);
      return false;
    }
    
    return (
      booking.seatId === seatId &&
      bookingDate === targetDate &&
      booking.entryTime === entryTime &&
      booking.exitTime === exitTime
    );
  });

  memberRecord.bookings = memberRecord.bookings.filter(booking => {
    let bookingDate;
    try {
      const bookingDateObj = new Date(booking.date);
      if (isNaN(bookingDateObj.getTime())) {
        console.warn(`⚠️ Invalid booking date found: ${booking.date}, keeping booking`);
        return true;
      }
      bookingDate = bookingDateObj.toISOString().split('T')[0];
    } catch (error) {
      console.warn(`⚠️ Error parsing booking date: ${booking.date}, keeping booking`);
      return true;
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
    
    // Create cancellation notification Sjay
    if (bookingToRemove) {
      console.log(`🎯 Found booking to remove: ${bookingToRemove.bookingId}`);
      try {
        const user = await User.findOne({ username: memberRecord.userName }).select('_id');
        if (!user) {
          console.error(`❌ User not found for username: ${memberRecord.userName}`);
        } else {
           createCancellationNotifications({
            userId: user._id.toString(),
            slotNumber: bookingToRemove.seatId,
            floor: bookingToRemove.floor,
            type: 'seat',
            date: targetDate,
            bookingId: bookingToRemove.bookingId
          });
          console.log(`✅ Cancellation notification created for booking: ${bookingToRemove.bookingId}`);
        }
      } catch (notificationError) {
        console.error(`❌ Failed to create cancellation notification:`, notificationError);
        // Don't throw error to avoid disrupting booking removal
      }
    } else {
      console.warn(`⚠️ No booking found to remove for notification creation`);
    }
    
    return true;
  }
  
  console.log(`❌ No booking found to remove for seat: ${seatId}, date: ${targetDate}, time: ${entryTime}-${exitTime}`);
  return false;
};

export const getFutureBookings = (memberRecord) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return memberRecord.bookings.filter(booking => {
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

// Database query functions - always use userName
export const findMemberCurrentRecord = async (userName) => {
  const record = await SeatingSlots.findOne({ userName, status: 'active' });
  return record;
};

export const findMemberByTeam = async (userName, teamId) => {
  const record = await SeatingSlots.findOne({ userName, teamId, status: 'active' });
  return record;
};

export const findBookingsByDateAndFloor = async (date, floor) => {
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

// SIMPLIFIED: Get or create member record - no admin/leader complexity
export const getOrCreateMemberRecord = async (userName) => {
  try {
    console.log(`🔍 Looking for member: ${userName}`);
    
    // Find user by username in User collection
    const user = await User.findOne({ username: userName });
    if (!user) {
      console.log(`❌ User not found: ${userName}`);
      throw new Error(`User with username ${userName} not found in User collection`);
    }
    
    console.log(`✅ User found: ${user.username}, teamId: ${user.teamId}`);
    
    if (!user.teamId) {
      console.log(`❌ User ${userName} has no teamId assigned`);
      throw new Error(`User ${userName} has no team assigned`);
    }
    
    // Get team info
    const team = await Team.findOne({ teamId: user.teamId });
    if (!team) {
      console.log(`❌ Team not found: ${user.teamId}`);
      throw new Error(`Team with ID ${user.teamId} not found in Team collection`);
    }
    
    console.log(`✅ Team found: ${team.teamName}, color: ${team.color}`);
    
    // Find or create member record in SeatingSlots
    let memberRecord = await SeatingSlots.findOne({ userName: userName, teamId: user.teamId, status: 'active' });
    
    if (!memberRecord) {
      console.log(`📝 Creating new member record for: ${userName}`);
      memberRecord = new SeatingSlots({
        userName: userName,
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
        if (saveError.code === 11000) {
          console.log(`⚠️ Index conflict, searching for existing record...`);
          memberRecord = await SeatingSlots.findOne({ 
            userName: userName, 
            teamId: user.teamId,
            status: 'active' 
          });
          
          if (!memberRecord) {
            throw new Error(`Unable to create or find member record for ${userName}`);
          }
        } else {
          throw saveError;
        }
      }
    } else {
      console.log(`✅ Member record found: ${memberRecord.userName}`);
    }

    return memberRecord;
    
  } catch (error) {
    console.error('❌ Error in getOrCreateMemberRecord:', error.message);
    throw error;
  }
};

export const validateBookingConflict = (memberRecord, seatId, date, entryTime, exitTime) => {
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const timesOverlap = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
  };
  
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
  
  return memberRecord.bookings.some(booking => {
    let bookingDate;
    try {
      const bookingDateObj = new Date(booking.date);
      if (isNaN(bookingDateObj.getTime())) {
        console.warn(`⚠️ Invalid booking date found: ${booking.date}, skipping validation`);
        return false;
      }
      bookingDate = bookingDateObj.toISOString().split('T')[0];
    } catch (error) {
      console.warn(`⚠️ Error parsing booking date: ${booking.date}, skipping`);
      return false;
    }
    
    if (bookingDate === requestDate && booking.seatId === seatId) {
      const bookingStart = parseTime(booking.entryTime);
      const bookingEnd = parseTime(booking.exitTime);
      return timesOverlap(requestStart, requestEnd, bookingStart, bookingEnd);
    }
    
    return false;
  });
};// services/seatBookingService.js - Self-booking service only - PART 2 of 2
// (Continue from Part 1)

export const validateSameDayFloorBookings = (memberRecord, floor, date, entryTime, exitTime) => {
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
  
  const memberName = memberRecord.userName;
  
  console.log(`🔍 === SAME DAY FLOOR VALIDATION START ===`);
  console.log(`👤 Member: ${memberName}`);
  console.log(`📅 Request: Floor ${floor}, Date ${requestDate}`);
  console.log(`⏰ Request Time: ${entryTime}-${exitTime}`);
  console.log(`📊 Total member bookings: ${memberRecord.bookings.length}`);
  
  const sameDayFloorBookings = memberRecord.bookings.filter(booking => {
    let bookingDate;
    try {
      const bookingDateObj = new Date(booking.date);
      if (isNaN(bookingDateObj.getTime())) {
        console.warn(`⚠️ Invalid booking date found: ${booking.date}, skipping`);
        return false;
      }
      bookingDate = bookingDateObj.toISOString().split('T')[0];
    } catch (error) {
      console.warn(`⚠️ Error parsing booking date: ${booking.date}, skipping`);
      return false;
    }
    
    const matches = bookingDate === requestDate && booking.floor === floor;
    
    if (matches) {
      console.log(`📋 Found existing booking: Seat ${booking.seatId}, Time ${booking.entryTime}-${booking.exitTime}`);
    }
    
    return matches;
  });
  
  console.log(`📊 Found ${sameDayFloorBookings.length} existing bookings on same day/floor`);
  
  if (sameDayFloorBookings.length === 0) {
    console.log(`✅ No existing bookings on same day/floor - ALLOWED`);
    console.log(`🔍 === SAME DAY FLOOR VALIDATION END - SUCCESS ===`);
    return { valid: true };
  }
  
  // MODIFIED: Instead of checking time overlaps, just reject any additional booking
  const existingBooking = sameDayFloorBookings[0]; // Get the first (and should be only) booking
  
  console.log(`❌ BOOKING REJECTED - User already has a booking on this day/floor`);
  console.log(`🔍 === SAME DAY FLOOR VALIDATION END - FAILED ===`);
  
  return {
    valid: false,
    error: `You already have a booking on floor ${floor} for ${requestDate}. You can only have one booking per floor per day. Please cancel your existing booking for seat ${existingBooking.seatId} (${existingBooking.entryTime} - ${existingBooking.exitTime}) first.`,
    conflictingBooking: {
      seatId: existingBooking.seatId,
      timeSlot: `${existingBooking.entryTime} - ${existingBooking.exitTime}`,
      date: requestDate,
      floor: floor
    }
  };
};

export const checkSeatAvailability = async (seatId, floor, date, entryTime, exitTime) => {
  try {
    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const timesOverlap = (start1, end1, start2, end2) => {
      return start1 < end2 && start2 < end1;
    };
    
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
        let bookingDate;
        try {
          const bookingDateObj = new Date(booking.date);
          if (isNaN(bookingDateObj.getTime())) {
            console.warn(`⚠️ Invalid booking date found: ${booking.date}, skipping availability check`);
            continue;
          }
          bookingDate = bookingDateObj.toISOString().split('T')[0];
        } catch (error) {
          console.warn(`⚠️ Error parsing booking date: ${booking.date}, skipping`);
          continue;
        }
        
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

//SIMPLIFIED: Add booking to member - only self-booking allowed
export const addBookingToMember = async (userName, bookingData) => {
  try {
    console.log(`🎯 === BOOKING VALIDATION START for ${userName} ===`);
    
    // Get member record first
    const memberRecord = await getOrCreateMemberRecord(userName);
    
    // SIMPLE CHECK: Does user already have ANY booking for this day/floor?
    const bookingDate = new Date(bookingData.date).toISOString().split('T')[0];
    const existingBookingOnSameDayFloor = memberRecord.bookings.find(booking => {
      try {
        const existingDate = new Date(booking.date).toISOString().split('T')[0];
        return existingDate === bookingDate && booking.floor === bookingData.floor;
      } catch (error) {
        console.warn(`⚠️ Error parsing booking date: ${booking.date}`);
        return false;
      }
    });
    
    if (existingBookingOnSameDayFloor) {
      console.log(`❌ BOOKING REJECTED - User already has booking: ${existingBookingOnSameDayFloor.seatId}`);
      throw new Error(`You already have a booking for ${bookingDate} on floor ${bookingData.floor}. Please cancel your existing booking for seat ${existingBookingOnSameDayFloor.seatId} first.`);
    }
    
    console.log(`✅ No existing booking found - proceeding with validation`);
    
    // Continue with all other existing validations...
    
    // Business validation 1: Check for conflicts within this member's bookings (same seat only)
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
    
    // Business validation 2: Check availability across all members (same seat only)
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
    const bookingDateObj = new Date(bookingData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDateObj < today) {
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
    if (bookingDateObj > maxAdvanceDate) {
      throw new Error('Cannot book more than 30 days in advance');
    }
    
    // All validations passed - add booking to member's record
    const bookingId = addBookingToRecord(memberRecord, bookingData);
    
    // Save the record
    await memberRecord.save();



    const user = await User.findOne({ username: userName }).select('_id');//Sjay
    if (user) {
      try {
         createBookingNotifications('seating', memberRecord, {
          seatId: bookingData.seatId,
          floor: bookingData.floor,
          date: bookingData.date,
          entryTime: bookingData.entryTime,
          exitTime: bookingData.exitTime,
          userName: userName,
          bookingId: bookingId
        });
        console.log(`✅ Booking notification created for booking: ${bookingId}`);
      } catch (notificationError) {
        console.error(`❌ Failed to create booking notification for ${bookingId}:`, notificationError);
      }
    } else {
      console.error(`❌ User not found for username: ${userName}`);
    }
    
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

export const removeBookingFromMember = async (userName, teamId, seatId, date, entryTime, exitTime) => {
  try {
    const memberRecord = await findMemberByTeam(userName, teamId);
    
    if (!memberRecord) {
      throw new Error(`No booking record found for member ${userName} in team ${teamId}`);
    }
    
    const removed = removeBookingBySeat(memberRecord, seatId, date, entryTime, exitTime);
    
    if (!removed) {
      throw new Error(`No booking found for seat ${seatId} on ${date} from ${entryTime} to ${exitTime}`);
    }
    
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

export const getAllBookingsForDisplay = async () => {
  try {
    const memberRecords = await SeatingSlots.find({ status: 'active' });
    const result = { chairs: {} };
    
    memberRecords.forEach(memberRecord => {
      memberRecord.bookings.forEach(booking => {
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

export const getFilteredBookings = async (date, floor) => {
  try {
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
          const hexColor = convertToHexColor(memberRecord.teamColor);
          
          result.chairs[booking.seatId] = {
            userName: memberRecord.userName,
            username: memberRecord.userName,
            teamColor: hexColor,
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
          
          console.log(`📋 Adding booking to result: ${booking.seatId} -> ${memberRecord.userName} (${hexColor})`);
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

export const findBookingForUnbooking = async (seatId, floor, date, entryTime = null, exitTime = null) => {
  try {
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
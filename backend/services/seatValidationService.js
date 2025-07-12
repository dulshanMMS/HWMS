// services/seatValidationService.js

// Helper functions
export const parseTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };
  
  export const timesOverlap = (startA, endA, startB, endB) => {
    return startA < endB && startB < endA;
  };
  
  export const parseDateSafely = (dateString) => {
    const date = new Date(dateString + 'T00:00:00.000Z');
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return {
      original: date,
      startOfDay,
      endOfDay
    };
  };
  
  // Validation schemas and regex patterns
  export const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  export const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  
  // Core validation functions
  export const validateTimeFormat = (time) => {
    return timeFormatRegex.test(time);
  };
  
  export const validateTimeRange = (startTime, endTime) => {
    if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
      return { valid: false, error: "Invalid time format (use HH:MM)" };
    }
    
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);
    
    if (endMinutes <= startMinutes) {
      return { valid: false, error: "End time must be after start time" };
    }
    
    const duration = endMinutes - startMinutes;
    if (duration > 480) { // 8 hours max
      return { valid: false, error: "Booking duration cannot exceed 8 hours" };
    }
    
    return { valid: true };
  };
  
  export const validateDate = (dateString) => {
    if (!dateString) {
      return { valid: false, error: "Date is required" };
    }
    
    const bookingDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(bookingDate.getTime())) {
      return { valid: false, error: "Invalid date format" };
    }
    
    if (bookingDate < today) {
      return { valid: false, error: "Cannot book seats for past dates" };
    }
    
    const maxAdvanceDate = new Date();
    maxAdvanceDate.setDate(maxAdvanceDate.getDate() + 30);
    if (bookingDate > maxAdvanceDate) {
      return { valid: false, error: "Cannot book more than 30 days in advance" };
    }
    
    return { valid: true };
  };
  
  export const validateEmail = (email) => {
    return emailRegex.test(email);
  };
  
  export const validateHexColor = (color) => {
    return hexColorRegex.test(color);
  };
  
  export const validateFloor = (floor) => {
    const floorNum = Number(floor);
    if (isNaN(floorNum) || floorNum < 1 || floorNum > 50) {
      return { valid: false, error: "Floor must be a number between 1 and 50" };
    }
    return { valid: true };
  };
  
  // Field validation functions
  export const validateMemberName = (memberName) => {
    if (!memberName || typeof memberName !== 'string') {
      return { valid: false, error: "Member name is required" };
    }
    
    const trimmed = memberName.trim();
    if (trimmed.length === 0) {
      return { valid: false, error: "Member name cannot be empty" };
    }
    
    if (trimmed.length > 100) {
      return { valid: false, error: "Member name cannot exceed 100 characters" };
    }
    
    return { valid: true };
  };
  
  export const validateTeamName = (teamName) => {
    if (!teamName || typeof teamName !== 'string') {
      return { valid: false, error: "Team name is required" };
    }
    
    const trimmed = teamName.trim();
    if (trimmed.length < 2) {
      return { valid: false, error: "Team name must be at least 2 characters" };
    }
    
    if (trimmed.length > 50) {
      return { valid: false, error: "Team name cannot exceed 50 characters" };
    }
    
    return { valid: true };
  };
  
  export const validateAreaId = (areaId) => {
    if (!areaId || typeof areaId !== 'string' || areaId.trim() === '') {
      return { valid: false, error: "Area ID is required" };
    }
    return { valid: true };
  };
  
  export const validateBookedBy = (bookedBy) => {
    if (!bookedBy || typeof bookedBy !== 'string' || bookedBy.trim() === '') {
      return { valid: false, error: "Booked by field is required" };
    }
    return { valid: true };
  };
  
  export const validateStatus = (status) => {
    const validStatuses = ['active', 'cancelled', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return { valid: false, error: "Status must be active, cancelled, or completed" };
    }
    return { valid: true };
  };
  
  // Comprehensive booking validation
  export const validateBookingData = (data) => {
    const { memberName, teamColor, color, date, entryTime, exitTime, floor, teamName, roomId, bookedBy, status } = data;
    const actualTeamColor = teamColor || color;
    
    const errors = [];
    
    // Required field validations
    const memberNameValidation = validateMemberName(memberName);
    if (!memberNameValidation.valid) errors.push(memberNameValidation.error);
    
    const teamNameValidation = validateTeamName(teamName);
    if (!teamNameValidation.valid) errors.push(teamNameValidation.error);
    
    const areaIdValidation = validateAreaId(roomId);
    if (!areaIdValidation.valid) errors.push(areaIdValidation.error);
    
    const bookedByValidation = validateBookedBy(bookedBy);
    if (!bookedByValidation.valid) errors.push(bookedByValidation.error);
    
    if (!actualTeamColor?.trim()) errors.push("Team color is required");
    
    // Date validation
    const dateValidation = validateDate(date);
    if (!dateValidation.valid) errors.push(dateValidation.error);
    
    // Time validation
    const timeValidation = validateTimeRange(entryTime, exitTime);
    if (!timeValidation.valid) errors.push(timeValidation.error);
    
    // Floor validation
    const floorValidation = validateFloor(floor);
    if (!floorValidation.valid) errors.push(floorValidation.error);
    
    // Status validation
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) errors.push(statusValidation.error);
    
    // Team color format validation (warning only)
    if (actualTeamColor && !validateHexColor(actualTeamColor)) {
      console.warn("Team color is not in hex format:", actualTeamColor);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      actualTeamColor,
      sanitizedData: {
        memberName: memberName?.trim(),
        teamName: teamName?.trim(),
        roomId: roomId?.trim(),
        bookedBy: bookedBy?.trim(),
        actualTeamColor,
        floor: Number(floor),
        date,
        entryTime: entryTime?.trim(),
        exitTime: exitTime?.trim(),
        status: status || 'active'
      }
    };
  };
  
  // Seat-specific validations
  export const validateSeatId = (seatId) => {
    if (!seatId || typeof seatId !== 'string' || seatId.trim() === '') {
      return { valid: false, error: "Valid seat ID is required" };
    }
    return { valid: true };
  };
  
  export const validateSeatData = (seatData) => {
    const errors = [];
    
    const memberNameValidation = validateMemberName(seatData.memberName);
    if (!memberNameValidation.valid) errors.push(memberNameValidation.error);
    
    if (!seatData.teamColor?.trim()) {
      errors.push("Team color is required for seat data");
    }
    
    if (!seatData.teamId?.trim()) {
      errors.push("Team ID is required for seat data");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  // Business rule validations
  export const validateBookingCapacity = (chairCount, maxSeats = 50) => {
    if (chairCount > maxSeats) {
      return { valid: false, error: `Cannot book more than ${maxSeats} seats` };
    }
    return { valid: true };
  };
  
  export const validateTeamConsistency = (chairs) => {
    if (!chairs || chairs.size === 0) return { valid: true };
    
    const chairsArray = Array.from(chairs.values());
    const uniqueTeams = new Set(chairsArray.map(chair => chair.teamId));
    
    if (uniqueTeams.size > 1) {
      return { valid: false, error: "All seats must belong to the same team" };
    }
    
    return { valid: true };
  };
  
  export const validateBookingDuration = (entryTime, exitTime, maxHours = 24) => {
    if (!validateTimeFormat(entryTime) || !validateTimeFormat(exitTime)) {
      return { valid: false, error: "Invalid time format" };
    }
    
    const duration = parseTimeToMinutes(exitTime) - parseTimeToMinutes(entryTime);
    const maxMinutes = maxHours * 60;
    
    if (duration > maxMinutes) {
      return { valid: false, error: `Booking duration cannot exceed ${maxHours} hours` };
    }
    
    return { valid: true };
  };
  
  export const validateBusinessHours = (entryTime, exitTime, startHour = 6, endHour = 22) => {
    if (!validateTimeFormat(entryTime) || !validateTimeFormat(exitTime)) {
      return { valid: false, error: "Invalid time format" };
    }
    
    const entryHour = parseInt(entryTime.split(':')[0]);
    const exitHour = parseInt(exitTime.split(':')[0]);
    
    if (entryHour < startHour || exitHour > endHour) {
      return { 
        valid: false, 
        error: `Bookings are only allowed between ${startHour}:00 and ${endHour}:00` 
      };
    }
    
    return { valid: true };
  };
  
  export const validateAdvanceBooking = (date, minHours = 1, maxDays = 30) => {
    const bookingDate = new Date(date);
    const now = new Date();
    
    // Check minimum advance time
    const minAdvanceTime = new Date(now.getTime() + (minHours * 60 * 60 * 1000));
    if (bookingDate < minAdvanceTime) {
      return { 
        valid: false, 
        error: `Bookings must be made at least ${minHours} hour(s) in advance` 
      };
    }
    
    // Check maximum advance time
    const maxAdvanceTime = new Date();
    maxAdvanceTime.setDate(maxAdvanceTime.getDate() + maxDays);
    if (bookingDate > maxAdvanceTime) {
      return { 
        valid: false, 
        error: `Cannot book more than ${maxDays} days in advance` 
      };
    }
    
    return { valid: true };
  };
  
  // Parameter validation for routes
  export const validateRouteParams = (params, requiredParams) => {
    const errors = [];
    
    for (const param of requiredParams) {
      if (!params[param] || (typeof params[param] === 'string' && params[param].trim() === '')) {
        errors.push(`${param} is required`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  // Utility function to check if time overlap exists
  export const checkTimeOverlap = (start1, end1, start2, end2) => {
    const start1Minutes = parseTimeToMinutes(start1);
    const end1Minutes = parseTimeToMinutes(end1);
    const start2Minutes = parseTimeToMinutes(start2);
    const end2Minutes = parseTimeToMinutes(end2);
    
    return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
  };
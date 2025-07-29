// middleware/seatBookingMiddleware.js - Updated with conflict check validation
import { validateBookingData, validateRouteParams } from "../services/seatValidationService.js";

export const sanitizeSeatBookingInput = (req, res, next) => {
  try {
    if (req.body) {
      // Trim whitespace from string fields
      const stringFields = ['userName', 'teamName', 'roomId', 'areaId', 'teamColor', 'color'];
      stringFields.forEach(field => {
        if (req.body[field] && typeof req.body[field] === 'string') {
          req.body[field] = req.body[field].trim();
        }
      });
      
      // Normalize floor to number
      if (req.body.floor) {
        req.body.floor = Number(req.body.floor);
      }
      
      // Ensure date is in correct format
      if (req.body.date) {
        try {
          const date = new Date(req.body.date);
          if (!isNaN(date.getTime())) {
            req.body.date = date.toISOString().split('T')[0]; // YYYY-MM-DD format
          }
        } catch (dateError) {
          // Let validation middleware handle invalid dates
        }
      }
    }
    
    next();
  } catch (error) {
    console.error("Error in sanitization middleware:", error);
    next(); // Continue even if sanitization fails
  }
};

export const validateBookingInput = (req, res, next) => {
  try {
    const { roomId, teamName, floor, date, entryTime, exitTime } = req.body;
    
    if (!roomId || !teamName || !floor || !date || !entryTime || !exitTime) {
      // Let controller handle missing fields with better error messages
      return next();
    }
    
    const validation = validateBookingData(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.errors
      });
    }
    
    // Attach sanitized data to request for use in controllers
    req.sanitizedData = validation.sanitizedData;
    req.actualTeamColor = validation.actualTeamColor;
    
    next();
  } catch (error) {
    console.error("Error in validation middleware:", error);
    next();
  }
};

// NEW: Validation middleware specifically for conflict checking
export const validateConflictCheckParams = (req, res, next) => {
  try {
    const { userName, date, entryTime, exitTime } = req.body;
    const errors = [];

    // Validate userName
    if (!userName || typeof userName !== 'string' || userName.trim() === '') {
      errors.push('userName is required and must be a non-empty string');
    }

    // Validate date
    if (!date) {
      errors.push('date is required');
    } else {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        errors.push('date must be a valid date format');
      }
    }

    // Validate time format (HH:MM)
    const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!entryTime || !timeFormatRegex.test(entryTime)) {
      errors.push('entryTime is required and must be in HH:MM format');
    }

    if (!exitTime || !timeFormatRegex.test(exitTime)) {
      errors.push('exitTime is required and must be in HH:MM format');
    }

    // Validate time order
    if (entryTime && exitTime && timeFormatRegex.test(entryTime) && timeFormatRegex.test(exitTime)) {
      const entryMinutes = parseInt(entryTime.split(':')[0]) * 60 + parseInt(entryTime.split(':')[1]);
      const exitMinutes = parseInt(exitTime.split(':')[0]) * 60 + parseInt(exitTime.split(':')[1]);
      
      if (exitMinutes <= entryMinutes) {
        errors.push('exitTime must be after entryTime');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    // Sanitize the input
    req.body.userName = userName.trim();
    req.body.entryTime = entryTime.trim();
    req.body.exitTime = exitTime.trim();

    next();
  } catch (error) {
    console.error("Error in conflict check validation middleware:", error);
    return res.status(500).json({
      error: 'Internal validation error'
    });
  }
};

export const validateRequiredParams = (requiredParams) => {
  return (req, res, next) => {
    try {
      const validation = validateRouteParams(req.params, requiredParams);
      
      if (!validation.isValid) {
        return res.status(400).json({
          error: "Missing required parameters",
          details: validation.errors
        });
      }
      
      next();
    } catch (error) {
      console.error("Error in parameter validation middleware:", error);
      next();
    }
  };
};

export const validateQueryParams = (requiredParams) => {
  return (req, res, next) => {
    try {
      const validation = validateRouteParams(req.query, requiredParams);
      
      if (!validation.isValid) {
        return res.status(400).json({
          error: "Missing required query parameters",
          details: validation.errors
        });
      }
      
      next();
    } catch (error) {
      console.error("Error in query validation middleware:", error);
      next();
    }
  };
};

// SIMPLIFIED: Logging middleware for self-booking only
export const logSeatBookingOperation = (operation) => {
  return (req, res, next) => {
    try {
      const timestamp = new Date().toISOString();
      const { userName, seatId } = req.params;
      const { teamName, floor, date } = req.body || {};
      
      console.log(`🪑 [${timestamp}] SEAT ${operation.toUpperCase()}:`, {
        operation,
        userName,
        seatId,
        teamName,
        floor,
        date,
        ip: req.ip
      });
      
      next();
    } catch (error) {
      console.error("Error in logging middleware:", error);
      next();
    }
  };
};

export const checkSeatBookingTimeConstraints = (req, res, next) => {
  try {
    const { date, entryTime } = req.body;
    
    if (!date || !entryTime) {
      return next();
    }
    
    const bookingDateTime = new Date(`${date}T${entryTime}:00`);
    const now = new Date();
    
    // Check if booking is too close to current time (minimum 1 hour advance)
    const minAdvanceTime = new Date(now.getTime() + (60 * 60 * 1000));
    
    if (bookingDateTime < minAdvanceTime) {
      return res.status(400).json({
        message: "Seat bookings must be made at least 1 hour in advance"
      });
    }
    
    next();
  } catch (error) {
    console.error("Error in time constraint middleware:", error);
    next();
  }
};

// SIMPLIFIED: Quota check for self-booking only
export const checkSeatBookingQuota = async (req, res, next) => {
  try {
    const { userName } = req.params;
    const { date } = req.body;
    
    if (!userName || !date) {
      return next();
    }
    
    const { getMemberBookingStats } = await import("../services/seatBookingService.js");
    
    const stats = await getMemberBookingStats(userName);
    
    // Check against daily limit (configurable)
    const DAILY_LIMIT = 10; // Allow up to 10 bookings per member
    
    if (stats.futureBookings >= DAILY_LIMIT) {
      return res.status(429).json({
        message: `Booking limit exceeded. You have ${stats.futureBookings} active bookings (limit: ${DAILY_LIMIT})`,
        currentBookings: stats.futureBookings,
        limit: DAILY_LIMIT
      });
    }
    
    next();
  } catch (error) {
    console.error("Error in quota check middleware:", error);
    next();
  }
};

export const handleSeatBookingErrors = (error, req, res, next) => {
  try {
    console.error("Seat booking operation error:", error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Database validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Duplicate booking detected',
        error: 'A booking with these details already exists'
      });
    }
    
    // Handle business logic errors
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message.includes('conflict') || error.message.includes('already booked')) {
      return res.status(409).json({ message: error.message });
    }
    
    // REMOVED: Admin/leader permission errors - not needed for self-booking
    
    if (error.message.includes('limit') || error.message.includes('quota')) {
      return res.status(429).json({ message: error.message });
    }
    
    // Default server error
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(500).json({
      error: "An unexpected error occurred",
      message: isDevelopment ? error.message : 'Internal server error',
      ...(isDevelopment && { stack: error.stack })
    });
  } catch (middlewareError) {
    console.error("Error in error handling middleware:", middlewareError);
    res.status(500).json({
      error: "Critical server error",
      message: "Error handling failed"
    });
  }
};
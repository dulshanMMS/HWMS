// middleware/seatBookingMiddleware.js - Simplified and error-free
import { validateBookingData, validateRouteParams } from "../services/seatValidationService.js";

// Basic input sanitization middleware
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

// Basic validation middleware (optional - can be skipped)
export const validateBookingInput = (req, res, next) => {
  try {
    // Only validate if all required fields are present
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
    // Continue to controller even if validation fails
    next();
  }
};

// Route parameter validation middleware
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
      next(); // Continue even if validation fails
    }
  };
};

// Query parameter validation middleware
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
      next(); // Continue even if validation fails
    }
  };
};

// Simple logging middleware
export const logSeatBookingOperation = (operation) => {
  return (req, res, next) => {
    try {
      const timestamp = new Date().toISOString();
      const { userName, seatId, teamMemberName } = req.params;
      const { teamName, floor, date } = req.body || {};
      
      console.log(`🪑 [${timestamp}] SEAT ${operation.toUpperCase()}:`, {
        operation,
        userName,
        seatId,
        teamMemberName,
        teamName,
        floor,
        date,
        ip: req.ip
      });
      
      next();
    } catch (error) {
      console.error("Error in logging middleware:", error);
      next(); // Continue even if logging fails
    }
  };
};

// Basic time constraint check (optional)
export const checkSeatBookingTimeConstraints = (req, res, next) => {
  try {
    const { date, entryTime } = req.body;
    
    if (!date || !entryTime) {
      return next(); // Skip if no date/time provided
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
    next(); // Continue even if check fails
  }
};

// Simple quota check (optional)
export const checkSeatBookingQuota = async (req, res, next) => {
  try {
    const { userName } = req.params;
    const { date } = req.body;
    
    if (!userName || !date) {
      return next(); // Skip if no user/date provided
    }
    
    // Import service function
    const { getMemberBookingStats } = await import("../services/seatBookingService.js");
    
    // Get member's booking stats
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
    next(); // Continue even if quota check fails
  }
};

// Error handling middleware
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
    
    if (error.message.includes('permission') || error.message.includes('Only team leaders')) {
      return res.status(403).json({ message: error.message });
    }
    
    // Handle rate limiting errors
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
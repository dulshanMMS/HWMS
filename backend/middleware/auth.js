import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to authenticate JWT tokens
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database to ensure they still exist
    const user = await User.findOne({ username: decoded.username }).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token. User not found.' 
      });
    }

    // Add user info to request object
    req.user = {
      username: user.username,
      userId: user._id,
      teamId: user.teamId,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token has expired. Please log in again.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token. Please log in again.' 
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during authentication.' 
    });
  }
};

// Middleware to check if user is a team leader
export const requireTeamLeader = (req, res, next) => {
  if (req.user.role !== 'leader') {
    return res.status(403).json({ 
      error: 'Access denied. Team leader privileges required.' 
    });
  }
  next();
};

// Middleware to check if user belongs to a specific team
export const requireSameTeam = async (req, res, next) => {
  try {
    const { teamMemberName } = req.params;
    
    if (teamMemberName) {
      const teamMember = await User.findOne({ username: teamMemberName });
      
      if (!teamMember) {
        return res.status(404).json({ 
          error: 'Team member not found.' 
        });
      }
      
      if (teamMember.teamId !== req.user.teamId) {
        return res.status(403).json({ 
          error: 'Access denied. User not in your team.' 
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Team validation error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during team validation.' 
    });
  }
};

// Rate limiting middleware for booking operations
const bookingAttempts = new Map();

export const rateLimitBookings = (req, res, next) => {
  const userId = req.user.userId;
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxAttempts = 10; // 10 bookings per minute

  if (!bookingAttempts.has(userId)) {
    bookingAttempts.set(userId, []);
  }

  const attempts = bookingAttempts.get(userId);
  
  // Remove old attempts outside the time window
  const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({ 
      error: 'Too many booking attempts. Please try again later.' 
    });
  }

  // Add current attempt
  recentAttempts.push(now);
  bookingAttempts.set(userId, recentAttempts);
  
  next();
};

export default {
  authenticateToken,
  requireTeamLeader,
  requireSameTeam,
  rateLimitBookings
};
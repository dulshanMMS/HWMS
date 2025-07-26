import jwt from "jsonwebtoken";
import User from '../models/User.js';

// Email Validation
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
    return emailRegex.test(email);
};

// Username Validation
export const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{8,}$/;
    return usernameRegex.test(username);
};

// Password Validation
export const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/;
    return passwordRegex.test(password);
};

// Verify JWT Token
export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; 

    if (!token) {
        return res.status(403).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next(); 
    } catch (error) {
        res.status(401).json({ error: "Invalid token." });
    }
};

// Admin Role Check Middleware
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ error: "Access denied. Admins only." });
    }
};

// Middleware to check authentication
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


export const verifyAdmin = (req, res, next) => {
  // Assuming user is attached to req from auth middleware
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }
};


export default verifyToken;

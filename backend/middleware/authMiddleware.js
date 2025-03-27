import jwt from "jsonwebtoken";
import User from "../models/User.js";

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
const verifyToken = (req, res, next) => {
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

export default verifyToken;

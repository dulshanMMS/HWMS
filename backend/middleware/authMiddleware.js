import jwt from "jsonwebtoken";

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

// You can export verifyToken as default and also as a named export
export default verifyToken;

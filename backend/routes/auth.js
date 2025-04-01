import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import verifyToken, { isAdmin, validateEmail, validateUsername, validatePassword } from "../middleware/authMiddleware.js";

const router = express.Router();

// User Signup
router.post("/signup", async (req, res) => {
    const { firstName, lastName, username, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (!validateUsername(username)) {
        return res.status(400).json({ error: "Username must be at least 8 characters long and contain only alphanumeric characters and underscores." });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ error: "Invalid email format. Must include '@' and end with '.com'." });
    }

    if (!validatePassword(password)) {
        return res.status(400).json({ error: "Password must contain at least one uppercase letter and one special character." });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ error: "Username already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            role: "user"
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// User Login
router.post("/signin", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user || user.email !== email) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        /*const isAdmin = adminEmails.includes(user.email); */
        const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        
        if (user.role === "admin") {
            res.status(200).json({ message: `Hello, ${user.username}!`, role: "admin", token });
          } else {
            res.status(200).json({ message: `Hello, ${user.username}!`, role: "user", token });
          }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Verify Token
router.get("/protected", verifyToken, (req, res) => {
    res.status(200).json({ message: "This is a protected route!", user: req.user });
});

// User Dashboard (Only Logged-in Users)
router.get("/user", verifyToken, (req, res) => {
    res.json({ message: "Welcome to the User Dashboard", user: req.user });
});

// Admin Dashboard (Only Admins)
router.get("/admin", verifyToken, isAdmin, (req, res) => {
    res.json({ message: "Welcome to the Admin Dashboard", user: req.user });
});

export default router;

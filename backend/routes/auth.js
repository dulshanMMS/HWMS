import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import verifyToken, { validateEmail, validateUsername, validatePassword } from "../middleware/authMiddleware.js";

const router = express.Router();
const adminEmails = ["wileyhwms@test.com"];

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
            password: hashedPassword
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

        const isAdmin = adminEmails.includes(user.email);
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: `Hello, ${user.username}!`, token , isAdmin });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Verify Token
router.get("/protected", verifyToken, (req, res) => {
    res.status(200).json({ message: "This is a protected route!", user: req.user });
});

export default router;

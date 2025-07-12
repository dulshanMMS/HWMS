import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import verifyToken, { isAdmin } from "../middleware/authMiddleware.js";
import { forgotPassword, resetPassword } from "../controllers/authController.js";

const router = express.Router();

// User Signup
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    console.log("Signup attempt:", { username, email });

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists by email or username
    let existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: "Email already exists" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ error: "Username already exists" });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({ 
      username, 
      email, 
      password: hashedPassword,
      role: 'user' // Default role
    });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("Signup successful for:", username);

    res.status(201).json({
      message: "User registered successfully!",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ 
      error: "Server error", 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

// User Login
router.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log("Login attempt:", { username });

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found:", username);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", username);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("Login successful for:", username);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      error: "Server error", 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

// Protected Routes
router.get("/protected", verifyToken, (req, res) => {
  res.json({ 
    message: "Protected route accessed successfully", 
    user: req.user 
  });
});

router.get("/user", verifyToken, (req, res) => {
  res.json({ 
    message: "User dashboard accessed", 
    user: req.user 
  });
});

router.get("/admin", verifyToken, isAdmin, (req, res) => {
  res.json({ 
    message: "Admin dashboard accessed", 
    user: req.user 
  });
});

// Password Reset Routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes working!" });
});

export default router;
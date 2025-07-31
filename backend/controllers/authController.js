import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  validateEmail,
  validateUsername,
  validatePassword,
} from "../middleware/authMiddleware.js";
import nodemailer from "nodemailer";

// User Signup
export const signup = async (req, res) => {
  const { firstName, lastName, username, email, password, confirmPassword } = req.body;

  if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!validateUsername(username)) {
    return res.status(400).json({
      error: "Username must be at least 8 characters long and contain only alphanumeric characters and underscores.",
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format. Must include '@' and end with '.com'." });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      error: "Password must contain at least one uppercase letter and one special character.",
    });
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
      role: "user",
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error. Email already exists" });
  }
};

// User Login
export const signin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {        //!email ||
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {           //(!user || user.email !== email)
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: `Hello, ${user.username}!`,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

//once the token is verified
export const protectedRoute = (req, res) => {
  res.status(200).json({ message: "This is a protected route!", user: req.user });
};

export const userDashboard = (req, res) => {
  res.json({ message: "Welcome to the User Dashboard", user: req.user });
};

export const adminDashboard = (req, res) => {
  res.json({ message: "Welcome to the Admin Dashboard", user: req.user });
};


// Forgot Password Controller
export const forgotPassword = async (req, res) => {
  const { email } = req.body;                    // pulls the email sent by frontend body

  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const user = await User.findOne({ email });                                              //checks if the user exists with that email
    if (!user) return res.status(404).json({ error: "User not found with this email" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });     //create a token for user._id

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    const transporter = nodemailer.createTransport({               //uses nodemailer to sent email
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Gmail or other email
        pass: process.env.EMAIL_PASS, // App password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Link",
      html: `
        <h3>Password Reset Request</h3>
        <p>Hello ${user.username},</p>
        <p>Click the link below to reset your password (valid for 15 minutes):</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you didn’t request this, ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Reset link sent to your email!" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error sending reset link" });
  }
};

//Reset Password
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required" });
  }

  try {
    // Verify the reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Validate new password 
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error: "Password must contain at least one uppercase letter and one special character.",
      });
    }

    // Hash and update the password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword }, { runValidators: false });
    user.password = hashedPassword;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err.message);
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

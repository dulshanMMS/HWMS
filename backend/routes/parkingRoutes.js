import express from "express";
import ParkingSlot from "../models/ParkingSlots.js";
import { io } from "../server.js"; // Import socket instance
import verifyToken from "../middleware/authMiddleware.js"; // Import the authentication middleware
import User from '../models/User.js';
import { createBookingNotifications } from '../services/notificationService.js'; // Import createBookingNotifications Sjay

const router = express.Router();

// Add verifyToken middleware to protect these routes
// Only authenticated users can check available slots
router.post("/available-slots", verifyToken, async (req, res) => {
    const {date, entryTime, exitTime, floor } = req.body;

    // Get all slots on the given floor
    const slots = await ParkingSlot.find({ floor });

    // Filter slots that are NOT booked for the selected time
    const availableSlots = slots.filter(slot =>
        !slot.bookings.some(booking =>
            booking.date === date &&
            !(exitTime <= booking.entryTime || entryTime >= booking.exitTime)
        )
    );

    res.json({ availableSlots });
});

// Book a Parking Slot - now uses the username from the JWT token
// User only needs to provide slotNumber, date, entryTime, exitTime (no floor)
router.post("/book-slot", verifyToken, async (req, res) => {
    // Get username from the token (middleware adds the user info to req.user)
    const username = req.user.username;
    
    const { slotNumber, date, entryTime, exitTime } = req.body;

    // Find the slot by slotNumber only, without requiring floor
    const slot = await ParkingSlot.findOne({ slotNumber });

    if (!slot) return res.status(404).json({ message: "Slot not found" });

    // Check for overlapping bookings
    const overlapping = slot.bookings.some(booking =>
        booking.date === date &&
        !(exitTime <= booking.entryTime || entryTime >= booking.exitTime)
    );

    if (overlapping) return res.status(400).json({ message: "Slot already booked for this time" });

    // Save booking with username instead of userId
    slot.bookings.push({ userName: username, date, entryTime, exitTime });
    await slot.save();

    // Emit real-time update
    io.emit("updateParkingSlots", { message: "Slot booked", slot });

    // Send booking notifications Sjay
    try {
        const latestBooking = slot.bookings[slot.bookings.length - 1];
        await createBookingNotifications('parking', slot, latestBooking);
        console.log(`📍 Booking notification sent for user ${username}, slot ${slotNumber}, date ${date}`);
    } catch (error) {
        console.error('❌ Error sending booking notification:', error.message, error.stack);
    }

    res.json({ message: "Booking successful", slot });
});

export default router;
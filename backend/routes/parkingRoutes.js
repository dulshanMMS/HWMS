import express from "express";
import ParkingSlot from "../models/ParkingSlots.js";
import { io } from "../server.js"; // Import socket instance

const router = express.Router();

// Temporary storage for selected booking details (per user session)
// const bookingSessions = new Map(); // { userId: { date, entryTime, exitTime, floor } }

//  Get Available Slots Based on Date, Time, and Floor
router.post("/available-slots", async (req, res) => {
    const {date, entryTime, exitTime, floor } = req.body;

    // Store booking details temporarily for this user
    // bookingSessions.set(userId, { date, entryTime, exitTime, floor });

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

//  Book a Parking Slot (Now only requires userId & slotNumber)
router.post("/book-slot", async (req, res) => {
    const { userId, slotNumber,date, entryTime, exitTime } = req.body;

    // Retrieve stored booking details
    //const bookingData = bookingSessions.get(userId);
     // if (!bookingData) return res.status(400).json({ message: "Session expired. Check available slots again." });

    // const { date, entryTime, exitTime, floor } = bookingData;

    const slot = await ParkingSlot.findOne({ slotNumber});

    if (!slot) return res.status(404).json({ message: "Slot not found" });

    // Check for overlapping bookings
    const overlapping = slot.bookings.some(booking =>
        booking.date === date &&
        !(exitTime <= booking.entryTime || entryTime >= booking.exitTime)
    );

    if (overlapping) return res.status(400).json({ message: "Slot already booked for this time" });

    // Save booking
    slot.bookings.push({ userId, date, entryTime, exitTime });
    await slot.save();

    // Emit real-time update
    io.emit("updateParkingSlots", { message: "Slot booked", slot });

    // Remove temporary booking data after successful booking
    // bookingSessions.delete(userId);

    res.json({ message: "Booking successful", slot });
});

export default router;

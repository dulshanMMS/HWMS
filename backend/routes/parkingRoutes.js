import express from "express";
import ParkingSlot from "../models/ParkingSlots.js";
import { io } from "../parking.js"; // Import socket instance

const router = express.Router();

//  Get Available Slots Based on Date, Time, and Floor
router.post("/available-slots", async (req, res) => {
    const { date, entryTime, exitTime, floor } = req.body;

    // Get all slots on the given floor
    const slots = await ParkingSlot.find({ floor });

    // Filter slots that are NOT booked for the selected time
    const availableSlots = slots.filter(slot =>
        !slot.bookings.some(booking =>
            booking.date === date &&
            ((entryTime < booking.exitTime && exitTime > booking.entryTime))
        )
    );

    res.json({ availableSlots });
});

//  Book a Parking Slot
router.post("/book-slot", async (req, res) => {
    const { userId, slotNumber, date, entryTime, exitTime } = req.body;

    const slot = await ParkingSlot.findOne({ slotNumber });

    if (!slot) return res.status(404).json({ message: "Slot not found" });

    // Check for overlapping bookings
    const overlapping = slot.bookings.some(booking =>
        booking.date === date &&
        ((entryTime < booking.exitTime && exitTime > booking.entryTime))
    );

    if (overlapping) return res.status(400).json({ message: "Slot already booked for this time" });

    // Save booking
    slot.bookings.push({ userId, date, entryTime, exitTime });
    await slot.save();

    // Emit real-time update
    io.emit("updateParkingSlots", { message: "Slot booked", slot });

    res.json({ message: "Booking successful", slot });
});

export default router;


import express from "express";
import ParkingSlot from "../models/ParkingSlots.js";
import verifyToken from "../middleware/authMiddleware.js";
import { createCancellationNotifications } from "../services/notificationService.js"; //Sjay

const router = express.Router();

// Get Booking History (Total bookings + Dates) - Auth Required
router.post("/user", verifyToken, async (req, res) => {
    const { type } = req.body; // Type is still received from frontend as "parking"
    const userName = req.user.username; // Extracted from token

    try {
        const slots = await ParkingSlot.find({ "bookings.userName": userName });      // Identify the bookings according to the username

        let totalBookings = 0;
        let bookedDates = new Set();

        slots.forEach(slot => {
            slot.bookings.forEach(booking => {
                if (booking.userName === userName) {
                    totalBookings++;
                    bookedDates.add(booking.date);
                }
            });
        });

        return res.json({
            totalBookings,
            bookedDates: Array.from(bookedDates)    // Convert Set to Array
        });

    } catch (error) {
        console.error('Error fetching booking history:', error);
        return res.status(500).json({ message: "Error fetching booking history", error: error.message });
    }
});

// Get Booking Details for a Specific Date - Auth Required
router.post("/user/details", verifyToken, async (req, res) => {
    const { type, date } = req.body;
    const userName = req.user.username; // From token

    try {
        const slots = await ParkingSlot.find({ "bookings.userName": userName });

        let bookingDetails = [];

        slots.forEach(slot => {
            slot.bookings.forEach(booking => {
                if (booking.userName === userName && booking.date === date) {
                    bookingDetails.push({
                        slotNumber: slot.slotNumber,
                        floor: slot.floor,
                        date: booking.date,
                        entryTime: booking.entryTime,
                        exitTime: booking.exitTime
                    });
                }
            });
        });

        if (bookingDetails.length === 0) {
            return res.status(404).json({ message: "No bookings found for the selected date." });
        }

        return res.json(bookingDetails);

    } catch (error) {
        console.error('Error fetching booking details:', error);
        return res.status(500).json({ message: "Error fetching booking details", error: error.message });
    }
});

// Delete Booking - Auth Required
router.delete("/user/delete", verifyToken, async (req, res) => {
    const { slotNumber, date, entryTime, exitTime } = req.body;
    const userName = req.user.username; // From token
    const userId = req.user.id; // From token

    console.log('Delete request received:', { slotNumber, date, entryTime, exitTime, userName, userId });

    try {
        const slot = await ParkingSlot.findOne({ slotNumber });
        if (!slot) {
            console.error('Slot not found:', slotNumber);
            return res.status(404).json({ message: "Slot not found." });
        }

        console.log('Slot found:', { slotNumber: slot.slotNumber, floor: slot.floor, bookings: slot.bookings.length });

        const updatedBookings = slot.bookings.filter(
            booking => !(
                booking.userName === userName &&
                booking.date === date &&
                booking.entryTime === entryTime &&
                booking.exitTime === exitTime
            )
        );

        if (updatedBookings.length === slot.bookings.length) {
            console.error('Booking not found for deletion:', { userName, date, entryTime, exitTime });
            return res.status(404).json({ message: "Booking not found for deletion." });
        }

        slot.bookings = updatedBookings;    // Update the bookings array
        await slot.save();
        console.log('Booking deleted successfully:', { slotNumber, date, entryTime, exitTime });

        // Generate bookingId for cancellation notification Sjay
        const bookingId = `${slot._id}-${date}-${entryTime}-${userName}`;
        console.log('Generated bookingId:', bookingId);

        // Trigger cancellation notification Sjay
        console.log('Triggering cancellation notification for:', { userId, slotNumber, floor: slot.floor, type: "parking", date, bookingId });
         createCancellationNotifications({
            userId,
            slotNumber,
            floor: slot.floor,
            type: "parking",
            date,
            bookingId
        });

        return res.json({ message: "Booking deleted successfully." });

    } catch (error) {
        console.error('Error in delete route:', error.message, error.stack);
        return res.status(500).json({ message: "Error deleting booking", error: error.message });
    }
});

export default router;
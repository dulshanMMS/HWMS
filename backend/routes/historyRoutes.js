import express from "express";
import ParkingSlot from "../models/ParkingSlots.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

// Get Booking History (Total bookings + Dates) - Auth Required
router.post("/user", verifyToken, async (req, res) => {
    const { type } = req.body; // Only type is needed from body parking or seat
    const userName = req.user.username; //  Extracted from token

    if (type !== "parking") {
        return res.status(400).json({ message: "Seat booking history not yet implemented." });      // only parkingbookings yet..have to update seats also 
    }

    try {
        const slots = await ParkingSlot.find({ "bookings.userName": userName });      //identitfy the bookings according to the username

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
        return res.status(500).json({ message: "Error fetching booking history", error });
    }
});

// Get Booking Details for a Specific Date - Auth Required
router.post("/user/details", verifyToken, async (req, res) => {
    const { type, date } = req.body;
    const userName = req.user.username; //  From token

    if (type !== "parking") {
        return res.status(400).json({ message: "Seat booking history not yet implemented." });
    }

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
        return res.status(500).json({ message: "Error fetching booking details", error });
    }
});

// Delete Booking - Auth Required
router.delete("/user/delete", verifyToken, async (req, res) => {
    const { slotNumber, date, entryTime, exitTime } = req.body;
    const userName = req.user.username; //  From token

    try {
        const slot = await ParkingSlot.findOne({ slotNumber });

        if (!slot) {
            return res.status(404).json({ message: "Slot not found." });
        }

        const updatedBookings = slot.bookings.filter(
            booking => !(
                booking.userName === userName &&
                booking.date === date &&
                booking.entryTime === entryTime &&
                booking.exitTime === exitTime
            )
        );

        if (updatedBookings.length === slot.bookings.length) {
            return res.status(404).json({ message: "Booking not found for deletion." });
        }

        slot.bookings = updatedBookings;    // Update the bookings array
        await slot.save();

        return res.json({ message: "Booking deleted successfully." });

    } catch (error) {
        return res.status(500).json({ message: "Error deleting booking", error });
    }
});

export default router;

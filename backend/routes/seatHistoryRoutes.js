import express from "express";
import SeatingSlots from "../models/SeatingSlots.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

// Get Seat Booking History (Total bookings + Dates) - Auth Required
router.post("/user", verifyToken, async (req, res) => {
    const { type } = req.body; // Type is received from frontend as "seat"
    const userName = req.user.userName; // Extracted from token - UPDATED to userName

    try {
        // Find the user's booking record - UPDATED field name to userName
        const userBookings = await SeatingSlots.findOne({ userName: userName });

        if (!userBookings) {
            return res.json({
                totalBookings: 0,
                bookedDates: []
            });
        }

        const totalBookings = userBookings.totalBookings;
        const bookedDates = new Set();

        // Extract unique dates from bookings array
        userBookings.bookings.forEach(booking => {
            // Convert date to string format for consistency
            const dateStr = booking.date.toISOString().split('T')[0]; // YYYY-MM-DD format
            bookedDates.add(dateStr);
        });

        return res.json({
            totalBookings,
            bookedDates: Array.from(bookedDates) // Convert Set to Array
        });

    } catch (error) {
        return res.status(500).json({ message: "Error fetching seat booking history", error });
    }
});

// Get Seat Booking Details for a Specific Date - Auth Required
router.post("/user/details", verifyToken, async (req, res) => {
    const { type, date } = req.body;
    const userName = req.user.userName; // From token - UPDATED to userName

    try {
        // Find the user's booking record - UPDATED field name to userName
        const userBookings = await SeatingSlots.findOne({ userName: userName });

        if (!userBookings) {
            return res.status(404).json({ message: "No booking records found for user." });
        }

        // Filter bookings for the specific date
        const targetDate = new Date(date);
        const bookingDetails = userBookings.bookings.filter(booking => {
            const bookingDate = new Date(booking.date);
            return bookingDate.toDateString() === targetDate.toDateString();
        }).map(booking => ({
            bookingId: booking.bookingId,
            areaId: booking.areaId,
            floor: booking.floor,
            date: booking.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
            entryTime: booking.entryTime,
            exitTime: booking.exitTime,
            seatId: booking.seatId,
            bookedAt: booking.bookedAt,
            teamName: userBookings.teamName,
            teamColor: userBookings.teamColor
        }));

        if (bookingDetails.length === 0) {
            return res.status(404).json({ message: "No seat bookings found for the selected date." });
        }

        return res.json(bookingDetails);

    } catch (error) {
        return res.status(500).json({ message: "Error fetching seat booking details", error });
    }
});

// Delete Seat Booking - Auth Required
router.delete("/user/delete", verifyToken, async (req, res) => {
    const { bookingId, seatId, date, entryTime, exitTime } = req.body;
    const userName = req.user.userName; // From token - UPDATED to userName

    try {
        // Find the user's booking record - UPDATED field name to userName
        const userBookings = await SeatingSlots.findOne({ userName: userName });

        if (!userBookings) {
            return res.status(404).json({ message: "No booking records found for user." });
        }

        // Find and remove the specific booking
        const initialLength = userBookings.bookings.length;
        
        userBookings.bookings = userBookings.bookings.filter(booking => {
            // Match by bookingId (primary identifier) or by combination of other fields
            if (bookingId) {
                return booking.bookingId !== bookingId;
            } else {
                // Fallback to matching by multiple fields if bookingId not provided
                const bookingDate = booking.date.toISOString().split('T')[0];
                return !(
                    booking.seatId === seatId &&
                    bookingDate === date &&
                    booking.entryTime === entryTime &&
                    booking.exitTime === exitTime
                );
            }
        });

        // Check if any booking was actually removed
        if (userBookings.bookings.length === initialLength) {
            return res.status(404).json({ message: "Seat booking not found for deletion." });
        }

        // Update totalBookings count
        userBookings.totalBookings = userBookings.bookings.length;

        // Save the updated document
        await userBookings.save();

        return res.json({ message: "Seat booking deleted successfully." });

    } catch (error) {
        return res.status(500).json({ message: "Error deleting seat booking", error });
    }
});

// Get user's team information - Auth Required
router.get("/user/team", verifyToken, async (req, res) => {
    const userName = req.user.userName; // UPDATED to userName

    try {
        // UPDATED field name in query to userName
        const userBookings = await SeatingSlots.findOne(
            { userName: userName }, 
            { teamName: 1, teamColor: 1, teamId: 1, totalBookings: 1 }
        );

        if (!userBookings) {
            return res.status(404).json({ message: "User team information not found." });
        }

        return res.json({
            teamName: userBookings.teamName,
            teamColor: userBookings.teamColor,
            teamId: userBookings.teamId,
            totalBookings: userBookings.totalBookings
        });

    } catch (error) {
        return res.status(500).json({ message: "Error fetching team information", error });
    }
});

export default router;
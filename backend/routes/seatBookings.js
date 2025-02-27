const express = require('express');
const SeatBooking = require('../models/seatBooking');

const router = express.Router();

// Reserve Team Slots (Prevent Overlapping)
router.post('/bookings/team/:teamId/area/:areaId', async (req, res) => {
    try {
        const { teamId, areaId } = req.params;
        const { teamName, areaName, seats, startTime, endTime } = req.body;

        const start = new Date(startTime);
        const end = new Date(endTime);

        // Check if any seats are already booked during this time slot
        const conflictingBookings = await SeatBooking.find({
            areaId,
            seatNumber: { $in: seats },
            $or: [
                { "timeSlot.startTime": { $lt: end }, "timeSlot.endTime": { $gt: start } }
            ]
        });

        if (conflictingBookings.length > 0) {
            return res.status(400).json({
                error: "Some seats are already booked within this time slot.",
                conflictingSeats: conflictingBookings.map(seat => seat.seatNumber)
            });
        }

        // If no conflicts, proceed with booking
        const bookings = seats.map(seat => ({
            teamId,
            teamName,
            areaId,
            areaName,
            seatNumber: seat,
            isBooked: true,
            timeSlot: { startTime: start, endTime: end }
        }));

        await SeatBooking.insertMany(bookings);
        res.status(200).json({ success: "Team slots reserved successfully." });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Book an Individual Seat (Prevent Overlapping)
router.post('/bookings/member/:memberId/seat/:seatId', async (req, res) => {
    try {
        const { memberId, seatId } = req.params;
        const { startTime, endTime } = req.body;

        const start = new Date(startTime);
        const end = new Date(endTime);

        // Check if the seat is already booked during this time slot
        const existingBooking = await SeatBooking.findOne({
            seatNumber: seatId,
            $or: [
                { "timeSlot.startTime": { $lt: end }, "timeSlot.endTime": { $gt: start } }
            ]
        });

        if (existingBooking) {
            return res.status(400).json({
                error: "Seat is already booked during this time slot."
            });
        }

        // If seat is available, book it
        const newBooking = new SeatBooking({
            seatNumber: seatId,
            isBooked: true,
            bookedBy: memberId,
            timeSlot: { startTime: start, endTime: end }
        });

        await newBooking.save();
        res.status(200).json({ success: "Seat booked successfully." });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get Available Team Slots (Check Time Slots)
router.get('/bookings/team/:teamId/area/:areaId', async (req, res) => {
    try {
        const { teamId, areaId } = req.params;
        const { startTime, endTime } = req.query;

        const start = new Date(startTime);
        const end = new Date(endTime);

        // Find seats that are not booked in this time slot
        const availableSeats = await SeatBooking.find({
            areaId,
            isBooked: false,
            $or: [
                { "timeSlot.startTime": { $gte: end } },
                { "timeSlot.endTime": { $lte: start } }
            ]
        });

        res.status(200).json(availableSeats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cancel a Booking (Release Seat & Time Slot)
router.delete('/bookings/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const seat = await SeatBooking.findById(bookingId);

        if (!seat) {
            return res.status(404).json({ error: "Booking not found" });
        }

        seat.isBooked = false;
        seat.bookedBy = null;
        seat.timeSlot = { startTime: null, endTime: null }; // Free the time slot
        await seat.save();

        res.status(200).json({ success: "Booking cancelled successfully, time slot released." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

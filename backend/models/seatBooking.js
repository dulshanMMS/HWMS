const mongoose = require('mongoose');

const seatBookingSchema = new mongoose.Schema({
    teamId: {
        type: String,
        required: true
    },
    teamName: {
        type: String,
        required: true
    },
    areaId: {
        type: String,
        required: true
    },
    areaName: {
        type: String,
        required: true
    },
    seatNumber: {
        type: String,
        required: true
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    bookedBy: {
        type: String, // User ID of the person who booked
        default: null
    },
    timeSlot: {
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date,
            required: true
        }
    }
});

module.exports = mongoose.model('SeatBooking', seatBookingSchema, 'seat_bookings');

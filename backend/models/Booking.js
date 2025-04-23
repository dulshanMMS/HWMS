import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['seat', 'parking']
    },
    userId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['confirmed', 'pending', 'cancelled']
    },
    details: {
        type: String,
        required: true
    },
    program: {
        type: String,
        required: true,
        enum: ['SENG', 'BM', 'IT']
      },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
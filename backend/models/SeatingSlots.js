// models/SeatingSlots.js - Fixed to match User and Team models
import mongoose from "mongoose";

// Define schema for individual booking in the array
const BookingItemSchema = new mongoose.Schema({
  bookingId: { type: String, required: true },
  areaId: { type: String, required: true },
  floor: { type: Number, required: true },
  date: { type: Date, required: true },
  entryTime: { type: String, required: true },
  exitTime: { type: String, required: true },
  seatId: { type: String, required: true },
  bookedAt: { type: Date, default: Date.now }
}, { _id: false, timestamps: false });

// Define schema for member's booking record - FIXED to match User model
const MemberBookingSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },  // Changed from userName to username
  teamId: { type: String, required: true, index: true },
  teamName: { type: String, required: true },
  teamColor: { type: String, required: true },
  bookings: [BookingItemSchema],
  totalBookings: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  }
}, { 
  timestamps: true
});

// Compound indexes for efficient queries - UPDATED field names
MemberBookingSchema.index({ username: 1, teamId: 1 }, { unique: true });  // Changed userName to username
MemberBookingSchema.index({ username: 1, status: 1 });                   // Changed userName to username
MemberBookingSchema.index({ teamId: 1, status: 1 });
MemberBookingSchema.index({ "bookings.date": 1, "bookings.floor": 1 });
MemberBookingSchema.index({ "bookings.seatId": 1, "bookings.date": 1 });

const SeatingSlots = mongoose.model("seatingslots", MemberBookingSchema);

export default SeatingSlots;
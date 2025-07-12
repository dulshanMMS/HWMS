// models/SeatingSlots.js - Minimal model like ParkingSlots.js
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

// Define schema for member's booking record
const MemberBookingSchema = new mongoose.Schema({
  userName: { type: String, required: true, index: true },
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

// Compound indexes for efficient queries
MemberBookingSchema.index({ userName: 1, teamId: 1 }, { unique: true });
MemberBookingSchema.index({ userName: 1, status: 1 });
MemberBookingSchema.index({ teamId: 1, status: 1 });
MemberBookingSchema.index({ "bookings.date": 1, "bookings.floor": 1 });
MemberBookingSchema.index({ "bookings.seatId": 1, "bookings.date": 1 });

const SeatingSlots = mongoose.model("seatingslots", MemberBookingSchema);

export default SeatingSlots;
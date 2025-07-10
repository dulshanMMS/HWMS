// models/seatBooking.js - Only the Booking model (fixed version)
import mongoose from "mongoose";

// Define schema for individual chair booking (for Map values)
const ChairSchema = new mongoose.Schema({
  memberName: { type: String, required: true },
  teamColor: { type: String, required: true },
  teamId: { type: String, required: true },
  bookedAt: { type: Date, default: Date.now }
}, { _id: false, timestamps: false });

// Define schema for booking - matching your existing structure
const BookingSchema = new mongoose.Schema({
  areaId: { type: String, required: true, index: true },
  teamName: { type: String, required: true },
  floor: { type: Number, required: true, index: true },
  date: { type: Date, required: true, index: true },
  entryTime: { type: String, required: true },
  exitTime: { type: String, required: true },
  chairs: { type: Map, of: ChairSchema, default: new Map() }, // Keep your existing Map structure
  bookedBy: { type: String, required: true }, // Track who made the booking
  status: { 
    type: String, 
    enum: ['active', 'cancelled', 'completed'], 
    default: 'active' 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
BookingSchema.index({ floor: 1, date: 1, entryTime: 1 });
BookingSchema.index({ areaId: 1, floor: 1, date: 1 });
BookingSchema.index({ teamName: 1, date: 1 });
BookingSchema.index({ bookedBy: 1, date: 1 });

// Virtual for formatted date
BookingSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Instance method to check if seat exists
BookingSchema.methods.hasSeat = function(seatId) {
  return this.chairs.has(seatId);
};

// Instance method to get seat by ID
BookingSchema.methods.getSeat = function(seatId) {
  return this.chairs.get(seatId);
};

// Instance method to add seat
BookingSchema.methods.addSeat = function(seatId, seatData) {
  this.chairs.set(seatId, seatData);
  return true;
};

// Instance method to remove seat
BookingSchema.methods.removeSeat = function(seatId) {
  return this.chairs.delete(seatId);
};

// Static method to find bookings by date and floor
BookingSchema.statics.findByDateAndFloor = function(date, floor) {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  
  return this.find({
    floor: floor,
    date: { $gte: startDate, $lte: endDate },
    status: 'active'
  });
};

// Static method to check time overlap
BookingSchema.statics.checkTimeOverlap = function(start1, end1, start2, end2) {
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const start1Minutes = parseTime(start1);
  const end1Minutes = parseTime(end1);
  const start2Minutes = parseTime(start2);
  const end2Minutes = parseTime(end2);
  
  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
};

// Pre-save middleware for validation
BookingSchema.pre('save', function(next) {
  // Validate time slot
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const startMinutes = parseTime(this.entryTime);
  const endMinutes = parseTime(this.exitTime);
  
  if (endMinutes <= startMinutes) {
    return next(new Error('End time must be after start time'));
  }
  
  // Validate date is not in the past (allow today)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day
  
  const bookingDate = new Date(this.date);
  bookingDate.setHours(0, 0, 0, 0); // Set to start of day
  
  console.log("📅 Date validation:", {
    bookingDate: bookingDate,
    today: today,
    bookingDateISO: bookingDate.toISOString(),
    todayISO: today.toISOString(),
    isPast: bookingDate < today
  });
  
  if (bookingDate < today) {
    console.log("❌ Date validation failed: booking date is in the past");
    return next(new Error('Cannot book seats for past dates'));
  }
  
  console.log("✅ Date validation passed");
  next();
});

// Use your existing collection name
const Booking = mongoose.model("seatingslots", BookingSchema);

// Only ONE default export
export default Booking;
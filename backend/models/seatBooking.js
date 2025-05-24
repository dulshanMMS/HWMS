import mongoose from "mongoose";

// Define schema for a chair booking
const ChairSchema = new mongoose.Schema({
  memberName: { type: String, required: true },
  teamColor: { type: String, required: true },
}, { timestamps: true }); // Fix timestamps option

// Define schema for booking
const BookingSchema = new mongoose.Schema({
  areaId: { type: String, required: true },
  teamName: { type: String, default: null },
  floor: { type: Number, required: true },
  date: { type: Date, required: true },
  entryTime: { type: String, required: true },
  exitTime: { type: String, required: true },
  chairs: { type: Map, of: ChairSchema, default: new Map() }
}, { timestamps: true }); // Optionally add timestamps for BookingSchema

// Create a model for the schema
const Booking = mongoose.model("seatingSlots", BookingSchema);


export default Booking;
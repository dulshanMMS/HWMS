import mongoose from "mongoose";

// Define schema for booking
const BookingSchema = new mongoose.Schema({
  areaId: { type: String, required: true },  // Room ID (e.g., "T1")
  teamName: { type: String, default: null },
  teamColor: { type: String, default: null },
  chairs: { type: Map, of: String },  // chairId -> userName (e.g., "room1-chair1": "John")
});

// Create a model for the schema
const Booking = mongoose.model("Booking", BookingSchema);

export default Booking;

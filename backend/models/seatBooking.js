import mongoose from "mongoose";

// Define schema for a chair booking
const ChairSchema = new mongoose.Schema({
  memberName: { type: String, required: true },
  teamColor: { type: String, required: true }
});

// Define schema for booking
const BookingSchema = new mongoose.Schema({
  areaId: { type: String, required: true }, // Room ID (e.g., "T1")
  teamName: { type: String, default: null },
  chairs: { type: Map, of: ChairSchema } // chairId -> { memberName, teamColor }
});

// Create a model for the schema
const Booking = mongoose.model("Booking", BookingSchema);

export default Booking;
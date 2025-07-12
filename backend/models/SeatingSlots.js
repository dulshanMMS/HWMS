import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userName: String,
  date: String,
  entryTime: String,
  exitTime: String
}, { _id: false });

const seatingSlotSchema = new mongoose.Schema({
  slotNumber: Number,
  floor: Number,
  bookings: [bookingSchema]
});

export default mongoose.model("SeatingSlot", seatingSlotSchema);
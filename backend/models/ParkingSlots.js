import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    userId: String,
    date: String,
    entryTime: String,
    exitTime: String,
});

const parkingSlotSchema = new mongoose.Schema({
    slotNumber: Number, // Unique slot ID
    floor: Number, // Floor number
    bookings: [bookingSchema], // Array of bookings for this slot
});

const ParkingSlot = mongoose.model("ParkingSlot", parkingSlotSchema);
export default ParkingSlot;

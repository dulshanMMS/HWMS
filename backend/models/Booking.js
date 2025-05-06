import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: String,
  slot: String,
  team: {             
    type: String,
    required: true 
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['booking', 'event'],
    default: 'booking',
  },
  floor: {
    type: String,
    required: true
  }
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;





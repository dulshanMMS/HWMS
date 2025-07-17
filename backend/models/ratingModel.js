import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingType: { type: String, enum: ['seating', 'parking'], required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  feedback: { type: String, default: '' },
  comments: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Rating = mongoose.model('Rating', RatingSchema);
export default Rating;
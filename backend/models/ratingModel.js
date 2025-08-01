// import mongoose from 'mongoose';

// const RatingSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   bookingType: { type: String, enum: ['seating', 'parking'], required: true },
//   rating: { type: Number, min: 1, max: 5, required: true },
//   feedback: { type: String, required: true }, // Make feedback required
//   createdAt: { type: Date, default: Date.now }
// });

// const Rating = mongoose.model('Rating', RatingSchema);
// export default Rating;

import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingType: { type: String, enum: ['seating', 'parking'], required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  feedback: { type: String, default: '' }, // Feedback is optional
  status: { type: String, enum: ['New', 'Reviewed', 'Responded', 'Flagged', 'Archived'], default: 'New' },
  adminReply: { type: String, default: '' }, // Admin response to feedback
  tags: [{ type: String }], // Tags for categorization (e.g., 'Bug', 'Feature Request')
  createdAt: { type: Date, default: Date.now }
});

const Rating = mongoose.model('Rating', RatingSchema);
export default Rating;


import Rating from '../models/ratingModel.js';
import mongoose from 'mongoose';

export const submitRating = async (req, res) => {
  try {
    const { userId, bookingType, rating, feedback = '' } = req.body;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid userId format:', userId);
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    // Validate required fields
    if (!userId || !bookingType || !rating) {
      console.error('Missing required fields:', { userId, bookingType, rating });
      return res.status(400).json({ error: 'userId, bookingType, and rating are required' });
    }

    // Validate bookingType
    if (!['seating', 'parking'].includes(bookingType)) {
      console.error('Invalid bookingType:', bookingType);
      return res.status(400).json({ error: 'bookingType must be "seating" or "parking"' });
    }

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      console.error('Invalid rating:', rating);
      return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
    }

    const newRating = new Rating({ userId, bookingType, rating, feedback });
    await newRating.save();
    res.status(201).json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Error submitting rating:', error.message, error.stack);
    res.status(500).json({ error: `Failed to submit rating: ${error.message}` });
  }
};
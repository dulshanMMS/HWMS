import Rating from '../models/ratingModel.js';

   export const submitRating = async (req, res) => {
     try {
       const { userId, bookingType, rating, feedback, comments } = req.body;
       if (!userId || !bookingType || !rating) {
         return res.status(400).json({ error: 'userId, bookingType, and rating are required' });
       }
       const newRating = new Rating({ userId, bookingType, rating, feedback, comments });
       await newRating.save();
       res.status(201).json({ message: 'Rating submitted successfully' });
     } catch (error) {
       res.status(500).json({ error: 'Failed to submit rating' });
     }
   };
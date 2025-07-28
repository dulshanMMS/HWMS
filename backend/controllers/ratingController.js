import Rating from '../models/ratingModel.js';
import mongoose from 'mongoose';
import * as NotificationService from '../services/notificationService.js';

export const submitRating = async (req, res) => {
  try {
    const { userId, bookingType, rating, feedback = '' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid userId format:', userId);
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    if (!userId || !bookingType || !rating) {
      console.error('Missing required fields:', { userId, bookingType, rating });
      return res.status(400).json({ error: 'userId, bookingType, and rating are required' });
    }

    if (!['seating', 'parking'].includes(bookingType)) {
      console.error('Invalid bookingType:', bookingType);
      return res.status(400).json({ error: 'bookingType must be "seating" or "parking"' });
    }

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

export const getAllFeedback = async (req, res) => {
  try {
    const { startDate, endDate, rating, status } = req.query;
    const query = { status: { $in: ['New', 'Responded'] } };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (rating) query.rating = Number(rating);
    if (status) query.status = status;

    const feedbacks = await Rating.find(query)
      .populate('userId', 'fullName username')
      .sort({ createdAt: -1 });

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateFeedbackStatus = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
      console.error('Invalid feedbackId format:', feedbackId);
      return res.status(400).json({ error: 'Invalid feedbackId format' });
    }

    if (!['New', 'Reviewed', 'Responded', 'Flagged', 'Archived'].includes(status)) {
      console.error('Invalid status:', status);
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const feedback = await Rating.findByIdAndUpdate(
      feedbackId,
      { status },
      { new: true }
    );

    if (!feedback) {
      console.error('Feedback not found:', feedbackId);
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.status(200).json({ message: 'Feedback status updated successfully', feedback });
  } catch (error) {
    console.error('Error updating feedback status:', error.message, error.stack);
    res.status(500).json({ error: `Failed to update feedback status: ${error.message}` });
  }
};

export const addFeedbackReply = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { adminReply } = req.body;

    if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
      console.error('Invalid feedbackId format:', feedbackId);
      return res.status(400).json({ error: 'Invalid feedbackId format' });
    }

    if (!adminReply || typeof adminReply !== 'string') {
      console.error('Invalid adminReply:', adminReply);
      return res.status(400).json({ error: 'adminReply is required and must be a string' });
    }

    const feedback = await Rating.findByIdAndUpdate(
      feedbackId,
      { adminReply, status: 'Responded' },
      { new: true }
    );

    if (!feedback) {
      console.error('Feedback not found:', feedbackId);
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Create feedback reply notification
    const notification = await NotificationService.createBookingNotifications(
      'feedback_reply',
      {
        _id: feedbackId,
        userId: feedback.userId,
        bookingType: feedback.bookingType,
        feedback: feedback.feedback,
        rating: feedback.rating
      },
      {
        adminReply,
        userName: (await mongoose.model('User').findById(feedback.userId))?.username || 'N/A'
      }
    );

    res.status(200).json({ message: 'Reply added successfully', feedback, notification });
  } catch (error) {
    console.error('Error adding feedback reply:', error.message, error.stack);
    res.status(500).json({ error: `Failed to add feedback reply: ${error.message}` });
  }
};

export const exportFeedback = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const feedbacks = await Rating.find(query)
      .populate('userId', 'username fullName team')
      .sort({ createdAt: -1 });

    const csvData = [
      ['User ID', 'Username', 'Full Name', 'Team', 'Booking Type', 'Rating', 'Feedback', 'Status', 'Admin Reply', 'Created At'],
      ...feedbacks.map(f => [
        f.userId?._id || 'N/A',
        f.userId?.username || 'N/A',
        f.userId?.fullName || 'N/A',
        f.userId?.team || 'No Team',
        f.bookingType,
        f.rating,
        `"${f.feedback.replace(/"/g, '""')}"`,
        f.status,
        `"${f.adminReply.replace(/"/g, '""')}"`,
        new Date(f.createdAt).toLocaleString()
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment(`feedback_export_${new Date().toISOString().slice(0, 10)}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting feedback:', error.message, error.stack);
    res.status(500).json({ error: `Failed to export feedback: ${error.message}` });
  }
};
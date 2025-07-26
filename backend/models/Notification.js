
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: [
      'info',
      'warning',
      'success',
      'seat_booking',
      'seat_cancellation',
      'parking_booking',
      'parking_cancellation',
      'team_booking',
      'team_cancellation',
      'important',
      'admin_announcement'
    ],
    default: 'info',
    index: true
  },
  
  bookingId: {
    type: String, // Changed from ObjectId to String
    index: true,
    sparse: true,
    required: false // Explicitly allow null/undefined

  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  deleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
},
{
  timestamps: true,
  versionKey: false
});

// Add TTL index to expire notifications after 30 days (2,592,000 seconds)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
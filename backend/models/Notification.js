import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true
  },
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
      'important'
    ],
    default: 'info',
    index: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    index: true,
    sparse: true
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

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
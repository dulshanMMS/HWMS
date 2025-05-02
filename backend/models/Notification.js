// const mongoose = require('mongoose');

// const notificationSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   message: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   type: {
//     type: String,
//     enum: ['info', 'warning', 'success'],
//     default: 'info'
//   },
//   read: {
//     type: Boolean,
//     default: false
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('Notification', notificationSchema); 


import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'seat_booking', 'parking_booking', 'important'],
    default: 'info'
  },
  read: {
    type: Boolean,
    default: false
  },
  deleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
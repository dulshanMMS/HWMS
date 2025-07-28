import mongoose from 'mongoose';

// Individual message schema
const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  senderUsername: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'booking', 'file', 'system'],
    default: 'text'
  },
  // For booking-related messages
  bookingContext: {
    bookingId: String,
    bookingType: {
      type: String,
      enum: ['seat', 'parking']
    },
    bookingDate: String,
    slotInfo: String
  },
  // Message reactions
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reaction: {
      type: String,
      enum: ['👍', '👎', '❤️', '😊', '😮', '😢', '😡']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Read receipts
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Reply to message
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Conversation schema
const ConversationSchema = new mongoose.Schema({
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: String,
    firstName: String,
    lastName: String,
    profilePhoto: String,
    isOnline: {
      type: Boolean,
      default: false
    }
  }],
  conversationType: {
    type: String,
    enum: ['direct', 'group', 'team'],
    default: 'direct'
  },
  groupName: String,
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastMessage: {
    content: String,
    sender: String,
    timestamp: Date,
    messageType: String
  },
  totalMessages: {
    type: Number,
    default: 0
  },
  teamId: String,
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
}
);

ConversationSchema.methods.updateLastMessage = function (messageData) {
  this.lastMessage = {
    content: messageData.content,
    sender: messageData.senderName,
    timestamp: new Date(),
    messageType: messageData.messageType
  };
  this.totalMessages += 1;
  return this.save();
};

const Message = mongoose.model('Message', MessageSchema);
const Conversation = mongoose.model('Conversation', ConversationSchema);

export { Message, Conversation };
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { Message, Conversation } from '../models/Message.js';

// Export the Map so messageController can access it
export const messagingConnectedUsers = new Map();

export const socketController = {
  handleMessagingEvents: (socket, io) => {
    // Authentication for messaging
    socket.on('authenticateMessaging', async (token) => {
      try {
        if (!token) {
          socket.emit('messagingAuthError', 'No token provided');
          return;
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user in database
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
          socket.emit('messagingAuthError', 'User not found');
          return;
        }

        // Store user info on socket
        socket.messagingUserId = user._id.toString();
        socket.messagingUserInfo = {
          id: user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePhoto: user.profilePhoto
        };

        // Add to connected users map
        messagingConnectedUsers.set(socket.messagingUserId, {
          socketId: socket.id,
          userInfo: socket.messagingUserInfo,
          lastSeen: new Date()
        });

        // Join user-specific room
        socket.join(`messaging_user_${socket.messagingUserId}`);

        // Update online status
        await socketController.updateMessagingUserOnlineStatus(socket.messagingUserId, true, io);

        socket.emit('messagingAuthenticated', {
          success: true,
          user: socket.messagingUserInfo
        });

      } catch (error) {
        if (error.name === 'JsonWebTokenError') {
          socket.emit('messagingAuthError', 'Invalid token');
        } else if (error.name === 'TokenExpiredError') {
          socket.emit('messagingAuthError', 'Token expired');
        } else {
          socket.emit('messagingAuthError', 'Authentication failed');
        }
      }
    });

    // Join conversation room
    socket.on('joinMessagingConversation', async (conversationId) => {
      try {
        if (!socket.messagingUserId) {
          return;
        }

        const conversation = await Conversation.findById(conversationId);
        if (conversation && conversation.participants.some(p => p.userId.toString() === socket.messagingUserId)) {
          socket.join(`messaging_conversation_${conversationId}`);
        }
      } catch (error) {
        // Silent error handling
      }
    });

    // Leave conversation room
    socket.on('leaveMessagingConversation', (conversationId) => {
      socket.leave(`messaging_conversation_${conversationId}`);
    });

    // Handle typing indicators
    socket.on('messagingTyping', (data) => {
      if (!socket.messagingUserId) return;

      socket.to(`messaging_conversation_${data.conversationId}`).emit('userTypingInMessaging', {
        userId: socket.messagingUserId,
        username: socket.messagingUserInfo?.username,
        isTyping: data.isTyping,
        conversationId: data.conversationId
      });
    });

    // Handle real-time message sending
    socket.on('sendMessageViaSocket', async (messageData) => {
      try {
        if (!socket.messagingUserId) {
          socket.emit('messagingError', 'Authentication required');
          return;
        }

        const result = await socketController.handleSendMessage(
          socket.messagingUserId,
          socket.messagingUserInfo,
          messageData,
          io
        );

        if (result.success) {
          socket.emit('messageSuccessfullySent', result.message);
        } else {
          socket.emit('messagingError', result.error);
        }
      } catch (error) {
        socket.emit('messagingError', 'Failed to send message');
      }
    });

    // Handle disconnect for messaging
    socket.on('disconnect', async () => {
      if (socket.messagingUserId) {
        // Remove from connected users map
        messagingConnectedUsers.delete(socket.messagingUserId);

        // Update status in database and emit to other users
        await socketController.updateMessagingUserOnlineStatus(socket.messagingUserId, false, io);
        await socketController.updateMessagingLastSeen(socket.messagingUserId);
      }
    });
  },

  handleSendMessage: async (userId, userInfo, messageData, io) => {
    try {
      const { conversationId, content, messageType = 'text', replyTo, bookingContext } = messageData;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.some(p => p.userId.toString() === userId)) {
        return { success: false, error: 'Access denied to this conversation' };
      }

      const newMessage = new Message({
        conversationId,
        sender: userId,
        senderUsername: userInfo.username,
        senderName: `${userInfo.firstName} ${userInfo.lastName}`,
        content,
        messageType,
        replyTo,
        bookingContext
      });

      await newMessage.save();
      await newMessage.populate('sender', 'firstName lastName username profilePhoto');

      await conversation.updateLastMessage({
        content,
        senderName: `${userInfo.firstName} ${userInfo.lastName}`,
        messageType
      });

      // Broadcast to conversation room
      io.to(`messaging_conversation_${conversationId}`).emit('newMessagingMessage', {
        conversationId,
        message: newMessage
      });

      // Also broadcast to individual user rooms for unread count updates
      const participantIds = conversation.participants
        .filter(p => p.userId.toString() !== userId)
        .map(p => p.userId.toString());

      participantIds.forEach(participantId => {
        io.to(`messaging_user_${participantId}`).emit('newMessagingMessage', {
          conversationId,
          message: newMessage
        });
      });

      return { success: true, message: newMessage };
    } catch (error) {
      return { success: false, error: 'Failed to send message' };
    }
  },

  updateMessagingUserOnlineStatus: async (userId, isOnline, io) => {
    try {
      // Update the conversation participants
      await Conversation.updateMany(
        { 'participants.userId': userId },
        {
          $set: {
            'participants.$.isOnline': isOnline,
            'participants.$.lastSeen': new Date()
          }
        }
      );

      // Emit status update to all relevant conversations
      const userConversations = await Conversation.find({ 'participants.userId': userId });

      userConversations.forEach(conversation => {
        io.to(`messaging_conversation_${conversation._id}`).emit('messagingUserStatusUpdate', {
          userId,
          isOnline,
          lastSeen: new Date()
        });
      });
    } catch (error) {
      // Silent error handling
    }
  },

  updateMessagingLastSeen: async (userId) => {
    try {
      await Conversation.updateMany(
        { 'participants.userId': userId },
        { $set: { 'participants.$.lastSeen': new Date() } }
      );
    } catch (error) {
      // Silent error handling
    }
  }
};

export default socketController;
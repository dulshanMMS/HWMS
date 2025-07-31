import { Message, Conversation } from '../models/Message.js';
import User from '../models/User.js';
import { messagingConnectedUsers } from './socketController.js';

// Get all conversations for the logged-in user
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      'participants.userId': userId,
      'deletedBy': { $ne: userId }
    })
      .populate('participants.userId', 'firstName lastName username profilePhoto teamId')
      .sort({ updatedAt: -1 })
      .limit(50);

    // Get REAL online status from socket connections
    const connectedUserIds = Array.from(messagingConnectedUsers.keys());

    const formattedConversations = conversations.map(conv => {
      const otherParticipants = conv.participants.filter(
        p => p.userId._id.toString() !== userId
      );

      // Check if any other participant is actually online right now
      const isOnline = otherParticipants.some(p =>
        connectedUserIds.includes(p.userId._id.toString())
      );

      return {
        _id: conv._id,
        conversationType: conv.conversationType,
        participants: conv.participants,
        otherParticipants,
        displayName: conv.conversationType === 'group'
          ? conv.groupName
          : otherParticipants.map(p => `${p.userId.firstName} ${p.userId.lastName}`).join(', '),
        displayPhoto: conv.conversationType === 'group'
          ? conv.groupPhoto
          : otherParticipants[0]?.userId.profilePhoto,
        lastMessage: conv.lastMessage,
        totalMessages: conv.totalMessages,
        updatedAt: conv.updatedAt,
        isOnline: isOnline // Real online status from socket connections
      };
    });

    res.json({
      success: true,
      conversations: formattedConversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
};

// Get messages for a specific conversation
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.some(p => p.userId.toString() === userId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this conversation'
      });
    }

    // ✅ ADD: Get total message count for pagination info
    const totalMessages = await Message.countDocuments({
      conversationId,
      isDeleted: false
    });

    const messages = await Message.find({
      conversationId,
      isDeleted: false
    })
      .populate('sender', 'firstName lastName username profilePhoto')
      .populate('replyTo', 'content senderName createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        'readBy.userId': { $ne: userId }
      },
      {
        $addToSet: {
          readBy: {
            userId,
            readAt: new Date()
          }
        }
      }
    );

    // ✅ ADD: Enhanced pagination info
    const hasMore = skip + messages.length < totalMessages;

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first in the response
      pagination: {
        page,
        limit,
        total: totalMessages,
        hasMore,
        totalPages: Math.ceil(totalMessages / limit),
        currentCount: messages.length
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
};

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const { content, messageType = 'text', bookingContext, replyTo } = req.body;
    const userId = req.user._id.toString();
    const user = req.user;

    // Verify conversation access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    if (!conversation.participants.some(p => p.userId.toString() === userId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this conversation'
      });
    }

    // Create new message
    const newMessage = new Message({
      conversationId,
      sender: userId,
      senderUsername: user.username,
      senderName: `${user.firstName} ${user.lastName}`,
      content,
      messageType,
      bookingContext,
      replyTo
    });

    await newMessage.save();
    await conversation.updateLastMessage({
      content,
      senderName: `${user.firstName} ${user.lastName}`,
      messageType
    });

    await newMessage.populate('sender', 'firstName lastName username profilePhoto');

    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
};

// Search users for new conversations
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user.id;

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        users: []
      });
    }

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
      .select('firstName lastName username email profilePhoto teamId')
      .limit(10);

    const formattedUsers = users.map(user => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      profilePhoto: user.profilePhoto,
      displayName: `${user.firstName} ${user.lastName}`,
      teamInfo: user.teamId ? { name: user.teamId } : null
    }));

    res.json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search users'
    });
  }
};

// Create or get existing conversation
export const createOrGetConversation = async (req, res) => {
  try {
    const { participantIds, conversationType = 'direct', groupName } = req.body;
    const currentUserId = req.user.id;
    const currentUser = req.user;

    // Add current user to participants
    const allParticipantIds = [currentUserId, ...participantIds];

    // For direct conversations, check if conversation already exists
    if (conversationType === 'direct' && allParticipantIds.length === 2) {
      const existingConversation = await Conversation.findOne({
        conversationType: 'direct',
        'participants.userId': { $all: allParticipantIds },
        'participants': { $size: 2 }
      });

      if (existingConversation) {
        // If current user had deleted this conversation, restore it
        if (existingConversation.deletedBy.includes(currentUserId)) {
          existingConversation.deletedBy = existingConversation.deletedBy.filter(
            id => id.toString() !== currentUserId
          );
          await existingConversation.save();
        }

        // Format existing conversation for response with correct displayName
        const formattedExistingConversation = {
          _id: existingConversation._id,
          conversationType: existingConversation.conversationType,
          participants: existingConversation.participants,
          displayName: existingConversation.conversationType === 'group'
            ? existingConversation.groupName
            : existingConversation.participants
              .filter(p => p.userId.toString() !== currentUserId)
              .map(p => `${p.firstName} ${p.lastName}`)
              .join(', '),
          lastMessage: existingConversation.lastMessage,
          totalMessages: existingConversation.totalMessages || 0,
          updatedAt: existingConversation.updatedAt || new Date(),
          isOnline: existingConversation.participants.some(p =>
            p.userId.toString() !== currentUserId && p.isOnline
          )
        };

        return res.json({
          success: true,
          conversation: formattedExistingConversation,
          isNew: false
        });
      }
    }

    // Get participant details
    const participants = await User.find({
      _id: { $in: allParticipantIds }
    }).select('firstName lastName username profilePhoto');

    // Get real online status for participants
    const connectedUserIds = Array.from(messagingConnectedUsers.keys());

    const participantData = participants.map(user => ({
      userId: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePhoto: user.profilePhoto,
      isOnline: connectedUserIds.includes(user._id.toString()) // Real online status
    }));

    // Create new conversation
    const newConversation = new Conversation({
      participants: participantData,
      conversationType,
      groupName: conversationType === 'group' ? groupName : undefined,
      groupAdmin: conversationType === 'group' ? currentUserId : undefined
    });

    await newConversation.save();

    // Format new conversation for response with correct displayName
    const formattedNewConversation = {
      _id: newConversation._id,
      conversationType: newConversation.conversationType,
      participants: newConversation.participants,
      displayName: newConversation.conversationType === 'group'
        ? newConversation.groupName
        : newConversation.participants
          .filter(p => p.userId.toString() !== currentUserId)
          .map(p => `${p.firstName} ${p.lastName}`)
          .join(', '),
      lastMessage: newConversation.lastMessage,
      totalMessages: newConversation.totalMessages || 0,
      updatedAt: newConversation.updatedAt || new Date(),
      isOnline: newConversation.participants.some(p =>
        p.userId.toString() !== currentUserId && p.isOnline
      )
    };

    res.status(201).json({
      success: true,
      conversation: formattedNewConversation,
      isNew: true
    });


  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation'
    });
  }
};

// Add reaction to message
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reaction } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    // Remove existing reaction from this user
    message.reactions = message.reactions.filter(r => r.userId.toString() !== userId);

    // Add new reaction
    message.reactions.push({
      userId,
      reaction
    });

    await message.save();

    res.json({
      success: true,
      reactions: message.reactions
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add reaction'
    });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Can only delete your own messages'
      });
    }

    message.isDeleted = true;
    message.content = 'This message was deleted';
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete message'
    });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Step 1: Find conversations where this user is a participant
    const userConversations = await Conversation.find({
      'participants.userId': userId
    }).select('_id');

    // Step 2: If user has no conversations, they have no unread messages
    if (userConversations.length === 0) {
      return res.json({
        success: true,
        unreadCount: 0
      });
    }

    // Step 3: Count unread messages only from user's conversations
    const conversationIds = userConversations.map(conv => conv._id);

    const unreadCount = await Message.countDocuments({
      conversationId: { $in: conversationIds },    // Only from user's conversations
      sender: { $ne: userId },                     // Not sent by current user
      'readBy.userId': { $ne: userId },            // Not read by current user
      isDeleted: false                             // Not deleted messages
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count'
    });
  }
};

// Delete conversation for current user
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p.userId.toString() === userId)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Add user to deletedBy array if not already there
    if (!conversation.deletedBy.includes(userId)) {
      conversation.deletedBy.push(userId);
    }

    // If all participants have deleted, permanently delete conversation and messages
    if (conversation.deletedBy.length === conversation.participants.length) {
      await Message.deleteMany({ conversationId });
      await Conversation.findByIdAndDelete(conversationId);
    } else {
      await conversation.save();
    }

    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ success: false, error: 'Failed to delete conversation' });
  }
};
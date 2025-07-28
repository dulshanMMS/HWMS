import express from 'express';
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  searchUsers,
  createOrGetConversation,
  addReaction,
  deleteMessage,
  getUnreadCount,
  deleteConversation
} from '../controllers/messageController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/messages/conversations - Get all conversations for user
router.get('/conversations', authenticateUser, getUserConversations);

// GET /api/messages/conversations/:conversationId/messages - Get messages for a conversation
router.get('/conversations/:conversationId/messages', authenticateUser, getConversationMessages);

// POST /api/messages/conversations/:conversationId/messages - Send a message
router.post('/conversations/:conversationId/messages', authenticateUser, sendMessage);

// GET /api/messages/search/users - Search users for new conversations
router.get('/search/users', authenticateUser, searchUsers);

// POST /api/messages/conversations - Create or get existing conversation
router.post('/conversations', authenticateUser, createOrGetConversation);

// POST /api/messages/messages/:messageId/reactions - Add reaction to message
router.post('/messages/:messageId/reactions', authenticateUser, addReaction);

// DELETE /api/messages/messages/:messageId - Delete a message
router.delete('/messages/:messageId', authenticateUser, deleteMessage);

// GET /api/messages/unread-count - Get unread message count
router.get('/unread-count', authenticateUser, getUnreadCount);

// DELETE /api/messages/conversations/:conversationId - Delete a conversation
router.delete('/conversations/:conversationId', authenticateUser, deleteConversation);

export default router;
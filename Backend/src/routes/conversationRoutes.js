// Backend/src/routes/conversationRoutes.js
import express from 'express';
import { 
  getConversations, 
  createConversation, 
  getConversationById,
  deleteConversation 
} from '../controllers/conversationController.js';
import { 
  getMessages, 
  sendMessage, 
  markAsRead 
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';
import { messageValidation } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// ========================================
// CONVERSATION ROUTES
// ========================================

// @route   GET /api/conversations
// @desc    Get all conversations for authenticated user
// @access  Private
router.get('/', getConversations);

// @route   POST /api/conversations
// @desc    Create or get existing conversation
// @access  Private
router.post('/', createConversation);

// @route   GET /api/conversations/:id
// @desc    Get conversation by ID
// @access  Private
router.get('/:id', getConversationById);

// @route   DELETE /api/conversations/:id
// @desc    Delete conversation
// @access  Private
router.delete('/:id', deleteConversation);

// ========================================
// MESSAGE ROUTES (NESTED IN CONVERSATIONS)
// ========================================

// @route   GET /api/conversations/:id/messages
// @desc    Get all messages for a conversation
// @access  Private
router.get('/:id/messages', getMessages);

// @route   POST /api/conversations/:id/messages
// @desc    Send a new message to a conversation
// @access  Private
router.post('/:id/messages', messageValidation, sendMessage);

// @route   PUT /api/conversations/:id/messages/read
// @desc    Mark all messages as read in a conversation
// @access  Private
router.put('/:id/messages/read', markAsRead);

export default router;

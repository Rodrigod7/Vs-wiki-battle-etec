import express from 'express';
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

router.route('/')
  .post(messageValidation, sendMessage);

router.route('/:conversationId')
  .get(getMessages);

router.put('/:conversationId/read', markAsRead);

export default router;

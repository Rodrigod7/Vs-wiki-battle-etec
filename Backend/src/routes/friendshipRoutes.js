// Backend/src/routes/friendshipRoutes.js
import express from 'express';
import {
  sendFriendRequest,
  respondToRequest,
  getFriends,
  getPendingRequests,
  getSentRequests,
  removeFriend,
  getFriendshipStatus
} from '../controllers/friendshipController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Friend requests
router.post('/request', sendFriendRequest);
router.put('/:id/respond', respondToRequest);

// Friends list & requests
router.get('/', getFriends);
router.get('/pending', getPendingRequests);
router.get('/sent', getSentRequests);

// Status check (must be before /:id to avoid conflict)
router.get('/status/:userId', getFriendshipStatus);

// Remove friend
router.delete('/:id', removeFriend);

export default router;

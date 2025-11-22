// Backend/src/routes/userRoutes.js
import express from 'express';
import {
  getUserProfile,
  searchUsers,
  getMyProfile,
  updateMyProfile
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.get('/profile/:userId', getUserProfile);
router.get('/search', searchUsers);

// Rutas protegidas
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);

export default router;

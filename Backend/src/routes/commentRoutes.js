// Backend/src/routes/commentRoutes.js
import express from 'express';
import {
  getCharacterComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.get('/character/:characterId', getCharacterComments);

// Rutas protegidas
router.post('/', protect, createComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, toggleCommentLike);

export default router;

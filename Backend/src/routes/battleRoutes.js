// Backend/src/routes/battleRoutes.js
import express from 'express';
import {
  createBattle,
  getAllBattles,
  getBattleById,
  voteBattle,
  getMyVote,
  deleteBattle
} from '../controllers/battleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.get('/', getAllBattles);
router.get('/:id', getBattleById);

// Rutas protegidas
router.post('/', protect, createBattle);
router.post('/:id/vote', protect, voteBattle);
router.get('/:id/my-vote', protect, getMyVote);
router.delete('/:id', protect, deleteBattle);

export default router;

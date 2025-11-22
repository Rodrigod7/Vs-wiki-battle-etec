// Backend/src/routes/characterRoutes.js
import express from 'express';
import {
  createCharacter,
  getAllCharacters,
  getCharacterById,
  updateCharacter,
  deleteCharacter,
  getCharactersByCreator,
  toggleLike
} from '../controllers/characterController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateCreateCharacter, validateUpdateCharacter } from '../middleware/characterValidation.js';

const router = express.Router();

// ========================================
// RUTAS PÚBLICAS (sin autenticación)
// ========================================

// @route   GET /api/characters
// @desc    Obtener todos los personajes (con paginación y filtros)
// @access  Public
router.get('/', getAllCharacters);

// @route   GET /api/characters/creator/:creatorId
// @desc    Obtener personajes de un creador específico
// @access  Public
// IMPORTANTE: Esta ruta debe ir ANTES de /api/characters/:id
router.get('/creator/:creatorId', getCharactersByCreator);

// @route   GET /api/characters/:id
// @desc    Obtener un personaje por ID
// @access  Public
router.get('/:id', getCharacterById);

// ========================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ========================================

// @route   POST /api/characters
// @desc    Crear un nuevo personaje
// @access  Private
router.post(
  '/',
  protect,
  validateCreateCharacter,
  createCharacter
);

// @route   PUT /api/characters/:id
// @desc    Actualizar un personaje
// @access  Private (solo el creador del personaje)
router.put(
  '/:id',
  protect,
  validateUpdateCharacter,
  updateCharacter
);

// @route   DELETE /api/characters/:id
// @desc    Eliminar un personaje (soft delete)
// @access  Private (solo el creador del personaje)
router.delete(
  '/:id',
  protect,
  deleteCharacter
);

// @route   POST /api/characters/:id/like
// @desc    Dar like a un personaje
// @access  Private
router.post(
  '/:id/like',
  protect,
  toggleLike
);

export default router;

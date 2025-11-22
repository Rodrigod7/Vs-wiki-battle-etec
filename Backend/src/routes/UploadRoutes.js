// Backend/src/routes/uploadRoutes.js
import express from 'express';
import upload from '../config/MulterConfig.js';
import { 
  uploadImage, 
  deleteImage, 
  uploadMultipleImages 
} from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ========================================
// RUTAS DE SUBIDA DE IMÁGENES
// ========================================

// @route   POST /api/upload/image
// @desc    Subir una sola imagen
// @access  Private
// Query params: ?type=users o ?type=products
router.post(
  '/image',
  protect,
  upload.single('image'),
  uploadImage
);

// @route   POST /api/upload/images
// @desc    Subir múltiples imágenes (máximo 5)
// @access  Private
router.post(
  '/images',
  protect,
  upload.array('images', 5),
  uploadMultipleImages
);

// @route   DELETE /api/upload/image/:filename
// @desc    Eliminar una imagen
// @access  Private
// Query params: ?type=users o ?type=products
router.delete(
  '/image/:filename',
  protect,
  deleteImage
);

export default router;
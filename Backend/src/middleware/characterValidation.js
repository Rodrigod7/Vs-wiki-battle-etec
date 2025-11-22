// Backend/src/middleware/characterValidation.js
import { body } from 'express-validator';

// ✅ LISTA MAESTRA DE TIERS (Ordenada por poder)
const tiers = [
  'Unknown',
  'Street Level', 
  'Building Level',
  'City Level', 
  'Country Level', 
  'Continental',
  'Planet Level', 
  'Star Level', 
  'Galaxy Level', 
  'Universal', 
  'Multiversal', 
  'Hyperversal', // 🔥 NUEVO TIER AGREGADO
  'Omnipotent'
];

export const validateCreateCharacter = [
  body('name').trim().notEmpty().withMessage('Nombre requerido').isLength({ min: 2, max: 100 }),
  body('description').trim().notEmpty().withMessage('Descripción requerida').isLength({ min: 20 }),
  body('universe').trim().notEmpty().withMessage('Universo requerido'),
  
  // Validación estricta del Tier
  body('tier')
    .optional()
    .isIn(tiers)
    .withMessage(`Tier inválido. Opciones: ${tiers.join(', ')}`),

  body('image').optional().isString()
];

export const validateUpdateCharacter = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('tier').optional().isIn(tiers).withMessage('Tier no válido'),
  body('image').optional().isString()
];
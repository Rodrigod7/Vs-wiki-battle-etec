// Backend/src/middleware/characterValidation.js
import { body } from 'express-validator';

const tiers = [
  'Street Level', 'City Level', 'Country Level', 'Continental',
  'Planet Level', 'Star Level', 'Galaxy Level', 'Universal', 
  'Multiversal', 'Omnipotent', 'Unknown'
];

// Validación para crear personaje
export const validateCreateCharacter = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del personaje es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('alias')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El alias debe tener máximo 100 caracteres'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 20, max: 5000 })
    .withMessage('La descripción debe tener entre 20 y 5000 caracteres'),

  body('universe')
    .trim()
    .notEmpty()
    .withMessage('El universo es requerido')
    .isLength({ max: 100 })
    .withMessage('El universo debe tener máximo 100 caracteres'),

  body('tier')
    .optional()
    .isIn(tiers)
    .withMessage('Tier no válido'),

  body('strength')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Strength debe ser un número entre 1 y 100'),

  body('speed')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Speed debe ser un número entre 1 y 100'),

  body('durability')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Durability debe ser un número entre 1 y 100'),

  body('intelligence')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Intelligence debe ser un número entre 1 y 100'),

  body('energy')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Energy debe ser un número entre 1 y 100'),

  body('combat')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Combat debe ser un número entre 1 y 100'),

  body('abilities')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch (e) {
          throw new Error('Abilities debe ser un JSON válido o un array');
        }
      }
      if (!Array.isArray(value)) {
        throw new Error('Abilities debe ser un array');
      }
      return true;
    }),

  body('image')
    .optional()
    .isString()
    .withMessage('La imagen debe ser un texto/URL válido')
];

// Validación para actualizar personaje
export const validateUpdateCharacter = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('alias')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El alias debe tener máximo 100 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('La descripción debe tener entre 20 y 5000 caracteres'),

  body('universe')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El universo debe tener máximo 100 caracteres'),

  body('tier')
    .optional()
    .isIn(tiers)
    .withMessage('Tier no válido'),

  body('strength')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Strength debe ser un número entre 1 y 100'),

  body('speed')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Speed debe ser un número entre 1 y 100'),

  body('durability')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Durability debe ser un número entre 1 y 100'),

  body('intelligence')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Intelligence debe ser un número entre 1 y 100'),

  body('energy')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Energy debe ser un número entre 1 y 100'),

  body('combat')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Combat debe ser un número entre 1 y 100'),

  body('abilities')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch (e) {
          throw new Error('Abilities debe ser un JSON válido o un array');
        }
      }
      if (!Array.isArray(value)) {
        throw new Error('Abilities debe ser un array');
      }
      return true;
    }),

  body('image')
    .optional()
    .isString()
    .withMessage('La imagen debe ser un texto/URL válido')
];

// Backend/src/middleware/validation.js
import { body } from 'express-validator';

// Register validation (SIN campo de rol)
export const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Proporciona un email válido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/\d/)
    .withMessage('La contraseña debe contener al menos un número')
];

// Login validation
export const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Proporciona un email válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// Message validation
export const messageValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('El contenido es requerido')
    .isLength({ min: 1, max: 1000 })
    .withMessage('El mensaje debe tener entre 1 y 1000 caracteres')
];

// Backend/src/routes/authRoutes.js
import express from 'express';
import { register, login, getMe, verifyEmail } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { registerValidation, loginValidation } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/verify-email/:token', verifyEmail); // Nueva ruta pública
router.get('/me', protect, getMe);

export default router;
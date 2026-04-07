// Backend/src/routes/authRoutes.js
import express from 'express';
import { register, login, getMe, verifyEmail, verifyEmailPage, resendVerification } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { registerValidation, loginValidation } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/verify-email/:token', verifyEmail); // API JSON (frontend SPA)
router.get('/verify-email-page/:token', verifyEmailPage); // HTML page (email link — works from any device)
router.post('/resend-verification', resendVerification); // Reenviar correo
router.get('/me', protect, getMe);

export default router;
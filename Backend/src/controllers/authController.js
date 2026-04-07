// Backend/src/controllers/authController.js
import { User } from '../config/db.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import crypto from 'crypto'; // Nativo de Node
import { sendVerificationEmail } from '../utils/emailService.js'; // Importar servicio

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id || user.id,
      role: user.role,
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Register a new user
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Errores de validación', errors: errors.array() });
    }

    const { username, email, password } = req.body;

    const existingUser = await User.scope(null).findOne({ 
      where: { [Op.or]: [{ email }, { username }] }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: existingUser.email === email ? 'Email ya está registrado' : 'Nombre de usuario ya está en uso'
      });
    }

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // La contraseña se hashea automáticamente en el hook beforeCreate del modelo
    const newUser = await User.create({
      username,
      email,
      password,
      isActive: true,
      role: 'usuario',
      isVerified: false,
      verificationToken
    });

    // Enviar email
    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado. Por favor revisa tu email para verificar tu cuenta.',
      // NO enviamos token JWT aquí para obligar a verificar
    });

  } catch (error) {
    console.error('Register error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        success: false, 
        message: 'El email o nombre de usuario ya está registrado' 
      });
    }

    res.status(500).json({ success: false, message: 'Error al registrar usuario' });
  }
};

// @desc    Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.scope(null).findOne({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Cuenta desactivada' });
    }

    // VERIFICACIÓN DE EMAIL
    if (!user.isVerified) {
      return res.status(401).json({ 
        success: false, 
        message: 'Tu cuenta no ha sido verificada. Por favor revisa tu correo.' 
      });
    }

    const token = generateToken(user);

    // Omitir la contraseña en la respuesta
    const userData = user.toJSON();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: { user: userData, token }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Error durante el login' });
  }
};

// @desc    Verify Email (API — JSON response)
// @route   GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ where: { verificationToken: token } });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token inválido o expirado' });
    }

    user.isVerified = true;
    user.verificationToken = null; // Limpiar token
    await user.save();

    // Opcional: Auto-login al verificar
    const jwtToken = generateToken(user);

    // Omitir la contraseña en la respuesta
    const userData = user.toJSON();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: 'Email verificado exitosamente',
      data: { user: userData, token: jwtToken }
    });

  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ success: false, message: 'Error al verificar email' });
  }
};

// @desc    Verify Email (Page — HTML response, works from any device)
// @route   GET /api/auth/verify-email-page/:token
export const verifyEmailPage = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ where: { verificationToken: token } });

    if (!user) {
      return res.send(verificationHtml(false, 'El enlace es inválido o ya fue utilizado.'));
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    return res.send(verificationHtml(true, `¡Cuenta verificada, ${user.username}! Ya puedes iniciar sesión.`));
  } catch (error) {
    console.error('Verify page error:', error);
    return res.send(verificationHtml(false, 'Error del servidor al verificar.'));
  }
};

// Helper: genera página HTML completa para verificación (funciona en cualquier navegador/device)
const verificationHtml = (success, message) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${success ? '✅ Verificado' : '❌ Error'} — VS Wiki Battle</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0a0a1a, #1a1a2e); color: #ccd6f6; padding: 20px; }
    .card { background: rgba(15,15,30,0.9); padding: 40px; border-radius: 20px; text-align: center; max-width: 480px; width: 100%; border: 2px solid ${success ? '#64ffda' : '#ff6b6b'}; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    .icon { font-size: 4rem; margin-bottom: 15px; }
    h1 { color: ${success ? '#64ffda' : '#ff6b6b'}; margin-bottom: 15px; font-size: 1.6rem; }
    p { color: #8892b0; font-size: 1.05rem; line-height: 1.5; margin-bottom: 20px; }
    .hint { font-size: 0.9rem; color: #555; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? '✅' : '❌'}</div>
    <h1>${success ? '¡Verificación Exitosa!' : 'Error de Verificación'}</h1>
    <p>${message}</p>
    <p class="hint">${success ? 'Puedes cerrar esta pestaña y volver a la app para iniciar sesión.' : 'Intenta registrarte de nuevo o reenvía el correo de verificación desde el login.'}</p>
  </div>
</body>
</html>
`;

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email es requerido' });
    }

    const user = await User.scope(null).findOne({ where: { email } });

    if (!user) {
      // No revelar si el email existe o no
      return res.status(200).json({ success: true, message: 'Si el email está registrado, se envió un nuevo correo de verificación.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Esta cuenta ya está verificada. Puedes iniciar sesión.' });
    }

    // Generar nuevo token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    // Reenviar
    await sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({ success: true, message: 'Correo de verificación reenviado. Revisa tu bandeja de entrada.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Error al reenviar verificación' });
  }
};

// @desc    Get current user profile
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    
    const userData = user.toJSON();
    delete userData.password;
    
    res.status(200).json({ success: true, data: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener perfil' });
  }
};

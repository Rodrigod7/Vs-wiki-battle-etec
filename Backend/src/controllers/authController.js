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

    // Generar hash de la contraseña antes de guardar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isActive: true, // Aseguramos que nace activo
      role: 'usuario',
      isVerified: false, // Nace sin verificar
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

// @desc    Verify Email
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

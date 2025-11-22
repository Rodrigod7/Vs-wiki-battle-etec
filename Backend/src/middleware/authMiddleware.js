// Backend/src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { User } from '../config/db.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener el token del encabezado
      token = req.headers.authorization.split(' ')[1];

      // Si el token es literalmente la cadena "null", "undefined" o está vacío
      if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ success: false, message: 'No autorizado (Token inválido)' });
      }

      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Obtener usuario
      req.user = await User.findByPk(decoded.id);

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ success: false, message: 'Cuenta desactivada' });
      }

      next();
      
    } catch (error) {
      // Si es un error de token sucio, no mostramos el stack trace gigante
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token no válido o expirado' });
      }
      
      // Solo logueamos errores reales del servidor
      console.error('Error de autenticación:', error);
      return res.status(401).json({ success: false, message: 'Fallo en autenticación' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Acceso denegado. No hay token.' });
  }
};

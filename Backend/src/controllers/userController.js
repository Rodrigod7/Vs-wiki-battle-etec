// Backend/src/controllers/userController.js
import { User, Character } from '../config/db.js';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs'; // ✅ IMPORTANTE: Importar bcrypt

// @desc    Get user's public profile
// @route   GET /api/users/profile/:userId
// @access  Public
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: ['_id', 'username', 'avatar', 'email', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Obtener personajes del usuario
    const characters = await Character.findAll({
      where: { creatorId: userId, isActive: true },
      order: [['createdAt', 'DESC']],
      limit: 12
    });

    // Estadísticas del usuario
    const totalCharacters = await Character.count({
      where: { creatorId: userId, isActive: true }
    });

    const totalViews = await Character.sum('views', {
      where: { creatorId: userId, isActive: true }
    });

    const totalLikes = await Character.sum('likes', {
      where: { creatorId: userId, isActive: true }
    });

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
        characters: characters.map(c => c.toJSON()),
        stats: {
          totalCharacters: totalCharacters || 0,
          totalViews: totalViews || 0,
          totalLikes: totalLikes || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Error al obtener perfil' });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Se requiere un término de búsqueda' });
    }

    const users = await User.findAll({
      where: {
        username: { [Op.like]: `%${query}%` }
      },
      attributes: ['_id', 'username', 'avatar'],
      limit: 10
    });

    res.status(200).json({
      success: true,
      data: users.map(u => u.toJSON())
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ success: false, message: 'Error al buscar usuarios' });
  }
};

// @desc    Get current user info
// @route   GET /api/users/me
// @access  Private
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user._id, {
      attributes: ['_id', 'username', 'email', 'avatar', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.status(200).json({
      success: true,
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Error al obtener perfil' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
export const updateMyProfile = async (req, res) => {
  try {
    const { username, avatar, email, password } = req.body;
    const user = await User.findByPk(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (avatar) updateData.avatar = avatar;
    if (email) updateData.email = email;

    // ✅ Lógica para actualizar contraseña (hasheada)
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    await user.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado',
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar perfil' });
  }
};
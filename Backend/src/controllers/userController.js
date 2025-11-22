// Backend/src/controllers/userController.js
import { User } from '../config/db.js';
import { Op } from 'sequelize';

// @desc    Get all users
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    const limitInt = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitInt;
    
    const whereClause = { isActive: true };
    
    // Search by username or email
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit: limitInt,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    const formattedUsers = users.map(user => user.toJSON());

    res.status(200).json({
      success: true,
      data: formattedUsers,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limitInt)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener usuarios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }

    res.status(200).json({
      success: true,
      data: user.toJSON()
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req, res) => {
  try {
    const { username, email, avatar } = req.body;

    // Check if user is updating their own profile
    if (req.params.id !== (req.user._id || req.user.id).toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'No autorizado para actualizar este perfil' 
      });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: user.toJSON()
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar perfil',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private
export const deleteUser = async (req, res) => {
  try {
    // Check if user is deleting their own account
    if (req.params.id !== (req.user._id || req.user.id).toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'No autorizado para eliminar esta cuenta' 
      });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cuenta desactivada exitosamente'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar cuenta',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

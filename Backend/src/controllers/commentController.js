// Backend/src/controllers/commentController.js
import { Comment, User, Character } from '../config/db.js';
import { Op } from 'sequelize';

// @desc    Obtener comentarios de un personaje
// @route   GET /api/comments/character/:characterId
// @access  Public
export const getCharacterComments = async (req, res) => {
  try {
    const { characterId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: {
        characterId: parseInt(characterId),
        parentId: null, // Solo comentarios principales
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['_id', 'username', 'avatar']
        },
        {
          model: Comment,
          as: 'replies',
          where: { isActive: true },
          required: false,
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['_id', 'username', 'avatar']
            }
          ]
        }
      ],
      order: [
        ['createdAt', 'DESC'],
        [{ model: Comment, as: 'replies' }, 'createdAt', 'ASC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      data: comments.map(c => c.toJSON()),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalComments: count,
        hasNextPage: page < totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, message: 'Error al obtener comentarios' });
  }
};

// @desc    Crear un comentario
// @route   POST /api/comments
// @access  Private
export const createComment = async (req, res) => {
  try {
    const { characterId, content, parentId } = req.body;
    const userId = req.user._id;

    if (!characterId || !content) {
      return res.status(400).json({ success: false, message: 'Faltan datos requeridos' });
    }

    // Verificar que el personaje existe
    const character = await Character.findByPk(characterId);
    if (!character) {
      return res.status(404).json({ success: false, message: 'Personaje no encontrado' });
    }

    // Si es una respuesta, verificar que el comentario padre existe
    if (parentId) {
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment) {
        return res.status(404).json({ success: false, message: 'Comentario padre no encontrado' });
      }
    }

    const newComment = await Comment.create({
      characterId,
      userId,
      content,
      parentId: parentId || null
    });

    const commentWithAuthor = await Comment.findByPk(newComment._id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['_id', 'username', 'avatar']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Comentario creado',
      data: commentWithAuthor.toJSON()
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ success: false, message: 'Error al crear comentario' });
  }
};

// @desc    Actualizar un comentario
// @route   PUT /api/comments/:id
// @access  Private (solo el autor)
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comentario no encontrado' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    await comment.update({ content });

    const updatedComment = await Comment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['_id', 'username', 'avatar']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Comentario actualizado',
      data: updatedComment.toJSON()
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar comentario' });
  }
};

// @desc    Eliminar un comentario (soft delete)
// @route   DELETE /api/comments/:id
// @access  Private (solo el autor)
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comentario no encontrado' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    await comment.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: 'Comentario eliminado'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar comentario' });
  }
};

// @desc    Toggle like en un comentario
// @route   POST /api/comments/:id/like
// @access  Private
export const toggleCommentLike = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comentario no encontrado' });
    }

    await comment.increment('likes');

    res.status(200).json({
      success: true,
      message: 'Like registrado',
      data: { likes: comment.likes + 1 }
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ success: false, message: 'Error al dar like' });
  }
};

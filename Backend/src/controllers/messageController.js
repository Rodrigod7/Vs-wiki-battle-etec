// Backend/src/controllers/messageController.js
import { Message, Conversation, User } from '../config/db.js';
import { Op } from 'sequelize';

// @desc    Get messages for a conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
export const getMessages = async (req, res) => {
  try {
    // CAMBIO: Usar req.params.id en lugar de req.params.conversationId
    const conversationId = req.params.id;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    const limitInt = parseInt(limit);
    const offset = (parseInt(page) - 1) * limitInt;

    // 1. Verificar que la conversación existe y que el usuario es participante
    const conversation = await Conversation.findByPk(conversationId, {
      include: [{ model: User, as: 'participants', attributes: ['_id'] }]
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p._id === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }

    // 2. Obtener mensajes (paginados)
    const { count, rows: messages } = await Message.findAndCountAll({
      where: { conversationId: conversationId },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['_id', 'username', 'avatar']
      }],
      limit: limitInt,
      offset: offset,
      order: [['createdAt', 'DESC']] // Obtener los más nuevos primero
    });

    res.status(200).json({
      success: true,
      data: messages.reverse(), // Enviar en orden cronológico (viejo a nuevo)
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limitInt)
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Send a message
// @route   POST /api/conversations/:id/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    // CAMBIO: Usar req.params.id en lugar de req.body.conversationId
    const conversationId = req.params.id;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // 1. Verificar conversación y participación
    const conversation = await Conversation.findByPk(conversationId, {
      include: [{ model: User, as: 'participants', attributes: ['_id'] }]
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p._id === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this conversation'
      });
    }

    // 2. Crear el mensaje
    const newMessage = await Message.create({
      senderId: userId,
      content: content.trim(),
      conversationId: parseInt(conversationId)
    });

    // 3. Actualizar el lastMessage y updatedAt de la conversación
    await conversation.update({ 
      lastMessageId: newMessage._id,
      updatedAt: new Date()
    });

    // 4. Obtener el mensaje completo con el remitente para devolverlo
    const fullMessage = await Message.findByPk(newMessage._id, {
      include: [{
        model: User,
        as: 'sender',
        attributes: ['_id', 'username', 'avatar']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: fullMessage.toJSON()
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/conversations/:id/messages/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    // CAMBIO: Usar req.params.id en lugar de req.params.conversationId
    const conversationId = req.params.id;
    const userId = req.user._id;

    // 1. Verificar conversación y participación
    const conversation = await Conversation.findByPk(conversationId, {
      include: [{ model: User, as: 'participants', attributes: ['_id'] }]
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p._id === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // 2. Marcar mensajes como leídos
    const [updatedCount] = await Message.update(
      { isRead: true },
      {
        where: {
          conversationId: parseInt(conversationId),
          senderId: { [Op.ne]: userId }, // Mensajes de la otra persona
          isRead: false
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      data: { updatedCount }
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

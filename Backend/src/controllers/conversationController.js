// Backend/src/controllers/conversationController.js
import { Conversation, Message, User, Character } from '../config/db.js';
import { Op } from 'sequelize';

// Helper para obtener las opciones de inclusión de forma segura
const getIncludeOptions = () => [
  {
    model: User,
    as: 'participants',
    attributes: ['_id', 'username', 'avatar', 'email'],
    through: { attributes: [] }
  },
  {
    model: Message,
    as: 'lastMessage',
    include: [{ model: User, as: 'sender', attributes: ['_id', 'username', 'avatar'] }]
  },
  {
    model: Character,
    as: 'character',
    // ✅ CORREGIDO: Cambiamos 'image' por 'images' (la columna que existe en la BD)
    attributes: ['_id', 'name', 'images', 'tier'] 
  }
];

// @desc    Get user's conversations
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const userWithConversations = await User.findByPk(userId, {
      include: [{
        model: Conversation,
        as: 'conversations',
        include: getIncludeOptions()
      }]
    });

    // Si el usuario no tiene conversaciones, devolvemos array vacío
    if (!userWithConversations || !userWithConversations.conversations) {
      return res.status(200).json({ success: true, data: [], count: 0 });
    }

    const conversations = userWithConversations.conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.count({
          where: { conversationId: conv._id, senderId: { [Op.ne]: userId }, isRead: false }
        });
        
        // Al llamar toJSON(), el modelo Character procesará 'images' 
        // y creará automáticamente la propiedad 'image' para el frontend
        return { ...conv.toJSON(), unreadCount };
      })
    );

    res.status(200).json({ success: true, data: conversationsWithUnread });
  } catch (error) {
    console.error('❌ Error CRÍTICO en getConversations:', error);
    res.status(500).json({ success: false, message: 'Error al cargar conversaciones. Revisa la terminal del servidor.' });
  }
};

// @desc    Create or get existing conversation
export const createConversation = async (req, res) => {
  try {
    console.log("🚀 Iniciando createConversation...");
    
    const { participantId, characterId } = req.body;
    const userId = req.user._id;

    if (!participantId) {
      return res.status(400).json({ success: false, message: 'Falta el ID del participante' });
    }

    if (parseInt(participantId) === userId) {
      return res.status(400).json({ success: false, message: 'No puedes hablar contigo mismo' });
    }
    
    // 1. Buscar si ya existe el chat
    const userWithConversations = await User.findByPk(userId, {
      include: [{
        model: Conversation,
        as: 'conversations',
        include: [{ model: User, as: 'participants', attributes: ['_id'] }]
      }]
    });

    let existingConversation = null;
    if (userWithConversations && userWithConversations.conversations) {
      for (const conv of userWithConversations.conversations) {
        const pIds = conv.participants.map(p => p._id);
        if (pIds.includes(parseInt(participantId)) && pIds.length === 2) {
          existingConversation = conv;
          break;
        }
      }
    }

    if (existingConversation) {
      console.log("✅ Chat existente encontrado:", existingConversation._id);
      const fullConv = await Conversation.findByPk(existingConversation._id, { include: getIncludeOptions() });
      return res.status(200).json({ success: true, data: fullConv });
    }

    // 2. Crear nuevo chat
    console.log("✨ Creando nuevo chat...");
    const newConversation = await Conversation.create({
      characterId: characterId || null
    });

    // 3. Añadir participantes
    await newConversation.setParticipants([userId, participantId]);

    const fullConversation = await Conversation.findByPk(newConversation._id, { include: getIncludeOptions() });

    res.status(201).json({ success: true, message: 'Chat iniciado', data: fullConversation });

  } catch (error) {
    console.error('❌ Error CRÍTICO en createConversation:', error);
    res.status(500).json({ success: false, message: 'Error al crear el chat.', error: error.message });
  }
};

// @desc    Get conversation by ID
export const getConversationById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const conversation = await Conversation.findByPk(id, { include: getIncludeOptions() });

    if (!conversation) return res.status(404).json({ success: false, message: 'Chat no encontrado' });

    const isParticipant = conversation.participants.some(p => p._id === userId);
    if (!isParticipant) return res.status(403).json({ success: false, message: 'No autorizado' });

    const unreadCount = await Message.count({
      where: { conversationId: conversation._id, senderId: { [Op.ne]: userId }, isRead: false }
    });

    res.status(200).json({ success: true, data: { ...conversation.toJSON(), unreadCount } });
  } catch (error) {
    console.error('Error en getConversationById:', error);
    res.status(500).json({ success: false, message: 'Error al cargar el chat' });
  }
};

// @desc    Delete conversation
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const conversation = await Conversation.findByPk(id, {
      include: [{ model: User, as: 'participants', attributes: ['_id'] }]
    });

    if (!conversation) return res.status(404).json({ success: false, message: 'Chat no encontrado' });
    
    const isParticipant = conversation.participants.some(p => p._id === userId);
    if (!isParticipant) return res.status(403).json({ success: false, message: 'No autorizado' });

    await conversation.destroy();
    res.status(200).json({ success: true, message: 'Chat eliminado' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el chat' });
  }
};
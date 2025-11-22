// Backend/src/config/db.js
import { DataTypes } from 'sequelize'; // ✅ Importamos DataTypes
import sequelize from './sequelizeInstance.js';

// Importamos los modelos
import User from '../models/userModel.js';
import Character from '../models/characterModel.js';
import Conversation from '../models/conversationModel.js';
import Message from '../models/messageModel.js';

// ========================================
// 1. DEFINIR TABLA INTERMEDIA MANUALMENTE
// ========================================
// Esto es vital para evitar el error de "Unique Constraint" en SQLite
const ConversationParticipants = sequelize.define('ConversationParticipants', {
  _id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  }
  // Sequelize agregará automáticamente userId y conversationId sin restricciones raras
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['conversationId', 'userId'] // Evita duplicados de la misma persona en el mismo chat
    }
  ]
});

// ========================================
// 2. DEFINIR ASOCIACIONES
// ========================================

// --- Character y Creator (User) ---
User.hasMany(Character, {
  foreignKey: 'creatorId',
  as: 'characters',
  onDelete: 'CASCADE'
});
Character.belongsTo(User, {
  foreignKey: 'creatorId',
  as: 'creator'
});

// --- Conversaciones y Participantes (User) ---
// Usamos el modelo ConversationParticipants explícito
User.belongsToMany(Conversation, {
  through: ConversationParticipants,
  foreignKey: 'userId',
  otherKey: 'conversationId',
  as: 'conversations'
});

Conversation.belongsToMany(User, {
  through: ConversationParticipants,
  foreignKey: 'conversationId',
  otherKey: 'userId',
  as: 'participants'
});

// --- Mensajes (Sender y Conversation) ---
Message.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'sender'
});
User.hasMany(Message, {
  foreignKey: 'senderId',
  as: 'sentMessages'
});

Message.belongsTo(Conversation, {
  foreignKey: 'conversationId',
  onDelete: 'CASCADE'
});
Conversation.hasMany(Message, {
  foreignKey: 'conversationId',
  as: 'messages'
});

// --- Conversación y Character (opcional) ---
Conversation.belongsTo(Character, {
  foreignKey: 'characterId',
  as: 'character',
  onDelete: 'SET NULL',
  allowNull: true
});

// --- Conversación y Último Mensaje ---
Conversation.belongsTo(Message, {
  foreignKey: 'lastMessageId',
  as: 'lastMessage',
  onDelete: 'SET NULL',
  allowNull: true
});

// ========================================
// FUNCIÓN DE CONEXIÓN
// ========================================

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite Connection established successfully.');
    
    // Sincronizar modelos
    // Usamos alter: true para intentar ajustar, pero si falla, el usuario borrará la DB
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ All models synchronized successfully.');
    console.log('🎮 VS Wiki Battle ETEC - Database ready!');

  } catch (error) {
    console.error(`❌ Unable to connect to the database: ${error.message}`);
    process.exit(1);
  }
};

// Exportamos sequelize y todos los modelos
export { connectDB, sequelize, User, Character, Conversation, Message };

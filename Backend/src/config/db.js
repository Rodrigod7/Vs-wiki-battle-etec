// Backend/src/config/db.js
import sequelize from './sequelizeInstance.js';

// Importamos los modelos
import User from '../models/userModel.js';
import Character from '../models/characterModel.js';
import Conversation from '../models/conversationModel.js';
import Message from '../models/messageModel.js';
import ConversationParticipant from '../models/conversationParticipantModel.js';
import Comment from '../models/commentModel.js';
import Battle from '../models/battleModel.js';
import BattleVote from '../models/battleVoteModel.js';

// ========== RELACIONES DE PERSONAJES ==========
User.hasMany(Character, { foreignKey: 'creatorId', as: 'characters', onDelete: 'CASCADE' });
Character.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

// ========== RELACIONES DE COMENTARIOS ==========
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

Character.hasMany(Comment, { foreignKey: 'characterId', as: 'comments' });
Comment.belongsTo(Character, { foreignKey: 'characterId', as: 'character' });

Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });

// ========== RELACIONES DE BATALLAS ==========
User.hasMany(Battle, { foreignKey: 'creatorId', as: 'battles' });
Battle.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

Battle.belongsTo(Character, { foreignKey: 'character1Id', as: 'character1' });
Battle.belongsTo(Character, { foreignKey: 'character2Id', as: 'character2' });

// ========== RELACIONES DE VOTOS ==========
User.hasMany(BattleVote, { foreignKey: 'userId', as: 'battleVotes' });
BattleVote.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Battle.hasMany(BattleVote, { foreignKey: 'battleId', as: 'votes' });
BattleVote.belongsTo(Battle, { foreignKey: 'battleId', as: 'battle' });

// ========== RELACIONES DE CONVERSACIONES ==========
User.belongsToMany(Conversation, { through: ConversationParticipant, foreignKey: 'userId', as: 'conversations' });
Conversation.belongsToMany(User, { through: ConversationParticipant, foreignKey: 'conversationId', as: 'participants' });

Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

Conversation.belongsTo(Message, { foreignKey: 'lastMessageId', as: 'lastMessage' });
Conversation.belongsTo(Character, { foreignKey: 'characterId', as: 'character' });

// ========== FUNCIÓN DE CONEXIÓN ==========
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite Connection established successfully.');
    
    // CAMBIO IMPORTANTE: Pon esto en false para detener la sincronización forzada
    await sequelize.sync({ force: false, alter: false }); 
    
    console.log('✅ All models synchronized successfully.');
    console.log('🎮 VS Wiki Battle ETEC - Database ready!');

  } catch (error) {
    console.error(`❌ Unable to connect to the database: ${error.message}`);
    process.exit(1);
  }
};
export { sequelize, User, Character, Conversation, Message, ConversationParticipant, Comment, Battle, BattleVote };
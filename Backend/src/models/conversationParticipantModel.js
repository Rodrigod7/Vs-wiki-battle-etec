import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelizeInstance.js';

const ConversationParticipant = sequelize.define('ConversationParticipant', {
  _id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  }
  // Sequelize añade userId y conversationId automáticamente gracias a las relaciones en db.js
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['conversationId', 'userId'] // Evita duplicados de la misma persona en el mismo chat
    }
  ]
});

export default ConversationParticipant;
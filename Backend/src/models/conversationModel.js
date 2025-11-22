// Backend/src/models/conversationModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelizeInstance.js';

const Conversation = sequelize.define('Conversation', {
  _id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  // Las asociaciones 'characterId' y 'lastMessageId' se definen en db.js
  // Sequelize las añade automáticamente como columnas, pero no necesitamos declararlas aquí explícitamente
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['characterId'] // ✅ CORREGIDO: Ahora apunta a characterId
    },
    {
      fields: ['lastMessageId']
    }
  ]
});

export default Conversation;
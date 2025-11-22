// Backend/src/models/messageModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelizeInstance.js';

const Message = sequelize.define('Message', {
  _id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El contenido del mensaje no puede estar vacío'
      },
      len: {
        args: [1, 1000],
        msg: 'El mensaje debe tener entre 1 y 1000 caracteres'
      }
    }
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
  // Las asociaciones 'senderId' y 'conversationId' se definirán en db.js
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['conversationId']
    },
    {
      fields: ['senderId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// Método de instancia para formatear la respuesta
Message.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values._id || values.id;
  delete values.id;
  return values;
};

export default Message;
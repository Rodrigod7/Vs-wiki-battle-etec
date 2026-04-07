// Backend/src/models/friendshipModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelizeInstance.js';

const Friendship = sequelize.define('Friendship', {
  _id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  requesterId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'accepted', 'rejected']]
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['requesterId', 'receiverId']
    },
    {
      fields: ['receiverId', 'status']
    }
  ]
});

export default Friendship;

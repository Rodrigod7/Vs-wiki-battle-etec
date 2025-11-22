// Backend/src/models/battleVoteModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelizeInstance.js';

const BattleVote = sequelize.define('BattleVote', {
  _id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  battleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Battles',
      key: '_id'
    },
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: '_id'
    },
    onDelete: 'CASCADE'
  },
  votedCharacterId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['battleId', 'userId']
    }
  ]
});

BattleVote.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values._id || values.id;
  delete values.id;
  return values;
};

export default BattleVote;

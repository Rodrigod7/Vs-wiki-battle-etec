// Backend/src/models/battleModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelizeInstance.js';

const Battle = sequelize.define('Battle', {
  _id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  character1Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Characters',
      key: '_id'
    },
    onDelete: 'CASCADE'
  },
  character2Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Characters',
      key: '_id'
    },
    onDelete: 'CASCADE'
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: '_id'
    },
    onDelete: 'CASCADE'
  },
  // Resultado de la simulación matemática
  simulationWinnerId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  winProbabilityChar1: {
    type: DataTypes.FLOAT,
    defaultValue: 50.0
  },
  winProbabilityChar2: {
    type: DataTypes.FLOAT,
    defaultValue: 50.0
  },
  // Estadísticas de votos de la comunidad
  votesChar1: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  votesChar2: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalVotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true
});

Battle.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values._id || values.id;
  delete values.id;
  return values;
};

export default Battle;

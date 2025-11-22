// Backend/src/models/userModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelizeInstance.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  _id: { 
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'usuario',
    comment: 'Rol del usuario en la plataforma'
  },
  // ✅ CORREGIDO: Imagen por defecto
  avatar: {
    type: DataTypes.STRING,
    defaultValue: 'https://placehold.co/150'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  },
  defaultScope: {
    attributes: { exclude: ['password'] }
  }
});

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  delete values.verificationToken;
  values._id = values._id || values.id;
  delete values.id; 
  return values;
};

export default User;
// Backend/src/models/characterModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelizeInstance.js';

const Character = sequelize.define('Character', {
  _id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  alias: { type: DataTypes.STRING(100), allowNull: true },
  quote: { type: DataTypes.TEXT, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: false },
  origin: { type: DataTypes.STRING(100), allowNull: true },
  gender: { type: DataTypes.STRING(50), allowNull: true },
  classification: { type: DataTypes.STRING(100), allowNull: true },
  
  images: { type: DataTypes.TEXT, defaultValue: '[]' },
  // ⚠️ NOTA: Eliminamos la columna 'image' singular porque ya usamos 'images'

  tier: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Unknown'
  },
  
  // Stats descriptivas
  attackPotency: { type: DataTypes.TEXT },
  speed: { type: DataTypes.TEXT },
  durability: { type: DataTypes.TEXT },
  weaknesses: { type: DataTypes.TEXT },
  equipment: { type: DataTypes.TEXT },

  // Stats numéricas
  strength: { type: DataTypes.INTEGER, defaultValue: 50 },
  speed_stat: { type: DataTypes.INTEGER, defaultValue: 50 },
  durability_stat: { type: DataTypes.INTEGER, defaultValue: 50 },
  intelligence: { type: DataTypes.INTEGER, defaultValue: 50 },
  energy: { type: DataTypes.INTEGER, defaultValue: 50 },
  combat: { type: DataTypes.INTEGER, defaultValue: 50 },

  abilities: { type: DataTypes.TEXT },
  
  creatorId: { type: DataTypes.INTEGER, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  
  likes: { type: DataTypes.INTEGER, defaultValue: 0 },
  
  // ✅ ESTA ES LA COLUMNA NUEVA IMPORTANTE
  likedBy: { type: DataTypes.TEXT, defaultValue: '[]' }

}, {
  timestamps: true
});

Character.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values._id || values.id;
  delete values.id;
  
  try { values.abilities = JSON.parse(values.abilities || '[]'); } catch (e) { values.abilities = []; }
  try { values.images = JSON.parse(values.images || '[]'); } catch (e) { values.images = []; }
  try { values.likedBy = JSON.parse(values.likedBy || '[]'); } catch (e) { values.likedBy = []; }
  
  // Generamos 'image' al vuelo para que el frontend no se rompa
  values.image = (values.images && values.images.length > 0) 
    ? values.images[0].url 
    : 'https://placehold.co/400x600?text=No+Image';

  return values;
};

export default Character;
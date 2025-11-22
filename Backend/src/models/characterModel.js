// Backend/src/models/characterModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelizeInstance.js';

const Character = sequelize.define('Character', {
  _id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  
  // --- INFO BÁSICA ---
  name: { type: DataTypes.STRING(100), allowNull: false },
  alias: { type: DataTypes.STRING(100), allowNull: true }, // "El Señor del Lag"
  
  // --- LORE PROFUNDO ---
  quote: { type: DataTypes.TEXT, allowNull: true }, // "Cierren los ojos..."
  description: { type: DataTypes.TEXT, allowNull: false }, // Historia completa
  origin: { type: DataTypes.STRING(100), allowNull: true }, // "Servidor Central del Caos"
  gender: { type: DataTypes.STRING(50), allowNull: true }, // "Protocolo TCP/IP"
  classification: { type: DataTypes.STRING(100), allowNull: true }, // "Hechicero Tecnopático"
  
  // --- IMÁGENES Y VARIANTES ---
  // Guardaremos un JSON string: [{ "url": "...", "label": "Base Form" }, { "url": "...", "label": "Rage Mode" }]
  images: { 
    type: DataTypes.TEXT, 
    allowNull: false,
    defaultValue: '[]' 
  },

  // --- ESTADÍSTICAS WIKI (Texto libre para descripciones complejas) ---
  tier: { type: DataTypes.STRING(50), defaultValue: 'Unknown' }, // 2-C, 1-A, etc.
  attackPotency: { type: DataTypes.TEXT, allowNull: true }, // "Nivel Manipulación Mental..."
  speed: { type: DataTypes.TEXT, allowNull: true }, // "Omnipresente en la red local"
  durability: { type: DataTypes.TEXT, allowNull: true }, // "Intangible / Firewall Nivel 7"
  weaknesses: { type: DataTypes.TEXT, allowNull: true }, // "El Timbre de Salida"
  equipment: { type: DataTypes.TEXT, allowNull: true }, // "Puntero Láser, Cable Ethernet"

  // --- ESTADÍSTICAS NUMÉRICAS (Para el gráfico de barras) ---
  strength: { type: DataTypes.INTEGER, defaultValue: 50 },
  speed_stat: { type: DataTypes.INTEGER, defaultValue: 50 }, // Renombrado para no chocar con el texto
  durability_stat: { type: DataTypes.INTEGER, defaultValue: 50 },
  intelligence: { type: DataTypes.INTEGER, defaultValue: 50 },
  energy: { type: DataTypes.INTEGER, defaultValue: 50 },
  combat: { type: DataTypes.INTEGER, defaultValue: 50 },

  abilities: { type: DataTypes.TEXT, allowNull: true }, // JSON Array de strings
  
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: '_id' },
    onDelete: 'CASCADE'
  },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  timestamps: true
});

// Helper para calcular poder numérico
Character.prototype.calculatePowerLevel = function () {
  return Math.round((this.strength + this.speed_stat + this.durability_stat + this.intelligence + this.energy + this.combat) / 6);
};

Character.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values._id || values.id;
  delete values.id;
  values.powerLevel = this.calculatePowerLevel();
  
  // Parsear JSONs
  try { values.abilities = JSON.parse(values.abilities || '[]'); } catch (e) { values.abilities = []; }
  try { values.images = JSON.parse(values.images || '[]'); } catch (e) { values.images = []; }
  
  // Compatibilidad con frontend viejo (usa la primera imagen como principal)
  values.image = values.images.length > 0 ? values.images[0].url : 'https://placehold.co/400x600';

  return values;
};

export default Character;
// Backend/src/config/sequelizeInstance.js
import { Sequelize } from 'sequelize';

// Configurar Sequelize para usar SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // El archivo donde se guardará la base de datos
  logging: false, // Desactivar logs SQL en consola
});

export default sequelize;

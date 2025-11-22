// Backend/src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { connectDB } from './config/db.js';

// Importar Rutas
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import characterRoutes from './routes/characterRoutes.js';
import uploadRoutes from './routes/UploadRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: '*', // Permitir acceso desde cualquier lugar (necesario para Ngrok y celular)
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Servir imágenes subidas (API)
// ✅ CORREGIDO: Usamos '../uploads' porque estamos en 'src', así bajamos un nivel a 'Backend/uploads'
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 2. Servir archivos estáticos del Frontend (React Build)
// Estamos en 'Backend/src', bajamos dos niveles (../../) para llegar a la raíz y entrar a frontend
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// 3. Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/conversations', conversationRoutes);

// 4. CUALQUIER otra ruta que no sea API, envía el index.html de React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server & App running on port ${PORT}`);
      console.log(`🔗 Local Link: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

startServer();
// Backend/src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';

// Importar Rutas
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import characterRoutes from './routes/characterRoutes.js';
import uploadRoutes from './routes/UploadRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import battleRoutes from './routes/battleRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

// ========== CONFIGURACIÓN DE SOCKET.IO ==========
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Almacenar usuarios conectados
const connectedUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log(`✅ Usuario conectado: ${socket.id}`);

  // Registro de usuario
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`👤 Usuario ${userId} registrado con socket ${socket.id}`);
  });

  // Unirse a una conversación
  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation-${conversationId}`);
    console.log(`💬 Usuario se unió a conversación ${conversationId}`);
  });

  // Enviar mensaje en tiempo real
  socket.on('send-message', (data) => {
    const { conversationId, message } = data;
    // Emitir a todos los usuarios en esa conversación excepto el emisor
    socket.to(`conversation-${conversationId}`).emit('new-message', message);
    console.log(`📨 Mensaje enviado a conversación ${conversationId}`);
  });

  // Notificación de escritura (typing)
  socket.on('typing', (data) => {
    const { conversationId, username } = data;
    socket.to(`conversation-${conversationId}`).emit('user-typing', { username });
  });

  socket.on('stop-typing', (conversationId) => {
    socket.to(`conversation-${conversationId}`).emit('user-stopped-typing');
  });

  // Desconexión
  socket.on('disconnect', () => {
    // Eliminar del mapa de usuarios conectados
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`❌ Usuario ${userId} desconectado`);
        break;
      }
    }
  });
});

// Hacer io accesible en toda la app
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// ========== MIDDLEWARE ==========
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Servir archivos estáticos del Frontend
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// ========== RUTAS DE LA API ==========
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/battles', battleRoutes);

// Cualquier otra ruta envía el index.html de React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

app.use(errorHandler);

// ========== INICIAR SERVIDOR ==========
const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server & App running on port ${PORT}`);
      console.log(`🔗 Local Link: http://localhost:${PORT}`);
      console.log(`⚡ WebSocket Server Ready`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

startServer();
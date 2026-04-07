// Backend/src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { initializeSocket, getConnectedUsers } from './socket/socketHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import characterRoutes from './routes/characterRoutes.js';
import uploadRoutes from './routes/UploadRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import battleRoutes from './routes/battleRoutes.js';
import friendshipRoutes from './routes/friendshipRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

// ========== SOCKET.IO ==========
const io = new Server(httpServer, {
  cors: { origin: true, methods: ['GET', 'POST'], credentials: true }
});

initializeSocket(io);

app.set('io', io);
app.set('connectedUsers', getConnectedUsers());

// ========== MIDDLEWARE ==========
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// ========== API ROUTES ==========
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/friends', friendshipRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

app.use(errorHandler);

// ========== START ==========
const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`⚡ WebSocket ready`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

startServer();
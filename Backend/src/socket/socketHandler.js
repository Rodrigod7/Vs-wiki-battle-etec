// Backend/src/socket/socketHandler.js
const connectedUsers = new Map(); // userId -> socketId

export const getConnectedUsers = () => connectedUsers;

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // --- Auth: Register user ---
    socket.on('register', (userId) => {
      connectedUsers.set(userId, socket.id);

      // Broadcast online status to all
      io.emit('user-connected', userId);
      io.emit('users-online', Array.from(connectedUsers.keys()));
    });

    // --- Chat: Join/Leave rooms ---
    socket.on('join-conversation', (conversationId) => {
      socket.join(`conversation-${conversationId}`);
    });

    socket.on('leave-conversation', (conversationId) => {
      socket.leave(`conversation-${conversationId}`);
    });

    // --- Chat: Messages ---
    socket.on('send-message', (data) => {
      const { conversationId, message } = data;
      // Broadcast to everyone in the room EXCEPT sender
      socket.to(`conversation-${conversationId}`).emit('new-message', message);

      // Also notify all participants who aren't in the room (for notification bell)
      if (message.sender) {
        io.emit('notification-new-message', {
          conversationId,
          message,
        });
      }
    });

    // --- Chat: Typing indicators ---
    socket.on('typing', (data) => {
      const { conversationId, userId, username } = data;
      socket.to(`conversation-${conversationId}`).emit('user-typing', { userId, username });
    });

    socket.on('stop-typing', (data) => {
      const { conversationId, userId } = data;
      socket.to(`conversation-${conversationId}`).emit('user-stopped-typing', { userId });
    });

    // --- Disconnect ---
    socket.on('disconnect', () => {
      let disconnectedUserId = null;
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          connectedUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        io.emit('user-disconnected', disconnectedUserId);
        io.emit('users-online', Array.from(connectedUsers.keys()));
      }
    });
  });
};

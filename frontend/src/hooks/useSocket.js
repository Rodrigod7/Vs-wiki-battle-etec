// frontend/src/hooks/useSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Usamos window.location.origin para que funcione tanto en localhost como en ngrok
    const socketUrl = window.location.origin.replace('3000', '4000'); 
    
    // ✅ CORREGIDO: Ahora sí pasamos socketUrl a la función io
    socketRef.current = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Conectado a Socket.IO');
      setIsConnected(true);
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Decodificar el payload del token
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          // Buscamos 'id' O '_id' para asegurar que lo encuentre
          const userId = payload.id || payload._id;
          
          console.log("Registrando socket para usuario:", userId);
          socketRef.current.emit('register', userId);
        } catch (error) {
          console.error('Error al registrar usuario en socket:', error);
        }
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Desconectado de Socket.IO');
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinConversation = useCallback((conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('join-conversation', conversationId);
    }
  }, []);

  const sendMessage = useCallback((conversationId, message) => {
    if (socketRef.current) {
      socketRef.current.emit('send-message', { conversationId, message });
    }
  }, []);

  const onNewMessage = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('new-message', callback);
    }
  }, []);

  const offNewMessage = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('new-message');
    }
  }, []);

  const sendTyping = useCallback((conversationId, username) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { conversationId, username });
    }
  }, []);

  const sendStopTyping = useCallback((conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('stop-typing', conversationId);
    }
  }, []);

  const onUserTyping = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('user-typing', callback);
    }
  }, []);

  const onUserStoppedTyping = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('user-stopped-typing', callback);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    joinConversation,
    sendMessage,
    onNewMessage,
    offNewMessage,
    sendTyping,
    sendStopTyping,
    onUserTyping,
    onUserStoppedTyping
  };
};
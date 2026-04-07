// src/context/SocketContext.js — Single global Socket.IO connection
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Connect/disconnect based on auth state
  useEffect(() => {
    if (!isLoggedIn || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = process.env.REACT_APP_SOCKET_URL || window.location.origin.replace('3000', '4000');

    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      auth: { userId: user._id },
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      socketRef.current.emit('register', user._id);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('users-online', (userIds) => {
      setOnlineUsers(new Set(userIds));
    });

    socketRef.current.on('user-connected', (userId) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    socketRef.current.on('user-disconnected', (userId) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isLoggedIn, user]);

  // --- Chat actions ---
  const joinConversation = useCallback((conversationId) => {
    socketRef.current?.emit('join-conversation', conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    socketRef.current?.emit('leave-conversation', conversationId);
  }, []);

  const sendMessage = useCallback((conversationId, message) => {
    socketRef.current?.emit('send-message', { conversationId, message });
  }, []);

  const sendTyping = useCallback((conversationId) => {
    socketRef.current?.emit('typing', { conversationId, userId: user?._id, username: user?.username });
  }, [user]);

  const sendStopTyping = useCallback((conversationId) => {
    socketRef.current?.emit('stop-typing', { conversationId, userId: user?._id });
  }, [user]);

  // --- Listeners (subscribe/unsubscribe pattern) ---
  const on = useCallback((event, callback) => {
    socketRef.current?.on(event, callback);
  }, []);

  const off = useCallback((event, callback) => {
    socketRef.current?.off(event, callback);
  }, []);

  const isUserOnline = useCallback((userId) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  const value = {
    isConnected,
    onlineUsers,
    isUserOnline,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
    sendStopTyping,
    on,
    off,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

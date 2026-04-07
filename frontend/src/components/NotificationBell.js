// src/components/NotificationBell.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import './NotificationBell.css';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { on, off } = useSocket();

  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.data) {
        const totalUnread = data.data.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error("Error obteniendo notificaciones", error);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    // Real-time: refresh count when a new message arrives globally
    const handleNotification = () => {
      fetchUnreadCount();
    };

    on('notification-new-message', handleNotification);

    // Also listen for the window event dispatched by ChatWindow on read
    const handleMessagesRead = () => {
      fetchUnreadCount();
    };
    window.addEventListener('messagesRead', handleMessagesRead);

    // Fallback polling every 30s (much less frequent now)
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      off('notification-new-message', handleNotification);
      window.removeEventListener('messagesRead', handleMessagesRead);
      clearInterval(interval);
    };
  }, [fetchUnreadCount, on, off]);

  return (
    <div 
      className="notification-bell-container" 
      onClick={() => navigate('/messages')}
      title="Ver Mensajes"
    >
      <span className="bell-icon">🔔</span>
      
      {unreadCount > 0 && (
        <span className="notification-badge">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;
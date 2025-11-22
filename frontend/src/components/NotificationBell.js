// src/components/NotificationBell.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotificationBell.css';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // ✅ Usamos useCallback para poder reusar la función
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
    
    const interval = setInterval(fetchUnreadCount, 10000);

    // ✅ Escuchar evento de mensajes leídos (desde ChatWindow)
    const handleMessagesRead = () => {
        fetchUnreadCount();
    };
    window.addEventListener('messagesRead', handleMessagesRead);

    return () => {
        clearInterval(interval);
        window.removeEventListener('messagesRead', handleMessagesRead);
    };
  }, [fetchUnreadCount]);

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
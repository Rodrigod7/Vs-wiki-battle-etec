// src/components/NotificationBell.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotificationBell.css';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Usamos la misma API de conversaciones que ya trae el conteo de no leídos
      const res = await fetch('/api/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.data) {
        // Sumamos el 'unreadCount' de todas las conversaciones
        const totalUnread = data.data.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error("Error obteniendo notificaciones", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Polling: Revisar cada 10 segundos
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

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
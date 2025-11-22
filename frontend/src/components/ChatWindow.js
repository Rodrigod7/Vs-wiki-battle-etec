// src/components/ChatWindow.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import Spinner from './Spinner';
import './Messaging.css';

const ChatWindow = ({ conversationId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // ✅ CORREGIDO: Eliminado PORT para usar rutas relativas
  
  const initialLoadRef = useRef(true); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markMessagesAsRead = useCallback(async () => {
    if (!conversationId) return;
    const token = localStorage.getItem('token');
    try {
      // ✅ CORREGIDO: Ruta relativa /api
      await fetch(`/api/conversations/${conversationId}/messages/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [conversationId]);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    
    if (initialLoadRef.current) {
      setLoading(true);
    }
    
    const token = localStorage.getItem('token');
    
    try {
      if (initialLoadRef.current) {
        // ✅ CORREGIDO: Ruta relativa /api
        const convRes = await fetch(`/api/conversations/${conversationId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const convData = await convRes.json();
        if (convRes.ok) {
          setConversation(convData.data);
        } else {
          throw new Error(convData.message || 'Error al cargar conversación');
        }
      }

      // ✅ CORREGIDO: Ruta relativa /api
      const msgRes = await fetch(`/api/conversations/${conversationId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const msgData = await msgRes.json();
      if (msgRes.ok) {
        setMessages(prevMessages => {
          if (JSON.stringify(prevMessages) !== JSON.stringify(msgData.data)) {
            return msgData.data;
          }
          return prevMessages;
        });
      } else {
        throw new Error(msgData.message || 'Error al cargar mensajes');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      if (initialLoadRef.current) {
        setLoading(false);
        initialLoadRef.current = false;
      }
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    initialLoadRef.current = true;
    fetchMessages(); 
    markMessagesAsRead();
    const intervalId = setInterval(fetchMessages, 5000);
    return () => clearInterval(intervalId);
  }, [conversationId, fetchMessages, markMessagesAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token = localStorage.getItem('token');
    try {
      // ✅ CORREGIDO: Ruta relativa /api
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newMessage })
      });

      const data = await res.json();

      if (res.ok) {
        setMessages(prevMessages => [...prevMessages, data.data]);
        setNewMessage('');
        scrollToBottom();
        setTimeout(() => markMessagesAsRead(), 500);
      } else {
        throw new Error(data.message || 'Error al enviar mensaje');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!conversationId) {
    return <div className="chat-placeholder">Selecciona una conversación para empezar a chatear.</div>;
  }

  if (loading && !conversation) {
    return <div className="chat-placeholder"><Spinner size="large" message="Cargando chat..." /></div>;
  }

  const otherParticipant = conversation?.participants?.find(p => p._id !== user._id);
  const headerTitle = otherParticipant ? otherParticipant.username : 'Chat';
  // ✅ CORREGIDO: Imagen de respaldo con placehold.co
  const headerAvatar = otherParticipant ? otherParticipant.avatar : 'https://placehold.co/50';

  return (
    <div className="chat-window-col">
      <div className="chat-window-header">
        <img 
          src={headerAvatar} 
          alt="avatar" 
          className="conversation-avatar"
          onError={(e) => e.target.src = 'https://placehold.co/50'} 
        />
        <h4>{headerTitle}</h4>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message ${msg.sender._id === user._id ? 'message-sent' : 'message-received'}`}
          >
            <div className="message-content">
              {msg.content}
            </div>
            <small className="message-time">
              {new Date(msg.createdAt).toLocaleTimeString('es-AR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="chat-input"
        />
        <button type="submit" className="btn btn-send">Enviar</button>
      </form>
    </div>
  );
};

export default ChatWindow;
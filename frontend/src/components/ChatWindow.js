// src/components/ChatWindow.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket'; 
import { toast } from 'react-hot-toast';
import Spinner from './Spinner';
import './Messaging.css';

const ChatWindow = ({ conversationId, onMessagesRead }) => {
  const { user } = useAuth();
  const { joinConversation, sendMessage, onNewMessage, offNewMessage } = useSocket();
  
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper para marcar leído
  const markAsRead = useCallback(async () => {
    if (!conversationId) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/conversations/${conversationId}/messages/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (onMessagesRead) onMessagesRead(conversationId);
      window.dispatchEvent(new Event('messagesRead'));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [conversationId, onMessagesRead]);

  const fetchHistory = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const convRes = await fetch(`/api/conversations/${conversationId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      const convData = await convRes.json();
      setConversation(convData.data);

      const msgRes = await fetch(`/api/conversations/${conversationId}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      const msgData = await msgRes.json();
      if(msgData.success) {
        setMessages(msgData.data.reverse()); 
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }, [conversationId]);

  // ✅ EFECTO 1: Carga inicial (API)
  useEffect(() => {
    if (conversationId) {
      fetchHistory();
      markAsRead();
    }
  }, [conversationId, fetchHistory, markAsRead]);

  // ✅ EFECTO 2: UNIRSE A LA SALA (Socket)
  // Este efecto está AISLADO. Solo depende del ID y de la función join.
  // NO depende de mensajes ni de funciones de lectura.
  useEffect(() => {
    if (conversationId) {
      joinConversation(conversationId);
    }
  }, [conversationId, joinConversation]);

  // ✅ EFECTO 3: ESCUCHAR MENSAJES (Socket)
  useEffect(() => {
    if (!conversationId) return;

    const handleNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
      markAsRead(); // Marcamos como leído al recibirlo si tenemos el chat abierto
    };

    onNewMessage(handleNewMessage);

    return () => {
      offNewMessage();
    };
  }, [conversationId, onNewMessage, offNewMessage, markAsRead]);

  // Auto-scroll al renderizar nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage;
    setNewMessage('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      const data = await res.json();

      if (res.ok) {
        sendMessage(conversationId, data.data);
        setMessages((prev) => [...prev, data.data]);
        scrollToBottom();
      }
    } catch (error) {
      toast.error('Error al enviar');
    }
  };

  if (!conversationId) return <div className="chat-placeholder">Selecciona un chat para empezar.</div>;
  if (loading && !conversation) return <div className="chat-placeholder"><Spinner /></div>;

  const otherParticipant = conversation?.participants?.find(p => p._id !== user._id);
  
  return (
    <div className="chat-window-col">
      <div className="chat-window-header">
        <img 
            src={otherParticipant?.avatar || 'https://placehold.co/50'} 
            alt="avatar" 
            className="conversation-avatar" 
            onError={(e) => e.target.src='https://placehold.co/50'}
        />
        <h4>{otherParticipant?.username || 'Chat'}</h4>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender._id === user._id ? 'message-sent' : 'message-received'}`}>
            <div className="message-content">{msg.content}</div>
            <small className="message-time">
                {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-form">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="chat-input"
          onFocus={markAsRead}
        />
        <button type="submit" className="btn btn-send">Enviar</button>
      </form>
    </div>
  );
};

export default ChatWindow;
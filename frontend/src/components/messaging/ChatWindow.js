// src/components/messaging/ChatWindow.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-hot-toast';
import Spinner from '../Spinner';
import TypingIndicator from './TypingIndicator';
import OnlineStatus from './OnlineStatus';
import { getDefaultAvatar } from '../../utils/avatarHelper';
import '../Messaging.css';

const ChatWindow = ({ conversationId, onMessagesRead, onNewMessage }) => {
  const { user } = useAuth();
  const { joinConversation, leaveConversation, sendMessage: emitMessage, sendTyping, sendStopTyping, on, off, isUserOnline } = useSocket();

  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // --- Mark as read ---
  const markAsRead = useCallback(async () => {
    if (!conversationId) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/conversations/${conversationId}/messages/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (onMessagesRead) onMessagesRead(conversationId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [conversationId, onMessagesRead]);

  // --- Fetch history ---
  const fetchHistory = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const [convRes, msgRes] = await Promise.all([
        fetch(`/api/conversations/${conversationId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/conversations/${conversationId}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const convData = await convRes.json();
      const msgData = await msgRes.json();

      if (convData.success) setConversation(convData.data);
      if (msgData.success) setMessages(msgData.data.reverse());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Load data when conversation changes
  useEffect(() => {
    if (conversationId) {
      fetchHistory();
      markAsRead();
    }
    return () => {
      setMessages([]);
      setConversation(null);
      setTypingUser(null);
    };
  }, [conversationId, fetchHistory, markAsRead]);

  // Join/leave socket rooms
  useEffect(() => {
    if (!conversationId) return;
    joinConversation(conversationId);
    return () => leaveConversation(conversationId);
  }, [conversationId, joinConversation, leaveConversation]);

  // Listen for real-time events
  useEffect(() => {
    if (!conversationId) return;

    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
      markAsRead();
    };

    const handleTyping = ({ username, userId }) => {
      if (userId !== user?._id) {
        setTypingUser(username);
      }
    };

    const handleStopTyping = ({ userId }) => {
      if (userId !== user?._id) {
        setTypingUser(null);
      }
    };

    on('new-message', handleNewMessage);
    on('user-typing', handleTyping);
    on('user-stopped-typing', handleStopTyping);

    return () => {
      off('new-message', handleNewMessage);
      off('user-typing', handleTyping);
      off('user-stopped-typing', handleStopTyping);
    };
  }, [conversationId, on, off, markAsRead, user]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // --- Typing indicator logic ---
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTyping(conversationId);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendStopTyping(conversationId);
    }, 1500);
  };

  // --- Send message ---
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage;
    setNewMessage('');
    isTypingRef.current = false;
    clearTimeout(typingTimeoutRef.current);
    sendStopTyping(conversationId);

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

      if (res.ok && data.success) {
        emitMessage(conversationId, data.data);
        setMessages(prev => [...prev, data.data]);
        if (onNewMessage) onNewMessage(conversationId, data.data);
      }
    } catch (error) {
      toast.error('Error al enviar mensaje');
    }
  };

  // --- Render ---
  if (!conversationId) {
    return (
      <div className="chat-window-col chat-placeholder-col">
        <div className="chat-placeholder">
          <span style={{ fontSize: '3rem' }}>💬</span>
          <h3>Selecciona un chat</h3>
          <p>Elige una conversación o busca un usuario para empezar.</p>
        </div>
      </div>
    );
  }

  if (loading && !conversation) {
    return (
      <div className="chat-window-col chat-placeholder-col">
        <Spinner />
      </div>
    );
  }

  const otherParticipant = conversation?.participants?.find(p => p._id !== user._id);

  return (
    <div className="chat-window-col">
      <div className="chat-window-header">
        <div className="chat-header-avatar-wrapper">
          <img
            src={otherParticipant?.avatar || getDefaultAvatar(otherParticipant?.username, 50)}
            alt="avatar"
            className="conversation-avatar"
            onError={(e) => { e.target.src = getDefaultAvatar(otherParticipant?.username, 50); }}
          />
          {otherParticipant && (
            <OnlineStatus userId={otherParticipant._id} />
          )}
        </div>
        <div className="chat-header-info">
          <h4>{otherParticipant?.username || 'Chat'}</h4>
          {otherParticipant && (
            <span className="chat-header-status">
              {isUserOnline(otherParticipant._id) ? 'En línea' : 'Desconectado'}
            </span>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => {
          const isSent = msg.sender?._id === user._id || msg.senderId === user._id;
          return (
            <div key={msg._id || index} className={`message ${isSent ? 'message-sent' : 'message-received'}`}>
              <div className="message-content">{msg.content}</div>
              <small className="message-time">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </small>
            </div>
          );
        })}
        {typingUser && <TypingIndicator username={typingUser} />}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-form">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={handleInputChange}
          className="chat-input"
          onFocus={markAsRead}
          autoComplete="off"
        />
        <button type="submit" className="btn-send" disabled={!newMessage.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;

// src/components/ConversationList.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Messaging.css'; // Usa el CSS compartido

const ConversationList = ({ conversations, onSelectConversation, activeConversationId }) => {
  const { user } = useAuth(); // Obtener el usuario actual para filtrar

  if (!user) {
    return <div className="conversation-list">Cargando...</div>;
  }

  return (
    <div className="conversation-list">
      {conversations.length === 0 && (
        <p style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
          No tienes conversaciones.
        </p>
      )}

      {conversations.map((conv) => {
        // Encontrar al *otro* participante de la conversación
        const otherParticipant = conv.participants.find(p => p._id !== user._id);

        // Si no hay otro participante (ej. chat contigo mismo, aunque no debería pasar)
        if (!otherParticipant) return null; 

        const isActive = conv._id === activeConversationId;
        const lastMsg = conv.lastMessage;

        return (
          <div
            key={conv._id}
            className={`conversation-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectConversation(conv._id)}
          >
            <img
              src={otherParticipant.avatar || 'https://via.placeholder.com/50'}
              alt={otherParticipant.username}
              className="conversation-avatar"
            />
            <div className="conversation-info">
              <h5>{otherParticipant.username}</h5>
              <p>
                {lastMsg 
                  ? `${lastMsg.sender._id === user._id ? 'Tú: ' : ''}${lastMsg.content}`
                  : 'Inicio de la conversación'
                }
              </p>
            </div>
            {conv.unreadCount > 0 && (
              <span className="unread-badge">{conv.unreadCount}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
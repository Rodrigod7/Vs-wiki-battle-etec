// src/components/messaging/ConversationList.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import OnlineStatus from './OnlineStatus';
import { getDefaultAvatar } from '../../utils/avatarHelper';
import '../Messaging.css';

const ConversationList = ({ conversations, onSelectConversation, activeConversationId }) => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();

  if (!user) {
    return <div className="conversation-list">Cargando...</div>;
  }

  return (
    <div className="conversation-list">
      {conversations.length === 0 && (
        <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No tienes conversaciones aún. Busca un usuario para empezar.
        </p>
      )}

      {conversations.map((conv) => {
        const otherParticipant = conv.participants?.find(p => p._id !== user._id);
        if (!otherParticipant) return null;

        const isActive = conv._id === activeConversationId;
        const lastMsg = conv.lastMessage;
        const online = isUserOnline(otherParticipant._id);

        return (
          <div
            key={conv._id}
            className={`conversation-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectConversation(conv._id)}
          >
            <div className="conv-avatar-wrapper">
              <img
                src={otherParticipant.avatar || getDefaultAvatar(otherParticipant.username, 50)}
                alt={otherParticipant.username}
                className="conversation-avatar"
                onError={(e) => { e.target.src = getDefaultAvatar(otherParticipant.username, 50); }}
              />
              <OnlineStatus userId={otherParticipant._id} />
            </div>
            <div className="conversation-info">
              <div className="conv-info-top">
                <h5>{otherParticipant.username}</h5>
                {online && <span className="online-text">En línea</span>}
              </div>
              <p>
                {lastMsg
                  ? `${lastMsg.sender?._id === user._id ? 'Tú: ' : ''}${lastMsg.content}`
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

// src/pages/MessagingPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';
import Spinner from '../components/Spinner';
import { getDefaultAvatar } from '../utils/avatarHelper';
import '../components/Messaging.css';

const MessagingPage = () => {
  const { on, off } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tabs: 'chats', 'friends', 'pending'
  const [activeTab, setActiveTab] = useState('chats');

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Friends state
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  const fetchConversations = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, []);

  const fetchFriends = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/friends', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFriends(data.data);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  }, []);

  const fetchPendingRequests = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/friends/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPendingRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  }, []);

  const handleMessagesRead = useCallback((conversationId) => {
    setConversations(prev =>
      prev.map(conv =>
        conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  }, []);

  const handleNewMessage = useCallback((conversationId, message) => {
    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv._id === conversationId) {
          return { ...conv, lastMessage: message, updatedAt: new Date().toISOString() };
        }
        return conv;
      });
      return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
  }, []);

  useEffect(() => {
    const handleIncoming = () => {
      fetchConversations();
    };
    on('new-message', handleIncoming);
    return () => off('new-message', handleIncoming);
  }, [on, off, fetchConversations]);

  // Search friends (filter locally from friends list)
  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (activeTab === 'chats') {
      // Search among friends to start new chats
      if (term.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/api/users/search?query=${encodeURIComponent(term)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setSearchResults(data.data || []);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const startConversation = async (userId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ participantId: userId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSearchTerm('');
        setSearchResults([]);
        setActiveTab('chats');
        await fetchConversations();
        setActiveConversationId(data.data._id);
      } else {
        toast.error(data.message || 'No se pudo iniciar el chat');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleRespondRequest = async (requestId, action) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/friends/${requestId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message);
        fetchPendingRequests();
        if (action === 'accept') fetchFriends();
      } else {
        toast.error(data.message || 'Error');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleRemoveFriend = async (friendshipId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Amigo eliminado');
        fetchFriends();
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  useEffect(() => {
    const autoOpenId = sessionStorage.getItem('openConversationId');
    if (autoOpenId) {
      setActiveConversationId(parseInt(autoOpenId));
      sessionStorage.removeItem('openConversationId');
    }

    const initialFetch = async () => {
      setLoading(true);
      setLoadingFriends(true);
      await Promise.all([fetchConversations(), fetchFriends(), fetchPendingRequests()]);
      setLoading(false);
      setLoadingFriends(false);
    };
    initialFetch();
  }, [fetchConversations, fetchFriends, fetchPendingRequests]);

  // Filter friends by searchTerm when on friends tab
  const filteredFriends = activeTab === 'friends' && searchTerm.length >= 2
    ? friends.filter(f => f.username.toLowerCase().includes(searchTerm.toLowerCase()))
    : friends;

  return (
    <div className="messaging-container">
      <div className={`conversation-list-col ${activeConversationId ? 'hidden-mobile' : ''}`}>
        <div className="conversation-list-header">
          <h3>💬 Mensajes</h3>
        </div>

        {/* Tabs */}
        <div className="messaging-tabs">
          <button 
            className={`msg-tab ${activeTab === 'chats' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('chats'); setSearchTerm(''); setSearchResults([]); }}
          >
            💬 Chats
          </button>
          <button 
            className={`msg-tab ${activeTab === 'friends' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('friends'); setSearchTerm(''); setSearchResults([]); }}
          >
            👥 Amigos ({friends.length})
          </button>
          <button 
            className={`msg-tab ${activeTab === 'pending' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('pending'); setSearchTerm(''); setSearchResults([]); }}
          >
            🔔 Solicitudes {pendingRequests.length > 0 && <span className="pending-badge">{pendingRequests.length}</span>}
          </button>
        </div>

        {/* Search bar */}
        <div className="user-search-container">
          <input
            type="text"
            placeholder={activeTab === 'chats' ? '🔍 Buscar usuario para chatear...' : activeTab === 'friends' ? '🔍 Buscar amigo...' : '🔍 Buscar solicitud...'}
            value={searchTerm}
            onChange={handleSearch}
            className="user-search-input"
          />
        </div>

        <div className="list-content">
          {/* === CHATS TAB === */}
          {activeTab === 'chats' && (
            <>
              {searchTerm ? (
                <div className="search-results-list">
                  {isSearching && <div className="search-spinner">Buscando...</div>}
                  {!isSearching && searchResults.length === 0 && searchTerm.length >= 2 && (
                    <p className="no-results">No se encontraron usuarios.</p>
                  )}
                  {searchResults.map(u => (
                    <div key={u._id} className="search-result-item" onClick={() => startConversation(u._id)}>
                      <img
                        src={u.avatar || getDefaultAvatar(u.username, 40)}
                        alt={u.username}
                        className="search-avatar"
                        onError={(e) => { e.target.src = getDefaultAvatar(u.username, 40); }}
                      />
                      <div className="search-info">
                        <span className="search-username">{u.username}</span>
                        <span className="search-hint">Click para chatear</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : loading ? (
                <Spinner size="medium" message="Cargando..." />
              ) : (
                <ConversationList
                  conversations={conversations}
                  onSelectConversation={setActiveConversationId}
                  activeConversationId={activeConversationId}
                />
              )}
            </>
          )}

          {/* === FRIENDS TAB === */}
          {activeTab === 'friends' && (
            <div className="friends-list">
              {loadingFriends ? (
                <Spinner size="medium" message="Cargando amigos..." />
              ) : filteredFriends.length === 0 ? (
                <div className="empty-state">
                  <p>👥 {searchTerm ? 'No se encontraron amigos' : 'Aún no tienes amigos'}</p>
                  <p className="empty-hint">Busca usuarios en la pestaña de chats y agrega amigos desde sus perfiles</p>
                </div>
              ) : (
                filteredFriends.map(friend => (
                  <div key={friend._id} className="friend-item">
                    <img
                      src={friend.avatar || getDefaultAvatar(friend.username, 40)}
                      alt={friend.username}
                      className="friend-avatar"
                      onError={(e) => { e.target.src = getDefaultAvatar(friend.username, 40); }}
                    />
                    <div className="friend-info">
                      <span className="friend-username">{friend.username}</span>
                      <span className="friend-since">Amigos desde {new Date(friend.since).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="friend-actions">
                      <button 
                        className="btn-friend-chat" 
                        onClick={() => startConversation(friend._id)}
                        title="Chatear"
                      >
                        💬
                      </button>
                      <button 
                        className="btn-friend-remove" 
                        onClick={() => handleRemoveFriend(friend.friendshipId)}
                        title="Eliminar amigo"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* === PENDING TAB === */}
          {activeTab === 'pending' && (
            <div className="pending-list">
              {pendingRequests.length === 0 ? (
                <div className="empty-state">
                  <p>📭 No tienes solicitudes pendientes</p>
                </div>
              ) : (
                pendingRequests.map(req => (
                  <div key={req._id} className="pending-item">
                    <img
                      src={req.requester.avatar || getDefaultAvatar(req.requester.username, 40)}
                      alt={req.requester.username}
                      className="pending-avatar"
                      onError={(e) => { e.target.src = getDefaultAvatar(req.requester.username, 40); }}
                    />
                    <div className="pending-info">
                      <span className="pending-username">{req.requester.username}</span>
                      <span className="pending-date">{new Date(req.createdAt).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="pending-actions">
                      <button
                        className="btn-accept"
                        onClick={() => handleRespondRequest(req._id, 'accept')}
                      >
                        ✓ Aceptar
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleRespondRequest(req._id, 'reject')}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <ChatWindow
        conversationId={activeConversationId}
        onMessagesRead={handleMessagesRead}
        onNewMessage={handleNewMessage}
      />
    </div>
  );
};

export default MessagingPage;

// src/components/Messaging.js
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import Spinner from './Spinner';
import './Messaging.css';

const Messaging = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para la búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // ✅ CORREGIDO: Eliminado PORT para usar rutas relativas

  const fetchConversations = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      // ✅ CORREGIDO: Ruta relativa /api
      const res = await fetch('/api/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, []);

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const token = localStorage.getItem('token');
    try {
      // ✅ CORREGIDO: Ruta relativa /api
      const res = await fetch(`/api/users?search=${term}&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const startConversation = async (userId) => {
    const token = localStorage.getItem('token');
    try {
      // ✅ CORREGIDO: Ruta relativa /api
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
        await fetchConversations();
        setActiveConversationId(data.data._id);
      } else {
        toast.error(data.message || 'No se pudo iniciar el chat');
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
      await fetchConversations();
      setLoading(false);
    };
    
    initialFetch();

    const intervalId = setInterval(fetchConversations, 10000);
    return () => clearInterval(intervalId);
  }, [fetchConversations]);

  return (
    <div className="messaging-container">
      <div className={`conversation-list-col ${activeConversationId ? 'hidden-mobile' : ''}`}>
        <div className="conversation-list-header">
          <h3>Mensajes</h3>
        </div>
        
        <div className="user-search-container">
          <input 
            type="text"
            placeholder="🔍 Buscar usuario..."
            value={searchTerm}
            onChange={handleSearch}
            className="user-search-input"
          />
        </div>

        <div className="list-content">
          {searchTerm ? (
            <div className="search-results-list">
              {isSearching && <div className="search-spinner">Buscando...</div>}
              
              {!isSearching && searchResults.length === 0 && (
                <p className="no-results">No se encontraron usuarios.</p>
              )}

              {searchResults.map(user => (
                <div 
                  key={user._id} 
                  className="search-result-item"
                  onClick={() => startConversation(user._id)}
                >
                  {/* ✅ CORREGIDO: Imagen de respaldo con placehold.co */}
                  <img 
                    src={user.avatar || 'https://placehold.co/40'} 
                    alt={user.username} 
                    className="search-avatar"
                    onError={(e) => e.target.src = 'https://placehold.co/40'}
                  />
                  <div className="search-info">
                    <span className="search-username">{user.username}</span>
                    <span className="search-email">{user.email}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            loading ? (
              <Spinner size="medium" message="Cargando..." /> 
            ) : (
              <ConversationList
                conversations={conversations}
                onSelectConversation={setActiveConversationId}
                activeConversationId={activeConversationId}
              />
            )
          )}
        </div>
      </div>
      
      <ChatWindow conversationId={activeConversationId} />
    </div>
  );
};

export default Messaging;
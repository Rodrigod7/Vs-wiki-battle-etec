// frontend/src/components/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getDefaultAvatar } from '../utils/avatarHelper';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isLoggedIn } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState(null); // { status, friendshipId, direction }
  const [friendLoading, setFriendLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    if (isLoggedIn) fetchFriendStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isLoggedIn]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/profile/${userId}`);
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      } else {
        toast.error('Usuario no encontrado');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`/api/friends/status/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFriendStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching friendship status:', error);
    }
  };

  const handleSendFriendRequest = async () => {
    const token = localStorage.getItem('token');
    setFriendLoading(true);
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId: parseInt(userId) })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message);
        fetchFriendStatus();
      } else {
        toast.error(data.message || 'Error al enviar solicitud');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setFriendLoading(false);
    }
  };

  const handleRespondRequest = async (action) => {
    const token = localStorage.getItem('token');
    setFriendLoading(true);
    try {
      const res = await fetch(`/api/friends/${friendStatus.friendshipId}/respond`, {
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
        fetchFriendStatus();
      } else {
        toast.error(data.message || 'Error');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setFriendLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    const token = localStorage.getItem('token');
    setFriendLoading(true);
    try {
      const res = await fetch(`/api/friends/${friendStatus.friendshipId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Amigo eliminado');
        fetchFriendStatus();
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setFriendLoading(false);
    }
  };

  const handleStartChat = () => {
    navigate('/messages');
    sessionStorage.setItem('startChatWithUser', userId);
  };

  const renderFriendButton = () => {
    if (!isLoggedIn || !friendStatus || friendStatus.status === 'self') return null;

    if (friendStatus.status === 'none') {
      return (
        <button className="btn-friend-action btn-add-friend" onClick={handleSendFriendRequest} disabled={friendLoading}>
          {friendLoading ? '...' : '➕ Agregar amigo'}
        </button>
      );
    }

    if (friendStatus.status === 'pending') {
      if (friendStatus.direction === 'sent') {
        return <button className="btn-friend-action btn-pending" disabled>⏳ Solicitud enviada</button>;
      }
      // Received — show accept/reject
      return (
        <div className="friend-request-actions">
          <button className="btn-friend-action btn-accept-profile" onClick={() => handleRespondRequest('accept')} disabled={friendLoading}>
            ✓ Aceptar solicitud
          </button>
          <button className="btn-friend-action btn-reject-profile" onClick={() => handleRespondRequest('reject')} disabled={friendLoading}>
            ✕ Rechazar
          </button>
        </div>
      );
    }

    if (friendStatus.status === 'accepted') {
      return (
        <div className="friend-request-actions">
          <button className="btn-friend-action btn-chat-friend" onClick={handleStartChat}>
            💬 Enviar mensaje
          </button>
          <button className="btn-friend-action btn-remove-friend" onClick={handleRemoveFriend} disabled={friendLoading}>
            ✕ Eliminar amigo
          </button>
        </div>
      );
    }

    if (friendStatus.status === 'rejected') {
      return (
        <button className="btn-friend-action btn-add-friend" onClick={handleSendFriendRequest} disabled={friendLoading}>
          {friendLoading ? '...' : '➕ Agregar amigo'}
        </button>
      );
    }

    return null;
  };

  if (loading) {
    return <div className="loading-screen">Cargando perfil...</div>;
  }

  if (!profile) {
    return <div className="error-screen">Usuario no encontrado</div>;
  }

  const { user, characters, stats } = profile;

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar-container">
          <img
            src={user.avatar || getDefaultAvatar(user.username, 150)}
            alt={user.username}
            className="profile-avatar"
            onError={(e) => { e.target.src = getDefaultAvatar(user.username, 150); }}
          />
        </div>
        <div className="profile-info">
          <h1 className="profile-username">{user.username}</h1>
          <p className="profile-email">{user.email}</p>
          <p className="profile-joined">
            📅 Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES')}
          </p>
          {renderFriendButton()}
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-value">{stats.totalCharacters}</div>
          <div className="stat-label">Personajes Creados</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-value">{stats.totalViews}</div>
          <div className="stat-label">Vistas Totales</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❤️</div>
          <div className="stat-value">{stats.totalLikes}</div>
          <div className="stat-label">Likes Totales</div>
        </div>
      </div>

      <div className="profile-characters-section">
        <h2 className="section-title">⚔️ Personajes de {user.username}</h2>

        {characters.length === 0 ? (
          <p className="no-characters">Este usuario aún no ha creado personajes</p>
        ) : (
          <div className="characters-grid">
            {characters.map((character) => (
              <div
                key={character._id}
                className="character-card"
                onClick={() => navigate(`/character/${character._id}`)}
              >
                <div className="char-image-container">
                  <img src={character.image} alt={character.name} />
                  <div className="char-tier-badge">{character.tier}</div>
                </div>
                <div className="char-details">
                  <h3 className="char-name">{character.name}</h3>
                  {character.alias && <p className="char-alias">{character.alias}</p>}
                  <div className="char-stats-mini">
                    <span>⚡ {character.powerLevel}</span>
                    <span>👁️ {character.views}</span>
                    <span>❤️ {character.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

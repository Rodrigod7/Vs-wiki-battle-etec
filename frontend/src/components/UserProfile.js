// frontend/src/components/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

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
            src={user.avatar || 'https://via.placeholder.com/150'}
            alt={user.username}
            className="profile-avatar"
          />
        </div>
        <div className="profile-info">
          <h1 className="profile-username">{user.username}</h1>
          <p className="profile-email">{user.email}</p>
          <p className="profile-joined">
            📅 Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES')}
          </p>
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

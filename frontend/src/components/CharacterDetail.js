import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Importar Link
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getValidImageUrl } from '../utils/imageHelper';
import Comments from './Comments'; // ✅ IMPORTAR COMENTARIOS
import './CharacterDetail.css';

const CharacterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [character, setCharacter] = useState(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Usar ruta relativa para fetch
  const fetchCharacter = useCallback(async () => {
    try {
      const res = await fetch(`/api/characters/${id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCharacter(data.data);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error(error);
    }
  }, [id, navigate]);

  useEffect(() => { fetchCharacter(); }, [fetchCharacter]);

  const handleContactCreator = async () => {
      if (!isLoggedIn) return toast.error('Inicia sesión para chatear');
      if (user._id === character.creator._id) return toast.error('No puedes chatear contigo mismo');
      
      try {
          const res = await fetch('/api/conversations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
              body: JSON.stringify({ participantId: character.creator._id })
          });
          const data = await res.json();
          if(data.success) {
              sessionStorage.setItem('openConversationId', data.data._id);
              navigate('/messages');
          }
      } catch(e) { toast.error('Error al conectar'); }
  };

  if (!character) return <div className="detail-loading">Cargando...</div>;

  const currentImage = character.images && character.images.length > 0 
    ? character.images[selectedImageIdx] 
    : { url: character.image, label: 'Default' };

  return (
    <div className="character-detail-container">
      <div className="detail-header">
        <div className="detail-image-section">
          <div className="main-image-container">
            <img 
              src={getValidImageUrl(currentImage.url || currentImage)} 
              alt={character.name} 
              className="main-char-img" 
              onError={(e) => e.target.src = 'https://placehold.co/400x600?text=Error'}
            />
            {currentImage.label && <div className="variant-label">{currentImage.label}</div>}
          </div>
          {character.images && character.images.length > 1 && (
            <div className="thumbnails-row">
              {character.images.map((img, idx) => (
                <img 
                  key={idx} 
                  src={getValidImageUrl(img.url)} 
                  className={`thumb ${idx === selectedImageIdx ? 'active' : ''}`} 
                  onClick={() => setSelectedImageIdx(idx)}
                  alt="variant"
                />
              ))}
            </div>
          )}
        </div>

        <div className="detail-info-section">
          <div className="detail-title">
            <h1>{character.name}</h1>
            {character.alias && <h3 className="alias">"{character.alias}"</h3>}
          </div>
          
          {character.quote && <blockquote className="char-quote">"{character.quote}"</blockquote>}

          <div className="wiki-stats-box">
            <p><strong>Origen:</strong> {character.origin || 'Desconocido'}</p>
            <p><strong>Clasificación:</strong> {character.classification || 'N/A'}</p>
            <p><strong>Género:</strong> {character.gender || 'N/A'}</p>
            <p><strong>Tier:</strong> <span className="tier-badge">{character.tier}</span></p>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h2>📖 Resumen</h2>
        <p className="description-text">{character.description}</p>
      </div>

      <div className="detail-section">
        <h2>⚡ Estadísticas de Combate</h2>
        <div className="wiki-grid">
          <div className="wiki-item"><strong>Potencia de Ataque:</strong> {character.attackPotency}</div>
          <div className="wiki-item"><strong>Velocidad:</strong> {character.speed}</div>
          <div className="wiki-item"><strong>Durabilidad:</strong> {character.durability}</div>
          <div className="wiki-item"><strong>Debilidades:</strong> {character.weaknesses}</div>
          <div className="wiki-item"><strong>Equipo:</strong> {character.equipment}</div>
        </div>
      </div>

      {/* Creador (Con Link al Perfil) */}
      <div className="detail-section">
        <h2>👤 Creado por</h2>
        <div className="creator-card">
          <img src={character.creator?.avatar || 'https://placehold.co/50'} alt="creator" className="creator-avatar-large"/>
          <div className="creator-info">
            {/* ✅ LINK AL PERFIL PÚBLICO */}
            <h3>
                <Link to={`/profile/${character.creator?._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {character.creator?.username}
                </Link>
            </h3>
            {isLoggedIn && user?._id !== character.creator?._id && (
                <button onClick={handleContactCreator} className="btn-contact-small" style={{marginTop: '10px'}}>
                    💬 Enviar Mensaje
                </button>
            )}
          </div>
        </div>
      </div>

      {/* ✅ SECCIÓN DE COMENTARIOS */}
      <Comments characterId={id} />

      <button onClick={() => navigate('/')} className="btn-back" style={{marginTop: '20px'}}>Volver</button>
    </div>
  );
};

export default CharacterDetail;
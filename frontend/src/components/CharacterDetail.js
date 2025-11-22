// frontend/src/components/CharacterDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getValidImageUrl } from '../utils/imageHelper'; // ✅ IMPORTAR HELPER
import './CharacterDetail.css';

const CharacterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [character, setCharacter] = useState(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  const fetchCharacter = useCallback(async () => {
    try {
      // Ruta relativa
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

  if (!character) return <div className="detail-loading">Cargando...</div>;

  const currentImage = character.images && character.images.length > 0 
    ? character.images[selectedImageIdx] 
    : { url: character.image, label: 'Default' }; // Fallback a la imagen simple

  return (
    <div className="character-detail-container">
      {/* HEADER & GALERÍA */}
      <div className="detail-header">
        <div className="detail-image-section">
          <div className="main-image-container">
            {/* ✅ USAR HELPER AQUÍ */}
            <img 
              src={getValidImageUrl(currentImage.url || currentImage)} 
              alt={character.name} 
              className="main-char-img" 
              onError={(e) => e.target.src = 'https://placehold.co/400x600?text=Error'}
            />
            {currentImage.label && <div className="variant-label">{currentImage.label}</div>}
          </div>
          {/* Miniaturas */}
          {character.images && character.images.length > 1 && (
            <div className="thumbnails-row">
              {character.images.map((img, idx) => (
                <img 
                  key={idx} 
                  src={getValidImageUrl(img.url)} // ✅ USAR HELPER AQUÍ TAMBIÉN
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
          
          {character.quote && (
            <blockquote className="char-quote">
              "{character.quote}"
            </blockquote>
          )}

          <div className="wiki-stats-box">
            <p><strong>Origen:</strong> {character.origin || 'Desconocido'}</p>
            <p><strong>Clasificación:</strong> {character.classification || 'N/A'}</p>
            <p><strong>Género:</strong> {character.gender || 'N/A'}</p>
            <p><strong>Tier:</strong> <span className="tier-badge">{character.tier}</span></p>
          </div>
        </div>
      </div>

      {/* LORE */}
      <div className="detail-section">
        <h2>📖 Resumen</h2>
        <p className="description-text">{character.description}</p>
      </div>

      {/* TABLA DE PODER WIKI */}
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

      {/* PODERES LISTA */}
      <div className="detail-section">
        <h2>🔥 Poderes y Habilidades</h2>
        <div className="abilities-grid">
          {character.abilities && character.abilities.map((ab, i) => (
            <span key={i} className="ability-pill">{ab}</span>
          ))}
        </div>
      </div>

      <button onClick={() => navigate('/')} className="btn-back">Volver</button>
    </div>
  );
};

export default CharacterDetail;
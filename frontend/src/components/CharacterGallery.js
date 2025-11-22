// frontend/src/components/CharacterGallery.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getValidImageUrl } from '../utils/imageHelper'; // ✅ IMPORTAR HELPER
import './CharacterGallery.css';

const CharacterGallery = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', tier: '' });

  const tiers = [
    'Street Level', 'City Level', 'Country Level', 'Continental',
    'Planet Level', 'Star Level', 'Galaxy Level', 'Universal', 
    'Multiversal', 'Omnipotent', 'Unknown'
  ];

  const fetchCharacters = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.tier) queryParams.append('tier', filters.tier);

      // Usamos ruta relativa /api
      const res = await fetch(`/api/characters?${queryParams.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setCharacters(data.data);
      } else {
        setCharacters([]);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
      // No mostramos toast de error aquí para no spamear en móvil si falla la conexión inicial
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>🌌 Galería de Guerreros</h2>
        <p>Explora los personajes más poderosos de ETEC</p>
      </div>

      <div className="gallery-filters">
        <input
          type="text"
          name="search"
          placeholder="🔍 Buscar personaje..."
          value={filters.search}
          onChange={handleFilterChange}
          className="search-input"
        />
        <select 
          name="tier" 
          value={filters.tier} 
          onChange={handleFilterChange}
          className="tier-select"
        >
          <option value="">Todos los Niveles</option>
          {tiers.map(tier => (
            <option key={tier} value={tier}>{tier}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="gallery-loading">Cargando guerreros...</div>
      ) : (
        <div className="gallery-grid">
          {characters.length > 0 ? (
            characters.map(char => (
              <Link to={`/characters/${char._id}`} key={char._id} className="character-card">
                <div className="card-image-wrapper">
                  {/* ✅ USAR HELPER AQUÍ */}
                  <img 
                    src={getValidImageUrl(char.image)} 
                    alt={char.name} 
                    className="card-image"
                    onError={(e) => e.target.src = 'https://placehold.co/300x400?text=Error'}
                  />
                  <div className="card-tier-badge">{char.tier}</div>
                </div>
                <div className="card-content">
                  <h3>{char.name}</h3>
                  <p className="card-universe">🌐 {char.universe}</p>
                  <div className="card-stats">
                    <span>⚔️ Poder: {char.powerLevel}</span>
                    <span>❤️ {char.likes}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="no-results">No se encontraron personajes.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CharacterGallery;
// frontend/src/components/CharacterGallery-updated.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './CharacterGallery.css';

const CharacterGallery = () => {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    tier: '',
    sortBy: 'recent'
  });
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCharacters, setTotalCharacters] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchCharacters();
  }, [filters, currentPage]);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...(filters.search && { search: filters.search }),
        ...(filters.tier && { tier: filters.tier }),
        ...(filters.sortBy && { sortBy: filters.sortBy })
      });

      const response = await fetch(`/api/characters?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setCharacters(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalCharacters(data.pagination.totalCharacters);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
      toast.error('Error al cargar personajes');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`page-btn ${i === currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="page-btn page-prev"
        >
          ← Anterior
        </button>

        {startPage > 1 && (
          <>
            <button onClick={() => handlePageChange(1)} className="page-btn">
              1
            </button>
            {startPage > 2 && <span className="page-ellipsis">...</span>}
          </>
        )}

        {pages}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="page-ellipsis">...</span>}
            <button onClick={() => handlePageChange(totalPages)} className="page-btn">
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="page-btn page-next"
        >
          Siguiente →
        </button>
      </div>
    );
  };

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h1 className="gallery-title">⚔️ Galería de Personajes ⚔️</h1>
        <p className="gallery-subtitle">
          {totalCharacters} {totalCharacters === 1 ? 'personaje' : 'personajes'} en total
        </p>
      </div>

      <div className="gallery-filters">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="filter-input"
        />

        <select
          value={filters.tier}
          onChange={(e) => handleFilterChange('tier', e.target.value)}
          className="filter-select"
        >
          <option value="">Todos los Tiers</option>
          <option value="Street Level">Street Level</option>
          <option value="Building Level">Building Level</option> {/* Agregado */}
          <option value="City Level">City Level</option>
          <option value="Country Level">Country Level</option>
          <option value="Continental">Continental</option> {/* Agregado */}
          <option value="Planet Level">Planet Level</option>
          <option value="Star Level">Star Level</option> {/* Agregado */}
          <option value="Galaxy Level">Galaxy Level</option> {/* Agregado */}
          <option value="Universal">Universal</option>
          <option value="Multiversal">Multiversal</option>
          <option value="Hyperversal">Hyperversal</option> {/* Agregado */}
          <option value="Omnipotent">Omnipotent</option>
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="filter-select"
        >
          <option value="recent">Más Recientes</option>
          <option value="popular">Más Populares</option>
          <option value="name">Por Nombre</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-gallery">Cargando personajes...</div>
      ) : characters.length === 0 ? (
        <div className="no-results">
          <h2>No se encontraron personajes</h2>
          <p>Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <>
          <div className="characters-grid">
            {characters.map((character) => (
              <div
                key={character._id}
                className="character-card"
                onClick={() => navigate(`/character/${character._id}`)}
              >
                <div className="char-image-wrapper">
                  <img src={character.image} alt={character.name} />
                  <div className="char-tier-overlay">{character.tier}</div>
                </div>
                <div className="char-info-section">
                  <h3 className="char-name">{character.name}</h3>
                  {character.alias && <p className="char-alias">{character.alias}</p>}
                  <div className="char-stats-row">
                    <span className="stat-item">⚡ {character.powerLevel}</span>
                    <span className="stat-item">👁️ {character.views}</span>
                    <span className="stat-item">❤️ {character.likes}</span>
                  </div>
                  <div className="char-creator">
                    Por: {character.creator?.username || 'Anónimo'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default CharacterGallery;
// frontend/src/components/BattleGallery.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './BattleGallery.css';

const BattleGallery = () => {
  const navigate = useNavigate();
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBattles();
  }, [sortBy, currentPage]);

  const fetchBattles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/battles?page=${currentPage}&limit=12&sortBy=${sortBy}`);
      const data = await response.json();
      if (data.success) {
        setBattles(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching battles:', error);
      toast.error('Error al cargar batallas');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="battle-gallery">
      <div className="gallery-header-battles">
        <h1 className="gallery-title-battles">⚔️ GALERÍA DE BATALLAS ⚔️</h1>
        <button onClick={() => navigate('/battle/create')} className="btn-create-battle">
          + Crear Nueva Batalla
        </button>
      </div>

      <div className="battle-filters">
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setCurrentPage(1);
          }}
          className="filter-select-battles"
        >
          <option value="recent">Más Recientes</option>
          <option value="popular">Más Populares</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-battles">Cargando batallas...</div>
      ) : battles.length === 0 ? (
        <div className="no-battles">
          <h2>No hay batallas disponibles</h2>
          <p>¡Sé el primero en crear una batalla épica!</p>
          <button onClick={() => navigate('/battle/create')} className="btn-create-first">
            Crear Mi Primera Batalla
          </button>
        </div>
      ) : (
        <>
          <div className="battles-grid">
            {battles.map((battle) => (
              <div
                key={battle._id}
                className="battle-card"
                onClick={() => navigate(`/battle/${battle._id}`)}
              >
                <div className="battle-card-header">
                  <span className="battle-views">👁️ {battle.views}</span>
                  <span className="battle-votes">🗳️ {battle.totalVotes}</span>
                </div>

                <div className="battle-combatants-preview">
                  <div className="combatant-preview">
                    <img src={battle.character1.image} alt={battle.character1.name} />
                    <div className="combatant-name">{battle.character1.name}</div>
                    <div className="combatant-tier">{battle.character1.tier}</div>
                  </div>

                  <div className="vs-badge">VS</div>

                  <div className="combatant-preview">
                    <img src={battle.character2.image} alt={battle.character2.name} />
                    <div className="combatant-name">{battle.character2.name}</div>
                    <div className="combatant-tier">{battle.character2.tier}</div>
                  </div>
                </div>

                <div className="battle-card-footer">
                  <span className="battle-creator">Por: {battle.creator?.username}</span>
                  <span className="battle-date">
                    {new Date(battle.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>

                <div className="battle-winner-indicator">
                  🏆 Ganador Matemático:{' '}
                  {battle.simulationWinnerId === battle.character1._id
                    ? battle.character1.name
                    : battle.character2.name}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="page-btn"
              >
                ← Anterior
              </button>

              <span className="page-info">
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BattleGallery;

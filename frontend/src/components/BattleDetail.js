// frontend/src/components/BattleDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getValidImageUrl } from '../utils/imageHelper';
import './BattleDetail.css';

// Simple markdown renderer for **bold** and *italic*
const renderNarrativeText = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
};

const BattleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [battle, setBattle] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBattle();
    fetchMyVote();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchBattle = async () => {
    try {
      const response = await fetch(`/api/battles/${id}`);
      const data = await response.json();
      if (data.success) {
        setBattle(data.data);
      } else {
        toast.error('Batalla no encontrada');
        navigate('/battles');
      }
    } catch (error) {
      console.error('Error fetching battle:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyVote = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/battles/${id}/my-vote`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setMyVote(data.data);
      }
    } catch (error) {
      console.error('Error fetching vote:', error);
    }
  };

  const handleVote = async (characterId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Debes iniciar sesión para votar');
      return;
    }

    try {
      const response = await fetch(`/api/battles/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ votedCharacterId: characterId })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('¡Voto registrado!');
        fetchBattle();
        fetchMyVote();
      }
    } catch (error) {
      toast.error('Error al votar');
    }
  };

  const handleDeleteBattle = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta batalla?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/battles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Batalla eliminada');
        navigate('/battles');
      } else {
        toast.error(data.message || 'Error al eliminar');
      }
    } catch (error) {
      toast.error('Error al eliminar la batalla');
    }
  };

  if (loading) return <div className="loading-screen">Cargando batalla...</div>;
  if (!battle) return <div className="error-screen">Batalla no encontrada</div>;

  const char1 = battle.character1;
  const char2 = battle.character2;
  const totalVotes = battle.totalVotes || 0;
  const votePercentChar1 = totalVotes > 0 ? Math.round((battle.votesChar1 / totalVotes) * 100) : 0;
  const votePercentChar2 = totalVotes > 0 ? Math.round((battle.votesChar2 / totalVotes) * 100) : 0;

  return (
    <div className="battle-detail">
      <button onClick={() => navigate('/battles')} className="btn-back">
        ← Volver a Batallas
      </button>

      <div className="battle-header-detail">
        <h1 className="battle-title-detail">⚔️ BATALLA ÉPICA ⚔️</h1>
        <p className="battle-creator">Creado por: {battle.creator?.username}</p>
        {user && battle.creatorId === user._id && (
          <button className="btn-delete-battle-detail" onClick={handleDeleteBattle}>
            🗑️ Eliminar Batalla
          </button>
        )}
      </div>

      {/* Comparación Visual */}
      <div className="combatants-showcase">
        <div className="combatant-card">
          <img src={getValidImageUrl(char1.image)} alt={char1.name} onError={(e) => e.target.src = 'https://placehold.co/180'} />
          <h2>{char1.name}</h2>
          <p className="tier-badge">{char1.tier}</p>
        </div>

        <div className="vs-divider">VS</div>

        <div className="combatant-card">
          <img src={getValidImageUrl(char2.image)} alt={char2.name} onError={(e) => e.target.src = 'https://placehold.co/180'} />
          <h2>{char2.name}</h2>
          <p className="tier-badge">{char2.tier}</p>
        </div>
      </div>

      {/* Barras de probabilidad */}
      <div className="simulation-results">
        <h2>📊 Análisis Algorítmico</h2>
        <div className="sim-bars">
          <div className="sim-bar-item">
            <span className="sim-name">{char1.name} — {battle.scoreChar1 || 0} pts</span>
            <div className="sim-bar-wrapper">
              <div className="sim-bar-fill sim-char1" style={{ width: `${battle.winProbabilityChar1}%` }}>
                {battle.winProbabilityChar1}%
              </div>
            </div>
          </div>
          <div className="sim-bar-item">
            <span className="sim-name">{char2.name} — {battle.scoreChar2 || 0} pts</span>
            <div className="sim-bar-wrapper">
              <div className="sim-bar-fill sim-char2" style={{ width: `${battle.winProbabilityChar2}%` }}>
                {battle.winProbabilityChar2}%
              </div>
            </div>
          </div>
        </div>

        {/* Winner or tie */}
        <div className="sim-verdict">
          {battle.simulationWinnerId ? (
            <p>🏆 Ganador: <strong>{battle.simulationWinnerId === char1._id ? char1.name : char2.name}</strong></p>
          ) : (
            <p>🤝 <strong>EMPATE</strong> — Ambos están demasiado igualados</p>
          )}
        </div>
      </div>

      {/* Battle narrative */}
      {battle.battleNarrative && battle.battleNarrative.length > 0 && (
        <div className="battle-narrative-container">
          <h2 className="narrative-main-title">📜 Narrativa de Batalla</h2>
          {battle.battleNarrative.map((section, idx) => (
            <div key={idx} className={`narrative-section ${section.winner === 1 ? 'adv-char1' : section.winner === 2 ? 'adv-char2' : 'adv-tie'}`}>
              <h3 className="narrative-title">{section.title}</h3>
              <div className="narrative-text">{section.text.split('\n').map((line, li) => (
                <p key={li} className={line.trim() === '' ? 'narrative-break' : ''}>{renderNarrativeText(line)}</p>
              ))}</div>
              {section.winner !== undefined && idx < (battle.battleNarrative.length - 1) && (
                <div className="narrative-advantage">
                  {section.winner === 1 ? `✅ Ventaja: ${char1.name}` :
                   section.winner === 2 ? `✅ Ventaja: ${char2.name}` :
                   '🤝 Empate en esta categoría'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Votación */}
      <div className="community-voting">
        <h2>🗳️ ¿Quién crees que gana?</h2>
        <p className="total-votes">{totalVotes} votos de la comunidad</p>

        <div className="vote-options">
          <button
            onClick={() => handleVote(char1._id)}
            className={`vote-btn ${myVote?.votedCharacterId === char1._id ? 'voted' : ''}`}
          >
            <img src={getValidImageUrl(char1.image)} alt={char1.name} onError={(e) => e.target.src = 'https://placehold.co/80'} />
            <span>Votar por {char1.name}</span>
            <div className="vote-count">{battle.votesChar1} votos</div>
          </button>

          <button
            onClick={() => handleVote(char2._id)}
            className={`vote-btn ${myVote?.votedCharacterId === char2._id ? 'voted' : ''}`}
          >
            <img src={getValidImageUrl(char2.image)} alt={char2.name} onError={(e) => e.target.src = 'https://placehold.co/80'} />
            <span>Votar por {char2.name}</span>
            <div className="vote-count">{battle.votesChar2} votos</div>
          </button>
        </div>

        {/* Barra de Votos Global */}
        {totalVotes > 0 && (
          <div className="vote-bar-community">
            <div className="vote-segment vote-char1" style={{ width: `${votePercentChar1}%` }}>
              {votePercentChar1 > 10 ? `${votePercentChar1}%` : ''}
            </div>
            <div className="vote-segment vote-char2" style={{ width: `${votePercentChar2}%` }}>
              {votePercentChar2 > 10 ? `${votePercentChar2}%` : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleDetail;
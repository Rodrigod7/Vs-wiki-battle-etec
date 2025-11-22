// frontend/src/components/BattleDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './BattleDetail.css';

const BattleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [battle, setBattle] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBattle();
    fetchMyVote();
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
      </div>

      {/* Comparación Visual (Sin stats numéricas) */}
      <div className="combatants-showcase">
        <div className="combatant-card">
          <img src={char1.image} alt={char1.name} />
          <h2>{char1.name}</h2>
          <p className="tier-badge">{char1.tier}</p>
        </div>

        <div className="vs-divider">VS</div>

        <div className="combatant-card">
          <img src={char2.image} alt={char2.name} />
          <h2>{char2.name}</h2>
          <p className="tier-badge">{char2.tier}</p>
        </div>
      </div>

      {/* Probabilidades de Simulación */}
      <div className="simulation-results">
        <h2>📊 Predicción de la Wiki (Por Tier)</h2>
        <div className="sim-bars">
          <div className="sim-bar-item">
            <span className="sim-name">{char1.name}</span>
            <div className="sim-bar-wrapper">
              <div className="sim-bar-fill sim-char1" style={{ width: `${battle.winProbabilityChar1}%` }}>
                {battle.winProbabilityChar1}%
              </div>
            </div>
          </div>
          <div className="sim-bar-item">
            <span className="sim-name">{char2.name}</span>
            <div className="sim-bar-wrapper">
              <div className="sim-bar-fill sim-char2" style={{ width: `${battle.winProbabilityChar2}%` }}>
                {battle.winProbabilityChar2}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Votación */}
      <div className="community-voting">
        <h2>🗳️ ¿Quién crees que gana?</h2>
        <p className="total-votes">{totalVotes} votos de la comunidad</p>

        <div className="vote-options">
          <button
            onClick={() => handleVote(char1._id)}
            className={`vote-btn ${myVote?.votedCharacterId === char1._id ? 'voted' : ''}`}
          >
            <img src={char1.image} alt={char1.name} />
            <span>Votar por {char1.name}</span>
            <div className="vote-count">{battle.votesChar1} votos</div>
          </button>

          <button
            onClick={() => handleVote(char2._id)}
            className={`vote-btn ${myVote?.votedCharacterId === char2._id ? 'voted' : ''}`}
          >
            <img src={char2.image} alt={char2.name} />
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
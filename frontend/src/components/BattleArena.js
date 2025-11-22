// frontend/src/components/BattleArena.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './BattleArena.css';

const BattleArena = () => {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState([]);
  const [selectedChar1, setSelectedChar1] = useState(null);
  const [selectedChar2, setSelectedChar2] = useState(null);
  const [searchTerm1, setSearchTerm1] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [battleResult, setBattleResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters?limit=100');
      const data = await response.json();
      if (data.success) {
        setCharacters(data.data);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
    }
  };

  const filteredChars1 = characters.filter(char =>
    char.name.toLowerCase().includes(searchTerm1.toLowerCase()) ||
    (char.alias && char.alias.toLowerCase().includes(searchTerm1.toLowerCase()))
  );

  const filteredChars2 = characters.filter(char =>
    char.name.toLowerCase().includes(searchTerm2.toLowerCase()) ||
    (char.alias && char.alias.toLowerCase().includes(searchTerm2.toLowerCase()))
  );

  const handleCreateBattle = async () => {
    if (!selectedChar1 || !selectedChar2) {
      toast.error('Debes seleccionar ambos personajes');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Debes iniciar sesión para crear batallas');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/battles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          character1Id: selectedChar1._id,
          character2Id: selectedChar2._id
        })
      });

      const data = await response.json();
      if (data.success) {
        setBattleResult(data.data);
        toast.success('¡Batalla creada!');
      } else {
        toast.error(data.message || 'Error al crear batalla');
      }
    } catch (error) {
      console.error('Error creating battle:', error);
      toast.error('Error al crear batalla');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="battle-arena">
      <div className="arena-header">
        <h1 className="arena-title">⚔️ ARENA DE BATALLA ⚔️</h1>
        <p className="arena-subtitle">Selecciona dos personajes y descubre quién ganaría según su Tier</p>
      </div>

      <div className="character-selection">
        {/* Selector 1 */}
        <div className="char-selector char-selector-1">
          <h3>Luchador 1</h3>
          <input
            type="text"
            placeholder="Buscar personaje..."
            value={searchTerm1}
            onChange={(e) => setSearchTerm1(e.target.value)}
            className="search-input"
          />
          <div className="char-list">
            {filteredChars1.slice(0, 8).map(char => (
              <div
                key={char._id}
                className={`char-option ${selectedChar1?._id === char._id ? 'selected' : ''}`}
                onClick={() => setSelectedChar1(char)}
              >
                <img src={char.image} alt={char.name} />
                <div className="char-info">
                  <div className="char-name">{char.name}</div>
                  <div className="char-tier">{char.tier}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="vs-symbol"><span>VS</span></div>

        {/* Selector 2 */}
        <div className="char-selector char-selector-2">
          <h3>Luchador 2</h3>
          <input
            type="text"
            placeholder="Buscar personaje..."
            value={searchTerm2}
            onChange={(e) => setSearchTerm2(e.target.value)}
            className="search-input"
          />
          <div className="char-list">
            {filteredChars2.slice(0, 8).map(char => (
              <div
                key={char._id}
                className={`char-option ${selectedChar2?._id === char._id ? 'selected' : ''}`}
                onClick={() => setSelectedChar2(char)}
              >
                <img src={char.image} alt={char.name} />
                <div className="char-info">
                  <div className="char-name">{char.name}</div>
                  <div className="char-tier">{char.tier}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedChar1 && selectedChar2 && !battleResult && (
        <div className="battle-preview">
          <div className="combatant">
            <img src={selectedChar1.image} alt={selectedChar1.name} />
            <h3>{selectedChar1.name}</h3>
            <p className="tier-badge">{selectedChar1.tier}</p>
          </div>
          
          <button
            onClick={handleCreateBattle}
            disabled={loading}
            className="btn-battle"
          >
            {loading ? '⚡ CALCULANDO...' : '⚔️ INICIAR BATALLA ⚔️'}
          </button>

          <div className="combatant">
            <img src={selectedChar2.image} alt={selectedChar2.name} />
            <h3>{selectedChar2.name}</h3>
            <p className="tier-badge">{selectedChar2.tier}</p>
          </div>
        </div>
      )}

      {battleResult && (
        <div className="battle-results">
          <h2 className="results-title">📊 RESULTADO</h2>

          {/* Solo mostramos las barras de probabilidad (basadas en Tier) */}
          <div className="probability-bars">
            <div className="prob-container">
              <div className="prob-label">
                <img src={battleResult.character1.image} alt="c1" />
                <span>{battleResult.character1.name} ({battleResult.character1.tier})</span>
              </div>
              <div className="prob-bar-wrapper">
                <div className="prob-bar char1-bar" style={{ width: `${battleResult.winProbabilityChar1}%` }}>
                  <span className="prob-value">{battleResult.winProbabilityChar1}%</span>
                </div>
              </div>
            </div>

            <div className="prob-container">
              <div className="prob-label">
                <img src={battleResult.character2.image} alt="c2" />
                <span>{battleResult.character2.name} ({battleResult.character2.tier})</span>
              </div>
              <div className="prob-bar-wrapper">
                <div className="prob-bar char2-bar" style={{ width: `${battleResult.winProbabilityChar2}%` }}>
                  <span className="prob-value">{battleResult.winProbabilityChar2}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="winner-announcement">
            <h3>🏆 GANADOR MATEMÁTICO:</h3>
            <div className="winner-card">
              <img
                src={battleResult.simulationWinnerId === battleResult.character1._id 
                  ? battleResult.character1.image 
                  : battleResult.character2.image}
                alt="Winner"
              />
              <h2>
                {battleResult.simulationWinnerId === battleResult.character1._id
                  ? battleResult.character1.name
                  : battleResult.character2.name}
              </h2>
            </div>
          </div>

          <button onClick={() => navigate(`/battle/${battleResult._id}`)} className="btn-view-full">
            Ver Votación de la Comunidad
          </button>
        </div>
      )}
    </div>
  );
};

export default BattleArena;
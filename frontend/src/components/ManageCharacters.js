// frontend/src/components/ManageCharacters.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getValidImageUrl } from '../utils/imageHelper';
import EditCharacterModal from './EditCharacterModal'; // ✅ IMPORTAR MODAL
import './ManageCharacters.css';

const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const ManageCharacters = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatorId, setCreatorId] = useState(null);
  const [editingCharacter, setEditingCharacter] = useState(null); // ✅ ESTADO PARA EDICIÓN
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.id) {
        setCreatorId(decoded.id);
      } else {
        toast.error('Token inválido');
        setLoading(false);
      }
    } else {
      toast.error('No hay sesión activa');
      setLoading(false);
    }
  }, []);

  const fetchCharacters = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/characters/creator/${id}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setCharacters(data.data);
        toast.success(`${data.data.length} personajes cargados`);
      } else {
        setCharacters([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (creatorId) {
      fetchCharacters(creatorId);
    }
  }, [creatorId]);

  const handleDelete = async (characterId) => {
    if (!window.confirm("¿Estás seguro de eliminar este personaje?")) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/characters/${characterId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Personaje eliminado');
        fetchCharacters(creatorId);
      } else {
        toast.error(data.message || 'No se pudo eliminar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleView = (characterId) => {
    navigate(`/characters/${characterId}`);
  };

  // ✅ Función para abrir el modal
  const handleEdit = (char) => {
    setEditingCharacter(char);
  };

  // ✅ Función para recargar tras editar
  const handleCharacterUpdated = () => {
    fetchCharacters(creatorId);
  };

  if (loading) return <p className="loading-message">Cargando personajes...</p>;
  if (!creatorId) return <p className="error-message">Error: No se pudo verificar la identidad</p>;

  return (
    <div className="manage-characters-container">
      <h2>⚔️ Gestionar Personajes ({characters.length})</h2>
      <button 
        onClick={() => fetchCharacters(creatorId)} 
        className="btn btn-primary btn-small" 
        style={{ marginBottom: '20px' }}
      >
        🔄 Refrescar
      </button>
      
      <div className="character-management-list">
        {characters.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Aún no has creado personajes.
          </p>
        ) : (
          characters.map(char => (
            <div key={char._id} className="character-management-card">
              <img 
                src={getValidImageUrl(char.image)} 
                alt={char.name} 
                className="character-image-thumb"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/80x60?text=Error';
                }}
              />
              <div className="character-details">
                <h4>{char.name}</h4>
                {char.alias && <p className="char-alias">"{char.alias}"</p>}
                <p>Universo: {char.universe}</p>
                <p>Tier: {char.tier}</p>
                <p>👁️ {char.views} | ❤️ {char.likes}</p>
              </div>
              <div className="character-actions">
                <button onClick={() => handleView(char._id)} className="btn btn-primary btn-small">
                  👁️ Ver
                </button>
                {/* ✅ BOTÓN DE EDITAR AGREGADO */}
                <button onClick={() => handleEdit(char)} className="btn btn-warning btn-small">
                  ✏️ Editar
                </button>
                <button onClick={() => handleDelete(char._id)} className="btn btn-danger btn-small">
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ✅ RENDERIZADO CONDICIONAL DEL MODAL */}
      {editingCharacter && (
        <EditCharacterModal 
          character={editingCharacter} 
          onClose={() => setEditingCharacter(null)} 
          onCharacterUpdated={handleCharacterUpdated}
        />
      )}
    </div>
  );
};

export default ManageCharacters;
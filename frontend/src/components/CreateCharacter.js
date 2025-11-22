// frontend/src/components/CreateCharacter.js
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import MultiImageUploader from './MultiImageUploader';
import './CreateCharacter.css';

const CreateCharacter = ({ onCharacterCreated }) => {
  const [formData, setFormData] = useState({
    name: '', alias: '', quote: '', description: '', origin: '',
    gender: '', classification: '',
    tier: 'Unknown',
    attackPotency: '', speed: '', durability: '', weaknesses: '', equipment: '',
    strength: 50, speed_stat: 50, durability_stat: 50, intelligence: 50, energy: 50, combat: 50,
    abilities: [],
    images: [] // Array de {url, label}
  });

  const [abilityInput, setAbilityInput] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStatChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseInt(e.target.value) || 50 });
  };

  const addAbility = () => {
    if (abilityInput.trim()) {
      setFormData({ ...formData, abilities: [...formData.abilities, abilityInput.trim()] });
      setAbilityInput('');
    }
  };

  const removeAbility = (index) => {
    setFormData({ ...formData, abilities: formData.abilities.filter((_, i) => i !== index) });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return toast.error('Inicia sesión primero');
    if (formData.images.length === 0) return toast.error('Sube al menos una imagen');

    try {
      // Usamos ruta relativa /api
      const res = await fetch(`/api/characters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('¡Personaje Creado!');
        // Limpiar formulario o redirigir si lo deseas
        setFormData({
            name: '', alias: '', quote: '', description: '', origin: '',
            gender: '', classification: '',
            tier: 'Unknown',
            attackPotency: '', speed: '', durability: '', weaknesses: '', equipment: '',
            strength: 50, speed_stat: 50, durability_stat: 50, intelligence: 50, energy: 50, combat: 50,
            abilities: [],
            images: []
        });
      } else {
        toast.error(data.message || 'Error al crear');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  return (
    <div className="create-character-container">
      <div className="create-header">
        <h2>⚔️ Nuevo Guerrero Wiki</h2>
        {/* Se eliminó el texto descriptivo aquí */}
      </div>

      <form onSubmit={onSubmit} className="character-form">
        
        {/* 1. IMÁGENES Y VARIANTES */}
        <div className="form-section">
          <MultiImageUploader 
            images={formData.images} 
            setImages={(imgs) => setFormData({...formData, images: imgs})} 
          />
        </div>

        {/* 2. DATOS PRINCIPALES */}
        <div className="form-section">
          <h3 className="section-title">📝 Identidad</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre Principal</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Profesor Barroso" required />
            </div>
            <div className="form-group">
              <label>Alias / Títulos</label>
              <input type="text" name="alias" value={formData.alias} onChange={handleChange} placeholder="El Señor del Lag" />
            </div>
          </div>
          <div className="form-group">
            <label>Cita Épica (Quote)</label>
            <textarea name="quote" value={formData.quote} onChange={handleChange} placeholder="“¿Creen que la clase ha terminado?...”" rows="2" />
          </div>
          <div className="form-group">
            <label>Resumen / Historia</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Historia completa..." rows="5" required />
          </div>
          <div className="form-row">
            <div className="form-group"><label>Origen</label><input type="text" name="origin" value={formData.origin} onChange={handleChange} placeholder="Servidor Central" /></div>
            <div className="form-group"><label>Género</label><input type="text" name="gender" value={formData.gender} onChange={handleChange} placeholder="Protocolo TCP/IP" /></div>
          </div>
          <div className="form-group"><label>Clasificación</label><input type="text" name="classification" value={formData.classification} onChange={handleChange} placeholder="Hechicero Tecnopático" /></div>
        </div>

        {/* 3. ESTADÍSTICAS WIKI (TEXTO) */}
        <div className="form-section">
          <h3 className="section-title">📚 VS Wiki Stats</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nivel (Tier)</label>
              <input type="text" name="tier" value={formData.tier} onChange={handleChange} placeholder="2-C (Universal Bajo)" />
            </div>
            <div className="form-group">
              <label>Potencia de Ataque</label>
              <textarea name="attackPotency" value={formData.attackPotency} onChange={handleChange} placeholder="Nivel Manipulación Mental..." rows="2" />
            </div>
          </div>
          <div className="form-group"><label>Velocidad</label><input type="text" name="speed" value={formData.speed} onChange={handleChange} placeholder="Omnipresente en la red local" /></div>
          <div className="form-group"><label>Durabilidad</label><input type="text" name="durability" value={formData.durability} onChange={handleChange} placeholder="Intangible / Firewall" /></div>
          <div className="form-group"><label>Debilidades</label><input type="text" name="weaknesses" value={formData.weaknesses} onChange={handleChange} placeholder="El timbre de salida" /></div>
          <div className="form-group"><label>Equipo Estándar</label><input type="text" name="equipment" value={formData.equipment} onChange={handleChange} placeholder="Puntero láser, Cable Ethernet" /></div>
        </div>

        {/* 4. PODERES (ARRAY) */}
        <div className="form-section">
          <h3 className="section-title">✨ Poderes y Habilidades</h3>
          <div className="abilities-input">
            <input type="text" value={abilityInput} onChange={(e) => setAbilityInput(e.target.value)} placeholder="Ej: Reinicio Temporal" />
            <button type="button" onClick={addAbility} className="btn-add-ability">➕</button>
          </div>
          <div className="abilities-list">
            {formData.abilities.map((ab, i) => (
              <span key={i} className="ability-tag">{ab} <button type="button" onClick={() => removeAbility(i)}>×</button></span>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-create">Guardar Personaje</button>
      </form>
    </div>
  );
};

export default CreateCharacter;
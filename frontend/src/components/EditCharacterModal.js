// frontend/src/components/EditCharacterModal.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import MultiImageUploader from './MultiImageUploader';
import './CreateCharacter.css'; 
import './Modal.css';

// ✅ LISTA DE TIERS
const tiers = [
  'Street Level', 'Building Level', 'City Level', 'Country Level', 'Continental',
  'Planet Level', 'Star Level', 'Galaxy Level', 'Universal', 
  'Multiversal', 'Hyperversal', 'Omnipotent', 'Unknown'
];

const EditCharacterModal = ({ character, onClose, onCharacterUpdated }) => {
  const [formData, setFormData] = useState({
    name: '', alias: '', quote: '', description: '', origin: '',
    gender: '', classification: '',
    tier: 'Unknown',
    attackPotency: '', speed: '', durability: '', weaknesses: '', equipment: '',
    abilities: [], images: []
  });
  // ... (resto de estados y lógica igual)
  
  const [abilityInput, setAbilityInput] = useState('');

  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name || '',
        alias: character.alias || '',
        quote: character.quote || '',
        description: character.description || '',
        origin: character.origin || '',
        gender: character.gender || '',
        classification: character.classification || '',
        tier: character.tier || 'Unknown',
        attackPotency: character.attackPotency || '',
        speed: character.speed || '',
        durability: character.durability || '',
        weaknesses: character.weaknesses || '',
        equipment: character.equipment || '',
        abilities: Array.isArray(character.abilities) ? character.abilities : [],
        images: Array.isArray(character.images) ? character.images : []
      });
    }
  }, [character]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
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
    try {
      const res = await fetch(`/api/characters/${character._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('¡Personaje actualizado!');
        onCharacterUpdated();
        onClose();
      } else {
        toast.error(data.message || 'Error');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', padding: '20px' }}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        <div className="create-header" style={{ marginTop: '20px' }}>
          <h2 style={{ fontSize: '1.8em' }}>✏️ Editar: {formData.name}</h2>
        </div>

        <form onSubmit={onSubmit} className="character-form" style={{ boxShadow: 'none', padding: '0' }}>
          
          <div className="form-section">
             <MultiImageUploader images={formData.images} setImages={(imgs) => setFormData({...formData, images: imgs})} />
          </div>

          <div className="form-section">
            <h3 className="section-title">📝 Identidad</h3>
            {/* ... inputs de nombre, alias, quote, etc ... */}
            <div className="form-row">
              <div className="form-group"><label>Nombre</label><input type="text" name="name" value={formData.name} onChange={handleChange} required /></div>
              <div className="form-group"><label>Alias</label><input type="text" name="alias" value={formData.alias} onChange={handleChange} /></div>
            </div>
            <div className="form-group"><label>Cita</label><textarea name="quote" value={formData.quote} onChange={handleChange} rows="2" /></div>
            <div className="form-group"><label>Historia</label><textarea name="description" value={formData.description} onChange={handleChange} rows="4" required /></div>
            <div className="form-row">
                <div className="form-group"><label>Origen</label><input type="text" name="origin" value={formData.origin} onChange={handleChange} /></div>
                <div className="form-group"><label>Género</label><input type="text" name="gender" value={formData.gender} onChange={handleChange} /></div>
            </div>
            <div className="form-group"><label>Clasificación</label><input type="text" name="classification" value={formData.classification} onChange={handleChange} /></div>
          </div>

          <div className="form-section">
            <h3 className="section-title">📚 Stats Wiki</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Tier</label>
                {/* ✅ SELECTOR DE TIER ACTUALIZADO */}
                <select name="tier" value={formData.tier} onChange={handleChange}>
                  {tiers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Ataque</label><textarea name="attackPotency" value={formData.attackPotency} onChange={handleChange} rows="1" /></div>
            </div>
            <div className="form-group"><label>Velocidad</label><input type="text" name="speed" value={formData.speed} onChange={handleChange} /></div>
            <div className="form-group"><label>Durabilidad</label><input type="text" name="durability" value={formData.durability} onChange={handleChange} /></div>
            <div className="form-group"><label>Debilidades</label><input type="text" name="weaknesses" value={formData.weaknesses} onChange={handleChange} /></div>
            <div className="form-group"><label>Equipo</label><input type="text" name="equipment" value={formData.equipment} onChange={handleChange} /></div>
          </div>

          <div className="form-section">
            <h3 className="section-title">✨ Poderes</h3>
            <div className="abilities-input">
              <input type="text" value={abilityInput} onChange={(e) => setAbilityInput(e.target.value)} placeholder="Nuevo poder..." />
              <button type="button" onClick={addAbility} className="btn-add-ability">➕</button>
            </div>
            <div className="abilities-list">
              {formData.abilities.map((ab, i) => (
                <span key={i} className="ability-tag">{ab} <button type="button" onClick={() => removeAbility(i)}>×</button></span>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-create">💾 Guardar Cambios</button>
        </form>
      </div>
    </div>
  );
};

export default EditCharacterModal;
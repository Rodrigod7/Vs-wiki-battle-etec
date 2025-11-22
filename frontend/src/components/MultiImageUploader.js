// frontend/src/components/MultiImageUploader.js
import React, { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import './ImageUploader.css';

const MultiImageUploader = ({ images, setImages }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Solo imágenes (JPEG, PNG, GIF, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Máximo 5MB por imagen');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);

      // ✅ CORREGIDO: Ruta relativa
      const response = await fetch(`/api/upload/image?type=products`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const newImage = { 
          // ✅ IMPORTANTE: Usamos 'url' (relativa) en vez de 'fullUrl' (absoluta con localhost)
          url: data.data.url, 
          label: `Variante ${images.length + 1}` 
        };
        setImages([...images, newImage]);
        toast.success('Imagen agregada');
      } else {
        toast.error(data.message || 'Error al subir');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const updateLabel = (index, newLabel) => {
    const newImages = [...images];
    newImages[index].label = newLabel;
    setImages(newImages);
  };

  return (
    <div className="image-uploader">
      <label className="image-uploader-label">Galería de Variantes (Mínimo 1)</label>
      
      <div className="multi-image-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
        {images.map((img, index) => (
          <div key={index} className="image-variant-card" style={{ width: '150px', position: 'relative' }}>
            <img 
              src={img.url} 
              alt={`Variant ${index}`} 
              style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #ddd' }}
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              style={{
                position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white',
                border: 'none', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer'
              }}
            >✕</button>
            <input
              type="text"
              value={img.label}
              onChange={(e) => updateLabel(index, e.target.value)}
              placeholder="Nombre Variante"
              style={{ width: '100%', marginTop: '5px', padding: '5px', fontSize: '0.8em', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>
        ))}
        
        <div 
          className="add-image-btn" 
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            width: '150px', height: '150px', border: '2px dashed #ccc', borderRadius: '10px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', background: '#f9f9f9', color: '#888'
          }}
        >
          {uploading ? <span className="spinner-small"></span> : <span style={{fontSize: '2em'}}>+</span>}
          <span style={{fontSize: '0.8em'}}>Agregar Foto</span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={uploading}
      />
    </div>
  );
};

export default MultiImageUploader;
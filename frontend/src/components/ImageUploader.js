// Frontend/src/components/ImageUploader.js
import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import AvatarCropper from './AvatarCropper';
import './ImageUploader.css';

const ImageUploader = ({ 
  currentImage, 
  onImageUploaded, 
  type = 'products',
  label = 'Subir Imagen'
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const [cropSrc, setCropSrc] = useState(null); // Image data URL for cropper
  const fileInputRef = useRef(null);

  const isAvatar = type === 'users';

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Tipo no válido');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Máximo 5MB');
      return;
    }

    if (isAvatar) {
      // For avatars: open cropper first
      const reader = new FileReader();
      reader.onloadend = () => setCropSrc(reader.result);
      reader.readAsDataURL(file);
    } else {
      // For other images: upload directly
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      await uploadImage(file);
    }
  };

  const handleCropDone = async (croppedBlob) => {
    setCropSrc(null);
    const croppedFile = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
    // Show preview of cropped image
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(croppedBlob);
    await uploadImage(croppedFile);
  };

  const handleCropCancel = () => {
    setCropSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Debes iniciar sesión');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      // ✅ CORREGIDO: Ruta relativa
      const response = await fetch(`/api/upload/image?type=${type}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Imagen subida');
        // ✅ CORREGIDO: Usamos data.data.url (relativa)
        if (onImageUploaded) onImageUploaded(data.data.url);
        setPreview(data.data.url);
      } else {
        toast.error(data.message || 'Error al subir');
        setPreview(currentImage);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error de conexión');
      setPreview(currentImage);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => fileInputRef.current?.click();

  const handleRemoveImage = () => {
    setPreview(null);
    if (onImageUploaded) onImageUploaded(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="image-uploader">
      <label className="image-uploader-label">{label}</label>
      <div className="image-uploader-container">
        <div className="image-preview-wrapper">
          {preview ? (
            <div className={`image-preview-container ${isAvatar ? 'avatar-preview' : ''}`}>
              <img src={preview} alt="Preview" className="image-preview" />
              <button type="button" onClick={handleRemoveImage} className="remove-image-btn" disabled={uploading}>✕</button>
            </div>
          ) : (
            <div className={`image-placeholder ${isAvatar ? 'avatar-placeholder' : ''}`}>
              <p>Sin imagen</p>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} disabled={uploading} />
        <button type="button" onClick={handleButtonClick} className="upload-button" disabled={uploading}>
          {uploading ? 'Subiendo...' : '📁 Elegir Imagen'}
        </button>
      </div>

      {/* Cropper modal for avatars */}
      {cropSrc && (
        <AvatarCropper
          imageSrc={cropSrc}
          onCropDone={handleCropDone}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};

export default ImageUploader;
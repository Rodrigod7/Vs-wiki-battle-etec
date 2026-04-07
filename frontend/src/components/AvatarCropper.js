// frontend/src/components/AvatarCropper.js
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import './AvatarCropper.css';

const AvatarCropper = ({ imageSrc, onCropDone, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImage(imageSrc, croppedAreaPixels);
      onCropDone(croppedBlob);
    } catch (error) {
      console.error('Crop error:', error);
    }
  };

  return (
    <div className="avatar-cropper-overlay">
      <div className="avatar-cropper-modal">
        <h3 className="cropper-title">Ajustá tu foto de perfil</h3>
        <p className="cropper-hint">Arrastrá y hacé zoom para enfocar lo que quieras</p>

        <div className="cropper-container">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="cropper-zoom-control">
          <span className="zoom-label">🔍</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="zoom-slider"
          />
          <span className="zoom-value">{Math.round(zoom * 100)}%</span>
        </div>

        <div className="cropper-actions">
          <button type="button" className="btn-crop-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn-crop-confirm" onClick={handleConfirm}>
            ✅ Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Creates a cropped image blob from canvas
 */
function getCroppedImage(imageSrc, pixelCrop) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Canvas toBlob failed'));
        resolve(blob);
      }, 'image/jpeg', 0.92);
    };
    image.onerror = reject;
    image.src = imageSrc;
  });
}

export default AvatarCropper;

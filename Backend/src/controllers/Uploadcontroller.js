// Backend/src/controllers/uploadController.js
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ninguna imagen'
      });
    }

    // Construir URL de la imagen
    const imageUrl = `/uploads/${req.file.filename}`;
    
    // Si especificaron tipo en query params (users/products)
    const type = req.query.type || 'general';
    const folder = type === 'users' ? 'users' : type === 'products' ? 'products' : '';
    const fullImageUrl = folder ? `/uploads/${folder}/${req.file.filename}` : imageUrl;

    res.status(200).json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fullImageUrl,
        fullUrl: `${req.protocol}://${req.get('host')}${fullImageUrl}`
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir la imagen',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete image
// @route   DELETE /api/upload/image/:filename
// @access  Private
export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const type = req.query.type || 'general';

    // Construir ruta del archivo
    const folder = type === 'users' ? 'users' : type === 'products' ? 'products' : '';
    const filePath = path.join(__dirname, `../../uploads/${folder}`, filename);

    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    // Eliminar el archivo
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la imagen',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se han proporcionado imágenes'
      });
    }

    const type = req.query.type || 'general';
    const folder = type === 'users' ? 'users' : type === 'products' ? 'products' : '';

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: folder ? `/uploads/${folder}/${file.filename}` : `/uploads/${file.filename}`,
      fullUrl: `${req.protocol}://${req.get('host')}/uploads/${folder ? folder + '/' : ''}${file.filename}`
    }));

    res.status(200).json({
      success: true,
      message: `${req.files.length} imagen(es) subida(s) exitosamente`,
      data: uploadedFiles
    });

  } catch (error) {
    console.error('Upload multiple error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir las imágenes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
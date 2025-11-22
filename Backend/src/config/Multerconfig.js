// Backend/src/config/multerConfig.js
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorios si no existen
const createUploadDirectories = () => {
  const directories = [
    path.join(__dirname, '../../uploads'),
    path.join(__dirname, '../../uploads/products'),
    path.join(__dirname, '../../uploads/users'),
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Directorio creado: ${dir}`);
    }
  });
};

createUploadDirectories();

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ==== CAMBIO AQUÍ ====
    // Leer el tipo desde req.query, igual que en el controlador
    const uploadType = req.query.type === 'users' ? 'users' : 'products';
    // ======================
    
    const uploadPath = path.join(__dirname, `../../uploads/${uploadType}`);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp + random + extensión original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// Filtro de archivos - solo imágenes
const fileFilter = (req, file, cb) => {
  // Tipos MIME permitidos
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)'), false);
  }
};

// Configuración de Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  }
});

export default upload;
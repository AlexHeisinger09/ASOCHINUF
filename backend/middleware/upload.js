import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Store files in frontend public/foto_curso directory
const uploadDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'foto_curso');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage with temp directory for processing
const tempDir = path.join(__dirname, '..', '..', 'frontend', 'public', '.temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${timestamp}${ext}`);
  }
});

// Filter to accept only image files
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (jpg, jpeg, png, webp)'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware para comprimir y optimizar imágenes después de subirlas
export const optimizeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const tempPath = req.file.path;
    const filename = req.file.filename;
    const finalPath = path.join(uploadDir, filename);

    // Optimizar imagen basada en su tipo
    let sharpInstance = sharp(tempPath);

    // Redimensionar y convertir según el formato original
    const ext = path.extname(filename).toLowerCase();

    if (ext === '.png') {
      sharpInstance = sharpInstance
        .resize(800, 600, {
          fit: 'cover',
          position: 'center'
        })
        .png({ quality: 80, progressive: true });
    } else if (ext === '.webp') {
      sharpInstance = sharpInstance
        .resize(800, 600, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 75 });
    } else {
      // JPEG
      sharpInstance = sharpInstance
        .resize(800, 600, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 75, progressive: true });
    }

    // Guardar imagen optimizada
    await sharpInstance.toFile(finalPath);

    // Eliminar archivo temporal
    fs.unlinkSync(tempPath);

    // Actualizar información del archivo
    const stats = fs.statSync(finalPath);
    req.file.size = stats.size;
    req.file.path = finalPath;

    next();
  } catch (error) {
    console.error('Error optimizando imagen:', error);
    // Si falla la optimización, intenta al menos mover el archivo
    if (req.file) {
      try {
        const tempPath = req.file.path;
        const finalPath = path.join(uploadDir, req.file.filename);
        fs.copyFileSync(tempPath, finalPath);
        fs.unlinkSync(tempPath);
        req.file.path = finalPath;
        next();
      } catch (err) {
        res.status(500).json({ error: 'Error procesando imagen' });
      }
    } else {
      res.status(500).json({ error: 'Error procesando imagen' });
    }
  }
};

export default upload;

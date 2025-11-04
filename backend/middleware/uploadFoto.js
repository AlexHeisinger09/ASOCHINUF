import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Guardar en la carpeta public/foto_perfil del frontend
    const uploadPath = path.join(__dirname, '../../frontend/public/foto_perfil');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Nombre fijo basado en el usuario ID (siempre el mismo para sobrescribir)
    // Siempre usar .jpg ya que las imágenes se optimizan como JPEG
    cb(null, `user_${req.usuario.id}.jpg`);
  }
});

// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WEBP)'));
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: fileFilter
});

export default upload;

import express from 'express';
import multer from 'multer';
import {
  uploadExcelFile,
  getUploadHistory,
  getSessionDetails,
} from '../controllers/excelController.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

// Configurar multer para manejo de archivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Solo aceptar archivos Excel
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExt = require('path').extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
    }
  },
});

// Rutas
router.post('/upload', verificarToken, upload.single('file'), uploadExcelFile);
router.get('/history', verificarToken, getUploadHistory);
router.get('/session/:sesionId', verificarToken, getSessionDetails);

export default router;

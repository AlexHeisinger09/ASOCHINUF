import express from 'express';
import {
  obtenerCategorias,
  obtenerCategoriasActivas,
  obtenerCategoriaPorId
} from '../controllers/categoriasController.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.get('/', verificarToken, obtenerCategorias);
router.get('/activas', verificarToken, obtenerCategoriasActivas);
router.get('/:id', verificarToken, obtenerCategoriaPorId);

export default router;

import express from 'express';
import {
  getAllCursos,
  getCursoById,
  createCurso,
  updateCurso,
  deleteCurso,
  getCursosByCategoria,
  getCursosByNivel,
  searchCursos
} from '../controllers/cursosController.js';
import { verificarNutricionista } from '../middleware/auth.js';
import upload, { optimizeImage } from '../middleware/upload.js';

const router = express.Router();

// Rutas públicas
router.get('/search', searchCursos);
router.get('/nivel/:nivel', getCursosByNivel);
router.get('/categoria/:categoria_id', getCursosByCategoria);
router.get('/:id', getCursoById);
router.get('/', getAllCursos);

// Rutas protegidas (solo admin y nutricionista)
router.post('/', verificarNutricionista, upload.single('imagen_portada'), optimizeImage, createCurso);
router.put('/:id', verificarNutricionista, upload.single('imagen_portada'), optimizeImage, updateCurso);
router.delete('/:id', verificarNutricionista, deleteCurso);

export default router;

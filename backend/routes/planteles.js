import express from 'express';
import {
  obtenerPlanteles,
  obtenerPlantelesActivos,
  obtenerPlantelPorId,
  crearPlantel,
  actualizarPlantel,
  eliminarPlantel
} from '../controllers/plantelesController.js';
import { verificarToken, verificarAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas (requieren autenticación)
router.get('/', verificarToken, obtenerPlanteles);
router.get('/activos', verificarToken, obtenerPlantelesActivos);
router.get('/:id', verificarToken, obtenerPlantelPorId);

// Rutas protegidas (solo admin)
router.post('/', verificarAdmin, crearPlantel);
router.put('/:id', verificarAdmin, actualizarPlantel);
router.delete('/:id', verificarAdmin, eliminarPlantel);

export default router;

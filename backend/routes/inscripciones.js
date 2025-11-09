import express from 'express';
import { verificarToken } from '../middleware/auth.js';
import {
  inscribirseEnCurso,
  obtenerMisCursos,
  cancelarInscripcion,
  verificarInscripcion,
  obtenerTodasInscripciones
} from '../controllers/inscripcionesController.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Obtener mis cursos inscritos
router.get('/mis-cursos', obtenerMisCursos);

// Inscribirse en un curso
router.post('/', inscribirseEnCurso);

// Verificar si está inscrito en un curso
router.get('/verificar/:id_curso', verificarInscripcion);

// Cancelar inscripción
router.delete('/:id_curso', cancelarInscripcion);

// Obtener todas las inscripciones (admin)
router.get('/todas', obtenerTodasInscripciones);

export default router;

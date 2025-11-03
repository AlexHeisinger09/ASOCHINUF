import express from 'express';
import {
  registro,
  login,
  obtenerPerfil,
  logout,
  solicitarRecuperacion,
  verificarToken as verificarTokenRecuperacion,
  restablecerContrasena
} from '../controllers/authController.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

// Autenticación básica
router.post('/registro', registro);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verificarToken, obtenerPerfil);

// Recuperación de contraseña
router.post('/solicitar-recuperacion', solicitarRecuperacion);
router.get('/verificar-token/:token', verificarTokenRecuperacion);
router.post('/restablecer-contrasena', restablecerContrasena);

export default router;

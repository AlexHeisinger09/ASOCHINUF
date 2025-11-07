import express from 'express';
import { verificarToken } from '../middleware/auth.js';
import {
  iniciarPagoCuota,
  webhookMercadoPago,
  obtenerEstadoPago
} from '../controllers/pagosController.js';

const router = express.Router();

// Webhook no requiere autenticación (es llamado por Mercado Pago)
router.post('/webhook', webhookMercadoPago);

// Rutas protegidas
router.use(verificarToken);

// Iniciar pago de cuota
router.post('/iniciar', iniciarPagoCuota);

// Obtener estado de pago
router.get('/estado/:cuotaId', obtenerEstadoPago);

export default router;

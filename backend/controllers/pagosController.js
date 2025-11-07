import pool from '../config/database.js';
import { crearPreferenciaPago, verificarEstadoPago } from '../services/mercadoPagoService.js';

/**
 * Crear iniciador de pago para una cuota
 */
export const iniciarPagoCuota = async (req, res) => {
  try {
    const { cuotaId } = req.body;
    const usuarioId = req.usuario.id;

    if (!cuotaId) {
      return res.status(400).json({ error: 'cuotaId es requerido' });
    }

    // Obtener la cuota
    const cuotaResult = await pool.query(
      `SELECT c.*, u.nombre, u.apellido, u.email
       FROM t_cuotas_mensuales c
       JOIN t_usuarios u ON c.usuario_id = u.id
       WHERE c.id = $1`,
      [cuotaId]
    );

    if (cuotaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }

    const cuota = cuotaResult.rows[0];

    // Validar que el usuario sea el propietario de la cuota
    if (cuota.usuario_id !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permiso para pagar esta cuota' });
    }

    // Si ya está pagada, retornar error
    if (cuota.estado === 'pagado') {
      return res.status(400).json({ error: 'Esta cuota ya ha sido pagada' });
    }

    // Crear preferencia de pago
    const preferencia = await crearPreferenciaPago(cuota, {
      nombre: cuota.nombre,
      apellido: cuota.apellido,
      email: cuota.email
    });

    res.json({
      message: 'Preferencia de pago creada',
      data: preferencia
    });
  } catch (error) {
    console.error('Error en iniciarPagoCuota:', error);
    res.status(500).json({ error: 'Error al iniciar pago' });
  }
};

/**
 * Webhook para notificaciones de Mercado Pago
 */
export const webhookMercadoPago = async (req, res) => {
  try {
    const { action, data, type } = req.body;

    // Validar que sea una notificación de pago completado
    if (type !== 'payment') {
      return res.status(200).json({ message: 'Notificación recibida' });
    }

    if (action !== 'payment.created' && action !== 'payment.updated') {
      return res.status(200).json({ message: 'Acción no procesada' });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      return res.status(400).json({ error: 'ID de pago no encontrado' });
    }

    // Verificar estado del pago
    const paymentStatus = await verificarEstadoPago(paymentId);

    if (paymentStatus.status !== 'approved') {
      return res.status(200).json({ message: 'Pago no aprobado' });
    }

    // Extraer ID de cuota del external_reference
    const externalRef = paymentStatus.external_reference;
    const cuotaIdMatch = externalRef?.match(/cuota-(\d+)/);

    if (!cuotaIdMatch || !cuotaIdMatch[1]) {
      return res.status(400).json({ error: 'No se pudo extraer ID de cuota' });
    }

    const cuotaId = parseInt(cuotaIdMatch[1]);

    // Obtener cuota y usuario
    const cuotaResult = await pool.query(
      `SELECT * FROM t_cuotas_mensuales WHERE id = $1`,
      [cuotaId]
    );

    if (cuotaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }

    const cuota = cuotaResult.rows[0];

    // Registrar el pago
    await pool.query(
      `INSERT INTO t_pagos_cuotas
       (cuota_id, usuario_id, monto_pagado, metodo_pago, id_mercado_pago,
        estado_mercado_pago, estado_pago, fecha_pago)
       VALUES ($1, $2, $3, 'mercado_pago', $4, $5, 'completado', NOW())
       ON CONFLICT (id_mercado_pago) DO NOTHING`,
      [cuotaId, cuota.usuario_id, cuota.monto, paymentId, paymentStatus.status]
    );

    // Actualizar estado de cuota a pagada
    await pool.query(
      `UPDATE t_cuotas_mensuales SET estado = 'pagado' WHERE id = $1`,
      [cuotaId]
    );

    res.json({ message: 'Pago procesado exitosamente' });
  } catch (error) {
    console.error('Error en webhookMercadoPago:', error);
    res.status(500).json({ error: 'Error al procesar webhook' });
  }
};

/**
 * Obtener estado de pago (para verificación)
 */
export const obtenerEstadoPago = async (req, res) => {
  try {
    const { cuotaId } = req.params;
    const usuarioId = req.usuario.id;

    // Verificar que el usuario tenga acceso
    const cuotaResult = await pool.query(
      `SELECT usuario_id FROM t_cuotas_mensuales WHERE id = $1`,
      [cuotaId]
    );

    if (cuotaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }

    if (cuotaResult.rows[0].usuario_id !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permiso' });
    }

    // Obtener pago más reciente
    const pagoResult = await pool.query(
      `SELECT * FROM t_pagos_cuotas WHERE cuota_id = $1 ORDER BY fecha_creacion DESC LIMIT 1`,
      [cuotaId]
    );

    if (pagoResult.rows.length === 0) {
      return res.json({ estado: 'sin_pago' });
    }

    const pago = pagoResult.rows[0];
    res.json({
      estado: pago.estado_pago,
      monto: pago.monto_pagado,
      fecha: pago.fecha_pago,
      idMercadoPago: pago.id_mercado_pago
    });
  } catch (error) {
    console.error('Error en obtenerEstadoPago:', error);
    res.status(500).json({ error: 'Error al obtener estado de pago' });
  }
};

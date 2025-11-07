import pool from '../config/database.js';

/**
 * Obtener todas las cuotas (admin ve todas, nutricionista ve solo las suyas)
 */
export const obtenerCuotas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const tipoUsuario = req.usuario.tipo_perfil;

    let query = `
      SELECT
        c.id,
        c.usuario_id,
        c.mes,
        c.ano,
        c.monto,
        c.estado,
        c.fecha_vencimiento,
        c.descripcion,
        c.fecha_creacion,
        u.nombre,
        u.apellido,
        u.email,
        u.tipo_perfil,
        COALESCE(p.id, NULL) as tiene_pago,
        COALESCE(p.estado_pago, 'sin_pago') as estado_pago,
        COALESCE(p.fecha_pago, NULL) as fecha_pago
      FROM t_cuotas_mensuales c
      JOIN t_usuarios u ON c.usuario_id = u.id
      LEFT JOIN t_pagos_cuotas p ON c.id = p.cuota_id AND p.estado_pago = 'completado'
    `;

    let params = [];

    if (tipoUsuario === 'nutricionista' || tipoUsuario === 'admin') {
      if (tipoUsuario === 'nutricionista') {
        query += ` WHERE c.usuario_id = $1`;
        params.push(usuarioId);
      } else {
        // Admin ve todos los usuarios excepto clientes
        query += ` WHERE u.tipo_perfil IN ('nutricionista', 'admin')`;
      }
    }

    query += ` ORDER BY c.ano DESC, c.mes DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en obtenerCuotas:', error);
    res.status(500).json({ error: 'Error al obtener cuotas' });
  }
};

/**
 * Crear cuota manual (admin)
 */
export const crearCuota = async (req, res) => {
  try {
    const { usuarioId, mes, ano, monto, fechaVencimiento, descripcion } = req.body;
    const tipoUsuario = req.usuario.tipo_perfil;

    // Solo admin puede crear cuotas
    if (tipoUsuario !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden crear cuotas' });
    }

    // Validar datos
    if (!usuarioId || !mes || !ano || !monto || !fechaVencimiento) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    if (mes < 1 || mes > 12) {
      return res.status(400).json({ error: 'El mes debe estar entre 1 y 12' });
    }

    // Verificar que el usuario existe y es nutricionista o admin
    const usuarioResult = await pool.query(
      `SELECT id, tipo_perfil FROM t_usuarios WHERE id = $1 AND tipo_perfil IN ('nutricionista', 'admin')`,
      [usuarioId]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(400).json({ error: 'El usuario no existe o no es nutricionista/admin' });
    }

    // Crear la cuota
    const result = await pool.query(
      `INSERT INTO t_cuotas_mensuales (usuario_id, mes, ano, monto, fecha_vencimiento, descripcion, estado)
       VALUES ($1, $2, $3, $4, $5, $6, 'pendiente')
       ON CONFLICT (usuario_id, mes, ano) DO UPDATE
       SET monto = $4, fecha_vencimiento = $5, descripcion = $6
       RETURNING *`,
      [usuarioId, mes, ano, monto, fechaVencimiento, descripcion]
    );

    res.status(201).json({
      message: 'Cuota creada/actualizada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error en crearCuota:', error);
    res.status(500).json({ error: 'Error al crear cuota' });
  }
};

/**
 * Obtener resumen de cuotas para notificaciones (usuario actual)
 */
export const obtenerResumenCuotas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const tipoUsuario = req.usuario.tipo_perfil;

    // Solo nutricionsitas y admins tienen cuotas
    if (tipoUsuario === 'cliente') {
      return res.json({
        totalPendientes: 0,
        totalVencidas: 0,
        cuotasMorosas: [],
        proximasAVencer: []
      });
    }

    // Cuotas pendientes
    const pendientes = await pool.query(
      `SELECT COUNT(*) as total FROM t_cuotas_mensuales
       WHERE usuario_id = $1 AND estado IN ('pendiente', 'vencido')`,
      [usuarioId]
    );

    // Cuotas vencidas
    const vencidas = await pool.query(
      `SELECT COUNT(*) as total FROM t_cuotas_mensuales
       WHERE usuario_id = $1 AND estado = 'vencido'`,
      [usuarioId]
    );

    // Detalles de cuotas morosas
    const morosas = await pool.query(
      `SELECT id, mes, ano, monto, fecha_vencimiento, estado
       FROM t_cuotas_mensuales
       WHERE usuario_id = $1 AND estado IN ('pendiente', 'vencido') AND fecha_vencimiento < NOW()::date
       ORDER BY fecha_vencimiento ASC`,
      [usuarioId]
    );

    // Próximas a vencer (próximos 7 días)
    const proximas = await pool.query(
      `SELECT id, mes, ano, monto, fecha_vencimiento, estado
       FROM t_cuotas_mensuales
       WHERE usuario_id = $1 AND estado IN ('pendiente')
       AND fecha_vencimiento BETWEEN NOW()::date AND (NOW()::date + INTERVAL '7 days')
       ORDER BY fecha_vencimiento ASC`,
      [usuarioId]
    );

    res.json({
      totalPendientes: parseInt(pendientes.rows[0].total),
      totalVencidas: parseInt(vencidas.rows[0].total),
      esMoroso: parseInt(vencidas.rows[0].total) > 0,
      cuotasMorosas: morosas.rows,
      proximasAVencer: proximas.rows
    });
  } catch (error) {
    console.error('Error en obtenerResumenCuotas:', error);
    res.status(500).json({ error: 'Error al obtener resumen de cuotas' });
  }
};

/**
 * Obtener una cuota por ID
 */
export const obtenerCuotaById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;
    const tipoUsuario = req.usuario.tipo_perfil;

    let query = `
      SELECT
        c.id,
        c.usuario_id,
        c.mes,
        c.ano,
        c.monto,
        c.estado,
        c.fecha_vencimiento,
        c.descripcion,
        c.fecha_creacion,
        u.nombre,
        u.apellido,
        u.email
      FROM t_cuotas_mensuales c
      JOIN t_usuarios u ON c.usuario_id = u.id
      WHERE c.id = $1
    `;

    const params = [id];

    // Nutricionista solo ve sus cuotas
    if (tipoUsuario === 'nutricionista') {
      query += ` AND c.usuario_id = $2`;
      params.push(usuarioId);
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en obtenerCuotaById:', error);
    res.status(500).json({ error: 'Error al obtener cuota' });
  }
};

/**
 * Registrar pago de cuota
 */
export const registrarPagoCuota = async (req, res) => {
  try {
    const { cuotaId, montoPagado, metodoPago, referenciaPago, idMercadoPago, estadoMercadoPago } = req.body;
    const usuarioId = req.usuario.id;

    // Validar datos
    if (!cuotaId || !montoPagado) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Obtener la cuota
    const cuotaResult = await pool.query(
      `SELECT * FROM t_cuotas_mensuales WHERE id = $1`,
      [cuotaId]
    );

    if (cuotaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }

    const cuota = cuotaResult.rows[0];

    // Validar que el pago sea del usuario correcto
    if (cuota.usuario_id !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permiso para pagar esta cuota' });
    }

    // Validar que el monto sea correcto
    if (parseFloat(montoPagado) < parseFloat(cuota.monto)) {
      return res.status(400).json({ error: 'El monto pagado es menor al monto de la cuota' });
    }

    // Registrar el pago
    const result = await pool.query(
      `INSERT INTO t_pagos_cuotas
       (cuota_id, usuario_id, monto_pagado, metodo_pago, referencia_pago,
        id_mercado_pago, estado_mercado_pago, estado_pago, fecha_pago)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'completado', NOW())
       RETURNING *`,
      [cuotaId, usuarioId, montoPagado, metodoPago || 'mercado_pago', referenciaPago || null,
       idMercadoPago || null, estadoMercadoPago || null]
    );

    // Actualizar estado de la cuota a pagada
    await pool.query(
      `UPDATE t_cuotas_mensuales SET estado = 'pagado' WHERE id = $1`,
      [cuotaId]
    );

    res.status(201).json({
      message: 'Pago registrado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error en registrarPagoCuota:', error);
    res.status(500).json({ error: 'Error al registrar pago' });
  }
};

/**
 * Obtener historial de pagos de una cuota
 */
export const obtenerPagosCuota = async (req, res) => {
  try {
    const { cuotaId } = req.params;
    const usuarioId = req.usuario.id;
    const tipoUsuario = req.usuario.tipo_perfil;

    // Verificar que el usuario tenga acceso
    const cuotaResult = await pool.query(
      `SELECT usuario_id FROM t_cuotas_mensuales WHERE id = $1`,
      [cuotaId]
    );

    if (cuotaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }

    if (tipoUsuario === 'nutricionista' && cuotaResult.rows[0].usuario_id !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permiso' });
    }

    const result = await pool.query(
      `SELECT * FROM t_pagos_cuotas WHERE cuota_id = $1 ORDER BY fecha_creacion DESC`,
      [cuotaId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error en obtenerPagosCuota:', error);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
};

/**
 * Editar cuota (admin)
 */
export const editarCuota = async (req, res) => {
  try {
    const { id } = req.params;
    const { mes, ano, monto, fechaVencimiento, descripcion } = req.body;
    const tipoUsuario = req.usuario.tipo_perfil;

    // Solo admin puede editar cuotas
    if (tipoUsuario !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden editar cuotas' });
    }

    // Validar datos
    if (!mes || !ano || !monto || !fechaVencimiento) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Actualizar la cuota
    const result = await pool.query(
      `UPDATE t_cuotas_mensuales
       SET mes = $1, ano = $2, monto = $3, fecha_vencimiento = $4, descripcion = $5
       WHERE id = $6
       RETURNING *`,
      [mes, ano, monto, fechaVencimiento, descripcion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }

    res.json({
      message: 'Cuota actualizada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error en editarCuota:', error);
    res.status(500).json({ error: 'Error al editar cuota' });
  }
};

/**
 * Eliminar cuota (admin)
 */
export const eliminarCuota = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoUsuario = req.usuario.tipo_perfil;

    // Solo admin puede eliminar cuotas
    if (tipoUsuario !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden eliminar cuotas' });
    }

    // Verificar que la cuota existe
    const cuotaResult = await pool.query(
      `SELECT id, estado FROM t_cuotas_mensuales WHERE id = $1`,
      [id]
    );

    if (cuotaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }

    // No permitir eliminar cuotas pagadas
    if (cuotaResult.rows[0].estado === 'pagado') {
      return res.status(400).json({ error: 'No se pueden eliminar cuotas ya pagadas' });
    }

    // Eliminar la cuota
    await pool.query(
      `DELETE FROM t_cuotas_mensuales WHERE id = $1`,
      [id]
    );

    res.json({
      message: 'Cuota eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error en eliminarCuota:', error);
    res.status(500).json({ error: 'Error al eliminar cuota' });
  }
};

/**
 * Obtener estadísticas de cuotas (admin)
 */
export const obtenerEstadisticas = async (req, res) => {
  try {
    const tipoUsuario = req.usuario.tipo_perfil;

    if (tipoUsuario !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden ver estadísticas' });
    }

    // Total de cuotas
    const totalCuotas = await pool.query(
      `SELECT COUNT(*) as total, SUM(monto) as monto_total FROM t_cuotas_mensuales`
    );

    // Cuotas por estado
    const porEstado = await pool.query(
      `SELECT estado, COUNT(*) as cantidad, SUM(monto) as monto_total
       FROM t_cuotas_mensuales
       GROUP BY estado`
    );

    // Usuarios con morosidad
    const morosos = await pool.query(
      `SELECT
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.tipo_perfil,
        COUNT(c.id) as cuotas_vencidas,
        SUM(c.monto) as monto_vencido
      FROM t_usuarios u
      LEFT JOIN t_cuotas_mensuales c ON u.id = c.usuario_id AND c.estado = 'vencido'
      WHERE u.tipo_perfil IN ('nutricionista', 'admin')
      GROUP BY u.id, u.nombre, u.apellido, u.email, u.tipo_perfil
      HAVING COUNT(c.id) > 0
      ORDER BY SUM(c.monto) DESC`
    );

    // Ingresos totales
    const ingresos = await pool.query(
      `SELECT
        SUM(monto_pagado) as total_recaudado,
        COUNT(*) as pagos_completados
      FROM t_pagos_cuotas
      WHERE estado_pago = 'completado'`
    );

    res.json({
      totalCuotas: totalCuotas.rows[0],
      cuotasPorEstado: porEstado.rows,
      usuariosConMorosidad: morosos.rows,
      recaudacion: ingresos.rows[0] || { total_recaudado: 0, pagos_completados: 0 }
    });
  } catch (error) {
    console.error('Error en obtenerEstadisticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

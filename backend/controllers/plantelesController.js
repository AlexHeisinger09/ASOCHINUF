import pool from '../config/database.js';

/**
 * Obtener todos los planteles
 */
export const obtenerPlanteles = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id,
        p.nombre,
        p.division,
        p.ciudad,
        p.region,
        p.activo,
        p.fecha_creacion,
        p.usuario_creacion,
        u.nombre || ' ' || u.apellido as creador_nombre
      FROM t_planteles p
      LEFT JOIN t_usuarios u ON p.usuario_creacion = u.id
      ORDER BY p.nombre
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener planteles:', error);
    res.status(500).json({ error: 'Error al obtener planteles' });
  }
};

/**
 * Obtener planteles activos (para selección en Excel upload)
 */
export const obtenerPlantelesActivos = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id,
        p.nombre,
        p.division
      FROM t_planteles p
      WHERE p.activo = true
      ORDER BY p.nombre
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener planteles activos:', error);
    res.status(500).json({ error: 'Error al obtener planteles activos' });
  }
};

/**
 * Obtener un plantel por ID
 */
export const obtenerPlantelPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(`
      SELECT
        p.id,
        p.nombre,
        p.division,
        p.ciudad,
        p.region,
        p.activo,
        p.fecha_creacion,
        p.usuario_creacion,
        u.nombre || ' ' || u.apellido as creador_nombre
      FROM t_planteles p
      LEFT JOIN t_usuarios u ON p.usuario_creacion = u.id
      WHERE p.id = $1
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Plantel no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener plantel:', error);
    res.status(500).json({ error: 'Error al obtener plantel' });
  }
};

/**
 * Crear un nuevo plantel
 */
export const crearPlantel = async (req, res) => {
  try {
    const { nombre, division, ciudad, region } = req.body;
    const usuarioId = req.usuario.id;

    // Validaciones
    if (!nombre || !division || !ciudad || !region) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: nombre, division, ciudad, region'
      });
    }

    // Validar división
    const divisionesValidas = ['Primera Division', 'Primera B', 'Segunda División', 'Tercera División A'];
    if (!divisionesValidas.includes(division)) {
      return res.status(400).json({
        error: 'División inválida. Debe ser: Primera Division, Primera B, Segunda División o Tercera División A'
      });
    }

    // Verificar que no exista un plantel con el mismo nombre
    const { rows: existeRows } = await pool.query(
      'SELECT id FROM t_planteles WHERE nombre = $1',
      [nombre]
    );

    if (existeRows.length > 0) {
      return res.status(400).json({
        error: 'Ya existe un plantel con ese nombre'
      });
    }

    // Crear plantel
    const { rows } = await pool.query(`
      INSERT INTO t_planteles (nombre, division, ciudad, region, usuario_creacion, fecha_creacion)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, nombre, division, ciudad, region, activo, fecha_creacion, usuario_creacion
    `, [nombre, division, ciudad, region, usuarioId]);

    // Obtener datos completos con JOIN
    const { rows: plantelCompleto } = await pool.query(`
      SELECT
        p.id,
        p.nombre,
        p.division,
        p.ciudad,
        p.region,
        p.activo,
        p.fecha_creacion,
        p.usuario_creacion,
        u.nombre || ' ' || u.apellido as creador_nombre
      FROM t_planteles p
      LEFT JOIN t_usuarios u ON p.usuario_creacion = u.id
      WHERE p.id = $1
    `, [rows[0].id]);

    res.status(201).json({
      mensaje: 'Plantel creado exitosamente',
      plantel: plantelCompleto[0]
    });
  } catch (error) {
    console.error('Error al crear plantel:', error);
    res.status(500).json({ error: 'Error al crear plantel' });
  }
};

/**
 * Actualizar un plantel
 */
export const actualizarPlantel = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, division, ciudad, region, activo } = req.body;

    // Verificar que el plantel existe
    const { rows: plantelRows } = await pool.query(
      'SELECT id FROM t_planteles WHERE id = $1',
      [id]
    );

    if (plantelRows.length === 0) {
      return res.status(404).json({ error: 'Plantel no encontrado' });
    }

    // Validar división si se proporciona
    if (division) {
      const divisionesValidas = ['Primera Division', 'Primera B', 'Segunda División', 'Tercera División A'];
      if (!divisionesValidas.includes(division)) {
        return res.status(400).json({
          error: 'División inválida. Debe ser: Primera Division, Primera B, Segunda División o Tercera División A'
        });
      }
    }

    // Construir query dinámica
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (nombre !== undefined) {
      updates.push(`nombre = $${paramCount++}`);
      values.push(nombre);
    }
    if (division !== undefined) {
      updates.push(`division = $${paramCount++}`);
      values.push(division);
    }
    if (ciudad !== undefined) {
      updates.push(`ciudad = $${paramCount++}`);
      values.push(ciudad);
    }
    if (region !== undefined) {
      updates.push(`region = $${paramCount++}`);
      values.push(region);
    }
    if (activo !== undefined) {
      updates.push(`activo = $${paramCount++}`);
      values.push(activo);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    values.push(id);

    await pool.query(`
      UPDATE t_planteles
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
    `, values);

    // Obtener datos actualizados
    const { rows: plantelActualizado } = await pool.query(`
      SELECT
        p.id,
        p.nombre,
        p.division,
        p.ciudad,
        p.region,
        p.activo,
        p.fecha_creacion,
        p.usuario_creacion,
        u.nombre || ' ' || u.apellido as creador_nombre
      FROM t_planteles p
      LEFT JOIN t_usuarios u ON p.usuario_creacion = u.id
      WHERE p.id = $1
    `, [id]);

    res.json({
      mensaje: 'Plantel actualizado exitosamente',
      plantel: plantelActualizado[0]
    });
  } catch (error) {
    console.error('Error al actualizar plantel:', error);
    res.status(500).json({ error: 'Error al actualizar plantel' });
  }
};

/**
 * Eliminar (desactivar) un plantel
 */
export const eliminarPlantel = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el plantel existe
    const { rows: plantelRows } = await pool.query(
      'SELECT id FROM t_planteles WHERE id = $1',
      [id]
    );

    if (plantelRows.length === 0) {
      return res.status(404).json({ error: 'Plantel no encontrado' });
    }

    // Verificar si tiene sesiones de medición asociadas
    const { rows: sesionesRows } = await pool.query(
      'SELECT COUNT(*) as count FROM t_sesion_mediciones WHERE plantel_id = $1',
      [id]
    );

    if (parseInt(sesionesRows[0].count) > 0) {
      // Si tiene sesiones, solo desactivar
      await pool.query(
        'UPDATE t_planteles SET activo = false WHERE id = $1',
        [id]
      );

      res.json({
        mensaje: 'Plantel desactivado (tiene sesiones de medición asociadas)',
        tipo: 'desactivado'
      });
    } else {
      // Si no tiene sesiones, eliminar completamente
      await pool.query('DELETE FROM t_planteles WHERE id = $1', [id]);

      res.json({
        mensaje: 'Plantel eliminado exitosamente',
        tipo: 'eliminado'
      });
    }
  } catch (error) {
    console.error('Error al eliminar plantel:', error);
    res.status(500).json({ error: 'Error al eliminar plantel' });
  }
};


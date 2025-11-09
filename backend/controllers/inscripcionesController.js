import pool from '../config/database.js';

// Inscribirse en un curso
export const inscribirseEnCurso = async (req, res) => {
  try {
    const { id_curso } = req.body;
    const usuario_id = req.usuario.id;

    // Verificar que el curso existe y está activo
    const cursoCheck = await pool.query(
      'SELECT id_curso, estado FROM t_cursos WHERE id_curso = $1',
      [id_curso]
    );

    if (cursoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    if (cursoCheck.rows[0].estado !== 'activo') {
      return res.status(400).json({ error: 'El curso no está disponible para inscripción' });
    }

    // Verificar si ya está inscrito
    const inscripcionExistente = await pool.query(
      'SELECT id FROM t_inscripciones WHERE usuario_id = $1 AND id_curso = $2',
      [usuario_id, id_curso]
    );

    if (inscripcionExistente.rows.length > 0) {
      return res.status(400).json({ error: 'Ya estás inscrito en este curso' });
    }

    // Crear inscripción
    const result = await pool.query(
      `INSERT INTO t_inscripciones (usuario_id, id_curso, estado)
       VALUES ($1, $2, 'activa')
       RETURNING *`,
      [usuario_id, id_curso]
    );

    res.status(201).json({
      message: 'Inscripción realizada exitosamente',
      inscripcion: result.rows[0]
    });
  } catch (err) {
    console.error('Error al inscribirse en curso:', err);
    res.status(500).json({ error: 'Error al procesar la inscripción' });
  }
};

// Obtener cursos en los que el usuario está inscrito
export const obtenerMisCursos = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const result = await pool.query(
      `SELECT
        c.*,
        i.id as inscripcion_id,
        i.fecha_inscripcion,
        i.estado as estado_inscripcion
      FROM t_inscripciones i
      INNER JOIN t_cursos c ON i.id_curso = c.id_curso
      WHERE i.usuario_id = $1
      ORDER BY i.fecha_inscripcion DESC`,
      [usuario_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener mis cursos:', err);
    res.status(500).json({ error: 'Error al obtener los cursos' });
  }
};

// Cancelar inscripción
export const cancelarInscripcion = async (req, res) => {
  try {
    const { id_curso } = req.params;
    const usuario_id = req.usuario.id;

    // Verificar que la inscripción existe
    const inscripcionCheck = await pool.query(
      'SELECT id FROM t_inscripciones WHERE usuario_id = $1 AND id_curso = $2',
      [usuario_id, id_curso]
    );

    if (inscripcionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'No estás inscrito en este curso' });
    }

    // Eliminar inscripción
    await pool.query(
      'DELETE FROM t_inscripciones WHERE usuario_id = $1 AND id_curso = $2',
      [usuario_id, id_curso]
    );

    res.json({ message: 'Inscripción cancelada exitosamente' });
  } catch (err) {
    console.error('Error al cancelar inscripción:', err);
    res.status(500).json({ error: 'Error al cancelar la inscripción' });
  }
};

// Verificar si un usuario está inscrito en un curso
export const verificarInscripcion = async (req, res) => {
  try {
    const { id_curso } = req.params;
    const usuario_id = req.usuario.id;

    const result = await pool.query(
      'SELECT id, estado FROM t_inscripciones WHERE usuario_id = $1 AND id_curso = $2',
      [usuario_id, id_curso]
    );

    if (result.rows.length > 0) {
      res.json({
        inscrito: true,
        inscripcion: result.rows[0]
      });
    } else {
      res.json({ inscrito: false });
    }
  } catch (err) {
    console.error('Error al verificar inscripción:', err);
    res.status(500).json({ error: 'Error al verificar la inscripción' });
  }
};

// Obtener todas las inscripciones (admin)
export const obtenerTodasInscripciones = async (req, res) => {
  try {
    // Verificar que sea admin
    if (req.usuario.tipo_perfil !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para ver todas las inscripciones' });
    }

    const result = await pool.query(
      `SELECT
        i.id,
        i.fecha_inscripcion,
        i.estado as estado_inscripcion,
        u.id as usuario_id,
        u.nombre,
        u.apellido,
        u.email,
        c.id_curso,
        c.codigo_curso,
        c.nombre as nombre_curso
      FROM t_inscripciones i
      INNER JOIN t_usuarios u ON i.usuario_id = u.id
      INNER JOIN t_cursos c ON i.id_curso = c.id_curso
      ORDER BY i.fecha_inscripcion DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener inscripciones:', err);
    res.status(500).json({ error: 'Error al obtener las inscripciones' });
  }
};

import pool from '../config/database.js';

/**
 * Obtener todas las categorías
 */
export const obtenerCategorias = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT *
      FROM t_categorias
      ORDER BY orden
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

/**
 * Obtener categorías activas (para selección en formularios)
 */
export const obtenerCategoriasActivas = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, nombre, descripcion, orden
      FROM t_categorias
      WHERE activo = true
      ORDER BY orden
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener categorías activas:', error);
    res.status(500).json({ error: 'Error al obtener categorías activas' });
  }
};

/**
 * Obtener una categoría por ID
 */
export const obtenerCategoriaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(`
      SELECT *
      FROM t_categorias
      WHERE id = $1
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
};

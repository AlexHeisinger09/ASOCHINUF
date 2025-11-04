import pool from './config/database.js';

async function testApi() {
  try {
    const result = await pool.query(`
      SELECT
        id_curso,
        codigo_curso,
        nombre,
        estado
      FROM t_cursos
      ORDER BY fecha_creacion DESC
    `);
    
    console.log('API Response would be:');
    console.log(JSON.stringify(result.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

testApi();

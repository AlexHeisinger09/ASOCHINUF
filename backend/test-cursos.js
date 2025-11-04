import pool from './config/database.js';

async function checkCursos() {
  try {
    const result = await pool.query('SELECT id_curso, nombre, estado FROM t_cursos;');
    console.log('Total cursos:', result.rows.length);
    result.rows.forEach(c => {
      console.log(`[${c.estado}] ${c.nombre}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkCursos();

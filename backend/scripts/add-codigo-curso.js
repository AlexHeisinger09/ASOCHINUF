import pool from '../config/database.js';

async function addCodigoCurso() {
  try {
    console.log('🔄 Agregando columna codigo_curso...\n');

    // Verificar si ya existe
    const checkColumn = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 't_cursos' AND column_name = 'codigo_curso'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ Columna codigo_curso ya existe');
    } else {
      // Agregar columna sin DEFAULT
      await pool.query(`ALTER TABLE t_cursos ADD COLUMN codigo_curso VARCHAR(50) UNIQUE`);
      console.log('✅ Columna codigo_curso creada');
    }

    // Actualizar valores existentes
    await pool.query(`UPDATE t_cursos SET codigo_curso = 'CURSO_' || id WHERE codigo_curso IS NULL`);
    console.log('✅ Valores codigo_curso generados');

    // Agregar NOT NULL constraint
    await pool.query(`ALTER TABLE t_cursos ALTER COLUMN codigo_curso SET NOT NULL`);
    console.log('✅ Constraint NOT NULL agregado\n');

    // Mostrar estructura final
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 't_cursos'
      ORDER BY ordinal_position
    `);

    console.log('📊 Estructura final de t_cursos:\n');
    columns.rows.forEach(col => {
      const nullable = col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL';
      const colName = col.column_name.padEnd(25);
      const dataType = col.data_type.padEnd(25);
      console.log(`  ${colName} ${dataType} ${nullable}`);
    });

    console.log('\n✅ Tabla t_cursos configurada correctamente!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

addCodigoCurso();

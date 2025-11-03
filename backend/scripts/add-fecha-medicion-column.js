import pool from '../config/database.js';

const migracion = async () => {
  try {
    console.log('🔄 Añadiendo columna fecha_medicion a t_informe_antropometrico...\n');

    // Agregar columna si no existe
    await pool.query(`
      ALTER TABLE t_informe_antropometrico
      ADD COLUMN IF NOT EXISTS fecha_medicion DATE;
    `);

    console.log('✓ Columna fecha_medicion agregada\n');

    // Crear índice para mejorar búsquedas
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_informe_fecha_medicion
      ON t_informe_antropometrico(fecha_medicion);
    `);

    console.log('✓ Índice en fecha_medicion creado\n');

    console.log('✓ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
};

migracion();

import pool from '../config/database.js';

/**
 * Script de migración para corregir la estructura de planteles y sesiones
 * - Quitar categoria_id de t_planteles (el plantel es solo el equipo)
 * - Agregar categoria_id a t_sesion_mediciones (la categoría se define por sesión)
 */

async function migrar() {
  try {
    console.log('🔄 Iniciando migración de corrección de planteles y sesiones...\n');

    // 1. Respaldar datos de t_planteles
    console.log('💾 Respaldando datos de t_planteles...');
    const { rows: plantelesBackup } = await pool.query('SELECT * FROM t_planteles');
    console.log(`✓ ${plantelesBackup.length} planteles respaldados`);

    // 2. Respaldar datos de t_sesion_mediciones
    console.log('\n💾 Respaldando datos de t_sesion_mediciones...');
    const { rows: sesionesBackup } = await pool.query('SELECT * FROM t_sesion_mediciones');
    console.log(`✓ ${sesionesBackup.length} sesiones respaldadas`);

    // 3. Eliminar tabla t_planteles antigua
    console.log('\n🗑️  Eliminando tabla t_planteles antigua...');
    await pool.query('DROP TABLE IF EXISTS t_planteles CASCADE');
    console.log('✓ Tabla antigua eliminada');

    // 4. Eliminar tabla t_sesion_mediciones antigua
    console.log('\n🗑️  Eliminando tabla t_sesion_mediciones antigua...');
    await pool.query('DROP TABLE IF EXISTS t_sesion_mediciones CASCADE');
    console.log('✓ Tabla antigua eliminada');

    // 5. Crear nueva tabla t_planteles (sin categoria_id)
    console.log('\n📋 Creando nueva tabla t_planteles...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_planteles (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL UNIQUE,
        division VARCHAR(50) NOT NULL CHECK (division IN ('Primera División', 'Segunda División', 'Tercera División', 'Amateur')),
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        usuario_creacion INTEGER REFERENCES t_usuarios(id) ON DELETE SET NULL
      )
    `);
    console.log('✓ Nueva tabla t_planteles creada');

    // 6. Crear índices para t_planteles
    console.log('\n📋 Creando índices para t_planteles...');
    await pool.query('CREATE INDEX idx_planteles_nombre ON t_planteles(nombre)');
    await pool.query('CREATE INDEX idx_planteles_activo ON t_planteles(activo)');
    console.log('✓ Índices creados');

    // 7. Crear nueva tabla t_sesion_mediciones (con categoria_id)
    console.log('\n📋 Creando nueva tabla t_sesion_mediciones...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_sesion_mediciones (
        id SERIAL PRIMARY KEY,
        plantel_id INTEGER REFERENCES t_planteles(id) ON DELETE RESTRICT,
        categoria_id INTEGER REFERENCES t_categorias(id) ON DELETE RESTRICT,
        fecha_sesion DATE NOT NULL,
        nutricionista_id INTEGER REFERENCES t_usuarios(id) ON DELETE SET NULL,
        archivo_hash VARCHAR(64) NOT NULL,
        cantidad_registros INTEGER NOT NULL,
        fecha_carga TIMESTAMP DEFAULT NOW(),
        UNIQUE(plantel_id, categoria_id, fecha_sesion, archivo_hash)
      )
    `);
    console.log('✓ Nueva tabla t_sesion_mediciones creada');

    // 8. Crear índices para t_sesion_mediciones
    console.log('\n📋 Creando índices para t_sesion_mediciones...');
    await pool.query('CREATE INDEX idx_sesion_plantel ON t_sesion_mediciones(plantel_id)');
    await pool.query('CREATE INDEX idx_sesion_categoria ON t_sesion_mediciones(categoria_id)');
    await pool.query('CREATE INDEX idx_sesion_fecha ON t_sesion_mediciones(fecha_sesion)');
    await pool.query('CREATE INDEX idx_sesion_nutricionista ON t_sesion_mediciones(nutricionista_id)');
    console.log('✓ Índices creados');

    // 9. Mostrar información sobre datos respaldados
    console.log('\n📝 Resumen de datos respaldados:');
    if (plantelesBackup.length > 0) {
      console.log('\n   Planteles que existían:');
      plantelesBackup.forEach(p => {
        console.log(`   - ${p.nombre} (${p.division})`);
      });
    }
    if (sesionesBackup.length > 0) {
      console.log('\n   Sesiones que existían:');
      sesionesBackup.forEach(s => {
        console.log(`   - Sesión ID ${s.id} - Fecha: ${s.fecha_sesion}`);
      });
    }

    console.log('\n✅ Migración completada exitosamente!');
    console.log('\n📌 Próximos pasos:');
    console.log('   1. Los planteles deberán recrearse desde la interfaz "Gestión de Planteles"');
    console.log('   2. La tabla t_planteles ahora solo requiere: nombre y división');
    console.log('   3. La categoría se seleccionará al momento de cargar cada Excel');
    console.log('   4. Cada sesión de medición tendrá su propia categoría (plantel_id + categoria_id + fecha)');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrar();

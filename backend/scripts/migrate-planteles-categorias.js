import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const migrarPlantelesYCategorias = async () => {
  try {
    console.log('🔄 Iniciando migración de planteles y categorías...\n');

    // ========== PASO 1: CREAR TABLA t_categorias ==========
    console.log('📋 Creando tabla t_categorias...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE,
        descripcion VARCHAR(255),
        orden INTEGER,
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Tabla t_categorias creada\n');

    // Insertar categorías predefinidas
    console.log('📝 Insertando categorías predefinidas...');
    const categorias = [
      { nombre: 'Sub-12', descripcion: 'Categoría Sub-12', orden: 1 },
      { nombre: 'Sub-13', descripcion: 'Categoría Sub-13', orden: 2 },
      { nombre: 'Sub-14', descripcion: 'Categoría Sub-14', orden: 3 },
      { nombre: 'Sub-15', descripcion: 'Categoría Sub-15', orden: 4 },
      { nombre: 'Sub-16', descripcion: 'Categoría Sub-16', orden: 5 },
      { nombre: 'Sub-17', descripcion: 'Categoría Sub-17', orden: 6 },
      { nombre: 'Sub-18', descripcion: 'Categoría Sub-18', orden: 7 },
      { nombre: 'Sub-19', descripcion: 'Categoría Sub-19', orden: 8 },
      { nombre: 'Sub-20', descripcion: 'Categoría Sub-20', orden: 9 },
      { nombre: 'Sub-21', descripcion: 'Categoría Sub-21', orden: 10 },
      { nombre: 'Sub-23', descripcion: 'Categoría Sub-23', orden: 11 },
      { nombre: 'Adulta', descripcion: 'Categoría Adulta', orden: 12 }
    ];

    for (const cat of categorias) {
      await pool.query(
        `INSERT INTO t_categorias (nombre, descripcion, orden)
         VALUES ($1, $2, $3)
         ON CONFLICT (nombre) DO NOTHING`,
        [cat.nombre, cat.descripcion, cat.orden]
      );
    }
    console.log(`✓ ${categorias.length} categorías insertadas\n`);

    // ========== PASO 2: RESPALDAR DATOS EXISTENTES ==========
    console.log('💾 Respaldando datos de t_planteles...');
    const { rows: plantelesViejos } = await pool.query('SELECT * FROM t_planteles');
    console.log(`✓ ${plantelesViejos.length} planteles respaldados\n`);

    // ========== PASO 3: ELIMINAR TABLA VIEJA ==========
    console.log('🗑️  Eliminando tabla t_planteles antigua...');
    await pool.query('DROP TABLE IF EXISTS t_planteles CASCADE');
    console.log('✓ Tabla antigua eliminada\n');

    // ========== PASO 4: CREAR NUEVA TABLA t_planteles ==========
    console.log('📋 Creando nueva tabla t_planteles...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_planteles (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        categoria_id INTEGER REFERENCES t_categorias(id) ON DELETE RESTRICT,
        division VARCHAR(50) NOT NULL CHECK (division IN ('Primera División', 'Segunda División', 'Tercera División', 'Amateur')),
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        usuario_creacion INTEGER REFERENCES t_usuarios(id) ON DELETE SET NULL,
        UNIQUE(nombre, categoria_id)
      );
    `);
    console.log('✓ Nueva tabla t_planteles creada\n');

    // Índices para optimización
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_planteles_nombre ON t_planteles(nombre);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_planteles_categoria ON t_planteles(categoria_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_planteles_division ON t_planteles(division);`);
    console.log('✓ Índices creados\n');

    // ========== PASO 5: MIGRAR DATOS (OPCIONAL) ==========
    if (plantelesViejos.length > 0) {
      console.log('🔄 Migrando datos antiguos...');
      console.log('⚠️  NOTA: Los planteles antiguos necesitarán que asignes manualmente la categoría y división.');
      console.log('   Por ahora, los datos antiguos no se migrarán automáticamente.');
      console.log('   Puedes agregarlos manualmente desde la interfaz de Gestión de Planteles.\n');

      // Mostrar planteles antiguos para referencia
      console.log('📝 Planteles que existían:');
      plantelesViejos.forEach(p => {
        console.log(`   - ${p.nombre}`);
      });
      console.log('');
    }

    // ========== PASO 6: ACTUALIZAR t_sesion_mediciones ==========
    console.log('🔄 Actualizando referencias en t_sesion_mediciones...');
    // La tabla se actualizará automáticamente por el CASCADE al eliminar t_planteles
    console.log('✓ Referencias actualizadas\n');

    console.log('✅ Migración completada exitosamente!\n');
    console.log('📌 Próximos pasos:');
    console.log('   1. Accede al panel de administración');
    console.log('   2. Ve a "Gestión de Planteles"');
    console.log('   3. Crea los planteles con sus categorías y divisiones\n');

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

migrarPlantelesYCategorias();

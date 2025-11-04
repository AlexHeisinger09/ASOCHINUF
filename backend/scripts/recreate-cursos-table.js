import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const recreateCursosTable = async () => {
  try {
    console.log('\n=== RECREAR TABLA T_CURSOS ===\n');

    // 1. Eliminar tabla si existe
    console.log('1. Eliminando tabla t_cursos si existe...');
    await pool.query('DROP TABLE IF EXISTS t_cursos CASCADE;');
    console.log('✓ Tabla eliminada (o no existía)');

    // 2. Crear tabla con nuevo esquema
    console.log('\n2. Creando tabla t_cursos con nuevo esquema...');
    await pool.query(`
      CREATE TABLE t_cursos (
        id_curso SERIAL PRIMARY KEY,
        codigo_curso VARCHAR(50) UNIQUE NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,

        -- Información académica
        categoria_id INTEGER,
        nivel VARCHAR(20) CHECK (nivel IN ('básico', 'intermedio', 'avanzado')),
        duracion_horas NUMERIC(5,2),
        modalidad VARCHAR(20) CHECK (modalidad IN ('online', 'presencial', 'mixto')),
        fecha_inicio DATE,
        fecha_fin DATE,

        -- Información comercial
        precio NUMERIC(10,2) DEFAULT 0,
        descuento NUMERIC(5,2) DEFAULT 0,
        precio_final NUMERIC(10,2) GENERATED ALWAYS AS (precio - (precio * descuento / 100)) STORED,
        moneda VARCHAR(10) DEFAULT 'CLP',

        -- Información del instructor
        instructor_id INTEGER,
        nombre_instructor VARCHAR(255),

        -- Contenido y recursos
        imagen_portada VARCHAR(255),
        video_promocional VARCHAR(255),
        materiales TEXT,
        url_curso VARCHAR(255),

        fecha_creacion TIMESTAMP DEFAULT NOW(),
        estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'borrador'))
      );
    `);
    console.log('✓ Tabla t_cursos creada exitosamente');

    // 3. Crear índices
    console.log('\n3. Creando índices...');
    await pool.query('CREATE INDEX idx_codigo_curso ON t_cursos(codigo_curso);');
    await pool.query('CREATE INDEX idx_estado ON t_cursos(estado);');
    await pool.query('CREATE INDEX idx_instructor_id ON t_cursos(instructor_id);');
    await pool.query('CREATE INDEX idx_categoria_id ON t_cursos(categoria_id);');
    console.log('✓ Índices creados exitosamente');

    // 4. Verificar estructura
    console.log('\n4. Verificando estructura de la tabla...');
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 't_cursos'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Estructura de t_cursos:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    console.log('\n=== ✅ TABLA T_CURSOS RECREADA EXITOSAMENTE ===\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

setTimeout(recreateCursosTable, 1000);

import pool from '../config/database.js';

async function migrateCursosTable() {
  try {
    console.log('🔄 Migrando tabla t_cursos...\n');

    // 1. Verificar si la tabla existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 't_cursos'
      )
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ Tabla t_cursos no existe. Creando tabla...\n');

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

          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'borrador'))
        )
      `);

      console.log('✅ Tabla t_cursos creada exitosamente\n');
    } else {
      console.log('✅ Tabla t_cursos ya existe\n');
      console.log('🔍 Verificando columnas existentes...\n');

      // Obtener columnas existentes
      const columns = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 't_cursos'
        ORDER BY ordinal_position
      `);

      const existingColumns = columns.rows.map(r => r.column_name);
      console.log('Columnas actuales:', existingColumns);
      console.log('\nNuevas columnas a agregar:');

      const newColumns = [
        'codigo_curso',
        'categoria_id',
        'nivel',
        'duracion_horas',
        'modalidad',
        'fecha_inicio',
        'fecha_fin',
        'precio',
        'descuento',
        'precio_final',
        'moneda',
        'instructor_id',
        'nombre_instructor',
        'imagen_portada',
        'video_promocional',
        'materiales',
        'url_curso',
        'fecha_creacion',
        'estado'
      ];

      const columnsToAdd = newColumns.filter(col => !existingColumns.includes(col));

      if (columnsToAdd.length === 0) {
        console.log('ℹ️ Todas las columnas ya existen\n');
      } else {
        console.log(columnsToAdd.join(', '));
        console.log('\n🔄 Agregando columnas faltantes...\n');

        // Agregar columnas una por una
        for (const col of columnsToAdd) {
          try {
            switch(col) {
              case 'codigo_curso':
                await pool.query(`
                  ALTER TABLE t_cursos
                  ADD COLUMN codigo_curso VARCHAR(50) UNIQUE NOT NULL DEFAULT 'CURSO_' || id_curso
                `);
                console.log('✅ Agregada columna: codigo_curso');
                break;
              case 'categoria_id':
                await pool.query(`ALTER TABLE t_cursos ADD COLUMN categoria_id INTEGER`);
                console.log('✅ Agregada columna: categoria_id');
                break;
              case 'nivel':
                await pool.query(`
                  ALTER TABLE t_cursos
                  ADD COLUMN nivel VARCHAR(20) CHECK (nivel IN ('básico', 'intermedio', 'avanzado'))
                `);
                console.log('✅ Agregada columna: nivel');
                break;
              case 'duracion_horas':
                await pool.query(`ALTER TABLE t_cursos ADD COLUMN duracion_horas NUMERIC(5,2)`);
                console.log('✅ Agregada columna: duracion_horas');
                break;
              case 'modalidad':
                await pool.query(`
                  ALTER TABLE t_cursos
                  ADD COLUMN modalidad VARCHAR(20) CHECK (modalidad IN ('online', 'presencial', 'mixto'))
                `);
                console.log('✅ Agregada columna: modalidad');
                break;
              case 'fecha_inicio':
                await pool.query(`ALTER TABLE t_cursos ADD COLUMN fecha_inicio DATE`);
                console.log('✅ Agregada columna: fecha_inicio');
                break;
              case 'fecha_fin':
                await pool.query(`ALTER TABLE t_cursos ADD COLUMN fecha_fin DATE`);
                console.log('✅ Agregada columna: fecha_fin');
                break;
              case 'precio':
                await pool.query(`ALTER TABLE t_cursos ADD COLUMN precio NUMERIC(10,2) DEFAULT 0`);
                console.log('✅ Agregada columna: precio');
                break;
              case 'descuento':
                await pool.query(`ALTER TABLE t_cursos ADD COLUMN descuento NUMERIC(5,2) DEFAULT 0`);
                console.log('✅ Agregada columna: descuento');
                break;
              case 'precio_final':
                await pool.query(`
                  ALTER TABLE t_cursos
                  ADD COLUMN precio_final NUMERIC(10,2) GENERATED ALWAYS AS (precio - (precio * descuento / 100)) STORED
                `);
                console.log('✅ Agregada columna: precio_final (calculada)');
                break;
              case 'moneda':
                await pool.query(`ALTER TABLE t_cursos ADD COLUMN moneda VARCHAR(10) DEFAULT 'CLP'`);
                console.log('✅ Agregada columna: moneda');
                break;
              case 'instructor_id':
                await pool.query(`ALTER TABLE t_cursos ADD COLUMN instructor_id INTEGER`);
                console.log('✅ Agregada columna: instructor_id');
                break;
              case 'nombre_instructor':
                await pool.query(`ALTER TABLE t_cursos ADD COLUMN nombre_instructor VARCHAR(255)`);
                console.log('✅ Agregada columna: nombre_instructor');
                break;
              case 'imagen_portada':
                await pool.query(`ALTER TABLE t_cursos ADD COLUMN imagen_portada VARCHAR(255)`);
                console.log('✅ Agregada columna: imagen_portada');
                break;
              case 'video_promocional':
                await pool.query(`ALTER TABLE t_cursos ADD COLUMN video_promocional VARCHAR(255)`);
                console.log('✅ Agregada columna: video_promocional');
                break;
              case 'materiales':
                await pool.query(`ALTER TABLE t_cursos ADD COLUMN materiales TEXT`);
                console.log('✅ Agregada columna: materiales');
                break;
              case 'url_curso':
                await pool.query(`ALTER TABLE t_cursos ADD COLUMN url_curso VARCHAR(255)`);
                console.log('✅ Agregada columna: url_curso');
                break;
              case 'fecha_creacion':
                await pool.query(`ALTER TABLE t_cursos ADD COLUMN fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
                console.log('✅ Agregada columna: fecha_creacion');
                break;
              case 'estado':
                await pool.query(`
                  ALTER TABLE t_cursos
                  ADD COLUMN estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'borrador'))
                `);
                console.log('✅ Agregada columna: estado');
                break;
            }
          } catch (error) {
            console.log(`⚠️ Columna ${col} ya existe o error: ${error.message}`);
          }
        }
      }
    }

    // 3. Verificar estructura final
    console.log('\n📊 Estructura final de t_cursos:\n');
    const finalColumns = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 't_cursos'
      ORDER BY ordinal_position
    `);

    finalColumns.rows.forEach(col => {
      const nullable = col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL';
      console.log(`  ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}`);
    });

    console.log('\n✅ Migración de t_cursos completada exitosamente!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error en migración:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrateCursosTable();

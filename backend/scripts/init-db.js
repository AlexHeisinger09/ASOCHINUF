import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const inicializarBD = async () => {
  try {
    console.log('Inicializando base de datos...\n');

    // Crear tabla t_usuarios
    console.log('Creando tabla t_usuarios...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_usuarios (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        tipo_perfil VARCHAR(50) NOT NULL DEFAULT 'cliente',
        activo BOOLEAN DEFAULT true,
        fecha_registro TIMESTAMP DEFAULT NOW(),
        CONSTRAINT email_unique UNIQUE(email),
        CONSTRAINT tipo_perfil_check CHECK (tipo_perfil IN ('admin', 'nutricionista', 'cliente'))
      );
    `);
    console.log('✓ Tabla t_usuarios creada\n');

    // Crear tabla t_clientes
    console.log('Creando tabla t_clientes...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_clientes (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL UNIQUE,
        telefono VARCHAR(20),
        fecha_nacimiento DATE,
        activo BOOLEAN DEFAULT true,
        fecha_registro TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE
      );
    `);
    console.log('✓ Tabla t_clientes creada\n');

    // Crear tabla t_nutricionistas
    console.log('Creando tabla t_nutricionistas...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_nutricionistas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL UNIQUE,
        especialidad VARCHAR(255),
        licencia VARCHAR(100),
        activo BOOLEAN DEFAULT true,
        fecha_registro TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE
      );
    `);
    console.log('✓ Tabla t_nutricionistas creada\n');

    // Crear tabla t_cursos
    console.log('Creando tabla t_cursos...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_cursos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        duracion INTEGER,
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Tabla t_cursos creada\n');

    // Crear tabla t_inscripciones
    console.log('Creando tabla t_inscripciones...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_inscripciones (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL,
        curso_id INTEGER NOT NULL,
        fecha_inscripcion TIMESTAMP DEFAULT NOW(),
        estado VARCHAR(50) DEFAULT 'activa',
        FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (curso_id) REFERENCES t_cursos(id) ON DELETE CASCADE,
        UNIQUE(usuario_id, curso_id)
      );
    `);
    console.log('✓ Tabla t_inscripciones creada\n');

    // Crear tabla t_informe_antropometrico
    console.log('Creando tabla t_informe_antropometrico...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_informe_antropometrico (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER NOT NULL,
        nutricionista_id INTEGER,
        peso DECIMAL(6, 2),
        altura DECIMAL(5, 2),
        imc DECIMAL(5, 2),
        circunferencia_cintura DECIMAL(6, 2),
        circunferencia_cadera DECIMAL(6, 2),
        porcentaje_grasa DECIMAL(5, 2),
        fecha_registro TIMESTAMP DEFAULT NOW(),
        notas TEXT,
        FOREIGN KEY (cliente_id) REFERENCES t_usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (nutricionista_id) REFERENCES t_usuarios(id) ON DELETE SET NULL
      );
    `);
    console.log('✓ Tabla t_informe_antropometrico creada\n');

    // Crear tabla t_planteles (teams/squads)
    console.log('Creando tabla t_planteles...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_planteles (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL UNIQUE,
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Tabla t_planteles creada\n');

    // Crear tabla t_sesion_mediciones (measurement sessions)
    console.log('Creando tabla t_sesion_mediciones...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_sesion_mediciones (
        id SERIAL PRIMARY KEY,
        plantel_id INTEGER NOT NULL,
        nutricionista_id INTEGER NOT NULL,
        fecha_sesion DATE NOT NULL,
        fecha_carga TIMESTAMP DEFAULT NOW(),
        nombre_archivo VARCHAR(255),
        hash_archivo VARCHAR(64),
        cantidad_registros INTEGER,
        activo BOOLEAN DEFAULT true,
        FOREIGN KEY (plantel_id) REFERENCES t_planteles(id) ON DELETE CASCADE,
        FOREIGN KEY (nutricionista_id) REFERENCES t_usuarios(id) ON DELETE CASCADE,
        UNIQUE(plantel_id, fecha_sesion, hash_archivo)
      );
    `);
    console.log('✓ Tabla t_sesion_mediciones creada\n');

    // Modificar tabla t_informe_antropometrico para agregar sesion_id
    console.log('Modificando tabla t_informe_antropometrico...');
    await pool.query(`
      ALTER TABLE t_informe_antropometrico
      ADD COLUMN IF NOT EXISTS sesion_id INTEGER,
      ADD COLUMN IF NOT EXISTS nombre_paciente VARCHAR(255),
      ADD CONSTRAINT fk_sesion_mediciones FOREIGN KEY (sesion_id) REFERENCES t_sesion_mediciones(id) ON DELETE SET NULL;
    `);
    console.log('✓ Tabla t_informe_antropometrico modificada\n');

    // Crear tabla t_excel_uploads
    console.log('Creando tabla t_excel_uploads...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_excel_uploads (
        id SERIAL PRIMARY KEY,
        nutricionista_id INTEGER NOT NULL,
        nombre_archivo VARCHAR(255),
        datos_json JSONB,
        fecha_carga TIMESTAMP DEFAULT NOW(),
        cantidad_registros INTEGER,
        FOREIGN KEY (nutricionista_id) REFERENCES t_usuarios(id) ON DELETE CASCADE
      );
    `);
    console.log('✓ Tabla t_excel_uploads creada\n');

    console.log('✓ Base de datos inicializada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error al inicializar la base de datos:', error);
    process.exit(1);
  }
};

inicializarBD();

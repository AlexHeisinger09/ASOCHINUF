import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const inicializarBD = async () => {
  try {
    console.log('Inicializando base de datos...\\n');

    // ========== TABLA t_usuarios ==========
    console.log('Creando tabla t_usuarios...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_usuarios (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        tipo_perfil VARCHAR(50) NOT NULL CHECK (tipo_perfil IN ('admin', 'nutricionista', 'cliente')),
        activo BOOLEAN DEFAULT true,
        foto VARCHAR(255),
        fecha_registro TIMESTAMP DEFAULT NOW(),
        CONSTRAINT email_unique UNIQUE(email)
      );
    `);
    console.log('✓ Tabla t_usuarios creada');

    // Índices para t_usuarios
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_usuarios_email ON t_usuarios(email);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_usuarios_tipo_perfil ON t_usuarios(tipo_perfil);`);
    console.log('✓ Índices en t_usuarios creados\\n');

    // ========== TABLA t_pacientes (NEW) ==========
    console.log('Creando tabla t_pacientes...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_pacientes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100),
        cedula VARCHAR(20),
        email VARCHAR(255),
        telefono VARCHAR(20),
        fecha_nacimiento DATE,
        activo BOOLEAN DEFAULT true,
        fecha_registro TIMESTAMP DEFAULT NOW(),
        CONSTRAINT cedula_unique UNIQUE(cedula)
      );
    `);
    console.log('✓ Tabla t_pacientes creada');

    // Índices para t_pacientes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pacientes_nombre ON t_pacientes(nombre);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pacientes_cedula ON t_pacientes(cedula);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pacientes_email ON t_pacientes(email);`);
    console.log('✓ Índices en t_pacientes creados\\n');

    // ========== TABLA t_clientes ==========
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
    console.log('✓ Tabla t_clientes creada');

    // Índices para t_clientes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_clientes_usuario_id ON t_clientes(usuario_id);`);
    console.log('✓ Índices en t_clientes creados\\n');

    // ========== TABLA t_nutricionistas ==========
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
    console.log('✓ Tabla t_nutricionistas creada');

    // Índices para t_nutricionistas
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_nutricionistas_usuario_id ON t_nutricionistas(usuario_id);`);
    console.log('✓ Índices en t_nutricionistas creados\\n');

    // ========== TABLA t_cursos ==========
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
    console.log('✓ Tabla t_cursos creada');

    // Índices para t_cursos
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_cursos_activo ON t_cursos(activo);`);
    console.log('✓ Índices en t_cursos creados\\n');

    // ========== TABLA t_inscripciones ==========
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
    console.log('✓ Tabla t_inscripciones creada');

    // Índices para t_inscripciones
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_inscripciones_usuario_id ON t_inscripciones(usuario_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_inscripciones_curso_id ON t_inscripciones(curso_id);`);
    console.log('✓ Índices en t_inscripciones creados\\n');

    // ========== TABLA t_categorias ==========
    console.log('Creando tabla t_categorias...');
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
    console.log('✓ Tabla t_categorias creada');

    // Insertar categorías predefinidas
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

    // Índices para t_categorias
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_categorias_orden ON t_categorias(orden);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_categorias_activo ON t_categorias(activo);`);
    console.log('✓ Índices en t_categorias creados\\n');

    // ========== TABLA t_planteles ==========
    console.log('Creando tabla t_planteles...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_planteles (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL UNIQUE,
        division VARCHAR(50) NOT NULL CHECK (division IN ('Primera División', 'Segunda División', 'Tercera División', 'Amateur')),
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        usuario_creacion INTEGER REFERENCES t_usuarios(id) ON DELETE SET NULL
      );
    `);
    console.log('✓ Tabla t_planteles creada');

    // Índices para t_planteles
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_planteles_nombre ON t_planteles(nombre);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_planteles_activo ON t_planteles(activo);`);
    console.log('✓ Índices en t_planteles creados\\n');

    // ========== TABLA t_sesion_mediciones ==========
    console.log('Creando tabla t_sesion_mediciones...');
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
      );
    `);
    console.log('✓ Tabla t_sesion_mediciones creada');

    // Índices para t_sesion_mediciones
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sesion_plantel ON t_sesion_mediciones(plantel_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sesion_categoria ON t_sesion_mediciones(categoria_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sesion_fecha ON t_sesion_mediciones(fecha_sesion);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sesion_nutricionista ON t_sesion_mediciones(nutricionista_id);`);
    console.log('✓ Índices en t_sesion_mediciones creados\\n');

    // ========== TABLA t_informe_antropometrico ==========
    console.log('Creando tabla t_informe_antropometrico...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_informe_antropometrico (
        id SERIAL PRIMARY KEY,
        paciente_id INTEGER NOT NULL,
        sesion_id INTEGER NOT NULL,
        nutricionista_id INTEGER NOT NULL,
        fecha_registro TIMESTAMP DEFAULT NOW(),

        -- Medidas básicas [kg, cm]
        peso DECIMAL(6, 2),
        talla DECIMAL(5, 2),
        talla_sentado DECIMAL(5, 2),

        -- Diámetros [cm]
        diametro_biacromial DECIMAL(6, 2),
        diametro_torax DECIMAL(6, 2),
        diametro_antpost_torax DECIMAL(6, 2),
        diametro_biiliocristal DECIMAL(6, 2),
        diametro_bitrocanterea DECIMAL(6, 2),
        diametro_humero DECIMAL(6, 2),
        diametro_femur DECIMAL(6, 2),

        -- Perímetros [cm]
        perimetro_brazo_relajado DECIMAL(6, 2),
        perimetro_brazo_flexionado DECIMAL(6, 2),
        perimetro_muslo_anterior DECIMAL(6, 2),
        perimetro_pantorrilla DECIMAL(6, 2),

        -- Pliegues [mm]
        pliegue_triceps DECIMAL(6, 2),
        pliegue_subescapular DECIMAL(6, 2),
        pliegue_supraespinal DECIMAL(6, 2),
        pliegue_abdominal DECIMAL(6, 2),
        pliegue_muslo_anterior DECIMAL(6, 2),
        pliegue_pantorrilla_medial DECIMAL(6, 2),

        -- Masa Adiposa por Zona [%]
        masa_adiposa_superior DECIMAL(5, 2),
        masa_adiposa_media DECIMAL(5, 2),
        masa_adiposa_inferior DECIMAL(5, 2),

        -- Índices
        imo DECIMAL(5, 2),
        imc DECIMAL(5, 2),
        icc DECIMAL(5, 2),
        ica DECIMAL(5, 2),

        -- Sumatoria de Pliegues [mm]
        suma_6_pliegues DECIMAL(6, 2),
        suma_8_pliegues DECIMAL(6, 2),

        -- Notas
        notas TEXT,

        FOREIGN KEY (paciente_id) REFERENCES t_pacientes(id) ON DELETE CASCADE,
        FOREIGN KEY (sesion_id) REFERENCES t_sesion_mediciones(id) ON DELETE CASCADE,
        FOREIGN KEY (nutricionista_id) REFERENCES t_usuarios(id) ON DELETE SET NULL
      );
    `);
    console.log('✓ Tabla t_informe_antropometrico creada');

    // Índices para t_informe_antropometrico (CRÍTICO PARA PERFORMANCE)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_informe_paciente_id ON t_informe_antropometrico(paciente_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_informe_sesion_id ON t_informe_antropometrico(sesion_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_informe_nutricionista_id ON t_informe_antropometrico(nutricionista_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_informe_paciente_sesion ON t_informe_antropometrico(paciente_id, sesion_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_informe_fecha ON t_informe_antropometrico(fecha_registro);`);
    console.log('✓ Índices en t_informe_antropometrico creados\\n');

    // ========== TABLA t_excel_uploads ==========
    console.log('Creando tabla t_excel_uploads...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_excel_uploads (
        id SERIAL PRIMARY KEY,
        sesion_id INTEGER NOT NULL,
        nutricionista_id INTEGER NOT NULL,
        nombre_archivo VARCHAR(255) NOT NULL,
        hash_archivo VARCHAR(64) NOT NULL,
        cantidad_registros INTEGER DEFAULT 0,
        fecha_carga TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (sesion_id) REFERENCES t_sesion_mediciones(id) ON DELETE CASCADE,
        FOREIGN KEY (nutricionista_id) REFERENCES t_usuarios(id) ON DELETE CASCADE,
        UNIQUE(hash_archivo)
      );
    `);
    console.log('✓ Tabla t_excel_uploads creada');

    // Índices para t_excel_uploads
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_excel_uploads_sesion_id ON t_excel_uploads(sesion_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_excel_uploads_nutricionista_id ON t_excel_uploads(nutricionista_id);`);
    console.log('✓ Índices en t_excel_uploads creados\\n');

    // ========== TABLA t_recovery_tokens ==========
    console.log('Creando tabla t_recovery_tokens...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS t_recovery_tokens (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        fecha_creacion TIMESTAMP DEFAULT NOW(),
        fecha_expiracion TIMESTAMP NOT NULL,
        usado BOOLEAN DEFAULT false,
        fecha_uso TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE
      );
    `);
    console.log('✓ Tabla t_recovery_tokens creada');

    // Índices para t_recovery_tokens
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_recovery_tokens_usuario_id ON t_recovery_tokens(usuario_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_recovery_tokens_token ON t_recovery_tokens(token);`);
    console.log('✓ Índices en t_recovery_tokens creados\\n');

    console.log('\\n========================================');
    console.log('✓ BASE DE DATOS INICIALIZADA CORRECTAMENTE');
    console.log('========================================\\n');
    console.log('Tablas creadas:');
    console.log('  • t_usuarios (admin, nutricionista, cliente)');
    console.log('  • t_pacientes (datos de pacientes)');
    console.log('  • t_clientes (relación usuario-cliente)');
    console.log('  • t_nutricionistas (relación usuario-nutricionista)');
    console.log('  • t_cursos (cursos disponibles)');
    console.log('  • t_inscripciones (inscripciones a cursos)');
    console.log('  • t_planteles (equipos/planteles)');
    console.log('  • t_sesion_mediciones (sesiones de mediciones)');
    console.log('  • t_informe_antropometrico (mediciones detalladas)');
    console.log('  • t_excel_uploads (control de cargas Excel)');
    console.log('  • t_recovery_tokens (tokens de recuperación)\\n');
    console.log('Índices creados para optimizar consultas frecuentes.\\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error al inicializar la base de datos:', error);
    process.exit(1);
  }
};

inicializarBD();

-- Script SQL para crear todas las tablas de ASOCHINUF

-- Tabla de usuarios
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

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS t_clientes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL UNIQUE,
  telefono VARCHAR(20),
  fecha_nacimiento DATE,
  activo BOOLEAN DEFAULT true,
  fecha_registro TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE
);

-- Tabla de nutricionistas
CREATE TABLE IF NOT EXISTS t_nutricionistas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL UNIQUE,
  especialidad VARCHAR(255),
  licencia VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  fecha_registro TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE
);

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS t_cursos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  duracion INTEGER,
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Tabla de inscripciones
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

-- Tabla de informe antropométrico
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

-- Tabla de excel uploads
CREATE TABLE IF NOT EXISTS t_excel_uploads (
  id SERIAL PRIMARY KEY,
  nutricionista_id INTEGER NOT NULL,
  nombre_archivo VARCHAR(255),
  datos_json JSONB,
  fecha_carga TIMESTAMP DEFAULT NOW(),
  cantidad_registros INTEGER,
  FOREIGN KEY (nutricionista_id) REFERENCES t_usuarios(id) ON DELETE CASCADE
);

-- Tabla de tokens de recuperación de contraseña
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

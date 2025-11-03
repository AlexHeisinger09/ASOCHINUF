# Setup de Base de Datos Neon - ASOCHINUF

## Crear las tablas en Neon

### Opción 1: Usar SQL Editor de Neon (Recomendado - más fácil)

1. Ve a tu proyecto Neon: https://console.neon.tech
2. Selecciona tu base de datos `neondb`
3. Ve a la pestaña "SQL Editor"
4. Copia y pega TODO el contenido de abajo
5. Presiona el botón "Execute"

### SQL para crear todas las tablas:

```sql
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

-- Tabla de datos antropologicos
CREATE TABLE IF NOT EXISTS t_datos_antropologicos (
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
```

## Verificar que se crearon las tablas

Una vez ejecutado, en el SQL Editor de Neon ejecuta:

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema='public';
```

Deberías ver:
- t_usuarios
- t_clientes
- t_nutricionistas
- t_cursos
- t_inscripciones
- t_datos_antropologicos
- t_excel_uploads

## Próximos pasos después de crear las tablas:

### 1. Iniciar el servidor backend:
```bash
cd backend
npm run dev
```

### 2. Probar que funciona:
```bash
curl http://localhost:5000/api/health
```

Respuesta esperada:
```json
{
  "status": "Backend funcionando correctamente"
}
```

### 3. Registrar un usuario de prueba:
```bash
curl -X POST http://localhost:5000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@ejemplo.com",
    "password": "password123",
    "nombre": "Juan",
    "apellido": "Pérez"
  }'
```

Respuesta esperada (con token JWT):
```json
{
  "mensaje": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "email": "cliente@ejemplo.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "tipo_perfil": "cliente"
  }
}
```

### 4. Hacer login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@ejemplo.com",
    "password": "password123"
  }'
```

### 5. Obtener perfil (con token):
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

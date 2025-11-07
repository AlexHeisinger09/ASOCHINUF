# ASOCHINUF - Database Schema Documentation

**Last Updated:** 2025-11-07
**Database:** PostgreSQL (Neon Serverless)
**Status:** ✅ Production Ready

---

## Table of Contents
1. [Database Overview](#database-overview)
2. [Complete Schema](#complete-schema)
3. [Table Details](#table-details)
4. [Critical Information](#critical-information)
5. [Data Initialization](#data-initialization)

---

## Database Overview

### Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@host/dbname
```

### Connection Details
- **Client:** Neon Serverless (@neondatabase/serverless)
- **Node.js Version:** 22+
- **Port:** 5432 (standard PostgreSQL)

---

## Complete Schema

### Dependency Graph
```
t_usuarios
├── t_clientes
├── t_nutricionistas
├── t_recovery_tokens
├── t_planteles
├── t_sesion_mediciones
│   └── t_informe_antropometrico
└── t_pacientes

t_cursos
└── t_inscripciones

t_categorias
└── t_sesion_mediciones

t_excel_uploads
└── t_sesion_mediciones
```

---

## Table Details

### 1. t_usuarios
**Purpose:** System users (admin, nutricionista, cliente)

```sql
CREATE TABLE t_usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  tipo_perfil VARCHAR(20) NOT NULL CHECK (tipo_perfil IN ('admin', 'nutricionista', 'cliente')),
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (id) REFERENCES t_clientes(usuario_id) ON DELETE CASCADE,
  FOREIGN KEY (id) REFERENCES t_nutricionistas(usuario_id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_usuarios_email` (email)
- `idx_usuarios_tipo_perfil` (tipo_perfil)

**Notes:**
- Password must be hashed with bcryptjs
- Email is unique per user
- tipo_perfil determines access level

---

### 2. t_pacientes
**Purpose:** Football players/patients (separate from system users)

```sql
CREATE TABLE t_pacientes (
  id SERIAL PRIMARY KEY,
  cedula VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE,
  telefono VARCHAR(20),
  email VARCHAR(150),
  genero VARCHAR(10),
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- `idx_pacientes_cedula` (cedula)
- `idx_pacientes_nombre` (nombre)

**Notes:**
- Separate entity from system users
- Used for anthropometric data tracking
- cedula is unique (Chilean ID)

---

### 3. t_clientes
**Purpose:** Relationship between users and client profiles

```sql
CREATE TABLE t_clientes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL UNIQUE,
  especialidad VARCHAR(100),
  organizacion VARCHAR(150),
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE
);
```

**Notes:**
- Links sistema users to client data
- One-to-one relationship with users

---

### 4. t_nutricionistas
**Purpose:** Nutritionist profiles and specialization

```sql
CREATE TABLE t_nutricionistas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL UNIQUE,
  especialidad VARCHAR(100),
  licencia VARCHAR(100),
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_nutricionistas_usuario_id` (usuario_id)

**Notes:**
- Links system users to nutritionist data
- One-to-one relationship with users

---

### 5. t_cursos
**Purpose:** Course catalog for training

```sql
CREATE TABLE t_cursos (
  id_curso SERIAL PRIMARY KEY,
  codigo_curso VARCHAR(100) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria_id INTEGER,
  nivel VARCHAR(50),
  duracion_horas INTEGER,
  modalidad VARCHAR(50),
  fecha_inicio DATE,
  fecha_fin DATE,
  precio DECIMAL(10, 2) DEFAULT 0,
  descuento DECIMAL(5, 2) DEFAULT 0,
  precio_final DECIMAL(10, 2),
  moneda VARCHAR(10) DEFAULT 'CLP',
  nombre_instructor VARCHAR(255),
  imagen_portada VARCHAR(255),
  video_promocional VARCHAR(255),
  materiales TEXT,
  url_curso VARCHAR(255),
  estado VARCHAR(50) DEFAULT 'activo',
  fecha_creacion TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- `idx_cursos_codigo` (codigo_curso)
- `idx_cursos_estado` (estado)
- `idx_cursos_categoria_id` (categoria_id)

**Critical Notes:**
- PRIMARY KEY is `id_curso` (NOT `id`)
- `codigo_curso` must be UNIQUE
- Used in t_inscripciones foreign key: REFERENCES t_cursos(id_curso)

---

### 6. t_inscripciones
**Purpose:** Course enrollments

```sql
CREATE TABLE t_inscripciones (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  id_curso INTEGER NOT NULL,
  fecha_inscripcion TIMESTAMP DEFAULT NOW(),
  estado VARCHAR(50) DEFAULT 'activa',
  FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (id_curso) REFERENCES t_cursos(id_curso) ON DELETE CASCADE,
  UNIQUE(usuario_id, id_curso)
);
```

**Indexes:**
- `idx_inscripciones_usuario_id` (usuario_id)
- `idx_inscripciones_curso` (id_curso)

**Critical Notes:**
- Foreign key references t_cursos(id_curso) NOT t_cursos(id)
- UNIQUE constraint prevents duplicate enrollments

---

### 7. t_categorias
**Purpose:** Course categories

```sql
CREATE TABLE t_categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  orden INTEGER,
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);
```

**Notes:**
- One-to-many relationship with t_cursos

---

### 8. t_planteles
**Purpose:** Football teams/squads

```sql
CREATE TABLE t_planteles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  division VARCHAR(50) NOT NULL CHECK (division IN ('Primera Division', 'Primera B', 'Segunda División', 'Tercera División A')),
  ciudad VARCHAR(100) NOT NULL,
  region VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  usuario_creacion INTEGER REFERENCES t_usuarios(id) ON DELETE SET NULL
);
```

**Indexes:**
- `idx_planteles_nombre` (nombre)
- `idx_planteles_activo` (activo)
- `idx_planteles_division` (division)
- `idx_planteles_region` (region)

**Current Divisions (Valid Check Constraint):**
- `Primera Division` (16 teams) 🥇
- `Primera B` (14 teams) 🥈
- `Segunda División` (14 teams) 🥉
- `Tercera División A` (0 teams) ⚽

**Current Teams Distribution:**
```
Primera Division (16):
- Audax Italiano, Cobresal, Colo-Colo, Coquimbo Unido, Cobreloa,
  Deportes Copiapó, Everton, Huachipato, Ñublense, O'Higgins,
  Palestino, Unión Española, Unión La Calera, Universidad Católica,
  Universidad de Chile, Deportes Iquique

Primera B (14):
- Barnechea, Club de Deportes Magallanes, Curicó Unido,
  Deportes Antofagasta, Deportes Recoleta, Deportes Santa Cruz,
  Deportes Temuco, Rangers de Talca, San Luis de Quillota,
  San Marcos de Arica, Santiago Morning, Santiago Wanderers,
  Universidad de Concepción, Unión San Felipe

Segunda División (14):
- Brujas de Salamanca, Concón National, Deportes Concepción,
  Deportes Linares, Deportes Melipilla, Deportes Puerto Montt,
  Deportes Rengo, General Velásquez, Provincial Osorno, Provincial Ovalle,
  Real San Joaquín, San Antonio Unido, Santiago City, Trasandino
```

**Critical Notes:**
- `nombre` is UNIQUE (no duplicate team names)
- `division` uses CHECK constraint - value MUST be one of the 4 options
- If you change division names, update CHECK constraint AND all references
- No teams in Tercera División A yet (can be added via form)

---

### 9. t_sesion_mediciones
**Purpose:** Measurement sessions metadata

```sql
CREATE TABLE t_sesion_mediciones (
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
```

**Indexes:**
- `idx_sesion_plantel` (plantel_id)
- `idx_sesion_categoria` (categoria_id)
- `idx_sesion_fecha` (fecha_sesion)
- `idx_sesion_nutricionista` (nutricionista_id)

**Notes:**
- UNIQUE constraint prevents duplicate session uploads
- archivo_hash (SHA-256) used for duplicate detection
- DELETE RESTRICT on plantel_id (can't delete planteles with active sessions)

---

### 10. t_informe_antropometrico ⭐ **CRITICAL TABLE**
**Purpose:** Anthropometric measurements for patients

```sql
CREATE TABLE t_informe_antropometrico (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER NOT NULL,
  fecha_medicion DATE NOT NULL,
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
```

**Indexes:**
- `idx_informe_paciente_id` (paciente_id)
- `idx_informe_sesion_id` (sesion_id)
- `idx_informe_nutricionista_id` (nutricionista_id)
- `idx_informe_paciente_sesion` (paciente_id, sesion_id) - **COMPOSITE**
- `idx_informe_fecha_medicion` (fecha_medicion) - **CRITICAL FOR QUERIES**
- `idx_informe_fecha_registro` (fecha_registro)

**⭐ CRITICAL NOTES:**
1. **Column Order (DO NOT CHANGE):**
   - id
   - paciente_id
   - **fecha_medicion** ← This column MUST come after paciente_id
   - sesion_id
   - nutricionista_id
   - fecha_registro
   - All measurement columns...

2. **fecha_medicion Field:**
   - Type: DATE NOT NULL
   - Stores the actual measurement date (different from fecha_registro which is system timestamp)
   - Used for longitudinal data tracking (same patient measured multiple times)
   - MUST have index idx_informe_fecha_medicion

3. **Data Preservation:**
   - When recreating this table in init-db.js, DROP TABLE CASCADE MUST execute BEFORE CREATE
   - All 30+ measurement columns must be included
   - DO NOT add or remove columns without updating excelParser.js columnMap

4. **Longitudinal Support:**
   - Same paciente_id can have multiple rows (different measurement dates)
   - No UNIQUE constraint on paciente_id (allows multiple measurements)
   - Composite index on (paciente_id, sesion_id) prevents duplicates per session

---

### 11. t_excel_uploads
**Purpose:** Track Excel file uploads

```sql
CREATE TABLE t_excel_uploads (
  id SERIAL PRIMARY KEY,
  sesion_id INTEGER NOT NULL,
  nutricionista_id INTEGER NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  hash_archivo VARCHAR(64) NOT NULL,
  cantidad_registros INTEGER DEFAULT 0,
  fecha_carga TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (sesion_id) REFERENCES t_sesion_mediciones(id) ON DELETE CASCADE,
  FOREIGN KEY (nutricionista_id) REFERENCES t_usuarios(id) ON DELETE SET NULL
);
```

**Indexes:**
- `idx_excel_sesion_id` (sesion_id)
- `idx_excel_nutricionista_id` (nutricionista_id)
- `idx_excel_hash` (hash_archivo)

---

### 12. t_recovery_tokens
**Purpose:** Password reset tokens

```sql
CREATE TABLE t_recovery_tokens (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expira_en TIMESTAMP NOT NULL,
  creado_en TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE
);
```

**Notes:**
- Tokens expire automatically (check expira_en in queries)
- One token per reset attempt

---

## Critical Information

### ⚠️ DO NOT BREAK THESE THINGS

1. **t_cursos Primary Key**
   - ❌ WRONG: `id SERIAL PRIMARY KEY`
   - ✅ CORRECT: `id_curso SERIAL PRIMARY KEY`
   - Impact: t_inscripciones foreign key won't work

2. **t_informe_antropometrico Column Order**
   - ❌ WRONG: Moving fecha_medicion to different position
   - ✅ CORRECT: Keep after paciente_id (position 3)
   - Impact: Data structure consistency, Excel parser mapping

3. **t_planteles Division CHECK Constraint**
   - ❌ WRONG: `CHECK (division IN ('...')` with old division names
   - ✅ CORRECT: Must match exactly:
     ```sql
     CHECK (division IN ('Primera Division', 'Primera B', 'Segunda División', 'Tercera División A'))
     ```
   - Impact: All division-related queries and UI will fail

4. **Unique Constraints**
   - t_usuarios.email - UNIQUE
   - t_pacientes.cedula - UNIQUE
   - t_cursos.codigo_curso - UNIQUE
   - t_planteles.nombre - UNIQUE
   - t_sesion_mediciones (plantel_id, categoria_id, fecha_sesion, archivo_hash) - UNIQUE
   - Impact: Data integrity, duplicate prevention

5. **Foreign Key Relationships**
   - ❌ WRONG: Changing table names without updating foreign keys
   - ✅ CORRECT: Always test foreign key constraints after schema changes
   - Impact: Data orphaning, referential integrity

### 🔄 When Modifying Schema

**Never:**
1. ❌ Drop tables without backing up data
2. ❌ Change column names without updating application code
3. ❌ Change CHECK constraints without updating UI validations
4. ❌ Remove or reorder columns from t_informe_antropometrico
5. ❌ Change primary keys

**Always:**
1. ✅ Update init-db.js with new schema
2. ✅ Update backend controllers with new/changed columns
3. ✅ Update frontend forms with new/changed fields
4. ✅ Update excelParser.js columnMap if adding measurement fields
5. ✅ Document changes in this file
6. ✅ Test foreign key relationships after changes
7. ✅ Verify all indexes are created
8. ✅ Test full data flow (Excel upload → DB → UI display)

---

## Data Initialization

### Initialization Script
**Location:** `backend/scripts/init-db.js`

**What it does:**
1. Creates all 12 tables in correct dependency order
2. Creates all indexes for performance
3. Inserts initial data:
   - 16 teams in Primera Division
   - 14 teams in Primera B
   - 14 teams in Segunda División
   - 0 teams in Tercera División A (add via UI)

**How to run:**
```bash
cd backend
npm run db:init
```

**Important:**
- Script includes DROP TABLE IF EXISTS CASCADE to ensure clean initialization
- Takes ~5-10 seconds to complete
- Safe to run multiple times (idempotent)

### Initial Data

**Teams (44 total):**
- All teams have ciudad (city) and region (Chilean region) assigned
- All teams are marked activo = true by default
- No usuario_creacion for seeded teams

**Sample Teams:**
```
Audax Italiano       | Primera Division | Santiago (La Florida) | Región Metropolitana
Barnechea            | Primera B        | Santiago              | Región Metropolitana
Deportes Puerto Mont | Segunda División | Puerto Montt          | Región de Los Lagos
```

---

## Troubleshooting

### Problem: "duplicate key value violates unique constraint"
**Solution:** Check for duplicate values in UNIQUE fields (email, cedula, codigo_curso, nombre)

### Problem: "violates foreign key constraint"
**Solution:** Ensure referenced record exists in parent table before inserting

### Problem: "new row for relation violates check constraint"
**Solution:** For t_planteles, ensure division is EXACTLY one of: `Primera Division`, `Primera B`, `Segunda División`, `Tercera División A`

### Problem: "column does not exist"
**Solution:** Check init-db.js has correct column names and excelParser.js matches

---

## Version History

| Date | Change | Impact |
|------|--------|--------|
| 2025-11-07 | Added fecha_medicion to t_informe_antropometrico | Allows tracking measurement dates separately from system timestamps |
| 2025-11-07 | Updated division names (4 divisions) | UI and database validation updated |
| 2025-11-07 | Added ciudad & region to t_planteles | Teams now have geographic metadata |
| Previous | Initial schema | Foundation tables created |

---

**Last Reviewed:** 2025-11-07
**Next Review:** When making schema changes
**Maintainer:** Development Team

# Backend ASOCHINUF

Sistema de autenticación y gestión de usuarios para ASOCHINUF.

## Requisitos

- Node.js 14+
- PostgreSQL 12+
- npm o yarn

## Instalación

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar PostgreSQL

#### Opción A: PostgreSQL local
1. Instala PostgreSQL si no lo tienes
2. Crea una base de datos:
```sql
CREATE DATABASE asochinuf;
```

3. Copia el archivo `.env.example` a `.env` y actualiza las credenciales:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=asochinuf
```

#### Opción B: PostgreSQL en Render (Producción)
1. Crea una instancia PostgreSQL en Render
2. Copia la URL de conexión y actualiza `.env`:
```
DATABASE_URL=postgresql://user:password@host:port/dbname
```

### 3. Inicializar base de datos
```bash
npm run db:init
```

Esto creará las siguientes tablas:
- `t_usuarios` - Usuarios del sistema
- `t_clientes` - Datos de clientes
- `t_nutricionistas` - Datos de nutricionistas
- `t_cursos` - Catálogo de cursos
- `t_inscripciones` - Inscripciones de usuarios a cursos
- `t_datos_antropologicos` - Medidas antropológicas de clientes
- `t_excel_uploads` - Registro de cargas de Excel

### 4. Iniciar servidor de desarrollo
```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:5000`

## Endpoints API

### Autenticación
- `POST /api/auth/registro` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener datos del usuario actual (requiere token)

## Variables de Entorno

```
DB_HOST=localhost              # Host PostgreSQL
DB_PORT=5432                   # Puerto PostgreSQL
DB_USER=postgres               # Usuario PostgreSQL
DB_PASSWORD=postgres           # Contraseña PostgreSQL
DB_NAME=asochinuf             # Nombre de la BD
JWT_SECRET=tu_secreto_seguro  # Secreto para JWT
JWT_EXPIRE=7d                 # Expiración del token
PORT=5000                     # Puerto del servidor
NODE_ENV=development          # Ambiente (development/production)
FRONTEND_URL=http://localhost:3000  # URL del frontend
```

## Estructura de directorios

```
backend/
├── config/
│   └── database.js           # Configuración de PostgreSQL
├── middleware/
│   └── auth.js              # Middleware de autenticación JWT
├── controllers/
│   └── authController.js    # Lógica de autenticación
├── routes/
│   └── auth.js              # Rutas de autenticación
├── scripts/
│   └── init-db.js           # Script para inicializar BD
├── server.js                # Servidor principal
├── package.json
├── .env                     # Variables de entorno (no comitear)
└── README.md
```

## Desarrollo

### Instalar nuevas dependencias
```bash
npm install nombre-del-paquete
```

### Ejecutar en modo desarrollo con hot reload
```bash
npm run dev
```

### Health check
```bash
curl http://localhost:5000/api/health
```

## Ejemplo de uso

### Registro
```bash
curl -X POST http://localhost:5000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123",
    "nombre": "Juan",
    "apellido": "Pérez"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
  }'
```

### Obtener perfil (requiere token)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Desplegar en Render

1. Conecta tu repositorio GitHub a Render
2. Crea un nuevo servicio Node.js
3. Configura las variables de entorno en Render
4. La BD PostgreSQL debe estar en Render también
5. El servidor se desplegará automáticamente en cada push

## Licencia

ISC

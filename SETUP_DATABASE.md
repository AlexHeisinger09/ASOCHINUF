# Setup de Base de Datos - ASOCHINUF

## Opción 1: Crear tablas en Render (Recomendado)

Usa el comando psql que te proporcionó Render para conectarte a la BD y ejecuta el archivo SQL:

```bash
PGPASSWORD=5lJiLnmI2iG5Tk7aqVddDUbvFRBFAFHq psql -h dpg-d44ae9emcj7s73c35ckg-a.oregon-postgres.render.com -U nutri asochinuf -f backend/scripts/schema.sql
```

### Si estás en Windows PowerShell:
```powershell
$env:PGPASSWORD="5lJiLnmI2iG5Tk7aqVddDUbvFRBFAFHq"
psql -h dpg-d44ae9emcj7s73c35ckg-a.oregon-postgres.render.com -U nutri asochinuf -f "backend/scripts/schema.sql"
```

### Si estás en Windows CMD:
```cmd
set PGPASSWORD=5lJiLnmI2iG5Tk7aqVddDUbvFRBFAFHq
psql -h dpg-d44ae9emcj7s73c35ckg-a.oregon-postgres.render.com -U nutri asochinuf -f "backend/scripts/schema.sql"
```

## Opción 2: Usar pgAdmin Web (Interfaz gráfica)

1. Ve a https://www.pgadmin.org/
2. O usa cualquier cliente PostgreSQL online
3. Copia el contenido de `backend/scripts/schema.sql`
4. Ejecuta en el Query Tool

## Opción 3: Desde la consola de Render

1. Ve a tu instancia PostgreSQL en Render
2. Abre la console o query tool
3. Copia y pega el contenido de `backend/scripts/schema.sql`
4. Ejecuta

## Verificar que se crearon las tablas

```bash
PGPASSWORD=5lJiLnmI2iG5Tk7aqVddDUbvFRBFAFHq psql -h dpg-d44ae9emcj7s73c35ckg-a.oregon-postgres.render.com -U nutri asochinuf -c "\dt"
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

1. Iniciar el backend local:
```bash
cd backend
npm run dev
```

2. El servidor estará en `http://localhost:5000`

3. Probar el endpoint de salud:
```bash
curl http://localhost:5000/api/health
```

4. Registrar un usuario de prueba:
```bash
curl -X POST http://localhost:5000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "password123",
    "nombre": "Juan",
    "apellido": "Pérez"
  }'
```

5. Hacer login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "password123"
  }'
```

# Guía de Instalación - Sistema de Gestión de Cuotas

## Paso 1: Instalar Dependencias del Backend

```bash
cd backend
npm install
```

**Estado:** ✅ Completado

### Paquetes instalados:
- `axios` - Para llamadas HTTP a Mercado Pago API
- Todas las dependencias existentes + nuevas

## Paso 2: Configurar Variables de Entorno

Crear archivo `.env` en la carpeta `backend/`:

```env
# Database
DATABASE_URL=postgresql://user:pass@host/dbname

# Server
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5001

# JWT
JWT_SECRET=tu_secret_key_aqui
JWT_EXPIRE=7d

# Mercado Pago (OPCIONAL - funciona en modo test sin esto)
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-XXXXXXXXX
MERCADO_PAGO_PUBLIC_KEY=APP_USR-XXXXXXXXX

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password
```

**Notas:**
- `MERCADO_PAGO_ACCESS_TOKEN` es opcional. En desarrollo sin este token, funcionará en modo test
- Para producción, obtener credenciales reales de Mercado Pago

## Paso 3: Inicializar Base de Datos

```bash
cd backend
npm run db:init
```

Este comando:
1. ✅ Crea tabla `t_cuotas_mensuales`
2. ✅ Crea tabla `t_pagos_cuotas`
3. ✅ Crea índices para optimización
4. ✅ Crea todas las tablas del sistema

**Salida esperada:**
```
✓ Tabla t_cuotas_mensuales creada
✓ Tabla t_pagos_cuotas creada
✓ BASE DE DATOS INICIALIZADA CORRECTAMENTE
```

## Paso 4: Iniciar Backend

```bash
cd backend
npm run dev
```

**Salida esperada:**
```
✓ Conexión a PostgreSQL exitosa
✓ Servidor ejecutándose en puerto 5001
✓ Health check: http://localhost:5001/api/health
```

## Paso 5: Instalar Dependencias del Frontend

```bash
cd frontend
yarn install
```

## Paso 6: Iniciar Frontend

```bash
cd frontend
yarn start
```

**Acceso:** http://localhost:3000

## Verificar Instalación

### 1. Verificar Base de Datos

Conectarse a PostgreSQL y ejecutar:

```sql
-- Verificar tablas
\dt t_cuotas_mensuales
\dt t_pagos_cuotas

-- Ver columnas
\d t_cuotas_mensuales
\d t_pagos_cuotas
```

### 2. Verificar Backend

```bash
curl http://localhost:5001/api/health
```

**Respuesta esperada:**
```json
{"status": "Backend funcionando correctamente"}
```

### 3. Verificar Frontend

Abrir navegador: http://localhost:3000

- ✅ Dashboard debe cargar
- ✅ Menú "Cuotas y Pagos" visible
- ✅ Badge de notificación en header

## Crear Usuario de Prueba

### Para testing, crear un nutricionista:

1. Registrarse en el sistema
2. Cambiar tipo de perfil en BD (query):

```sql
UPDATE t_usuarios
SET tipo_perfil = 'nutricionista'
WHERE email = 'tu_email@example.com';
```

### Para admin:

```sql
UPDATE t_usuarios
SET tipo_perfil = 'admin'
WHERE email = 'tu_email@example.com';
```

## Testing del Sistema

### 1. Crear Cuota (Como Admin)

1. Login como admin
2. Ir a "Cuotas y Pagos"
3. Click "Nueva Cuota"
4. Llenar formulario:
   - Usuario: [seleccionar nutricionista]
   - Mes: 11
   - Año: 2024
   - Monto: 50000
   - Vencimiento: 20/11/2024
5. Click "Crear Cuota"

**Esperado:** Cuota aparece en tabla

### 2. Pagar Cuota (Como Nutricionista)

1. Login como nutricionista
2. Ir a "Cuotas y Pagos"
3. Click "Pagar" en cuota pendiente
4. Opción 1 - Mercado Pago:
   - Redirige a Mercado Pago (test si no hay token)
5. Opción 2 - Transferencia:
   - Ingresar referencia: "0012345678-2024"
   - Click "Confirmar Pago"

**Esperado:** Cuota marcada como pagada

### 3. Verificar Notificación

1. Si hay cuotas vencidas
2. Badge rojo en header
3. Click en badge
4. Popup muestra cuotas vencidas

## Integración con Mercado Pago (Opcional)

### Para testing en Sandbox:

1. Crear cuenta en [https://developer.mercadopago.com](https://developer.mercadopago.com)
2. Obtener credenciales de sandbox
3. Agregar a `.env`:
   ```env
   MERCADO_PAGO_ACCESS_TOKEN=APP_USR-YOUR_SANDBOX_TOKEN
   ```
4. Usar tarjetas de prueba:
   - Visa: 4111111111111111 (CVV: 123, exp: 12/25)
   - Mastercard: 5555555555554444 (CVV: 123, exp: 12/25)

### Para Producción:

1. Cambiar credenciales a las reales
2. Cambiar URLs en FRONTEND_URL y BACKEND_URL
3. Verificar HTTPS en webhook

## Solución de Problemas

### Error: "404 Not Found - @mercadopago/sdk-nodejs"

✅ **Resuelto** - Se cambió a usar `axios` en lugar del SDK

### Error: "Cannot find module 'axios'"

```bash
cd backend
npm install axios
```

### Error: "Database connection failed"

Verificar:
1. PostgreSQL está corriendo
2. DATABASE_URL es correcto
3. Credenciales de BD son válidas

```bash
# Probar conexión
psql postgresql://user:pass@host/dbname
```

### Error: "Port 5001 already in use"

```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5001 | xargs kill -9
```

### Error: "Port 3000 already in use"

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

## Estructura de Carpetas Creadas

```
backend/
├── controllers/
│   ├── cuotasController.js (NUEVO)
│   └── pagosController.js (NUEVO)
├── routes/
│   ├── cuotas.js (NUEVO)
│   └── pagos.js (NUEVO)
├── services/
│   └── mercadoPagoService.js (NUEVO)
├── scripts/
│   └── init-db.js (MODIFICADO)
└── package.json (MODIFICADO)

frontend/
├── src/
│   ├── pages/
│   │   └── CuotasSection/ (NUEVA)
│   │       ├── CuotasSection.jsx
│   │       ├── AdminCuotasTable.jsx
│   │       ├── NutricionistaCuotasTable.jsx
│   │       ├── PaymentModal.jsx
│   │       └── CreateCuotaModal.jsx
│   ├── components/
│   │   └── CuotasNotification.jsx (NUEVO)
│   └── config/
│       └── apiConfig.js (MODIFICADO)
```

## Endpoints Disponibles

### Cuotas
```
GET    /api/cuotas                          - Obtener cuotas
GET    /api/cuotas/resumen                  - Resumen para notificaciones
GET    /api/cuotas/estadisticas/general     - Estadísticas (admin)
GET    /api/cuotas/:id                      - Obtener cuota
GET    /api/cuotas/:cuotaId/pagos           - Historial de pagos
POST   /api/cuotas                          - Crear cuota
POST   /api/cuotas/:cuotaId/pagos           - Registrar pago
```

### Pagos
```
POST   /api/payments/iniciar                - Iniciar pago Mercado Pago
GET    /api/payments/estado/:cuotaId        - Estado de pago
POST   /api/payments/webhook                - Webhook Mercado Pago
```

## Próximos Pasos

1. ✅ Instalar dependencias
2. ✅ Configurar .env
3. ✅ Inicializar BD
4. ✅ Iniciar servidor
5. → Crear cuotas de prueba
6. → Probar pagos
7. → Configurar Mercado Pago (opcional)

## Support

Para más detalles, ver:
- `CUOTAS_SETUP.md` - Documentación técnica
- `CUOTAS_RESUMEN_IMPLEMENTACION.md` - Resumen de implementación

---

**Fecha:** Noviembre 2024
**Status:** ✅ LISTO PARA USAR

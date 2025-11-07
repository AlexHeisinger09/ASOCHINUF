# Sistema de Gestión de Cuotas - Documentación

## Descripción General

Sistema completo de gestión de cuotas mensuales para nutricionistas y administradores de ASOCHINUF. Incluye:

- **Tabla de cuotas** con check list de pagos
- **Pagos automáticos** vía Mercado Pago y transferencias manuales
- **Notificaciones** de morosidad en el header
- **Dashboard admin** con estadísticas y gestión de cuotas
- **Dashboard nutricionista** con gestión personal de pagos

## Base de Datos

### Nuevas Tablas

#### 1. `t_cuotas_mensuales`
Almacena las cuotas mensuales para cada usuario (nutricionista/admin).

```sql
CREATE TABLE t_cuotas_mensuales (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente',
  fecha_vencimiento DATE NOT NULL,
  descripcion TEXT,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE,
  UNIQUE(usuario_id, mes, ano)
);
```

**Estados disponibles:**
- `pendiente`: Cuota sin pagar
- `pagado`: Cuota pagada
- `vencido`: Cuota no pagada después del vencimiento
- `cancelado`: Cuota cancelada/anulada

#### 2. `t_pagos_cuotas`
Registra todos los intentos y pagos realizados para cada cuota.

```sql
CREATE TABLE t_pagos_cuotas (
  id SERIAL PRIMARY KEY,
  cuota_id INTEGER NOT NULL,
  usuario_id INTEGER NOT NULL,
  monto_pagado DECIMAL(10, 2) NOT NULL,
  metodo_pago VARCHAR(50) DEFAULT 'mercado_pago',
  referencia_pago VARCHAR(255) UNIQUE,
  estado_pago VARCHAR(50) DEFAULT 'pendiente',
  id_mercado_pago VARCHAR(255),
  estado_mercado_pago VARCHAR(50),
  fecha_pago TIMESTAMP,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  notas TEXT,
  FOREIGN KEY (cuota_id) REFERENCES t_cuotas_mensuales(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE
);
```

**Métodos de pago soportados:**
- `mercado_pago`: Integración con Mercado Pago
- `transferencia`: Transferencia bancaria manual
- `efectivo`: Pago en efectivo

## Backend

### Instalación de Dependencias

```bash
cd backend
npm install
```

### Variables de Entorno

Agregar a `.env`:

```env
# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=tu_token_de_acceso_mercado_pago
MERCADO_PAGO_PUBLIC_KEY=tu_clave_publica_mercado_pago

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5001
```

### Endpoints de API

#### Obtener Cuotas
```
GET /api/cuotas
Authorization: Bearer {token}
```
- Admin: retorna cuotas de todos los nutricionistas y admins
- Nutricionista: retorna solo sus cuotas

#### Crear Cuota (Admin)
```
POST /api/cuotas
Authorization: Bearer {token}
Content-Type: application/json

{
  "usuarioId": 2,
  "mes": 11,
  "ano": 2024,
  "monto": 50000,
  "fechaVencimiento": "2024-11-20",
  "descripcion": "Cuota mensual noviembre"
}
```

#### Obtener Resumen de Cuotas
```
GET /api/cuotas/resumen
Authorization: Bearer {token}
```

Retorna:
```json
{
  "totalPendientes": 2,
  "totalVencidas": 1,
  "esMoroso": true,
  "cuotasMorosas": [...],
  "proximasAVencer": [...]
}
```

#### Obtener Estadísticas (Admin)
```
GET /api/cuotas/estadisticas/general
Authorization: Bearer {token}
```

#### Iniciar Pago (Mercado Pago)
```
POST /api/payments/iniciar
Authorization: Bearer {token}
Content-Type: application/json

{
  "cuotaId": 1
}
```

Retorna:
```json
{
  "message": "Preferencia de pago creada",
  "data": {
    "init_point": "https://mercadopago.com.ar/checkout/...",
    "sandbox_init_point": "https://sandbox.mercadopago.com.ar/checkout/...",
    "cuotaId": 1,
    "montoTotal": 50000
  }
}
```

#### Registrar Pago Manual
```
POST /api/cuotas/{cuotaId}/pagos
Authorization: Bearer {token}
Content-Type: application/json

{
  "montoPagado": 50000,
  "metodoPago": "transferencia",
  "referenciaPago": "0012345678-2024"
}
```

#### Webhook de Mercado Pago
```
POST /api/payments/webhook
Content-Type: application/json

{
  "action": "payment.created",
  "type": "payment",
  "data": {
    "id": "payment_id"
  }
}
```

### Controladores

#### `cuotasController.js`
- `obtenerCuotas()` - Obtener cuotas del usuario
- `crearCuota()` - Crear/actualizar cuota (admin)
- `obtenerResumenCuotas()` - Resumen para notificaciones
- `obtenerCuotaById()` - Obtener una cuota específica
- `registrarPagoCuota()` - Registrar pago manual
- `obtenerPagosCuota()` - Historial de pagos
- `obtenerEstadisticas()` - Estadísticas generales (admin)

#### `pagosController.js`
- `iniciarPagoCuota()` - Iniciar pago con Mercado Pago
- `webhookMercadoPago()` - Procesar webhooks de Mercado Pago
- `obtenerEstadoPago()` - Verificar estado de pago

#### `mercadoPagoService.js`
- `crearPreferenciaPago()` - Crear preferencia de pago
- `verificarEstadoPago()` - Verificar estado de pago

## Frontend

### Instalación de Dependencias

```bash
cd frontend
yarn install
```

### Componentes Nuevos

#### `CuotasSection.jsx`
Componente principal que organiza la vista según el tipo de usuario:
- **Admin**: Tabla de gestión de todas las cuotas
- **Nutricionista**: Tabla personal con pagos

```javascript
import CuotasSection from '@/pages/CuotasSection/CuotasSection';
```

#### `AdminCuotasTable.jsx`
Tabla con filtros para administradores:
- Filtro por mes, año, estado, usuario
- Botón para crear nuevas cuotas
- Acciones: Ver detalles, Editar

#### `NutricionistaCuotasTable.jsx`
Tabla personal para nutricionistas:
- Separación entre cuotas pendientes y pagadas
- Botón "Pagar" para cuotas pendientes
- Historial de pagos realizados

#### `PaymentModal.jsx`
Modal para realizar pagos:
- Opción 1: Mercado Pago
- Opción 2: Transferencia/Efectivo (manual)
- Validación de datos
- Confirmación de pago

#### `CreateCuotaModal.jsx`
Modal para crear nuevas cuotas (admin):
- Selección de usuario
- Mes, año, monto
- Fecha de vencimiento
- Descripción opcional

#### `CuotasNotification.jsx`
Componente de notificación en header:
- Badge con número de cuotas pendientes
- Icono parpadeante si hay morosidad
- Popup con detalles de cuotas vencidas
- Próximas a vencer
- Botón rápido para ir a la sección

### Configuración de API

Los endpoints están centralizados en `config/apiConfig.js`:

```javascript
CUOTAS: {
  GET_ALL: `${API_URL}/api/cuotas`,
  GET_RESUMEN: `${API_URL}/api/cuotas/resumen`,
  GET_ONE: (id) => `${API_URL}/api/cuotas/${id}`,
  GET_PAGOS: (cuotaId) => `${API_URL}/api/cuotas/${cuotaId}/pagos`,
  CREATE: `${API_URL}/api/cuotas`,
  REGISTRAR_PAGO: (cuotaId) => `${API_URL}/api/cuotas/${cuotaId}/pagos`,
  ESTADISTICAS: `${API_URL}/api/cuotas/estadisticas/general`,
},
PAYMENTS: {
  INICIAR_PAGO: `${API_URL}/api/payments/iniciar`,
  ESTADO_PAGO: (cuotaId) => `${API_URL}/api/payments/estado/${cuotaId}`,
  WEBHOOK: `${API_URL}/api/payments/webhook`,
},
```

## Integración con Mercado Pago

### Configuración

1. Crear cuenta en [Mercado Pago](https://www.mercadopago.com.ar)
2. Obtener credenciales:
   - Access Token
   - Public Key
3. Agregar a `.env` del backend

### Flujo de Pago

1. Usuario hace click en "Pagar"
2. Frontend llama a `POST /api/payments/iniciar`
3. Backend crea preferencia de pago
4. Usuario redirigido a Mercado Pago
5. Usuario realiza pago
6. Mercado Pago envía webhook
7. Backend procesa pago y actualiza cuota

### Testing

Para testing en sandbox de Mercado Pago:
- Usar credenciales de sandbox
- Usar tarjetas de prueba provided por Mercado Pago

## Rutas en el Dashboard

### Menú Sidebar

Para nutricionistas y admins:
```
Cuotas y Pagos (id: 'cuotas')
```

El menú se agregó automáticamente al sidebar en `Sidebar.jsx`

### Navegación

```javascript
// Para ir a la sección de cuotas
setActiveTab('cuotas');

// Desde notificación
<CuotasNotification setActiveTab={setActiveTab} />
```

## Flujo de Uso

### Para Administrador

1. Acceder a "Cuotas y Pagos"
2. Ver tabla con todas las cuotas
3. Crear nuevas cuotas con "Nueva Cuota"
4. Filtrar por mes, año, estado, usuario
5. Ver estadísticas generales
6. Seguimiento de usuarios con morosidad

### Para Nutricionista

1. Acceder a "Cuotas y Pagos"
2. Ver sus cuotas pendientes y pagadas
3. Hacer click en "Pagar" en una cuota pendiente
4. Elegir método:
   - Mercado Pago (tarjeta, transferencia, etc)
   - Transferencia bancaria (manual)
5. Completar pago
6. Recibir notificación de éxito

## Estados de Transacción

### Cuota
- **pendiente**: No vencida, sin pagar
- **vencido**: Pasó fecha de vencimiento sin pago
- **pagado**: Pagada completamente
- **cancelado**: Anulada (por admin)

### Pago
- **pendiente**: En proceso
- **completado**: Éxito
- **rechazado**: Fallido
- **cancelado**: Cancelado por usuario

## Seguridad

- ✅ JWT Authentication en todos los endpoints
- ✅ Validación de permisos (admin/nutricionista)
- ✅ Validación de datos en backend
- ✅ HTTPS recomendado para Mercado Pago
- ✅ Hash de archivos para evitar duplicados

## Notas Importantes

1. **Mercado Pago**: Para producción, cambiar tokens a credenciales reales
2. **Webhook URL**: Debe ser accesible publicamente. Para testing local usar ngrok
3. **Vencimiento**: El sistema marca automáticamente cuotas como "vencido" si pasó la fecha
4. **Duplicados**: No se pueden crear dos cuotas para el mismo usuario, mes y año
5. **Auditoría**: Todos los pagos quedan registrados en `t_pagos_cuotas`

## Próximas Mejoras Sugeridas

1. Integración con email para notificaciones
2. Recordatorio automático de pagos pendientes
3. Reporte PDF de cuotas
4. Descargo de pagos realizados
5. Acuerdos de pago para morosos
6. Configuración de monto de cuota por usuario
7. Histórico de cambios en cuotas

## Support

Para reportar bugs o solicitar features, contactar al equipo de desarrollo.

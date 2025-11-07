# Refactorización de Sistema de Cuotas - ASOCHINUF

## Resumen Ejecutivo

Se ha completado una refactorización fundamental del sistema de cuotas mensuales. El cambio principal es pasar de un modelo **por-usuario** a un modelo **global + asignación**, donde las cuotas son creadas una sola vez y se asignan automáticamente a todos los usuarios nutricionista y admin.

## Problema Original

- Las cuotas se creaban por usuario (duplicación de datos)
- Los admins debían crear una cuota para cada usuario manualmente
- No había forma de crear cuotas realmente globales
- Los nuevos usuarios no recibían las cuotas existentes automáticamente

## Solución Implementada

### 1. Cambios en la Base de Datos (`backend/scripts/init-db.js`)

#### Tabla `t_cuotas_mensuales` (Cuotas Globales)
```sql
CREATE TABLE t_cuotas_mensuales (
  id SERIAL PRIMARY KEY,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  descripcion TEXT,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  UNIQUE(mes, ano)  -- ✅ Garantiza una cuota global por mes/año
);
```

**Cambios principales:**
- ❌ Removido: `usuario_id` (ya no hay relación directa)
- ✅ Agregado: Constraint `UNIQUE(mes, ano)` para garantizar unicidad global
- ✅ Las cuotas son completamente independientes de usuarios

#### Tabla `t_cuotas_usuario` (Nueva - Asignación de Cuotas)
```sql
CREATE TABLE t_cuotas_usuario (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  cuota_id INTEGER NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente',
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (usuario_id) REFERENCES t_usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (cuota_id) REFERENCES t_cuotas_mensuales(id) ON DELETE CASCADE,
  UNIQUE(usuario_id, cuota_id)
);
```

**Propósito:**
- Liga cada usuario con cada cuota global
- Rastrear estado de pago individual por usuario
- Permite que admin y nutricionista tengan cuotas, clientes no

#### Tabla `t_pagos_cuotas` (Actualizada)
```sql
CREATE TABLE t_pagos_cuotas (
  id SERIAL PRIMARY KEY,
  cuota_usuario_id INTEGER NOT NULL,  -- ✅ Cambio: referencia a t_cuotas_usuario
  monto_pagado DECIMAL(10, 2) NOT NULL,
  metodo_pago VARCHAR(50) DEFAULT 'mercado_pago',
  referencia_pago VARCHAR(255),
  estado_pago VARCHAR(50) DEFAULT 'completado',
  id_mercado_pago VARCHAR(255),
  estado_mercado_pago VARCHAR(50),
  fecha_pago TIMESTAMP DEFAULT NOW(),
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  notas TEXT,
  FOREIGN KEY (cuota_usuario_id) REFERENCES t_cuotas_usuario(id) ON DELETE CASCADE
);
```

**Cambios:**
- ✅ Ahora referencia `cuota_usuario_id` (en lugar de `cuota_id` directo)
- Permite registrar pagos específicos por usuario

### 2. Backend - Seed Script (`backend/scripts/seed-cuotas.js`)

El script ahora realiza 3 pasos:

1. **Crear cuotas globales** en `t_cuotas_mensuales` (sin usuario_id)
2. **Obtener todos los usuarios** nutricionista/admin
3. **Asignar cada cuota a cada usuario** en `t_cuotas_usuario`

```javascript
// Ejemplo de flujo
const cuotasGlobales = [
  { mes: 11, ano: 2024, monto: 50000, ... },
  { mes: 12, ano: 2024, monto: 55000, ... },
  { mes: 1, ano: 2025, monto: 52000, ... }
];

for (const usuario of usuarios) {
  for (const cuota of cuotasGlobales) {
    INSERT INTO t_cuotas_usuario (usuario_id, cuota_id, estado)
    VALUES (usuario.id, cuota.id, 'pendiente')
  }
}
```

### 3. Backend - Controlador (`backend/controllers/cuotasController.js`)

#### `crearCuota()` - Cambio Fundamental
**Antes:**
- Recibía `usuarioId` en el request
- Creaba una cuota por usuario
- Duplicaba datos

**Ahora:**
- NO recibe `usuarioId`
- Crea una cuota global
- Automáticamente asigna a TODOS los usuarios nutricionista/admin:
```javascript
// Crear cuota global
const cuotaResult = await pool.query(
  `INSERT INTO t_cuotas_mensuales (mes, ano, monto, ...)
   VALUES ($1, $2, $3, $4, $5)
   RETURNING id`
);

// Asignar a cada usuario
for (const usuario of usuarios) {
  INSERT INTO t_cuotas_usuario (usuario_id, cuota_id, 'pendiente')
}
```

#### `obtenerCuotas()` - Actualizado
Ahora hace JOINs con las tres tablas:
- Nutricionista: Ve solo sus cuotas (JOIN con t_cuotas_usuario where usuario_id = $1)
- Admin: Ve todas las cuotas globales y estado con todos los usuarios

#### `registrarPagoCuota()` - Cambio en Parámetro
**Antes:**
```javascript
cuotaId  → UPDATE t_cuotas_mensuales SET estado = 'pagado'
```

**Ahora:**
```javascript
cuotaUsuarioId → UPDATE t_cuotas_usuario SET estado = 'pagado'
```

Permite que cada usuario tenga su propio estado de pago.

#### `obtenerTodosLosUsuarios()` - Nuevo Endpoint
Retorna todos los usuarios nutricionista/admin sin importar si tienen cuotas:
```sql
SELECT DISTINCT u.id, u.nombre, u.apellido, u.email, u.tipo_perfil
FROM t_usuarios u
WHERE u.tipo_perfil IN ('nutricionista', 'admin')
ORDER BY u.nombre, u.apellido
```

### 4. Backend - Autenticación (`backend/controllers/authController.js`)

#### `crearUsuario()` - Auto-asignación de Cuotas

Cuando se crea un nuevo nutricionista/admin, automáticamente:
1. Se obtienen todas las cuotas globales existentes
2. Se crea un registro en `t_cuotas_usuario` para cada cuota
3. El estado se establece como 'pendiente'

```javascript
if (tipo_perfil === 'nutricionista' || tipo_perfil === 'admin') {
  const cuotas = SELECT id FROM t_cuotas_mensuales;
  for (const cuota of cuotas) {
    INSERT INTO t_cuotas_usuario (usuario_id, cuota_id, 'pendiente')
  }
}
```

**Beneficio:** Un nuevo usuario nutricionista creado hoy verá todas las cuotas pendientes sin intervención del admin.

### 5. Backend - Rutas (`backend/routes/cuotas.js`)

**Nuevas rutas:**
```javascript
// GET /api/cuotas/usuarios/todos
// Retorna todos los usuarios para la tabla administrativa
router.get('/usuarios/todos', obtenerTodosLosUsuarios);
```

### 6. Frontend - CreateCuotaModal

**Cambio:**
```javascript
// ❌ Antes: POST con usuarioId
await axios.post(API_ENDPOINTS.CUOTAS.CREATE, {
  usuarioId: usuario.id,  // ❌ Removido
  mes, ano, monto, ...
});

// ✅ Ahora: POST sin usuarioId (cuota global)
await axios.post(API_ENDPOINTS.CUOTAS.CREATE, {
  mes, ano, monto, fechaVencimiento, descripcion
  // Cuota se asigna automáticamente a todos los usuarios
});
```

El servidor responde:
```json
{
  "message": "Cuota creada y asignada a todos los usuarios exitosamente",
  "usuariosAsignados": 5
}
```

### 7. Frontend - PaymentModal

**Cambio en llamada a API:**
```javascript
// ❌ Antes
await axios.post(API_ENDPOINTS.CUOTAS.REGISTRAR_PAGO(cuota.id), {
  montoPagado, metodoPago, referenciaPago
});

// ✅ Ahora
await axios.post(`${API_ENDPOINTS.CUOTAS.GET_ALL}/${cuota.cuota_usuario_id}/pagos`, {
  cuotaUsuarioId,  // ID de la asignación usuario-cuota
  montoPagado,
  metodoPago,
  referenciaPago
});
```

Esto permite que el servidor actualice el estado en `t_cuotas_usuario` específicamente para ese usuario.

### 8. Frontend - MyQuotasSection

**Necesario actualizar:**
- La tabla ahora recibe datos con `cuota_usuario_id` en lugar de solo `id`
- Estructura del objeto cuota cambió

```javascript
// Nueva estructura de cuota:
{
  cuota_id: 1,           // ID de cuota global
  cuota_usuario_id: 15,  // ID de asignación (para pagar)
  usuario_id: 5,
  mes: 11,
  ano: 2024,
  monto: 50000,
  estado: 'pendiente',   // Estado de este usuario
  ...
}
```

## Impacto en Flujos de Negocio

### Flujo Original
1. Admin crea usuario "Juan" (nutricionista)
2. Admin va a Cuotas
3. Admin crea cuota Nov 2024 - CLP 50,000
4. Admin crea otra cuota Dic 2024 - CLP 50,000
5. Admin crea la MISMA cuota para "Pedro"
6. Repetir para cada usuario

❌ **Problema:** Duplicación, manual, propenso a errores

### Flujo Nuevo
1. Admin va a Cuotas
2. Admin crea cuota Nov 2024 - CLP 50,000
3. Sistema asigna AUTOMÁTICAMENTE a todos los usuarios
4. Día siguiente: Admin crea usuario "Juan"
5. Sistema asigna AUTOMÁTICAMENTE todas las cuotas existentes a Juan

✅ **Beneficio:** Automático, único registro, nuevo usuario recibe cuotas al instante

## Flujos de Pago

### Escenario 1: Nutricionista Paga su Cuota

1. Nutricionista ve: "Noviembre 2024 - CLP 50,000 - Pendiente"
2. Hace clic en "Pagar"
3. Elige método (Mercado Pago o Transferencia)
4. Sistema actualiza solo su registro en `t_cuotas_usuario` a "pagado"
5. Otro nutricionista ve la misma cuota como "Pendiente" (su registro no cambió)

### Escenario 2: Admin Ve Estado Global

1. Admin ve tabla "Estado de Cuotas - Todos los Usuarios"
2. Columnas = Meses/Años (Nov 2024, Dic 2024, etc.)
3. Filas = Usuarios (Juan, Pedro, María, etc.)
4. Celda[Juan][Nov 2024] = ✓ Pagada (su estado)
5. Celda[Pedro][Nov 2024] = ⏳ Pendiente (su estado)

## Resumen de Cambios por Archivo

| Archivo | Cambios | Impacto |
|---------|---------|--------|
| `init-db.js` | t_cuotas_mensuales sin usuario_id, + t_cuotas_usuario | 🔴 Crítico - Esquema |
| `seed-cuotas.js` | Crea globales, asigna a usuarios | 🔴 Crítico - Data |
| `cuotasController.js` | Lógica de cuota global, new endpoint | 🔴 Crítico - API |
| `authController.js` | Auto-asigna cuotas en crearUsuario | 🟡 Importante - UX |
| `cuotas.js` | Nuevas rutas | 🟡 Importante - API |
| `CreateCuotaModal.jsx` | Sin usuarioId | 🟡 Importante - UX |
| `PaymentModal.jsx` | cuota_usuario_id | 🟡 Importante - UX |
| `MyQuotasSection.jsx` | Pendiente actualizar estructura | 🟡 Importante - UX |

## Pasos para Aplicar en Producción

1. **Backup de BD** ⚠️ Crítico
2. **Ejecutar**: `npm run db:init` (crea nuevas tablas)
3. **Ejecutar**: `node scripts/seed-cuotas.js` (carga datos)
4. **Deploy** backend con controladores actualizados
5. **Deploy** frontend con modales actualizados
6. **Test**: Crear cuota → Verificar asignación → Pagar

## Ventajas de la Nueva Arquitectura

✅ **Eliminación de Duplicados** - Una cuota global, múltiples asignaciones
✅ **Escalabilidad** - Agregar 100 usuarios no crea 100 cuotas
✅ **Auto-asignación** - Nuevos usuarios reciben cuotas al instante
✅ **Integridad de Datos** - Imposible tener cuotas inconsistentes
✅ **Reportes Mejores** - Admin ve matriz clara de pagos
✅ **Auditoría** - Cada pago rastreado por usuario

## Notas Técnicas

- **Cascada DELETE**: Al eliminar cuota global, se eliminan automáticamente todas sus asignaciones y pagos
- **UNIQUE Constraints**: Garantiza max 1 asignación por usuario-cuota
- **Transaction Safety**: Los JOINs con 3 tablas son rápidos (índices creados)
- **Backward Compatibility**: Clientes nunca tienen cuotas (excluidos en WHERE)

## Testing Recomendado

```
✓ Crear cuota global → Aparece en 5 usuarios
✓ Crear usuario → Recibe todas las cuotas existentes
✓ Pagar cuota usuario A → No afecta usuario B
✓ Admin ve matriz con ✓ y ⏳ correctos
✓ Eliminar cuota sin pagos → Borra asignaciones
✓ Eliminar usuario → Borra sus asignaciones y pagos
```

---

**Refactorización completada el:** 7 de noviembre, 2025
**Estado:** 🟢 Listo para testing

# Cómo Obtener Credenciales de Mercado Pago

## Opción 1: Testing (Recomendado para Desarrollo)

### Sin crear cuenta - Modo Test Automático

El sistema ya incluye **modo test automático**. Si NO configuras las credenciales, funcionará en modo de testing:

```env
# Backend .env - Dejar comentado o vacío
# MERCADO_PAGO_ACCESS_TOKEN=
# MERCADO_PAGO_PUBLIC_KEY=
```

**Ventajas:**
- ✅ No necesita credenciales reales
- ✅ Funciona para desarrollo local
- ✅ Pagos simulados
- ✅ No cobra dinero real

**Limitaciones:**
- ❌ No se integra realmente con Mercado Pago
- ❌ No procesa pagos reales
- ❌ Solo para desarrollo

---

## Opción 2: Mercado Pago Sandbox (Recomendado para Testing Real)

### Paso 1: Crear Cuenta en Mercado Pago

1. Ir a: https://www.mercadopago.com.ar/
2. Click en **"Crear Cuenta"** (esquina superior derecha)
3. Elegir: **Voy a vender**
4. Registrarse con:
   - Email
   - Contraseña
   - Datos personales

### Paso 2: Acceder a Credenciales de Sandbox

1. Una vez logueado, ir a:
   https://www.mercadopago.com.ar/settings/account/credentials

2. O en el Dashboard:
   - Click en tu nombre (arriba a la derecha)
   - Seleccionar **"Cuenta"**
   - Ir a **"Credenciales"**

3. Cambiar a modo **"SANDBOX"** (arriba a la derecha)

### Paso 3: Copiar Credenciales de Test

En la sección **"Credenciales de prueba"** encontrarás:

```
Access Token (Bearer Token):
APP_USR-XXXXXXXXXXXXXXXXXX-XXXXXXXXXXXXXXXX

Public Key:
APP_USR-XXXXXXXXXXXXXXXX-XXXXXXXX
```

Copiar y guardar en tu `.env`:

```env
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-XXXXXXXXXXXXXXXXXX-XXXXXXXXXXXXXXXX
MERCADO_PAGO_PUBLIC_KEY=APP_USR-XXXXXXXXXXXXXXXX-XXXXXXXX
```

### Paso 4: Usar Tarjetas de Prueba

Para probar pagos sin dinero real, usar estas tarjetas:

#### Visa (Aprobada)
- Número: `4111 1111 1111 1111`
- Vencimiento: `12/25`
- CVV: `123`
- Titular: `APRO`

#### Mastercard (Aprobada)
- Número: `5555 5555 5555 4444`
- Vencimiento: `12/25`
- CVV: `123`
- Titular: `APRO`

#### Visa (Rechazada)
- Número: `4000 0000 0000 0002`
- Vencimiento: `12/25`
- CVV: `123`
- Titular: `OTHE`

#### Visa (Pendiente)
- Número: `4111 1111 1111 1112`
- Vencimiento: `12/25`
- CVV: `123`
- Titular: `CONT`

### Paso 5: Probar en tu App

1. Reiniciar backend:
   ```bash
   npm run dev
   ```

2. Ir a "Cuotas y Pagos"
3. Click "Pagar"
4. Seleccionar "Mercado Pago"
5. Será redirigido al checkout de Mercado Pago (sandbox)
6. Usar una tarjeta de prueba

---

## Opción 3: Producción (Mercado Pago Real)

⚠️ **Solo para cuando el sistema esté en producción**

### Paso 1: Ir a Credenciales de Producción

1. En Dashboard de Mercado Pago
2. Click en tu nombre → **"Credenciales"**
3. Cambiar a modo **"PRODUCCIÓN"** (arriba a la derecha)

### Paso 2: Copiar Credenciales Reales

```
Access Token:
APP_USR-XXXXXXXXXXXXXXXXXX-XXXXXXXXXXXXXXXX (distinto al de sandbox)

Public Key:
APP_USR-XXXXXXXXXXXXXXXX-XXXXXXXX (distinto al de sandbox)
```

### Paso 3: Configurar en Producción

Actualizar `.env` en servidor de producción:

```env
MERCADO_PAGO_ACCESS_TOKEN=tu_token_produccion
MERCADO_PAGO_PUBLIC_KEY=tu_clave_produccion
NODE_ENV=production
FRONTEND_URL=https://tudominio.com
BACKEND_URL=https://tudominio.com/api
```

⚠️ **IMPORTANTE:**
- Nunca compartir credenciales en GitHub
- Usar variables de entorno en producción
- Guardar en archivo `.env` (no versionado)

---

## Comparación de Opciones

| Característica | Modo Test Automático | Sandbox | Producción |
|---|---|---|---|
| Necesita cuenta | ❌ No | ✅ Sí | ✅ Sí |
| Es gratuito | ✅ Sí | ✅ Sí | ❌ Comisiones |
| Procesa pagos reales | ❌ No | ❌ No | ✅ Sí |
| Cobra dinero | ❌ No | ❌ No | ✅ Sí |
| Desarrollo local | ✅ Mejor | ✅ Bien | ❌ No recomendado |
| Testing real | ❌ No | ✅ Sí | ❌ Caro |
| Producción | ❌ No | ❌ No | ✅ Sí |

---

## Pasos Rápidos (Resumen)

### Para Desarrollo (Recomendado: Modo Test Automático)
```env
# Dejar .env sin credenciales
# El sistema funcionará en modo test automático
```

### Para Testing Real (Recomendado: Sandbox)

1. Crear cuenta: https://www.mercadopago.com.ar/
2. Ir a credenciales: https://www.mercadopago.com.ar/settings/account/credentials
3. Copiar credenciales de **SANDBOX**
4. Pegar en `.env`:
   ```env
   MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
   MERCADO_PAGO_PUBLIC_KEY=APP_USR-...
   ```
5. Usar tarjetas de prueba para transacciones

### Para Producción
1. Pasar credenciales a modo **PRODUCCIÓN**
2. Copiar nuevas credenciales (son diferentes a sandbox)
3. Configurar en servidor de producción
4. Usar tarjetas reales

---

## Troubleshooting

### "¿Dónde están exactamente las credenciales?"

Dashboard → Nombre (arriba) → Credenciales → Sandbox/Producción

### "¿Puedo usar sandbox y producción al mismo tiempo?"

No, debes elegir una. Pero puedes tener ambas credenciales en tu código comentadas:

```env
# Sandbox (Desarrollo/Testing)
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...sandbox...
MERCADO_PAGO_PUBLIC_KEY=APP_USR-...sandbox...

# Producción (Descomentar cuando sea necesario)
# MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...produccion...
# MERCADO_PAGO_PUBLIC_KEY=APP_USR-...produccion...
```

### "¿Las tarjetas de prueba funcionan en cualquier lugar?"

Sólo en **sandbox**. En producción, solo funcionan tarjetas reales.

### "¿Necesito agregar Public Key en el backend?"

Actualmente, el backend solo usa el **Access Token**. La Public Key es para integración frontend con JavaScript SDK (opcional para el futuro).

### "¿Qué pasa si no configuro credenciales?"

✅ **Perfecto para desarrollo**

El sistema detecta que no hay token y:
1. Retorna una preferencia simulada
2. Funciona en modo test completo
3. Útil para desarrollo local sin Mercado Pago

---

## Arquitetura de Pagos

```
┌─────────────────────────────────────────────────────┐
│                   USUARIO                           │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │   Frontend (React)   │
          │  - Modal de pagos    │
          │  - 2 opciones        │
          └──────┬────────────────┘
                 │
        ┌────────┴─────────┐
        │                  │
        ▼                  ▼
   ┌────────────┐    ┌──────────────┐
   │ Mercado    │    │ Transferencia│
   │ Pago       │    │ Manual       │
   └────┬───────┘    └──────┬───────┘
        │                   │
        ▼                   ▼
   ┌─────────────────────────────────┐
   │   Backend (Node.js)             │
   │  - mercadoPagoService.js        │
   │  - Registra pago en BD          │
   └─────────────────────────────────┘
        │
        ▼
   ┌─────────────────────────────────┐
   │   PostgreSQL                    │
   │  - t_pagos_cuotas               │
   │  - t_cuotas_mensuales           │
   └─────────────────────────────────┘
```

---

## Costos y Comisiones

### Mercado Pago - Comisiones por Transacción
- Tarjeta de débito: 1.99%
- Tarjeta de crédito: 2.99%
- Transferencia bancaria: Gratis (se debe configurar manualmente)

### Alternativas
- **Stripe**: 2.9% + $0.30
- **Paypal**: 2.9% + $0.30
- **Transferencia Manual**: Gratis

---

## Siguiente Paso

Una vez tengas las credenciales (o decidas usar modo test automático):

1. Agregar a `.env`
2. Reiniciar backend: `npm run dev`
3. Probar en http://localhost:3000/dashboard → Cuotas y Pagos

¿Necesitas ayuda específica con algo?

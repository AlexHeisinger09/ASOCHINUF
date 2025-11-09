# Guía: Cómo Probar Mercado Pago

## Opciones de Prueba

Tienes **2 formas** de probar Mercado Pago:

### Opción 1: Modo Test Simulado (SIN credenciales) - RÁPIDO
### Opción 2: Modo Sandbox de Mercado Pago (CON credenciales) - REAL

---

## OPCIÓN 1: Modo Test Simulado (Recomendado para empezar)

### ✅ Ventajas
- No necesitas cuenta de Mercado Pago
- Prueba inmediata
- Sin configuración

### 📝 Estado Actual
Tu código **ya está configurado** para esto. Como no tienes `MERCADO_PAGO_ACCESS_TOKEN` en tu `.env`, el sistema automáticamente entra en modo test.

### 🚀 Cómo Probar AHORA MISMO

1. **Asegúrate que el backend NO tenga credenciales de MP:**
   ```env
   # En backend/.env - NO agregues estas líneas aún
   # MERCADO_PAGO_ACCESS_TOKEN=
   # MERCADO_PAGO_PUBLIC_KEY=
   ```

2. **Inicia ambos servidores:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

3. **Prueba el flujo:**
   - Ve a http://localhost:3000
   - Inicia sesión con un usuario
   - Ve a Dashboard → Cuotas
   - Selecciona una cuota pendiente
   - Click en "Pagar"
   - Click en "Mercado Pago"

4. **Qué esperar:**
   - En la consola del backend verás: `⚠️ MERCADO_PAGO_ACCESS_TOKEN no configurado. Retornando preferencia simulada para testing.`
   - Te redirigirá a una URL de test (no de Mercado Pago real)
   - Puedes simular el pago manualmente

### ⚠️ Limitación
- No puedes probar el checkout real de Mercado Pago
- No se ejecuta el webhook real
- Solo prueba el flujo de tu aplicación

---

## OPCIÓN 2: Modo Sandbox de Mercado Pago (REAL)

### Paso 1: Crear Cuenta en Mercado Pago Developers

1. **Ve a:** https://www.mercadopago.cl/developers
2. **Crea una cuenta** (puedes usar tu cuenta personal de Mercado Pago)
3. **Accede al Panel de Desarrolladores**

### Paso 2: Crear una Aplicación

1. En el panel, ve a **"Tus aplicaciones"**
2. Click en **"Crear aplicación"**
3. Completa:
   - **Nombre:** ASOCHINUF Pagos
   - **Modelo de integración:** Checkout Pro (es el que usas)
   - **Productos/Servicios:** Asociación de fútbol
4. Click en **"Crear aplicación"**

### Paso 3: Obtener Credenciales de Prueba (Sandbox)

1. En tu aplicación, ve a la sección **"Credenciales"**
2. Selecciona **"Credenciales de prueba"** (NO producción aún)
3. Verás dos claves:
   - **Access Token (Prueba):** `TEST-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxx`
   - **Public Key (Prueba):** `TEST-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxx`

### Paso 4: Configurar Variables de Entorno

Edita tu archivo `backend/.env`:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_If01onjwDtFT@ep-aged-band-a4k3ysul-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Server
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5001

# Authentication
JWT_SECRET=asochinuf_super_secret_key_2024_desarrollo_local_jwt_token
JWT_EXPIRE=7d

# Email (Nodemailer - opcional para desarrollo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_aqui

# ========== MERCADO PAGO (MODO TEST) ==========
MERCADO_PAGO_ACCESS_TOKEN=TEST-1234567890-123456-abcdef1234567890abcdef1234567890-123456789
MERCADO_PAGO_PUBLIC_KEY=TEST-abcdef12-3456-7890-abcd-ef1234567890
```

**⚠️ IMPORTANTE:**
- Reemplaza `TEST-1234...` con tus credenciales REALES de prueba
- Asegúrate que empiecen con `TEST-`
- NO uses credenciales de producción aún

### Paso 5: Agregar BACKEND_URL al .env

Tu código usa `BACKEND_URL` para el webhook. Agrégalo:
```env
BACKEND_URL=http://localhost:5001
```

### Paso 6: Reiniciar el Backend

```bash
cd backend
npm run dev
```

Deberías ver en la consola que NO aparece el warning de credenciales.

### Paso 7: Probar el Flujo Completo

1. **Frontend:** http://localhost:3000
2. **Login:** Con un usuario que tenga cuotas pendientes
3. **Dashboard → Cuotas**
4. **Click en "Pagar"** en una cuota
5. **Click en "Mercado Pago"**
6. **¡Serás redirigido a Mercado Pago Sandbox!**

### Paso 8: Usar Tarjetas de Prueba

Mercado Pago te dará tarjetas de prueba. Usa estas:

#### **Tarjetas de Crédito (Aprobadas)**
| Tarjeta | Número | Código | Vencimiento | Nombre |
|---------|--------|--------|-------------|--------|
| Visa | 4009 1753 3280 7395 | 123 | 11/25 | APRO |
| Mastercard | 5031 7557 3453 0604 | 123 | 11/25 | APRO |

#### **Tarjetas de Débito (Aprobadas)**
| Tarjeta | Número | Código | Vencimiento | Nombre |
|---------|--------|--------|-------------|--------|
| Visa Débito | 4002 7686 5293 9623 | 123 | 11/25 | APRO |

#### **Tarjetas Rechazadas (Para probar errores)**
| Tarjeta | Número | Código | Vencimiento | Nombre | Resultado |
|---------|--------|--------|-------------|--------|-----------|
| Visa | 4509 9535 6623 3704 | 123 | 11/25 | CALL | Fondos insuficientes |
| Mastercard | 5031 4332 1540 6351 | 123 | 11/25 | OTHE | Rechazada |

**Datos del titular:**
- **Nombre:** APRO (para aprobadas) o CALL/OTHE (para rechazadas)
- **Apellido:** USER
- **Email:** test_user_123@testuser.com
- **DNI/RUT:** 12345678-9

### Paso 9: Completar el Pago

1. En el checkout de Mercado Pago, ingresa los datos de una tarjeta de prueba
2. Click en **"Pagar"**
3. Serás redirigido a tu aplicación con `?pago=success`
4. El webhook se ejecutará automáticamente (puede tardar unos segundos)
5. Ve a Dashboard → Cuotas y verifica que la cuota esté marcada como "Pagado"

---

## Verificar que el Webhook Funcione

### Problema: Webhook en localhost

Mercado Pago **NO puede** llamar a `http://localhost:5001` porque está en tu computadora local.

### Solución 1: Ngrok (Túnel a localhost)

1. **Instala ngrok:**
   ```bash
   # Windows
   choco install ngrok

   # O descarga desde: https://ngrok.com/download
   ```

2. **Crea cuenta en ngrok:** https://dashboard.ngrok.com/signup

3. **Conecta tu cuenta:**
   ```bash
   ngrok authtoken TU_TOKEN_AQUI
   ```

4. **Inicia el túnel:**
   ```bash
   ngrok http 5001
   ```

5. **Copia la URL generada:**
   ```
   Forwarding: https://abc123.ngrok.io -> http://localhost:5001
   ```

6. **Actualiza tu .env:**
   ```env
   BACKEND_URL=https://abc123.ngrok.io
   ```

7. **Reinicia el backend**

Ahora Mercado Pago **SÍ podrá** llamar a tu webhook.

### Solución 2: Probar sin Webhook (Más Simple)

1. Mantén `BACKEND_URL=http://localhost:5001`
2. Completa el pago en Mercado Pago
3. El webhook fallará, pero puedes:
   - Ver los logs en el panel de Mercado Pago
   - Marcar manualmente el pago en tu app usando el método de transferencia manual
   - Probar el webhook cuando despliegues a producción

---

## Verificar Logs en Mercado Pago

1. Ve al **Panel de Desarrolladores**
2. **Tu aplicación → IPN/Webhooks**
3. Verás los intentos de llamada al webhook
4. Revisa si hay errores

---

## Flujo Completo de Prueba

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario hace clic en "Pagar con Mercado Pago"          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend llama a POST /api/payments/iniciar             │
│    Body: { cuotaUsuarioId: 123, montoPagado: 50000 }       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend llama a Mercado Pago API                        │
│    POST /checkout/preferences                               │
│    Con datos de la cuota y usuario                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Mercado Pago retorna:                                   │
│    {                                                        │
│      id: "123456789-abc",                                  │
│      init_point: "https://www.mercadopago.cl/checkout/..." │
│    }                                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Frontend redirige a init_point                          │
│    window.location.href = init_point                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Usuario ve checkout de Mercado Pago                    │
│    Ingresa datos de tarjeta de prueba                      │
│    Click en "Pagar"                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Mercado Pago procesa el pago                            │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────────┐
│ 8a. Redirige a   │    │ 8b. Llama al webhook │
│ success_url      │    │ (si ngrok está activo)│
└────────┬─────────┘    └─────────┬────────────┘
         │                        │
         │                        ▼
         │              ┌──────────────────────┐
         │              │ POST /api/payments/  │
         │              │      webhook         │
         │              │ {                    │
         │              │   action: "payment.  │
         │              │           created",  │
         │              │   data: { id: "..." }│
         │              │ }                    │
         │              └─────────┬────────────┘
         │                        │
         │                        ▼
         │              ┌──────────────────────┐
         │              │ Backend:             │
         │              │ 1. Verifica pago     │
         │              │ 2. Registra en DB    │
         │              │ 3. Actualiza estado  │
         │              └──────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. Usuario ve mensaje de éxito en tu aplicación           │
│    URL: /dashboard?tab=cuotas&pago=success&cuota=123       │
└─────────────────────────────────────────────────────────────┘
```

---

## Checklist de Prueba

- [ ] Backend iniciado (puerto 5001)
- [ ] Frontend iniciado (puerto 3000)
- [ ] Variables de entorno configuradas
- [ ] Usuario con cuotas pendientes en DB
- [ ] Click en "Pagar con Mercado Pago"
- [ ] Redirección a Mercado Pago exitosa
- [ ] Ingreso de tarjeta de prueba
- [ ] Pago completado
- [ ] Redirección a tu app con `pago=success`
- [ ] (Opcional) Ngrok configurado para webhook
- [ ] (Opcional) Webhook ejecutado correctamente
- [ ] Estado de cuota actualizado a "pagado"

---

## Troubleshooting

### Error: "cuotaUsuarioId es requerido"
✅ **SOLUCIONADO** - Ya corregimos esto en el archivo anterior

### Error: "Failed to create preference"
- Verifica que `MERCADO_PAGO_ACCESS_TOKEN` esté correcto
- Asegúrate que empiece con `TEST-`
- Revisa la consola del backend para más detalles

### Error: "Invalid currency_id"
- Verifica que uses `CLP` para Chile
- Si estás en otro país, usa el código correcto (ARS, BRL, etc.)

### El webhook no se ejecuta
- Usa ngrok para túnel
- O prueba sin webhook por ahora
- Verifica logs en el panel de Mercado Pago

### El pago se aprueba pero no se actualiza en la DB
- Revisa los logs del backend
- Verifica que el webhook esté llegando
- Revisa la tabla `t_pagos_cuotas` manualmente

---

## Siguiente Paso: Producción

Cuando estés listo para usar pagos reales:

1. **Completa el formulario de homologación** en Mercado Pago
2. **Cambia a credenciales de producción** (sin `TEST-`)
3. **Actualiza .env** con credenciales reales
4. **Despliega a un servidor público** (no localhost)
5. **Configura webhook en URL pública**

---

## Recursos

- **Documentación MP:** https://www.mercadopago.cl/developers/es/docs
- **Tarjetas de prueba:** https://www.mercadopago.cl/developers/es/docs/checkout-pro/additional-content/test-cards
- **Panel de desarrolladores:** https://www.mercadopago.cl/developers/panel
- **Ngrok:** https://ngrok.com/

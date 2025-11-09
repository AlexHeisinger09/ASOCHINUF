# Test Rápido de Mercado Pago

## 🚀 Prueba INMEDIATA (Sin credenciales - Modo Simulado)

### Paso 1: Inicia los servidores

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### Paso 2: Verifica que funcione

1. Abre http://localhost:3000
2. Inicia sesión (usuario: tu email, contraseña: la que usaste)
3. Ve a **Dashboard → Cuotas**
4. Click en **"Pagar"** en cualquier cuota pendiente
5. Click en **"Mercado Pago"**

**Resultado esperado:**
- En la consola del backend verás:
  ```
  ⚠️ MERCADO_PAGO_ACCESS_TOKEN no configurado. Retornando preferencia simulada para testing.
  ```
- Serás redirigido a una URL de test (no el checkout real de MP)

**Esto confirma que el flujo funciona correctamente.**

---

## 🔵 Prueba REAL (Con credenciales - Modo Sandbox)

### Paso 1: Obtener credenciales de Mercado Pago

1. Ve a: **https://www.mercadopago.cl/developers**
2. Inicia sesión o crea una cuenta
3. Click en **"Tus aplicaciones"** → **"Crear aplicación"**
4. Completa:
   - Nombre: **ASOCHINUF Pagos**
   - Producto: **Checkout Pro**
5. Ve a **"Credenciales de prueba"** (pestaña)
6. Copia el **Access Token** (empieza con `TEST-`)

### Paso 2: Configurar credenciales

Edita `backend/.env`:

```env
# Descomenta y pega tu Access Token real aquí
MERCADO_PAGO_ACCESS_TOKEN=TEST-1234567890-123456-tu-access-token-real-aqui
MERCADO_PAGO_PUBLIC_KEY=TEST-abcdef12-3456-7890-tu-public-key-aqui
```

### Paso 3: Reiniciar backend

```bash
# Ctrl+C en la terminal del backend
npm run dev
```

### Paso 4: Probar el checkout real

1. Ve a http://localhost:3000
2. Dashboard → Cuotas → Pagar → Mercado Pago
3. **Ahora serás redirigido al checkout REAL de Mercado Pago**

### Paso 5: Usar tarjeta de prueba

En el checkout de Mercado Pago, ingresa:

**Tarjeta Visa (Aprobada):**
- Número: `4009 1753 3280 7395`
- Vencimiento: `11/25`
- CVV: `123`
- Nombre: `APRO`
- Email: `test@test.com`
- RUT: `12345678-9`

### Paso 6: Completar el pago

1. Click en **"Pagar"**
2. Serás redirigido a tu aplicación
3. Verás el mensaje de éxito
4. Ve a Dashboard → Cuotas
5. **La cuota debería estar marcada como "Pagada"**

---

## ⚠️ Importante: El Webhook

El webhook **NO funcionará** en localhost porque Mercado Pago no puede llamar a tu computadora local.

**Opciones:**

### Opción A: Ignorar el webhook por ahora
- El pago se completará en Mercado Pago
- En tu app verás el mensaje de éxito
- Pero el estado puede no actualizarse automáticamente
- **Solución temporal:** Usa el método de transferencia manual para registrar el pago

### Opción B: Usar ngrok (Túnel a localhost)

```bash
# Instalar ngrok
# Windows: https://ngrok.com/download

# Iniciar túnel
ngrok http 5001

# Copiar la URL generada (ejemplo: https://abc123.ngrok.io)
# Actualizar backend/.env:
BACKEND_URL=https://abc123.ngrok.io

# Reiniciar backend
```

Ahora el webhook **SÍ funcionará** y el estado se actualizará automáticamente.

---

## 📊 Verificar que todo funcione

### Checklist:

- [ ] Backend corriendo en puerto 5001
- [ ] Frontend corriendo en puerto 3000
- [ ] Login exitoso en la aplicación
- [ ] Hay cuotas pendientes en Dashboard → Cuotas
- [ ] Click en "Pagar con Mercado Pago" funciona
- [ ] Redirección a Mercado Pago exitosa
- [ ] Pago con tarjeta de prueba completado
- [ ] Redirección de vuelta a tu app con `?pago=success`
- [ ] (Opcional) Webhook ejecutado y estado actualizado

---

## 🐛 Problemas Comunes

### 1. "cuotaUsuarioId es requerido"
**Solución:** Ya lo corregimos. Asegúrate de tener la última versión del código.

### 2. No hay cuotas para pagar
**Solución:** Crea cuotas desde el panel de admin:
1. Dashboard → Gestión de Cuotas (admin only)
2. Crea una cuota nueva
3. Asígnala a un usuario

### 3. El pago se aprueba pero no se actualiza
**Solución:** El webhook no está funcionando (normal en localhost). Opciones:
- Usa ngrok (ver arriba)
- Registra el pago manualmente con "Transferencia Bancaria"

### 4. Error en la consola del backend
**Solución:** Verifica que:
- `MERCADO_PAGO_ACCESS_TOKEN` empiece con `TEST-`
- `BACKEND_URL` esté configurado
- El servidor esté reiniciado después de cambiar `.env`

---

## 🎯 Resumen Ejecutivo

**Para probar SIN credenciales (Modo Simulado):**
```bash
# backend/.env - NO agregues nada de Mercado Pago
# Inicia servidores
# Prueba el flujo
# Verás mensaje de modo test
```

**Para probar CON credenciales (Modo Real Sandbox):**
```bash
# 1. Obtén credenciales en mercadopago.cl/developers
# 2. Pega en backend/.env
# 3. Reinicia backend
# 4. Prueba con tarjeta de prueba: 4009 1753 3280 7395
```

**Para que el webhook funcione:**
```bash
# Usa ngrok o despliega a un servidor público
```

---

## 📞 Siguiente Nivel

Cuando estés listo para **producción**:
1. Completa homologación en Mercado Pago
2. Cambia a credenciales de **producción** (sin `TEST-`)
3. Despliega a servidor público (Heroku, Railway, etc.)
4. Usa tarjetas reales

---

## Diferencia: Mercado Pago vs Khipu

| Característica | Mercado Pago | Khipu |
|----------------|--------------|-------|
| **Tarjetas de crédito** | ✅ Sí | ❌ No |
| **Transferencia bancaria** | ⚠️ Limitado | ✅ Especializado |
| **Tiempo de confirmación** | Instantáneo (tarjetas) | Instantáneo (transferencias) |
| **Comisión** | ~3.5% + IVA | ~2.9% + IVA |
| **Mejor para** | Tarjetas | Transferencias |

**Recomendación:** Usa **ambos**:
- Mercado Pago para usuarios con tarjeta
- Khipu para usuarios que prefieren transferencia
- Manual para casos especiales

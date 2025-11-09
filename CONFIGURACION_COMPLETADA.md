# ✅ Configuración de Mercado Pago Completada

**Fecha:** 07/11/2025
**Estado:** Credenciales de PRUEBA configuradas correctamente

---

## 🎉 ¡Listo para Probar!

### Credenciales Configuradas:

```
Access Token: APP_USR-8720876176440233-110716-***
Public Key:   APP_USR-ea3d6025-ba06-4b1b-8634-***
Modo:         PRUEBA (Sandbox)
```

⚠️ **IMPORTANTE:** Estas son credenciales de **PRUEBA**. NO uses dinero real.

---

## 🚀 Pasos para Probar AHORA

### 1. Inicia el Backend
```bash
cd backend
npm run dev
```

**Deberías ver:**
```
Servidor corriendo en puerto 5001
Conectado a la base de datos
```

**NO deberías ver:**
```
⚠️ MERCADO_PAGO_ACCESS_TOKEN no configurado
```
Si ves este warning, el backend no cargó las credenciales. Reinícialo.

---

### 2. Inicia el Frontend (en otra terminal)
```bash
cd frontend
npm start
```

Abrirá automáticamente: http://localhost:3000

---

### 3. Prueba el Flujo de Pago

#### Paso 1: Inicia Sesión
- Ve a http://localhost:3000
- Click en "Iniciar Sesión"
- Usa tus credenciales

#### Paso 2: Ve a Cuotas
- Dashboard → Cuotas (tab)
- Deberías ver tus cuotas pendientes

#### Paso 3: Intenta Pagar
- Click en **"Pagar"** en una cuota pendiente
- Se abrirá el modal de pago
- Click en **"Mercado Pago"**

#### Paso 4: Verifica la Redirección
**¡Ahora deberías ser redirigido al checkout REAL de Mercado Pago!**

Si ves la página de Mercado Pago con el logo azul y el formulario de pago:
✅ **¡FUNCIONA CORRECTAMENTE!**

---

### 4. Completa el Pago de Prueba

En el checkout de Mercado Pago, ingresa estos datos:

#### 💳 Tarjeta de Prueba (Aprobada)

**Número de tarjeta:**
```
4009 1753 3280 7395
```

**Vencimiento:**
```
11/25
```

**Código de seguridad (CVV):**
```
123
```

**Nombre del titular:**
```
APRO
```

**Email:**
```
test@test.com
```

**RUT:**
```
12345678-9
```

**Tipo de documento:**
```
RUT
```

#### Click en "Pagar"

---

### 5. Resultado Esperado

1. **Mercado Pago procesará el pago** (5-10 segundos)
2. **Serás redirigido** a tu aplicación
3. **Verás un mensaje de éxito** con `?pago=success` en la URL
4. **Ve a Dashboard → Cuotas**
5. **La cuota debería estar marcada como "Pagado"** ✅

---

## 🔍 Verificar Logs

### En la consola del Backend deberías ver:

```
POST /api/payments/iniciar 200 - 1234ms
```

Si ves esto, el pago se inició correctamente.

---

## ⚠️ Webhook (Importante)

El webhook **NO funcionará** en localhost porque Mercado Pago no puede llamar a `http://localhost:5001`.

### Opciones:

#### Opción A: Ignorar el webhook por ahora ✅ (Recomendado para pruebas)
- El pago se completará
- Verás el mensaje de éxito
- El estado puede no actualizarse automáticamente
- **Para actualizar manualmente:** Usa el botón de "Transferencia Bancaria" y registra el pago manual

#### Opción B: Configurar ngrok (Para webhook funcional)

1. **Instala ngrok:**
   - Descarga de https://ngrok.com/download
   - O: `choco install ngrok` (si tienes Chocolatey)

2. **Inicia ngrok:**
   ```bash
   ngrok http 5001
   ```

3. **Copia la URL generada:**
   ```
   Forwarding: https://abc123.ngrok-free.app -> http://localhost:5001
   ```

4. **Actualiza backend/.env:**
   ```env
   BACKEND_URL=https://abc123.ngrok-free.app
   ```

5. **Reinicia el backend**

Ahora el webhook funcionará y el estado se actualizará automáticamente.

---

## 🎯 Checklist de Prueba

- [ ] Backend corriendo en puerto 5001
- [ ] Frontend corriendo en puerto 3000
- [ ] Login exitoso
- [ ] Cuotas pendientes visibles
- [ ] Click en "Pagar con Mercado Pago"
- [ ] Redirección a Mercado Pago ✅
- [ ] Checkout de Mercado Pago visible
- [ ] Tarjeta de prueba ingresada: `4009 1753 3280 7395`
- [ ] Pago procesado exitosamente
- [ ] Redirección a tu app con `?pago=success`
- [ ] (Opcional) Estado de cuota actualizado a "Pagado"

---

## 🐛 Solución de Problemas

### Problema 1: "MERCADO_PAGO_ACCESS_TOKEN no configurado"
**Solución:**
- Verifica que el archivo `.env` tenga las credenciales
- Reinicia el backend (Ctrl+C y `npm run dev`)
- El archivo `.env` debe estar en `c:\Proyectos React\ASOCHINUF\backend\.env`

### Problema 2: No redirige a Mercado Pago
**Solución:**
- Abre la consola del navegador (F12)
- Busca errores en la pestaña Console
- Verifica que la petición a `/api/payments/iniciar` sea exitosa (Network tab)

### Problema 3: Error 400/500 al iniciar pago
**Solución:**
- Verifica los logs del backend
- Asegúrate que hay una cuota pendiente en la base de datos
- Verifica que el usuario tenga una cuota asignada

### Problema 4: El pago se aprueba pero no se actualiza
**Solución:**
- Esto es normal en localhost (webhook no funciona)
- Usa ngrok (ver Opción B arriba)
- O registra el pago manualmente

---

## 📊 Otras Tarjetas de Prueba

### Tarjetas Aprobadas:
| Banco | Número | CVV | Vence | Nombre |
|-------|--------|-----|-------|--------|
| Visa | 4009 1753 3280 7395 | 123 | 11/25 | APRO |
| Mastercard | 5031 7557 3453 0604 | 123 | 11/25 | APRO |
| American Express | 3711 803032 57522 | 1234 | 11/25 | APRO |

### Tarjetas Rechazadas (para probar errores):
| Banco | Número | CVV | Vence | Nombre | Error |
|-------|--------|-----|-------|--------|-------|
| Visa | 4509 9535 6623 3704 | 123 | 11/25 | CALL | Fondos insuficientes |
| Mastercard | 5031 4332 1540 6351 | 123 | 11/25 | OTHE | Rechazada genérica |

**Más tarjetas:** https://www.mercadopago.cl/developers/es/docs/checkout-pro/additional-content/test-cards

---

## 🎓 Documentación Adicional

- **Panel de Mercado Pago:** https://www.mercadopago.cl/developers/panel
- **Guía completa de prueba:** Ver archivo `PRUEBA_MERCADO_PAGO.md`
- **Transferencias bancarias:** Ver archivo `TRANSFERENCIAS_BANCARIAS.md`
- **Prueba rápida:** Ver archivo `test-mercadopago.md`

---

## 📞 Siguiente Paso: Producción

Cuando estés listo para **pagos reales**:

1. **Completa homologación** en el panel de Mercado Pago
2. **Obtén credenciales de PRODUCCIÓN** (sin TEST- ni APP_USR-)
3. **Cambia las credenciales** en `.env`
4. **Despliega a un servidor público** (no localhost)
5. **Configura webhook en URL pública**

⚠️ **NO uses credenciales de producción en localhost**

---

## ✅ Resumen

**Estado:** ✅ Configuración completa
**Modo:** 🧪 Prueba (Sandbox)
**Siguiente:** 🧪 Probar flujo de pago
**Tarjeta de prueba:** `4009 1753 3280 7395`

**¡Todo listo para probar Mercado Pago!** 🎉

---

**Última actualización:** 07/11/2025

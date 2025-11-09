# 🚀 Cómo Reiniciar el Backend

## ✅ Cambios Realizados

He corregido el error 400 de Mercado Pago. El problema era:
- Faltaba el campo `description` en los items
- El `statement_descriptor` era muy largo
- Removí el campo `id` del item (no es requerido)

## 📝 Instrucciones para Reiniciar

### Paso 1: Abre una terminal nueva

**Opción A: Desde VSCode**
- Presiona `Ctrl + Shift + ñ` (backtick)
- O menú: Terminal → New Terminal

**Opción B: CMD**
- Abre el menú Inicio
- Escribe "cmd"
- Enter

### Paso 2: Navega a la carpeta del backend

```bash
cd "c:\Proyectos React\ASOCHINUF\backend"
```

### Paso 3: Inicia el servidor

```bash
npm run dev
```

### Paso 4: Verifica que inició correctamente

Deberías ver:

```
[nodemon] starting `node server.js`
✅ Conectado a Neon con serverless
✓ Conexión a PostgreSQL exitosa
```

**NO deberías ver:**
- ❌ `Error: listen EADDRINUSE` (significa que el puerto está ocupado)
- ❌ `⚠️ MERCADO_PAGO_ACCESS_TOKEN no configurado` (significa que no cargó las credenciales)

### Si ves "Error: listen EADDRINUSE":

El puerto 5001 está ocupado. Cierra todas las terminales de Node.js o ejecuta:

```bash
# Windows
taskkill /F /IM node.exe

# Luego vuelve a intentar
npm run dev
```

---

## 🧪 Probar Mercado Pago

Una vez que el backend esté corriendo:

### 1. Ve a tu aplicación
http://localhost:3000

### 2. Inicia sesión

### 3. Ve a Dashboard → Cuotas

### 4. Click en "Pagar" → "Mercado Pago"

### 5. Deberías ver

**ANTES (con el error):**
- Error 500
- "Error al iniciar pago"

**AHORA (corregido):**
- Redirección al checkout de Mercado Pago
- Página azul con formulario de pago

### 6. Usa la tarjeta de prueba

```
Número: 4009 1753 3280 7395
Vence: 11/25
CVV: 123
Nombre: APRO
Email: test@test.com
RUT: 12345678-9
```

---

## 📊 Logs a Observar

En la terminal del backend verás:

```
📤 Enviando preferencia a Mercado Pago: {
  "items": [...]
  "payer": {...}
  ...
}
✅ Preferencia creada exitosamente: 123456789-abc123
POST /api/payments/iniciar 200 - 1234ms
```

Si ves `✅ Preferencia creada exitosamente` = ¡FUNCIONA! 🎉

---

## 🐛 Solución de Problemas

### Problema: "Cannot find module"
```bash
# Reinstala dependencias
npm install
npm run dev
```

### Problema: "EADDRINUSE"
```bash
# Mata todos los procesos de Node
taskkill /F /IM node.exe

# Reinicia
npm run dev
```

### Problema: Sigue dando error 400
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate que empiecen con `APP_USR-`
- Reinicia el backend después de cambiar `.env`

### Problema: "Access token inválido"
- Verifica en https://www.mercadopago.cl/developers/panel
- Ve a tu aplicación → Credenciales de prueba
- Copia nuevamente el Access Token
- Pégalo en `backend/.env`
- Reinicia el backend

---

## ✅ Checklist Final

- [ ] Backend corriendo sin errores
- [ ] Frontend corriendo en http://localhost:3000
- [ ] Login exitoso
- [ ] Click en "Pagar con Mercado Pago"
- [ ] Redirección al checkout de Mercado Pago ✅
- [ ] Formulario de pago visible
- [ ] Tarjeta de prueba ingresada
- [ ] Pago completado
- [ ] Redirección a tu app con éxito

---

## 🎯 Resumen

**¿Qué corregí?**
- ✅ Estructura de la preferencia de Mercado Pago
- ✅ Campos requeridos para Chile (CLP)
- ✅ Validación de monto mínimo (50 CLP)
- ✅ Logs para debugging

**¿Qué debes hacer?**
1. Abre terminal
2. `cd "c:\Proyectos React\ASOCHINUF\backend"`
3. `npm run dev`
4. Prueba el pago

**Tarjeta de prueba:**
`4009 1753 3280 7395` / `11/25` / `123` / `APRO`

---

**Última actualización:** 07/11/2025

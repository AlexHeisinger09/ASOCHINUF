import pool from '../config/database.js';

const API_URL = 'http://localhost:5000/api';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const test = async () => {
  try {
    console.log('\n=== PRUEBA DE RECUPERACIÓN DE CONTRASEÑA ===\n');

    // 1. Solicitar recuperación
    console.log('1. Solicitando recuperación para nutricionista@test.com...');
    const recupRes = await fetch(`${API_URL}/auth/solicitar-recuperacion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nutricionista@test.com' })
    });
    const recupData = await recupRes.json();
    console.log('✓ Respuesta:', recupData.mensaje);

    // 2. Obtener token de BD
    console.log('\n2. Obteniendo token de BD para prueba...');
    
    const tokenRes = await pool.query(
      'SELECT token FROM t_recovery_tokens WHERE usuario_id = 1 ORDER BY fecha_creacion DESC LIMIT 1'
    );
    
    if (tokenRes.rows.length === 0) {
      console.log('❌ No se encontró token en BD');
      process.exit(1);
    }
    
    const token = tokenRes.rows[0].token;
    console.log('✓ Token obtenido:', token.substring(0, 20) + '...');

    // 3. Verificar token
    console.log('\n3. Verificando token...');
    const verifyRes = await fetch(`${API_URL}/auth/verificar-token/${token}`);
    const verifyData = await verifyRes.json();
    
    if (verifyRes.ok) {
      console.log('✓ Token válido');
    } else {
      console.log('❌ Error:', verifyData.error);
      process.exit(1);
    }

    // 4. Restablecer contraseña
    console.log('\n4. Restableciendo contraseña...');
    const resetRes = await fetch(`${API_URL}/auth/restablecer-contrasena`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        nuevaContrasena: 'nuevaPassword123'
      })
    });
    const resetData = await resetRes.json();
    
    if (resetRes.ok) {
      console.log('✓ Respuesta:', resetData.mensaje);
    } else {
      console.log('❌ Error:', resetData.error);
      process.exit(1);
    }

    // 5. Intentar login con nueva contraseña
    console.log('\n5. Intentando login con nueva contraseña...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nutricionista@test.com',
        password: 'nuevaPassword123'
      })
    });
    const loginData = await loginRes.json();
    
    if (loginRes.ok) {
      console.log('✓ Login exitoso');
      console.log('✓ Usuario:', loginData.usuario.email);
    } else {
      console.log('❌ Error:', loginData.error);
      process.exit(1);
    }

    console.log('\n=== ✅ PRUEBA COMPLETADA EXITOSAMENTE ===\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

delay(2000).then(test);

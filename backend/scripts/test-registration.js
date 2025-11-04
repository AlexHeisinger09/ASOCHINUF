const API_URL = 'http://localhost:5000/api';

const test = async () => {
  try {
    console.log('\n=== PRUEBA DE REGISTRO ===\n');

    // 1. Registrar nuevo usuario
    console.log('1. Registrando nuevo usuario...');
    const newUser = {
      email: `usuario${Math.random().toString(36).substr(2, 9)}@test.com`,
      password: 'password123',
      nombre: 'Carlos',
      apellido: 'Pérez'
    };

    const regRes = await fetch(`${API_URL}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });

    const regData = await regRes.json();

    if (regRes.ok) {
      console.log('✓ Usuario registrado exitosamente');
      console.log('✓ Email:', regData.usuario.email);
      console.log('✓ Token JWT obtenido');
    } else {
      console.log('❌ Error:', regData.error);
      process.exit(1);
    }

    // 2. Login con el nuevo usuario
    console.log('\n2. Intentando login con el nuevo usuario...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newUser.email,
        password: newUser.password
      })
    });

    const loginData = await loginRes.json();

    if (loginRes.ok) {
      console.log('✓ Login exitoso');
      console.log('✓ Usuario:', loginData.usuario.email);
    } else {
      console.log('❌ Error en login:', loginData.error);
      process.exit(1);
    }

    console.log('\n=== ✅ PRUEBA COMPLETADA EXITOSAMENTE ===\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

setTimeout(test, 1000);

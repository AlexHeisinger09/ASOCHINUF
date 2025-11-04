import axios from 'axios';

async function testEndpoint() {
  try {
    // Get a valid token first by logging in as admin
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@asochinuf.cl',
      password: 'admin123'
    });

    const token = loginRes.data.token;
    console.log('✓ Got token');

    // Now test the getAllCursos endpoint
    const res = await axios.get('http://localhost:5000/api/cursos', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✓ GET /api/cursos response:');
    console.log(`  Total cursos: ${res.data.length}`);
    res.data.forEach(c => {
      console.log(`  [${c.estado}] ${c.nombre}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
    process.exit(1);
  }
}

setTimeout(testEndpoint, 1000);

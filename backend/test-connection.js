import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

console.log('🔍 Intentando conectar a Neon...');
console.log('📍 Conexión URL:', process.env.DATABASE_URL ? '✓ Configurada' : '✗ No configurada');
console.log('🔒 NODE_ENV:', process.env.NODE_ENV);
console.log('');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error de conexión:', err.message);
    console.error('Código de error:', err.code);
    console.error('Detalles completos:', err);
    process.exit(1);
  } else {
    console.log('✅ ¡Conexión exitosa!');
    console.log('📊 Hora del servidor:', res.rows[0].now);
    process.exit(0);
  }
});

setTimeout(() => {
  console.error('❌ Timeout: La conexión tardó demasiado');
  process.exit(1);
}, 10000);

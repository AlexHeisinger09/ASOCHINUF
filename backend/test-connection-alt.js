import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

console.log('🔍 Intentando conectar a Neon usando Client...');
console.log('📍 DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'NO configurada');
console.log('');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
  rejectUnauthorized: false,
});

client.connect((err) => {
  if (err) {
    console.error('❌ Error de conexión:', err.message);
    console.error('Código:', err.code);
    process.exit(1);
  } else {
    console.log('✅ ¡Conexión exitosa con Client!');

    client.query('SELECT NOW(), version()', (err, res) => {
      if (err) {
        console.error('❌ Error en query:', err);
        process.exit(1);
      }

      console.log('📊 Hora del servidor:', res.rows[0].now);
      console.log('🗄️  PostgreSQL versión:', res.rows[0].version.substring(0, 50) + '...');

      // Obtener tablas
      client.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name",
        (err, res) => {
          if (err) {
            console.error('Error obteniendo tablas:', err);
          } else {
            console.log('\n📋 Tablas en la BD:');
            res.rows.forEach(row => {
              console.log(`  ✓ ${row.table_name}`);
            });
          }

          client.end();
          process.exit(0);
        }
      );
    });
  }
});

setTimeout(() => {
  console.error('❌ Timeout: La conexión tardó demasiado (20 segundos)');
  process.exit(1);
}, 20000);

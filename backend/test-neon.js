import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

console.log('🔍 Probando conexión con Neon serverless...\n');

try {
  const result = await sql`SELECT NOW(), version()`;
  console.log('✅ ¡Conexión exitosa!\n');
  console.log('📊 Resultado:');
  console.log('  Hora:', result[0].now);
  console.log('  Versión:', result[0].version.substring(0, 60) + '...\n');

  // Obtener tablas
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema='public'
    ORDER BY table_name
  `;

  console.log('📋 Tablas en la BD:');
  tables.forEach(row => {
    console.log(`  ✓ ${row.table_name}`);
  });

  console.log('\n✅ Todo funcionando correctamente!');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

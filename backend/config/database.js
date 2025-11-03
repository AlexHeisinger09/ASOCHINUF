import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Usar Neon serverless para mejor rendimiento
const sql = neon(process.env.DATABASE_URL);

// Crear un objeto compatible con las queries existentes
const pool = {
  query: async (text, params) => {
    try {
      const result = await sql(text, params);
      return {
        rows: result,
        rowCount: result.length,
      };
    } catch (error) {
      console.error('❌ Error en la consulta:', error.message);
      throw error;
    }
  },
};

console.log('✅ Conectado a Neon con serverless');

export default pool;

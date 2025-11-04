import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const agregarCampoFoto = async () => {
  try {
    console.log('Agregando campo foto a t_usuarios...\n');

    // Agregar columna foto si no existe
    await pool.query(`
      ALTER TABLE t_usuarios
      ADD COLUMN IF NOT EXISTS foto VARCHAR(500) DEFAULT NULL;
    `);

    console.log('✅ Campo foto agregado exitosamente a t_usuarios');
    console.log('   - Tipo: VARCHAR(500)');
    console.log('   - Default: NULL');
    console.log('   - Almacenará la URL o ruta de la foto de perfil\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al agregar campo foto:', error.message);
    process.exit(1);
  }
};

agregarCampoFoto();

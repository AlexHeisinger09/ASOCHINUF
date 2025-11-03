import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const limpiarBD = async () => {
  try {
    console.log('Limpiando base de datos...\\n');

    // Eliminar tablas en orden inverso de dependencias
    const tables = [
      't_excel_uploads',
      't_recovery_tokens',
      't_informe_antropometrico',
      't_sesion_mediciones',
      't_planteles',
      't_inscripciones',
      't_cursos',
      't_nutricionistas',
      't_clientes',
      't_pacientes',
      't_usuarios',
    ];

    for (const table of tables) {
      try {
        await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
        console.log(`✓ Tabla ${table} eliminada`);
      } catch (error) {
        console.log(`! Tabla ${table} no existía`);
      }
    }

    console.log('\\n✓ Base de datos limpiada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error al limpiar la base de datos:', error);
    process.exit(1);
  }
};

limpiarBD();

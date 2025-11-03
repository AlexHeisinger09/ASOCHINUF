import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createTestUser = async () => {
  try {
    console.log('Creando usuario de prueba...\n');

    const email = 'nutricionista@test.com';
    const password = 'test123';
    const nombre = 'Juan';
    const apellido = 'García';
    const tipo_perfil = 'nutricionista';

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const result = await pool.query(
      `INSERT INTO t_usuarios (email, password_hash, nombre, apellido, tipo_perfil, activo)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT (email) DO UPDATE SET password_hash = $2
       RETURNING id, email, nombre, apellido, tipo_perfil`,
      [email, hashedPassword, nombre, apellido, tipo_perfil]
    );

    const usuario = result.rows[0];
    console.log('✅ Usuario creado/actualizado:');
    console.log(`   ID: ${usuario.id}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Nombre: ${usuario.nombre} ${usuario.apellido}`);
    console.log(`   Tipo: ${usuario.tipo_perfil}`);
    console.log(`   Contraseña: ${password}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestUser();

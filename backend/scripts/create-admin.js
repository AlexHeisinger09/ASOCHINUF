import bcryptjs from 'bcryptjs';
import pool from '../config/database.js';

/**
 * Script para crear el primer usuario administrador
 * Uso: node backend/scripts/create-admin.js
 *
 * Credenciales por defecto:
 * Email: admin@asochinuf.com
 * Contraseña: Admin123456
 *
 * IMPORTANTE: Cambiar la contraseña después del primer login
 */

const crearAdminPorDefecto = async () => {
  try {
    const email = 'admin@asochinuf.com';
    const password = 'Admin123456';
    const nombre = 'Administrador';
    const apellido = 'Sistema';

    console.log('Creando usuario administrador...');
    console.log(`Email: ${email}`);
    console.log(`Nombre: ${nombre} ${apellido}`);

    // Verificar si el admin ya existe
    const usuarioExistente = await pool.query(
      'SELECT id FROM t_usuarios WHERE email = $1',
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      console.log('⚠️  El usuario administrador ya existe');
      process.exit(0);
    }

    // Hash de la contraseña
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    // Crear usuario admin
    const resultado = await pool.query(
      'INSERT INTO t_usuarios (email, password_hash, nombre, apellido, tipo_perfil, activo, fecha_registro) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id, email, nombre, apellido, tipo_perfil',
      [email, passwordHash, nombre, apellido, 'admin', true]
    );

    const usuario = resultado.rows[0];

    console.log('');
    console.log('✅ Usuario administrador creado exitosamente');
    console.log('');
    console.log('Detalles del usuario:');
    console.log(`  ID: ${usuario.id}`);
    console.log(`  Email: ${usuario.email}`);
    console.log(`  Nombre: ${usuario.nombre} ${usuario.apellido}`);
    console.log(`  Tipo: ${usuario.tipo_perfil}`);
    console.log('');
    console.log('⚠️  IMPORTANTE:');
    console.log('  1. Usa estas credenciales para tu primer login');
    console.log(`  2. Email: ${email}`);
    console.log(`  3. Contraseña: ${password}`);
    console.log('  4. CAMBIA LA CONTRASEÑA INMEDIATAMENTE después de iniciar sesión');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error.message);
    process.exit(1);
  }
};

crearAdminPorDefecto();

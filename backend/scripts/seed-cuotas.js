import pool from '../config/database.js';

const seedCuotas = async () => {
  try {
    console.log('🌱 Iniciando seed de cuotas...');

    // Obtener usuarios que son nutricionistas o admins
    const usuariosResult = await pool.query(
      `SELECT id, nombre, apellido, tipo_perfil FROM t_usuarios WHERE tipo_perfil IN ('nutricionista', 'admin') ORDER BY id`
    );

    if (usuariosResult.rows.length === 0) {
      console.log('❌ No hay usuarios nutricionistas o admins en el sistema');
      process.exit(1);
    }

    console.log(`✓ Encontrados ${usuariosResult.rows.length} usuarios para crear cuotas`);

    // Crear cuotas para cada usuario
    const meses = [11, 12, 1];
    const anos = [2024, 2025];
    let cuotasCreadas = 0;

    for (const usuario of usuariosResult.rows) {
      for (const ano of anos) {
        for (const mes of meses) {
          // Saltar algunos meses para simular pagos parciales
          const estado = Math.random() > 0.4 ? 'pendiente' : 'pagado';
          const monto = 50000 + Math.floor(Math.random() * 30000);
          const fechaVencimiento = new Date(ano, mes - 1, 28).toISOString().split('T')[0];

          try {
            await pool.query(
              `INSERT INTO t_cuotas_mensuales (usuario_id, mes, ano, monto, estado, fecha_vencimiento, descripcion)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (usuario_id, mes, ano) DO NOTHING`,
              [
                usuario.id,
                mes,
                ano,
                monto,
                estado,
                fechaVencimiento,
                `Cuota mensual - ${usuario.nombre} ${usuario.apellido}`
              ]
            );
            cuotasCreadas++;
          } catch (err) {
            console.log(`⚠️ Cuota ya existe para usuario ${usuario.id}, mes ${mes}, año ${ano}`);
          }
        }
      }
    }

    console.log(`✅ Se crearon/actualizaron ${cuotasCreadas} cuotas`);
    console.log('\n📋 Resumen de cuotas por usuario:');

    const resumenResult = await pool.query(`
      SELECT
        u.id,
        u.nombre,
        u.apellido,
        u.tipo_perfil,
        COUNT(*) as total_cuotas,
        SUM(CASE WHEN c.estado = 'pagado' THEN 1 ELSE 0 END) as pagadas,
        SUM(CASE WHEN c.estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(c.monto) as monto_total
      FROM t_usuarios u
      LEFT JOIN t_cuotas_mensuales c ON u.id = c.usuario_id
      WHERE u.tipo_perfil IN ('nutricionista', 'admin')
      GROUP BY u.id, u.nombre, u.apellido, u.tipo_perfil
      ORDER BY u.id
    `);

    resumenResult.rows.forEach(row => {
      console.log(`
  ${row.nombre} ${row.apellido} (${row.tipo_perfil})
  ├─ Total cuotas: ${row.total_cuotas || 0}
  ├─ Pagadas: ${row.pagadas || 0}
  ├─ Pendientes: ${row.pendientes || 0}
  └─ Monto total: CLP $${Number(row.monto_total || 0).toLocaleString('es-CL')}
      `);
    });

    console.log('✨ ¡Seed completado exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante seed:', error);
    process.exit(1);
  }
};

seedCuotas();

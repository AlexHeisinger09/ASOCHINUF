import pool from '../config/database.js';

const seedCuotas = async () => {
  try {
    console.log('🌱 Iniciando seed de cuotas...');

    // Limpiar tablas existentes (en orden de dependencias)
    console.log('Limpiando tablas de cuotas previas...');
    await pool.query('DELETE FROM t_pagos_cuotas;');
    await pool.query('DELETE FROM t_cuotas_usuario;');
    await pool.query('DELETE FROM t_cuotas_mensuales;');
    console.log('✓ Tablas limpias\n');

    // PASO 1: Crear cuotas globales (mensuales)
    console.log('Creando cuotas mensuales globales...');
    const meses = [11, 12, 1];
    const anos = [2024, 2025];
    const cuotasGlobales = [];
    let cuotasGlobalesCreadas = 0;

    for (const ano of anos) {
      for (const mes of meses) {
        const monto = 50000 + Math.floor(Math.random() * 30000);
        const fechaVencimiento = new Date(ano, mes - 1, 28).toISOString().split('T')[0];

        try {
          const result = await pool.query(
            `INSERT INTO t_cuotas_mensuales (mes, ano, monto, fecha_vencimiento, descripcion)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (mes, ano) DO UPDATE SET monto = $3, fecha_vencimiento = $4
             RETURNING id`,
            [
              mes,
              ano,
              monto,
              fechaVencimiento,
              `Cuota mensual - ${mes}/${ano}`
            ]
          );

          const cuotaId = result.rows[0].id;
          cuotasGlobales.push({ id: cuotaId, mes, ano, monto, fechaVencimiento });
          cuotasGlobalesCreadas++;
        } catch (err) {
          console.log(`⚠️ Error creando cuota global ${mes}/${ano}:`, err.message);
        }
      }
    }

    console.log(`✅ Se crearon/actualizaron ${cuotasGlobalesCreadas} cuotas globales\n`);

    // PASO 2: Obtener usuarios admin y nutricionista
    console.log('Obteniendo usuarios para asignar cuotas...');
    const usuariosResult = await pool.query(
      `SELECT id, nombre, apellido, tipo_perfil FROM t_usuarios
       WHERE tipo_perfil IN ('nutricionista', 'admin')
       ORDER BY id`
    );

    if (usuariosResult.rows.length === 0) {
      console.log('❌ No hay usuarios nutricionistas o admins en el sistema');
      process.exit(1);
    }

    console.log(`✓ Encontrados ${usuariosResult.rows.length} usuarios\n`);

    // PASO 3: Asignar cada cuota global a cada usuario
    console.log('Asignando cuotas a usuarios...');
    let cuotasUsuarioCreadas = 0;

    for (const usuario of usuariosResult.rows) {
      for (const cuota of cuotasGlobales) {
        // Simular algunos pagos completados
        const estado = Math.random() > 0.4 ? 'pendiente' : 'pagado';

        try {
          await pool.query(
            `INSERT INTO t_cuotas_usuario (usuario_id, cuota_id, estado)
             VALUES ($1, $2, $3)
             ON CONFLICT (usuario_id, cuota_id) DO UPDATE SET estado = $3`,
            [usuario.id, cuota.id, estado]
          );
          cuotasUsuarioCreadas++;
        } catch (err) {
          console.log(`⚠️ Error asignando cuota ${cuota.mes}/${cuota.ano} a usuario ${usuario.id}`);
        }
      }
    }

    console.log(`✅ Se asignaron ${cuotasUsuarioCreadas} cuotas a usuarios\n`);

    // PASO 4: Resumen final
    console.log('📋 Resumen de cuotas globales:');
    const resumenGlobalResult = await pool.query(`
      SELECT
        mes,
        ano,
        monto,
        fecha_vencimiento,
        (SELECT COUNT(*) FROM t_cuotas_usuario cu WHERE cu.cuota_id = tcm.id) as usuarios_asignados,
        (SELECT COUNT(*) FROM t_cuotas_usuario cu WHERE cu.cuota_id = tcm.id AND cu.estado = 'pagado') as usuarios_pagados
      FROM t_cuotas_mensuales tcm
      ORDER BY ano DESC, mes DESC
    `);

    resumenGlobalResult.rows.forEach(row => {
      console.log(`
  Mes ${row.mes}/${row.ano}
  ├─ Monto: CLP $${Number(row.monto).toLocaleString('es-CL')}
  ├─ Vencimiento: ${row.fecha_vencimiento}
  ├─ Usuarios asignados: ${row.usuarios_asignados}
  └─ Usuarios que pagaron: ${row.usuarios_pagados}
      `);
    });

    console.log('\n📊 Resumen por usuario:');
    const resumenUsuarioResult = await pool.query(`
      SELECT
        u.id,
        u.nombre,
        u.apellido,
        u.tipo_perfil,
        COUNT(cu.id) as total_cuotas,
        SUM(CASE WHEN cu.estado = 'pagado' THEN 1 ELSE 0 END) as pagadas,
        SUM(CASE WHEN cu.estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(tcm.monto) as monto_total
      FROM t_usuarios u
      LEFT JOIN t_cuotas_usuario cu ON u.id = cu.usuario_id
      LEFT JOIN t_cuotas_mensuales tcm ON cu.cuota_id = tcm.id
      WHERE u.tipo_perfil IN ('nutricionista', 'admin')
      GROUP BY u.id, u.nombre, u.apellido, u.tipo_perfil
      ORDER BY u.id
    `);

    resumenUsuarioResult.rows.forEach(row => {
      console.log(`
  ${row.nombre} ${row.apellido} (${row.tipo_perfil})
  ├─ Total cuotas: ${row.total_cuotas || 0}
  ├─ Pagadas: ${row.pagadas || 0}
  ├─ Pendientes: ${row.pendientes || 0}
  └─ Monto total: CLP $${Number(row.monto_total || 0).toLocaleString('es-CL')}
      `);
    });

    console.log('\n✨ ¡Seed completado exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante seed:', error);
    process.exit(1);
  }
};

seedCuotas();

import pool from '../config/database.js';

async function testDuplicateDetection() {
  try {
    console.log('🔍 Probando detección de duplicados en carga de Excel...\n');

    // 1. Limpiar datos previos de prueba
    console.log('🧹 Limpiando registros de prueba previos...');
    await pool.query(`DELETE FROM t_informe_antropometrico WHERE paciente_id IN (
      SELECT id FROM t_pacientes WHERE nombre IN ('Juan Pérez Prueba', 'María García Prueba')
    )`);
    await pool.query(`DELETE FROM t_pacientes WHERE nombre IN ('Juan Pérez Prueba', 'María García Prueba')`);
    await pool.query(`DELETE FROM t_sesion_mediciones WHERE plantel_id IN (
      SELECT id FROM t_planteles WHERE nombre IN ('Plantel Test A', 'Plantel Test B')
    )`);
    await pool.query(`DELETE FROM t_planteles WHERE nombre IN ('Plantel Test A', 'Plantel Test B')`);
    console.log('✅ Datos de prueba limpiados\n');

    // 2. Crear planteles de prueba
    console.log('📍 Creando planteles de prueba...');
    const plantel1 = await pool.query(
      `INSERT INTO t_planteles (nombre) VALUES ($1) RETURNING id`,
      ['Plantel Test A']
    );
    const plantelId1 = plantel1.rows[0].id;

    const plantel2 = await pool.query(
      `INSERT INTO t_planteles (nombre) VALUES ($1) RETURNING id`,
      ['Plantel Test B']
    );
    const plantelId2 = plantel2.rows[0].id;
    console.log(`✅ Planteles creados: ${plantelId1}, ${plantelId2}\n`);

    // 3. Crear paciente de prueba
    console.log('👤 Creando paciente de prueba...');
    const paciente = await pool.query(
      `INSERT INTO t_pacientes (nombre, activo, fecha_registro) VALUES ($1, true, NOW()) RETURNING id`,
      ['Juan Pérez Prueba']
    );
    const pacienteId = paciente.rows[0].id;
    console.log(`✅ Paciente creado: ${pacienteId}\n`);

    // 4. Crear sesiones de prueba con DIFERENTES planteles
    console.log('📅 Creando sesiones de mediciones...');
    const sesion1 = await pool.query(
      `INSERT INTO t_sesion_mediciones (plantel_id, nutricionista_id, fecha_sesion, nombre_archivo, cantidad_registros)
       VALUES ($1, 1, '2025-11-04', 'test_plantel_a.xlsx', 0) RETURNING id`,
      [plantelId1]
    );
    const sesionId1 = sesion1.rows[0].id;

    const sesion2 = await pool.query(
      `INSERT INTO t_sesion_mediciones (plantel_id, nutricionista_id, fecha_sesion, nombre_archivo, cantidad_registros)
       VALUES ($1, 1, '2025-11-04', 'test_plantel_b.xlsx', 0) RETURNING id`,
      [plantelId2]
    );
    const sesionId2 = sesion2.rows[0].id;
    console.log(`✅ Sesiones creadas: ${sesionId1}, ${sesionId2}\n`);

    // 5. PRIMERA CARGA: Insertar registro en sesión 1
    console.log('📊 PRIMER ARCHIVO CARGADO (Plantel A)');
    console.log('   Insertando: Juan Pérez Prueba, fecha_medicion: 2025-11-01');

    const insertar1 = await pool.query(
      `INSERT INTO t_informe_antropometrico
       (paciente_id, nutricionista_id, sesion_id, peso, talla, fecha_medicion, fecha_registro)
       VALUES ($1, 1, $2, 70.5, 175, '2025-11-01', NOW()) RETURNING id`,
      [pacienteId, sesionId1]
    );
    console.log(`   ✅ Registro insertado: ID ${insertar1.rows[0].id}\n`);

    // 6. SEGUNDA CARGA: Intentar insertar registro IDÉNTICO en sesión 2 (diferente plantel)
    console.log('📊 SEGUNDO ARCHIVO CARGADO (Plantel B - mismo paciente, misma fecha)');
    console.log('   Intentando insertar: Juan Pérez Prueba, fecha_medicion: 2025-11-01');

    // Simular la lógica de detección de duplicados del excelController
    const duplicateCheck = await pool.query(
      `SELECT id FROM t_informe_antropometrico ia
       WHERE ia.paciente_id = $1
       AND (ia.fecha_medicion::date = $2::date OR ($2 IS NULL AND ia.fecha_medicion IS NULL))`,
      [pacienteId, '2025-11-01']
    );

    if (duplicateCheck.rows.length > 0) {
      console.log(`   ⚠️  DUPLICADO DETECTADO! ID existente: ${duplicateCheck.rows[0].id}`);
      console.log(`   ✅ Registro NO será insertado (correcto)\n`);
    } else {
      console.log(`   ❌ NO SE DETECTÓ DUPLICADO (error - debería haber detectado)\n`);
    }

    // 7. Verificar estado de la base de datos
    console.log('📋 Estado actual de registros:');
    const resultado = await pool.query(
      `SELECT
        p.nombre as paciente,
        ia.fecha_medicion,
        sm.id as sesion_id,
        pt.nombre as plantel
       FROM t_informe_antropometrico ia
       JOIN t_pacientes p ON ia.paciente_id = p.id
       JOIN t_sesion_mediciones sm ON ia.sesion_id = sm.id
       JOIN t_planteles pt ON sm.plantel_id = pt.id
       WHERE p.nombre = $1
       ORDER BY sm.id, ia.fecha_medicion`,
      ['Juan Pérez Prueba']
    );

    resultado.rows.forEach((row, idx) => {
      console.log(`  ${idx + 1}. ${row.paciente} | Fecha: ${row.fecha_medicion} | Sesión: ${row.sesion_id} | Plantel: ${row.plantel}`);
    });
    console.log(`\nTotal de registros: ${resultado.rows.length}`);
    console.log('✅ Debe haber SOLO 1 registro (el duplicado fue evitado)\n');

    // Limpiar
    console.log('🧹 Limpiando datos de prueba...');
    await pool.query(`DELETE FROM t_informe_antropometrico WHERE paciente_id = $1`, [pacienteId]);
    await pool.query(`DELETE FROM t_pacientes WHERE id = $1`, [pacienteId]);
    await pool.query(`DELETE FROM t_sesion_mediciones WHERE plantel_id IN ($1, $2)`, [plantelId1, plantelId2]);
    await pool.query(`DELETE FROM t_planteles WHERE id IN ($1, $2)`, [plantelId1, plantelId2]);
    console.log('✅ Limpieza completada\n');

    console.log('✅ Prueba de detección de duplicados completada correctamente!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testDuplicateDetection();

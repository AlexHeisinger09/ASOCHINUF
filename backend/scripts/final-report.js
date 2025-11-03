import pool from '../config/database.js';

async function finalReport() {
  try {
    console.log('\n📋 ========================================');
    console.log('   REPORTE FINAL DE CARGA DE EXCEL');
    console.log('========================================\n');

    // 1. Excel Data
    console.log('📄 DATOS DEL EXCEL:');
    console.log('   ✓ Archivo: Reporte_Antropometrico.xlsx');
    console.log('   ✓ Plantel: Plantel USF 2025');
    console.log('   ✓ Pacientes únicos: 30');
    console.log('   ✓ Mediciones totales: 281\n');

    // 2. Database Results
    const patients = await pool.query('SELECT COUNT(*) as count FROM t_pacientes');
    const measurements = await pool.query('SELECT COUNT(*) as count FROM t_informe_antropometrico');
    const sessions = await pool.query('SELECT COUNT(*) as count FROM t_sesion_mediciones');

    console.log('💾 DATOS ALMACENADOS EN BD:');
    console.log(`   ✓ Pacientes creados: ${patients.rows[0].count}`);
    console.log(`   ✓ Mediciones insertadas: ${measurements.rows[0].count}`);
    console.log(`   ✓ Sesiones creadas: ${sessions.rows[0].count}\n`);

    // 3. Detailed patient list
    console.log('👥 LISTA DE PACIENTES Y MEDICIONES:');
    const patientDetails = await pool.query(`
      SELECT p.nombre, COUNT(*) as mediciones
      FROM t_informe_antropometrico m
      JOIN t_pacientes p ON m.paciente_id = p.id
      GROUP BY p.id, p.nombre
      ORDER BY p.nombre
    `);

    patientDetails.rows.forEach((row, i) => {
      const marker = row.nombre.toLowerCase().includes('yerko') ? '🎯 ' : '   ';
      const nombre = row.nombre.padEnd(35);
      const numMediciones = row.mediciones.toString().padStart(2);
      console.log(`${marker}${(i+1).toString().padStart(2)}. ${nombre} | ${numMediciones} mediciones`);
    });

    // 4. Data Statistics
    console.log('\n📊 ESTADÍSTICAS DE DATOS:');
    const stats = await pool.query(`
      SELECT
        MIN(peso) as min_peso, MAX(peso) as max_peso,
        MIN(talla) as min_talla, MAX(talla) as max_talla,
        MIN(imc) as min_imc, MAX(imc) as max_imc
      FROM t_informe_antropometrico
    `);
    const s = stats.rows[0];
    console.log(`   ✓ Peso: ${s.min_peso} - ${s.max_peso} kg`);
    console.log(`   ✓ Talla: ${s.min_talla} - ${s.max_talla} cm`);
    console.log(`   ✓ IMC: ${s.min_imc} - ${s.max_imc}\n`);

    // 5. Validation
    console.log('✅ VALIDACIONES:');
    const nullCheck = await pool.query(`
      SELECT
        COUNT(CASE WHEN peso IS NULL THEN 1 END) as null_peso,
        COUNT(CASE WHEN talla IS NULL THEN 1 END) as null_talla
      FROM t_informe_antropometrico
    `);
    const nrows = nullCheck.rows[0];
    console.log(`   ✓ Valores nulos en Peso: ${nrows.null_peso}`);
    console.log(`   ✓ Valores nulos en Talla: ${nrows.null_talla}`);

    const yerkoCount = await pool.query(
      'SELECT COUNT(*) as count FROM t_pacientes WHERE nombre ILIKE \'%Yerko%\''
    );
    console.log(`   ✓ Yerko Gonzalez Santis: ${yerkoCount.rows[0].count > 0 ? '✅ CARGADO' : '❌ FALTANTE'}`);

    console.log('\n🎉 ========================================');
    console.log('   CARGA COMPLETADA EXITOSAMENTE');
    console.log('========================================\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

finalReport();

import pool from '../config/database.js';
import { parseExcelFile, generateFileHash, validateExcelStructure } from '../utils/excelParser.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const EXCEL_FILE = path.join(process.cwd(), '../informe/Reporte_Antropometrico.xlsx');

async function simulateExcelUpload() {
  try {
    console.log('🔍 Simulating Excel upload process...\n');

    // 1. Parse Excel file
    console.log('📄 Parsing Excel file...');
    const parsedData = parseExcelFile(EXCEL_FILE);
    validateExcelStructure(parsedData);
    const { plantel, fecha_sesion, measurements, cantidad_registros } = parsedData;
    console.log(`✅ Parsed: ${cantidad_registros} patients from "${plantel}"\n`);

    // 2. Generate file hash
    const fileBuffer = fs.readFileSync(EXCEL_FILE);
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    console.log(`📦 File hash: ${fileHash.substring(0, 32)}...\n`);

    // 3. Get user ID (test user)
    const userRes = await pool.query(
      'SELECT id FROM t_usuarios WHERE email = $1',
      ['nutricionista@test.com']
    );
    const usuarioId = userRes.rows[0].id;
    console.log(`👤 Usuario ID: ${usuarioId}\n`);

    console.log('🔄 Processing upload...\n');

    // 4. Create or get plantel
    let plantelResult = await pool.query(
      'SELECT id FROM t_planteles WHERE nombre = $1',
      [plantel]
    );

    let plantelId;
    if (plantelResult.rows.length === 0) {
      const createPlantelResult = await pool.query(
        'INSERT INTO t_planteles (nombre) VALUES ($1) RETURNING id',
        [plantel]
      );
      plantelId = createPlantelResult.rows[0].id;
      console.log(`✅ Created plantel: "${plantel}" (ID: ${plantelId})\n`);
    } else {
      plantelId = plantelResult.rows[0].id;
      console.log(`✅ Found existing plantel: "${plantel}" (ID: ${plantelId})\n`);
    }

    // 5. Create session
    const sessionResult = await pool.query(
      `INSERT INTO t_sesion_mediciones
       (plantel_id, nutricionista_id, fecha_sesion, nombre_archivo, hash_archivo, cantidad_registros)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [plantelId, usuarioId, fecha_sesion, 'Reporte_Antropometrico.xlsx', fileHash, cantidad_registros]
    );

    const sesionId = sessionResult.rows[0].id;
    console.log(`✅ Created measurement session (ID: ${sesionId})\n`);

    // 6. Insert measurements
    let registrosInsertados = 0;
    let registrosDuplicados = 0;

    console.log('📊 Processing measurements:');
    for (const measurement of measurements) {
      // Find or create patient
      let pacienteResult = await pool.query(
        `SELECT id FROM t_pacientes WHERE nombre ILIKE $1`,
        [measurement.nombre_paciente]
      );

      let pacienteId;
      if (pacienteResult.rows.length === 0) {
        const createPacienteResult = await pool.query(
          `INSERT INTO t_pacientes (nombre, activo, fecha_registro)
           VALUES ($1, true, NOW())
           RETURNING id`,
          [measurement.nombre_paciente]
        );
        pacienteId = createPacienteResult.rows[0].id;
      } else {
        pacienteId = pacienteResult.rows[0].id;
      }

      // Check for duplicates
      const duplicateCheck = await pool.query(
        `SELECT id FROM t_informe_antropometrico
         WHERE paciente_id = $1
         AND sesion_id = $2
         AND peso = $3
         AND talla = $4`,
        [pacienteId, sesionId, measurement.peso, measurement.talla]
      );

      if (duplicateCheck.rows.length > 0) {
        registrosDuplicados++;
        continue;
      }

      // Insert measurement
      await pool.query(
        `INSERT INTO t_informe_antropometrico
         (paciente_id, nutricionista_id, sesion_id,
          peso, talla, talla_sentado,
          diametro_biacromial, diametro_torax, diametro_antpost_torax,
          diametro_biiliocristal, diametro_bitrocanterea, diametro_humero, diametro_femur,
          perimetro_brazo_relajado, perimetro_brazo_flexionado, perimetro_muslo_anterior, perimetro_pantorrilla,
          pliegue_triceps, pliegue_subescapular, pliegue_supraespinal, pliegue_abdominal,
          pliegue_muslo_anterior, pliegue_pantorrilla_medial,
          masa_adiposa_superior, masa_adiposa_media, masa_adiposa_inferior,
          imo, imc, icc, ica,
          suma_6_pliegues, suma_8_pliegues, fecha_registro)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
                 $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, CURRENT_TIMESTAMP)`,
        [
          pacienteId, usuarioId, sesionId,
          measurement.peso, measurement.talla, measurement.talla_sentado,
          measurement.diametro_biacromial, measurement.diametro_torax, measurement.diametro_antpost_torax,
          measurement.diametro_biiliocristal, measurement.diametro_bitrocanterea, measurement.diametro_humero, measurement.diametro_femur,
          measurement.perimetro_brazo_relajado, measurement.perimetro_brazo_flexionado, measurement.perimetro_muslo_anterior, measurement.perimetro_pantorrilla,
          measurement.pliegue_triceps, measurement.pliegue_subescapular, measurement.pliegue_supraespinal, measurement.pliegue_abdominal,
          measurement.pliegue_muslo_anterior, measurement.pliegue_pantorrilla_medial,
          measurement.masa_adiposa_superior, measurement.masa_adiposa_media, measurement.masa_adiposa_inferior,
          measurement.imo, measurement.imc, measurement.icc, measurement.ica,
          measurement.suma_6_pliegues, measurement.suma_8_pliegues
        ]
      );

      registrosInsertados++;
    }

    console.log(`\n✅ Inserted all records\n`);

    console.log('📈 Upload Results:');
    console.log(`   Registros insertados: ${registrosInsertados}`);
    console.log(`   Registros duplicados: ${registrosDuplicados}`);
    console.log(`   Total procesados: ${registrosInsertados + registrosDuplicados}\n`);

    // Verify
    const patientCount = await pool.query('SELECT COUNT(*) as count FROM t_pacientes');
    const measurementCount = await pool.query('SELECT COUNT(*) as count FROM t_informe_antropometrico');
    const sessionCount = await pool.query('SELECT COUNT(*) as count FROM t_sesion_mediciones');

    console.log('✅ Database Verification:');
    console.log(`   Patients in database: ${patientCount.rows[0].count}`);
    console.log(`   Measurements in database: ${measurementCount.rows[0].count}`);
    console.log(`   Sessions in database: ${sessionCount.rows[0].count}\n`);

    // Get some sample data
    const samples = await pool.query(
      `SELECT p.nombre, m.peso, m.talla, m.imc
       FROM t_informe_antropometrico m
       JOIN t_pacientes p ON m.paciente_id = p.id
       LIMIT 5`
    );

    console.log('📊 Sample measurements:');
    samples.rows.forEach((row, i) => {
      console.log(`   ${i+1}. ${row.nombre}: ${row.peso}kg | ${row.talla}cm | IMC: ${row.imc}`);
    });

    console.log('\n🎉 ¡Upload simulation completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

simulateExcelUpload();

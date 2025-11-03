import { parseExcelFile } from '../utils/excelParser.js';
import path from 'path';

const excelPath = path.join(process.cwd(), '../informe/Reporte_Antropometrico.xlsx');

try {
  console.log('🔍 Verificando todos los pacientes del Excel...\n');

  const parsedData = parseExcelFile(excelPath);
  const { measurements, cantidad_registros } = parsedData;

  // Obtener pacientes únicos
  const uniquePatients = new Set(measurements.map(m => m.nombre_paciente));
  const patientsList = Array.from(uniquePatients).sort();

  console.log(`📊 Total de mediciones: ${cantidad_registros}`);
  console.log(`👥 Pacientes únicos: ${patientsList.length}\n`);

  console.log('Lista de pacientes:');
  patientsList.forEach((patient, i) => {
    const count = measurements.filter(m => m.nombre_paciente === patient).length;
    console.log(`${(i+1).toString().padStart(2)}. ${patient.padEnd(35)} | Mediciones: ${count}`);
  });

  // Verificar si Yerko está incluido
  const hasYerko = patientsList.some(p => p.toLowerCase().includes('yerko'));
  console.log(`\n${hasYerko ? '✅' : '❌'} Yerko Gonzalez Santis ${hasYerko ? 'ENCONTRADO' : 'FALTANTE'}`);

  console.log(`\n✅ Verificación completada`);
  process.exit(0);

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

import { parseExcelFile } from '../utils/excelParser.js';
import path from 'path';

const EXCEL_FILE = path.join(process.cwd(), '../informe/Reporte_Antropometrico.xlsx');

try {
  console.log('🔍 Debugging fecha_medicion parsing...\n');

  const parsedData = parseExcelFile(EXCEL_FILE);
  const { measurements } = parsedData;

  // Get first patient's measurements to see if dates vary
  const axelMeasurements = measurements.filter(m => m.nombre_paciente === 'Axel Leon Garcia');

  console.log(`📊 ${axelMeasurements.length} mediciones de Axel Leon Garcia:\n`);

  axelMeasurements.slice(0, 5).forEach((m, i) => {
    console.log(`Medición ${i + 1}:`);
    console.log(`  fecha_medicion: ${m.fecha_medicion}`);
    console.log(`  peso: ${m.peso}`);
    console.log(`  talla: ${m.talla}`);
    console.log();
  });

  // Check if all measurements have fecha_medicion
  const withDate = measurements.filter(m => m.fecha_medicion).length;
  const withoutDate = measurements.filter(m => !m.fecha_medicion).length;

  console.log(`\n📈 Estadísticas de fecha_medicion:`);
  console.log(`  ✅ Mediciones con fecha: ${withDate}`);
  console.log(`  ❌ Mediciones sin fecha: ${withoutDate}`);
  console.log(`  Total: ${measurements.length}`);

  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

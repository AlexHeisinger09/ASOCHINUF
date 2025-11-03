import XLSX from 'xlsx';
import path from 'path';

const excelPath = path.join(process.cwd(), '../informe/Reporte_Antropometrico.xlsx');
const workbook = XLSX.readFile(excelPath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

console.log('🔍 Deep inspection of Excel structure...\n');

let currentPatient = null;
let rowCount = 0;

for (let rowNum = 6; rowNum <= 50; rowNum++) {
  const cellA = worksheet[`A${rowNum}`];
  const cellB = worksheet[`B${rowNum}`];
  const cellD = worksheet[`D${rowNum}`];
  const cellE = worksheet[`E${rowNum}`];

  const valueA = cellA ? cellA.v : '';
  const valueB = cellB ? cellB.v : '';
  const valueD = cellD ? cellD.v : '';
  const valueE = cellE ? cellE.v : '';

  // Track patient names
  if (valueA && valueA !== '' && !valueA.match(/^\\d+$/) && valueA !== 'VACÍO' && !valueA.includes('Informes')) {
    currentPatient = valueA;
  }

  console.log(`Row ${rowNum}:`);
  console.log(`  A${rowNum}: ${valueA || '(vacío)'}`);
  console.log(`  B${rowNum} (fecha): ${valueB || '(vacío)'} ${typeof valueB === 'number' ? '(number)' : ''}`);
  console.log(`  D${rowNum} (peso): ${valueD || '(vacío)'}`);
  console.log(`  E${rowNum} (talla): ${valueE || '(vacío)'}`);
  console.log(`  Current patient: ${currentPatient || 'N/A'}`);
  console.log();

  rowCount++;
  if (rowCount >= 15) break; // Just show first 15 rows after header
}

process.exit(0);

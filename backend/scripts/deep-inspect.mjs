import XLSX from 'xlsx';
import path from 'path';

const excelPath = path.join(process.cwd(), '../informe/Reporte_Antropometrico.xlsx');

const workbook = XLSX.readFile(excelPath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

console.log('🔍 Inspección profunda del Excel:\n');

// Ver celdas clave
console.log('📍 Celdas importantes:');
console.log('  B2 (Plantel):', worksheet['B2']?.v);
console.log('  D3 (Fecha):', worksheet['D3']?.v);
console.log('  A5 (Header?):', worksheet['A5']?.v);
console.log('  A6 (Primer dato?):', worksheet['A6']?.v);
console.log('  A7:', worksheet['A7']?.v);

// Ver qué hay en filas 5-15 columna A
console.log('\n📋 Contenido de columna A (filas 5-20):');
for (let i = 5; i <= 20; i++) {
  const cell = worksheet[`A${i}`];
  const val = cell ? cell.v : 'VACÍO';
  console.log(`  A${i}: ${val}`);
}

// Buscar la primera fila con datos reales (con números)
console.log('\n🔎 Buscando estructura real...');
for (let row = 5; row <= 15; row++) {
  const cells = [];
  for (let col = 0; col < 5; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: col });
    const cell = worksheet[cellRef];
    cells.push(cell ? cell.v : '');
  }
  console.log(`Fila ${row}:`, cells.join(' | '));
}

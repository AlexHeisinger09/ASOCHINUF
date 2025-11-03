import XLSX from 'xlsx';
import path from 'path';

const excelPath = path.join(process.cwd(), '../informe/Reporte_Antropometrico.xlsx');
const workbook = XLSX.readFile(excelPath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

console.log('🔍 Estructura del Excel - Primeras filas:\n');
console.log('Fila 5 (Headers):');
for (let col = 'A'; col.charCodeAt(0) <= 'F'.charCodeAt(0); col = String.fromCharCode(col.charCodeAt(0) + 1)) {
  const cell = worksheet[col + '5'];
  console.log(`  ${col}5: ${cell ? cell.v : '(vacío)'}`);
}

console.log('\nFila 6 (Primer registro Axel Leon Garcia):');
for (let col = 'A'; col.charCodeAt(0) <= 'F'.charCodeAt(0); col = String.fromCharCode(col.charCodeAt(0) + 1)) {
  const cell = worksheet[col + '6'];
  console.log(`  ${col}6: ${cell ? cell.v : '(vacío)'}`);
}

console.log('\nFila 7 (Segunda medición Axel Leon Garcia):');
for (let col = 'A'; col.charCodeAt(0) <= 'F'.charCodeAt(0); col = String.fromCharCode(col.charCodeAt(0) + 1)) {
  const cell = worksheet[col + '7'];
  console.log(`  ${col}7: ${cell ? cell.v : '(vacío)'}`);
}

console.log('\nFila 8 (Tercera medición Axel Leon Garcia):');
for (let col = 'A'; col.charCodeAt(0) <= 'F'.charCodeAt(0); col = String.fromCharCode(col.charCodeAt(0) + 1)) {
  const cell = worksheet[col + '8'];
  console.log(`  ${col}8: ${cell ? cell.v : '(vacío)'}`);
}

process.exit(0);

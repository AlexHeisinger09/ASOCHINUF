import XLSX from 'xlsx';
import path from 'path';

const excelPath = path.join(process.cwd(), '../informe/Reporte_Antropometrico.xlsx');

try {
  const workbook = XLSX.readFile(excelPath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  // Ver headers desde la fila 5
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: 5 });

  if (jsonData.length > 0) {
    console.log('📋 Headers encontrados (desde fila 6):');
    const headers = Object.keys(jsonData[0]);
    headers.forEach((h, idx) => {
      console.log(`${idx + 1}. "${h}"`);
    });

    console.log('\n✅ Primer registro:');
    const firstRow = jsonData[0];
    Object.keys(firstRow).slice(0, 15).forEach(key => {
      console.log(`  ${key}: ${firstRow[key]}`);
    });

    console.log('\n📊 Total de registros:', jsonData.length);
  } else {
    console.log('❌ No hay datos desde la fila 6');

    // Intentar ver desde la fila 1
    console.log('\n🔍 Intentando desde la fila 1...');
    const jsonData2 = XLSX.utils.sheet_to_json(worksheet);
    if (jsonData2.length > 0) {
      console.log('Headers encontrados:');
      Object.keys(jsonData2[0]).slice(0, 10).forEach(h => console.log(`  - "${h}"`));
      console.log('\nPrimer registro:');
      const firstRow = jsonData2[0];
      Object.keys(firstRow).slice(0, 10).forEach(key => {
        console.log(`  ${key}: ${firstRow[key]}`);
      });
    }
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

import { default as XLSX } from 'xlsx';

try {
  const filePath = '/c/MisProyectosReact/ASOCHINUF/informe/Reporte_Antropometrico.xlsx';
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  console.log('📊 Información del archivo Excel:\n');
  console.log('Hojas:', workbook.SheetNames);
  console.log('Hoja actual:', workbook.SheetNames[0]);
  
  // Verificar estructura esperada
  const B2 = worksheet['B2'];
  const D3 = worksheet['D3'];
  const A5 = worksheet['A5'];
  
  console.log('\n📍 Celdas clave:');
  console.log('B2 (Plantel):', B2 ? B2.v : 'VACÍO');
  console.log('D3 (Fecha):', D3 ? D3.v : 'VACÍO');
  console.log('A5 (Header):', A5 ? A5.v : 'VACÍO');
  
  // Ver primeros headers
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: 5 });
  console.log('\n📋 Headers encontrados:');
  if (jsonData.length > 0) {
    const headers = Object.keys(jsonData[0]);
    headers.slice(0, 15).forEach(h => console.log('   -', h));
    if (headers.length > 15) {
      console.log('   ... y', headers.length - 15, 'más');
    }
  }
  
  console.log('\n📊 Total de filas de datos:', jsonData.length);
  console.log('\n✅ Primer registro (muestra):');
  if (jsonData.length > 0) {
    const firstRow = jsonData[0];
    Object.keys(firstRow).slice(0, 10).forEach(key => {
      console.log(`   ${key}: ${firstRow[key]}`);
    });
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

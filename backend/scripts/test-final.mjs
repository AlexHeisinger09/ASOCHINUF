import { parseExcelFile } from '../utils/excelParser.js';

try {
  const parser = parseExcelFile('../informe/Reporte_Antropometrico.xlsx');

  console.log('✅ ¡Éxito! Archivo parseado correctamente\n');
  console.log('📊 Resumen:');
  console.log('   Plantel:', parser.plantel);
  console.log('   Fecha sesión:', parser.fecha_sesion);
  console.log('   Total de pacientes cargados:', parser.cantidad_registros);

  console.log('\n👥 Primeros 10 pacientes:');
  parser.measurements.slice(0, 10).forEach((m, i) => {
    const nombre = m.nombre_paciente.padEnd(35);
    console.log(`   ${i+1}. ${nombre} | Peso: ${m.peso}kg | Talla: ${m.talla}cm | IMC: ${m.imc}`);
  });

  console.log('\n📈 Rango de datos:');
  const pesos = parser.measurements.filter(m => m.peso).map(m => m.peso);
  const tallas = parser.measurements.filter(m => m.talla).map(m => m.talla);
  const imcs = parser.measurements.filter(m => m.imc).map(m => m.imc);

  if (pesos.length > 0) {
    console.log(`   Peso: ${Math.min(...pesos)} - ${Math.max(...pesos)} kg`);
  }
  if (tallas.length > 0) {
    console.log(`   Talla: ${Math.min(...tallas)} - ${Math.max(...tallas)} cm`);
  }
  if (imcs.length > 0) {
    console.log(`   IMC: ${Math.min(...imcs).toFixed(1)} - ${Math.max(...imcs).toFixed(1)}`);
  }

  console.log('\n🎉 ¡Sistema listo para cargar el Excel!');
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

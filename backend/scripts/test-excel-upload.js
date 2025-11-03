import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:5001/api';
const EXCEL_FILE = 'c:\\MisProyectosReact\\ASOCHINUF\\informe\\Reporte_Antropometrico.xlsx';

const testExcelUpload = async () => {
  try {
    console.log('🧪 Iniciando prueba de carga de Excel...\n');

    // 1. Login como nutricionista
    console.log('1️⃣ Realizando login como nutricionista...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'nutricionista@test.com',
      password: 'test123',
    });

    const token = loginResponse.data.token;
    const usuario = loginResponse.data.usuario;
    console.log(`✅ Login exitoso: ${usuario.nombre} ${usuario.apellido}`);
    console.log(`   Token: ${token.substring(0, 20)}...\n`);

    // 2. Cargar archivo Excel
    console.log('2️⃣ Cargando archivo Excel...');
    if (!fs.existsSync(EXCEL_FILE)) {
      console.error(`❌ Archivo no encontrado: ${EXCEL_FILE}`);
      process.exit(1);
    }

    const fileBuffer = fs.readFileSync(EXCEL_FILE);
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    formData.append('file', blob, path.basename(EXCEL_FILE));

    const uploadResponse = await axios.post(`${API_URL}/excel/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ Carga exitosa!\n');
    console.log('📊 Resultados:');
    console.log(`   Plantel: ${uploadResponse.data.plantel}`);
    console.log(`   Fecha sesión: ${uploadResponse.data.fecha_sesion}`);
    console.log(`   Registros insertados: ${uploadResponse.data.registrosInsertados}`);
    console.log(`   Registros duplicados: ${uploadResponse.data.registrosDuplicados}`);
    console.log(`   Total en archivo: ${uploadResponse.data.cantidad_total}`);
    console.log(`   Sesión ID: ${uploadResponse.data.sesionId}\n`);

    // 3. Obtener historial de cargas
    console.log('3️⃣ Obteniendo historial de cargas...');
    const historyResponse = await axios.get(`${API_URL}/excel/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`✅ Historial obtenido (${historyResponse.data.length} carga(s)):\n`);
    historyResponse.data.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.plantel} - ${item.cantidad_registros} registros`);
      console.log(`      Fecha: ${new Date(item.fecha_sesion).toLocaleDateString('es-CL')}`);
      console.log(`      Archivo: ${item.nombre_archivo}\n`);
    });

    console.log('🎉 ¡Prueba completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la prueba:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Mensaje: ${error.response.data?.error || error.message}`);
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
};

testExcelUpload();

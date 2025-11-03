import http from 'http';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:5001/api';
const EXCEL_FILE = path.join(process.cwd(), '../informe/Reporte_Antropometrico.xlsx');

function makeRequest(method, path, headers, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: method,
      headers: {
        ...headers,
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function testExcelUpload() {
  try {
    // 1. Login
    console.log('🔐 Logging in...\n');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      'Content-Type': 'application/json'
    }, {
      email: 'nutricionista@test.com',
      password: 'test123'
    });

    if (loginRes.status !== 200) {
      throw new Error(`Login failed: ${loginRes.status}`);
    }

    const token = loginRes.body.token;
    console.log('✅ Login successful');
    console.log(`   Token: ${token.substring(0, 50)}...\n`);

    // 2. Upload Excel file with multipart form data
    console.log('📤 Uploading Excel file...\n');

    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substr(2, 9);
    const fileBuffer = fs.readFileSync(EXCEL_FILE);
    const fileName = 'Reporte_Antropometrico.xlsx';

    let body = `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`;
    body += `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`;

    const bodyBuffer = Buffer.concat([
      Buffer.from(body),
      fileBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const uploadRes = await makeRequest('POST', '/api/excel/upload', {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': bodyBuffer.length
    }, bodyBuffer);

    if (uploadRes.status !== 200) {
      throw new Error(`Upload failed: ${uploadRes.status} - ${JSON.stringify(uploadRes.body)}`);
    }

    const uploadData = uploadRes.body;

    console.log('✅ Upload successful!');
    console.log(`   Sesión ID: ${uploadData.sesionId}`);
    console.log(`   Registros insertados: ${uploadData.registrosInsertados}`);
    console.log(`   Registros duplicados: ${uploadData.registrosDuplicados}\n`);

    // 3. Get upload history
    console.log('📋 Fetching upload history...\n');
    const historyRes = await makeRequest('GET', '/api/excel/history', {
      'Authorization': `Bearer ${token}`
    });

    const historyData = historyRes.body;
    console.log('✅ Upload history retrieved:');
    console.log(`   Total uploads: ${historyData.length}`);
    if (historyData.length > 0) {
      const latest = historyData[0];
      console.log(`   Latest upload: ${latest.nombre_archivo}`);
      console.log(`   Plantel: ${latest.plantel}`);
      console.log(`   Date: ${latest.fecha_sesion}`);
      console.log(`   Records: ${latest.cantidad_registros}`);
    }
    console.log('');

    // 4. Get session details
    console.log('📊 Fetching session details...\n');
    const sessionRes = await makeRequest('GET', `/api/excel/session/${uploadData.sesionId}`, {
      'Authorization': `Bearer ${token}`
    });

    const sessionData = sessionRes.body;
    console.log('✅ Session details retrieved:');
    console.log(`   Pacientes: ${sessionData.measurements.length}`);
    if (sessionData.measurements.length > 0) {
      const first = sessionData.measurements[0];
      console.log(`   First patient: ${first.nombre_paciente}`);
      console.log(`   Weight: ${first.peso}kg`);
      console.log(`   Height: ${first.talla}cm`);
      console.log(`   BMI: ${first.imc}`);
    }
    console.log('');

    console.log('🎉 ¡Test completado exitosamente!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testExcelUpload();

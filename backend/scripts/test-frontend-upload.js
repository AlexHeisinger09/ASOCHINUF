import http from 'http';
import fs from 'fs';
import path from 'path';

const EXCEL_FILE = path.join(process.cwd(), '../informe/Reporte_Antropometrico.xlsx');

function makeRequest(method, pathname, headers, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: pathname,
      method: method,
      headers: headers
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body)
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
    if (data) req.write(data);
    req.end();
  });
}

async function testFrontendUpload() {
  try {
    console.log('🧪 Testing frontend axios upload flow...\n');

    // 1. Login
    console.log('🔐 Step 1: Login');
    const loginRes = await makeRequest('POST', '/api/auth/login',
      { 'Content-Type': 'application/json' },
      JSON.stringify({
        email: 'nutricionista@test.com',
        password: 'test123'
      })
    );

    if (loginRes.status !== 200) {
      throw new Error(`Login failed: ${loginRes.status}`);
    }

    const token = loginRes.body.token;
    console.log(`✅ Token obtained: ${token.substring(0, 30)}...\n`);

    // 2. Upload - Simulating multipart upload from frontend
    console.log('📤 Step 2: Upload Excel file');

    const fileBuffer = fs.readFileSync(EXCEL_FILE);
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substr(2, 16);

    let bodyString = `--${boundary}\r\n`;
    bodyString += `Content-Disposition: form-data; name="file"; filename="Reporte_Antropometrico.xlsx"\r\n`;
    bodyString += `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`;

    const bodyBuffer = Buffer.concat([
      Buffer.from(bodyString),
      fileBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const uploadRes = await makeRequest('POST', '/api/excel/upload',
      {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuffer.length
      },
      bodyBuffer
    );

    if (uploadRes.status !== 200) {
      throw new Error(`Upload failed: ${uploadRes.status} - ${JSON.stringify(uploadRes.body)}`);
    }

    console.log(`✅ Upload successful!`);
    console.log(`   Sesión ID: ${uploadRes.body.sesionId}`);
    console.log(`   Registros insertados: ${uploadRes.body.registrosInsertados}`);
    console.log(`   Registros duplicados: ${uploadRes.body.registrosDuplicados}\n`);

    console.log('✅ Frontend upload test completed successfully');
    console.log('   El frontend debería poder cargar archivos sin problemas\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testFrontendUpload();

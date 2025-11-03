import XLSX from 'xlsx';
import crypto from 'crypto';

/**
 * Parsea un archivo Excel y extrae los datos antropométricos
 * Estructura esperada del Excel:
 * - B2: Nombre del plantel (ej: "Plantel USF 2025")
 * - D3: Fecha del reporte (ej: "2025-11-03")
 * - Row 5: Headers (A5: Paciente, B5: Peso, C5: Altura, D5: IMC, etc.)
 * - Row 6+: Datos de pacientes
 */
export const parseExcelFile = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Extraer nombre del plantel de B2
    const plantelCell = worksheet['B2'];
    const plantel = plantelCell ? plantelCell.v : '';

    // Extraer fecha del reporte de D3
    const fechaCell = worksheet['D3'];
    let fechaReporte = null;
    if (fechaCell) {
      // Excel stores dates as numbers, so we need to convert
      const fechaValue = fechaCell.v;
      if (typeof fechaValue === 'number') {
        // Excel date serial number conversion
        fechaReporte = new Date((fechaValue - 25569) * 86400 * 1000).toISOString().split('T')[0];
      } else if (typeof fechaValue === 'string') {
        // If it's already a string, parse it
        fechaReporte = new Date(fechaValue).toISOString().split('T')[0];
      }
    }

    // Convertir worksheet a JSON, comenzando desde la fila 6 (índice 5)
    // La primera fila útil es la 6, así que extraemos desde A5 en adelante
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      range: 5, // Comienza desde la fila 6 (0-indexed como 5)
      defval: '',
    });

    // Mapear los datos extraídos a la estructura esperada
    const measurements = jsonData.map((row) => {
      // Buscar el nombre del paciente en las columnas A, B, o C
      const nombrePaciente = row['Paciente'] || row['A'] || row['Nombre'] || '';

      return {
        nombre_paciente: nombrePaciente.toString().trim(),
        peso: parseFloat(row['Peso'] || row['B'] || 0) || null,
        altura: parseFloat(row['Altura'] || row['C'] || 0) || null,
        imc: parseFloat(row['IMC'] || row['D'] || 0) || null,
        circunferencia_cintura: parseFloat(row['Cintura'] || row['G'] || 0) || null,
        circunferencia_cadera: parseFloat(row['Cadera'] || row['M'] || 0) || null,
        porcentaje_grasa: parseFloat(row['Grasa'] || row['Grasa %'] || 0) || null,
      };
    });

    // Filtrar registros vacíos
    const measurementsFiltered = measurements.filter(
      (m) => m.nombre_paciente && (m.peso || m.altura || m.imc)
    );

    return {
      plantel: plantel.trim(),
      fecha_sesion: fechaReporte,
      measurements: measurementsFiltered,
      cantidad_registros: measurementsFiltered.length,
    };
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(`Error al procesar archivo Excel: ${error.message}`);
  }
};

/**
 * Genera un hash del contenido del archivo para detectar duplicados
 */
export const generateFileHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * Valida que el archivo tenga la estructura esperada
 */
export const validateExcelStructure = (parsedData) => {
  const { plantel, fecha_sesion, measurements } = parsedData;

  if (!plantel || plantel.length === 0) {
    throw new Error('El archivo no contiene nombre de plantel en la celda B2');
  }

  if (!fecha_sesion) {
    throw new Error('El archivo no contiene fecha de reporte válida en la celda D3');
  }

  if (!Array.isArray(measurements) || measurements.length === 0) {
    throw new Error('El archivo no contiene registros de mediciones válidos');
  }

  return true;
};

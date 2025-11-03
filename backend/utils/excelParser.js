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
      // Buscar el nombre del paciente
      const nombrePaciente = row['Paciente'] || row['A'] || row['Nombre'] || '';

      return {
        // Datos básicos
        nombre_paciente: nombrePaciente.toString().trim(),

        // Medidas básicas
        peso: parseFloat(row['M. corporal'] || row['Peso'] || 0) || null,
        talla: parseFloat(row['Talla'] || row['altura'] || 0) || null,
        talla_sentado: parseFloat(row['Talla sent.'] || 0) || null,

        // Diámetros [cms]
        diametro_biacromial: parseFloat(row['Biacromial'] || 0) || null,
        diametro_torax: parseFloat(row['T. del tórax'] || 0) || null,
        diametro_antpost_torax: parseFloat(row['Ant.-post. del tórax'] || 0) || null,
        diametro_biiliocristal: parseFloat(row['Biiliocristal'] || 0) || null,
        diametro_bitrocanterea: parseFloat(row['Bi-trocanterea'] || 0) || null,
        diametro_humero: parseFloat(row['Húmero'] || 0) || null,
        diametro_femur: parseFloat(row['Fémur'] || 0) || null,

        // Perímetros [cms]
        perimetro_brazo_relajado: parseFloat(row['Brazo relajado'] || 0) || null,
        perimetro_brazo_flexionado: parseFloat(row['Brazo flexionado'] || 0) || null,
        perimetro_muslo_anterior: parseFloat(row['Muslo anterior'] || 0) || null,
        perimetro_pantorrilla: parseFloat(row['Pantorrilla'] || 0) || null,

        // Pliegues [mm]
        pliegue_triceps: parseFloat(row['Tríceps'] || 0) || null,
        pliegue_subescapular: parseFloat(row['Subescapular'] || 0) || null,
        pliegue_supraespinal: parseFloat(row['Supraespinal'] || 0) || null,
        pliegue_abdominal: parseFloat(row['Abdominal'] || 0) || null,
        pliegue_muslo_anterior: parseFloat(row['Muslo anterior'] || 0) || null,
        pliegue_pantorrilla_medial: parseFloat(row['Pantorrilla medial'] || 0) || null,

        // Masa Adiposa por Zona [%]
        masa_adiposa_superior: parseFloat(row['Superior'] || 0) || null,
        masa_adiposa_media: parseFloat(row['Media'] || 0) || null,
        masa_adiposa_inferior: parseFloat(row['Inferior'] || 0) || null,

        // Índices
        imo: parseFloat(row['IMO'] || 0) || null,
        imc: parseFloat(row['IMC'] || 0) || null,
        icc: parseFloat(row['ICC'] || 0) || null,
        ica: parseFloat(row['ICA'] || 0) || null,

        // Sumatoria de Pliegues [mm]
        suma_6_pliegues: parseFloat(row['6 Pliegues'] || 0) || null,
        suma_8_pliegues: parseFloat(row['8 Pliegues'] || 0) || null,
      };
    });

    // Filtrar registros vacíos (si al menos tiene nombre y una medida)
    const measurementsFiltered = measurements.filter(
      (m) => m.nombre_paciente && (m.peso || m.talla || m.imc)
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

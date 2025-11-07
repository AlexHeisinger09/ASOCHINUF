import XLSX from 'xlsx';
import crypto from 'crypto';

/**
 * Parsea un archivo Excel y extrae los datos antropométricos
 * NOTA: El plantel y categoría ahora se seleccionan en la UI, NO se extraen del Excel
 * Estructura del Excel (con historial longitudinal):
 * - D3: Fecha del reporte (ej: "Fecha: 29/10/2025")
 * - Row 5: Headers (A5: PACIENTES, B5: Informes, C5: Edad cronológica, D5: M. corporal, etc.)
 * - Row 6+: Datos de pacientes
 *   * Cada paciente nuevo aparece en columna A
 *   * Filas posteriores sin nombre en A son mediciones adicionales del mismo paciente (diferentes fechas)
 *   * Se cargan TODOS los registros (datos longitudinales completos)
 */
export const parseExcelFile = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Extraer fecha del reporte de D3
    const fechaCell = worksheet['D3'];
    let fechaReporte = null;
    if (fechaCell) {
      try {
        let fechaValue = fechaCell.v;
        // Si es un string que empieza con "Fecha:", extraer la fecha
        if (typeof fechaValue === 'string' && fechaValue.includes('Fecha:')) {
          fechaValue = fechaValue.replace('Fecha:', '').trim();
        }

        if (typeof fechaValue === 'number') {
          // Excel date serial number conversion
          const excelDate = new Date((fechaValue - 25569) * 86400 * 1000);
          if (!isNaN(excelDate.getTime())) {
            fechaReporte = excelDate.toISOString().split('T')[0];
          }
        } else if (typeof fechaValue === 'string') {
          // Parse como date string
          const parsed = new Date(fechaValue);
          if (!isNaN(parsed.getTime())) {
            fechaReporte = parsed.toISOString().split('T')[0];
          }
        }
      } catch (e) {
        // Silently fail - fecha es opcional
        fechaReporte = null;
      }
    }

    // Si no hay fecha, usar fecha actual como fallback
    if (!fechaReporte) {
      fechaReporte = new Date().toISOString().split('T')[0];
    }

    // Parsear datos con estructura de historial longitudinal
    const measurementsByPatient = {};
    let currentPatient = null;
    let emptyRowCount = 0;

    // Recorrer desde fila 6 en adelante
    for (let rowNum = 6; rowNum <= 1000; rowNum++) {
      const cellA = worksheet[`A${rowNum}`];
      const valueA = cellA ? cellA.v.toString().trim() : '';

      // Si hay un nombre en A, es un nuevo paciente
      if (valueA && valueA !== 'VACÍO' && valueA !== '' && !valueA.match(/^\d+$/) && !valueA.includes('Informes')) {
        currentPatient = valueA;
        emptyRowCount = 0; // Reset contador
        if (!measurementsByPatient[currentPatient]) {
          measurementsByPatient[currentPatient] = [];
        }
      } else if (!valueA) {
        // Si hay celdas vacías, contar pero no terminar aún
        emptyRowCount++;
        // Si hay más de 20 filas vacías seguidas, probablemente terminó
        if (emptyRowCount > 20) break;
      } else {
        emptyRowCount = 0;
      }

      // Si tenemos paciente actual, extraer el registro de esta fila
      if (currentPatient) {
        // Extraer fecha de medición de la columna B
        let fechaMedicion = null;
        const cellB = worksheet[`B${rowNum}`];
        if (cellB) {
          try {
            let fechaValue = cellB.v;
            if (typeof fechaValue === 'number') {
              // Excel date serial number
              const excelDate = new Date((fechaValue - 25569) * 86400 * 1000);
              if (!isNaN(excelDate.getTime())) {
                fechaMedicion = excelDate.toISOString().split('T')[0];
              }
            } else if (typeof fechaValue === 'string') {
              // Date string (formato dd/mm/yyyy)
              fechaValue = fechaValue.trim();
              const parts = fechaValue.split('/');
              if (parts.length === 3) {
                // dd/mm/yyyy -> yyyy-mm-dd
                const day = parts[0];
                const month = parts[1];
                const year = parts[2];
                fechaMedicion = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              }
            }
          } catch (e) {
            // Si falla el parse, dejar null
          }
        }

        const measurement = {
          nombre_paciente: currentPatient,
          fecha_medicion: fechaMedicion, // NUEVA: Fecha de la medición individual
          // Medidas básicas
          peso: getCellValue(worksheet, `D${rowNum}`),
          talla: getCellValue(worksheet, `E${rowNum}`),
          talla_sentado: getCellValue(worksheet, `F${rowNum}`),

          // Diámetros
          diametro_biacromial: getCellValue(worksheet, `G${rowNum}`),
          diametro_torax: getCellValue(worksheet, `H${rowNum}`),
          diametro_antpost_torax: getCellValue(worksheet, `I${rowNum}`),
          diametro_biiliocristal: getCellValue(worksheet, `J${rowNum}`),
          diametro_bitrocanterea: getCellValue(worksheet, `K${rowNum}`),
          diametro_humero: getCellValue(worksheet, `L${rowNum}`),
          diametro_femur: getCellValue(worksheet, `M${rowNum}`),

          // Perímetros
          perimetro_brazo_relajado: getCellValue(worksheet, `N${rowNum}`),
          perimetro_brazo_flexionado: getCellValue(worksheet, `O${rowNum}`),
          perimetro_muslo_anterior: getCellValue(worksheet, `P${rowNum}`),
          perimetro_pantorrilla: getCellValue(worksheet, `Q${rowNum}`),

          // Pliegues
          pliegue_triceps: getCellValue(worksheet, `R${rowNum}`),
          pliegue_subescapular: getCellValue(worksheet, `S${rowNum}`),
          pliegue_supraespinal: getCellValue(worksheet, `T${rowNum}`),
          pliegue_abdominal: getCellValue(worksheet, `U${rowNum}`),
          pliegue_muslo_anterior: getCellValue(worksheet, `V${rowNum}`),
          pliegue_pantorrilla_medial: getCellValue(worksheet, `W${rowNum}`),

          // Masa Adiposa
          masa_adiposa_superior: getCellValue(worksheet, `X${rowNum}`),
          masa_adiposa_media: getCellValue(worksheet, `Y${rowNum}`),
          masa_adiposa_inferior: getCellValue(worksheet, `Z${rowNum}`),

          // Índices
          imo: getCellValue(worksheet, `AA${rowNum}`),
          imc: getCellValue(worksheet, `AB${rowNum}`),
          icc: getCellValue(worksheet, `AC${rowNum}`),
          ica: getCellValue(worksheet, `AD${rowNum}`),

          // Sumatoria de Pliegues
          suma_6_pliegues: getCellValue(worksheet, `AE${rowNum}`),
          suma_8_pliegues: getCellValue(worksheet, `AF${rowNum}`),
        };

        measurementsByPatient[currentPatient].push(measurement);
      }
    }

    // Helper para obtener valor numérico de una celda
    function getCellValue(sheet, cellRef) {
      const cell = sheet[cellRef];
      if (!cell || cell.v === undefined || cell.v === '' || cell.v === null) return null;

      // Si es un string con fecha, retornar null
      if (typeof cell.v === 'string' && (cell.v.includes('/') || cell.v.includes('-'))) {
        return null;
      }

      const val = parseFloat(cell.v);
      return isNaN(val) ? null : val;
    }

    // Tomar TODOS los registros de cada paciente (datos longitudinales completos)
    const measurements = [];
    for (const records of Object.values(measurementsByPatient)) {
      if (records.length > 0) {
        // Agregar TODOS los registros del paciente
        measurements.push(...records);
      }
    }

    // Filtrar registros vacíos (si al menos tiene nombre y una medida)
    const measurementsFiltered = measurements.filter(
      (m) => m.nombre_paciente && (m.peso || m.talla || m.imc)
    );

    return {
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
  const { fecha_sesion, measurements } = parsedData;

  if (!fecha_sesion) {
    throw new Error('El archivo no contiene fecha de reporte válida en la celda D3');
  }

  if (!Array.isArray(measurements) || measurements.length === 0) {
    throw new Error('El archivo no contiene registros de mediciones válidos');
  }

  return true;
};

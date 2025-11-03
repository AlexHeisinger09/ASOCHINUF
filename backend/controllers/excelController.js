import pool from '../config/database.js';
import { parseExcelFile, generateFileHash, validateExcelStructure } from '../utils/excelParser.js';
import fs from 'fs';
import path from 'path';

/**
 * Cargar archivo Excel con datos antropométricos
 * Solo nutricionistas y administradores pueden acceder
 */
export const uploadExcelFile = async (req, res) => {
  const client = await pool.connect();

  try {
    // Verificar que se envió un archivo
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo' });
    }

    const usuarioId = req.user.id;
    const tipoPerf = req.user.tipo_perfil;

    // Verificar que sea nutricionista o admin
    if (tipoPerf !== 'nutricionista' && tipoPerf !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para cargar archivos Excel' });
    }

    // Generar hash del archivo para detectar duplicados
    const fileHash = generateFileHash(req.file.buffer);

    // Parsear el archivo Excel
    const tempPath = path.join('/tmp', req.file.originalname);
    fs.writeFileSync(tempPath, req.file.buffer);

    const parsedData = parseExcelFile(tempPath);

    // Limpiar archivo temporal
    fs.unlinkSync(tempPath);

    // Validar estructura del Excel
    validateExcelStructure(parsedData);

    const { plantel, fecha_sesion, measurements, cantidad_registros } = parsedData;

    // Iniciar transacción
    await client.query('BEGIN');

    // 1. Verificar si el plantel existe, si no crearlo
    let plantelResult = await client.query(
      'SELECT id FROM t_planteles WHERE nombre = $1',
      [plantel]
    );

    let plantelId;
    if (plantelResult.rows.length === 0) {
      const createPlantelResult = await client.query(
        'INSERT INTO t_planteles (nombre) VALUES ($1) RETURNING id',
        [plantel]
      );
      plantelId = createPlantelResult.rows[0].id;
    } else {
      plantelId = plantelResult.rows[0].id;
    }

    // 2. Verificar si la sesión ya existe (detectar duplicados)
    const existingSessionResult = await client.query(
      'SELECT id FROM t_sesion_mediciones WHERE plantel_id = $1 AND fecha_sesion = $2 AND hash_archivo = $3',
      [plantelId, fecha_sesion, fileHash]
    );

    if (existingSessionResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        error: 'Este archivo ya ha sido cargado previamente para este plantel en esta fecha',
        sesionId: existingSessionResult.rows[0].id,
      });
    }

    // 3. Crear sesión de mediciones
    const sessionResult = await client.query(
      `INSERT INTO t_sesion_mediciones
       (plantel_id, nutricionista_id, fecha_sesion, nombre_archivo, hash_archivo, cantidad_registros)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [plantelId, usuarioId, fecha_sesion, req.file.originalname, fileHash, cantidad_registros]
    );

    const sesionId = sessionResult.rows[0].id;

    // 4. Insertar mediciones, evitando duplicados
    let registrosInsertados = 0;
    let registrosDuplicados = 0;

    for (const measurement of measurements) {
      // Verificar si ya existe un registro idéntico para este paciente en esta sesión
      const duplicateCheck = await client.query(
        `SELECT id FROM t_informe_antropometrico
         WHERE nombre_paciente ILIKE $1
         AND sesion_id = $2
         AND peso = $3
         AND talla = $4`,
        [measurement.nombre_paciente, sesionId, measurement.peso, measurement.talla]
      );

      if (duplicateCheck.rows.length > 0) {
        registrosDuplicados++;
        continue;
      }

      // Insertar la medición directamente sin crear usuario
      await client.query(
        `INSERT INTO t_informe_antropometrico
         (nombre_paciente, nutricionista_id, sesion_id,
          peso, talla, talla_sentado,
          diametro_biacromial, diametro_torax, diametro_antpost_torax,
          diametro_biiliocristal, diametro_bitrocanterea, diametro_humero, diametro_femur,
          perimetro_brazo_relajado, perimetro_brazo_flexionado, perimetro_muslo_anterior, perimetro_pantorrilla,
          pliegue_triceps, pliegue_subescapular, pliegue_supraespinal, pliegue_abdominal,
          pliegue_muslo_anterior, pliegue_pantorrilla_medial,
          masa_adiposa_superior, masa_adiposa_media, masa_adiposa_inferior,
          imo, imc, icc, ica,
          suma_6_pliegues, suma_8_pliegues,
          fecha_registro)
         VALUES ($1, $2, $3,
          $4, $5, $6,
          $7, $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17,
          $18, $19, $20, $21, $22, $23,
          $24, $25, $26,
          $27, $28, $29, $30,
          $31, $32,
          CURRENT_TIMESTAMP)`,
        [
          measurement.nombre_paciente,
          usuarioId,
          sesionId,
          measurement.peso,
          measurement.talla,
          measurement.talla_sentado,
          measurement.diametro_biacromial,
          measurement.diametro_torax,
          measurement.diametro_antpost_torax,
          measurement.diametro_biiliocristal,
          measurement.diametro_bitrocanterea,
          measurement.diametro_humero,
          measurement.diametro_femur,
          measurement.perimetro_brazo_relajado,
          measurement.perimetro_brazo_flexionado,
          measurement.perimetro_muslo_anterior,
          measurement.perimetro_pantorrilla,
          measurement.pliegue_triceps,
          measurement.pliegue_subescapular,
          measurement.pliegue_supraespinal,
          measurement.pliegue_abdominal,
          measurement.pliegue_muslo_anterior,
          measurement.pliegue_pantorrilla_medial,
          measurement.masa_adiposa_superior,
          measurement.masa_adiposa_media,
          measurement.masa_adiposa_inferior,
          measurement.imo,
          measurement.imc,
          measurement.icc,
          measurement.ica,
          measurement.suma_6_pliegues,
          measurement.suma_8_pliegues,
        ]
      );

      registrosInsertados++;
    }

    // Actualizar cantidad de registros en la sesión
    await client.query(
      'UPDATE t_sesion_mediciones SET cantidad_registros = $1 WHERE id = $2',
      [registrosInsertados, sesionId]
    );

    // Confirmar transacción
    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Archivo cargado exitosamente',
      sesionId,
      plantel,
      fecha_sesion,
      registrosInsertados,
      registrosDuplicados,
      cantidad_total: measurements.length,
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error en ROLLBACK:', rollbackError);
    }

    console.error('Error en uploadExcelFile:', error);

    if (error.message.includes('Error al procesar archivo Excel')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Error al procesar el archivo: ' + error.message });
  } finally {
    client.release();
  }
};

/**
 * Obtener historial de cargas de Excel
 */
export const getUploadHistory = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const tipoPerf = req.user.tipo_perfil;

    // Verificar que sea nutricionista o admin
    if (tipoPerf !== 'nutricionista' && tipoPerf !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para acceder a esta información' });
    }

    let query = `
      SELECT
        sm.id,
        sm.nombre_archivo,
        sm.fecha_sesion,
        sm.fecha_carga,
        sm.cantidad_registros,
        p.nombre as plantel,
        u.nombre as nutricionista_nombre
      FROM t_sesion_mediciones sm
      JOIN t_planteles p ON sm.plantel_id = p.id
      JOIN t_usuarios u ON sm.nutricionista_id = u.id
    `;

    const params = [];

    // Si es nutricionista, solo ver sus propias cargas
    if (tipoPerf === 'nutricionista') {
      query += ' WHERE sm.nutricionista_id = $1';
      params.push(usuarioId);
    }

    query += ' ORDER BY sm.fecha_carga DESC LIMIT 50';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getUploadHistory:', error);
    res.status(500).json({ error: 'Error al obtener historial de cargas' });
  }
};

/**
 * Obtener detalles de una sesión de mediciones
 */
export const getSessionDetails = async (req, res) => {
  try {
    const { sesionId } = req.params;
    const usuarioId = req.user.id;
    const tipoPerf = req.user.tipo_perfil;

    // Obtener detalles de la sesión
    const sessionResult = await pool.query(
      `SELECT
        sm.id,
        sm.nombre_archivo,
        sm.fecha_sesion,
        sm.fecha_carga,
        sm.cantidad_registros,
        p.nombre as plantel,
        u.nombre as nutricionista_nombre
      FROM t_sesion_mediciones sm
      JOIN t_planteles p ON sm.plantel_id = p.id
      JOIN t_usuarios u ON sm.nutricionista_id = u.id
      WHERE sm.id = $1`,
      [sesionId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    const session = sessionResult.rows[0];

    // Verificar permisos
    if (tipoPerf === 'nutricionista' && session.nutricionista_id !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permiso para ver esta sesión' });
    }

    // Obtener mediciones de la sesión
    const measurementsResult = await pool.query(
      `SELECT
        ia.id,
        ia.nombre_paciente,
        ia.peso,
        ia.altura,
        ia.imc,
        ia.circunferencia_cintura,
        ia.circunferencia_cadera,
        ia.porcentaje_grasa,
        ia.fecha_registro
      FROM t_informe_antropometrico ia
      WHERE ia.sesion_id = $1
      ORDER BY ia.nombre_paciente`,
      [sesionId]
    );

    res.json({
      session,
      measurements: measurementsResult.rows,
    });
  } catch (error) {
    console.error('Error en getSessionDetails:', error);
    res.status(500).json({ error: 'Error al obtener detalles de la sesión' });
  }
};

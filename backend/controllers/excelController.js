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
      // Buscar si el paciente existe por nombre (búsqueda simple)
      const pacienteSearch = await client.query(
        `SELECT id FROM t_usuarios
         WHERE tipo_perfil = 'cliente'
         AND (nombre || ' ' || apellido) ILIKE $1
         LIMIT 1`,
        [`%${measurement.nombre_paciente}%`]
      );

      let clienteId;

      if (pacienteSearch.rows.length > 0) {
        clienteId = pacienteSearch.rows[0].id;

        // Verificar si ya existe un registro idéntico para este cliente en esta sesión
        const duplicateCheck = await client.query(
          `SELECT id FROM t_informe_antropometrico
           WHERE cliente_id = $1
           AND sesion_id = $2
           AND peso = $3
           AND altura = $4`,
          [clienteId, sesionId, measurement.peso, measurement.altura]
        );

        if (duplicateCheck.rows.length > 0) {
          registrosDuplicados++;
          continue;
        }
      } else {
        // Si el paciente no existe, crear uno como cliente
        const newClientResult = await client.query(
          `INSERT INTO t_usuarios
           (email, password_hash, nombre, apellido, tipo_perfil, activo)
           VALUES ($1, $2, $3, $4, 'cliente', true)
           RETURNING id`,
          [
            `${measurement.nombre_paciente.toLowerCase().replace(/\s+/g, '.')}@asochinuf.cl`,
            'temp_hash', // Contraseña temporal, el usuario debe cambiarla
            measurement.nombre_paciente.split(' ')[0] || measurement.nombre_paciente,
            measurement.nombre_paciente.split(' ').slice(1).join(' ') || '',
          ]
        );
        clienteId = newClientResult.rows[0].id;
      }

      // Insertar la medición
      await client.query(
        `INSERT INTO t_informe_antropometrico
         (cliente_id, nutricionista_id, sesion_id, nombre_paciente, peso, altura, imc,
          circunferencia_cintura, circunferencia_cadera, porcentaje_grasa, fecha_registro)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)`,
        [
          clienteId,
          usuarioId,
          sesionId,
          measurement.nombre_paciente,
          measurement.peso,
          measurement.altura,
          measurement.imc,
          measurement.circunferencia_cintura,
          measurement.circunferencia_cadera,
          measurement.porcentaje_grasa,
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

import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import Joi from 'joi';

// Esquemas de validación
const schemaRegistro = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  nombre: Joi.string().required(),
  apellido: Joi.string().required(),
});

const schemaLogin = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Generar JWT
const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      tipo_perfil: usuario.tipo_perfil,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

export const registro = async (req, res) => {
  try {
    // Validar datos
    const { error, value } = schemaRegistro.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, nombre, apellido } = value;

    // Verificar si el email ya existe
    const usuarioExistente = await pool.query(
      'SELECT id FROM t_usuarios WHERE email = $1',
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    // Crear usuario (por defecto cliente)
    const resultado = await pool.query(
      'INSERT INTO t_usuarios (email, password_hash, nombre, apellido, tipo_perfil, activo, fecha_registro) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id, email, nombre, apellido, tipo_perfil',
      [email, passwordHash, nombre, apellido, 'cliente', true]
    );

    const usuario = resultado.rows[0];
    const token = generarToken(usuario);

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        tipo_perfil: usuario.tipo_perfil,
      },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const login = async (req, res) => {
  try {
    // Validar datos
    const { error, value } = schemaLogin.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Buscar usuario
    const resultado = await pool.query(
      'SELECT * FROM t_usuarios WHERE email = $1 AND activo = true',
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const usuario = resultado.rows[0];

    // Verificar contraseña
    const esValida = await bcryptjs.compare(password, usuario.password_hash);
    if (!esValida) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // Generar token
    const token = generarToken(usuario);

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        tipo_perfil: usuario.tipo_perfil,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const obtenerPerfil = async (req, res) => {
  try {
    const { id } = req.usuario;

    const resultado = await pool.query(
      'SELECT id, email, nombre, apellido, tipo_perfil, fecha_registro FROM t_usuarios WHERE id = $1',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

export const logout = (req, res) => {
  // En JWT, el logout es en el frontend (eliminar token)
  // Aquí podríamos hacer blacklist de tokens si fuera necesario
  res.json({ mensaje: 'Sesión cerrada exitosamente' });
};

export const solicitarRecuperacion = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'El email es requerido' });
    }

    // Buscar usuario
    const resultado = await pool.query(
      'SELECT id, nombre FROM t_usuarios WHERE email = $1',
      [email]
    );

    if (resultado.rows.length === 0) {
      // Por seguridad, no revelamos si el email existe
      return res.json({ mensaje: 'Si el email existe, recibirás un enlace de recuperación' });
    }

    const usuario = resultado.rows[0];

    // Generar token único
    const token = require('crypto').randomBytes(32).toString('hex');
    const fechaExpiracion = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en BD
    await pool.query(
      'INSERT INTO t_recovery_tokens (usuario_id, token, fecha_expiracion) VALUES ($1, $2, $3)',
      [usuario.id, token, fechaExpiracion]
    );

    // Enviar email
    const { enviarCorreoRecuperacion } = await import('../services/emailService.js');
    await enviarCorreoRecuperacion(email, usuario.nombre, token);

    res.json({ mensaje: 'Se ha enviado un enlace de recuperación a tu email' });
  } catch (error) {
    console.error('Error solicitando recuperación:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

export const verificarToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Token no proporcionado' });
    }

    const resultado = await pool.query(
      'SELECT usuario_id, usado FROM t_recovery_tokens WHERE token = $1 AND fecha_expiracion > NOW()',
      [token]
    );

    if (resultado.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    if (resultado.rows[0].usado) {
      return res.status(400).json({ error: 'Este token ya ha sido utilizado' });
    }

    res.json({ mensaje: 'Token válido', usuario_id: resultado.rows[0].usuario_id });
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({ error: 'Error al verificar token' });
  }
};

export const restablecerContrasena = async (req, res) => {
  try {
    const { token, nuevaContrasena } = req.body;

    if (!token || !nuevaContrasena) {
      return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
    }

    if (nuevaContrasena.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar token
    const resultadoToken = await pool.query(
      'SELECT usuario_id FROM t_recovery_tokens WHERE token = $1 AND fecha_expiracion > NOW() AND usado = false',
      [token]
    );

    if (resultadoToken.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const usuarioId = resultadoToken.rows[0].usuario_id;

    // Hash de la nueva contraseña
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(nuevaContrasena, salt);

    // Actualizar contraseña
    await pool.query(
      'UPDATE t_usuarios SET password_hash = $1 WHERE id = $2',
      [passwordHash, usuarioId]
    );

    // Marcar token como usado
    await pool.query(
      'UPDATE t_recovery_tokens SET usado = true, fecha_uso = NOW() WHERE token = $1',
      [token]
    );

    res.json({ mensaje: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    console.error('Error restableciendo contraseña:', error);
    res.status(500).json({ error: 'Error al restablecer contraseña' });
  }
};

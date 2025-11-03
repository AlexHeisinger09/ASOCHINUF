import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

export const verificarAdmin = (req, res, next) => {
  verificarToken(req, res, () => {
    if (req.usuario.tipo_perfil !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere permisos de administrador' });
    }
    next();
  });
};

export const verificarNutricionista = (req, res, next) => {
  verificarToken(req, res, () => {
    if (req.usuario.tipo_perfil !== 'nutricionista' && req.usuario.tipo_perfil !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere ser nutricionista' });
    }
    next();
  });
};

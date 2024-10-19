const jwt = require('jsonwebtoken');
// Middleware para autenticar el token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];  // El token debe estar en el encabezado "Authorization"
    const token = authHeader && authHeader.split(' ')[1];  // Extrae el token después de 'Bearer'
  
    // Si no hay token, retorna un error 401
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado. Acceso no autorizado.' });
    }
  
    // Verifica si el token es válido
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token inválido o expirado.' });
      }
  
      // Si el token es válido, el usuario autenticado se guarda en 'req.user'
      req.user = user;
      next();  // Continúa con la siguiente función middleware o controlador
    });
  };

  // Middleware para verificar que el usuario tenga el rol "comprador"
const verifyRoleComprador = async (req, res, next) => {
  const id_usuario = req.user.id_usuario;

  try {
    const [user] = await pool.query(
      `
      SELECT r.nombre_rol
      FROM usuario u
      INNER JOIN usuario_rol ur ON ur.id_usuario = u.id_usuario
      INNER JOIN rol r ON r.id_rol = ur.id_rol
      WHERE u.id_usuario = ?
      `
      , [id_usuario]);

    if (user.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user[0].rol !== 'comprador') {
      return res.status(403).json({ message: 'Acceso denegado, se requiere rol de comprador' });
    }

    next();
  } catch (error) {
    console.error('Error en la verificación del rol:', error);
    res.status(500).json({ message: 'Error al verificar rol' });
  }
};

  module.exports = { authenticateToken, verifyRoleComprador };
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

  module.exports = { authenticateToken };
const jwt = require('jsonwebtoken');

// Clave secreta para firmar los tokens JWT
// En producción esto iría en una variable de entorno
const SECRET = 'academia-loranca-secret-key-2026';

// Genera un token JWT con los datos del usuario (válido 24h)
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    SECRET,
    { expiresIn: '24h' }
  );
}

// Middleware: verifica que el token sea válido y adjunta el usuario a req.user
function authenticateToken(req, res, next) {
  const auth = req.headers['authorization'];
  const token = auth && auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Acceso denegado' });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = decoded;
    next();
  });
}

// Middleware: solo administradores pueden pasar
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Se requieren permisos de administrador' });
  next();
}

module.exports = { generateToken, authenticateToken, requireAdmin, SECRET };

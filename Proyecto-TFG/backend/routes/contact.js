const express = require('express');
const jwt = require('jsonwebtoken');
const { runSql, queryAll } = require('../database');
const { authenticateToken, SECRET } = require('../middleware/auth');
const router = express.Router();

/* Simple rate limiting map */
const rateMap = new Map();
const RATE_WINDOW = 60 * 1000; /* 1 minute */
const RATE_MAX = 3; /* max 3 submissions per minute per IP */

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.window > RATE_WINDOW) {
    rateMap.set(ip, { window: now, count: 1 });
    return false;
  }
  entry.count++;
  if (entry.count > RATE_MAX) return true;
  return false;
}

/* Cleanup stale entries every 5 minutes */
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateMap) {
    if (now - entry.window > RATE_WINDOW) rateMap.delete(ip);
  }
}, 5 * 60 * 1000);

router.post('/', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Inténtalo de nuevo en un minuto.' });
  }

  const { name, email, course_level, phone, message } = req.body;

  /* Validate required fields */
  const errors = [];
  if (!name || typeof name !== 'string' || !name.trim())
    errors.push('El nombre es obligatorio.');
  else if (name.trim().length < 3 || name.trim().length > 50)
    errors.push('El nombre debe tener entre 3 y 50 caracteres.');
  else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/.test(name.trim()))
    errors.push('El nombre contiene caracteres no válidos.');

  if (!email || typeof email !== 'string' || !email.trim())
    errors.push('El email es obligatorio.');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
    errors.push('El formato del email no es válido.');

  if (phone && !/^[0-9]{9}$/.test(phone.trim()))
    errors.push('El teléfono debe tener exactamente 9 dígitos.');

  if (message && typeof message === 'string' && message.length > 200)
    errors.push('El mensaje no puede superar los 200 caracteres.');

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  let userId = null;
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(auth.slice(7), SECRET);
      userId = decoded.id;
    } catch {}
  }

  /* Sanitize inputs */
  const sanitize = s => (s || '').trim().replace(/[<>]/g, '');
  const safeName = sanitize(name);
  const safeEmail = sanitize(email);
  const safeCourse = sanitize(course_level);
  const safePhone = sanitize(phone);
  const safeMessage = sanitize(message);

  runSql(
    'INSERT INTO contact_messages (name,email,course_level,phone,message,user_id) VALUES (?,?,?,?,?,?)',
    [safeName, safeEmail, safeCourse, safePhone, safeMessage, userId]
  );
  res.status(201).json({ success: true, message: 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.' });
});

router.get('/my', authenticateToken, (req, res) => {
  const messages = queryAll('SELECT * FROM contact_messages WHERE user_id=? ORDER BY created_at DESC', [req.user.id]);
  res.json({ messages });
});

module.exports = router;

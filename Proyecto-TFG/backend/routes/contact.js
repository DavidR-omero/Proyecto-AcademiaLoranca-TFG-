const express = require('express');
const jwt = require('jsonwebtoken');
const { runSql, queryAll } = require('../database');
const { authenticateToken, SECRET } = require('../middleware/auth');
const router = express.Router();

router.post('/', (req, res) => {
  const { name, email, course_level, phone, message } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: 'Nombre y email son obligatorios' });

  let userId = null;
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(auth.slice(7), SECRET);
      userId = decoded.id;
    } catch {}
  }

  runSql(
    'INSERT INTO contact_messages (name,email,course_level,phone,message,user_id) VALUES (?,?,?,?,?,?)',
    [name, email, course_level || '', phone || '', message || '', userId]
  );
  res.status(201).json({ success: true, message: 'Mensaje enviado correctamente' });
});

router.get('/my', authenticateToken, (req, res) => {
  const messages = queryAll('SELECT * FROM contact_messages WHERE user_id=? ORDER BY created_at DESC', [req.user.id]);
  res.json({ messages });
});

module.exports = router;

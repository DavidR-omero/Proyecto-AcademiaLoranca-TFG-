const express = require('express');
const bcrypt = require('bcryptjs');
const { queryOne, runSql } = require('../database');
const { generateToken, authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  if (password.length < 4)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });

  if (queryOne('SELECT id FROM users WHERE username=? OR email=?', [username, email]))
    return res.status(409).json({ error: 'El usuario o email ya existe' });

  const hash = bcrypt.hashSync(password, 10);
  const result = runSql('INSERT INTO users (username,email,password,role) VALUES (?,?,?,?)',
    [username, email, hash, 'user']);
  const user = { id: result.lastInsertRowid, username, email, role: 'user' };
  res.status(201).json({ token: generateToken(user), user });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });

  const user = queryOne('SELECT * FROM users WHERE username=? OR email=?', [username, username]);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Credenciales incorrectas' });

  res.json({
    token: generateToken(user),
    user: { id: user.id, username: user.username, email: user.email, role: user.role }
  });
});

router.get('/me', authenticateToken, (req, res) => {
  const user = queryOne('SELECT id,username,email,role,created_at FROM users WHERE id=?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json({ user });
});

router.put('/me', authenticateToken, (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  if (newPassword) {
    const u = queryOne('SELECT password FROM users WHERE id=?', [req.user.id]);
    if (!u || !bcrypt.compareSync(currentPassword, u.password))
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    if (newPassword.length < 4)
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 4 caracteres' });
    const hash = bcrypt.hashSync(newPassword, 10);
    runSql('UPDATE users SET password=? WHERE id=?', [hash, req.user.id]);
  }
  if (email) {
    const exists = queryOne('SELECT id FROM users WHERE email=? AND id!=?', [email, req.user.id]);
    if (exists) return res.status(409).json({ error: 'El email ya está en uso' });
    runSql('UPDATE users SET email=COALESCE(?,email) WHERE id=?', [email, req.user.id]);
  }
  const user = queryOne('SELECT id,username,email,role,created_at FROM users WHERE id=?', [req.user.id]);
  res.json({ user });
});

module.exports = router;

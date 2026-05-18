const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { queryOne, queryAll, runSql } = require('../database');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { sendResetCode } = require('../email');
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

router.post('/send-reset-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'El email o usuario es obligatorio' });

  const user = queryOne('SELECT id,username,email FROM users WHERE LOWER(email)=LOWER(?) OR LOWER(username)=LOWER(?)', [email, email]);
  if (!user) return res.status(404).json({ error: 'No existe una cuenta con ese email o usuario' });

  /* Clean up old codes for this email */
  runSql('DELETE FROM password_resets WHERE email=? OR expires_at < datetime("now")', [user.email]);

  /* Generate 6-digit code */
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const token = crypto.randomBytes(32).toString('hex');

  runSql(
    'INSERT INTO password_resets (email, code, token, expires_at) VALUES (?,?,?, datetime("now","+15 minutes"))',
    [user.email, code, token]
  );

  /* Try to send email */
  const sent = await sendResetCode(user.email, code);

  res.json({
    sent,
    message: sent
      ? 'Revisa tu correo electrónico. El código ha sido enviado.'
      : 'No se pudo enviar el email. Modo desarrollo: revisa la consola del servidor.',
    ...(sent ? {} : { devCode: code })
  });
});

router.post('/verify-reset-code', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email y código son obligatorios' });

  const record = queryOne(
    `SELECT id,email,token FROM password_resets
     WHERE LOWER(email)=LOWER(?) AND code=? AND used=0 AND expires_at > datetime("now")
     ORDER BY id DESC LIMIT 1`,
    [email, code]
  );

  if (!record) return res.status(401).json({ error: 'Código inválido o expirado' });

  /* Mark as used so it can't be reused */
  runSql('UPDATE password_resets SET used=1 WHERE id=?', [record.id]);

  res.json({ verified: true, token: record.token, email: record.email });
});

router.post('/reset-password', (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword)
    return res.status(400).json({ error: 'Email, token y nueva contraseña son obligatorios' });
  if (newPassword.length < 4)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });

  const record = queryOne(
    'SELECT id FROM password_resets WHERE LOWER(email)=LOWER(?) AND token=? AND used=1 AND expires_at > datetime("now")',
    [email, token]
  );

  if (!record) return res.status(401).json({ error: 'Token inválido o expirado. Solicita un nuevo código' });

  const hash = bcrypt.hashSync(newPassword, 10);
  runSql('UPDATE users SET password=? WHERE LOWER(email)=LOWER(?)', [hash, email]);

  /* Clean up used records */
  runSql('DELETE FROM password_resets WHERE email=?', [email]);

  res.json({ success: true });
});

module.exports = router;

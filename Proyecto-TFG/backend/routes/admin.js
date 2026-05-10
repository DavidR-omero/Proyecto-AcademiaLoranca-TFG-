const express = require('express');
const { queryAll, queryOne, runSql } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.use(authenticateToken, requireAdmin);

router.get('/stats', (req, res) => {
  const users = queryAll('SELECT COUNT(*) as c FROM users')[0].c;
  const messages = queryAll('SELECT COUNT(*) as c FROM contact_messages')[0].c;
  const unread = queryAll('SELECT COUNT(*) as c FROM contact_messages WHERE is_read=0')[0].c;
  const courses = queryAll('SELECT COUNT(*) as c FROM courses')[0].c;
  const announcements = queryAll('SELECT COUNT(*) as c FROM announcements')[0].c;
  const events = queryAll('SELECT COUNT(*) as c FROM events')[0].c;
  res.json({ stats: { users, messages, unread, courses, announcements, events } });
});

router.get('/users', (req, res) => {
  const users = queryAll('SELECT id,username,email,role,created_at FROM users ORDER BY id');
  res.json({ users });
});

router.put('/users/:id', (req, res) => {
  const { role, password } = req.body;
  const user = queryOne('SELECT id FROM users WHERE id=?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    runSql('UPDATE users SET role=COALESCE(?,role), password=? WHERE id=?',
      [role, hash, req.params.id]);
  } else {
    runSql('UPDATE users SET role=COALESCE(?,role) WHERE id=?',
      [role, req.params.id]);
  }
  const updated = queryOne('SELECT id,username,email,role,created_at FROM users WHERE id=?', [req.params.id]);
  res.json({ user: updated });
});

router.delete('/users/:id', (req, res) => {
  const user = queryOne('SELECT id FROM users WHERE id=?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (user.id == req.user.id) return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
  runSql('DELETE FROM users WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

router.get('/messages', (req, res) => {
  const messages = queryAll('SELECT * FROM contact_messages ORDER BY created_at DESC');
  res.json({ messages });
});

router.put('/messages/:id/read', (req, res) => {
  runSql('UPDATE contact_messages SET is_read=1 WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

router.delete('/messages/:id', (req, res) => {
  runSql('DELETE FROM contact_messages WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

router.put('/courses/:id', (req, res) => {
  const { name, description, teacher, schedule, max_students, color } = req.body;
  const course = queryOne('SELECT id FROM courses WHERE id=?', [req.params.id]);
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

  runSql(`UPDATE courses SET
    name=COALESCE(?,name), description=COALESCE(?,description),
    teacher=COALESCE(?,teacher), schedule=COALESCE(?,schedule),
    max_students=COALESCE(?,max_students), color=COALESCE(?,color)
    WHERE id=?`,
    [name, description, teacher, schedule, max_students, color, req.params.id]);
  const updated = queryOne('SELECT * FROM courses WHERE id=?', [req.params.id]);
  res.json({ course: updated });
});

router.post('/courses', (req, res) => {
  const { name, description, teacher, schedule, max_students, color } = req.body;
  if (!name) return res.status(400).json({ error: 'El nombre del curso es obligatorio' });
  runSql('INSERT INTO courses (name,description,teacher,schedule,max_students,color) VALUES (?,?,?,?,?,?)',
    [name, description || '', teacher || '', schedule || '', max_students || 8, color || '#2a17cf']);
  const course = queryOne('SELECT * FROM courses ORDER BY id DESC LIMIT 1');
  res.status(201).json({ course });
});

router.delete('/courses/:id', (req, res) => {
  runSql('DELETE FROM courses WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

router.get('/announcements', (req, res) => {
  const announcements = queryAll('SELECT * FROM announcements ORDER BY created_at DESC');
  res.json({ announcements });
});

router.post('/announcements', (req, res) => {
  const { title, content } = req.body;
  if (!title) return res.status(400).json({ error: 'El título es obligatorio' });
  runSql('INSERT INTO announcements (title,content) VALUES (?,?)', [title, content || '']);
  const a = queryOne('SELECT * FROM announcements ORDER BY id DESC LIMIT 1');
  res.status(201).json({ announcement: a });
});

router.put('/announcements/:id', (req, res) => {
  const { title, content } = req.body;
  const a = queryOne('SELECT id FROM announcements WHERE id=?', [req.params.id]);
  if (!a) return res.status(404).json({ error: 'Anuncio no encontrado' });
  runSql('UPDATE announcements SET title=COALESCE(?,title), content=COALESCE(?,content) WHERE id=?',
    [title, content, req.params.id]);
  const updated = queryOne('SELECT * FROM announcements WHERE id=?', [req.params.id]);
  res.json({ announcement: updated });
});

router.delete('/announcements/:id', (req, res) => {
  runSql('DELETE FROM announcements WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

router.put('/messages/:id/reply', (req, res) => {
  const { reply } = req.body;
  runSql('UPDATE contact_messages SET reply=COALESCE(?,reply) WHERE id=?', [reply, req.params.id]);
  res.json({ success: true });
});

router.get('/events', (req, res) => {
  const events = queryAll('SELECT * FROM events ORDER BY event_date ASC');
  res.json({ events });
});

router.post('/events', (req, res) => {
  const { title, description, event_date, event_time, color } = req.body;
  if (!title || !event_date) return res.status(400).json({ error: 'Título y fecha son obligatorios' });
  runSql('INSERT INTO events (title,description,event_date,event_time,color) VALUES (?,?,?,?,?)',
    [title, description || '', event_date, event_time || '', color || '#2a17cf']);
  const e = queryOne('SELECT * FROM events ORDER BY id DESC LIMIT 1');
  res.status(201).json({ event: e });
});

router.put('/events/:id', (req, res) => {
  const { title, description, event_date, event_time, color } = req.body;
  const ev = queryOne('SELECT id FROM events WHERE id=?', [req.params.id]);
  if (!ev) return res.status(404).json({ error: 'Evento no encontrado' });
  runSql(`UPDATE events SET title=COALESCE(?,title), description=COALESCE(?,description),
    event_date=COALESCE(?,event_date), event_time=COALESCE(?,event_time),
    color=COALESCE(?,color) WHERE id=?`,
    [title, description, event_date, event_time, color, req.params.id]);
  const updated = queryOne('SELECT * FROM events WHERE id=?', [req.params.id]);
  res.json({ event: updated });
});

router.delete('/events/:id', (req, res) => {
  runSql('DELETE FROM events WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

router.get('/table/:name', (req, res) => {
  const allowed = ['users', 'courses', 'contact_messages', 'announcements', 'events'];
  const name = req.params.name;
  if (!allowed.includes(name)) return res.status(400).json({ error: 'Tabla no permitida' });

  let rows;
  if (name === 'users') {
    rows = queryAll('SELECT id,username,email,password,role,created_at FROM users ORDER BY id');
  } else {
    rows = queryAll(`SELECT * FROM ${name} ORDER BY id`);
  }
  res.json(rows);
});

module.exports = router;

const express = require('express');
const { queryAll, queryOne, runSql } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Todas las rutas de admin requieren autenticación + rol admin
router.use(authenticateToken, requireAdmin);

// Dashboard - estadísticas generales
router.get('/stats', (req, res) => {
  const users = queryAll('SELECT COUNT(*) as c FROM users')[0].c;
  const messages = queryAll('SELECT COUNT(*) as c FROM contact_messages')[0].c;
  const unread = queryAll('SELECT COUNT(*) as c FROM contact_messages WHERE is_read=0')[0].c;
  const courses = queryAll('SELECT COUNT(*) as c FROM courses')[0].c;
  const announcements = queryAll('SELECT COUNT(*) as c FROM announcements')[0].c;
  const events = queryAll('SELECT COUNT(*) as c FROM events')[0].c;
  const orders = queryAll('SELECT COUNT(*) as c FROM orders')[0].c;
  const revenue = queryAll('SELECT COALESCE(SUM(total),0) as c FROM orders WHERE status=?', ['completed'])[0].c;
  res.json({ stats: { users, messages, unread, courses, announcements, events, orders, revenue } });
});

// Datos para los gráficos del dashboard (últimos 6 meses)
router.get('/stats/charts', (req, res) => {
  const months = [];
  const userData = [];
  const msgData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const y = d.getFullYear();
    const label = `${d.toLocaleString('es', { month: 'short' })} ${y}`;
    months.push(label);
    const start = `${y}-${m}-01`;
    const end = new Date(y, d.getMonth() + 1, 1).toISOString().split('T')[0];
    userData.push(queryOne("SELECT COUNT(*) as c FROM users WHERE created_at >= ? AND created_at < ?", [start, end]).c);
    msgData.push(queryOne("SELECT COUNT(*) as c FROM contact_messages WHERE created_at >= ? AND created_at < ?", [start, end]).c);
  }
  res.json({ months, users: userData, messages: msgData });
});

router.get('/users', (req, res) => {
  const users = queryAll('SELECT id,username,email,role,created_at FROM users ORDER BY id');
  res.json({ users });
});

router.post('/users', (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });

  const existing = queryOne('SELECT id FROM users WHERE username=? OR email=?', [username, email]);
  if (existing) return res.status(409).json({ error: 'El usuario o email ya existe' });

  const hash = bcrypt.hashSync(password, 10);
  const result = runSql('INSERT INTO users (username,email,password,role) VALUES (?,?,?,?)',
    [username, email, hash, role || 'user']);
  const user = queryOne('SELECT id,username,email,role,created_at FROM users WHERE id=?', [result.lastInsertRowid]);
  res.status(201).json({ user });
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

// Evita que el admin se elimine a sí mismo
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
  const { name, description, teacher, schedule, max_students, color, price } = req.body;
  const course = queryOne('SELECT * FROM courses WHERE id=?', [req.params.id]);
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

  try {
    runSql(`UPDATE courses SET
      name=?, description=?, teacher=?, schedule=?,
      max_students=?, color=?, price=?
      WHERE id=?`,
      [name ?? course.name, description ?? course.description, teacher ?? course.teacher,
       schedule ?? course.schedule, max_students ?? course.max_students,
       color ?? course.color, price ?? course.price, req.params.id]);
    const updated = queryOne('SELECT * FROM courses WHERE id=?', [req.params.id]);
    res.json({ course: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/courses', (req, res) => {
  const { name, description, teacher, schedule, max_students, color, price } = req.body;
  if (!name) return res.status(400).json({ error: 'El nombre del curso es obligatorio' });
  runSql('INSERT INTO courses (name,description,teacher,schedule,max_students,color,price) VALUES (?,?,?,?,?,?,?)',
    [name, description || '', teacher || '', schedule || '', max_students || 8, color || '#2a17cf', price || 0]);
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

router.get('/schedules', (req, res) => {
  const schedules = queryAll('SELECT * FROM schedules ORDER BY sort_order');
  res.json({ schedules });
});

router.post('/schedules', (req, res) => {
  const { group_name, days, start_time, end_time, sort_order } = req.body;
  const r = runSql('INSERT INTO schedules (group_name,days,start_time,end_time,sort_order) VALUES (?,?,?,?,?)',
    [group_name, days, start_time, end_time, sort_order || 0]);
  const s = queryOne('SELECT * FROM schedules WHERE id=?', [r.lastInsertRowid]);
  res.json({ schedule: s });
});

router.put('/schedules/:id', (req, res) => {
  const s = queryOne('SELECT id FROM schedules WHERE id=?', [req.params.id]);
  if (!s) return res.status(404).json({ error: 'No encontrado' });
  const { group_name, days, start_time, end_time, sort_order } = req.body;
  runSql('UPDATE schedules SET group_name=?,days=?,start_time=?,end_time=?,sort_order=? WHERE id=?',
    [group_name, days, start_time, end_time, sort_order || 0, req.params.id]);
  const updated = queryOne('SELECT * FROM schedules WHERE id=?', [req.params.id]);
  res.json({ schedule: updated });
});

router.delete('/schedules/:id', (req, res) => {
  runSql('DELETE FROM schedules WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

router.get('/teachers', (req, res) => {
  const teachers = queryAll('SELECT * FROM teachers ORDER BY id');
  res.json({ teachers });
});

router.post('/teachers', (req, res) => {
  const { name, title, bio, years_experience, specialties, image } = req.body;
  if (!name) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    const r = runSql('INSERT INTO teachers (name,title,bio,years_experience,specialties,image) VALUES (?,?,?,?,?,?)',
      [name, title || '', bio || '', years_experience || 0, specialties || '', image || '']);
    const t = queryOne('SELECT * FROM teachers WHERE id=?', [r.lastInsertRowid]);
    res.status(201).json({ teacher: t });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/teachers/:id', (req, res) => {
  const t = queryOne('SELECT id FROM teachers WHERE id=?', [req.params.id]);
  if (!t) return res.status(404).json({ error: 'Profesor no encontrado' });
  const { name, title, bio, years_experience, specialties, image } = req.body;
  try {
    runSql(`UPDATE teachers SET name=?, title=?, bio=?, years_experience=?, specialties=?, image=? WHERE id=?`,
      [name, title, bio, years_experience, specialties, image, req.params.id]);
    const updated = queryOne('SELECT * FROM teachers WHERE id=?', [req.params.id]);
    res.json({ teacher: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/teachers/:id', (req, res) => {
  const t = queryOne('SELECT id FROM teachers WHERE id=?', [req.params.id]);
  if (!t) return res.status(404).json({ error: 'Profesor no encontrado' });
  runSql('DELETE FROM teachers WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

router.get('/table/:name', (req, res) => {
  const allowed = ['users', 'courses', 'contact_messages', 'announcements', 'events', 'enrollments', 'schedules', 'teachers'];
  const name = req.params.name;
  if (!allowed.includes(name)) return res.status(400).json({ error: 'Tabla no permitida' });

  let rows;
  if (name === 'users') {
    rows = queryAll('SELECT id,username,email,password,role,created_at FROM users ORDER BY id');
  } else if (name === 'enrollments') {
    rows = queryAll(`SELECT e.id, e.user_id, u.username as user, e.course_id, c.name as course, e.created_at
      FROM enrollments e JOIN users u ON e.user_id=u.id JOIN courses c ON e.course_id=c.id ORDER BY e.id`);
  } else {
    rows = queryAll(`SELECT * FROM ${name} ORDER BY id`);
  }
  res.json(rows);
});

router.get('/courses/:id/students', (req, res) => {
  const students = queryAll(`SELECT u.id, u.username, u.email, e.created_at as enrolled_at
    FROM enrollments e JOIN users u ON e.user_id=u.id
    WHERE e.course_id=? ORDER BY e.created_at`, [req.params.id]);
  res.json({ students });
});

router.delete('/enrollments/:id', (req, res) => {
  runSql('DELETE FROM enrollments WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

router.get('/orders', (req, res) => {
  const orders = queryAll(`SELECT o.*, u.username FROM orders o
    JOIN users u ON o.user_id=u.id ORDER BY o.created_at DESC`);
  orders.forEach(o => {
    o.items = queryAll('SELECT * FROM order_items WHERE order_id=?', [o.id]);
  });
  res.json({ orders });
});

router.put('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  runSql('UPDATE orders SET status=? WHERE id=?', [status, req.params.id]);
  res.json({ success: true });
});

module.exports = router;

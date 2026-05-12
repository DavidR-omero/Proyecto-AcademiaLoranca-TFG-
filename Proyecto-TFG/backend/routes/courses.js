const express = require('express');
const { queryAll, queryOne, runSql } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/', (req, res) => {
  const courses = queryAll(`SELECT c.*,
    (SELECT COUNT(*) FROM enrollments WHERE course_id=c.id) as enrolled_count
    FROM courses c ORDER BY c.id`);
  res.json({ courses });
});

router.get('/:id', (req, res) => {
  const course = queryOne(`SELECT c.*,
    (SELECT COUNT(*) FROM enrollments WHERE course_id=c.id) as enrolled_count
    FROM courses c WHERE c.id=?`, [req.params.id]);
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  res.json({ course });
});

router.post('/enroll', authenticateToken, (req, res) => {
  const { course_id } = req.body;
  if (!course_id) return res.status(400).json({ error: 'ID del curso requerido' });

  const course = queryOne('SELECT * FROM courses WHERE id=?', [course_id]);
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

  const enrolled = queryOne('SELECT COUNT(*) as c FROM enrollments WHERE course_id=?', [course_id]).c;
  if (enrolled >= course.max_students)
    return res.status(400).json({ error: 'Curso completo, no hay plazas disponibles' });

  const existing = queryOne('SELECT id FROM enrollments WHERE user_id=? AND course_id=?', [req.user.id, course_id]);
  if (existing) return res.status(409).json({ error: 'Ya estás matriculado en este curso' });

  runSql('INSERT INTO enrollments (user_id, course_id) VALUES (?,?)', [req.user.id, course_id]);
  res.status(201).json({ success: true, message: 'Matriculado correctamente' });
});

router.delete('/enroll/:courseId', authenticateToken, (req, res) => {
  const row = queryOne('SELECT id FROM enrollments WHERE user_id=? AND course_id=?', [req.user.id, req.params.courseId]);
  if (!row) return res.status(404).json({ error: 'No estás matriculado en este curso' });
  runSql('DELETE FROM enrollments WHERE id=?', [row.id]);
  res.json({ success: true, message: 'Desmatriculado correctamente' });
});

router.get('/my/enrollments', authenticateToken, (req, res) => {
  const courses = queryAll(`SELECT c.*, e.created_at as enrolled_at,
    (SELECT COUNT(*) FROM enrollments WHERE course_id=c.id) as enrolled_count
    FROM enrollments e JOIN courses c ON e.course_id=c.id
    WHERE e.user_id=? ORDER BY e.created_at DESC`, [req.user.id]);
  res.json({ courses });
});

module.exports = router;

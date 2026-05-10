const express = require('express');
const { queryAll, queryOne } = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  const courses = queryAll('SELECT * FROM courses ORDER BY id');
  res.json({ courses });
});

router.get('/:id', (req, res) => {
  const course = queryOne('SELECT * FROM courses WHERE id=?', [req.params.id]);
  if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
  res.json({ course });
});

module.exports = router;

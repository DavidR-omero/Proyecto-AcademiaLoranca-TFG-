const express = require('express');
const { queryAll, queryOne } = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  const announcements = queryAll('SELECT * FROM announcements ORDER BY created_at DESC');
  res.json({ announcements });
});

router.get('/:id', (req, res) => {
  const a = queryOne('SELECT * FROM announcements WHERE id=?', [req.params.id]);
  if (!a) return res.status(404).json({ error: 'Anuncio no encontrado' });
  res.json({ announcement: a });
});

module.exports = router;

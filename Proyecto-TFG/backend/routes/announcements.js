const express = require('express');
const { queryAll, queryOne } = require('../database');
const router = express.Router();

// GET /api/announcements - listado público de anuncios (sin autenticación)
router.get('/', (req, res) => {
  const announcements = queryAll('SELECT * FROM announcements ORDER BY created_at DESC');
  res.json({ announcements });
});

// GET /api/announcements/:id - detalle de un anuncio concreto
router.get('/:id', (req, res) => {
  const a = queryOne('SELECT * FROM announcements WHERE id=?', [req.params.id]);
  if (!a) return res.status(404).json({ error: 'Anuncio no encontrado' });
  res.json({ announcement: a });
});

module.exports = router;

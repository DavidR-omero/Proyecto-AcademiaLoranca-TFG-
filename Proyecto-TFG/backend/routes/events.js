const express = require('express');
const { queryAll, queryOne } = require('../database');
const router = express.Router();

// GET /api/events - listado público de eventos (todos, ordenados por fecha)
router.get('/', (req, res) => {
  const events = queryAll('SELECT * FROM events ORDER BY event_date ASC');
  res.json({ events });
});

// GET /api/events/upcoming - solo eventos futuros (máx 10)
router.get('/upcoming', (req, res) => {
  const events = queryAll("SELECT * FROM events WHERE event_date >= date('now') ORDER BY event_date ASC LIMIT 10");
  res.json({ events });
});

// GET /api/events/:id - detalle de un evento concreto
router.get('/:id', (req, res) => {
  const e = queryOne('SELECT * FROM events WHERE id=?', [req.params.id]);
  if (!e) return res.status(404).json({ error: 'Evento no encontrado' });
  res.json({ event: e });
});

module.exports = router;

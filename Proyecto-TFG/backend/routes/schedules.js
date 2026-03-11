const express = require('express');
const { queryAll } = require('../database');
const router = express.Router();

// GET /api/schedules - listado público de horarios ordenados
router.get('/', (req, res) => {
  const schedules = queryAll('SELECT * FROM schedules ORDER BY sort_order');
  res.json({ schedules });
});

module.exports = router;

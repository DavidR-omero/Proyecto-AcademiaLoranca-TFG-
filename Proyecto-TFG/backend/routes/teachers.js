const express = require('express');
const { queryAll } = require('../database');
const router = express.Router();

// GET /api/teachers - listado público de profesores
router.get('/', (req, res) => {
  const teachers = queryAll('SELECT * FROM teachers ORDER BY id');
  res.json({ teachers });
});

module.exports = router;

const express = require('express');
const { queryAll } = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  const teachers = queryAll('SELECT * FROM teachers ORDER BY id');
  res.json({ teachers });
});

module.exports = router;

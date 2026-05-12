const express = require('express');
const { queryAll } = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  const schedules = queryAll('SELECT * FROM schedules ORDER BY sort_order');
  res.json({ schedules });
});

module.exports = router;

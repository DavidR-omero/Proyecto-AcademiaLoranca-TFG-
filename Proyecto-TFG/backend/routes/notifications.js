const express = require('express');
const { queryAll, queryOne } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const unread = queryOne(
    'SELECT COUNT(*) as c FROM contact_messages WHERE user_id=? AND is_read=0',
    [req.user.id]
  ).c;

  const upcoming = queryAll(
    "SELECT id FROM events WHERE event_date >= date('now') ORDER BY event_date LIMIT 5"
  ).length;

  const recentAnnouncements = queryAll(
    "SELECT id FROM announcements WHERE created_at >= datetime('now', '-7 days')"
  ).length;

  res.json({
    unread_messages: unread,
    upcoming_events: upcoming,
    new_announcements: recentAnnouncements,
    total: unread + upcoming + recentAnnouncements
  });
});

module.exports = router;

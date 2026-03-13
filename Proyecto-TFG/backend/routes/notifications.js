const express = require('express');
const { queryAll, queryOne } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// GET /api/notifications - contadores de notificaciones para el header
// Parámetro opcional 'since' para filtrar desde una fecha concreta
// Admin: mensajes sin leer + eventos próximos + anuncios recientes
// Usuario normal: solo eventos próximos + anuncios recientes
router.get('/', authenticateToken, (req, res) => {
  let since = req.query.since || null;
  if (since) {
    try { since = new Date(since).toISOString().replace('T', ' ').split('.')[0]; } catch { since = null; }
  }

  const isAdmin = req.user.role === 'admin';
  const unread = isAdmin
    ? (since
        ? queryOne('SELECT COUNT(*) as c FROM contact_messages WHERE is_read=0 AND created_at >= ?', [since]).c
        : queryOne('SELECT COUNT(*) as c FROM contact_messages WHERE is_read=0').c)
    : 0;

  const upcoming = since
    ? queryAll("SELECT id FROM events WHERE event_date >= date('now') AND created_at >= ? ORDER BY event_date LIMIT 5", [since]).length
    : queryAll("SELECT id FROM events WHERE event_date >= date('now') ORDER BY event_date LIMIT 5").length;

  const recentAnnouncements = since
    ? queryAll("SELECT id FROM announcements WHERE created_at >= ?", [since]).length
    : queryAll("SELECT id FROM announcements WHERE created_at >= datetime('now', '-7 days')").length;

  res.json({
    unread_messages: unread,
    upcoming_events: upcoming,
    new_announcements: recentAnnouncements,
    total: unread + upcoming + recentAnnouncements
  });
});

module.exports = router;

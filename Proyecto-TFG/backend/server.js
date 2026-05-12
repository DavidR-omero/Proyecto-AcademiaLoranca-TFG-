const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDb, queryAll } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const publicPath = path.join(__dirname, '..');
app.use(express.static(publicPath));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/events', require('./routes/events'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/stats/public', (req, res) => {
  const courses = queryAll('SELECT COUNT(*) as c FROM courses')[0].c;
  const teachers = queryAll('SELECT COUNT(*) as c FROM teachers')[0].c;
  const announcements = queryAll('SELECT COUNT(*) as c FROM announcements')[0].c;
  const events = queryAll('SELECT COUNT(*) as c FROM events')[0].c;
  res.json({ courses, teachers, announcements, events });
});

app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(publicPath, '404.html'));
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`\n  Academia Loranca API`);
    console.log(`  http://localhost:${PORT}`);
    console.log(`  Admin: admin / admin123\n`);
  });
}

if (require.main === module) {
  start().catch(console.error);
}

module.exports = { app, start };

const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDb } = require('./database');

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
app.use('/api/admin', require('./routes/admin'));

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`\n  Academia Loranca API`);
    console.log(`  http://localhost:${PORT}`);
    console.log(`  Admin: admin / admin123\n`);
  });
}

start().catch(console.error);

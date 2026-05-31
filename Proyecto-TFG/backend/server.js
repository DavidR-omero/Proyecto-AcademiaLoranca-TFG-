require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDb, queryAll } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'https://proyecto-academia-loranca-tfg.vercel.app',
    'http://localhost:3000'
  ]
}));
app.use(express.json({ limit: '1mb' }));

// Servir archivos estáticos desde la raíz del proyecto (HTML, CSS, JS, imágenes)
const publicPath = path.join(__dirname, '..');
app.use(express.static(publicPath));

// Montaje de rutas API
app.use('/api/auth', require('./routes/auth'));         // Login, registro, recuperación contraseña
app.use('/api/courses', require('./routes/courses'));    // Cursos y matriculaciones
app.use('/api/contact', require('./routes/contact'));    // Formulario de contacto
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/events', require('./routes/events'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/admin', require('./routes/admin'));        // Panel admin (protegido con JWT + role check)

// Estadísticas públicas para la landing page
app.get('/api/stats/public', (req, res) => {
  const courses = queryAll('SELECT COUNT(*) as c FROM courses')[0].c;
  const teachers = queryAll('SELECT COUNT(*) as c FROM teachers')[0].c;
  const announcements = queryAll('SELECT COUNT(*) as c FROM announcements')[0].c;
  const events = queryAll('SELECT COUNT(*) as c FROM events')[0].c;
  res.json({ courses, teachers, announcements, events });
});

// Catch-all: cualquier ruta no API devuelve la página 404 personalizada
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

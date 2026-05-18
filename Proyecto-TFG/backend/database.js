const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');
let db = null;

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

function runSql(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  stmt.step();
  const id = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0][0];
  stmt.free();
  save();
  return { lastInsertRowid: id };
}

function execSql(sql) {
  db.exec(sql);
  save();
}

function save() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function initDb() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  execSql(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      teacher TEXT DEFAULT '',
      schedule TEXT DEFAULT '',
      max_students INTEGER DEFAULT 8,
      color TEXT DEFAULT '#2a17cf',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      course_level TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      message TEXT DEFAULT '',
      is_read INTEGER DEFAULT 0,
      user_id INTEGER DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      event_date TEXT NOT NULL,
      event_time TEXT DEFAULT '',
      color TEXT DEFAULT '#2a17cf',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id),
      UNIQUE(user_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_name TEXT NOT NULL,
      days TEXT NOT NULL DEFAULT '',
      start_time TEXT NOT NULL DEFAULT '',
      end_time TEXT NOT NULL DEFAULT '',
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      payment_method TEXT DEFAULT '',
      payment_last4 TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      course_name TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      token TEXT DEFAULT '',
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    const cols = db.exec("PRAGMA table_info(contact_messages)")[0]?.values.map(v => v[1]);
    if (cols && !cols.includes('user_id')) {
      db.exec("ALTER TABLE contact_messages ADD COLUMN user_id INTEGER DEFAULT NULL");
      save();
    }
  } catch {}
  try {
    const cols = db.exec("PRAGMA table_info(contact_messages)")[0]?.values.map(v => v[1]);
    if (cols && !cols.includes('reply')) {
      db.exec("ALTER TABLE contact_messages ADD COLUMN reply TEXT DEFAULT ''");
      save();
    }
  } catch {}
  try {
    const courseCols = db.exec("PRAGMA table_info(courses)")[0]?.values.map(v => v[1]);
    if (courseCols && !courseCols.includes('price')) {
      db.exec("ALTER TABLE courses ADD COLUMN price REAL DEFAULT 0");
      save();
    }
  } catch {}
  try {
    const orderCols = db.exec("PRAGMA table_info(orders)")[0]?.values.map(v => v[1]);
    if (orderCols && !orderCols.includes('payment_method')) {
      db.exec("ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT ''");
      db.exec("ALTER TABLE orders ADD COLUMN payment_last4 TEXT DEFAULT ''");
      save();
    }
  } catch {}
  try {
    const schedCount = queryOne('SELECT COUNT(*) as c FROM schedules').c;
    if (schedCount < 8) {
      db.exec('DELETE FROM schedules');
      const allSchedules = [
        ['Refuerzo Integral - Grupo 1 (Isabel)', 'Lunes a Jueves', '15:00', '20:00', 1],
        ['Refuerzo Integral - Grupo 2 (Laura)', 'Lunes a Jueves', '16:00', '21:00', 2],
        ['Ciberseguridad y Hacking Ético (Carlos)', 'Martes y Jueves', '18:00', '20:00', 3],
        ['IA y Machine Learning (Ana)', 'Lunes y Miércoles', '17:00', '19:00', 4],
        ['Data Science y Análisis de Datos (David)', 'Miércoles y Viernes', '16:00', '18:00', 5],
        ['Desarrollo Web Full Stack (María)', 'Lunes a Viernes', '10:00', '12:00', 6],
        ['Marketing Digital y Redes Sociales (Sofía)', 'Martes y Jueves', '10:00', '12:00', 7],
        ['Diseño Gráfico y Adobe Suite (Javier)', 'Lunes, Miércoles y Viernes', '18:00', '20:00', 8],
      ];
      allSchedules.forEach(s => runSql('INSERT INTO schedules (group_name,days,start_time,end_time,sort_order) VALUES (?,?,?,?,?)', s));
      console.log('[DB] Horarios de todos los profesores registrados');
    }
  } catch {}
  try {
    db.exec("CREATE TABLE IF NOT EXISTS teachers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL, title TEXT DEFAULT '', bio TEXT DEFAULT '', years_experience INTEGER DEFAULT 0, specialties TEXT DEFAULT '', image TEXT DEFAULT '')");
    save();
  } catch {}
  const teacherCount = queryOne('SELECT COUNT(*) as c FROM teachers').c;
  if (teacherCount === 0) {
    runSql('INSERT INTO teachers (name,title,bio,years_experience,specialties,image) VALUES (?,?,?,?,?,?)',
      ['Isabel Rodriguez', 'Profesora de Refuerzo Integral',
       'Isabel es una apasionada de la enseñanza con una amplia experiencia en educación primaria y primer ciclo de secundaria. Su método se basa en la paciencia, la empatía y la creación de una base sólida de conocimientos. Especialista en detectar dificultades de aprendizaje tempranas y convertirlas en fortalezas.',
       12, 'Primaria, 1º ESO, Matemáticas, Lengua, Inglés', './imagenes/profeIsabel.png']);
    runSql('INSERT INTO teachers (name,title,bio,years_experience,specialties,image) VALUES (?,?,?,?,?,?)',
      ['Laura Barroso', 'Profesora de Refuerzo Integral y Preparación EVAU',
       'Laura es una docente vocacional con una trayectoria brillante preparando a estudiantes de secundaria y bachillerato para sus exámenes más importantes. Su energía y cercanía conectan con los adolescentes, ayudándoles a desarrollar confianza y autonomía. Especialista en técnicas de estudio y preparación de la EVAU.',
       10, '2º-4º ESO, Bachillerato, EVAU, Física, Química, Matemáticas', './imagenes/profeLaura.png']);
    runSql('INSERT INTO teachers (name,title,bio,years_experience,specialties,image) VALUES (?,?,?,?,?,?)',
      ['Carlos Mendoza', 'Ingeniero de Ciberseguridad',
       'Carlos es un experto en seguridad informática con experiencia en auditoría de sistemas y hacking ético. Ha trabajado como consultor para varias empresas tecnológicas y ahora comparte sus conocimientos en el aula. Sus clases son prácticas, con laboratorios reales y ejercicios de penetración controlados.',
       8, 'Ciberseguridad, Hacking Ético, Redes, Criptografía', '']);
    runSql('INSERT INTO teachers (name,title,bio,years_experience,specialties,image) VALUES (?,?,?,?,?,?)',
      ['Ana Beltrán', 'Científica de Datos e IA',
       'Ana es investigadora en inteligencia artificial con publicaciones en revistas internacionales. Combina su experiencia académica con proyectos empresariales de machine learning. Sus cursos son intensivos y prácticos, enfocados en aplicaciones reales de IA con Python y TensorFlow.',
       7, 'IA, Machine Learning, Python, TensorFlow, NLP', '']);
    runSql('INSERT INTO teachers (name,title,bio,years_experience,specialties,image) VALUES (?,?,?,?,?,?)',
      ['David Soler', 'Analista de Datos Senior',
       'David ha trabajado como data scientist en startups y grandes corporaciones, manejando volúmenes masivos de datos. Su enfoque pedagógico se centra en enseñar a pensar con datos, combinando estadística, visualización y storytelling con datos.',
       9, 'Data Science, Big Data, SQL, Python, R, Visualización', '']);
    runSql('INSERT INTO teachers (name,title,bio,years_experience,specialties,image) VALUES (?,?,?,?,?,?)',
      ['María León', 'Desarrolladora Full Stack',
       'María es desarrolladora web con más de 8 años construyendo aplicaciones para clientes internacionales. Domina tanto el frontend como el backend y enseña con metodologías ágiles. Sus alumnos aprenden construyendo proyectos reales desde el primer día.',
       8, 'HTML, CSS, JavaScript, React, Node.js, Bases de Datos', '']);
    runSql('INSERT INTO teachers (name,title,bio,years_experience,specialties,image) VALUES (?,?,?,?,?,?)',
      ['Sofía Rivas', 'Especialista en Marketing Digital',
       'Sofía ha liderado estrategias de marketing digital para marcas reconocidas, generando campañas de alto impacto en redes sociales y motores de búsqueda. Su formación es práctica y actualizada, enseñando las últimas tendencias del marketing online.',
       6, 'SEO, SEM, Redes Sociales, Email Marketing, Analytics', '']);
    runSql('INSERT INTO teachers (name,title,bio,years_experience,specialties,image) VALUES (?,?,?,?,?,?)',
      ['Javier Torres', 'Diseñador Gráfico Senior',
        'Javier es diseñador gráfico con más de 10 años de experiencia en agencias de publicidad y estudios de diseño. Ha liderado proyectos de branding, diseño UX/UI y campañas visuales para diversas empresas.\n\n' +
        '🎯 Metodología:\n' +
        'Sus clases combinan teoría del diseño con práctica intensiva en Adobe Creative Suite y Figma. Cada alumno desarrolla un portafolio profesional real durante el curso, con proyectos que van desde diseño de logotipos hasta prototipos interactivos de apps.\n\n' +
        '💡 Ideal para:\n' +
        'Creativos que quieren profesionalizar su talento, estudiantes de diseño que buscan portafolio, y profesionales que necesitan dominar herramientas Adobe para destacar en el mercado laboral.',
        10, 'Diseño Gráfico, Adobe Suite, UX/UI, Branding, Tipografía', '']);
    console.log('[DB] Teachers seeded');
  }

  const admin = queryOne('SELECT id FROM users WHERE username=?', ['admin']);
  if (!admin) {
    const hash = bcrypt.hashSync('admin123', 10);
    runSql('INSERT INTO users (username,email,password,role) VALUES (?,?,?,?)',
      ['admin', 'admin@academialoranca.com', hash, 'admin']);
    console.log('[DB] Admin creado (admin / admin123)');
  }

  if (queryOne('SELECT COUNT(*) as c FROM courses').c === 0) {
    runSql(`INSERT INTO courses (name,description,teacher,schedule,max_students,color,price)
      VALUES (?,?,?,?,?,?,?)`,
      ['Refuerzo Integral - Grupo 1',
       'Clases de refuerzo escolar para Primaria y 1º ESO. Atención personalizada en grupos reducidos.',
        'Isabel Rodriguez', 'Lunes a Jueves 15:00-20:00', 20, '#2a17cf', 49.90]);
    runSql(`INSERT INTO courses (name,description,teacher,schedule,max_students,color,price)
      VALUES (?,?,?,?,?,?,?)`,
      ['Refuerzo Integral - Grupo 2',
       'Clases de refuerzo escolar para 2º-4º ESO y Bachillerato. Preparación de exámenes y EVAU.',
        'Laura Barroso', 'Lunes a Jueves 16:00-21:00', 20, '#00d5ff', 49.90]);
    runSql(`INSERT INTO courses (name,description,teacher,schedule,max_students,color,price)
      VALUES (?,?,?,?,?,?,?)`,
      ['Ciberseguridad y Hacking Ético',
       'Aprende los fundamentos de la ciberseguridad, análisis de vulnerabilidades, cifrado y pruebas de penetración. Curso práctico con laboratorios virtuales.',
        'Carlos Mendoza', 'Martes y Jueves 18:00-20:00', 20, '#dc2626', 79.90]);
    runSql(`INSERT INTO courses (name,description,teacher,schedule,max_students,color,price)
      VALUES (?,?,?,?,?,?,?)`,
      ['Inteligencia Artificial y Machine Learning',
       'Domina los conceptos de IA, redes neuronales, procesamiento del lenguaje natural y visión por computadora. Proyectos reales con Python y TensorFlow.',
        'Ana Beltrán', 'Lunes y Miércoles 17:00-19:00', 20, '#7c3aed', 89.90]);
    runSql(`INSERT INTO courses (name,description,teacher,schedule,max_students,color,price)
      VALUES (?,?,?,?,?,?,?)`,
      ['Data Science y Análisis de Datos',
       'Big Data, estadística avanzada, visualización de datos con Python, R y SQL. Ideal para quienes buscan dominar el análisis de datos empresariales.',
        'David Soler', 'Miércoles y Viernes 16:00-18:00', 20, '#0891b2', 69.90]);
    runSql(`INSERT INTO courses (name,description,teacher,schedule,max_students,color,price)
      VALUES (?,?,?,?,?,?,?)`,
      ['Desarrollo Web Full Stack',
       'Aprende HTML, CSS, JavaScript, React, Node.js y bases de datos. Construye aplicaciones web completas desde cero hasta producción.',
        'María León', 'Lunes a Viernes 10:00-12:00', 20, '#059669', 99.90]);
    runSql(`INSERT INTO courses (name,description,teacher,schedule,max_students,color,price)
      VALUES (?,?,?,?,?,?,?)`,
      ['Marketing Digital y Redes Sociales',
       'Estrategias de marketing online, SEO, SEM, email marketing y gestión de redes sociales. Certificación práctica incluida.',
       'Sofía Rivas', 'Martes y Jueves 10:00-12:00', 20, '#d97706', 59.90]);
    runSql(`INSERT INTO courses (name,description,teacher,schedule,max_students,color,price)
      VALUES (?,?,?,?,?,?,?)`,
      ['Diseño Gráfico y Adobe Creative Suite',
       'Photoshop, Illustrator, InDesign y Figma. Desde fundamentos del diseño hasta proyectos profesionales para portafolio.',
        'Javier Torres', 'Lunes, Miércoles y Viernes 18:00-20:00', 20, '#db2777', 74.90]);
    console.log('[DB] Cursos creados');
  }

  if (queryOne('SELECT COUNT(*) as c FROM announcements').c === 0) {
    runSql('INSERT INTO announcements (title, content) VALUES (?,?)',
      ['🎉 Nuevo curso: Ciberseguridad y Hacking Ético',
       'Ya está disponible nuestro nuevo curso de Ciberseguridad. Aprende fundamentos de seguridad informática, análisis de vulnerabilidades y pruebas de penetración con laboratorios virtuales. Plazas limitadas.']);
    runSql('INSERT INTO announcements (title, content) VALUES (?,?)',
      ['📚 Horarios de verano 2026',
       'Durante los meses de julio y agosto, los grupos de refuerzo pasarán a horario intensivo de mañana (10:00-13:00). Consulta disponibilidad con tu profesor.']);
    runSql('INSERT INTO announcements (title, content) VALUES (?,?)',
      ['🏆 Alumnos del mes',
       'Este mes destacamos a Carlota y Marcos por su excelente evolución en matemáticas y lengua. ¡Enhorabuena! Seguid así.']);
    console.log('[DB] Anuncios creados');
  }

  if (queryOne('SELECT COUNT(*) as c FROM events').c === 0) {
    runSql('INSERT INTO events (title, description, event_date, event_time, color) VALUES (?,?,?,?,?)',
      ['Jornada de Puertas Abiertas',
       'Ven a conocer nuestras instalaciones y metodología. Habrá sesiones informativas para padres y actividades para niños.',
       '2026-06-15', '11:00', '#2a17cf']);
    runSql('INSERT INTO events (title, description, event_date, event_time, color) VALUES (?,?,?,?,?)',
      ['Taller de Inteligencia Artificial para Jóvenes',
       'Taller gratuito donde los alumnos aprenderán conceptos básicos de IA usando herramientas visuales. Edad recomendada: 12-16 años.',
       '2026-06-22', '17:00', '#7c3aed']);
    runSql('INSERT INTO events (title, description, event_date, event_time, color) VALUES (?,?,?,?,?)',
      ['Fin de Curso – Entrega de Notas',
       'Reunión con familias para la entrega de notas finales y valoración del progreso anual del alumno.',
       '2026-06-29', '18:00', '#059669']);
    console.log('[DB] Eventos creados');
  }

  console.log('[DB] Base de datos lista');
}

module.exports = { initDb, queryAll, queryOne, runSql };

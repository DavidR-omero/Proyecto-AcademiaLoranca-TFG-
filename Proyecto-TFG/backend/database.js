const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'database.sqlite');
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

  const admin = queryOne('SELECT id FROM users WHERE username=?', ['admin']);
  if (!admin) {
    const hash = bcrypt.hashSync('admin123', 10);
    runSql('INSERT INTO users (username,email,password,role) VALUES (?,?,?,?)',
      ['admin', 'admin@academialoranca.com', hash, 'admin']);
    console.log('[DB] Admin creado (admin / admin123)');
  }

  if (queryOne('SELECT COUNT(*) as c FROM courses').c === 0) {
    runSql(`INSERT INTO courses (name,description,teacher,schedule,max_students,color)
      VALUES (?,?,?,?,?,?)`,
      ['Refuerzo Integral - Grupo 1',
       'Clases de refuerzo escolar para Primaria y 1º ESO. Atención personalizada en grupos reducidos.',
       'Isabel Rodriguez', 'Lunes a Jueves 15:00-20:00', 8, '#2a17cf']);
    runSql(`INSERT INTO courses (name,description,teacher,schedule,max_students,color)
      VALUES (?,?,?,?,?,?)`,
      ['Refuerzo Integral - Grupo 2',
       'Clases de refuerzo escolar para 2º-4º ESO y Bachillerato. Preparación de exámenes y EVAU.',
       'Laura Barroso', 'Lunes a Jueves 16:00-21:00', 8, '#00d5ff']);
    console.log('[DB] Cursos creados');
  }

  console.log('[DB] Base de datos lista');
}

module.exports = { initDb, queryAll, queryOne, runSql };

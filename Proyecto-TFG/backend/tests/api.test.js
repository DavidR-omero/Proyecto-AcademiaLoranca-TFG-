const request = require('supertest');
const path = require('path');
const fs = require('fs');

process.env.DB_PATH = path.join(__dirname, 'test.sqlite');
process.env.JWT_SECRET = 'test-secret';

const { initDb } = require('../database');
let app;

beforeAll(async () => {
  await initDb();
  app = require('../server').app;
});

afterAll(() => {
  try { fs.unlinkSync(process.env.DB_PATH); } catch {}
});

let adminToken, userToken;

describe('Auth', () => {
  test('POST /api/auth/register - crear usuario', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'testuser', email: 'test@test.com', password: '123456'
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    userToken = res.body.token;
  });

  test('POST /api/auth/register - usuario duplicado da error', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'testuser', email: 'test@test.com', password: '123456'
    });
    expect(res.status).toBe(409);
  });

  test('POST /api/auth/login - login correcto', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'admin', password: 'admin123'
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('admin');
    adminToken = res.body.token;
  });

  test('POST /api/auth/login - credenciales invalidas', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'admin', password: 'wrong'
    });
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me - sin token da 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me - con token devuelve usuario', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('admin');
  });
});

describe('Courses', () => {
  test('GET /api/courses - lista cursos', async () => {
    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(200);
    expect(res.body.courses.length).toBeGreaterThanOrEqual(2);
    expect(res.body.courses[0]).toHaveProperty('name');
    expect(res.body.courses[0]).toHaveProperty('price');
  });

  test('GET /api/courses/:id - curso individual', async () => {
    const res = await request(app).get('/api/courses/1');
    expect(res.status).toBe(200);
    expect(res.body.course.name).toBeDefined();
  });

  test('GET /api/courses/:id - 404 si no existe', async () => {
    const res = await request(app).get('/api/courses/999');
    expect(res.status).toBe(404);
  });
});

describe('Admin - CRUD cursos', () => {
  let courseId;

  test('POST /api/admin/courses - crear curso', async () => {
    const res = await request(app).post('/api/admin/courses').set('Authorization', `Bearer ${adminToken}`).send({
      name: 'Curso Test', description: 'Descripcion test', teacher: 'Profe Test',
      schedule: 'Lunes 10:00', max_students: 10, color: '#ff0000', price: 99.90
    });
    expect(res.status).toBe(201);
    expect(res.body.course.name).toBe('Curso Test');
    expect(res.body.course.price).toBe(99.90);
    courseId = res.body.course.id;
  });

  test('PUT /api/admin/courses/:id - editar curso', async () => {
    const res = await request(app).put(`/api/admin/courses/${courseId}`).set('Authorization', `Bearer ${adminToken}`).send({
      name: 'Curso Test Editado', price: 59.90
    });
    expect(res.status).toBe(200);
    expect(res.body.course.name).toBe('Curso Test Editado');
    expect(res.body.course.price).toBe(59.90);
  });

  test('DELETE /api/admin/courses/:id - eliminar curso', async () => {
    const res = await request(app).delete(`/api/admin/courses/${courseId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test('POST /api/admin/courses sin auth da 401', async () => {
    const res = await request(app).post('/api/admin/courses').send({ name: 'Test' });
    expect(res.status).toBe(401);
  });

  test('POST /api/admin/courses con user normal da 403', async () => {
    const res = await request(app).post('/api/admin/courses').set('Authorization', `Bearer ${userToken}`).send({ name: 'Test' });
    expect(res.status).toBe(403);
  });
});

describe('Contact', () => {
  test('POST /api/contact - enviar mensaje', async () => {
    const res = await request(app).post('/api/contact').send({
      name: 'Juan', email: 'juan@test.com', message: 'Hola, quiero info'
    });
    expect(res.status).toBe(201);
    expect(res.body.message).toBeDefined();
  });
});

describe('Announcements', () => {
  test('GET /api/announcements - lista publica', async () => {
    const res = await request(app).get('/api/announcements');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.announcements)).toBe(true);
  });
});

describe('Events', () => {
  test('GET /api/events - lista publica', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.events)).toBe(true);
  });

  test('GET /api/events/upcoming - eventos proximos', async () => {
    const res = await request(app).get('/api/events/upcoming');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.events)).toBe(true);
  });
});

describe('Orders', () => {
  test('POST /api/orders - crear pedido requiere auth', async () => {
    const res = await request(app).post('/api/orders').send({ items: [] });
    expect(res.status).toBe(401);
  });

  test('POST /api/orders - crear pedido', async () => {
    const res = await request(app).post('/api/orders').set('Authorization', `Bearer ${userToken}`).send({
      items: [{ course_id: 1, course_name: 'Curso 1', price: 49.90 }]
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.total).toBe(49.90);
  });

  test('GET /api/orders - listar pedidos del usuario', async () => {
    const res = await request(app).get('/api/orders').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Admin - Stats', () => {
  test('GET /api/admin/stats', async () => {
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.stats).toHaveProperty('users');
    expect(res.body.stats).toHaveProperty('courses');
    expect(res.body.stats).toHaveProperty('orders');
    expect(res.body.stats).toHaveProperty('revenue');
  });
});

describe('Admin - Gestion usuarios', () => {
  test('GET /api/admin/users', async () => {
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Admin - Orders', () => {
  test('GET /api/admin/orders', async () => {
    const res = await request(app).get('/api/admin/orders').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.orders).toBeDefined();
  });

  test('PUT /api/admin/orders/:id/status', async () => {
    const { body } = await request(app).get('/api/admin/orders').set('Authorization', `Bearer ${adminToken}`);
    if (body.orders.length > 0) {
      const id = body.orders[0].id;
      const res = await request(app).put(`/api/admin/orders/${id}/status`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'completed' });
      expect(res.status).toBe(200);
    }
  });
});

describe('404', () => {
  test('Ruta inexistente devuelve 404', async () => {
    const res = await request(app).get('/api/ruta-inexistente');
    expect(res.status).toBe(404);
  });
});
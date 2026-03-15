const express = require('express');
const router = express.Router();
const { queryAll, queryOne, runSql } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/orders - pedidos del usuario actual
router.get('/', authenticateToken, (req, res) => {
  const orders = queryAll(`SELECT o.*, u.username FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC`, [req.user.id]);
  orders.forEach(o => {
    o.items = queryAll('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
  });
  res.json(orders);
});

// GET /api/orders/:id - detalle de un pedido concreto
router.get('/:id', authenticateToken, (req, res) => {
  const order = queryOne(`SELECT o.*, u.username FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.id = ? AND o.user_id = ?`, [req.params.id, req.user.id]);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
  order.items = queryAll('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
  res.json(order);
});

/*
  POST /api/orders - crear pedido (checkout simulado)
  Crea la orden como 'pending', espera 1.5s (simula autorización bancaria)
  y la marca como 'completed'. Guarda método de pago y últimos 4 dígitos.
  No almacena datos sensibles de tarjeta.
*/
router.post('/', authenticateToken, async (req, res) => {
  const { items, payment_method, payment_last4 } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Carrito vacío' });
  const total = items.reduce((sum, it) => sum + (it.price || 0), 0);

  const order = runSql(`INSERT INTO orders (user_id, total, status, payment_method, payment_last4)
    VALUES (?, ?, 'pending', ?, ?)`,
    [req.user.id, total, payment_method || '', payment_last4 || '']);

  items.forEach(it => {
    runSql('INSERT INTO order_items (order_id, course_id, course_name, price) VALUES (?, ?, ?, ?)',
      [order.lastInsertRowid, it.course_id || 0, it.course_name, it.price]);
  });

  await new Promise(r => setTimeout(r, 1500));

  runSql('UPDATE orders SET status = ? WHERE id = ?', ['completed', order.lastInsertRowid]);

  const created = queryOne('SELECT * FROM orders WHERE id = ?', [order.lastInsertRowid]);
  created.items = queryAll('SELECT * FROM order_items WHERE order_id = ?', [created.id]);
  res.status(201).json(created);
});

module.exports = router;

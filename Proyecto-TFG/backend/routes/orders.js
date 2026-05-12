const express = require('express');
const router = express.Router();
const { queryAll, queryOne, runSql } = require('../database');
const { authenticateToken } = require('../middleware/auth');

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

router.get('/:id', authenticateToken, (req, res) => {
  const order = queryOne(`SELECT o.*, u.username FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.id = ? AND o.user_id = ?`, [req.params.id, req.user.id]);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
  order.items = queryAll('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
  res.json(order);
});

router.post('/', authenticateToken, (req, res) => {
  const { items } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Carrito vacío' });
  const total = items.reduce((sum, it) => sum + (it.price || 0), 0);
  const order = runSql('INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
    [req.user.id, total, 'completed']);
  items.forEach(it => {
    runSql('INSERT INTO order_items (order_id, course_id, course_name, price) VALUES (?, ?, ?, ?)',
      [order.lastInsertRowid, it.course_id || 0, it.course_name, it.price]);
  });
  const created = queryOne('SELECT * FROM orders WHERE id = ?', [order.lastInsertRowid]);
  created.items = queryAll('SELECT * FROM order_items WHERE order_id = ?', [created.id]);
  res.status(201).json(created);
});

module.exports = router;

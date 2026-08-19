const express = require('express');
const router = express.Router();

// GET /orders
router.get('/', (req, res) => {
  res.json([
    { id: 1, customerId: 1, total: 1000 },
    { id: 2, customerId: 2, total: 2000 }
  ]);
});

// POST /orders
router.post('/', (req, res) => {
  const order = req.body;
  res.status(201).json({ id: 3, ...order });
});

module.exports = router;
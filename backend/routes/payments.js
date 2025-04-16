const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

// ===========================
// 📌 1. Make a Payment
// ===========================
router.post('/', verifyToken, async (req, res) => {
  const { userId, orderId, amount, method } = req.body;

  if (!userId || !orderId || !amount || !method) {
    return res.status(400).json({ message: '❌ Missing required fields' });
  }

  try {
    // Insert into payment table
    const sql = `
      INSERT INTO payment (user_id, order_id, amount, payment_status)
      VALUES (?, ?, ?, 'Completed')
    `;

    const [result] = await db.query(sql, [userId, orderId, amount]);

    // Optionally update customerorder.status to "Completed"
    await db.query(`UPDATE customerorder SET status = 'Completed' WHERE id = ?`, [orderId]);

    res.status(201).json({ message: '✅ Payment recorded successfully!' });

  } catch (err) {
    console.error('❌ Payment DB Error:', err);
    res.status(500).json({ message: 'Server error during payment' });
  }
});

// ===========================
// 📌 2. Get Unpaid Orders for Logged-in Customer
// ===========================
router.get('/unpaid', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const sql = `
      SELECT co.id AS order_id, d.name AS design_name, d.price AS amount
      FROM customerorder co
      JOIN design d ON co.design_id = d.id
      LEFT JOIN payment p ON co.id = p.order_id
      WHERE co.user_id = ? AND p.id IS NULL
    `;

    const [results] = await db.query(sql, [userId]);

    res.status(200).json(results);
  } catch (err) {
    console.error("❌ Failed to fetch unpaid orders:", err);
    res.status(500).json({ message: 'Server error fetching unpaid orders' });
  }
});

module.exports = router;

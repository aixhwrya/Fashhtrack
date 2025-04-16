// backend/routes/profile.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const db = require('../db');

router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [userRows] = await db.query(
      'SELECT id, name, email, phone, role FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userRows[0];

    if (user.role === 'customer') {
      const [orderRows] = await db.query(
        'SELECT id, status FROM customerorder WHERE user_id = ?',
        [userId]
      );
      user.orders = orderRows;
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

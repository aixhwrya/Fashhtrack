const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

// 📩 Submit Feedback
router.post('/', verifyToken, (req, res) => {
  const { subject, message, order_id = null, rating = null } = req.body;
  const user_id = req.user.id;

  if (!subject || !message) {
    return res.status(400).json({ message: "Subject and message are required" });
  }

  const sql = `INSERT INTO feedback (user_id, subject, order_id, message, rating) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [user_id, subject, order_id, message, rating], (err, result) => {
    if (err) {
      console.error("❌ Feedback DB Error:", err);
      return res.status(500).json({ message: "Failed to submit feedback" });
    }

    res.status(201).json({ message: "✅ Feedback submitted successfully!" });
  });
});

module.exports = router;

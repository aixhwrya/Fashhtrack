const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../middleware/authMiddleware');

// GET leftover fabric list
router.get('/', verifyToken, async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM leftover ORDER BY id DESC');
    res.json(results);
  } catch (error) {
    console.error('Error fetching leftover fabric:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST new leftover fabric
router.post('/', verifyToken, async (req, res) => {
  const { fabric_type, quantity, color, purpose } = req.body;

  if (!fabric_type || !quantity || !color || !purpose) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    await db.query(
      'INSERT INTO leftover (fabric_type, quantity, color, purpose) VALUES (?, ?, ?, ?)',
      [fabric_type, quantity, color, purpose]
    );
    res.status(201).json({ message: 'Leftover fabric added successfully' });
  } catch (error) {
    console.error('Error inserting leftover fabric:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

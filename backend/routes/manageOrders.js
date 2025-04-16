const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// ✅ GET /api/manage-order — Admin & Staff Only
router.get('/', verifyToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT 
        customerorder.*, 
        users.name AS customer_name, 
        design.name AS design_name
      FROM customerorder
      JOIN users ON customerorder.user_id = users.id
      JOIN design ON customerorder.design_id = design.id
      ORDER BY customerorder.order_date DESC
    `);

    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching manage-orders:", err.message);
    res.status(500).json({ message: "Internal Server Error while fetching orders." });
  }
});

module.exports = router;

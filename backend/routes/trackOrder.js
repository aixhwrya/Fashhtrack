const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const { orderId } = req.query;
  console.log("📥 Received orderId for tracking:", orderId);

  if (!orderId) {
    return res.status(400).json({ error: "Order ID is required" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT 
         o.id AS order_id,
         d.name AS design_name,
         o.status,
         DATE_ADD(o.order_date, INTERVAL 5 DAY) AS expected_delivery
       FROM customerorder o
       JOIN design d ON o.design_id = d.id
       WHERE o.id = ?`,
      [orderId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const result = rows[0];
    res.json({
      order_id: result.order_id,
      design_name: result.design_name,
      status: result.status || "Pending",
      expected_delivery: result.expected_delivery?.toISOString().split('T')[0] || "Unknown"
    });

  } catch (error) {
    console.error("❌ Error fetching order:", error);
    res.status(500).json({ error: "Server error while fetching order" });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const db = require('../db');

// ✅ Dashboard Stats Route (admin + staff only)
router.get('/stats', verifyToken, async (req, res) => {
  try {
    // Only admin or staff allowed
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ error: 'Access denied' });
    }

    let totalOrders = 0;
    let totalCustomers = 0;
    let pendingShipments = 0;

    // ✅ Total Orders
    const [ordersResult] = await db.query('SELECT COUNT(*) AS totalOrders FROM customerorder');
    totalOrders = ordersResult[0].totalOrders || 0;

    // ✅ Total Customers
    const [customersResult] = await db.query('SELECT COUNT(*) AS totalCustomers FROM users WHERE role = "customer"');
    totalCustomers = customersResult[0].totalCustomers || 0;

    // ✅ Pending Shipments (optional)
    try {
      const [shipmentsResult] = await db.query('SELECT COUNT(*) AS pendingShipments FROM shipments WHERE status = "Pending"');
      pendingShipments = shipmentsResult[0].pendingShipments || 0;
    } catch (shipmentError) {
      console.warn("⚠️ 'shipments' table not found or error in query. Skipping shipment stats.");
    }

    // ✅ Return stats
    res.json({
      totalOrders,
      totalCustomers,
      pendingShipments
    });

  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

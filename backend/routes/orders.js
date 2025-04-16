const express = require('express');
const db = require('../db'); // mysql2/promise pool
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// ===============================
// 📌 1. Place a New Order (Customer)
// ===============================
router.post('/place-order', verifyToken, async (req, res) => {
  console.log("🚀 [POST] /place-order hit");

  const { design_id, measurements, requirements, quantity, color, size } = req.body;
  const user_id = req.user.id;

  if (!design_id || !measurements || !quantity || !color || !size) {
    return res.status(400).json({ error: '❌ Missing required fields' });
  }

  const sql = `
    INSERT INTO customerorder 
    (user_id, design_id, measurements, requirements, quantity, status, order_date, color, size) 
    VALUES (?, ?, ?, ?, ?, 'Pending', NOW(), ?, ?)
  `;

  try {
    const [result] = await db.query(sql, [
      user_id,
      design_id,
      measurements,
      requirements || '',
      quantity,
      color,
      size
    ]);

    console.log("✅ Order placed successfully:", result.insertId);
    return res.status(201).json({
      message: "✅ Order placed successfully!",
      order_id: result.insertId
    });
  } catch (error) {
    console.error("❌ DB Error placing order:", error);
    return res.status(500).json({ error: "Database error while placing order" });
  }
});

// ===============================
// 📌 2. Get All Orders (Admin + Staff)
// ===============================
router.get('/all-orders', verifyToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  const sql = `
    SELECT customerorder.*, users.name AS customer_name, design.name AS design_name
    FROM customerorder
    JOIN users ON customerorder.user_id = users.id
    JOIN design ON customerorder.design_id = design.id
    ORDER BY customerorder.order_date DESC
  `;

  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error('❌ Fetch all orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ===============================
// 📌 3. Track Logged-in Customer Orders
// ===============================
router.get('/track-order', verifyToken, async (req, res) => {
  const user_id = req.user.id;

  const sql = `
    SELECT customerorder.*, design.name AS design_name 
    FROM customerorder 
    LEFT JOIN design ON customerorder.design_id = design.id
    WHERE customerorder.user_id = ?
    ORDER BY customerorder.order_date DESC
  `;

  try {
    const [results] = await db.query(sql, [user_id]);
    res.json(results);
  } catch (err) {
    console.error('❌ Track order error:', err);
    res.status(500).json({ error: 'Failed to track orders' });
  }
});

// ===============================
// 📌 4. Update Order Status (Admin + Staff)
// ===============================
router.put('/update-order/:id', verifyToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const validStatuses = ['Pending', 'Processing', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  const sql = `UPDATE customerorder SET status = ? WHERE id = ?`;

  try {
    const [result] = await db.query(sql, [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found or already updated' });
    }

    res.json({ message: '✅ Order status updated successfully!' });
  } catch (err) {
    console.error('❌ Update order status error:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// ===============================
// 📌 5. Cancel/Delete Order (Admin Only)
// ===============================
router.delete('/cancel-order/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM customerorder WHERE id = ?`;

  try {
    const [result] = await db.query(sql, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: '✅ Order canceled successfully!' });
  } catch (err) {
    console.error('❌ Cancel order error:', err);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// ===============================
// 📌 6. My Orders (Logged-in Customer)
// ===============================
router.get('/my', verifyToken, async (req, res) => {
  const user_id = req.user.id;
  console.log("📥 Fetching orders for user_id:", user_id);

  const sql = `
    SELECT customerorder.id AS order_id, design.name AS design_name, customerorder.status, customerorder.order_date
    FROM customerorder 
    LEFT JOIN design ON customerorder.design_id = design.id
    WHERE customerorder.user_id = ?
    ORDER BY customerorder.order_date DESC
  `;

  try {
    const [rows] = await db.query(sql, [user_id]);
    console.log("✅ Orders returned:", rows.length);
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Error fetching /my orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ===============================
// 📌 7. Fetch Unpaid Orders (for Payment Page)
// ===============================
router.get('/unpaid', verifyToken, async (req, res) => {
  const user_id = req.user.id;

  const sql = `
    SELECT co.id AS order_id, d.price AS amount
    FROM customerorder co
    JOIN design d ON co.design_id = d.id
    LEFT JOIN payment p ON co.id = p.order_id
    WHERE co.user_id = ? AND p.id IS NULL
  `;

  try {
    const [orders] = await db.query(sql, [user_id]);
    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching unpaid orders:", err);
    res.status(500).json({ message: "Failed to load unpaid orders" });
  }
});

// ===============================
// 📌 8. Update Order Details (Admin Only)
// ===============================
router.put('/updateDetails', verifyToken, authorizeRoles("admin"), async (req, res) => {
  const { id, measurements, requirements, quantity } = req.body;

  if (!id || !measurements || !quantity) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const [result] = await db.query(
      "UPDATE customerorder SET measurements = ?, requirements = ?, quantity = ? WHERE id = ?",
      [measurements, requirements, quantity, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "✅ Order updated successfully!" });
  } catch (err) {
    console.error("❌ Error updating order:", err);
    res.status(500).json({ message: "Server error while updating order." });
  }
});
// ===============================
// 📌 9. Get Order by ID (Admin)
// ===============================
router.get('/:id', verifyToken, authorizeRoles("admin"), async (req, res) => {
  const orderId = req.params.id;

  try {
    const [result] = await db.query(
      'SELECT measurements, requirements, quantity FROM customerorder WHERE id = ?',
      [orderId]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(result[0]);
  } catch (err) {
    console.error('❌ Error fetching order by ID:', err);
    res.status(500).json({ message: 'Failed to fetch order details' });
  }
});

module.exports = router;

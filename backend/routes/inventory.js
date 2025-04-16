const express = require('express');
const router = express.Router();
const db = require('../db'); // ✅ Promise-based DB pool
const { verifyToken, verifyAdmin, authorizeRoles } = require('../middleware/authMiddleware');

// ✅ Get all inventory items (admin and staff)
router.get('/', verifyToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const [items] = await db.query('SELECT * FROM inventory');
    res.json(items);
  } catch (error) {
    console.error('❌ Error fetching inventory:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ Get a single inventory item by ID (admin and staff)
router.get('/:id', verifyToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  const itemId = req.params.id;
  try {
    const [items] = await db.query('SELECT * FROM inventory WHERE id = ?', [itemId]);

    if (items.length === 0) {
      return res.status(404).json({ message: '❌ Inventory item not found' });
    }

    res.json(items[0]);
  } catch (error) {
    console.error('❌ Error fetching inventory item:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ Add a new inventory item (admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  const { item_name, quantity, price, supplier } = req.body;

  if (!item_name || !quantity || !price || !supplier) {
    return res.status(400).json({ message: '❌ All fields are required' });
  }

  try {
    await db.query(
      'INSERT INTO inventory (item_name, quantity, price, supplier, last_updated) VALUES (?, ?, ?, ?, NOW())',
      [item_name, quantity, price, supplier]
    );
    res.status(201).json({ message: '✅ Inventory item added successfully' });
  } catch (error) {
    console.error('❌ Error adding inventory item:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ Update inventory item (admin only)
router.put('/update/:id', verifyToken, verifyAdmin, async (req, res) => {
  const itemId = req.params.id;
  const { item_name, quantity, price, supplier } = req.body;

  if (!item_name || !quantity || !price || !supplier) {
    return res.status(400).json({ message: '❌ All fields are required' });
  }

  try {
    const [result] = await db.query(
      'UPDATE inventory SET item_name = ?, quantity = ?, price = ?, supplier = ?, last_updated = NOW() WHERE id = ?',
      [item_name, quantity, price, supplier, itemId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '❌ Inventory item not found' });
    }

    res.json({ message: '✅ Inventory item updated successfully!' });
  } catch (error) {
    console.error('❌ Error updating inventory:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ Delete inventory item (admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  const itemId = req.params.id;

  try {
    const [result] = await db.query('DELETE FROM inventory WHERE id = ?', [itemId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '❌ Inventory item not found' });
    }

    res.json({ message: '✅ Inventory item deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting inventory item:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;

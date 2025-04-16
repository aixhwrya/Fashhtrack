const express = require('express');
const router = express.Router();
const db = require('../db'); // Promise-based MySQL pool
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// 🔐 Admin-only middleware
const adminOnly = [verifyToken, verifyAdmin];

// ✅ Get all designs
router.get('/', async (req, res) => {
  try {
    const [designs] = await db.query('SELECT * FROM design');
    res.json(designs);
  } catch (error) {
    console.error('❌ Error fetching designs:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ Get a single design by ID
router.get('/:id', async (req, res) => {
  const designId = req.params.id;
  try {
    const [design] = await db.query(
      `SELECT id AS design_id, name, category, description, price, image_url, stock 
       FROM design 
       WHERE id = ?`,
      [designId]
    );

    if (design.length === 0) {
      return res.status(404).json({ message: '❌ Design not found' });
    }

    res.json(design[0]);
  } catch (error) {
    console.error('❌ Error fetching design by ID:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ Add a new design (Admin only)
router.post('/', adminOnly, async (req, res) => {
  const { name, description, price, image_url, category } = req.body;

  if (!name || !description || !price || !image_url || !category) {
    return res.status(400).json({ message: '❌ All fields are required' });
  }

  try {
    await db.query(
      'INSERT INTO design (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)',
      [name, description, price, image_url, category]
    );

    res.status(201).json({ message: '✅ Design added successfully' });
  } catch (error) {
    console.error('❌ Error adding design:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ Update a design by ID (Admin only)
router.put('/:id', adminOnly, async (req, res) => {
  const designId = req.params.id;
  const { name, description, price, image_url, category } = req.body;

  if (!name || !description || !price || !image_url || !category) {
    return res.status(400).json({ message: '❌ All fields are required' });
  }

  try {
    const [result] = await db.query(
      'UPDATE design SET name = ?, description = ?, price = ?, image_url = ?, category = ? WHERE id = ?',
      [name, description, price, image_url, category, designId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '❌ Design not found' });
    }

    res.json({ message: '✅ Design updated successfully' });
  } catch (error) {
    console.error('❌ Error updating design:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all designs with images
router.get('/with-images', async (req, res) => {
  try {
    const [designs] = await db.query('SELECT * FROM design');
    const [images] = await db.query('SELECT * FROM design_images');

    const groupedImages = {};
    images.forEach(img => {
      if (!groupedImages[img.design_id]) groupedImages[img.design_id] = [];
      groupedImages[img.design_id].push(img.image_url);
    });

    const designsWithImages = designs.map(design => ({
      ...design,
      images: groupedImages[design.id] || []
    }));

    res.json(designsWithImages);
  } catch (err) {
    console.error('Error fetching designs with images:', err);
    res.status(500).json({ error: 'Failed to fetch designs' });
  }
});

// ✅ Add multiple images to a design (Admin only)
router.post('/:id/images', adminOnly, async (req, res) => {
  const designId = req.params.id;
  const { image_urls } = req.body;

  if (!Array.isArray(image_urls) || image_urls.length === 0) {
    return res.status(400).json({ message: 'At least one image URL required' });
  }

  try {
    const values = image_urls.map(url => [designId, url]);
    await db.query('INSERT INTO design_images (design_id, image_url) VALUES ?', [values]);
    res.status(201).json({ message: '✅ Images added successfully' });
  } catch (err) {
    console.error('❌ Error adding images:', err);
    res.status(500).json({ error: 'Failed to add images' });
  }
});

// ✅ Delete a design by ID (Admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  const designId = req.params.id;

  try {
    const [result] = await db.query('DELETE FROM design WHERE id = ?', [designId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '❌ Design not found' });
    }

    res.json({ message: '✅ Design deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting design:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;

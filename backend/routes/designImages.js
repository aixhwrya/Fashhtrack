const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Add a new image for a design
router.post('/:designId', async (req, res) => {
  const { image_url } = req.body;
  const { designId } = req.params;

  if (!image_url) {
    return res.status(400).json({ message: 'Image URL is required' });
  }

  try {
    await db.query('INSERT INTO design_images (design_id, image_url) VALUES (?, ?)', [designId, image_url]);
    res.status(201).json({ message: '✅ Image added successfully' });
  } catch (err) {
    console.error('❌ Error adding image:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ✅ Get all images for a design
router.get('/:designId', async (req, res) => {
  const { designId } = req.params;

  try {
    const [images] = await db.query('SELECT * FROM design_images WHERE design_id = ?', [designId]);
    res.json(images);
  } catch (err) {
    console.error('❌ Error fetching images:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;

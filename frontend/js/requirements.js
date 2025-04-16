const express = require("express");
const router = express.Router();
const pool = require("../db"); // MySQL pool
const authenticate = require("../middleware/authenticate"); // JWT middleware

router.post("/submit-requirements", authenticate, async (req, res) => {
  const { designType, fabricChoice, customRequirements } = req.body;
  const userId = req.user.id;

  if (!designType || !customRequirements) {
    return res.status(400).json({ message: "Please fill all required fields." });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO customerorder (user_id, designType, fabricChoice, requirements)
       VALUES (?, ?, ?, ?)`,
      [userId, designType, fabricChoice || null, customRequirements]
    );

    return res.status(200).json({ message: "🎉 Requirements submitted successfully!" });
  } catch (error) {
    console.error("Error inserting order:", error);
    return res.status(500).json({ message: "❌ Failed to submit. Try again later!" });
  }
});

module.exports = router;

// routes/reports.js

const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// ✅ GET Order Summary by Status
router.get("/order-summary", verifyToken, authorizeRoles("admin", "staff"), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT status, COUNT(*) AS total 
      FROM customerorder 
      GROUP BY status
    `);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error in order-summary route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

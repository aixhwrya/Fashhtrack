const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// 🔐 Middleware for Admin-only routes
const adminOnly = [verifyToken, verifyAdmin];

// ==============================
// ✅ Add New User (Admin Only)
// ==============================
router.post("/add", adminOnly, async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, hashedPassword, role]
    );

    res.status(201).json({ message: "✅ User added successfully!" });
  } catch (err) {
    console.error("❌ Error adding user:", err);
    res.status(500).json({ message: "Server error while adding user." });
  }
});

// ==============================
// 👤 Get Logged-in User's Profile
// ==============================
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [user] = await pool.query(
      "SELECT id, name, email, phone, role FROM users WHERE id = ?",
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(user[0]);
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({ message: "Server error while fetching profile." });
  }
});

// ==============================
// 📥 Get All Users (Admin Only)
// ==============================
router.get("/all", adminOnly, async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, phone, role FROM users"
    );
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Server error while fetching users." });
  }
});

// ==============================
// ❌ Delete User by ID (Admin Only)
// ==============================
router.delete("/delete/:id", adminOnly, async (req, res) => {
  try {
    const userId = req.params.id;
    const [user] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    await pool.query("DELETE FROM users WHERE id = ?", [userId]);
    res.json({ message: "✅ User deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ message: "Server error while deleting user." });
  }
});

// ==============================
// ✏️ Update Logged-in User's Profile
// ==============================
router.put("/update-profile", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { name, phone, password } = req.body;

  try {
    const [existing] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const updatedFields = [];
    const values = [];

    if (name) {
      updatedFields.push("name = ?");
      values.push(name);
    }

    if (phone) {
      updatedFields.push("phone = ?");
      values.push(phone);
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updatedFields.push("password = ?");
      values.push(hashed);
    }

    if (updatedFields.length === 0) {
      return res.status(400).json({ message: "No fields to update." });
    }

    values.push(userId);
    await pool.query(`UPDATE users SET ${updatedFields.join(", ")} WHERE id = ?`, values);

    res.json({ message: "✅ Profile updated successfully!" });
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({ message: "Server error while updating profile." });
  }
});

module.exports = router;

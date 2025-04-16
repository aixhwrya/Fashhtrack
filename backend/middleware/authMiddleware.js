// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

// ✅ Get the JWT secret from environment
const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("❌ JWT_SECRET is not defined in .env");
}

// ✅ Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided or format invalid.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // user: { id, name, email, role }
    next();
  } catch (err) {
    console.error("❌ Invalid Token:", err.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// ✅ Role-based access control middleware
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

// ✅ Shortcut for admin-only access
const verifyAdmin = authorizeRoles("admin");

module.exports = {
  verifyToken,
  authorizeRoles,
  verifyAdmin
};

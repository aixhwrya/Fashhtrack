const jwt = require('jsonwebtoken');

// Use environment variable or fallback secret
const secretKey = process.env.JWT_SECRET || 'fashhtracksecret';

const authenticate = (req, res, next) => {
    // Check for token in Authorization header
    const authHeader = req.headers['authorization'];

    // Token should be in format "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, secretKey);

        // Attach user data (like id and role) to request object
        req.user = {
            id: decoded.id,
            role: decoded.role,
            name: decoded.name, // optional: add more if needed
        };

        // Continue to route
        next();
    } catch (err) {
        console.error('❌ Invalid Token:', err.message);
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

module.exports = authenticate;

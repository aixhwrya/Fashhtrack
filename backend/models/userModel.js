const db = require('../db');

// 🔹 Create new user
const createUser = (name, email, phone, hashedPassword, role, callback) => {
    const sql = `INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [name, email, phone, hashedPassword, role], callback);
};

// 🔹 Find user by email
const findUserByEmail = (email, callback) => {
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.query(sql, [email], (err, results) => {
        if (err) return callback(err);
        callback(null, results.length > 0 ? results[0] : null);
    });
};

// 🔹 Find user by ID
const findUserById = (id, callback) => {
    const sql = `SELECT id, name, email, phone, role FROM users WHERE id = ?`;
    db.query(sql, [id], (err, results) => {
        if (err) return callback(err);
        callback(null, results.length > 0 ? results[0] : null);
    });
};

// 🔹 Get all users (admin only)
const getAllUsers = (callback) => {
    const sql = `SELECT id, name, email, phone, role FROM users`;
    db.query(sql, callback);
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    getAllUsers
};

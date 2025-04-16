const db = require('../db');

// 🔽 Add a new payment
const addPayment = (userId, orderId, amount, paymentMethod, callback) => {
    const sql = `
        INSERT INTO payment (user_id, order_id, amount, payment_method, payment_date)
        VALUES (?, ?, ?, ?, NOW())
    `;
    db.query(sql, [userId, orderId, amount, paymentMethod], callback);
};

// 🔽 Get all payments by user (for customers)
const getPaymentsByUser = (userId, callback) => {
    const sql = `
        SELECT p.*, o.id AS order_id, d.name AS design_name
        FROM payment p
        JOIN customerorder o ON p.order_id = o.id
        JOIN design d ON o.design_id = d.id
        WHERE p.user_id = ?
        ORDER BY p.payment_date DESC
    `;
    db.query(sql, [userId], callback);
};

// 🔽 Get all payments (for admin/staff)
const getAllPayments = (callback) => {
    const sql = `
        SELECT p.*, u.name AS customer_name, d.name AS design_name
        FROM payment p
        JOIN users u ON p.user_id = u.id
        JOIN customerorder o ON p.order_id = o.id
        JOIN design d ON o.design_id = d.id
        ORDER BY p.payment_date DESC
    `;
    db.query(sql, callback);
};

// 🔽 Delete a payment (if needed by admin)
const deletePayment = (paymentId, callback) => {
    const sql = `
        DELETE FROM payment WHERE id = ?
    `;
    db.query(sql, [paymentId], callback);
};

module.exports = {
    addPayment,
    getPaymentsByUser,
    getAllPayments,
    deletePayment
};

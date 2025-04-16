const db = require('../db');

// 🔽 Place a new order
const placeOrder = (userId, designId, measurements, requirements, quantity, callback) => {
    const sql = `
        INSERT INTO customerorder 
        (user_id, design_id, measurements, requirements, quantity, status, order_date) 
        VALUES (?, ?, ?, ?, ?, 'Pending', NOW())
    `;
    db.query(sql, [userId, designId, measurements, requirements, quantity], callback);
};

// 🔽 Get orders for a specific customer
const getOrdersByUser = (userId, callback) => {
    const sql = `
        SELECT co.*, d.name AS design_name 
        FROM customerorder co
        JOIN design d ON co.design_id = d.id
        WHERE co.user_id = ?
        ORDER BY co.order_date DESC
    `;
    db.query(sql, [userId], callback);
};

// 🔽 Get all orders for admin/staff
const getAllOrders = (callback) => {
    const sql = `
        SELECT co.*, u.name AS customer_name, d.name AS design_name 
        FROM customerorder co
        JOIN users u ON co.user_id = u.id
        JOIN design d ON co.design_id = d.id
        ORDER BY co.order_date DESC
    `;
    db.query(sql, callback);
};

// 🔽 Update an order status
const updateOrderStatus = (orderId, status, callback) => {
    const sql = `
        UPDATE customerorder SET status = ? WHERE id = ?
    `;
    db.query(sql, [status, orderId], callback);
};

// 🔽 Delete an order (Admin only)
const deleteOrder = (orderId, callback) => {
    const sql = `
        DELETE FROM customerorder WHERE id = ?
    `;
    db.query(sql, [orderId], callback);
};

module.exports = {
    placeOrder,
    getOrdersByUser,
    getAllOrders,
    updateOrderStatus,
    deleteOrder
};

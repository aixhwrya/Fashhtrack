const bcrypt = require("bcryptjs"); // Ensure using bcryptjs

const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "tiger",
    database: "fashtrack",
});

async function hashPasswords() {
    try {
        // Fetch all users
        const [users] = await db.query("SELECT id, password FROM users");

        // Log the users to verify data
        console.log("Users fetched:", users);

        // Hash all passwords and update them
        const updates = users.map(async (user) => {
            // Hash the password using bcryptjs
            const hashedPassword = await bcrypt.hash(user.password, 10);
            console.log(`Original password for user ID ${user.id}: ${user.password}`);
            console.log(`Hashed password for user ID ${user.id}: ${hashedPassword}`); // Log hashed password

            // Update the password in the database
            await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id]);
            console.log(`✅ Password updated for user ID ${user.id}`);
        });

        // Wait for all updates to finish
        await Promise.all(updates);
        console.log("✅ All passwords updated successfully!");

    } catch (err) {
        console.error("❌ Error updating passwords:", err);
    } finally {
        await db.end(); // Close connection
    }
}

hashPasswords();

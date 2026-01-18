import { query, end } from "../../db.js";

async function createTables() {
  try {
    // 1. Users (customers)
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

}
   catch (err) {
    console.error("❌ Error creating tables:", err);
  } finally {
    end();
  }
}
createTables();
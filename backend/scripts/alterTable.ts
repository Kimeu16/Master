import pool from '../src/database/db';

const alterTable = async () => {
  try {
    console.log("Checking and altering users table...");
    
    // Add password_hash
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN password_hash VARCHAR(255) NULL
    `).catch(e => console.log("Column password_hash already exists or error: ", e.message));

    // Add reset_token
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN reset_token VARCHAR(255) NULL
    `).catch(e => console.log("Column reset_token already exists or error: ", e.message));

    // Add reset_token_expires
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN reset_token_expires BIGINT NULL
    `).catch(e => console.log("Column reset_token_expires already exists or error: ", e.message));

    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

alterTable();

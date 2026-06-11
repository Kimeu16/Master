import pool from './src/database/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function createAdmin() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);
    const no = crypto.randomUUID();
    
    // check if admin exists
    const [rows]: any = await pool.query('SELECT * FROM users WHERE user_name = ?', ['admin']);
    if (rows.length > 0) {
      console.log('Admin already exists, updating password to password123');
      await pool.query('UPDATE users SET password_hash = ?, rbac_role = ? WHERE user_name = ?', [hash, 'Admin', 'admin']);
    } else {
      console.log('Creating admin user');
      await pool.query(
        `INSERT INTO users (no, user_name, email, phone, password_hash, rbac_role) VALUES (?, ?, ?, ?, ?, 'Admin')`,
        [no, 'admin', 'admin@example.com', '1234567890', hash]
      );
    }
    console.log("Admin user ready. Username: admin, Password: password123");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
createAdmin();

import pool from './src/database/db';

async function checkUsers() {
  try {
    const [rows]: any = await pool.query('SELECT user_name, email, rbac_role FROM users');
    console.log("USERS:", rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkUsers();

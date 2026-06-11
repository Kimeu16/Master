import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'alandick_ops_db',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const waitForDatabaseConnection = async (retries = 20, delayMs = 1000) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      attempt += 1;
      if (attempt >= retries) {
        throw error;
      }
      console.warn(`Database connection attempt ${attempt} failed. Retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

export const isDatabaseHealthy = async () => {
  await pool.query('SELECT 1');
  return true;
};

export default pool;

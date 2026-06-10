import dotenv from "dotenv";
import app from "./app";
import pool, { waitForDatabaseConnection } from "./database/db";

dotenv.config();

const PORT = Number(process.env.PORT || 5000);
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_NAME = process.env.DB_NAME || 'alandick_ops_db';
const DB_USER = process.env.DB_USER || 'root';

const startServer = async () => {
  console.log(`Backend API will start at http://127.0.0.1:${PORT}`);
  console.log(`Looking for database at mysql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

  try {
    await waitForDatabaseConnection();
  } catch (error) {
    console.error('Unable to connect to the database after several retries:', error);
    process.exit(1);
  }

  const server = app.listen(PORT, "127.0.0.1", () => {
    console.log(`Backend API running at http://127.0.0.1:${PORT}`);
    checkDatabaseUsers();
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Backend port ${PORT} is already in use. Stop the other process or set PORT to a free port.`);
      process.exit(1);
    }

    console.error("Backend failed to start:", error);
    process.exit(1);
  });
};

const checkDatabaseUsers = async () => {
  try {
    const [rows]: any = await pool.query('SELECT COUNT(*) AS count FROM users');
    const count = rows?.[0]?.count ?? 0;
    console.log(`Database users count: ${count}`);
  } catch (error) {
    console.error('Database users check failed:', error);
  }
};

startServer();

import pool from '../database/db';
import { mapKeysToCamelCase, mapKeysToSnakeCase } from '../utils/caseConverter';

export const getAllUsers = async () => {
  const [rows] = await pool.query('SELECT * FROM users');
  return mapKeysToCamelCase(rows);
};

export const getUserById = async (no: string) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE no = ?', [no]);
  const users = rows as any[];
  if (users.length === 0) return null;
  return mapKeysToCamelCase(users[0]);
};

export const createUser = async (userData: any) => {
  const snakeData = mapKeysToSnakeCase(userData);
  const keys = Object.keys(snakeData);
  const columns = keys.join(', ');
  const placeholders = keys.map(() => '?').join(', ');
  const values = keys.map(k => snakeData[k]);

  await pool.query(
    `INSERT INTO users (${columns}) VALUES (${placeholders})`,
    values
  );
  return await getUserById(userData.no);
};

export const updateUser = async (no: string, userData: any) => {
  const snakeData = mapKeysToSnakeCase(userData);
  const keys = Object.keys(snakeData);
  const assignments = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => snakeData[k]);

  await pool.query(
    `UPDATE users SET ${assignments} WHERE no = ?`,
    [...values, no]
  );
  return await getUserById(no);
};

export const deleteUser = async (no: string) => {
  await pool.query('DELETE FROM users WHERE no = ?', [no]);
  return { message: 'User deleted successfully' };
};

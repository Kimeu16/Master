import pool from '../database/db';
import { mapKeysToCamelCase, mapKeysToSnakeCase } from '../utils/caseConverter';

export const getAllEscalations = async () => {
  const [rows] = await pool.query('SELECT * FROM escalations');
  return mapKeysToCamelCase(rows);
};

export const getEscalationById = async (no: string) => {
  const [rows] = await pool.query('SELECT * FROM escalations WHERE no = ?', [no]);
  const escalations = rows as any[];
  if (escalations.length === 0) return null;
  return mapKeysToCamelCase(escalations[0]);
};

export const createEscalation = async (escalationData: any) => {
  const snakeData = mapKeysToSnakeCase(escalationData);
  const keys = Object.keys(snakeData);
  const columns = keys.join(', ');
  const placeholders = keys.map(() => '?').join(', ');
  const values = keys.map(k => snakeData[k]);

  await pool.query(
    `INSERT INTO escalations (${columns}) VALUES (${placeholders})`,
    values
  );
  return await getEscalationById(escalationData.no);
};

export const updateEscalation = async (no: string, escalationData: any) => {
  const snakeData = mapKeysToSnakeCase(escalationData);
  const keys = Object.keys(snakeData);
  const assignments = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => snakeData[k]);

  await pool.query(
    `UPDATE escalations SET ${assignments} WHERE no = ?`,
    [...values, no]
  );
  return await getEscalationById(no);
};

export const deleteEscalation = async (no: string) => {
  await pool.query('DELETE FROM escalations WHERE no = ?', [no]);
  return { message: 'Escalation deleted successfully' };
};

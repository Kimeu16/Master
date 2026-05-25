import { Router } from 'express';
import pool from '../database/db';
import { mapKeysToCamelCase, mapKeysToSnakeCase } from '../utils/caseConverter';

const ALLOWED_TABLES = new Set([
  'fueling_checklists',
  'cm_checklists',
  'work_order_checklists',
  'wo_approval_workflows',
  'excel_sheet_rows',
]);

const quoteIdentifier = (identifier: string) => {
  if (!ALLOWED_TABLES.has(identifier)) {
    throw new Error(`Unsupported table: ${identifier}`);
  }
  return `\`${identifier}\``;
};

export const createTableCrudRouter = (tableName: string, label: string, idColumn = 'no') => {
  const router = Router();
  const table = quoteIdentifier(tableName);
  const primaryKey = idColumn === 'id' ? '`id`' : '`no`';

  router.get('/', async (_req, res) => {
    try {
      const [rows] = await pool.query(`SELECT * FROM ${table}`);
      res.json(mapKeysToCamelCase(rows));
    } catch (error) {
      console.error(`Error fetching ${label}:`, error);
      res.status(500).json({ error: `Failed to fetch ${label}` });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const id = String(req.params.id);
      const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ${primaryKey} = ?`, [id]);
      const records = rows as unknown[];
      if (records.length === 0) {
        return res.status(404).json({ error: `${label} not found` });
      }
      res.json(mapKeysToCamelCase(records[0]));
    } catch (error) {
      console.error(`Error fetching ${label}:`, error);
      res.status(500).json({ error: `Failed to fetch ${label}` });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const snakeData = mapKeysToSnakeCase(req.body);
      const keys = Object.keys(snakeData);
      const columns = keys.map((key) => `\`${key}\``).join(', ');
      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map((key) => snakeData[key]);

      await pool.query(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`, values);
      res.status(201).json(req.body);
    } catch (error) {
      console.error(`Error creating ${label}:`, error);
      res.status(500).json({ error: `Failed to create ${label}` });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const id = String(req.params.id);
      const snakeData = mapKeysToSnakeCase(req.body);
      const keys = Object.keys(snakeData);
      const assignments = keys.map((key) => `\`${key}\` = ?`).join(', ');
      const values = keys.map((key) => snakeData[key]);

      await pool.query(`UPDATE ${table} SET ${assignments} WHERE ${primaryKey} = ?`, [...values, id]);
      const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ${primaryKey} = ?`, [id]);
      const records = rows as unknown[];
      if (records.length === 0) {
        return res.status(404).json({ error: `${label} not found` });
      }
      res.json(mapKeysToCamelCase(records[0]));
    } catch (error) {
      console.error(`Error updating ${label}:`, error);
      res.status(500).json({ error: `Failed to update ${label}` });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const id = String(req.params.id);
      await pool.query(`DELETE FROM ${table} WHERE ${primaryKey} = ?`, [id]);
      res.json({ message: `${label} deleted successfully` });
    } catch (error) {
      console.error(`Error deleting ${label}:`, error);
      res.status(500).json({ error: `Failed to delete ${label}` });
    }
  });

  return router;
};

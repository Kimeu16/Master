import pool from '../database/db';
import { mapKeysToCamelCase, mapKeysToSnakeCase } from '../utils/caseConverter';

export const getAllSites = async () => {
  const [rows] = await pool.query('SELECT * FROM sites');
  return mapKeysToCamelCase(rows);
};

export const getSiteById = async (no: string) => {
  const [rows] = await pool.query('SELECT * FROM sites WHERE no = ?', [no]);
  const sites = rows as any[];
  if (sites.length === 0) return null;
  return mapKeysToCamelCase(sites[0]);
};

export const createSite = async (siteData: any) => {
  const snakeData = mapKeysToSnakeCase(siteData);
  const keys = Object.keys(snakeData);
  const columns = keys.join(', ');
  const placeholders = keys.map(() => '?').join(', ');
  const values = keys.map(k => snakeData[k]);

  await pool.query(
    `INSERT INTO sites (${columns}) VALUES (${placeholders})`,
    values
  );
  return await getSiteById(siteData.no);
};

export const updateSite = async (no: string, siteData: any) => {
  const snakeData = mapKeysToSnakeCase(siteData);
  const keys = Object.keys(snakeData);
  const assignments = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => snakeData[k]);

  await pool.query(
    `UPDATE sites SET ${assignments} WHERE no = ?`,
    [...values, no]
  );
  return await getSiteById(no);
};

export const deleteSite = async (no: string) => {
  await pool.query('DELETE FROM sites WHERE no = ?', [no]);
  return { message: 'Site deleted successfully' };
};

import pool from '../database/db';
import { mapKeysToCamelCase, mapKeysToSnakeCase } from '../utils/caseConverter';

export const getAllPMChecklists = async () => {
  const [rows] = await pool.query('SELECT * FROM pm_checklists');
  return mapKeysToCamelCase(rows);
};

export const getPMChecklistById = async (no: string) => {
  const [rows] = await pool.query('SELECT * FROM pm_checklists WHERE no = ?', [no]);
  const pmChecklists = rows as any[];
  if (pmChecklists.length === 0) return null;
  return mapKeysToCamelCase(pmChecklists[0]);
};

export const createPMChecklist = async (pmChecklistData: any) => {
  const snakeData = mapKeysToSnakeCase(pmChecklistData);
  const keys = Object.keys(snakeData);
  const columns = keys.join(', ');
  const placeholders = keys.map(() => '?').join(', ');
  const values = keys.map(k => snakeData[k]);

  await pool.query(
    `INSERT INTO pm_checklists (${columns}) VALUES (${placeholders})`,
    values
  );
  return await getPMChecklistById(pmChecklistData.no);
};

export const updatePMChecklist = async (no: string, pmChecklistData: any) => {
  const snakeData = mapKeysToSnakeCase(pmChecklistData);
  const keys = Object.keys(snakeData);
  const assignments = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => snakeData[k]);

  await pool.query(
    `UPDATE pm_checklists SET ${assignments} WHERE no = ?`,
    [...values, no]
  );
  return await getPMChecklistById(no);
};

export const deletePMChecklist = async (no: string) => {
  await pool.query('DELETE FROM pm_checklists WHERE no = ?', [no]);
  return { message: 'PM Checklist deleted successfully' };
};

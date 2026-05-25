import pool from '../database/db';
import { mapKeysToCamelCase, mapKeysToSnakeCase } from '../utils/caseConverter';

export const getAllRevisionSummaries = async () => {
  const [rows] = await pool.query('SELECT * FROM revision_summaries');
  return mapKeysToCamelCase(rows);
};

export const getRevisionSummaryById = async (no: string) => {
  const [rows] = await pool.query('SELECT * FROM revision_summaries WHERE no = ?', [no]);
  const revisionSummaries = rows as any[];
  if (revisionSummaries.length === 0) return null;
  return mapKeysToCamelCase(revisionSummaries[0]);
};

export const createRevisionSummary = async (revisionSummaryData: any) => {
  const snakeData = mapKeysToSnakeCase(revisionSummaryData);
  const keys = Object.keys(snakeData);
  const columns = keys.join(', ');
  const placeholders = keys.map(() => '?').join(', ');
  const values = keys.map(k => snakeData[k]);

  await pool.query(
    `INSERT INTO revision_summaries (${columns}) VALUES (${placeholders})`,
    values
  );
  return await getRevisionSummaryById(revisionSummaryData.no);
};

export const updateRevisionSummary = async (no: string, revisionSummaryData: any) => {
  const snakeData = mapKeysToSnakeCase(revisionSummaryData);
  const keys = Object.keys(snakeData);
  const assignments = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => snakeData[k]);

  await pool.query(
    `UPDATE revision_summaries SET ${assignments} WHERE no = ?`,
    [...values, no]
  );
  return await getRevisionSummaryById(no);
};

export const deleteRevisionSummary = async (no: string) => {
  await pool.query('DELETE FROM revision_summaries WHERE no = ?', [no]);
  return { message: 'Revision Summary deleted successfully' };
};

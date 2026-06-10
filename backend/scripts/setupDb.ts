import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const setupDb = async () => {
  try {
    console.log('Connecting to database server to create DB...');
    const databaseName = process.env.DB_NAME || 'alandick_ops_db';
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '3306'),
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\`;`);
    await connection.end();

    console.log('Connecting to alandick_ops_db...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '../src/database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolon and remove empty queries
    const queries = schema
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0);

    console.log(`Found ${queries.length} queries to execute.`);

    const { default: pool } = await import('../src/database/db');

    for (const query of queries) {
      await pool.query(query);
      console.log('Executed query successfully.');
    }

    const ensureColumn = async (tableName: string, columnName: string, definition: string) => {
      const [rows] = await pool.query(
        `
          SELECT COUNT(*) AS count
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
        `,
        [databaseName, tableName, columnName]
      );
      const [{ count }] = rows as Array<{ count: number }>;
      if (count === 0) {
        await pool.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`);
        console.log(`Added ${tableName}.${columnName}.`);
      }
    };

    const ensureColumnType = async (tableName: string, columnName: string, definition: string) => {
      const [rows] = await pool.query(
        `
          SELECT DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
        `,
        [databaseName, tableName, columnName]
      );
      const [column] = rows as Array<{ DATA_TYPE: string; CHARACTER_MAXIMUM_LENGTH: number | null }>;

      if (!column) {
        await pool.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`);
        console.log(`Added ${tableName}.${columnName}.`);
        return;
      }

      const currentType = column.DATA_TYPE?.toLowerCase() ?? '';
      const desiredType = definition.trim().split(/\s+/)[0].toLowerCase();
      if (!currentType.includes(desiredType)) {
        const cleanDefinition = definition.replace(/PRIMARY\s+KEY/i, '');
        await pool.query(`ALTER TABLE \`${tableName}\` MODIFY COLUMN \`${columnName}\` ${cleanDefinition}`);
        console.log(`Upgraded ${tableName}.${columnName} to ${cleanDefinition.trim()}.`);
      }
    };

    for (const tableName of ['pm_checklists', 'fueling_checklists', 'cm_checklists']) {
      await ensureColumn(tableName, 'response', 'VARCHAR(255)');
      await ensureColumn(tableName, 'comments', 'TEXT');
    }

    await ensureColumnType('sites', 'no', 'VARCHAR(50) PRIMARY KEY');
    await ensureColumnType('sites', 'ip_address', 'VARCHAR(45)');
    await ensureColumnType('sites', 'latitude', 'DECIMAL(10,7)');
    await ensureColumnType('sites', 'longitude', 'DECIMAL(10,7)');
    await ensureColumnType('sites', 'on_air_date', 'DATE');
    await ensureColumnType('sites', 'dc_meter_installation_date', 'DATE');
    await ensureColumnType('sites', 'priority', 'TINYINT');

    await ensureColumnType('users', 'no', 'VARCHAR(50) PRIMARY KEY');
    await ensureColumnType('users', 'user_name', 'VARCHAR(100)');
    await ensureColumnType('users', 'email', 'VARCHAR(100)');
    await ensureColumnType('users', 'phone', 'VARCHAR(50)');
    await ensureColumnType('users', 'access_level', 'VARCHAR(100)');
    await ensureColumnType('users', 'region', 'VARCHAR(100)');
    await ensureColumnType('users', 'rbac_role', "ENUM('Read-Only', 'CRUD', 'Admin') DEFAULT 'Read-Only'");

    console.log('Seeding initial RBAC roles for users...');
    await pool.query(`
      UPDATE users 
      SET rbac_role = 
        CASE 
          WHEN LOWER(access_level) LIKE '%admin%' OR LOWER(access_level) LIKE '%level 1%' THEN 'Admin'
          WHEN LOWER(access_level) LIKE '%level 2%' OR LOWER(access_level) LIKE '%level 3%' THEN 'CRUD'
          ELSE 'Read-Only'
        END
      WHERE rbac_role = 'Read-Only'
    `);
    console.log('RBAC roles seeded.');

    console.log('Database setup complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
};

setupDb();

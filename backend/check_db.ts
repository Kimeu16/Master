import pool from './src/database/db';

async function checkDb() {
  try {
    const tables = ['sites', 'users', 'escalations', 'pm_checklists', 'revision_summaries'];
    for (const t of tables) {
      const [rows]: any = await pool.query(`SELECT COUNT(*) as c FROM ${t}`);
      console.log(`${t}: ${rows[0].c}`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkDb();

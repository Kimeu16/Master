import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const fixDatesFormat = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '3306'),
      database: process.env.DB_NAME || 'alandick_ops_db'
    });

    const [rows] = await connection.query('SELECT no, on_air_date, dc_meter_installation_date, priority FROM sites');
    const sites = rows as any[];

    const parseDate = (d: any) => {
      if (!d) return null;
      let str = String(d).trim();
      if (str === '') return null;
      if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.substring(0, 10);
      const parts = str.split('/');
      if (parts.length === 3) {
        let day = parts[0].padStart(2, '0');
        let month = parts[1].padStart(2, '0');
        let year = parts[2];
        if (year.length === 2) year = '20' + year;
        return `${year}-${month}-${day}`;
      }
      return null;
    };

    for (const site of sites) {
      let d1 = site.on_air_date;
      let d2 = site.dc_meter_installation_date;
      let p = site.priority;
      
      const newD1 = parseDate(d1);
      const newD2 = parseDate(d2);
      
      let newP = p;
      if (p === '' || p === undefined || p === null) {
        newP = null;
      } else {
        newP = parseInt(p, 10);
        if (isNaN(newP)) newP = null;
      }

      if (newD1 !== d1 || newD2 !== d2 || newP !== p) {
        await connection.query('UPDATE sites SET on_air_date = ?, dc_meter_installation_date = ?, priority = ? WHERE no = ?', [newD1, newD2, newP, site.no]);
      }
    }

    console.log('Dates formatted to YYYY-MM-DD. Priority fixed. Nulls and invalid values handled.');
    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
};

fixDatesFormat();

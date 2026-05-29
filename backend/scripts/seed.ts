import Papa from 'papaparse';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const USERS_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJ9ghNuvsFsz5CZLIjMr2cHKPvhH3OVt8OJMRe0om7YPtflOiYGJSmZBACydF5IQ/pub?gid=1852918422&single=true&output=csv";

async function seedRemote() {
  console.log("Fetching remote data from Google Sheets...");
  
  // 1. Fetch Users
  const usersResponse = await fetch(USERS_SHEET_URL);
  const usersCsv = await usersResponse.text();
  
  const usersParsed = Papa.parse(usersCsv, {
    header: false,
    skipEmptyLines: true,
  });
  
  const rows = usersParsed.data as string[][];
  const usersToInsert = [];
  
  for (const row of rows) {
    // The CSV has columns:
    // 0: No
    // 1: User Name
    // 2: Email Address
    // 3: Phone Number
    // 4: REON Onboarding
    // 5: Group, Department and Region
    // 6: Access Group and Region Email
    // 7: Access Level
    // 8: Region
    // 9: Sites
    // 10: Roles and Scope
    
    if (row[0] && /^\d+$/.test(row[0].trim())) {
      usersToInsert.push({
        no: row[0].trim(),
        user_name: (row[1] || "").trim(),
        email: (row[2] || "").trim(),
        phone: (row[3] || "").trim(),
        reon_onboarding: (row[4] || "").trim(),
        department: (row[5] || "").trim(),
        access_group: (row[6] || "").trim(),
        access_level: (row[7] || "").trim(),
        region: (row[8] || "").trim(),
        sites: (row[9] || "").trim(),
        roles: (row[10] || "").trim(),
      });
    }
  }
  
  console.log(`Parsed ${usersToInsert.length} valid users.`);

  console.log('Connecting to database...');
  const { default: pool } = await import('../src/database/db');
  
  // Upsert users
  for (const user of usersToInsert) {
    try {
      await pool.query(
        `INSERT INTO users 
         (no, user_name, email, phone, reon_onboarding, department, access_group, access_level, region, sites, roles)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         user_name=VALUES(user_name), email=VALUES(email), phone=VALUES(phone), reon_onboarding=VALUES(reon_onboarding),
         department=VALUES(department), access_group=VALUES(access_group), access_level=VALUES(access_level),
         region=VALUES(region), sites=VALUES(sites), roles=VALUES(roles)`,
        [
          user.no, user.user_name, user.email, user.phone, user.reon_onboarding,
          user.department, user.access_group, user.access_level, user.region, user.sites, user.roles
        ]
      );
    } catch (e) {
      console.error(`Failed to insert user ${user.no}:`, e);
    }
  }
  
  console.log("Users seed complete.");
  process.exit(0);
}

seedRemote().catch(e => {
  console.error("Fatal error seeding remote:", e);
  process.exit(1);
});

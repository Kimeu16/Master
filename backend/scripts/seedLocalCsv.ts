import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Papa from 'papaparse';
import mysql from 'mysql2/promise';

dotenv.config();

const SITES_HEADER_MAP: Record<string, string> = {
  "No": "no",
  "NO": "no",
  "Site Name": "siteName",
  "Power Source": "powerSource",
  "Router Installation Status": "routerStatus",
  "IP Address": "ipAddress",
  "Latitude": "latitude",
  "Longitude": "longitude",
  "On Air Date": "onAirDate",
  "Region": "region",
  "Rectifier Type": "rectifierType",
  "Tenants / Operators": "tenants",
  "REON Integration": "reonIntegration",
  "Rectifier Installed Capacity (3KW Module)": "rectifierCapacity",
  "Rectifier Max Capacity": "rectifierMaxCapacity",
  "Security Company": "securityCompany",
  "Site Type": "siteType",
  "Electronic Lock ID": "electronicLockId",
  "Field Engineer Name": "fieldEngineer",
  "Field Engineer Email Account": "fieldEngineerEmail",
  "Field Engineer Phone Contact": "fieldEngineerPhone",
  "2nd Field Engineer Name": "secondFieldEngineer",
  "2nd Field Engineer Email": "secondFieldEngineerEmail",
  "2nd Field Engineer Phone Contact": "secondFieldEngineerPhone",
  "APS / AMF Board": "apsAmfBoard",
  "Generator Type": "generatorType",
  "Generator Tank Capacity (L)": "generatorTankCapacity",
  "External Fuel Probe": "externalFuelProbe",
  "DC Meter Installation Date": "dcMeterInstallationDate",
  "DC Meter": "dcMeter",
  "Battery Type": "batteryType",
  "Battery Capacity": "batteryCapacity",
  "Priority": "priority",
  "No Of Solar Panel": "solarPanels",
  "Solar Capacity": "solarCapacity",
  "Solar Panel Brand": "solarPanelBrand",
  "No Of Solar Charge Controller (Tracer8420AN)": "solarChargeControllerTracer",
  "No Of Solar Charge Controller Flatpack2 48V Solar Charger or Megmeet Charge": "solarChargeControllerFlatpack",
  "Megmeet MPPT": "megmeetMppt",
  "Sactioned Load": "sanctionedLoad",
  "SLA": "sla",
  "Data Integrity": "dataIntegrity",
  "Software Cleanup": "softwareCleanup",
  "Comments": "comments",
};

const mapKeysToSnakeCase = (obj: any): any => {
  const newObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      newObj[snakeKey] = obj[key];
    }
  }
  return newObj;
};

const mapHeaders = (row: Record<string, string>, headerMap: Record<string, string>): any => {
  const mapped: Record<string, string> = {};
  const normalizedRow: Record<string, string> = {};
  
  for (const key of Object.keys(row)) {
    normalizedRow[key.trim().toLowerCase()] = row[key];
  }
  
  for (const [sheetHeader, appKey] of Object.entries(headerMap)) {
    let value = (normalizedRow[sheetHeader.trim().toLowerCase()] ?? "").trim();
    
    if (appKey === "no" || appKey === "priority") {
      value = value.replace(".0", "");
    }
    mapped[appKey] = value;
  }
  return mapped;
};

const seedLocalCsv = async () => {
  const csvPath = path.join(__dirname, '../../AlanDick Organisation Structure and Escalation Matrix Ver 5.0.xlsx - Sites (1).csv');
  console.log(`Reading CSV from ${csvPath}...`);

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf8');

  Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      console.log(`Parsed ${results.data.length} rows from CSV.`);

      const mappedData = (results.data as Record<string, string>[]).map(
        (row) => mapHeaders(row, SITES_HEADER_MAP)
      );

      const snakeCaseData = mappedData.map(mapKeysToSnakeCase);
      const keys = Object.keys(snakeCaseData[0]);
      const columns = keys.join(', ');
      const placeholders = keys.map(() => '?').join(', ');
      const updatePlaceholders = keys.map(k => `${k} = VALUES(${k})`).join(', ');

      const sql = `INSERT INTO sites (${columns}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updatePlaceholders}`;

      console.log('Connecting to database...');
      const { default: pool } = await import('../src/database/db');

      let successCount = 0;
      let failCount = 0;

      for (const row of snakeCaseData) {
        try {
          const values = keys.map(k => row[k]);
          await pool.query(sql, values);
          successCount++;
        } catch (error) {
          console.error(`Failed to insert site ${row.no}:`, error);
          failCount++;
        }
      }

      console.log(`Local CSV seeding complete: ${successCount} sites inserted/updated, ${failCount} failed.`);
      process.exit(0);
    },
    error: (error: Error) => {
      console.error('Error parsing CSV:', error);
      process.exit(1);
    }
  });
};

seedLocalCsv();

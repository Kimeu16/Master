import path from 'path';
import * as xlsx from 'xlsx';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_EXCEL_FILE = 'AlanDick Organisation Structure and Escalation Matrix Ver 5.0 (3).xlsx';
const EXCEL_PATH = process.env.EXCEL_PATH || path.join(__dirname, '../../', DEFAULT_EXCEL_FILE);

type Row = Record<string, string>;
type Workbook = xlsx.WorkBook;

const CHECKLIST_SHEETS = [
  { sheetName: 'PM Checklist 2025', tableName: 'pm_checklists', prefix: 'PM-' },
  { sheetName: 'Fueling Checklist', tableName: 'fueling_checklists', prefix: 'FUEL-' },
  { sheetName: 'CM Checklist', tableName: 'cm_checklists', prefix: 'CM-' },
];

const normalizeHeader = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const text = (value: unknown): string => {
  if (value === undefined || value === null) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
};

const numericId = (value: unknown): string => {
  const valueText = text(value);
  if (!valueText) return '';
  const numericValue = Number(valueText);
  return Number.isFinite(numericValue) ? String(Math.trunc(numericValue)) : valueText.replace(/\.0$/, '');
};

const isNumeric = (value: unknown): boolean => {
  const valueText = text(value);
  return valueText !== '' && Number.isFinite(Number(valueText));
};

const getRows = (workbook: Workbook, sheetName: string): unknown[][] => {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  return xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false }) as unknown[][];
};

const findHeaderIndex = (rows: unknown[][], requiredHeader: string): number => {
  const required = normalizeHeader(requiredHeader);
  return rows.findIndex((row) => row.some((cellValue) => normalizeHeader(cellValue) === required));
};

const buildHeaderLookup = (headerRow: unknown[]) => {
  const lookup = new Map<string, number>();
  headerRow.forEach((header, index) => {
    const normalized = normalizeHeader(header);
    if (normalized && !lookup.has(normalized)) lookup.set(normalized, index);
  });
  return lookup;
};

const getByHeader = (row: unknown[], lookup: Map<string, number>, headers: string[]) => {
  for (const header of headers) {
    const index = lookup.get(normalizeHeader(header));
    if (index !== undefined) return text(row[index]);
  }
  return '';
};

const sheetExists = (workbook: Workbook, sheetName: string) => Boolean(workbook.Sheets[sheetName]);

async function upsertRows(pool: any, tableName: string, rows: Row[]) {
  await pool.query(`DELETE FROM \`${tableName}\``);

  if (rows.length === 0) {
    console.log(`  - ${tableName}: cleared, no rows`);
    return;
  }

  const keys = Object.keys(rows[0]);
  const columns = keys.map((key) => `\`${key}\``).join(', ');
  const placeholders = keys.map(() => '?').join(', ');
  const updateClauses = keys.map((key) => `\`${key}\` = VALUES(\`${key}\`)`).join(', ');
  const sql = `INSERT INTO \`${tableName}\` (${columns}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updateClauses}`;

  let success = 0;
  let fail = 0;
  for (const row of rows) {
    try {
      await pool.query(sql, keys.map((key) => row[key] ?? ''));
      success++;
    } catch (err: any) {
      console.error(`  x ${tableName} row ${JSON.stringify(row.no ?? row.id)}: ${err.message}`);
      fail++;
    }
  }
  console.log(`  - ${tableName}: ${success} processed, ${fail} failed`);
}

function parseSites(workbook: Workbook): Row[] {
  const rows = getRows(workbook, 'Sites');
  const headerIndex = findHeaderIndex(rows, 'No');
  if (headerIndex < 0) return [];

  const lookup = buildHeaderLookup(rows[headerIndex]);
  return rows.slice(headerIndex + 1).flatMap((row) => {
    const no = numericId(getByHeader(row, lookup, ['No', 'NO']));
    if (!no) return [];

    return [{
      no,
      site_name: getByHeader(row, lookup, ['Site Name']),
      router_status: getByHeader(row, lookup, ['Router Installation Status']),
      ip_address: getByHeader(row, lookup, ['IP Address']),
      latitude: getByHeader(row, lookup, ['Latitude']),
      longitude: getByHeader(row, lookup, ['Longitude']),
      on_air_date: getByHeader(row, lookup, ['On Air Date']),
      region: getByHeader(row, lookup, ['Region']),
      rectifier_type: getByHeader(row, lookup, ['Rectifier Type']),
      tenants: getByHeader(row, lookup, ['Tenants / Operators']),
      reon_integration: getByHeader(row, lookup, ['REON Integration']),
      power_source: getByHeader(row, lookup, ['Power Source']),
      rectifier_capacity: getByHeader(row, lookup, ['Rectifier Installed Capacity (3KW Module)']),
      rectifier_max_capacity: getByHeader(row, lookup, ['Rectifier Max Capacity']),
      security_company: getByHeader(row, lookup, ['Security Company']),
      site_type: getByHeader(row, lookup, ['Site Type']),
      electronic_lock_id: getByHeader(row, lookup, ['Electronic Lock ID']),
      field_engineer: getByHeader(row, lookup, ['Field Engineer Name']),
      field_engineer_email: getByHeader(row, lookup, ['Field Engineer Email Account']),
      field_engineer_phone: getByHeader(row, lookup, ['Field Engineer Phone Contact']),
      second_field_engineer: getByHeader(row, lookup, ['2nd Field Engineer Name']),
      second_field_engineer_email: getByHeader(row, lookup, ['2nd Field Engineer Email']),
      second_field_engineer_phone: getByHeader(row, lookup, ['2nd Field Engineer Phone Contact']),
      aps_amf_board: getByHeader(row, lookup, ['APS / AMF Board']),
      generator_type: getByHeader(row, lookup, ['Generator Type']),
      generator_tank_capacity: getByHeader(row, lookup, ['Generator Tank Capacity (L)']),
      external_fuel_probe: getByHeader(row, lookup, ['External Fuel Probe']),
      dc_meter_installation_date: getByHeader(row, lookup, ['DC Meter Installation Date']),
      dc_meter: getByHeader(row, lookup, ['DC Meter']),
      battery_type: getByHeader(row, lookup, ['Battery Type']),
      battery_capacity: getByHeader(row, lookup, ['Battery Capacity']),
      priority: numericId(getByHeader(row, lookup, ['Priority'])),
      solar_panels: getByHeader(row, lookup, ['No Of Solar Panel']),
      solar_capacity: getByHeader(row, lookup, ['Solar Capacity']),
      solar_panel_brand: getByHeader(row, lookup, ['Solar Panel Brand']),
      solar_charge_controller_tracer: getByHeader(row, lookup, ['No Of Solar Charge Controller (Tracer8420AN)']),
      solar_charge_controller_flatpack: getByHeader(row, lookup, ['No Of Solar Charge Controller Flatpack2 48V Solar Charger or Megmeet Charge']),
      megmeet_mppt: getByHeader(row, lookup, ['Megmeet MPPT']),
      sanctioned_load: getByHeader(row, lookup, ['Sactioned Load', 'Sanctioned Load']),
      sla: getByHeader(row, lookup, ['SLA']),
      data_integrity: getByHeader(row, lookup, ['Data Integrity']),
      software_cleanup: getByHeader(row, lookup, ['Software Cleanup']),
      comments: getByHeader(row, lookup, ['Comments']),
    }];
  });
}

function parseUsers(workbook: Workbook, sheetName: string): Row[] {
  const rows = getRows(workbook, sheetName);
  const headerIndex = findHeaderIndex(rows, 'No');
  if (headerIndex < 0) return [];

  const lookup = buildHeaderLookup(rows[headerIndex]);
  return rows.slice(headerIndex + 1).flatMap((row) => {
    const no = numericId(getByHeader(row, lookup, ['No']));
    if (!isNumeric(no)) return [];

    return [{
      no,
      user_name: getByHeader(row, lookup, ['User Name']),
      email: getByHeader(row, lookup, ['Email Address']),
      phone: getByHeader(row, lookup, ['Phone Number']),
      reon_onboarding: getByHeader(row, lookup, ['REON Onboarding']),
      department: getByHeader(row, lookup, ['Group, Department and Region', 'Group and Department']),
      access_group: getByHeader(row, lookup, ['Access Group and Region Email', 'Access Group']),
      access_level: getByHeader(row, lookup, ['Access Level']),
      region: getByHeader(row, lookup, ['Region']),
      sites: getByHeader(row, lookup, ['Sites']),
      roles: getByHeader(row, lookup, ['Roles and Scope']),
    }];
  });
}

function parseMatrix(workbook: Workbook, sheetName: string, includeWorkOrderApprovals: boolean): Row[] {
  const rows = getRows(workbook, sheetName);
  const headerIndex = findHeaderIndex(rows, 'Alarm');
  if (headerIndex < 0) return [];

  let active: Row | null = null;
  const parsed: Row[] = [];

  for (const row of rows.slice(headerIndex + 1)) {
    const no = numericId(row[0]);
    const hasNewAlarm = isNumeric(row[0]);

    if (hasNewAlarm) {
      active = {
        no,
        alarm: text(row[1]),
        event: text(row[2]),
        issue_type: text(row[3]),
        level1: text(row[4]),
        level2: text(row[5]),
        level3: text(row[6]),
        method: text(row[7]),
        notification_time: text(row[8]),
        designator: text(row[9]),
        approval_l1: text(row[11]),
        scope_designee: includeWorkOrderApprovals ? text(row[12]) : text(row[14]),
      };

      if (includeWorkOrderApprovals) {
        active.reviewer_l1 = text(row[13]);
      } else {
        active.approval_l2 = text(row[12]);
        active.approval_l3 = text(row[13]);
        active.reviewer_l3 = text(row[15]);
        active.reviewer_l2 = text(row[16]);
        active.reviewer_l1 = text(row[17]);
      }

      parsed.push(active);
      continue;
    }

    if (!active) continue;
    const level2 = text(row[5]);
    const level3 = text(row[6]);
    if (level2 && !active.level2) active.level2 = level2;
    if (level3 && !active.level3) active.level3 = level3;
  }

  return parsed;
}

function parseChecklistSheet(workbook: Workbook, sheetName: string, prefix: string): Row[] {
  const rows = getRows(workbook, sheetName);
  const headerIndex = findHeaderIndex(rows, 'Sr #');
  if (headerIndex < 0) return [];

  const lookup = buildHeaderLookup(rows[headerIndex]);
  const parsed: Row[] = [];
  let currentSection = [text(rows[0]?.[0]), text(rows[0]?.[1])].filter(Boolean).join(', ');

  for (const row of rows.slice(headerIndex + 1)) {
    const firstCell = text(row[0]);
    if (/^section\s/i.test(firstCell)) {
      currentSection = [firstCell, text(row[1])].filter(Boolean).join(', ');
      continue;
    }

    const no = numericId(getByHeader(row, lookup, ['Sr #']));
    if (!isNumeric(no)) continue;

    parsed.push({
      no: `${prefix}${no}`,
      section: currentSection,
      field: getByHeader(row, lookup, ['Field/Check']),
      input_type: getByHeader(row, lookup, ['Input Type']),
      options: getByHeader(row, lookup, ['Options in Case of Drop Down List']),
      format: getByHeader(row, lookup, ['Input Format']),
      restrictions: getByHeader(row, lookup, ['Restrictions']),
      picture_required: getByHeader(row, lookup, ['Picture Required']),
      snag_category: getByHeader(row, lookup, ['Snag Category']),
      priority: getByHeader(row, lookup, ['Priority']),
      response: getByHeader(row, lookup, ['Response']),
      comments: getByHeader(row, lookup, ['Comments']),
    });
  }

  return parsed;
}

function parseWorkOrder(workbook: Workbook): Row[] {
  const rows = getRows(workbook, 'Work Order Checklist');
  const headerIndex = findHeaderIndex(rows, 'No');
  if (headerIndex < 0) return [];

  const lookup = buildHeaderLookup(rows[headerIndex]);
  return rows.slice(headerIndex + 1).flatMap((row) => {
    const no = numericId(getByHeader(row, lookup, ['No']));
    if (!isNumeric(no)) return [];

    return [{
      no: `WO-${no}`,
      parameters: getByHeader(row, lookup, ['Parameters']),
      status: getByHeader(row, lookup, ['Status']),
      options: getByHeader(row, lookup, ['Select']),
    }];
  });
}

function parseRevisionSummaries(workbook: Workbook): Row[] {
  const rows = getRows(workbook, 'Summary');
  const headerIndex = findHeaderIndex(rows, 'No');
  if (headerIndex < 0) return [];

  const lookup = buildHeaderLookup(rows[headerIndex]);
  return rows.slice(headerIndex + 1).flatMap((row) => {
    const no = numericId(getByHeader(row, lookup, ['No']));
    if (!isNumeric(no)) return [];

    return [{
      no,
      scope: getByHeader(row, lookup, ['Scope']),
      description: getByHeader(row, lookup, ['Description']),
      revision_category: getByHeader(row, lookup, ['Revision Category']),
      revision_date: getByHeader(row, lookup, ['Revision Date']),
    }];
  });
}

function parseAllSheetRows(workbook: Workbook): Row[] {
  return workbook.SheetNames.flatMap((sheetName) => {
    const rows = getRows(workbook, sheetName);
    return rows.map((row, index) => ({
      id: `${sheetName}:${index + 1}`,
      sheet_name: sheetName,
      excel_row_number: String(index + 1),
      row_data: JSON.stringify(row.map(text)),
    }));
  });
}

const seedLocalExcel = async () => {
  console.log('AlanDick Excel to MySQL seeder');
  console.log(`Reading workbook: ${EXCEL_PATH}`);

  let workbook: Workbook;
  try {
    workbook = xlsx.readFile(EXCEL_PATH, { cellDates: true });
  } catch (err: any) {
    console.error(`Could not read Excel file: ${err.message}`);
    process.exit(1);
  }

  console.log(`Sheets found: ${workbook.SheetNames.join(', ')}`);
  const missingStructuredSheets = [
    'Sites',
    'Copy of Users 2026 Rev1',
    'Escalation Matrix',
    'Summary',
    'Revised WO Approval Workflow',
    'Work Order Checklist',
    ...CHECKLIST_SHEETS.map(({ sheetName }) => sheetName),
  ].filter((sheetName) => !sheetExists(workbook, sheetName));

  if (missingStructuredSheets.length > 0) {
    console.warn(`Missing structured sheets: ${missingStructuredSheets.join(', ')}`);
  }

  const datasets = [
    { tableName: 'sites', rows: parseSites(workbook) },
    { tableName: 'users', rows: parseUsers(workbook, 'Copy of Users 2026 Rev1') },
    { tableName: 'escalations', rows: parseMatrix(workbook, 'Escalation Matrix', false) },
    { tableName: 'revision_summaries', rows: parseRevisionSummaries(workbook) },
    { tableName: 'wo_approval_workflows', rows: parseMatrix(workbook, 'Revised WO Approval Workflow', true) },
    { tableName: 'work_order_checklists', rows: parseWorkOrder(workbook) },
    ...CHECKLIST_SHEETS.map(({ sheetName, tableName, prefix }) => ({
      tableName,
      rows: parseChecklistSheet(workbook, sheetName, prefix),
    })),
    { tableName: 'excel_sheet_rows', rows: parseAllSheetRows(workbook) },
  ];

  console.log('Connecting to database...');
  const { default: pool } = await import('../src/database/db');

  for (const dataset of datasets) {
    await upsertRows(pool, dataset.tableName, dataset.rows);
  }

  console.log('Seeding complete');
  process.exit(0);
};

seedLocalExcel().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

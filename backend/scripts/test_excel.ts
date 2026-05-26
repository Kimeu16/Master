import path from 'path';
import * as xlsx from 'xlsx';

const excelPath = path.join(__dirname, '../../AlanDick Organisation Structure and Escalation Matrix Ver 5.0 (3).xlsx');
const workbook = xlsx.readFile(excelPath);

const TARGET_SHEETS = ['Sites', 'Copy of Users 2026 Rev1', 'Escalation Matrix', 'PM Checklist 2025', 'Fueling Checklist', 'CM Checklist', 'Work Order Checklist', 'Revised WO Approval Workflow'];

for (const sheetName of TARGET_SHEETS) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) { console.log(`\nSheet: ${sheetName} NOT FOUND`); continue; }
  
  // Get the range
  const range = xlsx.utils.decode_range(sheet['!ref'] || 'A1');
  console.log(`\n=== Sheet: ${sheetName} (rows ${range.s.r}-${range.e.r}, cols ${range.s.c}-${range.e.c}) ===`);
  
  // Print first 8 rows raw
  const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  for (let i = 0; i < Math.min(8, rawRows.length); i++) {
    console.log(`Row ${i}:`, (rawRows[i] as any[]).filter((v: any) => v !== '').slice(0, 15));
  }
}

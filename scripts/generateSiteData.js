const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const inputPath = path.join(__dirname, '../AlanDick Organisation Structure and Escalation Matrix Ver 5.0.xlsx - Sites (1).csv');
const outputPath = path.join(__dirname, '../src/data/sites.ts');

const csv = fs.readFileSync(inputPath, 'utf8');
const results = Papa.parse(csv, { header: true, skipEmptyLines: true });
if (results.errors.length) {
  console.error('CSV parse errors:', results.errors);
  process.exit(1);
}

const rows = results.data;

const toCamel = (text) => {
  return text
    .replace(/\s*\/+\s*/g, ' ')
    .replace(/[()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word, index) => {
      const clean = word.replace(/[^a-zA-Z0-9]/g, '');
      if (index === 0) return clean.charAt(0).toLowerCase() + clean.slice(1);
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    })
    .join('');
};

const safeValue = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const objects = rows.map((row) => {
  const out = {};
  Object.entries(row).forEach(([key, value]) => {
    const camelKey = toCamel(key);
    out[camelKey] = safeValue(value);
  });
  return out;
});

const content = `import { Site } from "@/types/site";

export const sites: Site[] = ${JSON.stringify(objects, null, 2)};
`;
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, content, 'utf8');
console.log('Generated', outputPath, 'with', objects.length, 'site records');

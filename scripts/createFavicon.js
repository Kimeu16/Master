import fs from 'fs';
import path from 'path';

const logoPath = path.resolve('public/logo.png');
const svgPath = path.resolve('public/favicon.svg');

if (!fs.existsSync(logoPath)) {
  console.error('logo.png not found');
  process.exit(1);
}

const logoBuffer = fs.readFileSync(logoPath);
const base64Logo = logoBuffer.toString('base64');
const mimeType = 'image/png';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="50" fill="#ffffff" />
  <image href="data:${mimeType};base64,${base64Logo}" x="5" y="25" width="90" height="50" preserveAspectRatio="xMidYMid meet" />
</svg>`;

fs.writeFileSync(svgPath, svgContent);
console.log('favicon.svg created successfully!');

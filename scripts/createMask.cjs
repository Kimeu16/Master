const fs = require('fs');
const path = require('path');

const kenyaGeom = require('../src/data/kenya.json');

const worldBounds = [
  [-90, -360],
  [90, -360],
  [90, 360],
  [-90, 360]
];

const maskCoords = [worldBounds];

if (kenyaGeom.type === 'MultiPolygon') {
  kenyaGeom.coordinates.forEach(polygon => {
    // polygon[0] is the exterior ring
    const hole = polygon[0].map(coord => [coord[1], coord[0]]); // Leaflet uses [lat, lng]
    maskCoords.push(hole);
  });
} else if (kenyaGeom.type === 'Polygon') {
  const hole = kenyaGeom.coordinates[0].map(coord => [coord[1], coord[0]]);
  maskCoords.push(hole);
}

fs.writeFileSync(path.join(__dirname, '../src/data/kenyaMask.json'), JSON.stringify(maskCoords));
console.log('Saved kenyaMask.json');

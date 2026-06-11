const fs = require('fs');
const https = require('https');
const path = require('path');

const url = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const geo = JSON.parse(data);
    const kenya = geo.features.find(f => f.properties.ADMIN === 'Kenya' || f.properties.name === 'Kenya' || f.properties.NAME === 'Kenya');
    if (!kenya) { console.log('Kenya not found. Properties:', geo.features[0].properties); return; }
    const dir = path.join(__dirname, '../src/data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'kenya.json'), JSON.stringify(kenya.geometry));
    console.log('Saved Kenya geometry to src/data/kenya.json');
  });
}).on('error', err => {
  console.error(err);
});

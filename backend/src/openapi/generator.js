const fs = require('fs');
const path = require('path');
const spec = require('./swagger');

const outputPath = path.join(__dirname, '../../docs/openapi.json');

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));

// eslint-disable-next-line no-console
console.log(`OpenAPI spec generated at ${outputPath}`);

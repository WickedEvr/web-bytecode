const fs = require('fs');

let content = fs.readFileSync('src/lib/api.ts', 'utf8');

// Replace standard quotes
content = content.replace(/'\/api\//g, "'/");
content = content.replace(/"\/api\//g, '"/');
content = content.replace(/`\/api\//g, '`/');

// Replace ${API_BASE_URL}/api/
content = content.replace(/\$\{API_BASE_URL\}\/api\//g, '${API_BASE_URL}/');

// Replace API_BASE_URL definition
content = content.replace(
  "const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\\/$/, '');",
  "const API_BASE_URL = '/api';"
);

fs.writeFileSync('src/lib/api.ts', content, 'utf8');
console.log('Updated src/lib/api.ts');

const fs = require('fs');
const path = 'apps/api/src/routes/admin.ts';
let content = fs.readFileSync(path, 'utf8');

// Extraer paginationQuerySchema
const pagRegex = /const paginationQuerySchema = z\.object\(\{\s*limit: z\.coerce\.number\(\)\.int\(\)\.min\(1\)\.max\(100\)\.default\(9\),\s*offset: z\.coerce\.number\(\)\.int\(\)\.min\(0\)\.default\(0\),\s*\}\);/m;
content = content.replace(pagRegex, '');

// Extraer createBusinessCode
const codeRegex = /const createBusinessCode = \(prefix: string\) => \`\$\{prefix\}-\$\{crypto\.randomBytes\(4\)\.toString\('hex'\)\.toUpperCase\(\)\}\`;/m;
content = content.replace(codeRegex, '');

// Agregar import de shared
const importStmt = "import { paginationQuerySchema, createBusinessCode } from './admin/shared.js';\n";
content = content.replace("import { z } from 'zod';", "import { z } from 'zod';\n" + importStmt);

fs.writeFileSync(path, content);
console.log('Shared utilities extracted.');

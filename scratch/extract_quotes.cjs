const fs = require('fs');

const adminPath = 'apps/api/src/routes/admin.ts';
let adminContent = fs.readFileSync(adminPath, 'utf8').split('\n');

const startIdx = 2715;
const finalIdx = 3116;

const extractedBlock = adminContent.slice(startIdx, finalIdx + 1).join('\n');

const imports = `import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../../db/pool.js';
import { HttpError } from '../../utils/httpError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireCsrf } from '../../middleware/csrf.js';
import { requirePermission } from '../../middleware/auth.js';
import { requireNonTerminalState } from '../../middleware/requireNonTerminalState.js';
import { requireQuoteOwnership } from '../../middleware/abac.js';
import { paginationQuerySchema, createBusinessCode } from './shared.js';
import { auditService } from '../../services/audit.js';

export const quotesRouter = Router();

`;

let quotesFileContent = extractedBlock
  .replace(/router\.get\(/g, 'quotesRouter.get(')
  .replace(/router\.post\(/g, 'quotesRouter.post(')
  .replace(/router\.patch\(/g, 'quotesRouter.patch(')
  .replace(/router\.put\(/g, 'quotesRouter.put(')
  .replace(/router\.delete\(/g, 'quotesRouter.delete(');

quotesFileContent = imports + quotesFileContent;
fs.writeFileSync('apps/api/src/routes/admin/quotes.ts', quotesFileContent);

// Reemplazar en admin.ts
adminContent.splice(startIdx, finalIdx - startIdx + 1, "router.use('/', quotesRouter);");

let finalAdmin = adminContent.join('\n');
const quotesImport = "import { quotesRouter } from './admin/quotes.js';\n";
finalAdmin = finalAdmin.replace("import { z } from 'zod';", "import { z } from 'zod';\n" + quotesImport);

fs.writeFileSync(adminPath, finalAdmin);
console.log('Quotes block replaced successfully.');

const fs = require('fs');

const adminPath = 'apps/api/src/routes/admin.ts';
let adminContent = fs.readFileSync(adminPath, 'utf8').split('\n');

const startIdx = adminContent.findIndex(l => l.includes('// --- Projects Endpoints ---'));
const endIdx = adminContent.findIndex((l, i) => i > startIdx && l.includes('// --- Quotes Endpoints ---'));

// Restar las lineas en blanco antes de Quotes
let finalIdx = endIdx - 1;
while(adminContent[finalIdx].trim() === '') {
  finalIdx--;
}

const extractedBlock = adminContent.slice(startIdx, finalIdx + 1).join('\n');

const imports = `import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../../db/pool.js';
import { HttpError } from '../../utils/httpError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireCsrf } from '../../middleware/csrf.js';
import { requirePermission } from '../../middleware/auth.js';
import { requireNonTerminalState } from '../../middleware/requireNonTerminalState.js';
import { requireProjectOwnership, blockDeveloperFromProjectSection } from '../../middleware/abac.js';
import { paginationQuerySchema, createBusinessCode, upload, statusHistorySelect } from './shared.js';
import { auditService } from '../../services/audit.js';
import { triggerEnvironmentVerification } from '../../services/environmentVerification.js';

export const projectsRouter = Router();

`;

let projectsFileContent = extractedBlock
  .replace(/router\.get\(/g, 'projectsRouter.get(')
  .replace(/router\.post\(/g, 'projectsRouter.post(')
  .replace(/router\.patch\(/g, 'projectsRouter.patch(')
  .replace(/router\.put\(/g, 'projectsRouter.put(')
  .replace(/router\.delete\(/g, 'projectsRouter.delete(');

projectsFileContent = imports + projectsFileContent;
fs.writeFileSync('apps/api/src/routes/admin/projects.ts', projectsFileContent);

// Reemplazar en admin.ts
adminContent.splice(startIdx, finalIdx - startIdx + 1, "router.use('/', projectsRouter);");

let finalAdmin = adminContent.join('\n');
const projectsImport = "import { projectsRouter } from './admin/projects.js';\n";
finalAdmin = finalAdmin.replace("import { z } from 'zod';", "import { z } from 'zod';\n" + projectsImport);

fs.writeFileSync(adminPath, finalAdmin);
console.log('Projects block replaced securely.');

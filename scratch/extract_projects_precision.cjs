const fs = require('fs');

const adminPath = 'apps/api/src/routes/admin.ts';
let adminContent = fs.readFileSync(adminPath, 'utf8').split('\n');

// Extraer el bloque (líneas 1955 a 2679, los índices son 0-based así que 1954 a 2678)
const startIdx = 1954;
const finalIdx = 2678;

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
import { paginationQuerySchema, createBusinessCode, upload, statusHistorySelect, getProjectStatusInfo, type Queryable } from './shared.js';
import { auditService } from '../../services/audit.js';
import { triggerEnvironmentVerification } from '../../services/environmentVerification.js';
import { deleteCloudinaryAsset, uploadPortfolioImageToCloudinary, uploadPaymentReceiptToCloudinary, type CloudinaryStoredAsset } from '../../lib/cloudinary.js';
import { validateUpload } from '../../lib/validateUpload.js';

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
finalAdmin = finalAdmin.replace("import { quotesRouter } from './admin/quotes.js';", "import { quotesRouter } from './admin/quotes.js';\n" + projectsImport);

fs.writeFileSync(adminPath, finalAdmin);
console.log('Projects successfully extracted.');

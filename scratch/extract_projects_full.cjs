const fs = require('fs');

const adminPath = 'apps/api/src/routes/admin.ts';
let adminContent = fs.readFileSync(adminPath, 'utf8').split('\n');

// Extraer upload
const uploadStart = adminContent.findIndex(l => l.includes('const upload = multer({'));
let uploadEnd = uploadStart;
while (uploadEnd < uploadStart + 20) {
  if (adminContent[uploadEnd].includes('});')) break;
  uploadEnd++;
}
const uploadBlock = adminContent.slice(uploadStart, uploadEnd + 1).join('\n');

// Extraer history
const historyStart = adminContent.findIndex(l => l.includes('const statusHistorySelect = (historyTable'));
let historyEnd = historyStart;
while (historyEnd < historyStart + 25) {
  if (adminContent[historyEnd].includes('`;')) break;
  historyEnd++;
}
const historyBlock = adminContent.slice(historyStart, historyEnd + 1).join('\n');

// Extraer Queryable
const queryableStart = adminContent.findIndex(l => l.includes("type Queryable = Pick<PoolClient, 'query'>;"));
const queryableBlock = "export type Queryable = Pick<PoolClient, 'query'>;";

// Extraer getProjectStatusInfo
const statusInfoStart = adminContent.findIndex(l => l.includes('const getProjectStatusInfo = async'));
let statusInfoEnd = statusInfoStart;
while (statusInfoEnd < statusInfoStart + 15) {
  if (adminContent[statusInfoEnd].includes('};')) break;
  statusInfoEnd++;
}
const statusInfoBlock = adminContent.slice(statusInfoStart, statusInfoEnd + 1).join('\n');

// Remover los blocks (de abajo hacia arriba)
const blocksToRemove = [
  { s: uploadStart, e: uploadEnd },
  { s: historyStart, e: historyEnd },
  { s: queryableStart, e: queryableStart },
  { s: statusInfoStart, e: statusInfoEnd }
].sort((a, b) => b.s - a.s);

for (const b of blocksToRemove) {
  adminContent.splice(b.s, b.e - b.s + 1);
}

let sharedContent = fs.readFileSync('apps/api/src/routes/admin/shared.ts', 'utf8');
if (!sharedContent.includes('export const upload')) {
  sharedContent = `import multer from 'multer';
import { Request } from 'express';
import { PoolClient } from 'pg';
import { HttpError } from '../../utils/httpError.js';
import { allowedUploadMimeTypeList } from '../../lib/validateUpload.js';
` + sharedContent + '\n\n' + queryableBlock + '\n\n' + 'export ' + statusInfoBlock + '\n\n' + 'export ' + uploadBlock + '\n\n' + 'export ' + historyBlock;
  fs.writeFileSync('apps/api/src/routes/admin/shared.ts', sharedContent);
}

let finalAdmin = adminContent.join('\n');
finalAdmin = finalAdmin.replace(
  "import { paginationQuerySchema, createBusinessCode } from './admin/shared.js';",
  "import { paginationQuerySchema, createBusinessCode, upload, statusHistorySelect, getProjectStatusInfo } from './admin/shared.js';"
);

// Ahora extraemos projects de finalAdmin
let adminContentNew = finalAdmin.split('\n');
const projStartIdx = adminContentNew.findIndex(l => l.includes('// --- Projects Endpoints ---'));
const projEndIdx = adminContentNew.findIndex((l, i) => i > projStartIdx && l.includes('// --- Quotes Endpoints ---'));

let finalProjIdx = projEndIdx - 1;
while(adminContentNew[finalProjIdx].trim() === '') {
  finalProjIdx--;
}

const extractedBlock = adminContentNew.slice(projStartIdx, finalProjIdx + 1).join('\n');

const imports = `import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../../db/pool.js';
import { HttpError } from '../../utils/httpError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireCsrf } from '../../middleware/csrf.js';
import { requirePermission } from '../../middleware/auth.js';
import { requireNonTerminalState } from '../../middleware/requireNonTerminalState.js';
import { requireProjectOwnership, blockDeveloperFromProjectSection } from '../../middleware/abac.js';
import { paginationQuerySchema, createBusinessCode, upload, statusHistorySelect, getProjectStatusInfo, Queryable } from './shared.js';
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
adminContentNew.splice(projStartIdx, finalProjIdx - projStartIdx + 1, "router.use('/', projectsRouter);");

let finalAdminNew = adminContentNew.join('\n');
const projectsImport = "import { projectsRouter } from './admin/projects.js';\n";
finalAdminNew = finalAdminNew.replace("import { quotesRouter } from './admin/quotes.js';", "import { quotesRouter } from './admin/quotes.js';\n" + projectsImport);

fs.writeFileSync(adminPath, finalAdminNew);
console.log('Projects and Shared setup completed successfully.');

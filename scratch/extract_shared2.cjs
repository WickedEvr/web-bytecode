const fs = require('fs');

const adminPath = 'apps/api/src/routes/admin.ts';
let adminContent = fs.readFileSync(adminPath, 'utf8').split('\n');

const uploadStart = adminContent.findIndex(l => l.includes('const upload = multer({'));
let uploadEnd = uploadStart;
while (uploadEnd < uploadStart + 20) {
  if (adminContent[uploadEnd].includes('});')) break;
  uploadEnd++;
}
const uploadBlock = adminContent.slice(uploadStart, uploadEnd + 1).join('\n');

const historyStart = adminContent.findIndex(l => l.includes('const statusHistorySelect = (historyTable'));
let historyEnd = historyStart;
while (historyEnd < historyStart + 25) {
  if (adminContent[historyEnd].includes('`;')) break;
  historyEnd++;
}
const historyBlock = adminContent.slice(historyStart, historyEnd + 1).join('\n');

let sharedContent = fs.readFileSync('apps/api/src/routes/admin/shared.ts', 'utf8');
if (!sharedContent.includes('export const upload')) {
  sharedContent = `import multer from 'multer';
import { Request } from 'express';
import { HttpError } from '../../utils/httpError.js';
import { allowedUploadMimeTypeList } from '../../lib/validateUpload.js';
` + sharedContent + '\n\n' + 'export ' + uploadBlock + '\n\n' + 'export ' + historyBlock;
  fs.writeFileSync('apps/api/src/routes/admin/shared.ts', sharedContent);
}

// Remover blocks y exportar (de abajo hacia arriba para no dañar índices)
if (historyStart > uploadStart) {
  adminContent.splice(historyStart, historyEnd - historyStart + 1);
  adminContent.splice(uploadStart, uploadEnd - uploadStart + 1);
} else {
  adminContent.splice(uploadStart, uploadEnd - uploadStart + 1);
  adminContent.splice(historyStart, historyEnd - historyStart + 1);
}

let finalAdmin = adminContent.join('\n');
finalAdmin = finalAdmin.replace(
  "import { paginationQuerySchema, createBusinessCode } from './admin/shared.js';",
  "import { paginationQuerySchema, createBusinessCode, upload, statusHistorySelect } from './admin/shared.js';"
);

fs.writeFileSync(adminPath, finalAdmin);
console.log('Shared extensions done.');

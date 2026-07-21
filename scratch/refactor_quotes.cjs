const fs = require('fs');
const path = 'apps/api/src/routes/admin.ts';
let content = fs.readFileSync(path, 'utf8');

const quoteBlockRegex = /\s*const isRestrictedPartnerDesigner = req\.admin\?\.roles\.includes\('partner_designer'\) && !req\.admin\?\.roles\.includes\('super_admin'\) && !req\.admin\?\.roles\.includes\('admin'\);\s*if \(isRestrictedPartnerDesigner\) \{\s*const quoteCheck = await client\.query\('SELECT 1 FROM quotes WHERE id = \\$1 AND created_by = \\$2', \[id, req\.admin\?\.id\]\);\s*if \(quoteCheck\.rowCount === 0\) throw new HttpError\(403, 'No tienes permiso para modificar esta cotización\.'\);\s*\}/g;
content = content.replace(quoteBlockRegex, '');

content = content.replace(
  /router\.patch\(\s*'\/quotes\/:id',\s*requireCsrf,\s*requirePermission\('admin\.cotizador\.manage'\),\s*requireNonTerminalState\('quotes'\),\s*asyncHandler/g,
  "router.patch(\n  '/quotes/:id',\n  requireCsrf,\n  requirePermission('admin.cotizador.manage'),\n  requireNonTerminalState('quotes'),\n  requireQuoteOwnership,\n  asyncHandler"
);

content = content.replace(
  /router\.delete\(\s*'\/quotes\/:id',\s*requireCsrf,\s*requirePermission\('admin\.cotizador\.manage'\),\s*asyncHandler/g,
  "router.delete(\n  '/quotes/:id',\n  requireCsrf,\n  requirePermission('admin.cotizador.manage'),\n  requireQuoteOwnership,\n  asyncHandler"
);

fs.writeFileSync(path, content);
console.log('Cotizaciones actualizadas.');

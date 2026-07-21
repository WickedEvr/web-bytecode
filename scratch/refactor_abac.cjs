const fs = require('fs');
const path = 'apps/api/src/routes/admin.ts';
let content = fs.readFileSync(path, 'utf8');

const importStatement = "import { requireProjectOwnership, requireQuoteOwnership, blockDeveloperFromProjectSection } from '../middleware/abac.js';\n";
if (!content.includes('requireProjectOwnership')) {
  content = content.replace("import { requireCsrf } from '../middleware/csrf.js';", "import { requireCsrf } from '../middleware/csrf.js';\n" + importStatement);
}

// 1. Reemplazar para PATCH /projects/:id
content = content.replace(
  /router\.patch\(\s*'\/projects\/:id',\s*requireCsrf,\s*requirePermission\('admin\.proyectos\.manage'\),\s*asyncHandler/g,
  "router.patch(\n  '/projects/:id',\n  requireCsrf,\n  requirePermission('admin.proyectos.manage'),\n  requireProjectOwnership,\n  asyncHandler"
);
const patchProjectBlockRegex = /const isRestrictedDeveloper = req\.admin\?\.roles\.includes\('developer'\) && !req\.admin\?\.roles\.includes\('super_admin'\) && !req\.admin\?\.roles\.includes\('admin'\);\s*if \(isRestrictedDeveloper\) \{\s*const assignmentCheck = await client\.query\('SELECT 1 FROM project_assignments WHERE project_id = \\$1 AND user_id = \\$2', \[id, req\.admin\?\.id\]\);\s*if \(assignmentCheck\.rowCount === 0\) throw new HttpError\(403, 'No tienes permiso para modificar un proyecto no asignado\.'\);\s*\}/g;
content = content.replace(patchProjectBlockRegex, '');


// 2. Reemplazar para DELETE /projects/:id
content = content.replace(
  /router\.delete\(\s*'\/projects\/:id',\s*requireCsrf,\s*requirePermission\('admin\.proyectos\.manage'\),\s*asyncHandler/g,
  "router.delete(\n  '/projects/:id',\n  requireCsrf,\n  requirePermission('admin.proyectos.manage'),\n  blockDeveloperFromProjectSection('eliminar'),\n  asyncHandler"
);
const delProjectBlockRegex = /const isRestrictedDeveloper = req\.admin\?\.roles\.includes\('developer'\) && !req\.admin\?\.roles\.includes\('super_admin'\) && !req\.admin\?\.roles\.includes\('admin'\);\s*if \(isRestrictedDeveloper\) throw new HttpError\(403, 'No tienes permiso para eliminar proyectos\.'\);/g;
content = content.replace(delProjectBlockRegex, '');

// 3. Entornos (environments)
const blockEnvGet = /router\.get\(\s*'\/projects\/:id\/environments',\s*requirePermission\('admin\.proyectos\.view'\),\s*asyncHandler/g;
content = content.replace(blockEnvGet, "router.get(\n  '/projects/:id/environments',\n  requirePermission('admin.proyectos.view'),\n  blockDeveloperFromProjectSection('entornos'),\n  asyncHandler");

const blockEnvPost = /router\.post\(\s*'\/projects\/:id\/environments',\s*requireCsrf,\s*requirePermission\('admin\.proyectos\.manage'\),\s*asyncHandler/g;
content = content.replace(blockEnvPost, "router.post(\n  '/projects/:id/environments',\n  requireCsrf,\n  requirePermission('admin.proyectos.manage'),\n  blockDeveloperFromProjectSection('entornos'),\n  asyncHandler");

const blockEnvPostVerify = /router\.post\(\s*'\/projects\/:id\/environments\/:environment_id\/verify',\s*requireCsrf,\s*requirePermission\('admin\.proyectos\.manage'\),\s*asyncHandler/g;
content = content.replace(blockEnvPostVerify, "router.post(\n  '/projects/:id/environments/:environment_id/verify',\n  requireCsrf,\n  requirePermission('admin.proyectos.manage'),\n  blockDeveloperFromProjectSection('entornos'),\n  asyncHandler");

const blockEnvDel = /router\.delete\(\s*'\/projects\/:id\/environments\/:environment_id',\s*requireCsrf,\s*requirePermission\('admin\.proyectos\.manage'\),\s*asyncHandler/g;
content = content.replace(blockEnvDel, "router.delete(\n  '/projects/:id/environments/:environment_id',\n  requireCsrf,\n  requirePermission('admin.proyectos.manage'),\n  blockDeveloperFromProjectSection('entornos'),\n  asyncHandler");

// 4. Hitos (milestones)
const blockMilGet = /router\.get\(\s*'\/projects\/:id\/milestones',\s*requirePermission\('admin\.proyectos\.view'\),\s*asyncHandler/g;
content = content.replace(blockMilGet, "router.get(\n  '/projects/:id/milestones',\n  requirePermission('admin.proyectos.view'),\n  blockDeveloperFromProjectSection('hitos'),\n  asyncHandler");

const blockMilPost = /router\.post\(\s*'\/projects\/:id\/milestones',\s*requireCsrf,\s*requirePermission\('admin\.proyectos\.manage'\),\s*asyncHandler/g;
content = content.replace(blockMilPost, "router.post(\n  '/projects/:id/milestones',\n  requireCsrf,\n  requirePermission('admin.proyectos.manage'),\n  blockDeveloperFromProjectSection('hitos'),\n  asyncHandler");

const blockMilPostPay = /router\.post\(\s*'\/projects\/:id\/milestones\/:milestone_id\/payments',\s*requireCsrf,\s*requirePermission\('admin\.proyectos\.manage'\),\s*upload\.single\('receipt'\),\s*asyncHandler/g;
content = content.replace(blockMilPostPay, "router.post(\n  '/projects/:id/milestones/:milestone_id/payments',\n  requireCsrf,\n  requirePermission('admin.proyectos.manage'),\n  blockDeveloperFromProjectSection('hitos'),\n  upload.single('receipt'),\n  asyncHandler");

const blockMilPatch = /router\.patch\(\s*'\/projects\/:id\/milestones\/:milestone_id',\s*requireCsrf,\s*requirePermission\('admin\.proyectos\.manage'\),\s*requireNonTerminalState\('projects'\),\s*asyncHandler/g;
content = content.replace(blockMilPatch, "router.patch(\n  '/projects/:id/milestones/:milestone_id',\n  requireCsrf,\n  requirePermission('admin.proyectos.manage'),\n  requireNonTerminalState('projects'),\n  blockDeveloperFromProjectSection('hitos'),\n  asyncHandler");

// 5. Historial y Actividad Github
const blockGithubGet = /router\.get\(\s*'\/projects\/:id\/github-activity',\s*requirePermission\('admin\.proyectos\.view'\),\s*asyncHandler/g;
content = content.replace(blockGithubGet, "router.get(\n  '/projects/:id/github-activity',\n  requirePermission('admin.proyectos.view'),\n  blockDeveloperFromProjectSection('actividad de github'),\n  asyncHandler");

const blockHistGet = /router\.get\(\s*'\/projects\/:id\/history',\s*requirePermission\('admin\.proyectos\.view'\),\s*asyncHandler/g;
content = content.replace(blockHistGet, "router.get(\n  '/projects/:id/history',\n  requirePermission('admin.proyectos.view'),\n  blockDeveloperFromProjectSection('historial'),\n  asyncHandler");

const blockSecretGet = /router\.get\(\s*'\/projects\/:id\/vercel-bypass-secret',\s*requirePermission\('admin\.proyectos\.manage'\),\s*asyncHandler/g;
content = content.replace(blockSecretGet, "router.get(\n  '/projects/:id/vercel-bypass-secret',\n  requirePermission('admin.proyectos.manage'),\n  blockDeveloperFromProjectSection('secretos'),\n  asyncHandler");

const blockAssignGet = /router\.get\(\s*'\/projects\/:id\/assignments',\s*requirePermission\('admin\.proyectos\.view'\),\s*asyncHandler/g;
content = content.replace(blockAssignGet, "router.get(\n  '/projects/:id/assignments',\n  requirePermission('admin.proyectos.view'),\n  requireProjectOwnership,\n  asyncHandler");

const blockAssignPost = /router\.post\(\s*'\/projects\/:id\/assignments',\s*requireCsrf,\s*requirePermission\('admin\.proyectos\.assign'\),\s*asyncHandler/g;
content = content.replace(blockAssignPost, "router.post(\n  '/projects/:id/assignments',\n  requireCsrf,\n  requirePermission('admin.proyectos.assign'),\n  requireProjectOwnership,\n  asyncHandler");

// Eliminar el código inline quemado (solo el if block y su linea)
const genericDevBlock = /\s*const isRestrictedDeveloper = req\.admin\?\.roles\.includes\('developer'\) && !req\.admin\?\.roles\.includes\('super_admin'\) && !req\.admin\?\.roles\.includes\('admin'\);\s*if \(isRestrictedDeveloper\) throw new HttpError\(403, '[^']+'\);/g;
content = content.replace(genericDevBlock, '');

// Eliminar isRestrictedDeveloper para assignment endpoint logic inline
const assignBlockRegex = /\s*const isRestrictedDeveloper = req\.admin\?\.roles\.includes\('developer'\) && !req\.admin\?\.roles\.includes\('super_admin'\) && !req\.admin\?\.roles\.includes\('admin'\);\s*if \(isRestrictedDeveloper\) \{\s*const assignmentCheck = await pool\.query\('SELECT 1 FROM project_assignments WHERE project_id = \\$1 AND user_id = \\$2', \[projectId, req\.admin\?\.id\]\);\s*if \(assignmentCheck\.rowCount === 0\) throw new HttpError\(403, '[^']+'\);\s*\}/g;
content = content.replace(assignBlockRegex, '');

fs.writeFileSync(path, content);
console.log('Refactorizacion ABAC aplicada en admin.ts exitosamente.');

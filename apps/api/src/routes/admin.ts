import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { accessRouter, settingsRouter, usersRouter } from './admin/access.js';
import { casesRouter } from './admin/cases.js';
import { contentRouter } from './admin/content.js';
import { projectsRouter } from './admin/projects.js';
import { quotesRouter } from './admin/quotes.js';
import { auditLogsRouter, dashboardRouter, governanceRouter } from './admin/system.js';

const router = Router();

router.use(requireAdmin);

router.use('/', accessRouter);
router.use('/', dashboardRouter);
router.use('/', casesRouter);
router.use('/', usersRouter);
router.use('/', settingsRouter);
router.use('/', auditLogsRouter);
router.use('/', contentRouter);
router.use('/', projectsRouter);
router.use('/', quotesRouter);
router.use('/', governanceRouter);

export default router;

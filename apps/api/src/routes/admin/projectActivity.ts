import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../../db/pool.js';
import { requirePermission } from '../../middleware/auth.js';
import { requireProjectOwnership } from '../../middleware/abac.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HttpError } from '../../utils/httpError.js';
import { statusHistorySelect } from './shared.js';

export const projectActivityRouter = Router();

projectActivityRouter.get(
  '/projects/:id/commits',
  requirePermission('admin.proyectos.view'),
  requireProjectOwnership,
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);    const result = await pool.query(
      `SELECT id, project_id, commit_hash, message, author_name, author_email,
              branch, github_url, committed_at, created_at
       FROM project_commits WHERE project_id = $1
       ORDER BY COALESCE(committed_at, created_at) DESC LIMIT 100`,
      [id],
    );
    res.json({ items: result.rows });
  }),
);

projectActivityRouter.get(
  '/projects/:id/history',
  requirePermission('admin.proyectos.view'),
  requireProjectOwnership,
  asyncHandler(async (req: Request, res: Response) => {    const result = await pool.query(
      statusHistorySelect('project_status_history', 'project_id'),
      [z.string().uuid().parse(req.params.id)],
    );
    res.json({ items: result.rows });
  }),
);

projectActivityRouter.get(
  '/projects/:id/adendas',
  requirePermission('admin.proyectos.view'),
  requireProjectOwnership,
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);    const projectRes = await pool.query('SELECT customer_id FROM projects WHERE id = $1', [id]);
    if (projectRes.rowCount === 0) throw new HttpError(404, 'Proyecto no encontrado');

    const result = await pool.query(
      `SELECT q.id, q.quote_code, q.total_amount, q.currency_code, q.created_at, sc.name AS status_name
       FROM quotes q
       JOIN status_catalog sc ON q.status_id = sc.id AND sc.domain = 'quote'
       WHERE q.customer_id = $1 
         AND q.deleted_at IS NULL
         AND sc.code NOT IN ('expired', 'rejected')
         AND EXISTS (
           SELECT 1 FROM quote_items qi
           JOIN pricing_catalog pc ON qi.pricing_catalog_id = pc.id
           WHERE qi.quote_id = q.id 
             AND pc.item_code IN ('revision_basic', 'revision_custom', 'revision_mid')
         )
       ORDER BY q.created_at DESC`,
      [projectRes.rows[0].customer_id],
    );
    res.json({ items: result.rows });
  }),
);

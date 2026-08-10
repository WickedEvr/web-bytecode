import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../../db/pool.js';
import { requirePermission } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HttpError } from '../../utils/httpError.js';
import { paginationQuerySchema } from './shared.js';

export const projectReadRouter = Router();

export const projectSelectSql = `
  SELECT p.id, p.project_code, p.customer_id, p.organization_id, p.service_id, p.quote_id, p.status_id,
         p.name, p.description, p.github_repo,
         p.start_date, p.estimated_end_date, p.actual_end_date,
         p.total_budget, p.currency_code, p.created_at, p.updated_at,
         sc.code AS status, sc.name AS status_name, sc.is_terminal as "isTerminal",
         COALESCE(c.display_name, NULLIF(concat_ws(' ', c.first_name, c.last_name), '')) AS customer_name,
         c.primary_email AS customer_email, s.name AS service_name
  FROM projects p
  JOIN status_catalog sc ON p.status_id = sc.id AND sc.domain = 'project'
  JOIN customers c ON p.customer_id = c.id
  JOIN service_catalog s ON p.service_id = s.id
  WHERE p.deleted_at IS NULL
`;

projectReadRouter.get(
  '/projects',
  requirePermission('admin.proyectos.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const { limit, offset } = paginationQuerySchema.parse(req.query);
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');

    let querySql = `${projectSelectSql} ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`;
    let countSql = 'SELECT count(*)::int AS total FROM projects p WHERE p.deleted_at IS NULL';
    const params: any[] = [limit, offset];
    const countParams: any[] = [];

    if (isRestrictedDeveloper) {
      querySql = `${projectSelectSql} AND EXISTS(SELECT 1 FROM project_assignments pa WHERE pa.project_id = p.id AND pa.user_id = $3) ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`;
      countSql = 'SELECT count(*)::int AS total FROM projects p WHERE p.deleted_at IS NULL AND EXISTS(SELECT 1 FROM project_assignments pa WHERE pa.project_id = p.id AND pa.user_id = $1)';
      params.push(req.admin!.id);
      countParams.push(req.admin!.id);
    }

    const [result, countResult] = await Promise.all([
      pool.query(querySql, params),
      pool.query(countSql, countParams),
    ]);
    res.json({ data: result.rows, total: countResult.rows[0].total });
  }),
);

projectReadRouter.get(
  '/projects/options',
  requirePermission('admin.proyectos.create'),
  asyncHandler(async (_req: Request, res: Response) => {
    const [customers, services] = await Promise.all([
      pool.query(`
        WITH source_customers AS (
          SELECT cc.customer_id, cc.organization_id, cc.created_at AS source_created_at
          FROM contact_cases cc
          WHERE cc.deleted_at IS NULL
          UNION ALL
          SELECT q.customer_id, NULL::uuid AS organization_id, q.created_at AS source_created_at
          FROM quotes q
          WHERE q.deleted_at IS NULL
        ), enriched AS (
          SELECT
            c.id,
            c.person_type,
            c.primary_email,
            c.updated_at,
            s.source_created_at,
            NULLIF(trim(concat_ws(' ', c.first_name, c.last_name)), '') AS contact_name,
            COALESCE(NULLIF(org.trade_name, ''), NULLIF(org.legal_name, '')) AS company_name,
            NULLIF(doc.document_number, '') AS personal_document
          FROM source_customers s
          JOIN customers c ON c.id = s.customer_id AND c.deleted_at IS NULL
          LEFT JOIN LATERAL (
            SELECT cd.document_number
            FROM customer_documents cd
            WHERE cd.customer_id = c.id AND cd.deleted_at IS NULL
            ORDER BY cd.is_primary DESC, cd.updated_at DESC, cd.id
            LIMIT 1
          ) doc ON true
          LEFT JOIN LATERAL (
            SELECT o.trade_name, o.legal_name
            FROM organizations o
            LEFT JOIN customer_organizations co
              ON co.organization_id = o.id
             AND co.customer_id = c.id
             AND co.deleted_at IS NULL
            WHERE o.deleted_at IS NULL
              AND (o.id = s.organization_id OR (s.organization_id IS NULL AND co.customer_id IS NOT NULL))
            ORDER BY
              CASE WHEN o.id = s.organization_id THEN 0 WHEN co.is_primary THEN 1 ELSE 2 END,
              co.updated_at DESC NULLS LAST,
              o.updated_at DESC
            LIMIT 1
          ) org ON true
        ), prepared AS (
          SELECT
            id,
            CASE WHEN person_type IN ('company', 'company_contact', 'empresa') THEN 'empresa' ELSE 'independiente' END AS type,
            CASE
              WHEN person_type IN ('company', 'company_contact', 'empresa') THEN
                CASE
                  WHEN company_name IS NOT NULL AND contact_name IS NOT NULL
                    THEN contact_name || ' (' || company_name || ')'
                  ELSE COALESCE(contact_name, company_name, 'Contacto sin nombre')
                END
              ELSE COALESCE(contact_name, 'Cliente sin nombre')
            END AS label,
            COALESCE(personal_document, '') AS document,
            COALESCE(lower(trim(primary_email)), '') AS email,
            CASE
              WHEN person_type IN ('company', 'company_contact', 'empresa') THEN company_name
              ELSE NULL
            END AS company_name,
            source_created_at,
            updated_at
          FROM enriched
        ), keyed AS (
          SELECT *,
            COALESCE(NULLIF(regexp_replace(lower(document), '[^[:alnum:]]', '', 'g'), ''), id::text) AS document_key,
            COALESCE(NULLIF(email, ''), id::text) AS email_key
          FROM prepared
        ), document_deduplicated AS (
          SELECT DISTINCT ON (document_key) id, label, document, email, type, company_name, email_key, source_created_at, updated_at
          FROM keyed
          ORDER BY document_key, source_created_at DESC, updated_at DESC, id
        ), deduplicated AS (
          SELECT DISTINCT ON (email_key) id, label, document, email, type, company_name
          FROM document_deduplicated
          ORDER BY email_key, source_created_at DESC, updated_at DESC, id
        )
        SELECT id, label, email, type, company_name
        FROM deduplicated
        ORDER BY label ASC, email ASC
        LIMIT 500
      `),
      pool.query(`SELECT id, code, name FROM service_catalog WHERE is_active = true AND deleted_at IS NULL ORDER BY name ASC`),
    ]);
    res.json({ customers: customers.rows, services: services.rows });
  }),
);

projectReadRouter.get(
  '/projects/assignment-options',
  requirePermission('admin.proyectos.assign'),
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await pool.query(
      `SELECT DISTINCT u.id, u.name, u.email
       FROM admin_users u
       JOIN admin_user_roles aur ON u.id = aur.admin_user_id
       JOIN roles r ON aur.role_id = r.id
       WHERE u.deleted_at IS NULL AND u.is_active = true AND r.code = 'developer'
       ORDER BY u.name ASC, u.email ASC`,
    );
    res.json({ items: result.rows });
  }),
);

projectReadRouter.get(
  '/projects/:id',
  requirePermission('admin.proyectos.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');

    let sql = `${projectSelectSql} AND p.id = $1`;
    const params: any[] = [id];

    if (isRestrictedDeveloper) {
      sql += ' AND EXISTS(SELECT 1 FROM project_assignments pa WHERE pa.project_id = p.id AND pa.user_id = $2)';
      params.push(req.admin!.id);
    }

    const result = await pool.query(sql, params);
    if (!result.rowCount) throw new HttpError(404, 'Proyecto no encontrado o acceso denegado');
    res.json({ item: result.rows[0] });
  }),
);

projectReadRouter.get(
  '/projects/:id/vercel-bypass-secret',
  requirePermission('admin.proyectos.manage'),
  asyncHandler(async (req: Request, res: Response) => {
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    if (isRestrictedDeveloper) throw new HttpError(403, 'No tienes permiso para acceder a esta informacion.');
    const id = z.string().uuid().parse(req.params.id);
    const result = await pool.query(
      `SELECT vercel_bypass_secret
       FROM projects
       WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    if (!result.rowCount) throw new HttpError(404, 'Proyecto no encontrado');
    res.json({ vercel_bypass_secret: result.rows[0].vercel_bypass_secret ?? null });
  }),
);

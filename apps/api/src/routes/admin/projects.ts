import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  deleteCloudinaryAsset,
  uploadPaymentReceiptToCloudinary,
  type CloudinaryStoredAsset,
} from '../../lib/cloudinary.js';
import { pool } from '../../db/pool.js';
import { validateUpload } from '../../lib/validateUpload.js';
import { requirePermission } from '../../middleware/auth.js';
import { requireCsrf } from '../../middleware/csrf.js';
import { requireNonTerminalState } from '../../middleware/requireNonTerminalState.js';
import { triggerEnvironmentVerification } from '../../services/environmentVerification.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HttpError } from '../../utils/httpError.js';
import {
  createBusinessCode,
  getProjectStatusInfo,
  paginationQuerySchema,
  statusHistorySelect,
  upload,
} from './shared.js';
import { auditService } from '../../services/audit.js';

export const projectsRouter = Router();
// --- Projects Endpoints ---

const projectStatusSchema = z.object({ status: z.string().trim().min(1).max(80) });
const nullableProjectUrl = z.string().trim().url().max(255).optional().nullable();
const projectCreateSchema = z.object({
  customerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  organizationId: z.string().uuid().optional().nullable(),
  quoteId: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(2).max(180),
  description: z.string().trim().max(3000).optional().nullable(),
  status: z.string().trim().min(1).max(80),
  githubRepo: nullableProjectUrl,
  githubBranch: z.string().trim().max(160).optional().nullable(),
  startDate: z.string().date(),
  estimatedEndDate: z.string().date(),
  actualEndDate: z.string().date().optional().nullable(),
  totalBudget: z.coerce.number().min(0),
  currencyCode: z.string().trim().length(3).transform((value) => value.toUpperCase()).default('PEN'),
});
const projectUpdateSchema = projectCreateSchema.partial().extend({
  applyKillFee: z.boolean().optional(),
});

const projectSelectSql = `
  SELECT p.id, p.project_code, p.customer_id, p.organization_id, p.service_id, p.quote_id, p.status_id,
         p.name, p.description, p.github_repo, p.github_branch,
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

projectsRouter.get(
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

projectsRouter.get(
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

projectsRouter.get(
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

projectsRouter.post(
  '/projects',
  requireCsrf,
  requirePermission('admin.proyectos.create'),
  asyncHandler(async (req: Request, res: Response) => {
    const body = projectCreateSchema.parse(req.body);
    const { id: statusId } = await getProjectStatusInfo(pool, body.status);
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    
    if (body.quoteId) {
      const quote = await pool.query(
        `SELECT q.id, q.total_amount, q.currency_code
         FROM quotes q
         JOIN customers quote_customer ON quote_customer.id = q.customer_id
         JOIN customers project_customer ON project_customer.id = $2
         WHERE q.id = $1 AND q.deleted_at IS NULL
           AND lower(quote_customer.primary_email) = lower(project_customer.primary_email)`,
        [body.quoteId, body.customerId],
      );
      if (!quote.rowCount) throw new HttpError(400, 'La cotizacion no pertenece al cliente seleccionado.');
      
      body.totalBudget = Number(quote.rows[0].total_amount);
      body.currencyCode = quote.rows[0].currency_code;
      
      const existingProject = await pool.query(
        `SELECT id FROM projects WHERE quote_id = $1 AND deleted_at IS NULL`,
        [body.quoteId]
      );
      if (existingProject.rowCount) throw new HttpError(400, 'Esta cotización ya se encuentra asignada a un proyecto registrado.');
    } else if (isRestrictedDeveloper) {
      body.totalBudget = 0;
    }
    const result = await pool.query(
      `INSERT INTO projects (
         project_code, customer_id, organization_id, service_id, name, description,
         status_id, github_repo, github_branch, start_date, estimated_end_date,
         actual_end_date, total_budget, currency_code, quote_id
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id`,
      [createBusinessCode('PRJ'), body.customerId, body.organizationId ?? null, body.serviceId,
       body.name, body.description ?? null, statusId, body.githubRepo ?? null,
       body.githubBranch ?? null, body.startDate, body.estimatedEndDate,
       body.actualEndDate ?? null, body.totalBudget, body.currencyCode, body.quoteId ?? null],
    );
    const created = await pool.query(`${projectSelectSql} AND p.id = $1`, [result.rows[0].id]);
    await auditService.logAdminAction({ userId: req.admin?.id, action: 'create_project', entityType: 'project', entity: created.rows[0], req });
    res.status(201).json({ item: created.rows[0] });
  }),
);

projectsRouter.get(
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

projectsRouter.get(
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

projectsRouter.patch(
  '/projects/:id',
  requireCsrf,
  requirePermission('admin.proyectos.manage'),
  requireNonTerminalState('projects'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const body = projectUpdateSchema.parse(req.body);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
      if (isRestrictedDeveloper) {
        throw new HttpError(403, 'No tienes permiso para modificar la información del proyecto.');
      }
      const current = await client.query(
        `${projectSelectSql} AND p.id = $1 FOR UPDATE OF p`,
        [id],
      );
      if (!current.rowCount) throw new HttpError(404, 'Proyecto no encontrado');
      const oldStatusId = current.rows[0].status_id as string | null;
      const statusInfo = body.status ? await getProjectStatusInfo(client, body.status) : null;
      const statusId = statusInfo?.id ?? null;
      if (body.quoteId && body.quoteId !== current.rows[0].quote_id) {
        const customerId = body.customerId ?? current.rows[0].customer_id;
        const quote = await client.query(
          `SELECT q.id
           FROM quotes q
           JOIN customers quote_customer ON quote_customer.id = q.customer_id
           JOIN customers project_customer ON project_customer.id = $2
           WHERE q.id = $1 AND q.deleted_at IS NULL
             AND lower(quote_customer.primary_email) = lower(project_customer.primary_email)`,
          [body.quoteId, customerId],
        );
        if (!quote.rowCount) throw new HttpError(400, 'La cotizacion no pertenece al cliente seleccionado.');
        
        const existingProject = await client.query(
          `SELECT id FROM projects WHERE quote_id = $1 AND id != $2 AND deleted_at IS NULL`,
          [body.quoteId, id]
        );
        if (existingProject.rowCount) throw new HttpError(400, 'Esta cotización ya se encuentra asignada a otro proyecto.');
      }
      let finalActualEndDate = body.actualEndDate ?? current.rows[0].actual_end_date;
      if (oldStatusId && statusId && oldStatusId !== statusId) {
        if (statusInfo?.is_terminal) {
          finalActualEndDate = new Date().toISOString().split('T')[0];
        } else {
          finalActualEndDate = null;
        }

        if (statusInfo?.code === 'cancelled' && body.applyKillFee) {
          const statusCatRes = await client.query(`SELECT code, id FROM status_catalog WHERE domain = 'milestone'`);
          const milestoneCancelledId = statusCatRes.rows.find(r => r.code === 'cancelled' || r.code === 'canceled')?.id;
          const milestoneCompletedId = statusCatRes.rows.find(r => r.code === 'completed')?.id;
          const milestonePendingId = statusCatRes.rows.find(r => r.code !== 'cancelled' && r.code !== 'canceled' && r.code !== 'completed')?.id;
          const activeQuoteId = current.rows[0].quote_id;

          if (activeQuoteId) {
            // 1. Cancelar de golpe todos los hitos técnicos que estaban en progreso o pendientes ANTES de inyectar el Kill Fee
            await client.query(`
              UPDATE project_milestones 
              SET status_id = $1 
              WHERE project_id = $2 AND status_id != $3 AND status_id != $1
            `, [milestoneCancelledId, id, milestoneCompletedId]);

            // 2. Obtener todas las cotizaciones involucradas (Raíz + Adendas usadas en hitos)
            const quotesToEvaluateRes = await client.query(`
              SELECT DISTINCT q.id as quote_id, q.total_amount
              FROM quotes q
              WHERE q.id = $1
                 OR q.id IN (SELECT quote_id FROM project_milestones WHERE project_id = $2 AND quote_id IS NOT NULL)
            `, [activeQuoteId, id]);

            // 3. Iterar sobre cada cotización para inyectar su respectivo Kill Fee si no está 100% pagada
            for (const qRow of quotesToEvaluateRes.rows) {
              const currentQuoteId = qRow.quote_id;
              const totalQuoteAmount = Number(qRow.total_amount);

              // 3.1. Calcular el dinero real validado pagado para ESTA cotización en ESTE proyecto
              const paidMoneyRes = await client.query(`
                SELECT COALESCE(SUM(mp.amount_paid), 0) as total_paid_money
                FROM project_milestones pm
                JOIN milestone_payments mp ON mp.milestone_id = pm.id AND mp.status = 'valid' AND mp.deleted_at IS NULL
                WHERE pm.project_id = $1 AND pm.quote_id = $2
              `, [id, currentQuoteId]);

              const totalPaidMoney = Number(paidMoneyRes.rows[0].total_paid_money);
              const paidPercentage = totalQuoteAmount > 0 ? (totalPaidMoney / totalQuoteAmount) * 100 : 0;
              const actualPaidPercentage = Math.min(100, paidPercentage);
              const pendingPercentage = 100 - actualPaidPercentage;

              // 3.2. Si queda porcentaje por cobrar, inyectar el Kill Fee
              if (pendingPercentage > 0) {
                // El tope del Kill Fee es 20%, o lo que reste si es menor a 20%
                const killFeePercentage = Math.min(20, pendingPercentage);
                await client.query(`
                  INSERT INTO project_milestones (project_id, title, due_date, payment_percentage, status_id, quote_id)
                  VALUES ($1, 'Compensación por Cancelación', CURRENT_DATE, $2, $3, $4)
                `, [id, killFeePercentage, milestonePendingId, currentQuoteId]);
              }
            }
          }
        }
      }

      await client.query(
        `UPDATE projects SET
           customer_id = COALESCE($2, customer_id), organization_id = COALESCE($3, organization_id),
           service_id = COALESCE($4, service_id), name = COALESCE($5, name),
           description = CASE WHEN $15 THEN $6 ELSE description END, status_id = COALESCE($7, status_id),
           github_repo = CASE WHEN $16 THEN $8 ELSE github_repo END, github_branch = COALESCE($9, github_branch),
           start_date = COALESCE($10, start_date), estimated_end_date = COALESCE($11, estimated_end_date),
           actual_end_date = COALESCE($12, actual_end_date), total_budget = COALESCE($13, total_budget),
           currency_code = COALESCE($14, currency_code),
           quote_id = CASE WHEN $18 THEN $17 ELSE quote_id END,
           updated_at = now()
         WHERE id = $1 AND deleted_at IS NULL`,
        [id, body.customerId ?? null, body.organizationId ?? null, body.serviceId ?? null,
         body.name ?? null, body.description ?? null, statusId, body.githubRepo ?? null,
         body.githubBranch ?? null, body.startDate ?? null, body.estimatedEndDate ?? null,
         finalActualEndDate, body.totalBudget ?? null, body.currencyCode ?? null,
         Object.hasOwn(body, 'description'), Object.hasOwn(body, 'githubRepo'),
         body.quoteId ?? null, Object.hasOwn(body, 'quoteId')],
      );
      if (oldStatusId && statusId && oldStatusId !== statusId) {
        await client.query(
          `INSERT INTO project_status_history (
             project_id, old_status_id, new_status_id, changed_by
           ) VALUES ($1, $2, $3, $4)`,
          [id, oldStatusId, statusId, req.admin?.id ?? null],
        );
      }
      const updated = await client.query(`${projectSelectSql} AND p.id = $1`, [id]);
      await auditService.logAdminAction({ userId: req.admin?.id, action: 'update_project', entityType: 'project', entity: updated.rows[0], previousState: current.rows[0], req });
      await client.query('COMMIT');
      res.json({ item: updated.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }),
);

projectsRouter.delete(
  '/projects/:id',
  requireCsrf,
  requirePermission('admin.proyectos.manage'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    if (isRestrictedDeveloper) throw new HttpError(403, 'No tienes permiso para eliminar proyectos.');
    const result = await pool.query('UPDATE projects SET deleted_at = now(), updated_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING *', [id]);
    if (!result.rowCount) throw new HttpError(404, 'Proyecto no encontrado');
    await auditService.logAdminAction({ userId: req.admin?.id, action: 'delete_project', entityType: 'project', entity: result.rows[0], req });
    res.json({ ok: true });
  }),
);

const projectEnvironmentSchema = z.object({
  type: z.enum(['production', 'staging']),
  name: z.string().trim().min(2).max(180),
  url: z.string().trim().url().max(500),
  apiUrl: z.string().trim().url().max(500).optional().nullable(),
});

projectsRouter.get(
  '/projects/:id/environments',
  requirePermission('admin.proyectos.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = z.string().uuid().parse(req.params.id);
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    if (isRestrictedDeveloper) {
      const assignmentCheck = await pool.query('SELECT 1 FROM project_assignments WHERE project_id = $1 AND user_id = $2', [projectId, req.admin?.id]);
      if (assignmentCheck.rowCount === 0) throw new HttpError(403, 'No tienes permiso para ver entornos de un proyecto ajeno.');
    }
    const result = await pool.query(
      `SELECT id, project_id, type, name, url, api_url, branch_name, commit_sha, status, error_details, audit_report, created_at
       FROM project_environments
       WHERE project_id = $1
       ORDER BY CASE type WHEN 'production' THEN 0 WHEN 'staging' THEN 1 ELSE 2 END,
                created_at DESC`,
      [projectId],
    );
    res.json({ items: result.rows });
  }),
);

projectsRouter.post(
  '/projects/:id/environments',
  requireCsrf,
  requirePermission('admin.proyectos.manage'),
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = z.string().uuid().parse(req.params.id);
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    if (isRestrictedDeveloper) throw new HttpError(403, 'No tienes permiso para gestionar los entornos.');
    const body = projectEnvironmentSchema.parse(req.body);
    const result = await pool.query(
      `INSERT INTO project_environments (project_id, type, name, url, api_url, status)
       SELECT id, $2, $3, $4, $5, 'verifying'
       FROM projects
       WHERE id = $1 AND deleted_at IS NULL
       ON CONFLICT (project_id, type, name)
       DO UPDATE SET url = EXCLUDED.url, api_url = EXCLUDED.api_url, status = 'verifying', error_details = NULL
       RETURNING id, project_id, type, name, url, api_url, status, error_details, created_at`,
      [projectId, body.type, body.name, body.url, body.apiUrl || null],
    );
    if (!result.rowCount) throw new HttpError(404, 'Proyecto no encontrado');
    triggerEnvironmentVerification(result.rows[0].id, projectId);
    await auditService.logAdminAction({ userId: req.admin?.id, action: 'create_environment', entityType: 'project_environments', entity: result.rows[0], req });
    res.status(201).json({ item: result.rows[0] });
  }),
);

projectsRouter.post(
  '/projects/:id/environments/:environment_id/verify',
  requireCsrf,
  requirePermission('admin.proyectos.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = z.string().uuid().parse(req.params.id);
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    if (isRestrictedDeveloper) {
      const assignmentCheck = await pool.query('SELECT 1 FROM project_assignments WHERE project_id = $1 AND user_id = $2', [projectId, req.admin?.id]);
      if (assignmentCheck.rowCount === 0) throw new HttpError(403, 'No tienes permiso para interactuar con entornos de un proyecto ajeno.');
    }
    const environmentId = z.string().uuid().parse(req.params.environment_id);
    const result = await pool.query(
      `UPDATE project_environments
       SET status = 'verifying', error_details = NULL
       WHERE id = $1 AND project_id = $2
         AND type IN ('ephemeral', 'staging')
         AND status IN ('deployed_ui', 'active', 'ready', 'failed')
       RETURNING id`,
      [environmentId, projectId],
    );
    if (!result.rowCount) throw new HttpError(409, 'El entorno no está listo para iniciar la verificación.');
    triggerEnvironmentVerification(environmentId, projectId);
    await auditService.logAdminAction({ userId: req.admin?.id, action: 'verify_environment', entityType: 'project_environments', entity: environmentId, req });
    res.status(202).json({ ok: true });
  }),
);

projectsRouter.delete(
  '/projects/:id/environments/:environment_id',
  requireCsrf,
  requirePermission('admin.proyectos.manage'),
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = z.string().uuid().parse(req.params.id);
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    if (isRestrictedDeveloper) throw new HttpError(403, 'No tienes permiso para interactuar con los entornos.');
    const environmentId = z.string().uuid().parse(req.params.environment_id);
    const result = await pool.query(
      'DELETE FROM project_environments WHERE id = $1 AND project_id = $2 RETURNING id',
      [environmentId, projectId],
    );
    if (!result.rowCount) throw new HttpError(404, 'Entorno no encontrado');
    await auditService.logAdminAction({ userId: req.admin?.id, action: 'delete_environment', entityType: 'project_environments', entity: environmentId, req });
    res.json({ ok: true });
  }),
);

const milestoneCreateSchema = z.object({
  title: z.string().trim().min(1).max(180),
  dueDate: z.string().date(),
  paymentPercentage: z.coerce.number().min(0).max(100),
  statusId: z.string().uuid(),
  quoteId: z.string().uuid().optional().nullable(),
  cancelPending: z.boolean().optional(),
});

projectsRouter.post(
  '/projects/:id/milestones',
  requireCsrf,
  requirePermission('admin.proyectos.manage'),
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = z.string().uuid().parse(req.params.id);
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    if (isRestrictedDeveloper) throw new HttpError(403, 'No tienes permiso para gestionar los hitos.');
    const body = milestoneCreateSchema.parse(req.body);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const projectData = await client.query('SELECT quote_id FROM projects WHERE id = $1', [projectId]);
      const activeQuoteId = body.quoteId || projectData.rows[0]?.quote_id;
      if (!activeQuoteId) throw new HttpError(400, 'El proyecto no tiene una cotización asignada para calcular hitos.');

      if (body.cancelPending) {
        await client.query(`
          UPDATE project_milestones
          SET status_id = (SELECT id FROM status_catalog WHERE code IN ('canceled', 'cancelled') AND domain = 'milestone' LIMIT 1)
          WHERE project_id = $1 AND quote_id = $2 
            AND status_id IN (SELECT id FROM status_catalog WHERE domain = 'milestone' AND code NOT IN ('completed', 'canceled', 'cancelled'))
        `, [projectId, activeQuoteId]);
        
        if (activeQuoteId === projectData.rows[0]?.quote_id) {
          await client.query(`UPDATE projects SET status_id = (SELECT id FROM status_catalog WHERE code = 'cancelled' AND domain = 'project'), updated_at = now() WHERE id = $1`, [projectId]);
        }
      }

      const sumResult = await client.query(
        `SELECT COALESCE(SUM(pm.payment_percentage), 0) as total 
         FROM project_milestones pm 
         JOIN status_catalog sc ON pm.status_id = sc.id 
         WHERE pm.project_id = $1 AND pm.quote_id = $2 AND sc.code != 'canceled'`,
        [projectId, activeQuoteId]
      );
      const currentTotal = parseFloat(sumResult.rows[0].total);
      if (currentTotal + body.paymentPercentage > 100) {
        throw new HttpError(400, 'El porcentaje total de los hitos para esta cotización no puede superar el 100%.');
      }

      const result = await client.query(
        `INSERT INTO project_milestones (project_id, title, due_date, payment_percentage, status_id, quote_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [projectId, body.title, body.dueDate, body.paymentPercentage, body.statusId, activeQuoteId],
      );
      await client.query('COMMIT');
      await auditService.logAdminAction({ userId: req.admin?.id, action: 'create_milestone', entityType: 'project_milestones', entity: result.rows[0], req });
      res.status(201).json({ id: result.rows[0].id });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }),
);

projectsRouter.get(
  '/projects/:id/milestones',
  requirePermission('admin.proyectos.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    if (isRestrictedDeveloper) {
      throw new HttpError(403, 'No tienes permiso para visualizar hitos del proyecto.');
    }
    const result = await pool.query(
      `SELECT pm.id, pm.project_id, pm.title, pm.due_date, pm.payment_percentage, pm.quote_id,
              pm.completed_at, pm.created_at, pm.updated_at,
              sc.code AS status, sc.name AS status_name, sc.is_terminal as "isTerminal",
              COALESCE(q.currency_code, p.currency_code) AS currency_code,
              COALESCE(payments_data.payments, '[]'::json) AS payments
       FROM project_milestones pm
       JOIN status_catalog sc ON pm.status_id = sc.id
       JOIN projects p ON pm.project_id = p.id
       LEFT JOIN quotes q ON pm.quote_id = q.id
       LEFT JOIN LATERAL (
         SELECT json_agg(json_build_object(
           'id', mp.id,
           'milestone_id', mp.milestone_id,
           'amount_paid', mp.amount_paid,
           'currency_code', mp.currency_code,
           'payment_method', mp.payment_method,
           'reference_number', mp.reference_number,
           'receipt_file_id', mp.receipt_file_id,
           'receipt_url', fa.public_url,
           'paid_at', mp.paid_at,
           'status', mp.status,
           'created_at', mp.created_at
         ) ORDER BY mp.created_at ASC) AS payments
         FROM milestone_payments mp
         LEFT JOIN file_assets fa ON mp.receipt_file_id = fa.id
         WHERE mp.milestone_id = pm.id AND mp.deleted_at IS NULL
       ) payments_data ON true
       WHERE pm.project_id = $1 AND sc.domain = 'milestone'
       ORDER BY pm.due_date ASC, pm.created_at ASC`,
      [id],
    );
    res.json({ items: result.rows });
  }),
);

const milestonePaymentSchema = z.object({
  amountPaid: z.coerce.number().min(0.01),
  paymentMethod: z.string().min(1).max(80),
  referenceNumber: z.string().max(180).optional().nullable(),
  paidAt: z.string().date(),
  splitRemaining: z.string().optional().transform(v => v === 'true'),
});

projectsRouter.post(
  '/projects/:id/milestones/:milestone_id/payments',
  requireCsrf,
  requirePermission('admin.proyectos.manage'),
  upload.single('receipt'),
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = z.string().uuid().parse(req.params.id);
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    if (isRestrictedDeveloper) throw new HttpError(403, 'No tienes permiso para gestionar hitos.');
    const milestoneId = z.string().uuid().parse(req.params.milestone_id);
    const body = milestonePaymentSchema.parse(req.body);
    const file = req.file;

    const client = await pool.connect();
    let cloudinaryAsset: CloudinaryStoredAsset | null = null;

    try {
      await client.query('BEGIN');

      const projectRes = await client.query(
        'SELECT project_code, currency_code FROM projects WHERE id = $1 AND deleted_at IS NULL',
        [projectId]
      );
      if (!projectRes.rowCount) throw new HttpError(404, 'Proyecto no encontrado.');
      const projectCode = projectRes.rows[0].project_code;
      const currencyCode = projectRes.rows[0].currency_code;

      let fileAssetId: string | null = null;

      if (file) {
        const validatedFile = await validateUpload(file);
        cloudinaryAsset = await uploadPaymentReceiptToCloudinary({
          buffer: file.buffer,
          projectCode,
          originalName: validatedFile.originalName,
          mimeType: validatedFile.mimeType,
        });

        const fileResult = await client.query(
          `INSERT INTO file_assets (
            original_name, storage_provider, storage_key, public_url,
            mime_type, byte_size, checksum_sha256, uploaded_by, created_by
          )
          VALUES ($1, 'cloudinary', $2, $3, $4, $5, $6, $7, $7)
          RETURNING id`,
          [
            validatedFile.originalName,
            cloudinaryAsset.publicId,
            cloudinaryAsset.secureUrl,
            validatedFile.mimeType,
            cloudinaryAsset.bytes || file.size,
            validatedFile.checksumSha256,
            req.admin?.id ?? null,
          ]
        );
        fileAssetId = fileResult.rows[0].id;
      }

      const milestoneRes = await client.query(`
        SELECT pm.payment_percentage, pm.quote_id, pm.title, pm.due_date, pm.status_id,
               q.total_amount, COALESCE(SUM(mp.amount_paid), 0) as total_paid,
               sc.id as completed_status_id
        FROM project_milestones pm
        LEFT JOIN quotes q ON q.id = pm.quote_id
        LEFT JOIN milestone_payments mp ON mp.milestone_id = pm.id AND mp.status = 'valid' AND mp.deleted_at IS NULL
        LEFT JOIN status_catalog sc ON sc.domain = 'milestone' AND sc.code = 'completed'
        WHERE pm.id = $1
        GROUP BY pm.payment_percentage, pm.quote_id, pm.title, pm.due_date, pm.status_id, q.total_amount, sc.id
      `, [milestoneId]);

      if (!milestoneRes.rowCount) throw new HttpError(404, 'Hito no encontrado.');
      const { payment_percentage, total_amount, total_paid, title, due_date, status_id: original_status_id, completed_status_id, quote_id } = milestoneRes.rows[0];
      
      const amountExpected = Number(total_amount) * (Number(payment_percentage) / 100);
      const amountPaidCurrently = Number(total_paid);
      const maxPaymentAllowed = amountExpected - amountPaidCurrently;

      if (Math.round(body.amountPaid * 100) > Math.round(maxPaymentAllowed * 100)) {
        throw new HttpError(400, `El pago excede el saldo restante del hito. Máximo permitido: ${maxPaymentAllowed.toFixed(2)}`);
      }

      const result = await client.query(
        `INSERT INTO milestone_payments (
          milestone_id, amount_paid, currency_code, payment_method,
          reference_number, receipt_file_id, paid_at, status, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'valid', $8)
        RETURNING *`,
        [
          milestoneId,
          body.amountPaid,
          currencyCode,
          body.paymentMethod,
          body.referenceNumber || null,
          fileAssetId,
          body.paidAt,
          req.admin?.id ?? null,
        ]
      );
      const paymentRow = result.rows[0];

      const isFullPayment = Math.round(body.amountPaid * 100) >= Math.round(maxPaymentAllowed * 100);
      if (isFullPayment && completed_status_id) {
         await client.query(`UPDATE project_milestones SET status_id = $1, completed_at = NOW() WHERE id = $2`, [completed_status_id, milestoneId]);
         await auditService.logAdminAction({ userId: req.admin?.id, action: 'update_milestone_status_auto', entityType: 'project_milestones', entity: milestoneId, req });
      } else if (body.splitRemaining && !isFullPayment) {
         const paidPercentage = ((amountPaidCurrently + body.amountPaid) / Number(total_amount)) * 100;
         const remainingPercentage = Number(payment_percentage) - paidPercentage;
         
         await client.query(`UPDATE project_milestones SET payment_percentage = $1, status_id = $2, completed_at = NOW() WHERE id = $3`, [paidPercentage, completed_status_id, milestoneId]);
         
         await client.query(
           `INSERT INTO project_milestones (project_id, quote_id, title, due_date, payment_percentage, status_id)
            VALUES ($1, $2, $3, $4, $5, $6)`,
           [projectId, quote_id, `Restante del pago de ${title}`, due_date, remainingPercentage, original_status_id]
         );
         await auditService.logAdminAction({ userId: req.admin?.id, action: 'split_milestone_auto', entityType: 'project_milestones', entity: milestoneId, req });
      }

      await client.query('COMMIT');
      await auditService.logAdminAction({ userId: req.admin?.id, action: 'create_milestone_payment', entityType: 'milestone_payments', entity: paymentRow, req });
      res.status(201).json({ id: paymentRow.id });
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      if (cloudinaryAsset) {
        await deleteCloudinaryAsset(cloudinaryAsset.publicId, cloudinaryAsset.resourceType).catch(() => undefined);
      }
      throw error;
    } finally {
      client.release();
    }
  }),
);
projectsRouter.get(
  '/projects/:id/assignments',
  requirePermission('admin.proyectos.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = z.string().uuid().parse(req.params.id);
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    if (isRestrictedDeveloper) {
      const assignmentCheck = await pool.query('SELECT 1 FROM project_assignments WHERE project_id = $1 AND user_id = $2', [projectId, req.admin?.id]);
      if (assignmentCheck.rowCount === 0) throw new HttpError(403, 'No tienes permiso para ver asignaciones de un proyecto ajeno.');
    }
    const result = await pool.query(
      `SELECT pa.project_id, pa.user_id, pa.role, pa.assigned_at, u.name, u.email
       FROM project_assignments pa
       JOIN admin_users u ON u.id = pa.user_id
       WHERE pa.project_id = $1
       ORDER BY pa.assigned_at DESC, u.name ASC`,
      [projectId],
    );
    res.json({ items: result.rows });
  }),
);

projectsRouter.post(
  '/projects/:id/assignments',
  requireCsrf,
  requirePermission('admin.proyectos.assign'),
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = z.string().uuid().parse(req.params.id);
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    if (isRestrictedDeveloper) {
      throw new HttpError(403, 'Solo los administradores pueden gestionar las asignaciones de equipo.');
    }
    const body = z.object({
      userId: z.string().uuid(),
      role: z.string().trim().max(120).optional().nullable(),
    }).parse(req.body);
    const result = await pool.query(
      `INSERT INTO project_assignments (project_id, user_id, role, assigned_at)
       SELECT p.id, u.id, $3, now()
       FROM projects p
       JOIN admin_users u ON u.id = $2 AND u.deleted_at IS NULL AND u.is_active = true
       WHERE p.id = $1 AND p.deleted_at IS NULL
       ON CONFLICT (project_id, user_id)
       DO UPDATE SET role = EXCLUDED.role, assigned_at = now()
       RETURNING project_id, user_id, role, assigned_at`,
      [projectId, body.userId, body.role || null],
    );
    if (!result.rowCount) throw new HttpError(400, 'Proyecto o usuario invalido.');
    await auditService.logAdminAction({ userId: req.admin?.id, action: 'assign_project_user', entityType: 'project_assignments', entity: projectId, req });
    res.status(201).json({ item: result.rows[0] });
  }),
);

projectsRouter.delete(
  '/projects/:id/assignments/:userId',
  requireCsrf,
  requirePermission('admin.proyectos.assign'),
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = z.string().uuid().parse(req.params.id);
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    if (isRestrictedDeveloper) {
      throw new HttpError(403, 'Solo los administradores pueden gestionar las asignaciones de equipo.');
    }
    const userId = z.string().uuid().parse(req.params.userId);
    const result = await pool.query(
      'DELETE FROM project_assignments WHERE project_id = $1 AND user_id = $2 RETURNING user_id',
      [projectId, userId]
    );
    if (!result.rowCount) throw new HttpError(404, 'Asignación no encontrada.');
    await auditService.logAdminAction({ userId: req.admin?.id, action: 'remove_project_user', entityType: 'project_assignments', entity: projectId, req });
    res.json({ ok: true });
  }),
);

projectsRouter.patch(
  '/projects/:id/milestones/:milestone_id',
  requireCsrf,
  requirePermission('admin.proyectos.manage'),
  requireNonTerminalState('projects'),
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = z.string().uuid().parse(req.params.id);
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    if (isRestrictedDeveloper) throw new HttpError(403, 'No tienes permiso para gestionar hitos.');
    const milestoneId = z.string().uuid().parse(req.params.milestone_id);
    const body = projectStatusSchema.parse(req.body);
    const result = await pool.query(
      `UPDATE project_milestones pm
       SET status_id = sc.id,
           completed_at = CASE WHEN sc.code = 'completed' THEN COALESCE(pm.completed_at, now()) ELSE NULL END,
           updated_at = now()
       FROM status_catalog sc
       WHERE pm.id = $1 AND pm.project_id = $2
         AND sc.domain = 'milestone' AND sc.code = $3 AND sc.is_active = true
       RETURNING pm.id`,
      [milestoneId, projectId, body.status],
    );
    if (!result.rowCount) throw new HttpError(400, 'Hito o estado invalido.');
    await auditService.logAdminAction({ userId: req.admin?.id, action: 'update_milestone_status', entityType: 'project_milestones', entity: milestoneId, req });
    res.json({ ok: true });
  }),
);

projectsRouter.get(
  '/projects/:id/commits',
  requirePermission('admin.proyectos.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    if (isRestrictedDeveloper) {
      const assignmentCheck = await pool.query('SELECT 1 FROM project_assignments WHERE project_id = $1 AND user_id = $2', [id, req.admin?.id]);
      if (assignmentCheck.rowCount === 0) throw new HttpError(403, 'No tienes permiso para ver commits de un proyecto ajeno.');
    }
    const result = await pool.query(
      `SELECT id, project_id, commit_hash, message, author_name, author_email,
              branch, github_url, committed_at, created_at
       FROM project_commits WHERE project_id = $1
       ORDER BY COALESCE(committed_at, created_at) DESC LIMIT 100`,
      [id],
    );
    res.json({ items: result.rows });
  }),
);

projectsRouter.get(
  '/projects/:id/history',
  requirePermission('admin.proyectos.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    if (isRestrictedDeveloper) {
      const parsedId = z.string().uuid().parse(req.params.id);
      const assignmentCheck = await pool.query('SELECT 1 FROM project_assignments WHERE project_id = $1 AND user_id = $2', [parsedId, req.admin?.id]);
      if (assignmentCheck.rowCount === 0) throw new HttpError(403, 'No tienes permiso para ver el historial de un proyecto ajeno.');
    }
    const result = await pool.query(
      statusHistorySelect('project_status_history', 'project_id'),
      [z.string().uuid().parse(req.params.id)],
    );
    res.json({ items: result.rows });
  }),
);

projectsRouter.get(
  '/projects/:id/adendas',
  requirePermission('admin.proyectos.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    if (isRestrictedDeveloper) {
      const assignmentCheck = await pool.query('SELECT 1 FROM project_assignments WHERE project_id = $1 AND user_id = $2', [id, req.admin?.id]);
      if (assignmentCheck.rowCount === 0) throw new HttpError(403, 'No tienes permiso para ver adendas de un proyecto ajeno.');
    }
    const projectRes = await pool.query('SELECT customer_id FROM projects WHERE id = $1', [id]);
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


projectsRouter.delete(
  '/projects/:id/milestones/:milestone_id',
  requireCsrf,
  requirePermission('admin.proyectos.manage'),
  requireNonTerminalState('projects'),
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = z.string().uuid().parse(req.params.id);
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    if (isRestrictedDeveloper) throw new HttpError(403, 'No tienes permiso para eliminar hitos.');
    const milestoneId = z.string().uuid().parse(req.params.milestone_id);
    
    const checkRes = await pool.query('SELECT COUNT(*) as count FROM milestone_payments WHERE milestone_id = $1 AND status != \'rejected\'', [milestoneId]);
    if (Number(checkRes.rows[0].count) > 0) {
      throw new HttpError(400, 'No se puede eliminar un hito que ya tiene pagos registrados.');
    }
    
    const result = await pool.query('DELETE FROM project_milestones WHERE id = $1 AND project_id = $2 RETURNING id', [milestoneId, projectId]);
    if (result.rowCount === 0) throw new HttpError(404, 'Hito no encontrado.');
    
    await auditService.logAdminAction({ userId: req.admin?.id, action: 'delete_milestone', entityType: 'project_milestones', entity: milestoneId, req });
    res.status(200).json({ success: true });
  })
);


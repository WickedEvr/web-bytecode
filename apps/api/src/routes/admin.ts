import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import type { PoolClient } from 'pg';
import { z } from 'zod';
import { env } from '../config/env.js';
import { pool } from '../db/pool.js';
import {
  deleteCloudinaryAsset,
  uploadPortfolioImageToCloudinary,
  type CloudinaryStoredAsset,
} from '../lib/cloudinary.js';
import { validateUpload } from '../lib/validateUpload.js';
import { requireAdmin, requirePermission, requireSuperAdmin } from '../middleware/auth.js';
import { requireCsrf } from '../middleware/csrf.js';
import { requireNonTerminalState } from '../middleware/requireNonTerminalState.js';
import { auditService } from '../services/audit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import {
  createBusinessCode,
  getProjectStatusInfo,
  paginationQuerySchema,
  statusHistorySelect,
  upload,
  type Queryable,
} from './admin/shared.js';
import { quotesRouter } from './admin/quotes.js';
import { projectsRouter } from './admin/projects.js';
import { accessRouter, settingsRouter, usersRouter } from './admin/access.js';

const router = Router();

router.use(requireAdmin);

const optionalImageUpload = (req: Request, res: Response, next: NextFunction) => {
  if (req.is('multipart/form-data')) {
    upload.single('image')(req, res, next);
    return;
  }

  next();
};

router.use('/', accessRouter);
const listQuerySchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(9),
  offset: z.coerce.number().int().min(0).default(0),
});

const updateSchema = z.object({
  status: z.string().trim().min(1).max(80).optional(),
  adminNotes: z.string().max(3000).optional(),
});

const contactColumns = `
  c.id,
  c.case_code,
  cu.first_name as nombre,
  cu.last_name as apellido,
  COALESCE(co.position_title, NULLIF(trim((regexp_match(c.message, 'Cargo:[[:space:]]*([^[:cntrl:]]+)'))[1]), ''), '') as cargo,
  cu.primary_email as email,
  cu.primary_phone as celular,
  COALESCE(o.legal_name, NULLIF(trim((regexp_match(c.message, 'Empresa:[[:space:]]*([^[:cntrl:]]+)'))[1]), ''), '') as empresa,
  COALESCE(o.ruc, NULLIF(trim((regexp_match(c.message, 'RUC:[[:space:]]*([^[:cntrl:]]+)'))[1]), ''), '') as ruc,
  COALESCE(s.name, c.subject) as servicio,
  c.message,
  sc.code as status,
  sc.name as status_name,
  c.internal_notes as admin_notes, 
  c.assigned_to, c.created_at, c.updated_at
`;

const contactJoins = `
  JOIN customers cu ON c.customer_id = cu.id
  JOIN status_catalog sc ON c.status_id = sc.id
  LEFT JOIN organizations o ON c.organization_id = o.id
  LEFT JOIN service_catalog s ON c.service_id = s.id
  LEFT JOIN customer_organizations co ON co.customer_id = c.customer_id
    AND co.organization_id = c.organization_id
    AND co.deleted_at IS NULL
`;

const legacyContactColumns = `
  c.id,
  c.case_code,
  cu.first_name as nombre,
  cu.last_name as apellido,
  COALESCE(NULLIF(trim((regexp_match(c.message, 'Cargo:[[:space:]]*([^[:cntrl:]]+)'))[1]), ''), '') as cargo,
  cu.primary_email as email,
  cu.primary_phone as celular,
  COALESCE(NULLIF(trim((regexp_match(c.message, 'Empresa:[[:space:]]*([^[:cntrl:]]+)'))[1]), ''), '') as empresa,
  COALESCE(NULLIF(trim((regexp_match(c.message, 'RUC:[[:space:]]*([^[:cntrl:]]+)'))[1]), ''), '') as ruc,
  c.subject as servicio,
  c.message,
  sc.code as status,
  sc.name as status_name,
  c.internal_notes as admin_notes,
  c.assigned_to, c.created_at, c.updated_at
`;

const legacyContactJoins = `
  JOIN customers cu ON c.customer_id = cu.id
  JOIN status_catalog sc ON c.status_id = sc.id
`;

let normalizedContactSchema: boolean | null = null;

const hasNormalizedContactSchema = async () => {
  if (normalizedContactSchema !== null) return normalizedContactSchema;

  const result = await pool.query(`
    SELECT
      to_regclass('public.organizations') IS NOT NULL AS has_organizations,
      to_regclass('public.customer_organizations') IS NOT NULL AS has_customer_organizations,
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'contact_cases' AND column_name = 'organization_id'
      ) AS has_organization_id,
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'contact_cases' AND column_name = 'service_id'
      ) AS has_service_id
  `);

  const row = result.rows[0];
  normalizedContactSchema = Boolean(
    row?.has_organizations &&
    row?.has_customer_organizations &&
    row?.has_organization_id &&
    row?.has_service_id,
  );

  return normalizedContactSchema;
};

const complaintColumns = `
  c.id, c.complaint_code as code, cu.first_name as nombres, cu.last_name as apellidos, 
  '' as domicilio, '' as tipo_doc, '' as numero_doc, '' as prefijo_telefono, 
  cu.primary_phone as telefono, cu.primary_email as email, '' as person_type, 
  cg.good_type, cg.claimed_amount as monto_cuantificable, cg.description as descripcion, 
  '' as nombre_unidad, '' as opcion_bien, ct.name as claim_type, cg.category as tipo_reclamo, 
  cd.incident_detail as detalle, cd.requested_solution as pedido, sc.code as status,
  sc.name as status_name,
  c.internal_notes as admin_notes, fa.original_name as attachment_original_name, 
  fa.mime_type as attachment_mime_type, fa.byte_size as attachment_size,
  c.assigned_to, c.created_at, c.updated_at
`;

const buildWhere = (status?: string, search?: string, fields: string[] = []) => {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (status) {
    params.push(status);
    clauses.push(`sc.code = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    const index = params.length;
    clauses.push(`(${fields.map((field) => `${field} ILIKE $${index}`).join(' OR ')})`);      
  }

  return {
    whereSql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
  };
};

router.get(
  '/stats',
  requirePermission('admin.dashboard.view'),
  asyncHandler(async (_req: Request, res: Response) => {
    const [contactsStats, complaintsStats, recentContacts, recentComplaints, activeAdmins] = await Promise.all([
      pool.query('SELECT sc.code as status, count(*)::int AS total FROM contact_cases c JOIN status_catalog sc ON c.status_id = sc.id GROUP BY sc.code'),
      pool.query('SELECT sc.code as status, count(*)::int AS total FROM complaints c JOIN status_catalog sc ON c.status_id = sc.id GROUP BY sc.code'),
      pool.query(`SELECT c.id, cu.first_name as nombre, cu.primary_email as email, sc.code as status, c.created_at FROM contact_cases c JOIN customers cu ON c.customer_id = cu.id JOIN status_catalog sc ON c.status_id = sc.id ORDER BY c.created_at DESC LIMIT 5`),
      pool.query(`SELECT c.id, c.complaint_code as code, cu.first_name as nombre, cu.primary_email as email, sc.code as status, c.created_at FROM complaints c JOIN customers cu ON c.customer_id = cu.id JOIN status_catalog sc ON c.status_id = sc.id ORDER BY c.created_at DESC LIMIT 5`),
      pool.query(`SELECT count(*)::int AS total FROM admin_users WHERE is_active = true`),
    ]);

    res.json({
      contactsStats: contactsStats.rows,
      complaintsStats: complaintsStats.rows,
      recentContacts: recentContacts.rows,
      recentComplaints: recentComplaints.rows,
      activeAdminsTotal: activeAdmins.rows[0].total,
    });
  }),
);

router.get(
  '/contacts',
  requirePermission('admin.contactos.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const query = listQuerySchema.parse(req.query);
    const normalized = await hasNormalizedContactSchema();
    const contactSearchFields = normalized
      ? ['cu.first_name', 'cu.last_name', 'cu.primary_email', 'cu.primary_phone', 'c.subject', 'c.message', 'o.legal_name', 'o.ruc', 'co.position_title', 's.name']
      : ['cu.first_name', 'cu.last_name', 'cu.primary_email', 'cu.primary_phone', 'c.subject', 'c.message'];
    const { whereSql, params } = buildWhere(query.status, query.search, contactSearchFields);
    const [result, countResult] = await Promise.all([pool.query(
      `
      SELECT ${normalized ? contactColumns : legacyContactColumns}
      FROM contact_cases c
      ${normalized ? contactJoins : legacyContactJoins}
      ${whereSql}
      ORDER BY c.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
      [...params, query.limit, query.offset],
    ), pool.query(
      `SELECT count(*)::int AS total FROM (
         SELECT DISTINCT c.id
         FROM contact_cases c
         ${normalized ? contactJoins : legacyContactJoins}
         ${whereSql}
       ) records`,
      params,
    )]);

    res.json({ data: result.rows, total: countResult.rows[0].total });
  }),
);

router.get(
  '/contacts/:id',
  requirePermission('admin.contactos.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const normalized = await hasNormalizedContactSchema();
    const result = await pool.query(
      `SELECT ${normalized ? contactColumns : legacyContactColumns} FROM contact_cases c ${normalized ? contactJoins : legacyContactJoins} WHERE c.id = $1`, 
      [id]
    );
    if (result.rowCount === 0) throw new HttpError(404, 'Mensaje no encontrado.');
    res.json({ item: result.rows[0] });
  }),
);

router.patch(
  '/contacts/:id',
  requireCsrf,
  requirePermission('admin.contactos.manage'),
  requireNonTerminalState('contact_cases'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const body = updateSchema.parse(req.body);
    const normalized = await hasNormalizedContactSchema();
    const client = await pool.connect();
    let currentRow: Record<string, unknown>;
    let updatedRow: Record<string, unknown>;

    try {
      await client.query('BEGIN');
      const current = await client.query('SELECT * FROM contact_cases WHERE id = $1 FOR UPDATE', [id]);
      if (current.rowCount === 0) throw new HttpError(404, 'Mensaje no encontrado.');
      currentRow = current.rows[0];

      let newStatusId: string | undefined;
      if (body.status) {
        const statusResult = await client.query(
          "SELECT id FROM status_catalog WHERE domain = 'case' AND code = $1 AND is_active = true",
          [body.status],
        );
        if (!statusResult.rowCount) throw new HttpError(400, 'Estado de contacto invalido.');
        newStatusId = statusResult.rows[0].id;
      }

      const result = await client.query(
        `UPDATE contact_cases
         SET status_id = COALESCE($2, status_id),
             internal_notes = COALESCE($3, internal_notes),
             updated_at = now()
         WHERE id = $1
         RETURNING id`,
        [id, newStatusId ?? null, body.adminNotes ?? null],
      );
      if (result.rowCount === 0) throw new HttpError(404, 'Mensaje no encontrado.');

      const oldStatusId = currentRow.status_id as string | undefined;
      if (oldStatusId && newStatusId && oldStatusId !== newStatusId) {
        await client.query(
          `INSERT INTO contact_case_status_history (contact_case_id, old_status_id, new_status_id, changed_by)
           VALUES ($1, $2, $3, $4)`,
          [id, oldStatusId, newStatusId, req.admin?.id ?? null],
        );
      }

      const updated = await client.query(
        `SELECT ${normalized ? contactColumns : legacyContactColumns} FROM contact_cases c ${normalized ? contactJoins : legacyContactJoins} WHERE c.id = $1`,
        [id],
      );
      updatedRow = updated.rows[0];
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    await auditService.logAdminAction({
        userId: req.admin?.id,
        action: 'update',
        entityType: 'contact_submission',
        entity: updatedRow,
        previousState: currentRow,
        req
    });

    res.json({ item: updatedRow });
  }),
);

const assignSchema = z.object({
  assigned_to: z.string().uuid(),
  notes: z.string().max(3000).optional(),
});

router.post(
  '/contacts/:id/assign',
  requireCsrf,
  requirePermission('admin.contactos.assign'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const body = assignSchema.parse(req.body);
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const current = await client.query('SELECT * FROM contact_cases WHERE id = $1', [id]);
      if (current.rowCount === 0) throw new HttpError(404, 'Mensaje no encontrado.');

      await client.query(
        'UPDATE contact_case_assignments SET unassigned_at = NOW() WHERE contact_case_id = $1 AND unassigned_at IS NULL',
        [id]
      );
      
      await client.query(
        'INSERT INTO contact_case_assignments (contact_case_id, assigned_to, assigned_by, notes) VALUES ($1, $2, $3, $4)',
        [id, body.assigned_to, req.admin?.id, body.notes ?? null]
      );
      
      const updateResult = await client.query(
        'UPDATE contact_cases SET assigned_to = $2, updated_at = NOW() WHERE id = $1 RETURNING id',
        [id, body.assigned_to]
      );
      
      if (updateResult.rowCount === 0) {
        throw new HttpError(404, 'Mensaje no encontrado.');
      }
      
      await client.query('COMMIT');

      
      const normalized = await hasNormalizedContactSchema();
      const updated = await client.query(
        `SELECT ${normalized ? contactColumns : legacyContactColumns} FROM contact_cases c ${normalized ? contactJoins : legacyContactJoins} WHERE c.id = $1`, 
        [id]
      );

      await auditService.logAdminAction({
        userId: req.admin?.id,
        action: 'assign',
        entityType: 'contact_submission',
        entity: updated.rows[0],
        previousState: current.rows[0],
        req
      });

      res.json({ item: updated.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }),
);

router.get(
  '/contacts/:id/assignment-history',
  requirePermission('admin.contactos.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await pool.query(
      `SELECT a.*, u1.name as assigned_to_name, u2.name as assigned_by_name 
      FROM contact_case_assignments a 
      JOIN admin_users u1 ON a.assigned_to = u1.id 
      LEFT JOIN admin_users u2 ON a.assigned_by = u2.id 
      WHERE a.contact_case_id = $1 
      ORDER BY a.assigned_at DESC`,
      [id]
    );
    res.json({ items: result.rows });
  }),
);

router.get(
  '/contacts/:id/history',
  requirePermission('admin.contactos.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query(
      statusHistorySelect('contact_case_status_history', 'contact_case_id'),
      [String(req.params.id)],
    );
    res.json({ items: result.rows });
  }),
);

router.get(
  '/complaints',
  requirePermission('admin.reclamos.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const query = listQuerySchema.parse(req.query);
    const { whereSql, params } = buildWhere(query.status, query.search, [
      'c.complaint_code',
      'cu.first_name',
      'cu.last_name',
      'cu.primary_email',
      'cg.category'
    ]);
    const [result, countResult] = await Promise.all([pool.query(
      `
      SELECT c.id, c.complaint_code as code, cu.first_name as nombres, cu.last_name as apellidos, cu.primary_email as email, cu.primary_phone as telefono, ct.name as claim_type, cg.category as tipo_reclamo, sc.code AS status, sc.name AS status_name, sc.is_terminal as "isTerminal", fa.original_name as attachment_original_name, c.created_at, c.updated_at
      FROM complaints c
      JOIN customers cu ON c.customer_id = cu.id
      JOIN status_catalog sc ON c.status_id = sc.id
      JOIN complaint_types ct ON c.complaint_type_id = ct.id
      LEFT JOIN complaint_goods cg ON c.id = cg.complaint_id
      LEFT JOIN complaint_evidences ce ON c.id = ce.complaint_id
      LEFT JOIN file_assets fa ON ce.file_asset_id = fa.id
      ${whereSql}
      ORDER BY c.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
      [...params, query.limit, query.offset],
    ), pool.query(
      `SELECT count(*)::int AS total FROM (
         SELECT DISTINCT c.id
         FROM complaints c
         JOIN customers cu ON c.customer_id = cu.id
         JOIN status_catalog sc ON c.status_id = sc.id
         LEFT JOIN complaint_goods cg ON c.id = cg.complaint_id
         ${whereSql}
       ) records`,
      params,
    )]);

    res.json({ data: result.rows, total: countResult.rows[0].total });
  }),
);

router.get(
  '/complaints/:id/history',
  requirePermission('admin.reclamos.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query(
      statusHistorySelect('complaint_status_history', 'complaint_id'),
      [String(req.params.id)],
    );
    res.json({ items: result.rows });
  }),
);

router.get(
  '/complaints/:id',
  requirePermission('admin.reclamos.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await pool.query(
      `SELECT ${complaintColumns} 
      FROM complaints c
      JOIN customers cu ON c.customer_id = cu.id
      JOIN status_catalog sc ON c.status_id = sc.id
      JOIN complaint_types ct ON c.complaint_type_id = ct.id
      LEFT JOIN complaint_details cd ON c.id = cd.complaint_id
      LEFT JOIN complaint_goods cg ON c.id = cg.complaint_id
      LEFT JOIN complaint_evidences ce ON c.id = ce.complaint_id
      LEFT JOIN file_assets fa ON ce.file_asset_id = fa.id
      WHERE c.id = $1`, 
      [id]
    );
    if (result.rowCount === 0) throw new HttpError(404, 'Reclamo no encontrado.');
    res.json({ item: result.rows[0] });
  }),
);

router.patch(
  '/complaints/:id',
  requireCsrf,
  requirePermission('admin.reclamos.manage'),
  requireNonTerminalState('complaints'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const body = updateSchema.parse(req.body);
    const client = await pool.connect();
    let currentRow: Record<string, unknown>;
    let updatedRow: Record<string, unknown>;

    try {
      await client.query('BEGIN');
      const current = await client.query(
        'SELECT id, status_id, internal_notes, assigned_to, updated_at FROM complaints WHERE id = $1 FOR UPDATE',
        [id],
      );
      if (current.rowCount === 0) throw new HttpError(404, 'Reclamo no encontrado.');
      currentRow = current.rows[0];

      let newStatusId: string | undefined;
      if (body.status) {
        const statusResult = await client.query(
          "SELECT id FROM status_catalog WHERE domain = 'complaint' AND code = $1 AND is_active = true",
          [body.status],
        );
        if (!statusResult.rowCount) throw new HttpError(400, 'Estado de reclamo invalido.');
        newStatusId = statusResult.rows[0].id;
      }

      const result = await client.query(
        `UPDATE complaints
         SET status_id = COALESCE($2, status_id),
             internal_notes = COALESCE($3, internal_notes),
             updated_at = now()
         WHERE id = $1
         RETURNING id`,
        [id, newStatusId ?? null, body.adminNotes ?? null],
      );
      if (result.rowCount === 0) throw new HttpError(404, 'Reclamo no encontrado.');

      const oldStatusId = currentRow.status_id as string | undefined;
      if (oldStatusId && newStatusId && oldStatusId !== newStatusId) {
        await client.query(
          `INSERT INTO complaint_status_history (complaint_id, old_status_id, new_status_id, changed_by)
           VALUES ($1, $2, $3, $4)`,
          [id, oldStatusId, newStatusId, req.admin?.id ?? null],
        );
      }

      const updated = await client.query(
        `SELECT ${complaintColumns}
         FROM complaints c
         JOIN customers cu ON c.customer_id = cu.id
         JOIN status_catalog sc ON c.status_id = sc.id
         JOIN complaint_types ct ON c.complaint_type_id = ct.id
         LEFT JOIN complaint_details cd ON c.id = cd.complaint_id
         LEFT JOIN complaint_goods cg ON c.id = cg.complaint_id
         LEFT JOIN complaint_evidences ce ON c.id = ce.complaint_id
         LEFT JOIN file_assets fa ON ce.file_asset_id = fa.id
         WHERE c.id = $1`,
        [id],
      );
      updatedRow = updated.rows[0];
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    await auditService.logAdminAction({
      userId: req.admin?.id,
      action: 'update',
      entityType: 'complaint',
      entity: updatedRow,
      previousState: currentRow,
      req
    });

    res.json({ item: updatedRow });
  }),
);

router.get(
  '/complaints/:id/attachment',
  requirePermission('admin.reclamos.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await pool.query(
      `
      SELECT fa.original_name, fa.mime_type, fa.storage_provider, fa.storage_key, fa.public_url
      FROM complaints c
      JOIN complaint_evidences ce ON c.id = ce.complaint_id
      JOIN file_assets fa ON ce.file_asset_id = fa.id
      WHERE c.id = $1
      `,
      [id],
    );

    if (result.rowCount === 0) throw new HttpError(404, 'Reclamo o adjunto no encontrado.');

    const item = result.rows[0];
    const downloadUrl = item.public_url ?? (typeof item.storage_key === 'string' && item.storage_key.startsWith('https://') ? item.storage_key : null);
    if (item.storage_provider !== 'cloudinary' || !downloadUrl) {
      throw new HttpError(404, 'Adjunto no disponible en almacenamiento persistente.');
    }

    await auditService.logAdminAction({
      userId: req.admin?.id,
      action: 'download_attachment',
      entityType: 'complaint',
      entity: id,
      req
    });
    res.redirect(302, downloadUrl);
  }),
);

router.use('/', usersRouter);
router.use('/', settingsRouter);
// --- Logs Endpoints ---

router.get(
  '/logs',
  requirePermission('admin.auditoria.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const query = listQuerySchema.parse(req.query);
    const [result, countResult] = await Promise.all([
      pool.query(
        `
        SELECT l.id, l.action, l.entity_type, l.entity_id, l.ip_address, l.user_agent, l.details, l.created_at, u.name as admin_name, u.email as admin_email
        FROM admin_audit_logs l
        LEFT JOIN admin_users u ON l.admin_id = u.id
        ORDER BY l.created_at DESC
        LIMIT $1 OFFSET $2
        `,
        [query.limit, query.offset]
      ),
      pool.query('SELECT COUNT(*)::int AS total FROM admin_audit_logs'),
    ]);

    const items = result.rows.map((row) => ({
      id: row.id,
      action: row.action,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details,
      created_at: row.created_at,
      admin_name: row.admin_name,
      admin_email: row.admin_email,
    }));

    res.json({
      items,
      total: countResult.rows[0]?.total ?? 0,
      limit: query.limit,
      offset: query.offset,
    });
  })
);

// --- CMS Endpoints ---

const cmsPageUpdateSchema = z.object({
  title: z.string().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  status: z.string().trim().min(1).max(80).optional(),
});

const cmsPageCreateSchema = z.object({
  slug: z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1).max(180),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  status: z.string().trim().min(1).max(80),
});

const getCmsStatusId = async (client: Queryable, code: string) => {
  const result = await client.query(
    "SELECT id FROM status_catalog WHERE domain = 'cms' AND code = $1 AND is_active = true LIMIT 1",
    [code],
  );

  if (result.rowCount === 0) {
    throw new HttpError(400, `Estado CMS invalido: ${code}.`);
  }

  return result.rows[0].id as string;
};

const cmsPageSelectSql = `
  SELECT
    cp.id,
    cp.slug,
    cp.title,
    cp.meta_title,
    cp.meta_description,
    sc.code AS status,
    sc.name AS status_name,
    cp.created_at,
    cp.updated_at
  FROM cms_pages cp
  JOIN status_catalog sc ON cp.status_id = sc.id
  WHERE cp.deleted_at IS NULL AND sc.domain = 'cms'
`;

router.get(
  '/cms/pages',
  requirePermission('admin.cms.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const { limit, offset } = paginationQuerySchema.parse(req.query);
    const [result, countResult] = await Promise.all([pool.query(
      `${cmsPageSelectSql}
       ORDER BY cp.slug
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    ), pool.query('SELECT count(*)::int AS total FROM cms_pages WHERE deleted_at IS NULL')]);
    res.json({ data: result.rows, total: countResult.rows[0].total });
  })
);

router.post(
  '/cms/pages',
  requireCsrf,
  requirePermission('admin.cms.manage'),
  asyncHandler(async (req: Request, res: Response) => {
    const body = cmsPageCreateSchema.parse(req.body);
    const statusInfo = await getProjectStatusInfo(pool, body.status);
    const statusId = statusInfo.id;
    const result = await pool.query(
      `INSERT INTO cms_pages (slug, title, meta_title, meta_description, status_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [body.slug, body.title, body.meta_title ?? null, body.meta_description ?? null, statusId, req.admin?.id ?? null],
    );
    const created = await pool.query(`${cmsPageSelectSql} AND cp.id = $1`, [result.rows[0].id]);
    res.status(201).json({ item: created.rows[0] });
  }),
);

router.patch(
  '/cms/pages/:id',
  requireCsrf,
  requirePermission('admin.cms.manage'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const body = cmsPageUpdateSchema.parse(req.body);
    const statusId = body.status ? await getCmsStatusId(pool, body.status) : null;

    const current = await pool.query('SELECT * FROM cms_pages WHERE id = $1', [id]);
    if (current.rowCount === 0) throw new HttpError(404, 'Página no encontrada.');

    const result = await pool.query(
      `UPDATE cms_pages
       SET title = COALESCE($2, title),
           meta_title = COALESCE($3, meta_title),
           meta_description = COALESCE($4, meta_description),
           status_id = COALESCE($5, status_id),
           updated_at = now()
       WHERE id = $1
       RETURNING id`,
      [id, body.title ?? null, body.meta_title ?? null, body.meta_description ?? null, statusId],
    );
    const updated = await pool.query(`${cmsPageSelectSql} AND cp.id = $1`, [result.rows[0].id]);

    await auditService.logAdminAction({
      userId: req.admin?.id,
      action: 'update',
      entityType: 'cms_page',
      entity: updated.rows[0],
      previousState: current.rows[0],
      req
    });
    res.json({ item: updated.rows[0] });
  })
);

// --- Portfolio Endpoints ---

const normalizeWebsiteUrl = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return undefined;
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`;
  return `https://www.${trimmed}`;
};

const optionalUrl = z.preprocess(
  normalizeWebsiteUrl,
  z.string().url().max(255).optional(),
);

const parseBooleanField = (value: unknown) => {
  if (typeof value !== 'string') return value;
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  return value;
};

const parseTechnologyIds = (value: unknown) => {
  if (value === undefined || value === null || value === '') return [];
  if (Array.isArray(value)) return value;

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }

  return value;
};

const parseOptionalTechnologyIds = (value: unknown) => {
  if (value === undefined) return undefined;
  return parseTechnologyIds(value);
};

const portfolioBoolean = (defaultValue: boolean) =>
  z.preprocess(parseBooleanField, z.boolean().default(defaultValue));

const technologyIdsSchema = z.preprocess(parseTechnologyIds, z.array(z.string().uuid()));
const optionalTechnologyIdsSchema = z.preprocess(parseOptionalTechnologyIds, z.array(z.string().uuid()).optional());

const portfolioItemSchema = z.object({
  name: z.string().trim().min(2).max(180),
  clientName: z.string().trim().max(180).optional().default(''),
  description: z.string().trim().max(2000).optional().default(''),
  websiteUrl: optionalUrl,
  sortOrder: z.coerce.number().int().min(0).max(100000).default(0),
  isFeatured: portfolioBoolean(true),
  status: z.string().trim().min(1).max(80),
  technologyIds: technologyIdsSchema,
});

const portfolioItemUpdateSchema = portfolioItemSchema.partial().extend({
  technologyIds: optionalTechnologyIdsSchema,
});

const technologyCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  sortOrder: z.coerce.number().int().min(0).max(100000).default(0),
});

const portfolioImageSchema = z.object({
  altText: z.string().trim().max(180).optional().default(''),
});

const normalizeTechnologyCode = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');

const selectPortfolioItemsSql = `
  SELECT
    pi.id,
    pi.item_code,
    pi.name,
    pi.client_name,
    pi.description,
    pi.website_url,
    pi.sort_order,
    pi.is_featured,
    sc.code AS status,
    sc.name AS status_name,
    pi.created_at,
    pi.updated_at,
    COALESCE(fa.public_url, fa.storage_key) AS image_url,
    pia.alt_text,
    COALESCE(
      jsonb_agg(
        jsonb_build_object('id', tc.id, 'name', tc.name)
        ORDER BY pit.sort_order, tc.sort_order, tc.name
      ) FILTER (WHERE tc.id IS NOT NULL),
      '[]'::jsonb
    ) AS technologies
  FROM portfolio_items pi
  JOIN status_catalog sc
    ON pi.status_id = sc.id
    AND sc.domain = 'cms'
  LEFT JOIN portfolio_item_assets pia
    ON pia.portfolio_item_id = pi.id
    AND pia.asset_role = 'cover'
    AND pia.is_active = true
    AND pia.deleted_at IS NULL
  LEFT JOIN file_assets fa
    ON fa.id = pia.file_asset_id
    AND fa.deleted_at IS NULL
  LEFT JOIN portfolio_item_technologies pit
    ON pit.portfolio_item_id = pi.id
  LEFT JOIN technology_catalog tc
    ON tc.id = pit.technology_id
    AND tc.deleted_at IS NULL
  WHERE pi.deleted_at IS NULL
`;

const portfolioGroupOrderSql = `
  GROUP BY pi.id, sc.id, fa.public_url, fa.storage_key, pia.alt_text
  ORDER BY pi.sort_order ASC, pi.created_at DESC
`;

const replacePortfolioTechnologies = async (client: PoolClient, portfolioItemId: string, technologyIds: string[], adminId?: string) => {
  await client.query('DELETE FROM portfolio_item_technologies WHERE portfolio_item_id = $1', [portfolioItemId]);

  for (const [index, technologyId] of technologyIds.entries()) {
    const technology = await client.query(
      'SELECT id FROM technology_catalog WHERE id = $1 AND deleted_at IS NULL AND is_active = true',
      [technologyId],
    );

    if (technology.rowCount === 0) {
      throw new HttpError(400, 'Tecnologia invalida.');
    }

    await client.query(
      `INSERT INTO portfolio_item_technologies (portfolio_item_id, technology_id, sort_order, created_by)
       VALUES ($1, $2, $3, $4)`,
      [portfolioItemId, technologyId, index, adminId ?? null],
    );
  }
};

router.get(
  '/portfolio/technologies',
  requirePermission('admin.portafolio.view'),
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await pool.query(
      `SELECT id, code, name, sort_order, is_active, created_at, updated_at
       FROM technology_catalog
       WHERE deleted_at IS NULL
       ORDER BY sort_order ASC, name ASC`,
    );
    res.json({ items: result.rows });
  }),
);

router.post(
  '/portfolio/technologies',
  requireCsrf,
  requirePermission('admin.portafolio.manage'),
  asyncHandler(async (req: Request, res: Response) => {
    const body = technologyCreateSchema.parse(req.body);
    const code = normalizeTechnologyCode(body.name);

    if (!code) throw new HttpError(400, 'Nombre de tecnologia invalido.');

    const result = await pool.query(
      `INSERT INTO technology_catalog (code, name, sort_order, created_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (code) DO UPDATE
       SET name = EXCLUDED.name,
           sort_order = EXCLUDED.sort_order,
           is_active = true,
           deleted_at = NULL,
           updated_at = now(),
           updated_by = EXCLUDED.created_by
       RETURNING id, code, name, sort_order, is_active, created_at, updated_at`,
      [code, body.name, body.sortOrder, req.admin?.id ?? null],
    );

    await auditService.logAdminAction({
        userId: req.admin?.id,
        action: 'upsert',
        entityType: 'technology_catalog',
        entity: result.rows[0],
        req
      });
    res.status(201).json({ item: result.rows[0] });
  }),
);

router.get(
  '/portfolio',
  requirePermission('admin.portafolio.view'),
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await pool.query(`${selectPortfolioItemsSql} ${portfolioGroupOrderSql}`);
    res.json({ items: result.rows });
  }),
);

router.post(
  '/portfolio',
  requireCsrf,
  requirePermission('admin.portafolio.manage'),
  optionalImageUpload,
  asyncHandler(async (req: Request, res: Response) => {
    const body = portfolioItemSchema.parse(req.body);
    const imageBody = portfolioImageSchema.parse(req.body);
    const file = req.file;
    const itemCode = createBusinessCode('PORT');
    let validatedFile: Awaited<ReturnType<typeof validateUpload>> | null = null;
    let cloudinaryAsset: CloudinaryStoredAsset | null = null;
    const client = await pool.connect();

    try {
      if (file) {
        validatedFile = await validateUpload(file);
        if (!validatedFile.mimeType.startsWith('image/')) {
          throw new HttpError(400, 'Solo se permiten imagenes para el portafolio.');
        }

        cloudinaryAsset = await uploadPortfolioImageToCloudinary({
          buffer: file.buffer,
          itemCode,
          originalName: validatedFile.originalName,
          mimeType: validatedFile.mimeType,
        });
      }

      await client.query('BEGIN');
      const statusId = await getCmsStatusId(client, body.status);
      const result = await client.query(
        `INSERT INTO portfolio_items (
          item_code, name, client_name, description, website_url, sort_order,
          is_featured, status_id, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id`,
        [
          itemCode,
          body.name,
          body.clientName || null,
          body.description || null,
          body.websiteUrl ?? null,
          body.sortOrder,
          body.isFeatured,
          statusId,
          req.admin?.id ?? null,
        ],
      );
      const id = result.rows[0].id;
      await replacePortfolioTechnologies(client, id, body.technologyIds, req.admin?.id);

      if (file && validatedFile && cloudinaryAsset) {
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
          ],
        );

        await client.query(
          `INSERT INTO portfolio_item_assets (
            portfolio_item_id, file_asset_id, asset_role, alt_text, sort_order, created_by
          )
          VALUES ($1, $2, 'cover', $3, 0, $4)`,
          [id, fileResult.rows[0].id, imageBody.altText || body.name, req.admin?.id ?? null],
        );
      }

      await client.query('COMMIT');

      const created = await pool.query(`${selectPortfolioItemsSql} AND pi.id = $1 ${portfolioGroupOrderSql}`, [id]);
      await auditService.logAdminAction({
        userId: req.admin?.id,
        action: 'create',
        entityType: 'portfolio_item',
        entity: created.rows[0],
        req
      });

      res.status(201).json({ item: created.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      if (cloudinaryAsset) {
        await deleteCloudinaryAsset(cloudinaryAsset.publicId, cloudinaryAsset.resourceType).catch((cleanupError: unknown) => {
          console.error('Cloudinary cleanup failed after portfolio creation rollback:', cleanupError);
        });
      }
      throw error;
    } finally {
      client.release();
    }
  }),
);

router.patch(
  '/portfolio/:id',
  requireCsrf,
  requirePermission('admin.portafolio.manage'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const body = portfolioItemUpdateSchema.parse(req.body);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const current = await client.query('SELECT * FROM portfolio_items WHERE id = $1 AND deleted_at IS NULL', [id]);
      if (current.rowCount === 0) throw new HttpError(404, 'Proyecto de portafolio no encontrado.');
      const statusId = body.status ? await getCmsStatusId(client, body.status) : null;

      const result = await client.query(
        `UPDATE portfolio_items
         SET name = COALESCE($2, name),
             client_name = COALESCE($3, client_name),
             description = COALESCE($4, description),
             website_url = COALESCE($5, website_url),
             sort_order = COALESCE($6, sort_order),
             is_featured = COALESCE($7, is_featured),
             status_id = COALESCE($8, status_id),
             updated_by = $9,
             updated_at = now()
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING id`,
        [
          id,
          body.name ?? null,
          body.clientName ?? null,
          body.description ?? null,
          body.websiteUrl ?? null,
          body.sortOrder ?? null,
          body.isFeatured ?? null,
          statusId,
          req.admin?.id ?? null,
        ],
      );

      if (result.rowCount === 0) throw new HttpError(404, 'Proyecto de portafolio no encontrado.');

      if (body.technologyIds) {
        await replacePortfolioTechnologies(client, id, body.technologyIds, req.admin?.id);
      }

      await client.query('COMMIT');
      
      const updated = await pool.query(`${selectPortfolioItemsSql} AND pi.id = $1 ${portfolioGroupOrderSql}`, [id]);
      
      await auditService.logAdminAction({
        userId: req.admin?.id,
        action: 'update',
        entityType: 'portfolio_item',
        entity: updated.rows[0],
        previousState: current.rows[0],
        req
      });

      res.json({ item: updated.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }),
);

router.delete(
  '/portfolio/:id',
  requireCsrf,
  requirePermission('admin.portafolio.manage'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const current = await pool.query('SELECT * FROM portfolio_items WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (current.rowCount === 0) throw new HttpError(404, 'Proyecto de portafolio no encontrado.');

    const result = await pool.query(
      `UPDATE portfolio_items
       SET deleted_at = now(), updated_at = now(), updated_by = $2
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id, req.admin?.id ?? null],
    );

    if (result.rowCount === 0) throw new HttpError(404, 'Proyecto de portafolio no encontrado.');
    await auditService.logAdminAction({
      userId: req.admin?.id,
      action: 'delete',
      entityType: 'portfolio_item',
      entity: current.rows[0],
      previousState: current.rows[0],
      req
    });
    res.json({ ok: true });
  }),
);

router.post(
  '/portfolio/:id/image',
  requireCsrf,
  requirePermission('admin.portafolio.manage'),
  upload.single('image'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const body = portfolioImageSchema.parse(req.body);
    const file = req.file;

    if (!file) throw new HttpError(400, 'Imagen requerida.');

    const itemResult = await pool.query(
      'SELECT item_code, name FROM portfolio_items WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    if (itemResult.rowCount === 0) throw new HttpError(404, 'Proyecto de portafolio no encontrado.');

    const validatedFile = await validateUpload(file);
    if (!validatedFile.mimeType.startsWith('image/')) {
      throw new HttpError(400, 'Solo se permiten imagenes para el portafolio.');
    }

    let cloudinaryAsset: CloudinaryStoredAsset | null = null;
    const client = await pool.connect();

    try {
      cloudinaryAsset = await uploadPortfolioImageToCloudinary({
        buffer: file.buffer,
        itemCode: itemResult.rows[0].item_code,
        originalName: validatedFile.originalName,
        mimeType: validatedFile.mimeType,
      });

      await client.query('BEGIN');

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
        ],
      );

      await client.query(
        `UPDATE portfolio_item_assets
         SET is_active = false,
             deleted_at = now(),
             sort_order = COALESCE((
               SELECT max(pia2.sort_order) + 1
               FROM portfolio_item_assets pia2
               WHERE pia2.portfolio_item_id = portfolio_item_assets.portfolio_item_id
                 AND pia2.asset_role = portfolio_item_assets.asset_role
             ), sort_order + 1),
             updated_at = now(),
             updated_by = $2
         WHERE portfolio_item_id = $1 AND asset_role = 'cover' AND deleted_at IS NULL`,
        [id, req.admin?.id ?? null],
      );

      await client.query(
        `INSERT INTO portfolio_item_assets (
          portfolio_item_id, file_asset_id, asset_role, alt_text, sort_order, created_by
        )
        VALUES ($1, $2, 'cover', $3, 0, $4)`,
        [id, fileResult.rows[0].id, body.altText || itemResult.rows[0].name, req.admin?.id ?? null],
      );

      await client.query('COMMIT');
      const updated = await pool.query(`${selectPortfolioItemsSql} AND pi.id = $1 ${portfolioGroupOrderSql}`, [id]);
      
      await auditService.logAdminAction({
        userId: req.admin?.id,
        action: 'upload_image',
        entityType: 'portfolio_item',
        entity: updated.rows[0],
        req
      });
      res.status(201).json({ item: updated.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      if (cloudinaryAsset) {
        await deleteCloudinaryAsset(cloudinaryAsset.publicId, cloudinaryAsset.resourceType).catch((cleanupError: unknown) => {
          console.error('Cloudinary cleanup failed after portfolio image rollback:', cleanupError);
        });
      }
      throw error;
    } finally {
      client.release();
    }
  }),
);

router.use('/', projectsRouter);
router.use('/', quotesRouter);
// --- Status Catalog Endpoints ---

const statusCatalogUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

router.put(
  '/status-catalog/:id',
  requireCsrf,
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);

    // Prevención de Asignación Masiva
    if (req.body) {
      delete req.body.code;
      delete req.body.domain;
      delete req.body.is_terminal;
    }

    const body = statusCatalogUpdateSchema.parse(req.body);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const current = await client.query('SELECT * FROM status_catalog WHERE id = $1', [id]);
      
      if (current.rowCount === 0) {
        throw new HttpError(404, 'Estado no encontrado en el catálogo.');
      }

      const result = await client.query(
        `UPDATE status_catalog
         SET name = COALESCE($2, name),
             sort_order = COALESCE($3, sort_order),
             is_active = COALESCE($4, is_active),
             updated_at = now()
         WHERE id = $1
         RETURNING *`,
        [
          id,
          body.name ?? null,
          body.sort_order ?? null,
          body.is_active ?? null
        ],
      );

      await client.query('COMMIT');
      
      await auditService.logAdminAction({
        userId: req.admin?.id,
        action: 'update',
        entityType: 'status_catalog',
        entity: result.rows[0],
        previousState: current.rows[0],
        req
      });

      res.json({ item: result.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }),
);

router.delete(
  '/status-catalog/:id',
  requireCsrf,
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    throw new HttpError(405, 'La eliminación de estados no está permitida para mantener la integridad del sistema.');
  }),
);

// --- Pricing Catalog Endpoints ---

router.put(
  '/pricing-catalog/:id',
  requireCsrf,
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    throw new HttpError(405, 'La modificación de ítems de precio no está soportada para garantizar la integridad financiera.');
  }),
);

router.patch(
  '/pricing-catalog/:id',
  requireCsrf,
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    throw new HttpError(405, 'La modificación de ítems de precio no está soportada para garantizar la integridad financiera.');
  }),
);

router.delete(
  '/pricing-catalog/:id',
  requireCsrf,
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    throw new HttpError(405, 'La eliminación física de ítems de precio no está permitida para mantener la integridad de las cotizaciones históricas.');
  }),
);

// --- Append-Only Audit Endpoints ---

const blockAuditMutation = asyncHandler(async (req: Request, res: Response) => {
  throw new HttpError(405, 'Los registros de auditoría son inmutables (Append-Only) y no pueden ser alterados ni eliminados por razones de seguridad y cumplimiento normativo.');
});

router.put('/audit-logs/:id', requireCsrf, requireSuperAdmin, blockAuditMutation);
router.patch('/audit-logs/:id', requireCsrf, requireSuperAdmin, blockAuditMutation);
router.delete('/audit-logs/:id', requireCsrf, requireSuperAdmin, blockAuditMutation);

router.put('/data-change-history/:id', requireCsrf, requireSuperAdmin, blockAuditMutation);
router.patch('/data-change-history/:id', requireCsrf, requireSuperAdmin, blockAuditMutation);
router.delete('/data-change-history/:id', requireCsrf, requireSuperAdmin, blockAuditMutation);

// --- Append-Only: Historiales Operativos ---

// 1. Historial de estados de proyectos
router.put('/project-status-history/:id', requireCsrf, requireSuperAdmin, blockAuditMutation);
router.patch('/project-status-history/:id', requireCsrf, requireSuperAdmin, blockAuditMutation);
router.delete('/project-status-history/:id', requireCsrf, requireSuperAdmin, blockAuditMutation);

// 2. Historial de estados de cotizaciones
router.put('/quote-status-history/:id', requireCsrf, requireSuperAdmin, blockAuditMutation);
router.patch('/quote-status-history/:id', requireCsrf, requireSuperAdmin, blockAuditMutation);
router.delete('/quote-status-history/:id', requireCsrf, requireSuperAdmin, blockAuditMutation);

// 3. Historial de estados de reclamos
router.put('/complaint-status-history/:id', requireCsrf, requireSuperAdmin, blockAuditMutation);
router.patch('/complaint-status-history/:id', requireCsrf, requireSuperAdmin, blockAuditMutation);
router.delete('/complaint-status-history/:id', requireCsrf, requireSuperAdmin, blockAuditMutation);

// 4. Historial de estados de casos de contacto (contactos web)
router.put('/contact-case-status-history/:id', requireCsrf, requireSuperAdmin, blockAuditMutation);
router.patch('/contact-case-status-history/:id', requireCsrf, requireSuperAdmin, blockAuditMutation);
router.delete('/contact-case-status-history/:id', requireCsrf, requireSuperAdmin, blockAuditMutation)

export default router;

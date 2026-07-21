import crypto from 'node:crypto';
import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import type { PoolClient } from 'pg';
import multer from 'multer';
import { z } from 'zod';
import { paginationQuerySchema, createBusinessCode } from './admin/shared.js';

import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { pool } from '../db/pool.js';
import {
  deleteCloudinaryAsset,
  uploadPortfolioImageToCloudinary,
  uploadPaymentReceiptToCloudinary,
  type CloudinaryStoredAsset,
} from '../lib/cloudinary.js';
import { allowedUploadMimeTypeList, validateUpload } from '../lib/validateUpload.js';
import { requireAdmin, requirePermission, requireSuperAdmin } from '../middleware/auth.js';
import { requireCsrf } from '../middleware/csrf.js';
import { requireProjectOwnership, requireQuoteOwnership, blockDeveloperFromProjectSection } from '../middleware/abac.js';

import { requireNonTerminalState } from '../middleware/requireNonTerminalState.js';
import { auditService } from '../services/audit.js';
import { triggerEnvironmentVerification } from '../services/environmentVerification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();



router.use(requireAdmin);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: (_req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile?: boolean) => void) => {
    if (!allowedUploadMimeTypeList.includes(file.mimetype)) {
      callback(new HttpError(400, 'Tipo MIME no permitido.'));
      return;
    }

    callback(null, true);
  },
});

const optionalImageUpload = (req: Request, res: Response, next: NextFunction) => {
  if (req.is('multipart/form-data')) {
    upload.single('image')(req, res, next);
    return;
  }

  next();
};

const roleCodeSchema = z.string().trim().min(2).max(80).regex(/^[a-z0-9_:.+-]+$/);

const roleCreateSchema = z.object({
  code: roleCodeSchema,
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional().nullable(),
  permissionIds: z.array(z.string().uuid()).default([]),
});

const roleUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  isActive: z.boolean().optional(),
  permissionIds: z.array(z.string().uuid()).optional(),
});

const ensurePermissionsExist = async (client: PoolClient, permissionIds: string[]) => {
  if (permissionIds.length === 0) return;
  const result = await client.query('SELECT id FROM permissions WHERE id = ANY($1::uuid[]) AND deleted_at IS NULL', [permissionIds]);
  if (result.rowCount !== new Set(permissionIds).size) {
    throw new HttpError(400, 'Uno o mas permisos son invalidos.');
  }
};

const replaceRolePermissions = async (client: PoolClient, roleId: string, permissionIds: string[], adminId?: string) => {
  await ensurePermissionsExist(client, permissionIds);
  await client.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);

  for (const permissionId of new Set(permissionIds)) {
    await client.query(
      `INSERT INTO role_permissions (role_id, permission_id, granted_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (role_id, permission_id) DO NOTHING`,
      [roleId, permissionId, adminId ?? null],
    );
  }
};

router.get(
  '/permissions',
  requireSuperAdmin,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await pool.query(
      `SELECT id, module_code, action_code, code, name, description
       FROM permissions
       WHERE deleted_at IS NULL
       ORDER BY module_code ASC, action_code ASC, name ASC`,
    );
    res.json({ items: result.rows });
  }),
);

router.get(
  '/roles',
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { limit, offset } = paginationQuerySchema.parse(req.query);
    const [result, countResult] = await Promise.all([pool.query(
      `
      SELECT
        r.id,
        r.code,
        r.name,
        r.description,
        r.is_system,
        r.is_active,
        r.created_at,
        r.updated_at,
        COALESCE(array_remove(array_agg(rp.permission_id), NULL), ARRAY[]::uuid[]) as permission_ids,
        COALESCE(array_remove(array_agg(p.code), NULL), ARRAY[]::varchar[]) as permission_codes
      FROM roles r
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
      LEFT JOIN permissions p ON p.id = rp.permission_id AND p.deleted_at IS NULL
      WHERE r.deleted_at IS NULL
      GROUP BY r.id
      ORDER BY r.is_system DESC, r.name ASC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset],
    ), pool.query('SELECT count(*)::int AS total FROM roles WHERE deleted_at IS NULL')]);
    res.json({ data: result.rows, total: countResult.rows[0].total });
  }),
);

router.get(
  '/roles/:id',
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const result = await pool.query(
      `
      SELECT
        r.id,
        r.code,
        r.name,
        r.description,
        r.is_system,
        r.is_active,
        r.created_at,
        r.updated_at,
        COALESCE(array_remove(array_agg(rp.permission_id), NULL), ARRAY[]::uuid[]) as permission_ids,
        COALESCE(array_remove(array_agg(p.code), NULL), ARRAY[]::varchar[]) as permission_codes
      FROM roles r
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
      LEFT JOIN permissions p ON p.id = rp.permission_id AND p.deleted_at IS NULL
      WHERE r.id = $1 AND r.deleted_at IS NULL
      GROUP BY r.id
      `,
      [id],
    );
    if (result.rowCount === 0) throw new HttpError(404, 'Rol no encontrado.');
    res.json({ item: result.rows[0] });
  }),
);

router.post(
  '/roles',
  requireCsrf,
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const body = roleCreateSchema.parse(req.body);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await ensurePermissionsExist(client, body.permissionIds);
      const result = await client.query(
        `INSERT INTO roles (code, name, description, is_system, created_by)
         VALUES ($1, $2, $3, false, $4)
         RETURNING id, code, name, description, is_system, is_active, created_at, updated_at`,
        [body.code, body.name, body.description ?? null, req.admin?.id ?? null],
      );

      await replaceRolePermissions(client, result.rows[0].id, body.permissionIds, req.admin?.id);
      await client.query('COMMIT');
      await auditService.logAdminAction({
        userId: req.admin?.id,
        action: 'create',
        entityType: 'role',
        entity: result.rows[0],
        req
      });
      res.status(201).json({ item: { ...result.rows[0], permission_ids: body.permissionIds } });
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
        throw new HttpError(409, 'El codigo del rol ya existe.');
      }
      throw error;
    } finally {
      client.release();
    }
  }),
);

router.put(
  '/roles/:id',
  requireCsrf,
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);

    if (req.body) {
      delete req.body.code;
      delete req.body.is_system;
    }

    const body = roleUpdateSchema.parse(req.body);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const current = await client.query('SELECT * FROM roles WHERE id = $1 AND deleted_at IS NULL', [id]);
      if (current.rowCount === 0) throw new HttpError(404, 'Rol no encontrado.');
      if (current.rows[0].code === 'super_admin') {
        throw new HttpError(403, 'No se puede modificar el rol super_admin.');
      }

      if (body.permissionIds) {
        await replaceRolePermissions(client, id, body.permissionIds, req.admin?.id);
      }

      const descriptionValue = Object.prototype.hasOwnProperty.call(body, 'description') ? body.description ?? null : undefined;

      const result = await client.query(
        `UPDATE roles
         SET name = COALESCE($2, name),
             description = CASE WHEN $3::boolean THEN $4 ELSE description END,
             is_active = COALESCE($5, is_active),
             updated_by = $6,
             updated_at = now()
         WHERE id = $1
         RETURNING id, code, name, description, is_system, is_active, created_at, updated_at`,
        [
          id,
          body.name ?? null,
          descriptionValue !== undefined,
          descriptionValue ?? null,
          body.isActive ?? null,
          req.admin?.id ?? null,
        ],
      );

      await client.query('COMMIT');
      await auditService.logAdminAction({
        userId: req.admin?.id,
        action: 'update',
        entityType: 'role',
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
  '/roles/:id',
  requireCsrf,
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    throw new HttpError(405, 'La eliminación de roles no está soportada por el sistema.');
  }),
);

router.get(
  '/menu',
  asyncHandler(async (req: Request, res: Response) => {
    const isSuperAdmin = req.admin?.roles.includes('super_admin') ?? false;
    const result = await pool.query(
      `
      SELECT mi.id, mi.label, mi.url, mi.route_name, mi.icon_name, mi.sort_order, p.code as permission_code
      FROM menu_items mi
      LEFT JOIN permissions p ON p.id = mi.permission_id
      WHERE mi.is_active = true
        AND mi.deleted_at IS NULL
        AND (
          mi.permission_id IS NULL
          OR $1::boolean = true
          OR p.code = ANY($2::varchar[])
        )
      ORDER BY mi.sort_order ASC, mi.label ASC
      `,
      [isSuperAdmin, req.admin?.permissions ?? []],
    );
    res.json({ items: result.rows });
  }),
);

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

const statusHistorySelect = (historyTable: string, entityColumn: string) => `
  SELECT h.changed_at AS timestamp,
         u.name AS user_name,
         u.email AS user_email,
         old_sc.code AS old_status,
         old_sc.name AS old_status_name,
         new_sc.code AS new_status,
         new_sc.name AS new_status_name,
         h.reason
  FROM ${historyTable} h
  LEFT JOIN status_catalog old_sc ON h.old_status_id = old_sc.id
  LEFT JOIN status_catalog new_sc ON h.new_status_id = new_sc.id
  LEFT JOIN admin_users u ON h.changed_by = u.id
  WHERE h.${entityColumn} = $1
  ORDER BY h.changed_at DESC
`;

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

// --- User Management Endpoints ---

const userCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  role: z.string(),
});

const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  password: z.string().min(8).optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.get(
  '/users',
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { limit, offset } = paginationQuerySchema.parse(req.query);
      const status = req.query.status as string;

      let statusParam: boolean | null = null;
      if (status === 'active') statusParam = true;
      else if (status === 'inactive') statusParam = false;

      const [result, countResult] = await Promise.all([pool.query(`
        SELECT 
          u.id, 
          u.name, 
          u.email, 
          u.is_active,
          (array_remove(array_agg(r.code), NULL))[1] as role,
          array_remove(array_agg(r.code), NULL) as roles,
          u.created_at,
          u.last_login_at
        FROM admin_users u
        LEFT JOIN admin_user_roles aur ON u.id = aur.admin_user_id
        LEFT JOIN roles r ON aur.role_id = r.id
        WHERE u.deleted_at IS NULL AND ($3::boolean IS NULL OR u.is_active = $3::boolean)
        GROUP BY u.id
        ORDER BY u.name ASC
        LIMIT $1 OFFSET $2
      `, [limit, offset, statusParam]), pool.query(
        'SELECT count(*)::int AS total FROM admin_users WHERE deleted_at IS NULL AND ($1::boolean IS NULL OR is_active = $1::boolean)',
        [statusParam]
      )]);
      res.json({ data: result.rows, total: countResult.rows[0].total });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }),
);

router.post(
  '/users',
  requireCsrf,
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const body = userCreateSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(body.password, 12);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const roleResult = await client.query('SELECT id FROM roles WHERE code = $1 AND is_active = true AND deleted_at IS NULL', [body.role]);
      if (roleResult.rowCount === 0) throw new HttpError(400, 'Rol inválido.');
      const roleId = roleResult.rows[0].id;

      const result = await client.query(
        `INSERT INTO admin_users (email, name, password_hash, created_by, is_verified, force_password_change)
         VALUES ($1, $2, $3, $4, false, true) RETURNING id, email, name, is_active, created_at`,
        [body.email.toLowerCase(), body.name, passwordHash, req.admin?.id]
      );

      await client.query(
        `INSERT INTO admin_user_roles (admin_user_id, role_id, assigned_by) VALUES ($1, $2, $3)`,
        [result.rows[0].id, roleId, req.admin?.id]
      );

      await client.query('COMMIT');
      await auditService.logAdminAction({
        userId: req.admin?.id,
        action: 'create',
        entityType: 'admin_user',
        entity: result.rows[0],
        req
      });
      res.status(201).json({ item: result.rows[0] });
    } catch (err: unknown) {
      await client.query('ROLLBACK');
      if (typeof err === 'object' && err !== null && 'code' in err && err.code === '23505') {
        throw new HttpError(409, 'El correo ya está en uso.');
      }
      throw err;
    } finally {
      client.release();
    }
  }),
);

router.patch(
  '/users/:id',
  requireCsrf,
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const body = userUpdateSchema.parse(req.body);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const currentUser = await client.query(`
        SELECT u.id, u.is_active, (array_remove(array_agg(r.code), NULL))[1] as role
        FROM admin_users u
        LEFT JOIN admin_user_roles aur ON u.id = aur.admin_user_id
        LEFT JOIN roles r ON aur.role_id = r.id
        WHERE u.id = $1
        GROUP BY u.id
      `, [id]);
      
      if (currentUser.rowCount === 0) throw new HttpError(404, 'Usuario no encontrado.');
      const currentRole = currentUser.rows[0].role;

      if (currentRole === 'super_admin' && !req.admin?.roles.includes('super_admin')) {
        throw new HttpError(403, 'No puedes modificar a un super administrador.');
      }

      let updatedRole = currentRole;

      if (body.role && body.role !== currentRole) {
        const roleResult = await client.query('SELECT id FROM roles WHERE code = $1 AND is_active = true AND deleted_at IS NULL', [body.role]);
        if (roleResult.rowCount === 0) throw new HttpError(400, 'Rol inválido.');
        const roleId = roleResult.rows[0].id;

        await client.query('DELETE FROM admin_user_roles WHERE admin_user_id = $1', [id]);
        await client.query(
          `INSERT INTO admin_user_roles (admin_user_id, role_id, assigned_by) VALUES ($1, $2, $3)`,
          [id, roleId, req.admin?.id]
        );
        updatedRole = body.role;
      }

      const passwordHash = body.password ? await bcrypt.hash(body.password, 12) : null;

      const result = await client.query(
        `UPDATE admin_users 
          SET name = COALESCE($2, name), 
              is_active = COALESCE($3, is_active),
              password_hash = COALESCE($5, password_hash),
              updated_at = now(),
              updated_by = $4
          WHERE id = $1 
          RETURNING id, email, name, is_active, updated_at`,
        [id, body.name ?? null, body.isActive ?? null, req.admin?.id, passwordHash]
      );

      await client.query('COMMIT');
      await auditService.logAdminAction({
        userId: req.admin?.id,
        action: 'update',
        entityType: 'admin_user',
        entity: { ...result.rows[0], role: updatedRole },
        previousState: currentUser.rows[0],
        req
      });
      res.json({ item: { ...result.rows[0], role: updatedRole } });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }),
);

router.delete(
  '/users/:id',
  requireCsrf,
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const currentUser = await client.query('SELECT id, is_active FROM admin_users WHERE id = $1', [id]);
      if (currentUser.rowCount === 0) throw new HttpError(404, 'Usuario no encontrado.');
      if (currentUser.rows[0].is_active) throw new HttpError(400, 'Solo se pueden eliminar usuarios inactivos.');

      await client.query('DELETE FROM admin_user_roles WHERE admin_user_id = $1', [id]);
      await client.query('DELETE FROM admin_users WHERE id = $1', [id]);

      await client.query('COMMIT');
      
      await auditService.logAdminAction({
        userId: req.admin?.id,
        action: 'delete',
        entityType: 'admin_user',
        entity: { id },
        req
      });

      res.json({ success: true });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }),
);

router.patch(
  '/users/:id/roles',
  requireCsrf,
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const { role } = z.object({ role: z.string() }).parse(req.body);
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const currentUser = await client.query(`
        SELECT u.id, (array_remove(array_agg(r.code), NULL))[1] as role
        FROM admin_users u
        LEFT JOIN admin_user_roles aur ON u.id = aur.admin_user_id
        LEFT JOIN roles r ON aur.role_id = r.id
        WHERE u.id = $1
        GROUP BY u.id
      `, [id]);
      
      if (currentUser.rowCount === 0) throw new HttpError(404, 'Usuario no encontrado.');
      const currentRole = currentUser.rows[0].role;

      if (currentRole === 'super_admin' && !req.admin?.roles.includes('super_admin')) {
        throw new HttpError(403, 'No puedes modificar a un super administrador.');
      }

      const roleResult = await client.query('SELECT id FROM roles WHERE code = $1 AND is_active = true AND deleted_at IS NULL', [role]);
      if (roleResult.rowCount === 0) throw new HttpError(400, 'Rol inválido.');
      const roleId = roleResult.rows[0].id;

      await client.query('DELETE FROM admin_user_roles WHERE admin_user_id = $1', [id]);
      await client.query(
        `INSERT INTO admin_user_roles (admin_user_id, role_id, assigned_by) VALUES ($1, $2, $3)`,
        [id, roleId, req.admin?.id]
      );
      await client.query('UPDATE admin_users SET updated_at = now(), updated_by = $2 WHERE id = $1', [id, req.admin?.id]);

      await client.query('COMMIT');
      await auditService.logAdminAction({
        userId: req.admin?.id,
        action: 'update_role',
        entityType: 'admin_user',
        entity: { id, role },
        previousState: currentUser.rows[0],
        req
      });
      res.json({ item: { id, role } });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }),
);

// --- Settings Endpoints ---

const settingsUpdateSchema = z.object({
  settings: z.array(z.object({
    setting_key: z.string(),
    setting_value: z.any(),
    is_sensitive: z.boolean().optional(),
    description: z.string().optional()
  }))
});

router.get(
  '/settings',
  requirePermission('admin.configuracion.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query('SELECT setting_key, setting_value, description, is_sensitive FROM system_settings ORDER BY setting_key');
    
    console.log('1. RAW DB RESULT:', JSON.stringify(result.rows.find((r: any) => r.setting_key === 'cloudinary_config'), null, 2));

    const items = result.rows.map((row: any) => {
      let value = row.setting_value ? { ...row.setting_value } : {};

      if (row.setting_key === 'smtp_config') {
        value = {
          ...value,
          host: value.host || '',
          port: String(value.port || ''),
          secure: value.secure ?? false,
          user: value.user || '',
          pass: value.pass ? '********' : '',
        };
      }

      if (row.setting_key === 'cloudinary_config') {
        value = {
          ...value,
          cloud_name: value.cloud_name || '',
          api_key: value.api_key || '',
          api_secret: value.api_secret ? '********' : '',
        };
      }

      return { ...row, setting_value: value };
    });

    console.log('2. AFTER MAPPING:', JSON.stringify(items.find((r: any) => r.setting_key === 'cloudinary_config'), null, 2));

    res.json({ items });
  })
);

router.patch(
  '/settings',
  requireCsrf,
  requirePermission('admin.configuracion.manage'),
  asyncHandler(async (req: Request, res: Response) => {
    const { settings } = settingsUpdateSchema.parse(req.body);
    const currentSettings = await pool.query('SELECT * FROM system_settings');
    const previousState = currentSettings.rows;
    const previousStates: any[] = [];
    const newStates: any[] = [];

    for (const setting of settings) {
      // Evitar sobreescribir con valores enmascarados
      let valueToSave = setting.setting_value;
      
      if (setting.is_sensitive) {
        // Recuperar el actual para evitar sobreescribir secretos con asteriscos
        const current = await pool.query('SELECT setting_value FROM system_settings WHERE setting_key = $1', [setting.setting_key]);
        if (current.rowCount && current.rowCount > 0) {
          const currentVal = current.rows[0].setting_value;
          const merged = { ...valueToSave };
          
          if (setting.setting_key === 'smtp_config' && merged.pass === '********') {
            merged.pass = currentVal.pass;
          }
          if (setting.setting_key === 'cloudinary_config' && merged.api_secret === '********') {
            merged.api_secret = currentVal.api_secret;
          }
          
          valueToSave = merged;
        }
      }

      const updateRes = await pool.query(
        `INSERT INTO system_settings (setting_key, setting_value, description, is_sensitive, updated_by)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (setting_key) DO UPDATE
         SET setting_value = EXCLUDED.setting_value, 
             description = COALESCE(EXCLUDED.description, system_settings.description),
             is_sensitive = COALESCE(EXCLUDED.is_sensitive, system_settings.is_sensitive),
             updated_at = now(), 
             updated_by = EXCLUDED.updated_by
         RETURNING *`,
        [setting.setting_key, JSON.stringify(valueToSave), setting.description ?? '', setting.is_sensitive ?? false, req.admin?.id]
      );

      const rawUpdatedRow = updateRes.rows[0];
      const rawOldRow = previousState.find((s: any) => s.setting_key === setting.setting_key);

      if (rawOldRow) previousStates.push(rawOldRow);
      newStates.push(rawUpdatedRow);
    }

    await auditService.logAdminAction({
      userId: req.admin?.id,
      action: 'batch_update',
      entityType: 'system_settings',
      entity: newStates,
      previousState: previousStates,
      req
    });

    res.json({ ok: true });
  })
);

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

type Queryable = Pick<PoolClient, 'query'>;

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
  vercel_bypass_secret: z.string().trim().max(500).optional().nullable(),
});

const projectSelectSql = `
  SELECT p.id, p.project_code, p.customer_id, p.organization_id, p.service_id, p.quote_id,
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

const getProjectStatusInfo = async (client: Queryable, code: string) => {
  const result = await client.query(
    "SELECT id, name FROM status_catalog WHERE domain = 'project' AND code = $1 AND is_active = true LIMIT 1",
    [code],
  );
  if (!result.rowCount) throw new HttpError(400, 'Estado de proyecto invalido.');
  return { id: result.rows[0].id as string, name: result.rows[0].name as string };
};

router.get(
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

router.get(
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

router.get(
  '/projects/assignment-options',
  requirePermission('admin.proyectos.assign'),
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await pool.query(
      `SELECT id, name, email
       FROM admin_users
       WHERE deleted_at IS NULL AND is_active = true
       ORDER BY name ASC, email ASC`,
    );
    res.json({ items: result.rows });
  }),
);

router.post(
  '/projects',
  requireCsrf,
  requirePermission('admin.proyectos.create'),
  asyncHandler(async (req: Request, res: Response) => {
    const body = projectCreateSchema.parse(req.body);
    const { id: statusId } = await getProjectStatusInfo(pool, body.status);
    if (body.quoteId) {
      const quote = await pool.query(
        `SELECT q.id
         FROM quotes q
         JOIN customers quote_customer ON quote_customer.id = q.customer_id
         JOIN customers project_customer ON project_customer.id = $2
         WHERE q.id = $1 AND q.deleted_at IS NULL
           AND lower(quote_customer.primary_email) = lower(project_customer.primary_email)`,
        [body.quoteId, body.customerId],
      );
      if (!quote.rowCount) throw new HttpError(400, 'La cotizacion no pertenece al cliente seleccionado.');
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
    res.status(201).json({ item: created.rows[0] });
  }),
);

router.get(
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

router.get(
  '/projects/:id/vercel-bypass-secret',
  requirePermission('admin.proyectos.manage'),
  blockDeveloperFromProjectSection('secretos'),
  asyncHandler(async (req: Request, res: Response) => {
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

router.patch(
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
        const assignmentCheck = await client.query('SELECT 1 FROM project_assignments WHERE project_id = $1 AND user_id = $2', [id, req.admin?.id]);
        if (assignmentCheck.rowCount === 0) throw new HttpError(403, 'No tienes permiso para modificar un proyecto no asignado.');
      }
      const current = await client.query(
        `SELECT p.status_id, p.customer_id
         FROM projects p
         WHERE p.id = $1 AND p.deleted_at IS NULL
         FOR UPDATE OF p`,
        [id],
      );
      if (!current.rowCount) throw new HttpError(404, 'Proyecto no encontrado');
      const oldStatusId = current.rows[0].status_id as string | null;
      const statusInfo = body.status ? await getProjectStatusInfo(client, body.status) : null;
      const statusId = statusInfo?.id ?? null;
      if (body.quoteId) {
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
           vercel_bypass_secret = CASE WHEN $20 THEN $19 ELSE vercel_bypass_secret END,
           updated_at = now()
         WHERE id = $1 AND deleted_at IS NULL`,
        [id, body.customerId ?? null, body.organizationId ?? null, body.serviceId ?? null,
         body.name ?? null, body.description ?? null, statusId, body.githubRepo ?? null,
         body.githubBranch ?? null, body.startDate ?? null, body.estimatedEndDate ?? null,
         body.actualEndDate ?? null, body.totalBudget ?? null, body.currencyCode ?? null,
         Object.hasOwn(body, 'description'), Object.hasOwn(body, 'githubRepo'),
         body.quoteId ?? null, Object.hasOwn(body, 'quoteId'),
         body.vercel_bypass_secret ?? null, Object.hasOwn(body, 'vercel_bypass_secret')],
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

router.delete(
  '/projects/:id',
  requireCsrf,
  requirePermission('admin.proyectos.manage'),
  blockDeveloperFromProjectSection('eliminar'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    
    const result = await pool.query('UPDATE projects SET deleted_at = now(), updated_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id', [id]);
    if (!result.rowCount) throw new HttpError(404, 'Proyecto no encontrado');
    res.json({ ok: true });
  }),
);

const projectEnvironmentSchema = z.object({
  type: z.enum(['production', 'staging']),
  name: z.string().trim().min(2).max(180),
  url: z.string().trim().url().max(500),
  apiUrl: z.string().trim().url().max(500).optional().nullable(),
});

router.get(
  '/projects/:id/environments',
  requirePermission('admin.proyectos.view'),
  blockDeveloperFromProjectSection('entornos'),
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = z.string().uuid().parse(req.params.id);
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

router.post(
  '/projects/:id/environments',
  requireCsrf,
  requirePermission('admin.proyectos.manage'),
  blockDeveloperFromProjectSection('entornos'),
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = z.string().uuid().parse(req.params.id);
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
    res.status(201).json({ item: result.rows[0] });
  }),
);

router.post(
  '/projects/:id/environments/:environment_id/verify',
  requireCsrf,
  requirePermission('admin.proyectos.manage'),
  blockDeveloperFromProjectSection('entornos'),
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = z.string().uuid().parse(req.params.id);
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
    res.status(202).json({ ok: true });
  }),
);

router.delete(
  '/projects/:id/environments/:environment_id',
  requireCsrf,
  requirePermission('admin.proyectos.manage'),
  blockDeveloperFromProjectSection('entornos'),
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = z.string().uuid().parse(req.params.id);
    const environmentId = z.string().uuid().parse(req.params.environment_id);
    const result = await pool.query(
      'DELETE FROM project_environments WHERE id = $1 AND project_id = $2 RETURNING id',
      [environmentId, projectId],
    );
    if (!result.rowCount) throw new HttpError(404, 'Entorno no encontrado');
    res.json({ ok: true });
  }),
);

const milestoneCreateSchema = z.object({
  title: z.string().trim().min(1).max(180),
  dueDate: z.string().date(),
  paymentPercentage: z.coerce.number().min(0).max(100),
  statusId: z.string().uuid(),
});

router.post(
  '/projects/:id/milestones',
  requireCsrf,
  requirePermission('admin.proyectos.manage'),
  blockDeveloperFromProjectSection('hitos'),
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = z.string().uuid().parse(req.params.id);
    const body = milestoneCreateSchema.parse(req.body);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const sumResult = await client.query(
        'SELECT COALESCE(SUM(payment_percentage), 0) as total FROM project_milestones WHERE project_id = $1',
        [projectId]
      );
      const currentTotal = parseFloat(sumResult.rows[0].total);
      if (currentTotal + body.paymentPercentage > 100) {
        throw new HttpError(400, 'El porcentaje total de los hitos no puede superar el 100%.');
      }

      const result = await client.query(
        `INSERT INTO project_milestones (project_id, title, due_date, payment_percentage, status_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [projectId, body.title, body.dueDate, body.paymentPercentage, body.statusId],
      );
      await client.query('COMMIT');
      res.status(201).json({ id: result.rows[0].id });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }),
);

router.get(
  '/projects/:id/milestones',
  requirePermission('admin.proyectos.view'),
  blockDeveloperFromProjectSection('hitos'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const result = await pool.query(
      `SELECT pm.id, pm.project_id, pm.title, pm.due_date, pm.payment_percentage,
              pm.completed_at, pm.created_at, pm.updated_at,
              sc.code AS status, sc.name AS status_name, sc.is_terminal as "isTerminal",
              COALESCE(payments_data.payments, '[]'::json) AS payments
       FROM project_milestones pm
       JOIN status_catalog sc ON pm.status_id = sc.id
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
});

router.post(
  '/projects/:id/milestones/:milestone_id/payments',
  requireCsrf,
  requirePermission('admin.proyectos.manage'),
  blockDeveloperFromProjectSection('hitos'),
  upload.single('receipt'),
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = z.string().uuid().parse(req.params.id);
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

      const result = await client.query(
        `INSERT INTO milestone_payments (
          milestone_id, amount_paid, currency_code, payment_method,
          reference_number, receipt_file_id, paid_at, status, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'valid', $8)
        RETURNING id`,
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

      await client.query('COMMIT');
      res.status(201).json({ id: result.rows[0].id });
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

router.get(
  '/projects/:id/assignments',
  requirePermission('admin.proyectos.view'),
  requireProjectOwnership,
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

router.post(
  '/projects/:id/assignments',
  requireCsrf,
  requirePermission('admin.proyectos.assign'),
  requireProjectOwnership,
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = z.string().uuid().parse(req.params.id);
    const isRestrictedDeveloper = req.admin?.roles.includes('developer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    if (isRestrictedDeveloper) {
      const assignmentCheck = await pool.query('SELECT 1 FROM project_assignments WHERE project_id = $1 AND user_id = $2', [projectId, req.admin?.id]);
      if (assignmentCheck.rowCount === 0) throw new HttpError(403, 'No tienes permiso para gestionar asignaciones en un proyecto ajeno.');
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
    res.status(201).json({ item: result.rows[0] });
  }),
);

router.patch(
  '/projects/:id/milestones/:milestone_id',
  requireCsrf,
  requirePermission('admin.proyectos.manage'),
  requireNonTerminalState('projects'),
  blockDeveloperFromProjectSection('hitos'),
  asyncHandler(async (req: Request, res: Response) => {
    const projectId = z.string().uuid().parse(req.params.id);
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
    res.json({ ok: true });
  }),
);

router.get(
  '/projects/:id/commits',
  requirePermission('admin.proyectos.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
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

router.get(
  '/projects/:id/history',
  requirePermission('admin.proyectos.view'),
  blockDeveloperFromProjectSection('historial'),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query(
      statusHistorySelect('project_status_history', 'project_id'),
      [z.string().uuid().parse(req.params.id)],
    );
    res.json({ items: result.rows });
  }),
);

// --- Quotes Endpoints ---

let pricingCatalogColumns: Record<string, boolean> | null = null;

const getPricingCatalogColumns = async () => {
  if (pricingCatalogColumns !== null) return pricingCatalogColumns;

  const result = await pool.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pricing_catalog'
      AND column_name IN (
        'item_type',
        'upgrades_to_category',
        'is_draggable',
        'icon_name',
        'free_included_quantity',
        'included_features'
      )
  `);

  pricingCatalogColumns = Object.fromEntries(result.rows.map((row: { column_name: string }) => [row.column_name, true]));
  return pricingCatalogColumns;
};

router.get(
  '/catalog/pricing',
  requirePermission('admin.cotizador.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const columns = await getPricingCatalogColumns();
    const itemTypeSql = columns.item_type ? 'item_type' : 'NULL::varchar AS item_type';
    const upgradesSql = columns.upgrades_to_category ? 'upgrades_to_category' : 'NULL::varchar AS upgrades_to_category';
    const draggableSql = columns.is_draggable ? 'is_draggable' : 'NULL::boolean AS is_draggable';
    const iconSql = columns.icon_name ? 'icon_name' : 'NULL::varchar AS icon_name';
    const freeIncludedSql = columns.free_included_quantity ? 'free_included_quantity' : 'NULL::integer AS free_included_quantity';
    const includedFeaturesSql = columns.included_features ? 'included_features' : "'[]'::jsonb AS included_features";
    const orderSql = columns.item_type
      ? `CASE item_type
          WHEN 'base_canvas' THEN 0
          WHEN 'base_included' THEN 1
          WHEN 'addon' THEN 2
          WHEN 'category_trigger' THEN 3
          WHEN 'recurring' THEN 4
          ELSE 5
        END`
      : `CASE item_code
          WHEN 'landing_page' THEN 0
          WHEN 'web_corporate' THEN 1
          WHEN 'ecommerce' THEN 1
          WHEN 'chatbot_basic' THEN 2
          ELSE 3
        END`;
    const userRole = req.admin?.roles?.[0] || 'guest';
    const result = await pool.query(
      `
      SELECT pc.id, pc.item_code, pc.name, pc.description, pc.pricing_model, 
             CASE WHEN pro.id IS NOT NULL THEN pro.base_price ELSE pc.base_price END AS base_price, 
             CASE WHEN pro.id IS NOT NULL THEN pro.max_price ELSE pc.max_price END AS max_price,
             ${freeIncludedSql}, ${includedFeaturesSql}, pc.currency_code,
             ${itemTypeSql}, ${upgradesSql}, ${draggableSql}, ${iconSql},
             CASE WHEN pro.id IS NOT NULL THEN pro.base_price ELSE pc.base_price END AS unit_price
      FROM pricing_catalog pc
      LEFT JOIN pricing_role_overrides pro 
        ON pc.id = pro.pricing_catalog_id AND pro.role_name = $1
      WHERE pc.is_active = true AND pc.deleted_at IS NULL
      ORDER BY ${orderSql}, pc.name ASC
      `,
      [userRole],
    );
    res.json({ items: result.rows });
  })
);

const requireQuoteListAccess = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.admin) return next(new HttpError(401, 'No autenticado.'));
  if (req.admin.roles.includes('super_admin')) return next();
  const required = req.query.email
    ? ['admin.cotizador.view', 'admin.proyectos.create', 'admin.proyectos.manage']
    : ['admin.cotizador.view'];
  if (!required.some((permission) => req.admin?.permissions?.includes(permission))) {
    return next(new HttpError(403, 'Acceso denegado (Permiso requerido).'));
  }
  next();
};

const quoteListQuerySchema = paginationQuerySchema.extend({
  email: z.string().trim().email().optional(),
});

router.get(
  '/quotes',
  requireQuoteListAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const { limit, offset, email } = quoteListQuerySchema.parse(req.query);
    if (email) {
      const result = await pool.query(
        `SELECT q.id, q.quote_code, q.total_amount, q.currency_code, q.valid_until,
                q.payment_policy, sc.code AS status, sc.name AS status_name, sc.is_terminal as "isTerminal",
                q.created_at, cu.first_name, cu.last_name, cu.primary_email,
                COALESCE(items.items, '[]'::json) AS items
         FROM quotes q
         JOIN status_catalog sc ON q.status_id = sc.id AND sc.domain = 'quote'
         JOIN customers cu ON q.customer_id = cu.id
         LEFT JOIN LATERAL (
           SELECT json_agg(json_build_object(
             'id', qi.id,
             'catalog_item_id', qi.pricing_catalog_id,
             'item_code', pc.item_code,
             'name', COALESCE(qi.custom_name, pc.name),
             'custom_name', qi.custom_name,
             'quantity', qi.quantity,
             'unit_price', qi.unit_price,
             'subtotal', qi.subtotal,
             'recurrence', qi.recurrence
           ) ORDER BY qi.created_at ASC) AS items
           FROM quote_items qi
           JOIN pricing_catalog pc ON pc.id = qi.pricing_catalog_id
           WHERE qi.quote_id = q.id
         ) items ON true
         WHERE q.deleted_at IS NULL AND lower(cu.primary_email) = lower($1)
         ORDER BY q.created_at DESC`,
        [email],
      );
      res.json({ data: result.rows, total: result.rowCount ?? 0 });
      return;
    }
    const isRestrictedPartner = req.admin?.roles.includes('partner_designer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    const restrictCondition = isRestrictedPartner ? ` AND q.created_by = $3` : '';
    const paramsList = isRestrictedPartner ? [limit, offset, req.admin?.id] : [limit, offset];
    const countCondition = isRestrictedPartner ? ` AND created_by = $1` : '';
    const countParams = isRestrictedPartner ? [req.admin?.id] : [];

    const [result, countResult] = await Promise.all([pool.query(
      `SELECT q.id, q.quote_code, q.total_amount, sc.code AS status, sc.name AS status_name, sc.is_terminal as "isTerminal",
              q.created_at, cu.first_name, cu.primary_email
       FROM quotes q
       JOIN status_catalog sc ON q.status_id = sc.id
       LEFT JOIN customers cu ON q.customer_id = cu.id
       WHERE q.deleted_at IS NULL${restrictCondition}
       ORDER BY q.created_at DESC
       LIMIT $1 OFFSET $2`,
      paramsList,
    ), pool.query(`SELECT count(*)::int AS total FROM quotes WHERE deleted_at IS NULL${countCondition}`, countParams)]);
    res.json({ data: result.rows, total: countResult.rows[0].total });
  })
);

router.get(
  '/quotes/:id',
  requirePermission('admin.cotizador.manage'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const isRestrictedPartner = req.admin?.roles.includes('partner_designer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    const quoteResult = await pool.query(
      `SELECT q.id, q.quote_code, q.total_amount, sc.code AS status, sc.name AS status_name, sc.is_terminal as "isTerminal",
              q.payment_policy, q.created_at,
              cu.first_name, cu.primary_email
       FROM quotes q
       JOIN status_catalog sc ON q.status_id = sc.id
       LEFT JOIN customers cu ON q.customer_id = cu.id
       WHERE q.id = $1 AND q.deleted_at IS NULL${isRestrictedPartner ? ' AND q.created_by = $2' : ''}`,
      isRestrictedPartner ? [id, req.admin?.id] : [id],
    );
    if (!quoteResult.rowCount || quoteResult.rowCount === 0) {
      throw new HttpError(404, 'Cotizacion no encontrada');
    }

    const itemsResult = await pool.query(
      `SELECT qi.id, qi.pricing_catalog_id AS catalog_item_id, pc.item_code, qi.custom_name,
              qi.quantity, qi.unit_price, qi.recurrence, pc.base_price, pc.max_price
       FROM quote_items qi
       JOIN pricing_catalog pc ON pc.id = qi.pricing_catalog_id
       WHERE qi.quote_id = $1
       ORDER BY qi.created_at ASC`,
      [id],
    );

    res.json({ quote: quoteResult.rows[0], items: itemsResult.rows });
  })
);

const createQuoteSchema = z.object({
  editingQuoteId: z.string().uuid().nullable().optional(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  items: z.array(z.object({
    catalog_item_id: z.string().uuid(),
    quantity: z.number().int().min(1),
    unit_price: z.number().optional(),
    recurrence: z.enum(['none', 'monthly', 'yearly']).optional(),
    custom_name: z.string().trim().min(1).max(180).optional()
  })).min(1),
  notes: z.string().max(2000).optional(),
  totalAmount: z.number().min(0).optional(),
  recurringMonthlyTotal: z.number().min(0).optional(),
  recurringYearlyTotal: z.number().min(0).optional(),
  projectCategory: z.string().trim().max(180).optional(),
  legalNotes: z.array(z.string().max(1000)).optional(),
  status: z.string().trim().min(1).max(80).optional(),
});

router.post(
  '/quotes',
  requireCsrf,
  requirePermission('admin.cotizador.manage'),
  requireNonTerminalState('quotes', 'editingQuoteId', true),
  asyncHandler(async (req: Request, res: Response) => {
    const body = createQuoteSchema.parse(req.body);
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      let customerId: string;
      const custRes = await client.query('SELECT id FROM customers WHERE primary_email = $1', [body.customerEmail]);
      if (custRes.rowCount && custRes.rowCount > 0) {
        customerId = custRes.rows[0].id;
      } else {
        const newCust = await client.query(
          'INSERT INTO customers (customer_code, first_name, primary_email) VALUES ($1, $2, $3) RETURNING id',
          [createBusinessCode('CUS'), body.customerName, body.customerEmail.toLowerCase()]
        );
        customerId = newCust.rows[0].id;
      }

      const quoteItemsData: Array<{ catalog_item_id: string; quantity: number; name: string; unitPrice: number; discountAmount: number; recurrence: 'none' | 'monthly' | 'yearly' }> = [];
      for (const item of body.items) {
        const catRes = await client.query(
          'SELECT id, name, base_price FROM pricing_catalog WHERE id = $1 AND is_active = true AND deleted_at IS NULL',
          [item.catalog_item_id],
        );
        if (!catRes.rowCount || catRes.rowCount === 0) throw new HttpError(400, 'Item de catálogo inválido');
        
        let unitPrice = item.unit_price ?? parseFloat(catRes.rows[0].base_price);
        let discountAmount = 0;
        
        if (unitPrice < 0) {
          discountAmount = Math.abs(unitPrice);
          unitPrice = 0;
        }

        quoteItemsData.push({
          catalog_item_id: item.catalog_item_id,
          quantity: item.quantity,
          name: item.custom_name ?? catRes.rows[0].name,
          unitPrice,
          discountAmount,
          recurrence: item.recurrence ?? 'none',
        });
      }

      const totalAmount = body.totalAmount ?? quoteItemsData
        .filter((item) => item.recurrence === 'none')
        .reduce((acc, item) => acc + (item.unitPrice - item.discountAmount) * item.quantity, 0);
      const paymentPolicyParts = [
        body.notes,
        body.projectCategory ? `Categoria de proyecto: ${body.projectCategory}` : undefined,
        body.recurringMonthlyTotal ? `Recurrente mensual: ${body.recurringMonthlyTotal}` : undefined,
        body.recurringYearlyTotal ? `Recurrente anual: ${body.recurringYearlyTotal}` : undefined,
        body.legalNotes?.length ? body.legalNotes.join('') : undefined,
      ].filter(Boolean);

      let previousQuoteState = null;
      let quoteId: string;
      if (body.editingQuoteId) {
        const isRestrictedPartner = req.admin?.roles.includes('partner_designer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
        const currentQuote = await client.query(
          `SELECT * FROM quotes WHERE id = $1 AND deleted_at IS NULL${isRestrictedPartner ? ' AND created_by = $2' : ''} FOR UPDATE`,
          isRestrictedPartner ? [body.editingQuoteId, req.admin?.id] : [body.editingQuoteId],
        );
        if (currentQuote.rowCount && currentQuote.rowCount > 0) previousQuoteState = currentQuote.rows[0];
        if (!previousQuoteState) throw new HttpError(404, 'Cotizacion no encontrada o sin permisos');

        let newStatusId: string | undefined;
        if (body.status) {
          const statusResult = await client.query(
            "SELECT id FROM status_catalog WHERE domain = 'quote' AND code = $1 AND is_active = true",
            [body.status],
          );
          if (!statusResult.rowCount) throw new HttpError(400, 'Estado de cotizacion invalido');
          newStatusId = statusResult.rows[0].id;
        }

        const quoteRes = await client.query(
          `UPDATE quotes
           SET customer_id = $1,
               total_amount = $2,
               payment_policy = $3,
               status_id = COALESCE($5, status_id),
               updated_at = now()
           WHERE id = $4 AND deleted_at IS NULL
           RETURNING id`,
          [customerId, totalAmount, paymentPolicyParts.join('') || null, body.editingQuoteId, newStatusId ?? null],
        );
        if (!quoteRes.rowCount || quoteRes.rowCount === 0) throw new HttpError(404, 'Cotizacion no encontrada');
        quoteId = quoteRes.rows[0].id;

        const oldStatusId = previousQuoteState.status_id as string | undefined;
        if (oldStatusId && newStatusId && oldStatusId !== newStatusId) {
          await client.query(
            `INSERT INTO quote_status_history (quote_id, old_status_id, new_status_id, changed_by)
             VALUES ($1, $2, $3, $4)`,
            [quoteId, oldStatusId, newStatusId, req.admin?.id ?? null],
          );
        }

        await client.query('DELETE FROM quote_items WHERE quote_id = $1', [quoteId]);
      } else {
        const quoteRes = await client.query(
          `INSERT INTO quotes (quote_code, customer_id, status_id, total_amount, valid_until, payment_policy, created_by)
           SELECT $1, $2, sc.id, $3, current_date + interval '30 days', $4, $5
           FROM status_catalog sc
           WHERE sc.domain = 'quote' AND sc.code = $6 AND sc.is_active = true
           RETURNING id`,
          [createBusinessCode('QT'), customerId, totalAmount, paymentPolicyParts.join('') || null, req.admin?.id, body.status ?? 'draft']
        );
        if (!quoteRes.rowCount) throw new HttpError(400, 'Estado de cotizacion invalido');
        quoteId = quoteRes.rows[0].id;
      }

      for (const qi of quoteItemsData) {
        await client.query(
          `INSERT INTO quote_items (quote_id, pricing_catalog_id, custom_name, quantity, unit_price, discount_amount, recurrence)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [quoteId, qi.catalog_item_id, qi.name, qi.quantity, qi.unitPrice, qi.discountAmount, qi.recurrence]
        );
      }

      const fullQuote = await client.query('SELECT * FROM quotes WHERE id = $1', [quoteId]);
      
      await auditService.logAdminAction({
        userId: req.admin?.id,
        action: body.editingQuoteId ? 'update' : 'create',
        entityType: 'quote',
        entity: fullQuote.rows[0],
        previousState: previousQuoteState,
        req
      });
      await client.query('COMMIT');
      res.status(body.editingQuoteId ? 200 : 201).json({ ok: true, quoteId });
    } catch (e: unknown) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  })
);

router.get(
  '/quotes/:id/history',
  requirePermission('admin.cotizador.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query(
      `SELECT h.changed_at AS timestamp,
              u.name AS user_name,
              u.email AS user_email,
              old_sc.code AS old_status,
              old_sc.name AS old_status_name,
              new_sc.code AS new_status,
              new_sc.name AS new_status_name
       FROM quote_status_history h
       LEFT JOIN status_catalog old_sc ON h.old_status_id = old_sc.id
       LEFT JOIN status_catalog new_sc ON h.new_status_id = new_sc.id
       LEFT JOIN admin_users u ON h.changed_by = u.id
       WHERE h.quote_id = $1
       ORDER BY h.changed_at DESC`,
      [z.string().uuid().parse(req.params.id)],
    );
    res.json({ items: result.rows });
  }),
);

router.delete(
  '/quotes/:id',
  requireCsrf,
  requirePermission('admin.cotizador.manage'),
  requireNonTerminalState('quotes'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const isRestrictedPartner = req.admin?.roles.includes('partner_designer') && !req.admin?.roles.includes('super_admin') && !req.admin?.roles.includes('admin');
    const current = await pool.query(
      `SELECT * FROM quotes WHERE id = $1${isRestrictedPartner ? ' AND created_by = $2' : ''}`, 
      isRestrictedPartner ? [id, req.admin?.id] : [id]
    );
    if (current.rowCount === 0) throw new HttpError(404, 'Cotizacion no encontrada o sin permisos');

    const result = await pool.query(
      'DELETE FROM quotes WHERE id = $1 RETURNING id',
      [id],
    );

    await auditService.logAdminAction({
      userId: req.admin?.id,
      action: 'delete',
      entityType: 'quote',
      entity: current.rows[0],
      previousState: current.rows[0],
      req
    });
    res.json({ ok: true });
  }),
);

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

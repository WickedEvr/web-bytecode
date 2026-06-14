import crypto from 'node:crypto';
import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import type { PoolClient } from 'pg';
import multer from 'multer';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';
import {
  deleteCloudinaryAsset,
  uploadPortfolioImageToCloudinary,
  type CloudinaryStoredAsset,
} from '../lib/cloudinary.js';
import { allowedUploadMimeTypeList, validateUpload } from '../lib/validateUpload.js';
import { requireAdmin, requireRole } from '../middleware/auth.js';
import { requireCsrf } from '../middleware/csrf.js';
import { audit } from '../services/audit.js';
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

const listQuerySchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
});

const updateSchema = z.object({
  status: z.enum(['new', 'read', 'in_progress', 'responded', 'closed']).optional(),
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

const createBusinessCode = (prefix: string) => `${prefix}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

router.get(
  '/stats',
  requireRole(['admin', 'support_agent', 'legal_reviewer']),
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
  requireRole(['admin', 'support_agent']),
  asyncHandler(async (req: Request, res: Response) => {
    const query = listQuerySchema.parse(req.query);
    const normalized = await hasNormalizedContactSchema();
    const contactSearchFields = normalized
      ? ['cu.first_name', 'cu.last_name', 'cu.primary_email', 'cu.primary_phone', 'c.subject', 'c.message', 'o.legal_name', 'o.ruc', 'co.position_title', 's.name']
      : ['cu.first_name', 'cu.last_name', 'cu.primary_email', 'cu.primary_phone', 'c.subject', 'c.message'];
    const { whereSql, params } = buildWhere(query.status, query.search, contactSearchFields);
    const result = await pool.query(
      `
      SELECT ${normalized ? contactColumns : legacyContactColumns}
      FROM contact_cases c
      ${normalized ? contactJoins : legacyContactJoins}
      ${whereSql}
      ORDER BY c.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
      [...params, query.limit, query.offset],
    );

    res.json({ items: result.rows });
  }),
);

router.get(
  '/contacts/:id',
  requireRole(['admin', 'support_agent']),
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
  requireRole(['admin', 'support_agent']),
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const body = updateSchema.parse(req.body);
    
    let statusId;
    if (body.status) {
      const statusRes = await pool.query("SELECT id FROM status_catalog WHERE domain='case' AND code=$1", [body.status]);
      if ((statusRes.rowCount ?? 0) > 0) statusId = statusRes.rows[0].id;
    }

    const result = await pool.query(
      `
      UPDATE contact_cases
      SET status_id = COALESCE($2, status_id),
          internal_notes = COALESCE($3, internal_notes),
          updated_at = now()
      WHERE id = $1
      RETURNING id
      `,
      [id, statusId ?? null, body.adminNotes ?? null],
    );

    if (result.rowCount === 0) throw new HttpError(404, 'Mensaje no encontrado.');
    await audit(req.admin?.id, 'update', 'contact_submission', id);
    
    const normalized = await hasNormalizedContactSchema();
    const updated = await pool.query(
      `SELECT ${normalized ? contactColumns : legacyContactColumns} FROM contact_cases c ${normalized ? contactJoins : legacyContactJoins} WHERE c.id = $1`, 
      [id]
    );
    res.json({ item: updated.rows[0] });
  }),
);

const assignSchema = z.object({
  assigned_to: z.string().uuid(),
  notes: z.string().max(3000).optional(),
});

router.post(
  '/contacts/:id/assign',
  requireCsrf,
  requireRole(['admin', 'support_agent']),
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const body = assignSchema.parse(req.body);
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
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
      await audit(req.admin?.id, 'assign', 'contact_submission', id);
      
      const normalized = await hasNormalizedContactSchema();
      const updated = await pool.query(
        `SELECT ${normalized ? contactColumns : legacyContactColumns} FROM contact_cases c ${normalized ? contactJoins : legacyContactJoins} WHERE c.id = $1`, 
        [id]
      );
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
  '/contacts/:id/history',
  requireRole(['admin', 'support_agent']),
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
  '/complaints',
  requireRole(['admin', 'support_agent', 'legal_reviewer']),
  asyncHandler(async (req: Request, res: Response) => {
    const query = listQuerySchema.parse(req.query);
    const { whereSql, params } = buildWhere(query.status, query.search, [
      'c.complaint_code',
      'cu.first_name',
      'cu.last_name',
      'cu.primary_email',
      'cg.category'
    ]);
    const result = await pool.query(
      `
      SELECT c.id, c.complaint_code as code, cu.first_name as nombres, cu.last_name as apellidos, cu.primary_email as email, cu.primary_phone as telefono, ct.name as claim_type, cg.category as tipo_reclamo, sc.code as status, fa.original_name as attachment_original_name, c.created_at, c.updated_at
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
    );

    res.json({ items: result.rows });
  }),
);

router.get(
  '/complaints/:id',
  requireRole(['admin', 'support_agent', 'legal_reviewer']),
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
  requireRole(['admin', 'support_agent', 'legal_reviewer']),
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const body = updateSchema.parse(req.body);
    
    let statusId;
    if (body.status) {
      const statusRes = await pool.query("SELECT id FROM status_catalog WHERE domain='case' AND code=$1", [body.status]);
      if ((statusRes.rowCount ?? 0) > 0) statusId = statusRes.rows[0].id;
    }

    const result = await pool.query(
      `
      UPDATE complaints
      SET status_id = COALESCE($2, status_id),
          internal_notes = COALESCE($3, internal_notes),
          updated_at = now()
      WHERE id = $1
      RETURNING id
      `,
      [id, statusId ?? null, body.adminNotes ?? null],
    );

    if (result.rowCount === 0) throw new HttpError(404, 'Reclamo no encontrado.');
    await audit(req.admin?.id, 'update', 'complaint', id);
    
    const updated = await pool.query(
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
    res.json({ item: updated.rows[0] });
  }),
);

router.get(
  '/complaints/:id/attachment',
  requireRole(['admin', 'support_agent', 'legal_reviewer']),
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

    await audit(req.admin?.id, 'download_attachment', 'complaint', id);
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
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.get(
  '/users',
  requireRole(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await pool.query(`
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
        WHERE u.deleted_at IS NULL
        GROUP BY u.id
        ORDER BY u.name ASC
      `);
      res.json({ items: result.rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }),
);

router.post(
  '/users',
  requireCsrf,
  requireRole(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const body = userCreateSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(body.password, 12);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const roleResult = await client.query('SELECT id FROM roles WHERE code = $1', [body.role]);
      if (roleResult.rowCount === 0) throw new HttpError(400, 'Rol inválido.');
      const roleId = roleResult.rows[0].id;

      const result = await client.query(
        `INSERT INTO admin_users (email, name, password_hash, created_by)
         VALUES ($1, $2, $3, $4) RETURNING id, email, name, is_active, created_at`,
        [body.email.toLowerCase(), body.name, passwordHash, req.admin?.id]
      );
      const newUserId = result.rows[0].id;

      await client.query(
        `INSERT INTO admin_user_roles (admin_user_id, role_id, assigned_by)
         VALUES ($1, $2, $3)`,
        [newUserId, roleId, req.admin?.id]
      );

      await client.query('COMMIT');
      await audit(req.admin?.id, 'create', 'admin_user', newUserId);
      res.status(201).json({ item: { ...result.rows[0], role: body.role } });
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
  requireRole(['admin']),
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
        const roleResult = await client.query('SELECT id FROM roles WHERE code = $1', [body.role]);
        if (roleResult.rowCount === 0) throw new HttpError(400, 'Rol inválido.');
        const roleId = roleResult.rows[0].id;

        await client.query('DELETE FROM admin_user_roles WHERE admin_user_id = $1', [id]);
        await client.query(
          `INSERT INTO admin_user_roles (admin_user_id, role_id, assigned_by) VALUES ($1, $2, $3)`,
          [id, roleId, req.admin?.id]
        );
        updatedRole = body.role;
      }

      const result = await client.query(
        `UPDATE admin_users 
          SET name = COALESCE($2, name), 
              is_active = COALESCE($3, is_active),
              updated_at = now(),
              updated_by = $4
          WHERE id = $1 
          RETURNING id, email, name, is_active, updated_at`,
        [id, body.name ?? null, body.isActive ?? null, req.admin?.id]
      );

      await client.query('COMMIT');
      await audit(req.admin?.id, 'update', 'admin_user', id);
      res.json({ item: { ...result.rows[0], role: updatedRole } });
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
  requireRole(['admin']),
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

      const roleResult = await client.query('SELECT id FROM roles WHERE code = $1', [role]);
      if (roleResult.rowCount === 0) throw new HttpError(400, 'Rol inválido.');
      const roleId = roleResult.rows[0].id;

      await client.query('DELETE FROM admin_user_roles WHERE admin_user_id = $1', [id]);
      await client.query(
        `INSERT INTO admin_user_roles (admin_user_id, role_id, assigned_by) VALUES ($1, $2, $3)`,
        [id, roleId, req.admin?.id]
      );

      await client.query('COMMIT');
      await audit(req.admin?.id, 'update_role', 'admin_user', id);
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
  requireRole(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query('SELECT setting_key, setting_value, description, is_sensitive FROM system_settings ORDER BY setting_key');
    const items = result.rows.map((row: any) => {
      if (row.is_sensitive) {
        // Enmascarar contraseñas o tokens (ej: SMTP pass)
        const maskedValue = { ...row.setting_value };
        for (const key of Object.keys(maskedValue)) {
          if (typeof maskedValue[key] === 'string' && (key.toLowerCase().includes('pass') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('key'))) {
            maskedValue[key] = '********';
          }
        }
        return { ...row, setting_value: maskedValue };
      }
      return row;
    });
    res.json({ items });
  })
);

router.patch(
  '/settings',
  requireCsrf,
  requireRole(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const { settings } = settingsUpdateSchema.parse(req.body);

    for (const setting of settings) {
      // Evitar sobreescribir con valores enmascarados
      let valueToSave = setting.setting_value;
      
      if (setting.is_sensitive) {
        // Recuperar el actual para mezclar
        const current = await pool.query('SELECT setting_value FROM system_settings WHERE setting_key = $1', [setting.setting_key]);
        if (current.rowCount && current.rowCount > 0) {
          const currentVal = current.rows[0].setting_value;
          const merged = { ...currentVal };
          for (const key of Object.keys(valueToSave)) {
            if (valueToSave[key] !== '********') {
              merged[key] = valueToSave[key];
            }
          }
          valueToSave = merged;
        }
      }

      await pool.query(
        `INSERT INTO system_settings (setting_key, setting_value, description, is_sensitive, updated_by)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (setting_key) DO UPDATE
         SET setting_value = EXCLUDED.setting_value, 
             description = COALESCE(EXCLUDED.description, system_settings.description),
             is_sensitive = COALESCE(EXCLUDED.is_sensitive, system_settings.is_sensitive),
             updated_at = now(), 
             updated_by = EXCLUDED.updated_by`,
        [setting.setting_key, JSON.stringify(valueToSave), setting.description ?? '', setting.is_sensitive ?? false, req.admin?.id]
      );
    }

    await audit(req.admin?.id, 'update', 'system_settings', null);
    res.json({ ok: true });
  })
);

// --- Logs Endpoints ---

router.get(
  '/logs',
  requireRole(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const query = listQuerySchema.parse(req.query);
    const result = await pool.query(
      `
      SELECT l.id, l.action, l.entity_type, l.entity_id, l.created_at, u.name as admin_name, u.email as admin_email
      FROM admin_audit_logs l
      LEFT JOIN admin_users u ON l.admin_id = u.id
      ORDER BY l.created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [query.limit, query.offset]
    );
    res.json({ items: result.rows });
  })
);

// --- CMS Endpoints ---

const cmsPageUpdateSchema = z.object({
  title: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  is_published: z.boolean().optional(),
});

router.get(
  '/cms/pages',
  requireRole(['admin', 'partner_designer']),
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await pool.query(
      'SELECT id, slug, title, meta_title, meta_description, is_published, created_at, updated_at FROM cms_pages ORDER BY slug'
    );
    res.json({ items: result.rows });
  })
);

router.patch(
  '/cms/pages/:id',
  requireCsrf,
  requireRole(['admin', 'partner_designer']),
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const body = cmsPageUpdateSchema.parse(req.body);

    const result = await pool.query(
      `UPDATE cms_pages
       SET title = COALESCE($2, title),
           meta_title = COALESCE($3, meta_title),
           meta_description = COALESCE($4, meta_description),
           is_published = COALESCE($5, is_published),
           updated_at = now()
       WHERE id = $1
       RETURNING id, slug, title, meta_title, meta_description, is_published, updated_at`,
      [id, body.title ?? null, body.meta_title ?? null, body.meta_description ?? null, body.is_published ?? null]
    );

    if (result.rowCount === 0) throw new HttpError(404, 'Página no encontrada.');
    await audit(req.admin?.id, 'update', 'cms_page', id);
    res.json({ item: result.rows[0] });
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
  isPublished: portfolioBoolean(true),
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
    pi.is_published,
    pi.published_at,
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
  GROUP BY pi.id, fa.public_url, fa.storage_key, pia.alt_text
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
  requireRole(['admin', 'partner_designer']),
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
  requireRole(['admin', 'partner_designer']),
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

    await audit(req.admin?.id, 'upsert', 'technology_catalog', result.rows[0].id);
    res.status(201).json({ item: result.rows[0] });
  }),
);

router.get(
  '/portfolio',
  requireRole(['admin', 'partner_designer']),
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await pool.query(`${selectPortfolioItemsSql} ${portfolioGroupOrderSql}`);
    res.json({ items: result.rows });
  }),
);

router.post(
  '/portfolio',
  requireCsrf,
  requireRole(['admin', 'partner_designer']),
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
      const result = await client.query(
        `INSERT INTO portfolio_items (
          item_code, name, client_name, description, website_url, sort_order,
          is_featured, is_published, published_at, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CASE WHEN $8 THEN now() ELSE NULL END, $9)
        RETURNING id`,
        [
          itemCode,
          body.name,
          body.clientName || null,
          body.description || null,
          body.websiteUrl ?? null,
          body.sortOrder,
          body.isFeatured,
          body.isPublished,
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
      await audit(req.admin?.id, 'create', 'portfolio_item', id);

      const created = await pool.query(`${selectPortfolioItemsSql} AND pi.id = $1 ${portfolioGroupOrderSql}`, [id]);
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
  requireRole(['admin', 'partner_designer']),
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const body = portfolioItemUpdateSchema.parse(req.body);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const result = await client.query(
        `UPDATE portfolio_items
         SET name = COALESCE($2, name),
             client_name = COALESCE($3, client_name),
             description = COALESCE($4, description),
             website_url = COALESCE($5, website_url),
             sort_order = COALESCE($6, sort_order),
             is_featured = COALESCE($7, is_featured),
             is_published = COALESCE($8, is_published),
             published_at = CASE
               WHEN $8::boolean = true AND published_at IS NULL THEN now()
               WHEN $8::boolean = false THEN NULL
               ELSE published_at
             END,
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
          body.isPublished ?? null,
          req.admin?.id ?? null,
        ],
      );

      if (result.rowCount === 0) throw new HttpError(404, 'Proyecto de portafolio no encontrado.');

      if (body.technologyIds) {
        await replacePortfolioTechnologies(client, id, body.technologyIds, req.admin?.id);
      }

      await client.query('COMMIT');
      await audit(req.admin?.id, 'update', 'portfolio_item', id);

      const updated = await pool.query(`${selectPortfolioItemsSql} AND pi.id = $1 ${portfolioGroupOrderSql}`, [id]);
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
  requireRole(['admin', 'partner_designer']),
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await pool.query(
      `UPDATE portfolio_items
       SET deleted_at = now(), updated_at = now(), updated_by = $2
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id, req.admin?.id ?? null],
    );

    if (result.rowCount === 0) throw new HttpError(404, 'Proyecto de portafolio no encontrado.');
    await audit(req.admin?.id, 'delete', 'portfolio_item', id);
    res.json({ ok: true });
  }),
);

router.post(
  '/portfolio/:id/image',
  requireCsrf,
  requireRole(['admin', 'partner_designer']),
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
      await audit(req.admin?.id, 'upload_image', 'portfolio_item', id);

      const updated = await pool.query(`${selectPortfolioItemsSql} AND pi.id = $1 ${portfolioGroupOrderSql}`, [id]);
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
  requireRole(['admin', 'partner_designer']),
  asyncHandler(async (req: Request, res: Response) => {
    const columns = await getPricingCatalogColumns();
    const itemTypeSql = columns.item_type ? 'pc.item_type' : 'NULL::varchar AS item_type';
    const upgradesSql = columns.upgrades_to_category ? 'pc.upgrades_to_category' : 'NULL::varchar AS upgrades_to_category';
    const draggableSql = columns.is_draggable ? 'pc.is_draggable' : 'NULL::boolean AS is_draggable';
    const iconSql = columns.icon_name ? 'pc.icon_name' : 'NULL::varchar AS icon_name';
    const freeIncludedSql = columns.free_included_quantity ? 'pc.free_included_quantity' : 'NULL::integer AS free_included_quantity';
    const includedFeaturesSql = columns.included_features ? 'pc.included_features' : "'[]'::jsonb AS included_features";
    const orderSql = columns.item_type
      ? `CASE pc.item_type
          WHEN 'base_canvas' THEN 0
          WHEN 'base_included' THEN 1
          WHEN 'addon' THEN 2
          WHEN 'category_trigger' THEN 3
          WHEN 'recurring' THEN 4
          ELSE 5
        END`
      : `CASE pc.item_code
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
             COALESCE(pro.base_price, pc.base_price) AS base_price, 
             COALESCE(pro.max_price, pc.max_price) AS max_price,
             ${freeIncludedSql}, ${includedFeaturesSql}, pc.currency_code,
             ${itemTypeSql}, ${upgradesSql}, ${draggableSql}, ${iconSql},
             COALESCE(pro.base_price, pc.base_price) AS unit_price
      FROM pricing_catalog pc
      LEFT JOIN pricing_role_overrides pro 
        ON pc.id = pro.pricing_catalog_id AND pro.role_name = $1
      WHERE pc.is_active = true AND pc.deleted_at IS NULL
      ORDER BY ${orderSql}, pc.name ASC
      `,
      [userRole]
    );
    res.json({ items: result.rows });
  })
);

router.get(
  '/quotations',
  requireRole(['admin', 'partner_designer']),
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await pool.query(
      `SELECT q.id, q.quote_code, q.total_amount, q.status, q.created_at, cu.first_name, cu.primary_email
       FROM quotes q
       LEFT JOIN customers cu ON q.customer_id = cu.id
       WHERE q.deleted_at IS NULL
       ORDER BY q.created_at DESC
       LIMIT 100`
    );
    res.json({ items: result.rows });
  })
);

router.get(
  '/quotations/:id',
  requireRole(['admin', 'partner_designer']),
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const quoteResult = await pool.query(
      `SELECT q.id, q.quote_code, q.total_amount, q.status, q.payment_policy, q.created_at,
              cu.first_name, cu.primary_email
       FROM quotes q
       LEFT JOIN customers cu ON q.customer_id = cu.id
       WHERE q.id = $1 AND q.deleted_at IS NULL`,
      [id],
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
  legalNotes: z.array(z.string().max(1000)).optional()
});

router.post(
  '/quotations',
  requireCsrf,
  requireRole(['admin', 'partner_designer']),
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

      const quoteItemsData: Array<{ catalog_item_id: string; quantity: number; name: string; unitPrice: number; recurrence: 'none' | 'monthly' | 'yearly' }> = [];
      for (const item of body.items) {
        const catRes = await client.query(
          'SELECT id, name, base_price FROM pricing_catalog WHERE id = $1 AND is_active = true AND deleted_at IS NULL',
          [item.catalog_item_id],
        );
        if (!catRes.rowCount || catRes.rowCount === 0) throw new HttpError(400, 'Item de catálogo inválido');
        const unitPrice = item.unit_price ?? parseFloat(catRes.rows[0].base_price);
        quoteItemsData.push({
          catalog_item_id: item.catalog_item_id,
          quantity: item.quantity,
          name: item.custom_name ?? catRes.rows[0].name,
          unitPrice,
          recurrence: item.recurrence ?? 'none',
        });
      }

      const totalAmount = body.totalAmount ?? quoteItemsData
        .filter((item) => item.recurrence === 'none')
        .reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
      const paymentPolicyParts = [
        body.notes,
        body.projectCategory ? `Categoria de proyecto: ${body.projectCategory}` : undefined,
        body.recurringMonthlyTotal ? `Recurrente mensual: ${body.recurringMonthlyTotal}` : undefined,
        body.recurringYearlyTotal ? `Recurrente anual: ${body.recurringYearlyTotal}` : undefined,
        body.legalNotes?.length ? body.legalNotes.join('\n') : undefined,
      ].filter(Boolean);

      let quoteId: string;
      if (body.editingQuoteId) {
        const quoteRes = await client.query(
          `UPDATE quotes
           SET customer_id = $1,
               total_amount = $2,
               payment_policy = $3,
               updated_at = now()
           WHERE id = $4 AND deleted_at IS NULL
           RETURNING id`,
          [customerId, totalAmount, paymentPolicyParts.join('\n\n') || null, body.editingQuoteId],
        );
        if (!quoteRes.rowCount || quoteRes.rowCount === 0) throw new HttpError(404, 'Cotizacion no encontrada');
        quoteId = quoteRes.rows[0].id;
        await client.query('DELETE FROM quote_items WHERE quote_id = $1', [quoteId]);
      } else {
        const quoteRes = await client.query(
          `INSERT INTO quotes (quote_code, customer_id, status, total_amount, valid_until, payment_policy, created_by)
           VALUES ($1, $2, 'draft', $3, current_date + interval '30 days', $4, $5) RETURNING id`,
          [createBusinessCode('QT'), customerId, totalAmount, paymentPolicyParts.join('\n\n') || null, req.admin?.id]
        );
        quoteId = quoteRes.rows[0].id;
      }

      for (const qi of quoteItemsData) {
        await client.query(
          `INSERT INTO quote_items (quote_id, pricing_catalog_id, custom_name, quantity, unit_price, recurrence)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [quoteId, qi.catalog_item_id, qi.name, qi.quantity, qi.unitPrice, qi.recurrence]
        );
      }

      await audit(req.admin?.id, body.editingQuoteId ? 'update' : 'create', 'quote', quoteId);
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

router.delete(
  '/quotations/:id',
  requireCsrf,
  requireRole(['admin', 'partner_designer']),
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const result = await pool.query(
      'DELETE FROM quotes WHERE id = $1 RETURNING id',
      [id],
    );

    if (!result.rowCount || result.rowCount === 0) {
      throw new HttpError(404, 'Cotizacion no encontrada');
    }

    await audit(req.admin?.id, 'delete', 'quote', id);
    res.json({ ok: true });
  }),
);

export default router;

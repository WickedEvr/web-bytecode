import crypto from 'node:crypto';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';
import { requireAdmin, requireRole } from '../middleware/auth.js';
import { requireCsrf } from '../middleware/csrf.js';
import { audit } from '../services/audit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();

router.use(requireAdmin);

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
  c.id, cu.first_name as nombre, '' as cargo, cu.primary_email as email, cu.primary_phone as celular, 
  '' as empresa, '' as ruc, c.subject as servicio, sc.code as status, c.internal_notes as admin_notes, 
  c.assigned_to, c.created_at, c.updated_at
`;

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
    const { whereSql, params } = buildWhere(query.status, query.search, ['cu.first_name', 'cu.primary_email', 'c.subject']);
    const result = await pool.query(
      `
      SELECT ${contactColumns}
      FROM contact_cases c
      JOIN customers cu ON c.customer_id = cu.id
      JOIN status_catalog sc ON c.status_id = sc.id
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
    const result = await pool.query(
      `SELECT ${contactColumns} FROM contact_cases c JOIN customers cu ON c.customer_id = cu.id JOIN status_catalog sc ON c.status_id = sc.id WHERE c.id = $1`, 
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
    
    const updated = await pool.query(
      `SELECT ${contactColumns} FROM contact_cases c JOIN customers cu ON c.customer_id = cu.id JOIN status_catalog sc ON c.status_id = sc.id WHERE c.id = $1`, 
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
      
      const updated = await pool.query(
        `SELECT ${contactColumns} FROM contact_cases c JOIN customers cu ON c.customer_id = cu.id JOIN status_catalog sc ON c.status_id = sc.id WHERE c.id = $1`, 
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
          array_remove(array_agg(r.code), NULL) as roles
        FROM admin_users u
        LEFT JOIN admin_user_roles aur ON u.id = aur.admin_user_id
        LEFT JOIN roles r ON aur.role_id = r.id
        WHERE u.deleted_at IS NULL AND u.is_active = true
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

    try {
      const result = await pool.query(
        `INSERT INTO admin_users (email, name, password_hash, role, created_by)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, is_active, created_at`,
        [body.email.toLowerCase(), body.name, passwordHash, body.role, req.admin?.id]
      );
      await audit(req.admin?.id, 'create', 'admin_user', result.rows[0].id);
      res.status(201).json({ item: result.rows[0] });
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err && err.code === '23505') {
        throw new HttpError(409, 'El correo ya está en uso.');
      }
      throw err;
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

    const currentUser = await pool.query('SELECT role FROM admin_users WHERE id = $1', [id]);
    if (currentUser.rowCount === 0) throw new HttpError(404, 'Usuario no encontrado.');

    if (currentUser.rows[0].role === 'super_admin' && !req.admin?.roles.includes('super_admin')) {
      throw new HttpError(403, 'No puedes modificar a un super administrador.');
    }

    const result = await pool.query(
      `UPDATE admin_users 
        SET name = COALESCE($2, name), 
            role = COALESCE($3, role), 
            is_active = COALESCE($4, is_active),
            updated_at = now(),
            updated_by = $5
        WHERE id = $1 
        RETURNING id, email, name, role, is_active, updated_at`,
      [id, body.name ?? null, body.role ?? null, body.isActive ?? null, req.admin?.id]
    );

    if (result.rowCount === 0) throw new HttpError(404, 'Usuario no encontrado.');
    await audit(req.admin?.id, 'update', 'admin_user', id);
    res.json({ item: result.rows[0] });
  }),
);

router.patch(
  '/users/:id/roles',
  requireCsrf,
  requireRole(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const { role } = z.object({ role: z.string() }).parse(req.body);

    const currentUser = await pool.query('SELECT role FROM admin_users WHERE id = $1', [id]);
    if (currentUser.rowCount === 0) throw new HttpError(404, 'Usuario no encontrado.');

    if (currentUser.rows[0].role === 'super_admin' && !req.admin?.roles.includes('super_admin')) {
      throw new HttpError(403, 'No puedes modificar a un super administrador.');
    }

    const result = await pool.query(
      'UPDATE admin_users SET role = $2, updated_at = now(), updated_by = $3 WHERE id = $1 RETURNING id, role',
      [id, role, req.admin?.id]
    );
    await audit(req.admin?.id, 'update_role', 'admin_user', id);
    res.json({ item: result.rows[0] });
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

// --- Quotes Endpoints ---

router.get(
  '/catalog/pricing',
  requireRole(['admin', 'partner_designer']),
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await pool.query(
      `
      SELECT id, item_code, name, description, pricing_model, base_price, max_price,
             currency_code, base_price AS unit_price
      FROM pricing_catalog
      WHERE is_active = true AND deleted_at IS NULL
      ORDER BY name ASC
      `,
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

const createQuoteSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  items: z.array(z.object({
    catalog_item_id: z.string().uuid(),
    quantity: z.number().int().min(1)
  })).min(1),
  notes: z.string().max(2000).optional()
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

      let totalAmount = 0;
      const quoteItemsData: Array<{ catalog_item_id: string; quantity: number; name: string; unitPrice: number }> = [];
      for (const item of body.items) {
        const catRes = await client.query(
          'SELECT id, name, base_price FROM pricing_catalog WHERE id = $1 AND is_active = true AND deleted_at IS NULL',
          [item.catalog_item_id],
        );
        if (!catRes.rowCount || catRes.rowCount === 0) throw new HttpError(400, 'Item de catálogo inválido');
        const unitPrice = parseFloat(catRes.rows[0].base_price);
        totalAmount += unitPrice * item.quantity;
        quoteItemsData.push({ ...item, name: catRes.rows[0].name, unitPrice });
      }

      const quoteRes = await client.query(
        `INSERT INTO quotes (quote_code, customer_id, status, total_amount, valid_until, payment_policy, created_by)
         VALUES ($1, $2, 'draft', $3, current_date + interval '30 days', $4, $5) RETURNING id`,
        [createBusinessCode('QT'), customerId, totalAmount, body.notes ?? null, req.admin?.id]
      );
      const quoteId = quoteRes.rows[0].id;

      for (const qi of quoteItemsData) {
        await client.query(
          `INSERT INTO quote_items (quote_id, pricing_catalog_id, custom_name, quantity, unit_price)
           VALUES ($1, $2, $3, $4, $5)`,
          [quoteId, qi.catalog_item_id, qi.name, qi.quantity, qi.unitPrice]
        );
      }

      await audit(req.admin?.id, 'create', 'quote', quoteId);
      await client.query('COMMIT');
      res.status(201).json({ ok: true, quoteId });
    } catch (e: unknown) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  })
);

export default router;

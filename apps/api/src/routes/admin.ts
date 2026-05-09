import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { requireAdmin } from '../middleware/auth.js';
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
  c.created_at, c.updated_at
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
  c.created_at, c.updated_at
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
  asyncHandler(async (_req, res) => {
    const [contacts, complaints] = await Promise.all([
      pool.query('SELECT sc.code as status, count(*)::int AS total FROM contact_cases c JOIN status_catalog sc ON c.status_id = sc.id GROUP BY sc.code'),
      pool.query('SELECT sc.code as status, count(*)::int AS total FROM complaints c JOIN status_catalog sc ON c.status_id = sc.id GROUP BY sc.code'),    
    ]);

    res.json({
      contacts: contacts.rows,
      complaints: complaints.rows,
    });
  }),
);

router.get(
  '/contacts',
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
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

router.get(
  '/complaints',
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req, res) => {
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

export default router;

import fs from 'node:fs';
import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { requireAdmin } from '../middleware/auth.js';
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

const buildWhere = (status?: string, search?: string, fields: string[] = []) => {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (status) {
    params.push(status);
    clauses.push(`status = $${params.length}`);
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
      pool.query('SELECT status, count(*)::int AS total FROM contact_submissions GROUP BY status'),
      pool.query('SELECT status, count(*)::int AS total FROM complaints GROUP BY status'),
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
    const { whereSql, params } = buildWhere(query.status, query.search, ['nombre', 'email', 'empresa', 'servicio']);
    const result = await pool.query(
      `
      SELECT id, nombre, cargo, email, celular, empresa, ruc, servicio, status, admin_notes, created_at, updated_at
      FROM contact_submissions
      ${whereSql}
      ORDER BY created_at DESC
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
    const result = await pool.query('SELECT * FROM contact_submissions WHERE id = $1', [id]);
    if (result.rowCount === 0) throw new HttpError(404, 'Mensaje no encontrado.');
    res.json({ item: result.rows[0] });
  }),
);

router.patch(
  '/contacts/:id',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const body = updateSchema.parse(req.body);
    const result = await pool.query(
      `
      UPDATE contact_submissions
      SET status = COALESCE($2, status),
          admin_notes = COALESCE($3, admin_notes),
          updated_at = now()
      WHERE id = $1
      RETURNING *
      `,
      [id, body.status ?? null, body.adminNotes ?? null],
    );

    if (result.rowCount === 0) throw new HttpError(404, 'Mensaje no encontrado.');
    await audit(req.admin?.id, 'update', 'contact_submission', id);
    res.json({ item: result.rows[0] });
  }),
);

router.get(
  '/complaints',
  asyncHandler(async (req, res) => {
    const query = listQuerySchema.parse(req.query);
    const { whereSql, params } = buildWhere(query.status, query.search, [
      'code',
      'nombres',
      'apellidos',
      'email',
      'tipo_reclamo',
    ]);
    const result = await pool.query(
      `
      SELECT id, code, nombres, apellidos, email, telefono, claim_type, tipo_reclamo, status,
             attachment_original_name, created_at, updated_at
      FROM complaints
      ${whereSql}
      ORDER BY created_at DESC
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
    const result = await pool.query('SELECT * FROM complaints WHERE id = $1', [id]);
    if (result.rowCount === 0) throw new HttpError(404, 'Reclamo no encontrado.');
    res.json({ item: result.rows[0] });
  }),
);

router.patch(
  '/complaints/:id',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const body = updateSchema.parse(req.body);
    const result = await pool.query(
      `
      UPDATE complaints
      SET status = COALESCE($2, status),
          admin_notes = COALESCE($3, admin_notes),
          updated_at = now()
      WHERE id = $1
      RETURNING *
      `,
      [id, body.status ?? null, body.adminNotes ?? null],
    );

    if (result.rowCount === 0) throw new HttpError(404, 'Reclamo no encontrado.');
    await audit(req.admin?.id, 'update', 'complaint', id);
    res.json({ item: result.rows[0] });
  }),
);

router.get(
  '/complaints/:id/attachment',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const result = await pool.query(
      'SELECT attachment_original_name, attachment_mime_type, attachment_path FROM complaints WHERE id = $1',
      [id],
    );

    if (result.rowCount === 0) throw new HttpError(404, 'Reclamo no encontrado.');

    const item = result.rows[0];
    if (!item.attachment_path || !fs.existsSync(item.attachment_path)) {
      throw new HttpError(404, 'Adjunto no encontrado.');
    }

    await audit(req.admin?.id, 'download_attachment', 'complaint', id);
    res.setHeader('Content-Type', item.attachment_mime_type ?? 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(item.attachment_original_name)}"`);
    fs.createReadStream(item.attachment_path).pipe(res);
  }),
);

export default router;

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../../db/pool.js';
import { requirePermission } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { auditService } from '../../services/audit.js';

const directoryRouter = Router();

// --- RUTAS DE ORGANIZACIONES (B2B) ---

directoryRouter.get(
  '/organizations',
  requirePermission('admin.directorio.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 9;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const status = (req.query.status as string) || 'active';
    
    let statusFilter = '';
    if (status === 'active') statusFilter = 'AND o.deleted_at IS NULL';
    else if (status === 'inactive') statusFilter = 'AND o.deleted_at IS NOT NULL';
    
    const countResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM organizations o
      WHERE (o.legal_name ILIKE $1 OR o.trade_name ILIKE $1 OR o.ruc ILIKE $1)
      ${statusFilter}
    `, [search]);
    
    const total = parseInt(countResult.rows[0].total, 10);

    const result = await pool.query(`
      SELECT 
        o.id, 
        o.legal_name, 
        o.trade_name, 
        o.ruc, 
        o.industry,
        o.country_id,
        o.created_at,
        c.iso2 AS country_iso,
        c.name AS country_name,
        o.deleted_at IS NULL as is_active,
        COUNT(co.customer_id) as contacts_count
      FROM organizations o
      LEFT JOIN customer_organizations co ON o.id = co.organization_id AND co.deleted_at IS NULL
      LEFT JOIN countries c ON o.country_id = c.id
      WHERE (o.legal_name ILIKE $3 OR o.trade_name ILIKE $3 OR o.ruc ILIKE $3)
      ${statusFilter}
      GROUP BY o.id, c.iso2, c.name
      ORDER BY o.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset, search]);
    
    res.json({ items: result.rows, total });
  })
);

// --- RUTAS DE CUSTOMERS (B2C y B2B) ---

directoryRouter.get(
  '/customers',
  requirePermission('admin.directorio.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 9;
    const offset = Number(req.query.offset) || 0;
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const status = (req.query.status as string) || 'active';
    
    let statusFilter = '';
    if (status === 'active') statusFilter = 'AND c.deleted_at IS NULL';
    else if (status === 'inactive') statusFilter = 'AND c.deleted_at IS NOT NULL';

    const countResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM customers c
      WHERE (c.first_name ILIKE $1 OR c.last_name ILIKE $1 OR c.primary_email ILIKE $1)
      ${statusFilter}
    `, [search]);

    const total = parseInt(countResult.rows[0].total, 10);

    const result = await pool.query(`
      SELECT 
        c.id,
        c.customer_code,
        c.first_name,
        c.last_name,
        c.display_name,
        c.person_type,
        c.primary_email,
        c.primary_phone,
        c.created_at,
        c.country_id,
        cou.iso2 AS country_iso,
        cou.name AS country_name,
        cd.document_type_id,
        dt.name AS document_type_name,
        cd.document_number,
        c.deleted_at IS NULL as is_active,
        coalesce(
          json_agg(
            json_build_object('id', o.id, 'name', coalesce(o.trade_name, o.legal_name), 'position', co.position_title)
          ) FILTER (WHERE o.id IS NOT NULL), 
          '[]'
        ) as organizations
      FROM customers c
      LEFT JOIN countries cou ON c.country_id = cou.id
      LEFT JOIN customer_documents cd ON c.id = cd.customer_id AND cd.deleted_at IS NULL AND cd.is_primary = true
      LEFT JOIN document_types dt ON cd.document_type_id = dt.id
      LEFT JOIN customer_organizations co ON c.id = co.customer_id AND co.deleted_at IS NULL
      LEFT JOIN organizations o ON co.organization_id = o.id AND o.deleted_at IS NULL
      WHERE (c.first_name ILIKE $3 OR c.last_name ILIKE $3 OR c.primary_email ILIKE $3)
      ${statusFilter}
      GROUP BY c.id, c.country_id, cou.iso2, cou.name, cd.document_type_id, dt.name, cd.document_number
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset, search]);
    
    res.json({ items: result.rows, total });
  })
);

// --- ESQUEMAS DE VALIDACIÓN ZOD ---
const organizationSchema = z.object({
  legal_name: z.string().min(2, 'La Razón Social debe tener al menos 2 caracteres').max(200),
  trade_name: z.string().max(200).optional().nullable(),
  ruc: z.string().max(50).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  country_id: z.string().uuid('ID de país inválido').optional().nullable(),
});

const customerSchema = z.object({
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(100),
  primary_email: z.string().email('Email inválido').max(150),
  primary_phone: z.string().max(50).optional().nullable(),
  person_type: z.enum(['natural', 'company_contact']).default('natural'),
  country_id: z.string().uuid('ID de país inválido').optional().nullable(),
  document_type_id: z.string().uuid('ID de documento inválido').optional().nullable(),
  document_number: z.string().max(50).optional().nullable(),
  organization_id: z.string().uuid('ID de empresa inválido').optional().nullable(),
  position_title: z.string().max(100).optional().nullable(),
});

// --- MUTACIONES DE ORGANIZACIONES ---
directoryRouter.post(
  '/organizations',
  requirePermission('admin.directorio.edit'),
  asyncHandler(async (req: Request, res: Response) => {
    const body = organizationSchema.parse(req.body);
    const result = await pool.query(
      `INSERT INTO organizations (legal_name, trade_name, ruc, industry, country_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [body.legal_name, body.trade_name || body.legal_name, body.ruc, body.industry, body.country_id]
    );
    await auditService.logAdminAction({ userId: req.admin?.id, action: 'create', entityType: 'organizations', entity: result.rows[0], req });
    res.status(201).json(result.rows[0]);
  })
);

directoryRouter.put(
  '/organizations/:id',
  requirePermission('admin.directorio.edit'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const body = organizationSchema.parse(req.body);
    const oldRes = await pool.query('SELECT * FROM organizations WHERE id = $1', [id]);
    const previousState = oldRes.rows[0];
    const result = await pool.query(
      `UPDATE organizations 
       SET legal_name = $1, trade_name = $2, ruc = $3, industry = $4, country_id = $5, updated_at = NOW() 
       WHERE id = $6 AND deleted_at IS NULL RETURNING *`,
      [body.legal_name, body.trade_name || body.legal_name, body.ruc, body.industry, body.country_id, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Organización no encontrada' });
    await auditService.logAdminAction({ userId: req.admin?.id, action: 'update', entityType: 'organizations', entity: result.rows[0], previousState, req });
    res.json(result.rows[0]);
  })
);

directoryRouter.delete(
  '/organizations/:id',
  requirePermission('admin.directorio.edit'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const oldRes = await pool.query('SELECT * FROM organizations WHERE id = $1', [id]);
    const previousState = oldRes.rows[0];
    const result = await pool.query(
      `UPDATE organizations SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Organización no encontrada' });
    await auditService.logAdminAction({ userId: req.admin?.id, action: 'delete', entityType: 'organizations', entity: result.rows[0], previousState, req });
    res.json({ message: 'Organización eliminada (Soft Delete)' });
  })
);

directoryRouter.patch(
  '/organizations/:id/restore',
  requirePermission('admin.directorio.edit'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const oldRes = await pool.query('SELECT * FROM organizations WHERE id = $1', [id]);
    const previousState = oldRes.rows[0];
    const result = await pool.query(
      `UPDATE organizations SET deleted_at = NULL WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Organización no encontrada' });
    await auditService.logAdminAction({ userId: req.admin?.id, action: 'restore', entityType: 'organizations', entity: result.rows[0], previousState, req });
    res.json({ message: 'Organización restaurada' });
  })
);

// --- MUTACIONES DE CUSTOMERS ---
directoryRouter.post(
  '/customers',
  requirePermission('admin.directorio.edit'),
  asyncHandler(async (req: Request, res: Response) => {
    const body = customerSchema.parse(req.body);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const { randomBytes } = await import('crypto');
      const customerCode = `CUS-${randomBytes(4).toString('hex').toUpperCase()}`;

      const customerRes = await client.query(
        `INSERT INTO customers (customer_code, first_name, last_name, person_type, primary_email, primary_phone, country_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [customerCode, body.first_name, body.last_name, body.person_type, body.primary_email.toLowerCase(), body.primary_phone, body.country_id]
      );
      const customerId = customerRes.rows[0].id;

      if (body.document_type_id && body.document_number) {
        await client.query(
          `INSERT INTO customer_documents (customer_id, document_type_id, document_number, is_primary) VALUES ($1, $2, $3, true)`,
          [customerId, body.document_type_id, body.document_number]
        );
      }

      if (body.organization_id) {
        await client.query(
          `INSERT INTO customer_organizations (customer_id, organization_id, position_title, is_primary) VALUES ($1, $2, $3, true)`,
          [customerId, body.organization_id, body.position_title]
        );
      }

      await client.query('COMMIT');
      await auditService.logAdminAction({ userId: req.admin?.id, action: 'create', entityType: 'customers', entity: customerRes.rows[0], req });
      res.status(201).json({ id: customerId, message: 'Contacto creado exitosamente' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  })
);

directoryRouter.put(
  '/customers/:id',
  requirePermission('admin.directorio.edit'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const body = customerSchema.parse(req.body);
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      const oldRes = await client.query('SELECT * FROM customers WHERE id = $1', [id]);
      const previousState = oldRes.rows[0];
      
      const updateRes = await client.query(
        `UPDATE customers 
         SET first_name = $1, last_name = $2, person_type = $3, primary_email = $4, primary_phone = $5, country_id = $6, updated_at = NOW() 
         WHERE id = $7 AND deleted_at IS NULL RETURNING *`,
        [body.first_name, body.last_name, body.person_type, body.primary_email.toLowerCase(), body.primary_phone, body.country_id, id]
      );
      
      if (updateRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Contacto no encontrado' });
      }

      // Actualizar documento primario
      if (body.document_type_id && body.document_number) {
        const docExist = await client.query(`SELECT customer_id FROM customer_documents WHERE customer_id = $1 AND is_primary = true AND deleted_at IS NULL`, [id]);
        if (docExist.rowCount && docExist.rowCount > 0) {
          await client.query(`UPDATE customer_documents SET document_type_id = $1, document_number = $2 WHERE customer_id = $3 AND is_primary = true`, [body.document_type_id, body.document_number, id]);
        } else {
          await client.query(`INSERT INTO customer_documents (customer_id, document_type_id, document_number, is_primary) VALUES ($1, $2, $3, true)`, [id, body.document_type_id, body.document_number]);
        }
      } else {
        await client.query(`UPDATE customer_documents SET deleted_at = NOW() WHERE customer_id = $1 AND is_primary = true`, [id]);
      }

      // Actualizar organización primaria
      if (body.organization_id) {
        const orgExist = await client.query(`SELECT customer_id FROM customer_organizations WHERE customer_id = $1 AND is_primary = true AND deleted_at IS NULL`, [id]);
        if (orgExist.rowCount && orgExist.rowCount > 0) {
          await client.query(`UPDATE customer_organizations SET organization_id = $1, position_title = $2 WHERE customer_id = $3 AND is_primary = true`, [body.organization_id, body.position_title, id]);
        } else {
          await client.query(`INSERT INTO customer_organizations (customer_id, organization_id, position_title, is_primary) VALUES ($1, $2, $3, true)`, [id, body.organization_id, body.position_title]);
        }
      } else {
        await client.query(`UPDATE customer_organizations SET deleted_at = NOW() WHERE customer_id = $1 AND is_primary = true`, [id]);
      }

      await client.query('COMMIT');
      await auditService.logAdminAction({ userId: req.admin?.id, action: 'update', entityType: 'customers', entity: updateRes.rows[0], previousState, req });
      res.json({ id, message: 'Contacto actualizado exitosamente' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  })
);

directoryRouter.delete(
  '/customers/:id',
  requirePermission('admin.directorio.edit'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const oldRes = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    const previousState = oldRes.rows[0];
    const result = await pool.query(
      `UPDATE customers SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Contacto no encontrado' });
    await auditService.logAdminAction({ userId: req.admin?.id, action: 'delete', entityType: 'customers', entity: result.rows[0], previousState, req });
    res.json({ message: 'Contacto eliminado (Soft Delete)' });
  })
);

directoryRouter.patch(
  '/customers/:id/restore',
  requirePermission('admin.directorio.edit'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const oldRes = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    const previousState = oldRes.rows[0];
    const result = await pool.query(
      `UPDATE customers SET deleted_at = NULL WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Contacto no encontrado' });
    await auditService.logAdminAction({ userId: req.admin?.id, action: 'restore', entityType: 'customers', entity: result.rows[0], previousState, req });
    res.json({ message: 'Contacto restaurado' });
  })
);

export default directoryRouter;

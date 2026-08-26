import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../../db/pool.js';
import { requirePermission } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const directoryRouter = Router();

// --- RUTAS DE ORGANIZACIONES (B2B) ---

directoryRouter.get(
  '/organizations',
  requirePermission('admin.directorio.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 9;
    const offset = Number(req.query.offset) || 0;
    const search = req.query.search ? `%${req.query.search}%` : '%';
    
    const countResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM organizations o
      WHERE o.deleted_at IS NULL
      AND (o.legal_name ILIKE $1 OR o.trade_name ILIKE $1 OR o.ruc ILIKE $1)
    `, [search]);
    
    const total = parseInt(countResult.rows[0].total, 10);

    const result = await pool.query(`
      SELECT 
        o.id, 
        o.legal_name, 
        o.trade_name, 
        o.ruc, 
        o.industry,
        o.created_at,
        COUNT(co.customer_id) as contacts_count
      FROM organizations o
      LEFT JOIN customer_organizations co ON o.id = co.organization_id AND co.deleted_at IS NULL
      WHERE o.deleted_at IS NULL
      AND (o.legal_name ILIKE $3 OR o.trade_name ILIKE $3 OR o.ruc ILIKE $3)
      GROUP BY o.id
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

    const countResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM customers c
      WHERE c.deleted_at IS NULL
      AND (c.first_name ILIKE $1 OR c.last_name ILIKE $1 OR c.primary_email ILIKE $1)
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
        cou.iso2 AS country_iso,
        cou.name AS country_name,
        dt.name AS document_type_name,
        cd.document_number,
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
      WHERE c.deleted_at IS NULL
      AND (c.first_name ILIKE $3 OR c.last_name ILIKE $3 OR c.primary_email ILIKE $3)
      GROUP BY c.id, cou.iso2, cou.name, dt.name, cd.document_number
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset, search]);
    
    res.json({ items: result.rows, total });
  })
);

export default directoryRouter;

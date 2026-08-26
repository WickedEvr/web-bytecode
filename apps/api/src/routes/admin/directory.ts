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
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    res.json({ items: result.rows });
  })
);

// --- RUTAS DE CUSTOMERS (B2C y B2B) ---

directoryRouter.get(
  '/customers',
  requirePermission('admin.directorio.view'),
  asyncHandler(async (req: Request, res: Response) => {
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
        coalesce(
          json_agg(
            json_build_object('id', o.id, 'name', coalesce(o.trade_name, o.legal_name), 'position', co.position_title)
          ) FILTER (WHERE o.id IS NOT NULL), 
          '[]'
        ) as organizations
      FROM customers c
      LEFT JOIN customer_organizations co ON c.id = co.customer_id AND co.deleted_at IS NULL
      LEFT JOIN organizations o ON co.organization_id = o.id AND o.deleted_at IS NULL
      WHERE c.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json({ items: result.rows });
  })
);

export default directoryRouter;

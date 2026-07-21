import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../../db/pool.js';
import { HttpError } from '../../utils/httpError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireCsrf } from '../../middleware/csrf.js';
import { requirePermission } from '../../middleware/auth.js';
import { requireNonTerminalState } from '../../middleware/requireNonTerminalState.js';
import { requireQuoteOwnership } from '../../middleware/abac.js';
import { paginationQuerySchema, createBusinessCode } from './shared.js';
import { auditService } from '../../services/audit.js';

export const quotesRouter = Router();

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

quotesRouter.get(
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

quotesRouter.get(
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

quotesRouter.get(
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

quotesRouter.post(
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

quotesRouter.get(
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

quotesRouter.delete(
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
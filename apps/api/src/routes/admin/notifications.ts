import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../../db/pool.js';
import { requirePermission } from '../../middleware/auth.js';
import { requireCsrf } from '../../middleware/csrf.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { auditService } from '../../services/audit.js';

const notificationsRouter = Router();

// --- NOTIFICACIONES IN-APP (Bandeja del Usuario) ---

// Obtener notificaciones no leídas para la campana
notificationsRouter.get(
  '/notifications/unread',
  asyncHandler(async (req: Request, res: Response) => {
    const adminId = req.admin?.id;
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await pool.query(`
      SELECT * FROM admin_notifications 
      WHERE admin_user_id = $1 AND read_at IS NULL 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [adminId]);

    res.json(result.rows);
  })
);

// Marcar notificación como leída
notificationsRouter.put(
  '/notifications/:id/read',
  requireCsrf,
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const adminId = req.admin?.id;
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await pool.query(`
      UPDATE admin_notifications 
      SET read_at = NOW() 
      WHERE id = $1 AND admin_user_id = $2 
      RETURNING *
    `, [id, adminId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    res.json(result.rows[0]);
  })
);

// --- REGLAS DE NOTIFICACIÓN (Gestión por Super Admin) ---

// Obtener todas las reglas
notificationsRouter.get(
  '/notification-rules',
  requirePermission('admin.notificaciones.view'),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query(`
      SELECT nr.id, nr.event_type, nr.role_id, nr.is_active, r.name as role_name, r.display_name as role_display_name
      FROM notification_rules nr
      JOIN roles r ON nr.role_id = r.id
      ORDER BY nr.event_type ASC
    `);
    res.json(result.rows);
  })
);

// Crear/asignar un rol a un tipo de evento
notificationsRouter.post(
  '/notification-rules',
  requirePermission('admin.notificaciones.edit'),
  requireCsrf,
  asyncHandler(async (req: Request, res: Response) => {
    const schema = z.object({
      event_type: z.string(),
      role_id: z.string().uuid()
    });
    const body = schema.parse(req.body);

    const result = await pool.query(`
      INSERT INTO notification_rules (event_type, role_id) 
      VALUES ($1, $2) 
      ON CONFLICT (event_type, role_id) 
      DO UPDATE SET is_active = true, updated_at = NOW() 
      RETURNING *
    `, [body.event_type, body.role_id]);

    await auditService.logAdminAction({ userId: req.admin?.id, action: 'create', entityType: 'notification_rules', entity: result.rows[0], req });
    res.status(201).json(result.rows[0]);
  })
);

// Desactivar (soft-delete / toggle) una regla
notificationsRouter.delete(
  '/notification-rules/:id',
  requirePermission('admin.notificaciones.edit'),
  requireCsrf,
  asyncHandler(async (req: Request, res: Response) => {
    const id = z.string().uuid().parse(req.params.id);
    const oldRes = await pool.query('SELECT * FROM notification_rules WHERE id = $1', [id]);
    
    if (oldRes.rowCount === 0) return res.status(404).json({ message: 'Regla no encontrada' });
    const previousState = oldRes.rows[0];

    // Simplemente la eliminamos de manera dura o lógica (ahora usaremos dura para limpiar, o desactivar)
    // Para no dejar basura, la eliminamos duro, ya que es sólo una tabla de cruce.
    await pool.query('DELETE FROM notification_rules WHERE id = $1', [id]);
    
    await auditService.logAdminAction({ userId: req.admin?.id, action: 'delete', entityType: 'notification_rules', entity: previousState, previousState, req });
    res.json({ message: 'Regla eliminada' });
  })
);

export default notificationsRouter;

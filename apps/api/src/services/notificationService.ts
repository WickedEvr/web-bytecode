import { pool } from '../db/pool.js';

export async function sendInAppNotification(
  eventType: string,
  title: string,
  body: string,
  entityType?: string,
  entityId?: string
) {
  try {
    // Buscar a todos los administradores (usuarios) cuyos roles estén suscritos a este evento
    const res = await pool.query(`
      SELECT au.id as admin_user_id
      FROM admin_users au
      JOIN notification_rules nr ON au.role_id = nr.role_id
      WHERE nr.event_type = $1 AND nr.is_active = true AND au.is_active = true
    `, [eventType]);

    const adminUserIds = res.rows.map(r => r.admin_user_id);

    if (adminUserIds.length === 0) {
      console.log(`No active users subscribed to event: ${eventType}`);
      return;
    }

    // Insertar notificaciones masivas para todos los usuarios encontrados
    const values: any[] = [];
    let queryArgs = '';
    let argIndex = 1;

    adminUserIds.forEach(userId => {
      queryArgs += `($${argIndex++}, $${argIndex++}, $${argIndex++}, $${argIndex++}, $${argIndex++}),`;
      values.push(userId, title, body, entityType || null, entityId || null);
    });

    queryArgs = queryArgs.slice(0, -1); // Eliminar la última coma

    await pool.query(`
      INSERT INTO admin_notifications (admin_user_id, title, body, entity_type, entity_id)
      VALUES ${queryArgs}
    `, values);

    // Opcional: Si usan WebSockets o SSE, se podría emitir un evento aquí a los adminUserIds
    // io.to(userId).emit('new_notification')
  } catch (error) {
    console.error(`Failed to send in-app notification for event ${eventType}:`, error);
  }
}

export async function enqueueEmail(
  templateCode: string,
  recipientEmail: string,
  payload: Record<string, unknown>,
  entityType?: string,
  entityId?: string
) {
  try {
    const res = await pool.query('SELECT id FROM notification_templates WHERE code = $1 AND is_active = true', [templateCode]);
    if (res.rowCount === 0) {
      console.warn(`Template ${templateCode} not found or inactive. Cannot enqueue email.`);
      return;
    }
    const templateId = res.rows[0].id;

    // Guardaremos el payload JSON en 'error_message' temporalmente para que el Worker pueda 
    // compilar las variables antes de enviar.
    // Esto es un hack limpio ya que no hay una columna 'payload' y error_message es text.
    await pool.query(`
      INSERT INTO notification_events (template_id, recipient_email, channel, status, error_message, entity_type, entity_id)
      VALUES ($1, $2, 'email', 'pending', $3, $4, $5)
    `, [templateId, recipientEmail, JSON.stringify(payload), entityType || null, entityId || null]);

  } catch (error) {
    console.error(`Failed to enqueue email for ${recipientEmail}:`, error);
  }
}

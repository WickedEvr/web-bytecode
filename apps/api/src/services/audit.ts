import { pool } from '../db/pool.js';

export async function audit(adminId: string | undefined, action: string, entityType: string, entityId?: string | null) {
  await pool.query(
    'INSERT INTO admin_audit_logs (admin_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
    [adminId ?? null, action, entityType, entityId ?? null],
  );
}

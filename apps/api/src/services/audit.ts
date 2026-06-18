import { Request } from 'express';
import { pool } from '../db/pool.js';

export const auditService = {
  async logAdminAction(payload: {
    userId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    entity?: any;
    previousState?: any;
    req?: Request;
  }) {
    const { userId, action, entityType, entity, previousState, req, entityId: explicitEntityId } = payload;
    let ipAddress = null;
    let userAgent = null;

    if (req) {
      const xForwardedFor = req.headers['x-forwarded-for'];
      if (Array.isArray(xForwardedFor)) {
        ipAddress = xForwardedFor[0];
      } else if (typeof xForwardedFor === 'string') {
        ipAddress = xForwardedFor.split(',')[0].trim();
      } else {
        ipAddress = req.socket?.remoteAddress || null;
      }
      userAgent = req.headers['user-agent'] || null;
    }

    let entityId = explicitEntityId;
    
    if (entityId === undefined || entityId === null) {
      if (entity && typeof entity === 'object') {
        entityId = entity.id || null;
      } else {
        entityId = null;
      }
    }

    const details = {
      before: previousState || null,
      after: (typeof entity === 'string') ? null : (entity || null),
    };

    await pool.query(
      `INSERT INTO admin_audit_logs 
        (admin_id, action, entity_type, entity_id, details, ip_address, user_agent) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId || null,
        action,
        entityType,
        entityId,
        details,
        ipAddress || null,
        userAgent || null,
      ]
    );
  }
};

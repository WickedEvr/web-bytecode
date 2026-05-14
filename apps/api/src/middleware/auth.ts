import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { pool } from '../db/pool.js';
import { HttpError } from '../utils/httpError.js';

export const clearAdminCookie = (res: Response) => {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    sameSite: env.cookieSameSite,
    secure: env.isProduction,
    path: '/',
  });
  res.clearCookie('bc_csrf', {
    httpOnly: false,
    sameSite: env.cookieSameSite,
    secure: env.isProduction,
    path: '/',
  });
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.[env.cookieName];
    if (!token) {
      throw new HttpError(401, 'No autenticado.');
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await pool.query(
      `
      SELECT 
        s.id AS session_id,
        u.id, u.email, u.name, u.role, u.is_active,
        COALESCE((
          SELECT array_agg(DISTINCT p.code)
          FROM permissions p
          JOIN role_permissions rp ON p.id = rp.permission_id
          JOIN roles r ON rp.role_id = r.id
          LEFT JOIN admin_user_roles aur ON r.id = aur.role_id AND aur.admin_user_id = u.id
          WHERE r.code = u.role OR aur.admin_user_id = u.id
        ), ARRAY[]::varchar[]) as permissions
      FROM admin_sessions s
      JOIN admin_users u ON s.admin_user_id = u.id
      WHERE s.token_hash = $1
        AND s.expires_at > NOW()
        AND s.revoked_at IS NULL
      `,
      [tokenHash],
    );

    if (result.rowCount === 0) {
      clearAdminCookie(res);
      throw new HttpError(401, 'Sesión inválida o expirada.');
    }

    const row = result.rows[0];

    if (!row.is_active) {
      clearAdminCookie(res);
      throw new HttpError(401, 'Usuario inactivo.');
    }

    req.admin = {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      permissions: row.permissions,
    };
    req.sessionId = row.session_id;

    next();
  } catch (error: unknown) {
    next(error instanceof HttpError ? error : new HttpError(401, 'Sesión inválida.'));
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.admin) return next(new HttpError(401, 'No autenticado.'));
    if (req.admin.role === 'super_admin') return next();
    
    if (!allowedRoles.includes(req.admin.role)) {
      return next(new HttpError(403, 'Acceso denegado (Rol no autorizado).'));
    }
    next();
  };
};

export const requirePermission = (permissionCode: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.admin) return next(new HttpError(401, 'No autenticado.'));
    if (req.admin.role === 'super_admin') return next();
    
    if (!req.admin.permissions?.includes(permissionCode)) {
      return next(new HttpError(403, 'Acceso denegado (Permiso requerido).'));
    }
    next();
  };
};

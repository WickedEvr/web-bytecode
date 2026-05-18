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
        s.expires_at,
        u.id, u.email, u.name, u.role, u.is_active,
        COALESCE((
          SELECT array_agg(DISTINCT p.code)
          FROM permissions p
          JOIN role_permissions rp ON p.id = rp.permission_id
          WHERE rp.role_id IN (SELECT role_id FROM admin_user_roles WHERE admin_user_id = u.id)
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

    const timeRemaining = new Date(row.expires_at).getTime() - Date.now();
    if (timeRemaining < (45 * 60 * 1000)) {
      pool.query(`UPDATE admin_sessions SET expires_at = NOW() + INTERVAL '1 hour' WHERE id = $1`, [row.session_id]).catch(console.error);
      res.cookie(env.cookieName, token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 60 * 60 * 1000, path: '/' });
    }

    const roleResult = await pool.query(
      `
      SELECT r.code
      FROM admin_user_roles aur
      JOIN roles r ON aur.role_id = r.id
      WHERE aur.admin_user_id = $1
      `,
      [row.id],
    );
    const roles = [...new Set([...roleResult.rows.map((roleRow) => roleRow.code), row.role].filter(Boolean))];

    req.admin = {
      id: row.id,
      email: row.email,
      name: row.name,
      roles,
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
    if (req.admin.roles.includes('super_admin')) return next();
    
    const hasRole = req.admin.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return next(new HttpError(403, 'Acceso denegado (Rol no autorizado).'));
    }
    next();
  };
};

export const requirePermission = (permissionCode: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.admin) return next(new HttpError(401, 'No autenticado.'));
    if (req.admin.roles.includes('super_admin')) return next();
    
    if (!req.admin.permissions?.includes(permissionCode)) {
      return next(new HttpError(403, 'Acceso denegado (Permiso requerido).'));
    }
    next();
  };
};

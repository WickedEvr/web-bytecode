import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { pool } from '../db/pool.js';
import { HttpError } from '../utils/httpError.js';
import type { AdminUser } from '../types.js';

interface JwtPayload {
  sub: string;
}

export const createAdminToken = (admin: AdminUser) =>
  jwt.sign({ sub: admin.id }, env.jwtSecret, { expiresIn: '8h' });

export const setAdminCookie = (res: Response, token: string) => {
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    sameSite: env.cookieSameSite,
    secure: env.isProduction,
    maxAge: 8 * 60 * 60 * 1000,
    path: '/',
  });
  res.cookie('bc_csrf', crypto.randomUUID(), {
    httpOnly: false,
    sameSite: env.cookieSameSite,
    secure: env.isProduction,
    maxAge: 8 * 60 * 60 * 1000,
    path: '/',
  });
};

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

export const requireAdmin = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.[env.cookieName];
    if (!token) {
      throw new HttpError(401, 'No autenticado.');
    }

    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    
    // Obtenemos el usuario y sus permisos combinados (por rol principal y por roles asignados adicionales)
    const result = await pool.query(
      `
      SELECT u.id, u.email, u.name, u.role,
      COALESCE((
        SELECT array_agg(DISTINCT p.code)
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN roles r ON rp.role_id = r.id
        LEFT JOIN admin_user_roles aur ON r.id = aur.role_id AND aur.admin_user_id = u.id
        WHERE r.code = u.role OR aur.admin_user_id = u.id
      ), ARRAY[]::varchar[]) as permissions
      FROM admin_users u
      WHERE u.id = $1 AND u.is_active = true
      `,
      [payload.sub],
    );

    if (result.rowCount === 0) {
      throw new HttpError(401, 'Sesión inválida.');
    }

    req.admin = result.rows[0];
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


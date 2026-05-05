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
    const result = await pool.query(
      'SELECT id, email, name, role FROM admin_users WHERE id = $1 AND is_active = true',
      [payload.sub],
    );

    if (result.rowCount === 0) {
      throw new HttpError(401, 'Sesión inválida.');
    }

    req.admin = result.rows[0];
    next();
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, 'Sesión inválida.'));
  }
};

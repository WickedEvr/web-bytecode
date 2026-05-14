import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { UAParser } from 'ua-parser-js';
import { env } from '../config/env.js';
import { pool } from '../db/pool.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { clearAdminCookie, requireAdmin } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiters.js';
import { audit } from '../services/audit.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const body = loginSchema.parse(req.body);
    const result = await pool.query(
      `
      SELECT u.id, u.email, u.name, u.role, u.password_hash,
      COALESCE((
        SELECT array_agg(DISTINCT p.code)
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        JOIN roles r ON rp.role_id = r.id
        LEFT JOIN admin_user_roles aur ON r.id = aur.role_id AND aur.admin_user_id = u.id
        WHERE r.code = u.role OR aur.admin_user_id = u.id
      ), ARRAY[]::varchar[]) as permissions
      FROM admin_users u 
      WHERE u.email = $1 AND u.is_active = true
      `,
      [body.email.toLowerCase()],
    );

    if (result.rowCount === 0) {
      throw new HttpError(401, 'Credenciales inválidas.');
    }

    const admin = result.rows[0];
    const validPassword = await bcrypt.compare(body.password, admin.password_hash);
    if (!validPassword) {
      throw new HttpError(401, 'Credenciales inválidas.');
    }

    await pool.query('UPDATE admin_users SET last_login_at = now(), updated_at = now() WHERE id = $1', [admin.id]);

    // Phase 1: Secure Session Management
    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
    
    // Extract Metadata
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : req.socket.remoteAddress || req.ip;
    const userAgent = req.get('user-agent') || 'unknown';
    
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + ONE_HOUR_MS);

    // Database Insertion
    await pool.query(
      `
      INSERT INTO admin_sessions (admin_user_id, token_hash, ip_address, user_agent, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [admin.id, tokenHash, ipAddress, userAgent, expiresAt]
    );

    // Secure Cookies
    res.cookie(env.cookieName, plainToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ONE_HOUR_MS,
      path: '/',
    });
    
    // Maintain CSRF compatibility cookie
    res.cookie('bc_csrf', crypto.randomUUID(), {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
      maxAge: ONE_HOUR_MS,
      path: '/',
    });

    const publicAdmin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions,
    };

    await audit(admin.id, 'login', 'admin_user', admin.id);
    res.json({ admin: publicAdmin });
  }),
);

router.post('/logout', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  if (req.sessionId) {
    await pool.query('UPDATE admin_sessions SET revoked_at = NOW() WHERE id = $1', [req.sessionId]);
  }
  await audit(req.admin?.id, 'logout', 'admin_user', req.admin?.id);
  clearAdminCookie(res);
  res.json({ ok: true });
}));

router.get('/me', requireAdmin, (req: Request, res: Response) => {
  res.json({ admin: req.admin });
});

router.get('/sessions', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query(
    `
    SELECT id, ip_address, user_agent, created_at, expires_at
    FROM admin_sessions
    WHERE admin_user_id = $1
      AND revoked_at IS NULL
      AND expires_at > NOW()
    ORDER BY created_at DESC
    `,
    [req.admin?.id]
  );

  const sessions = result.rows.map((row) => {
    const parser = new UAParser(row.user_agent || '');
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    const deviceType = device.type || 'desktop';
    const osName = os.name ? `${os.name} ${os.version || ''}`.trim() : 'Unknown OS';
    const browserName = browser.name ? `${browser.name} ${browser.version || ''}`.trim() : 'Unknown Browser';

    return {
      id: row.id,
      ip_address: row.ip_address,
      deviceType,
      osName,
      browserName,
      created_at: row.created_at,
      expires_at: row.expires_at,
      isCurrentSession: row.id === req.sessionId,
    };
  });

  res.json({ sessions });
}));

const revokeSchema = z.object({
  sessionId: z.string().uuid(),
});

router.post('/sessions/:sessionId/revoke', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const params = revokeSchema.parse(req.params);

  const result = await pool.query(
    `
    UPDATE admin_sessions
    SET revoked_at = NOW()
    WHERE id = $1 AND admin_user_id = $2
    RETURNING id
    `,
    [params.sessionId, req.admin?.id]
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, 'Sesión no encontrada o no pertenece al usuario.');
  }

  await audit(req.admin?.id, 'revoke_session', 'admin_sessions', params.sessionId);
  
  res.json({ ok: true, message: 'Sesión revocada exitosamente.' });
}));

export default router;

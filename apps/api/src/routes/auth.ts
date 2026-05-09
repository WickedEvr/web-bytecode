import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { clearAdminCookie, createAdminToken, requireAdmin, setAdminCookie } from '../middleware/auth.js';
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
  asyncHandler(async (req, res) => {
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

    const publicAdmin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions,
    };

    setAdminCookie(res, createAdminToken(publicAdmin));
    await audit(admin.id, 'login', 'admin_user', admin.id);
    res.json({ admin: publicAdmin });
  }),
);

router.post('/logout', requireAdmin, asyncHandler(async (req, res) => {
  await audit(req.admin?.id, 'logout', 'admin_user', req.admin?.id);
  clearAdminCookie(res);
  res.json({ ok: true });
}));

router.get('/me', requireAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

export default router;

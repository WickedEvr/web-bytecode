import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { clearAdminCookie, createAdminToken, requireAdmin, setAdminCookie } from '../middleware/auth.js';
import { audit } from '../services/audit.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const result = await pool.query(
      'SELECT id, email, name, role, password_hash FROM admin_users WHERE email = $1 AND is_active = true',
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

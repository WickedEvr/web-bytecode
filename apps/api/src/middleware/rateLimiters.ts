import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import type { Request } from 'express';

export const loginRateLimitKey = (req: Request) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase() : '';
  return `${ipKeyGenerator(req.ip ?? '')}:${email}`;
};

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: loginRateLimitKey,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ message: 'Demasiados intentos. Espera 15 minutos.' });
  },
});

export const publicFormLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ message: 'Demasiados envíos. Intenta más tarde.' });
  },
});

export const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ message: 'Límite de solicitudes administrativas alcanzado.' });
  },
});

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { ZodError } from 'zod';
import { createRequire } from 'node:module';
import type { RequestHandler } from 'express';
import { env } from './config/env.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import { HttpError } from './utils/httpError.js';
import { adminLimiter } from './middleware/rateLimiters.js';
import crypto from 'node:crypto';

export const app = express();
const allowedCorsOrigins = new Set(env.corsOrigins);
const require = createRequire(import.meta.url);

const compressionMiddleware = (): RequestHandler => {
  try {
    const compression = require('compression') as () => RequestHandler;
    return compression();
  } catch {
    return (_req, _res, next) => next();
  }
};

app.set('trust proxy', 1);

// Correlation ID Middleware
app.use((req, res, next) => {
  req.headers['x-correlation-id'] = req.headers['x-correlation-id'] || crypto.randomUUID();
  res.setHeader('x-correlation-id', req.headers['x-correlation-id']);
  next();
});

// Advanced Helmet Config
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "res.cloudinary.com"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, false);
        return;
      }

      if (allowedCorsOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin not allowed.'));
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(compressionMiddleware());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global Rate Limiter
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Structured Request Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (env.isProduction) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        correlationId: req.headers['x-correlation-id'],
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        durationMs: duration,
        ip: req.ip,
      }));
    }
  });
  next();
});

import { pool } from './db/pool.js';

// Healthchecks
app.get('/health', async (_req, res) => {
  let dbOk = false;
  try {
    const resDb = await pool.query('SELECT 1');
    if (resDb.rowCount === 1) dbOk = true;
  } catch {
    dbOk = false;
  }
  
  res.json({ 
    ok: dbOk,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: env.nodeEnv,
    db: dbOk ? 'connected' : 'disconnected'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);
app.use('/api/admin', adminLimiter, adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada.' });
});

// Global Error Handler
app.use((error: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const correlationId = req.headers['x-correlation-id'];
  
  if (error instanceof ZodError) {
    if (env.isProduction) {
      const fields = [...new Set(error.issues.map((issue) => issue.path.join('.')).filter(Boolean))];
      res.status(400).json({
        error: 'Datos inválidos',
        fields,
        correlationId,
      });
      return;
    }

    res.status(400).json({
      message: 'Datos inválidos.',
      issues: error.issues,
      correlationId,
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ message: `El archivo supera el limite de ${env.maxUploadMb}MB.`, correlationId });
      return;
    }

    res.status(400).json({ message: 'Archivo adjunto invalido.', correlationId });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message, correlationId });
    return;
  }

  // Structured Error Logging
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    correlationId,
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
  }));
  
  res.status(500).json({ message: 'Error interno del servidor.', correlationId });
});

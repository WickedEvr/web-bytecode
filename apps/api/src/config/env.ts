import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const repoRoot = path.resolve(apiRoot, '../..');

dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config({ path: path.join(apiRoot, '.env') });
dotenv.config({ path: path.join(repoRoot, '.env.local'), override: true });
dotenv.config({ path: path.join(apiRoot, '.env.local'), override: true });

const parseList = (value?: string) =>
  value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  return ['true', '1', 'yes'].includes(value.toLowerCase());
};

const requireInProduction = (key: string, value: string | undefined) => {
  if (process.env.NODE_ENV === 'production' && !value) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
};

requireInProduction('DATABASE_URL', process.env.DATABASE_URL);
requireInProduction('JWT_SECRET', process.env.JWT_SECRET);
requireInProduction('CORS_ORIGINS', process.env.CORS_ORIGINS);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/bytecode',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-change-this-secret',
  cookieName: process.env.COOKIE_NAME ?? 'bc_admin',
  cookieSameSite: (process.env.COOKIE_SAME_SITE ?? (process.env.NODE_ENV === 'production' ? 'none' : 'lax')) as
    | 'lax'
    | 'strict'
    | 'none',
  corsOrigins: parseList(process.env.CORS_ORIGINS),
  publicApiUrl: process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 4000}`,
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? './uploads'),
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB ?? 10),
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: parseBoolean(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM ?? 'Bytecode Web <no-reply@bytecode.com.pe>',
  },
  notificationEmails: parseList(process.env.ADMIN_NOTIFICATION_EMAILS),
  adminSeeds: [
    {
      name: process.env.ADMIN_1_NAME,
      email: process.env.ADMIN_1_EMAIL,
      password: process.env.ADMIN_1_PASSWORD,
    },
    {
      name: process.env.ADMIN_2_NAME,
      email: process.env.ADMIN_2_EMAIL,
      password: process.env.ADMIN_2_PASSWORD,
    },
  ].filter((admin) => admin.email && admin.password),
  isProduction: process.env.NODE_ENV === 'production',
};

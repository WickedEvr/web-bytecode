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

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const requireInProduction = (key: string, value: string | undefined) => {
  if (process.env.NODE_ENV === 'production' && !value) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
};

const smtpHasPartialConfig = Boolean(process.env.SMTP_HOST || process.env.SMTP_USER || process.env.SMTP_PASS);
const smtpRequired = parseBoolean(process.env.REQUIRE_SMTP, false);

requireInProduction('DATABASE_URL', process.env.DATABASE_URL);
requireInProduction('JWT_SECRET', process.env.JWT_SECRET);
requireInProduction('CORS_ORIGINS', process.env.CORS_ORIGINS);
requireInProduction('CLOUDINARY_CLOUD_NAME', process.env.CLOUDINARY_CLOUD_NAME);
requireInProduction('CLOUDINARY_API_KEY', process.env.CLOUDINARY_API_KEY);
requireInProduction('CLOUDINARY_API_SECRET', process.env.CLOUDINARY_API_SECRET);

if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === 'dev-only-change-this-secret') {
  console.error('JWT_SECRET must not use the development fallback in production.');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production' && smtpRequired) {
  requireInProduction('SMTP_HOST', process.env.SMTP_HOST);
  requireInProduction('SMTP_USER', process.env.SMTP_USER);
  requireInProduction('SMTP_PASS', process.env.SMTP_PASS);
}

if (smtpHasPartialConfig && !(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)) {
  console.error('SMTP configuration is incomplete. Set SMTP_HOST, SMTP_USER and SMTP_PASS together.');
  process.exit(1);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/bytecode',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-change-this-secret',
  corsOrigins: parseList(process.env.CORS_ORIGINS),
  publicApiUrl: process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 4000}`,
  database: {
    ssl: parseBoolean(process.env.DATABASE_SSL, process.env.NODE_ENV === 'production'),
    poolMax: parseNumber(process.env.DATABASE_POOL_MAX, 10),
    idleTimeoutMs: parseNumber(process.env.DATABASE_IDLE_TIMEOUT_MS, 30000),
    connectionTimeoutMs: parseNumber(process.env.DATABASE_CONNECTION_TIMEOUT_MS, 10000),
    maxUses: parseNumber(process.env.DATABASE_MAX_USES, 7500),
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    uploadTimeoutMs: Number(process.env.CLOUDINARY_UPLOAD_TIMEOUT_MS ?? 30000),
  },
  smtp: {
    required: smtpRequired,
    host: process.env.SMTP_HOST,
    port: parseNumber(process.env.SMTP_PORT, 587),
    secure: parseBoolean(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    maxRetries: parseNumber(process.env.SMTP_MAX_RETRIES, 2),
  },
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

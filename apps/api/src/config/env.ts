import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const repoRoot = path.resolve(apiRoot, '../..');

dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config({ path: path.join(apiRoot, '.env') });
dotenv.config({ path: path.join(repoRoot, '.env.local') });
dotenv.config({ path: path.join(apiRoot, '.env.local') });

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


requireInProduction('DATABASE_URL', process.env.DATABASE_URL);
requireInProduction('JWT_SECRET', process.env.JWT_SECRET);
requireInProduction('CORS_ORIGINS', process.env.CORS_ORIGINS);

if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === 'dev-only-change-this-secret') {
  console.error('JWT_SECRET must not use the development fallback in production.');
  process.exit(1);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  appEnv: ['production', 'staging'].includes((process.env.APP_ENV ?? process.env.NODE_ENV ?? '').toLowerCase())
    ? (process.env.APP_ENV ?? process.env.NODE_ENV ?? '').toLowerCase() as 'production' | 'staging'
    : 'development' as const,
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/bytecode',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-change-this-secret',
  corsOrigins: parseList(process.env.CORS_ORIGINS),
  publicApiUrl: process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 4000}`,
  githubWebhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
  database: {
    ssl: parseBoolean(process.env.DATABASE_SSL, process.env.NODE_ENV === 'production'),
    poolMax: parseNumber(process.env.DATABASE_POOL_MAX, 10),
    idleTimeoutMs: parseNumber(process.env.DATABASE_IDLE_TIMEOUT_MS, 30000),
    connectionTimeoutMs: parseNumber(process.env.DATABASE_CONNECTION_TIMEOUT_MS, 10000),
    maxUses: parseNumber(process.env.DATABASE_MAX_USES, 7500),
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

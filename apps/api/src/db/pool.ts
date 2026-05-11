import pg from 'pg';
import { env } from '../config/env.js';

export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  ssl: env.database.ssl ? { rejectUnauthorized: false } : undefined,
  max: env.database.poolMax,
  idleTimeoutMillis: env.database.idleTimeoutMs,
  connectionTimeoutMillis: env.database.connectionTimeoutMs,
  maxUses: env.database.maxUses,
});

pool.on('error', (error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown PostgreSQL client error';
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    subsystem: 'postgres',
    message: 'Unexpected idle PostgreSQL client error.',
    error: message,
  }));
});



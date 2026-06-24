import bcrypt from 'bcryptjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PoolClient } from 'pg';
import { pool } from './pool.js';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsPath = path.resolve(__dirname, '../../src/db/migrations');

async function runIncrementalMigrations(client: PoolClient) {
  const migrationFiles = (await fs.readdir(migrationsPath))
    .filter((file) => file.endsWith('.sql'))
    .sort();
  for (const migrationFile of migrationFiles) {
    console.log('Executing migration:', migrationFile);
    await client.query(await fs.readFile(path.join(migrationsPath, migrationFile), 'utf-8'));
  }
}

async function seedAdmins(client: PoolClient) {
  for (const admin of env.adminSeeds) {
    if (!admin.email || !admin.password) continue;

    const passwordHash = await bcrypt.hash(admin.password, 12);
    await client.query(
      `
      INSERT INTO admin_users (email, name, password_hash, role, is_verified, force_password_change)
      VALUES ($1, $2, $3, 'super_admin', true, false)
      ON CONFLICT (email)
      DO UPDATE SET
        name = EXCLUDED.name,
        password_hash = EXCLUDED.password_hash,
        is_active = true,
        is_verified = true,
        force_password_change = false,
        updated_at = now()
      `,
      [admin.email.toLowerCase(), admin.name ?? admin.email, passwordHash],
    );
  }
}

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Running incremental migrations...');
    await runIncrementalMigrations(client);
    console.log('Seeding admins...');
    await seedAdmins(client);
    await client.query('COMMIT');
    console.log('Database migration completed.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});


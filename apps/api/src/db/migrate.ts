import bcrypt from 'bcryptjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PoolClient } from 'pg';
import { pool } from './pool.js';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, '../../../../docs/database/postgresql_enterprise_schema.sql');
// Resolve from the API root so this works from both src/db (tsx) and dist/db (node).
const migrationsPath = path.resolve(__dirname, '../../src/db/migrations');

const removeTransactionBoundaries = (sql: string) =>
  sql.replace(/^\s*BEGIN;\s*$/gim, '').replace(/^\s*COMMIT;\s*$/gim, '');

async function runMigrations(client: PoolClient) {
  try {
    await fs.access(migrationsPath);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log(`No se encontraron migraciones en: ${migrationsPath}`);
      return;
    }
    throw error;
  }

  const migrationFiles = (await fs.readdir(migrationsPath))
    .filter((file) => file.endsWith('.sql'))
    .sort();
  for (const migrationFile of migrationFiles) {
    console.log('Executing migration:', migrationFile);
    const migration = await fs.readFile(path.join(migrationsPath, migrationFile), 'utf-8');
    await client.query(removeTransactionBoundaries(migration));
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
    console.log('Reading enterprise schema from:', schemaPath);
    const schema = await fs.readFile(schemaPath, 'utf-8');
    console.log('Executing schema...');
    await client.query(removeTransactionBoundaries(schema));
    await runMigrations(client);
    console.log('Seeding admins...');
    await seedAdmins(client);
    await client.query('COMMIT');
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  await pool.end();
  console.log('Database migration completed.');
}

migrate().catch(async (error) => {
  console.error('Migration failed:', error);
  await pool.end();
  process.exit(1);
});


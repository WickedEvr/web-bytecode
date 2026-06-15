import bcrypt from 'bcryptjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, '../../../../docs/database/postgresql_enterprise_schema.sql');

async function seedAdmins() {
  for (const admin of env.adminSeeds) {
    if (!admin.email || !admin.password) continue;

    const passwordHash = await bcrypt.hash(admin.password, 12);
    await pool.query(
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
  console.log('Reading enterprise schema from:', schemaPath);
  const schema = await fs.readFile(schemaPath, 'utf-8');
  console.log('Executing schema...');
  await pool.query(schema);
  console.log('Seeding admins...');
  await seedAdmins();
  await pool.end();
  console.log('Database migration completed.');
}

migrate().catch(async (error) => {
  console.error('Migration failed:', error);
  await pool.end();
  process.exit(1);
});


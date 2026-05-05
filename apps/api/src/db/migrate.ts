import bcrypt from 'bcryptjs';
import { pool } from './pool.js';
import { env } from '../config/env.js';

const schema = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  cargo text NOT NULL,
  email text NOT NULL,
  celular text NOT NULL,
  empresa text NOT NULL,
  ruc text NOT NULL,
  servicio text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  admin_notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  nombres text NOT NULL,
  apellidos text NOT NULL,
  domicilio text NOT NULL,
  tipo_doc text NOT NULL,
  numero_doc text NOT NULL,
  prefijo_telefono text NOT NULL,
  telefono text NOT NULL,
  email text NOT NULL,
  person_type text NOT NULL,
  good_type text NOT NULL,
  monto_cuantificable text,
  descripcion text NOT NULL,
  nombre_unidad text,
  opcion_bien text,
  claim_type text NOT NULL,
  tipo_reclamo text NOT NULL,
  detalle text NOT NULL,
  pedido text NOT NULL,
  attachment_original_name text,
  attachment_mime_type text,
  attachment_size integer,
  attachment_path text,
  status text NOT NULL DEFAULT 'new',
  admin_notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
`;

async function seedAdmins() {
  for (const admin of env.adminSeeds) {
    if (!admin.email || !admin.password) continue;

    const passwordHash = await bcrypt.hash(admin.password, 12);
    await pool.query(
      `
      INSERT INTO admin_users (email, name, password_hash)
      VALUES ($1, $2, $3)
      ON CONFLICT (email)
      DO UPDATE SET
        name = EXCLUDED.name,
        password_hash = EXCLUDED.password_hash,
        is_active = true,
        updated_at = now()
      `,
      [admin.email.toLowerCase(), admin.name ?? admin.email, passwordHash],
    );
  }
}

async function migrate() {
  await pool.query(schema);
  await seedAdmins();
  await pool.end();
  console.log('Database migration completed.');
}

migrate().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});

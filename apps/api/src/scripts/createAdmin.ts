import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';

const [, , email, password, name = email] = process.argv;

if (!email || !password) {
  console.error('Usage: npm run admin:create -w @bytecode/api -- email@example.com "password" "Name"');
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);

await pool.query(
  `
  INSERT INTO admin_users (email, name, password_hash)
  VALUES ($1, $2, $3)
  ON CONFLICT (email)
  DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name, is_active = true, updated_at = now()
  `,
  [email.toLowerCase(), name, passwordHash],
);

await pool.end();
console.log(`Admin ready: ${email}`);

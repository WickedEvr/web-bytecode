import bcrypt from 'bcryptjs';
import { pool } from '../src/db/pool.js';

async function main() {
  const email = 'laurent@bytecode.com.pe';
  const password = 'laurent';
  const name = 'Laurent Admin';

  const passwordHash = await bcrypt.hash(password, 12);

  // 1. Upsert admin user
  const userRes = await pool.query(
    `
    INSERT INTO admin_users (email, name, password_hash, is_verified, is_active, force_password_change)
    VALUES ($1, $2, $3, true, true, false)
    ON CONFLICT (email)
    DO UPDATE SET 
      password_hash = EXCLUDED.password_hash, 
      name = EXCLUDED.name, 
      is_active = true, 
      is_verified = true, 
      force_password_change = false, 
      updated_at = now()
    RETURNING id;
    `,
    [email.toLowerCase(), name, passwordHash]
  );

  const userId = userRes.rows[0].id;
  console.log(`User ID for ${email}: ${userId}`);

  // 2. Assign all roles to user
  const rolesRes = await pool.query(`SELECT id, code, name FROM roles`);
  for (const role of rolesRes.rows) {
    await pool.query(
      `
      INSERT INTO admin_user_roles (admin_user_id, role_id)
      VALUES ($1, $2)
      ON CONFLICT (admin_user_id, role_id) DO NOTHING;
      `,
      [userId, role.id]
    );
    console.log(`Assigned role ${role.name} (${role.code}) to ${email}`);
  }

  await pool.end();
  console.log(`Successfully created/updated admin ${email} with all permissions!`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

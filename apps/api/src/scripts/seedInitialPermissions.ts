import { pool } from '../db/pool.js';
import { adminMenuItems, adminPermissions, initialRolePermissions } from '../config/adminPermissions.js';

const main = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const permission of adminPermissions) {
      await client.query(
        `
        INSERT INTO permissions (module_code, action_code, code, name, description)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (code) DO UPDATE
        SET module_code = EXCLUDED.module_code,
            action_code = EXCLUDED.action_code,
            name = EXCLUDED.name,
            description = COALESCE(EXCLUDED.description, permissions.description),
            deleted_at = NULL,
            updated_at = now()
        `,
        [
          permission.moduleCode,
          permission.actionCode,
          permission.code,
          permission.name,
          permission.description ?? null,
        ],
      );
    }

    for (const item of adminMenuItems) {
      const permissionResult = await client.query('SELECT id FROM permissions WHERE code = $1', [item.permissionCode]);
      const permissionId = permissionResult.rows[0]?.id ?? null;

      const updateResult = await client.query(
        `
        UPDATE menu_items
        SET label = $2,
            url = $3,
            icon_name = $4,
            permission_id = $5,
            sort_order = $6,
            is_active = true,
            deleted_at = NULL,
            updated_at = now()
        WHERE route_name = $1
        `,
        [item.routeName, item.label, item.url, item.iconName, permissionId, item.sortOrder],
      );

      if (updateResult.rowCount === 0) {
        await client.query(
          `
          INSERT INTO menu_items (label, url, route_name, icon_name, permission_id, sort_order)
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [item.label, item.url, item.routeName, item.iconName, permissionId, item.sortOrder],
        );
      }
    }

    for (const [roleCode, permissionCodes] of Object.entries(initialRolePermissions)) {
      const roleResult = await client.query('SELECT id FROM roles WHERE code = $1', [roleCode]);
      const roleId = roleResult.rows[0]?.id;
      if (!roleId) continue;

      for (const permissionCode of permissionCodes) {
        const permissionResult = await client.query('SELECT id FROM permissions WHERE code = $1', [permissionCode]);
        const permissionId = permissionResult.rows[0]?.id;
        if (!permissionId) continue;

        await client.query(
          `
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES ($1, $2)
          ON CONFLICT (role_id, permission_id) DO NOTHING
          `,
          [roleId, permissionId],
        );
      }
    }

    const legacyRoleColumn = await client.query(
      `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'admin_users'
        AND column_name = 'role'
      `,
    );

    if ((legacyRoleColumn.rowCount ?? 0) > 0) {
      await client.query(
        `
        INSERT INTO admin_user_roles (admin_user_id, role_id)
        SELECT u.id, r.id
        FROM admin_users u
        JOIN roles r ON r.code = u.role
        WHERE u.deleted_at IS NULL
          AND NOT EXISTS (
            SELECT 1
            FROM admin_user_roles aur
            WHERE aur.admin_user_id = u.id
          )
        ON CONFLICT (admin_user_id, role_id) DO NOTHING
        `,
      );
    }

    await client.query('COMMIT');
    console.log('Initial admin permissions, menu items, and role permissions seeded.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

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
          'description' in permission ? permission.description : null,
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

    await client.query(
      `
      UPDATE menu_items
      SET is_active = false,
          deleted_at = COALESCE(deleted_at, now()),
          updated_at = now()
      WHERE route_name = 'admin.portafolio'
      `,
    );

    const statusResult = await client.query(
      "SELECT id FROM status_catalog WHERE domain = 'cms' AND code = 'published' AND is_active = true LIMIT 1",
    );
    const publishedStatusId = statusResult.rows[0]?.id;
    if (!publishedStatusId) throw new Error('Published CMS status is not configured.');

    await client.query(
        `
        INSERT INTO cms_pages (slug, title, meta_title, meta_description, status_id, published_at)
        VALUES ($1, $2, $3, $4, $5, now())
        ON CONFLICT (slug) DO UPDATE
        SET title = EXCLUDED.title,
            meta_title = COALESCE(cms_pages.meta_title, EXCLUDED.meta_title),
            meta_description = COALESCE(cms_pages.meta_description, EXCLUDED.meta_description),
            status_id = COALESCE(EXCLUDED.status_id, cms_pages.status_id),
            published_at = COALESCE(cms_pages.published_at, EXCLUDED.published_at),
            deleted_at = NULL,
            updated_at = now()
        `,
        [
          'portafolio',
          'Portafolio',
          'Portafolio | Bytecode',
          'Proyectos web, aplicaciones y soluciones digitales desarrolladas por Bytecode.',
          publishedStatusId,
        ],
      );

    for (const [roleCode, permissionCodes] of Object.entries(initialRolePermissions)) {
      const roleResult = await client.query('SELECT id FROM roles WHERE code = $1', [roleCode]);
      const roleId = roleResult.rows[0]?.id;
      if (!roleId) continue;

      await client.query(
        `
        DELETE FROM role_permissions rp
        USING permissions p
        WHERE rp.permission_id = p.id
          AND rp.role_id = $1
          AND p.code <> ALL($2::varchar[])
        `,
        [roleId, permissionCodes],
      );

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

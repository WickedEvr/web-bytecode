-- Migration: Remove obsolete quoter permissions
-- Description: Removes quoter:view and quoter:manage that are obsolete as the system migrated to admin.cotizador.*

BEGIN;

-- Delete associations in the many-to-many table first
DELETE FROM role_permissions 
WHERE permission_id IN (
    SELECT id FROM permissions WHERE code IN ('quoter:view', 'quoter:manage')
);

-- Delete the zombie permissions
DELETE FROM permissions 
WHERE code IN ('quoter:view', 'quoter:manage');

COMMIT;

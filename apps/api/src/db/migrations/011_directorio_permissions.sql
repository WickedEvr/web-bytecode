-- 011_directorio_permissions.sql
-- Migración para inyectar los permisos del Módulo de Directorio y el menú en el Panel de Administrador

-- 1. Insertar permisos requeridos
INSERT INTO permissions (id, code, name, description, module_code, action_code) VALUES
(gen_random_uuid(), 'admin.directorio.view', 'Ver Directorio', 'Ver clientes y empresas', 'directorio', 'view'),
(gen_random_uuid(), 'admin.directorio.manage', 'Gestionar Directorio', 'Crear, editar o eliminar clientes y empresas', 'directorio', 'manage')
ON CONFLICT (code) DO NOTHING;

-- 2. Asignar permisos al rol superadmin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'superadmin' AND p.code = 'admin.directorio.view'
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'superadmin' AND p.code = 'admin.directorio.manage'
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- 3. Crear rol sales si no existe y asignarle permisos
INSERT INTO roles (id, code, name, description, is_system) 
SELECT gen_random_uuid(), 'sales', 'Ventas', 'Ejecutivo de Ventas', true
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE code = 'sales');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'sales' AND p.code = 'admin.directorio.view'
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'sales' AND p.code = 'admin.directorio.manage'
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- 4. Inyectar el ítem de menú en la barra lateral
-- Se colocará con sort_order = 25 (Generalmente después de Contactos)
INSERT INTO menu_items (id, label, url, route_name, icon_name, permission_id, sort_order)
SELECT gen_random_uuid(), 'Directorio', '/admin/directorio', 'admin.directorio', 'Building2', p.id, 25
FROM permissions p WHERE p.code = 'admin.directorio.view'
AND NOT EXISTS (
    SELECT 1 FROM menu_items WHERE route_name = 'admin.directorio'
);

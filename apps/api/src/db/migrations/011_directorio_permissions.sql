-- 011_directorio_permissions.sql
-- Migración para inyectar los permisos del Módulo de Directorio y el menú en el Panel de Administrador

-- 1. Insertar permisos requeridos
INSERT INTO permissions (id, code, description, module_code, action_code) VALUES
(gen_random_uuid(), 'admin.directorio.view', 'Ver clientes y empresas', 'directorio', 'view'),
(gen_random_uuid(), 'admin.directorio.manage', 'Crear, editar o eliminar clientes y empresas', 'directorio', 'manage')
ON CONFLICT (code) DO NOTHING;

-- 2. Asignar permisos al rol superadmin
INSERT INTO role_permissions (role_id, permission_code)
SELECT id, 'admin.directorio.view' FROM roles WHERE code = 'superadmin'
ON CONFLICT (role_id, permission_code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_code)
SELECT id, 'admin.directorio.manage' FROM roles WHERE code = 'superadmin'
ON CONFLICT (role_id, permission_code) DO NOTHING;

-- 3. Crear rol sales si no existe y asignarle permisos
INSERT INTO roles (id, code, name, description, is_system) 
VALUES (gen_random_uuid(), 'sales', 'Ventas', 'Ejecutivo de Ventas', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_code)
SELECT id, 'admin.directorio.view' FROM roles WHERE code = 'sales'
ON CONFLICT (role_id, permission_code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_code)
SELECT id, 'admin.directorio.manage' FROM roles WHERE code = 'sales'
ON CONFLICT (role_id, permission_code) DO NOTHING;

-- 4. Inyectar el ítem de menú en la barra lateral
-- Se colocará con sort_order = 4 (Generalmente después de Dashboard, Contactos y Reclamos)
INSERT INTO menu_items (id, label, icon, route, required_permission, sort_order, parent_id)
SELECT gen_random_uuid(), 'Directorio', 'Users', '/admin/directorio', 'admin.directorio.view', 4, NULL
WHERE NOT EXISTS (
    SELECT 1 FROM menu_items WHERE route = '/admin/directorio'
);

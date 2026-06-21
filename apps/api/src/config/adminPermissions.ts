export type AdminPermissionSeed = {
  moduleCode: string;
  actionCode: string;
  code: string;
  name: string;
  description?: string;
};

export type AdminMenuSeed = {
  label: string;
  url: string;
  routeName: string;
  iconName: string;
  permissionCode: string;
  sortOrder: number;
};

export const adminPermissions: AdminPermissionSeed[] = [
  { moduleCode: 'admin.dashboard', actionCode: 'view', code: 'admin.dashboard.view', name: 'Ver Dashboard' },
  { moduleCode: 'admin.contactos', actionCode: 'view', code: 'admin.contactos.view', name: 'Ver Contactos' },
  { moduleCode: 'admin.contactos', actionCode: 'manage', code: 'admin.contactos.manage', name: 'Gestionar Contactos' },
  { moduleCode: 'admin.contactos', actionCode: 'assign', code: 'admin.contactos.assign', name: 'Asignar Contactos' },
  { moduleCode: 'admin.reclamos', actionCode: 'view', code: 'admin.reclamos.view', name: 'Ver Reclamos' },
  { moduleCode: 'admin.reclamos', actionCode: 'manage', code: 'admin.reclamos.manage', name: 'Gestionar Reclamos' },
  { moduleCode: 'admin.cotizador', actionCode: 'view', code: 'admin.cotizador.view', name: 'Ver Cotizador' },
  { moduleCode: 'admin.cotizador', actionCode: 'manage', code: 'admin.cotizador.manage', name: 'Gestionar Cotizador' },
  { moduleCode: 'admin.portafolio', actionCode: 'view', code: 'admin.portafolio.view', name: 'Ver Portafolio' },
  { moduleCode: 'admin.portafolio', actionCode: 'manage', code: 'admin.portafolio.manage', name: 'Gestionar Portafolio' },
  { moduleCode: 'admin.usuarios', actionCode: 'view', code: 'admin.usuarios.view', name: 'Ver Usuarios' },
  { moduleCode: 'admin.usuarios', actionCode: 'manage', code: 'admin.usuarios.manage', name: 'Gestionar Usuarios' },
  { moduleCode: 'admin.roles', actionCode: 'view', code: 'admin.roles.view', name: 'Ver Roles' },
  { moduleCode: 'admin.roles', actionCode: 'manage', code: 'admin.roles.manage', name: 'Gestionar Roles' },
  { moduleCode: 'admin.cms', actionCode: 'view', code: 'admin.cms.view', name: 'Ver CMS' },
  { moduleCode: 'admin.cms', actionCode: 'manage', code: 'admin.cms.manage', name: 'Gestionar CMS' },
  { moduleCode: 'admin.auditoria', actionCode: 'view', code: 'admin.auditoria.view', name: 'Ver Auditoria' },
  { moduleCode: 'admin.seguridad', actionCode: 'view', code: 'admin.seguridad.view', name: 'Ver Seguridad' },
  { moduleCode: 'admin.seguridad', actionCode: 'manage', code: 'admin.seguridad.manage', name: 'Gestionar Seguridad' },
  { moduleCode: 'admin.configuracion', actionCode: 'view', code: 'admin.configuracion.view', name: 'Ver Configuracion' },
  { moduleCode: 'admin.configuracion', actionCode: 'manage', code: 'admin.configuracion.manage', name: 'Gestionar Configuracion' },
];

export const adminMenuItems: AdminMenuSeed[] = [
  { label: 'Dashboard', url: '/admin/dashboard', routeName: 'admin.dashboard', iconName: 'LayoutDashboard', permissionCode: 'admin.dashboard.view', sortOrder: 10 },
  { label: 'Contactos', url: '/admin/contactos', routeName: 'admin.contactos', iconName: 'Users', permissionCode: 'admin.contactos.view', sortOrder: 20 },
  { label: 'Reclamos', url: '/admin/reclamos', routeName: 'admin.reclamos', iconName: 'MessageSquareText', permissionCode: 'admin.reclamos.view', sortOrder: 30 },
  { label: 'Cotizador', url: '/admin/cotizador', routeName: 'admin.cotizador', iconName: 'Calculator', permissionCode: 'admin.cotizador.view', sortOrder: 40 },
  { label: 'Proyectos', url: '/admin/proyectos', routeName: 'admin.proyectos', iconName: 'FolderKanban', permissionCode: 'admin.cotizador.view', sortOrder: 50 },
  { label: 'Usuarios', url: '/admin/usuarios', routeName: 'admin.usuarios', iconName: 'UserCog', permissionCode: 'admin.usuarios.view', sortOrder: 60 },
  { label: 'Roles', url: '/admin/roles', routeName: 'admin.roles', iconName: 'ShieldCheck', permissionCode: 'admin.roles.view', sortOrder: 70 },
  { label: 'CMS', url: '/admin/cms', routeName: 'admin.cms', iconName: 'Database', permissionCode: 'admin.cms.view', sortOrder: 80 },
  { label: 'Auditoria', url: '/admin/auditoria', routeName: 'admin.auditoria', iconName: 'ClipboardList', permissionCode: 'admin.auditoria.view', sortOrder: 90 },
  { label: 'Seguridad', url: '/admin/seguridad', routeName: 'admin.seguridad', iconName: 'ShieldCheck', permissionCode: 'admin.seguridad.view', sortOrder: 100 },
  { label: 'Configuracion', url: '/admin/configuracion', routeName: 'admin.configuracion', iconName: 'Settings', permissionCode: 'admin.configuracion.view', sortOrder: 110 },
];

export const initialRolePermissions: Record<string, string[]> = {
  super_admin: adminPermissions.map((permission) => permission.code),
  admin: [
    'admin.dashboard.view',
    'admin.contactos.view',
    'admin.contactos.manage',
    'admin.contactos.assign',
    'admin.reclamos.view',
    'admin.reclamos.manage',
    'admin.cotizador.view',
    'admin.cotizador.manage',
    'admin.portafolio.view',
    'admin.portafolio.manage',
    'admin.cms.view',
    'admin.cms.manage',
    'admin.auditoria.view',
    'admin.seguridad.view',
    'admin.seguridad.manage',
    'admin.configuracion.view',
    'admin.configuracion.manage',
  ],
  support_agent: [
    'admin.dashboard.view',
    'admin.contactos.view',
    'admin.contactos.manage',
    'admin.contactos.assign',
    'admin.reclamos.view',
    'admin.reclamos.manage',
  ],
  legal_reviewer: [
    'admin.dashboard.view',
    'admin.reclamos.view',
    'admin.reclamos.manage',
  ],
  partner_designer: [
    'admin.dashboard.view',
    'admin.cotizador.view',
    'admin.cotizador.manage',
    'admin.portafolio.view',
    'admin.portafolio.manage',
    'admin.cms.view',
    'admin.cms.manage',
  ],
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquareText, ShieldCheck, Settings, Calculator, Database, ClipboardList, X, Images } from 'lucide-react';
import type { AdminUser } from './AdminLayout';

type SidebarProps = {
  admin: AdminUser | null;
  onClose?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ admin, onClose }) => {
  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['super_admin', 'admin', 'support_agent', 'legal_reviewer', 'partner_designer'] },
    { to: '/admin/contactos', icon: Users, label: 'Contactos', roles: ['super_admin', 'admin', 'support_agent'] },
    { to: '/admin/reclamos', icon: MessageSquareText, label: 'Reclamos', roles: ['super_admin', 'admin', 'support_agent', 'legal_reviewer'] },
    { to: '/admin/cotizador', icon: Calculator, label: 'Cotizador', roles: ['super_admin', 'admin', 'partner_designer'] },
    { to: '/admin/portafolio', icon: Images, label: 'Portafolio', roles: ['super_admin', 'admin', 'partner_designer'] },
    { to: '/admin/usuarios', icon: ShieldCheck, label: 'Usuarios', roles: ['super_admin', 'admin'] },
    { to: '/admin/cms', icon: Database, label: 'CMS', roles: ['super_admin', 'admin', 'partner_designer'] },
    { to: '/admin/auditoria', icon: ClipboardList, label: 'Auditoría', roles: ['super_admin', 'admin'] },
    { to: '/admin/seguridad', icon: ShieldCheck, label: 'Seguridad', roles: ['super_admin', 'admin'] },
    { to: '/admin/configuracion', icon: Settings, label: 'Configuración', roles: ['super_admin', 'admin'] },
  ];

  const visibleNavItems = navItems.filter(item => {
  if (!admin || !admin.roles) return true; 

  const isSuperAdmin = admin.roles.includes('super_admin');

  const hasAllowedRole = admin.roles.some(userRole => item.roles.includes(userRole));

  return isSuperAdmin || hasAllowedRole;
});

  return (
    <aside className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col h-full shadow-2xl lg:shadow-none">
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <img src="/vectors/designs/logo_en_blanco.svg" alt="Bytecode Logo" className="h-8" />
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                isActive ? 'bg-white/10 text-white font-medium' : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

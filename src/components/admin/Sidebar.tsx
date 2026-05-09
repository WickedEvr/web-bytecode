import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquareText, ShieldCheck, Settings, Calculator, Database, ClipboardList, X } from 'lucide-react';

type SidebarProps = {
  onClose?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/contactos', icon: Users, label: 'Contactos' },
    { to: '/admin/reclamos', icon: MessageSquareText, label: 'Reclamos' },
    { to: '/admin/cotizador', icon: Calculator, label: 'Cotizador' },
    { to: '/admin/usuarios', icon: ShieldCheck, label: 'Usuarios' },
    { to: '/admin/cms', icon: Database, label: 'CMS' },
    { to: '/admin/auditoria', icon: ClipboardList, label: 'Auditoría' },
    { to: '/admin/configuracion', icon: Settings, label: 'Configuración' },
  ];

  return (
    <aside className="w-64 border-r border-white/10 bg-[#040e1f] flex flex-col h-full shadow-2xl lg:shadow-none">
      <div className="p-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-[#06CFD6]" />
          <h1 className="text-xl font-bold">Bytecode</h1>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold ${
                isActive ? 'bg-[#06CFD6] text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

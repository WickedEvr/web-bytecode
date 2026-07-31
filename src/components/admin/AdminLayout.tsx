import React, { useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { apiRequest } from '../../lib/api';
import { LogOut, Menu, UserCircle } from 'lucide-react';

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions?: string[];
};

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());

  const handleLogout = async () => {
    await apiRequest('/auth/logout', { method: 'POST' }).catch(() => null);
    navigate('/admin/login');
  };

  useEffect(() => {
    apiRequest<{ admin: AdminUser }>('/auth/me')
      .then((res) => setAdmin(res.admin))
      .catch(() => navigate('/admin/login'));
  }, [navigate]);

  // Detector de inactividad (1 hora)
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    events.forEach((evt) => document.addEventListener(evt, handleActivity, { passive: true }));

    const intervalId = setInterval(() => {
      const now = Date.now();
      const MAX_IDLE_TIME = 60 * 60 * 1000; // 1 hora
      if (now - lastActivityRef.current > MAX_IDLE_TIME) {
        void handleLogout();
      }
    }, 60000); // Comprobar cada minuto

    return () => {
      events.forEach((evt) => document.removeEventListener(evt, handleActivity));
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-black font-sansation text-white/90">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar admin={admin} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-white/5 px-6 lg:px-10 py-4 bg-[#0a0a0a]">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-colors">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-lg font-medium tracking-wide">Panel Administrativo</h2>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {admin && (
              <a 
                href="/admin/perfil" 
                onClick={(e) => { e.preventDefault(); navigate('/admin/perfil'); }} 
                className="hidden md:flex items-center gap-3 hover:bg-white/5 border border-transparent hover:border-white/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer group"
                title="Configuración de Perfil"
              >
                <div className="flex flex-col items-end">
                  <p className="text-sm font-medium text-white/90 group-hover:text-[#06CFD6] transition-colors">{admin.name}</p>
                  <p className="text-xs text-white/40">{admin.email}</p>
                </div>
                <div className="p-1.5 bg-white/10 rounded-full group-hover:bg-[#06CFD6]/20 transition-colors">
                  <UserCircle className="w-5 h-5 text-white/70 group-hover:text-[#06CFD6] transition-colors" />
                </div>
              </a>
            )}
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar bg-[#050505]">
          {admin ? <Outlet context={{ admin }} /> : <div className="flex h-full items-center justify-center text-white/30 text-sm tracking-widest uppercase">Cargando Sistema...</div>}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

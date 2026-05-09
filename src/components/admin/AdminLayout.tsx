import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { apiRequest } from '../../lib/api';
import { LogOut, Menu } from 'lucide-react';

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    apiRequest<{ admin: AdminUser }>('/api/auth/me')
      .then((res) => setAdmin(res.admin))
      .catch(() => navigate('/admin/login'));
  }, [navigate]);

  const handleLogout = async () => {
    await apiRequest('/api/auth/logout', { method: 'POST' }).catch(() => null);
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-[#040e1f] font-sansation text-white">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-white/10 px-5 lg:px-8 py-4 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/10">
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h2 className="text-xl font-bold hidden sm:block">Panel Admin</h2>
              {admin && <p className="text-sm text-white/60">{admin.name} · {admin.email}</p>}
            </div>
          </div>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#040e1f] transition hover:bg-[#06CFD6] hover:text-white">
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Salir</span>
          </button>
        </header>
        <main className="flex-1 p-5 lg:p-8 overflow-y-auto">
          <Outlet context={{ admin }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

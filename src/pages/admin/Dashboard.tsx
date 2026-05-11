import React, { useEffect, useState } from 'react';
import { Users, MessageSquareText, Activity, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../../lib/api';

type StatItem = { status: string; total: number };
type RecentItem = { id: string; nombre: string; email: string; status: string; created_at: string; code?: string };

type DashboardData = {
  contactsStats: StatItem[];
  complaintsStats: StatItem[];
  recentContacts: RecentItem[];
  recentComplaints: RecentItem[];
  activeAdminsTotal: number;
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await apiRequest<DashboardData>('/api/admin/stats');
        setData(res);
      } catch (err) {
        console.error("Error loading dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  const totalContacts = data?.contactsStats.reduce((acc, curr) => acc + curr.total, 0) || 0;
  const totalComplaints = data?.complaintsStats.reduce((acc, curr) => acc + curr.total, 0) || 0;

  const formatDate = (val: string) => 
    new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(val));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Top Metrics */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#06CFD6]/10 text-[#06CFD6]">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-white/60">Total Contactos</p>
              <p className="text-2xl font-bold">{loading ? '...' : totalContacts}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#06CFD6]/10 text-[#06CFD6]">
              <MessageSquareText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-white/60">Total Reclamos</p>
              <p className="text-2xl font-bold">{loading ? '...' : totalComplaints}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#06CFD6]/10 text-[#06CFD6]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-white/60">Admins Activos</p>
              <p className="text-2xl font-bold">{loading ? '...' : data?.activeAdminsTotal || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#06CFD6]/10 text-[#06CFD6]">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-white/60">Estado del Sistema</p>
              <p className="text-2xl font-bold text-green-400">En línea</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] flex flex-col">
          <div className="border-b border-white/10 p-5">
            <h2 className="text-xl font-bold">Contactos Recientes</h2>
          </div>
          <div className="divide-y divide-white/10 p-2 flex-1">
            {loading ? <p className="p-4 text-center text-white/50">Cargando...</p> : 
              data?.recentContacts.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 transition hover:bg-white/[0.02] rounded-xl">
                  <div>
                    <p className="font-bold text-sm">{item.nombre}</p>
                    <p className="text-xs text-white/50">{item.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-[#06CFD6] uppercase tracking-wider">{item.status}</span>
                    <p className="mt-1 text-[10px] text-white/40">{formatDate(item.created_at)}</p>
                  </div>
                </div>
              ))}
            {!loading && data?.recentContacts.length === 0 && <p className="p-4 text-center text-white/50">No hay contactos recientes.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] flex flex-col">
          <div className="border-b border-white/10 p-5">
            <h2 className="text-xl font-bold">Reclamos Recientes</h2>
          </div>
          <div className="divide-y divide-white/10 p-2 flex-1">
            {loading ? <p className="p-4 text-center text-white/50">Cargando...</p> : 
              data?.recentComplaints.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 transition hover:bg-white/[0.02] rounded-xl">
                  <div>
                    <p className="font-bold text-sm">{item.code} · {item.nombre}</p>
                    <p className="text-xs text-white/50">{item.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-[#06CFD6] uppercase tracking-wider">{item.status}</span>
                    <p className="mt-1 text-[10px] text-white/40">{formatDate(item.created_at)}</p>
                  </div>
                </div>
              ))}
            {!loading && data?.recentComplaints.length === 0 && <p className="p-4 text-center text-white/50">No hay reclamos recientes.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

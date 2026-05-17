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
    <div className="flex flex-col gap-6 font-sansation">
      <h1 className="text-2xl font-semibold tracking-wide text-white/90">Dashboard</h1>
      
      {/* Top Metrics */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/70">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest">Total Contactos</p>
              <p className="text-xl font-medium text-white/90">{loading ? '...' : totalContacts}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/70">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest">Total Reclamos</p>
              <p className="text-xl font-medium text-white/90">{loading ? '...' : totalComplaints}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/70">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest">Admins Activos</p>
              <p className="text-xl font-medium text-white/90">{loading ? '...' : data?.activeAdminsTotal || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/70">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest">Estado</p>
              <p className="text-xl font-medium text-white/90">En línea</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-white/5 bg-[#0a0a0a] flex flex-col overflow-hidden">
          <div className="border-b border-white/5 p-4 bg-white/[0.01]">
            <h2 className="text-sm font-semibold text-white/70 tracking-wide">Contactos Recientes</h2>
          </div>
          <div className="divide-y divide-white/5 p-2 flex-1">
            {loading ? <p className="p-4 text-center text-white/30 text-sm">Cargando...</p> : 
              data?.recentContacts.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 transition-colors hover:bg-white/[0.02] rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-white/80">{item.nombre}</p>
                    <p className="text-xs text-white/40">{item.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-white/60">{item.status}</span>
                    <p className="mt-1 text-[10px] text-white/30">{formatDate(item.created_at)}</p>
                  </div>
                </div>
              ))}
            {!loading && data?.recentContacts.length === 0 && <p className="p-4 text-center text-white/30 text-sm">No hay contactos recientes.</p>}
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#0a0a0a] flex flex-col overflow-hidden">
          <div className="border-b border-white/5 p-4 bg-white/[0.01]">
            <h2 className="text-sm font-semibold text-white/70 tracking-wide">Reclamos Recientes</h2>
          </div>
          <div className="divide-y divide-white/5 p-2 flex-1">
            {loading ? <p className="p-4 text-center text-white/30 text-sm">Cargando...</p> : 
              data?.recentComplaints.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 transition-colors hover:bg-white/[0.02] rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-white/80">{item.code} · {item.nombre}</p>
                    <p className="text-xs text-white/40">{item.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-white/60">{item.status}</span>
                    <p className="mt-1 text-[10px] text-white/30">{formatDate(item.created_at)}</p>
                  </div>
                </div>
              ))}
            {!loading && data?.recentComplaints.length === 0 && <p className="p-4 text-center text-white/30 text-sm">No hay reclamos recientes.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

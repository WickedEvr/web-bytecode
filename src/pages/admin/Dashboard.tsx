import React, { useEffect, useState } from 'react';
import { Users, MessageSquareText, Activity } from 'lucide-react';
import { apiRequest } from '../../lib/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    contactos: 0,
    reclamos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [contactsRes, complaintsRes] = await Promise.all([
          apiRequest<{ items: any[] }>('/api/admin/contacts'),
          apiRequest<{ items: any[] }>('/api/admin/complaints')
        ]);
        setStats({
          contactos: contactsRes.items.length,
          reclamos: complaintsRes.items.length,
        });
      } catch (err) {
        console.error("Error loading dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#06CFD6]/10 text-[#06CFD6]">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-white/60">Total Contactos</p>
              <p className="text-2xl font-bold">{loading ? '...' : stats.contactos}</p>
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
              <p className="text-2xl font-bold">{loading ? '...' : stats.reclamos}</p>
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
    </div>
  );
};

export default Dashboard;

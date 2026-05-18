import React, { useEffect, useState } from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { apiRequest } from '../../lib/api';

type AuditLog = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
  admin_name: string | null;
  admin_email: string | null;
};

import AdminPanel from '../../components/admin/AdminPanel';

// ... (skip to component)

const Auditoria: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest<{ items: AuditLog[] }>('/api/admin/logs?limit=50');
      setLogs(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, []);

  const formatDate = (val: string) => 
    new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(val));

  return (
    <div className="flex flex-col gap-6 font-sansation">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-white/50" />
          <div>
            <h1 className="text-2xl font-semibold tracking-wide text-white/90">Auditoría</h1>
            <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">Registro de actividad del sistema</p>
          </div>
        </div>
        <button onClick={loadLogs} className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white">
          <RefreshCw className="h-4 w-4" /> <span>Actualizar</span>
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-300 text-sm">{error}</p>}

      <AdminPanel className="flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/[0.02] text-white/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Usuario</th>
                <th className="px-6 py-4 font-medium">Acción</th>
                <th className="px-6 py-4 font-medium">Entidad</th>
                <th className="px-6 py-4 font-medium">ID Entidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {logs.map(log => (
                <tr key={log.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-4 text-white/50 text-xs">{formatDate(log.created_at)}</td>
                  <td className="px-6 py-4">
                    {log.admin_name ? (
                      <div>
                        <p className="font-medium text-white/90">{log.admin_name}</p>
                        <p className="text-[10px] text-white/40">{log.admin_email}</p>
                      </div>
                    ) : (
                      <span className="text-white/30 italic">Sistema</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-white/5 border border-white/5 px-2 py-0.5 text-[10px] font-medium text-white/60 uppercase tracking-widest">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/80">{log.entity_type}</td>
                  <td className="px-6 py-4 text-xs font-mono text-white/30">{log.entity_id || '-'}</td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-white/30 text-sm">No hay registros de auditoría.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
};

export default Auditoria;

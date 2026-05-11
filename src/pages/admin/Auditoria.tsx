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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-[#06CFD6]" />
          <div>
            <h1 className="text-3xl font-bold">Auditoría</h1>
            <p className="text-white/60 text-sm">Registro de actividad del sistema</p>
          </div>
        </div>
        <button onClick={loadLogs} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold transition hover:border-[#06CFD6]">
          <RefreshCw className="h-4 w-4" /> Actualizar
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-500/15 px-4 py-3 text-red-100">{error}</p>}

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-5 py-4 font-medium">Fecha</th>
                <th className="px-5 py-4 font-medium">Usuario</th>
                <th className="px-5 py-4 font-medium">Acción</th>
                <th className="px-5 py-4 font-medium">Entidad</th>
                <th className="px-5 py-4 font-medium">ID Entidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {logs.map(log => (
                <tr key={log.id} className="transition hover:bg-white/[0.02]">
                  <td className="px-5 py-4 text-white/60 whitespace-nowrap">{formatDate(log.created_at)}</td>
                  <td className="px-5 py-4">
                    {log.admin_name ? (
                      <div>
                        <p className="font-bold">{log.admin_name}</p>
                        <p className="text-xs text-white/50">{log.admin_email}</p>
                      </div>
                    ) : (
                      <span className="text-white/40">Sistema</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-[#06CFD6]/10 px-2 py-1 text-xs font-bold text-[#06CFD6] uppercase tracking-wide">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/80">{log.entity_type}</td>
                  <td className="px-5 py-4 text-xs font-mono text-white/40">{log.entity_id || '-'}</td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-white/50">No hay registros de auditoría.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Auditoria;

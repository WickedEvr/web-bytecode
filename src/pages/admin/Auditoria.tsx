import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ClipboardList, RefreshCw } from 'lucide-react';
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

type AuditLogsResponse = {
  items: AuditLog[];
  total: number;
  limit: number;
  offset: number;
};

import AdminPanel from '../../components/admin/AdminPanel';

// ... (skip to component)

const PAGE_SIZE = 10;

const Auditoria: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadLogs = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError('');
    try {
      const offset = (targetPage - 1) * PAGE_SIZE;
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });
      const result = await apiRequest<AuditLogsResponse>(`/api/admin/logs?${params.toString()}`);

      if (result.items.length === 0 && result.total > 0 && targetPage > 1) {
        setPage(targetPage - 1);
        return;
      }

      setLogs(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los logs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    queueMicrotask(() => {
      if (isCurrent) {
        void loadLogs(page);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [loadLogs, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(page * PAGE_SIZE, total);
  const canGoPrevious = page > 1 && !loading;
  const canGoNext = page < totalPages && !loading;

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
        <button
          onClick={() => void loadLogs(page)}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
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
              {loading && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-white/30 text-sm">Cargando registros...</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-white/5 px-4 py-4 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Mostrando {firstItem}-{lastItem} de {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={!canGoPrevious}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Pagina anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-24 text-center text-xs uppercase tracking-widest text-white/40">
              Pagina {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={!canGoNext}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Pagina siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </AdminPanel>
    </div>
  );
};

export default Auditoria;

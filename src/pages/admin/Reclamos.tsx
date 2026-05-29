import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Mail, MessageSquareText, RefreshCw, X } from 'lucide-react';
import { apiRequest, apiUrl } from '../../lib/api';

type ComplaintItem = {
  id: string;
  code: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  claim_type: string;
  tipo_reclamo: string;
  status: string;
  attachment_original_name?: string;
  created_at: string;
};

type DetailItem = Record<string, string | number | null | undefined>;

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : '';

import AdminPanel from '../../components/admin/AdminPanel';
import CustomDropdown from '../../components/ui/CustomDropdown';

// ... (skip to the component rendering)

const Reclamos: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailItem | null>(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('new');
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState('');
  const [statuses, setStatuses] = useState<{ value: string, label: string }[]>([]);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const statusLabel = (statusCode: string) => statuses.find((item) => item.value === statusCode)?.label ?? statusCode;

  const loadCatalogs = async () => {
    try {
      const res = await apiRequest<{ items: { id: string, code: string, name: string }[] }>('/api/catalog/statuses');
      setStatuses(res.items.map(s => ({ value: s.code, label: s.name })));
    } catch (err) {
      console.error(err);
    }
  };

  const loadList = async () => {
    setListLoading(true);
    setError('');
    try {
      const result = await apiRequest<{ items: ComplaintItem[] }>('/api/admin/complaints');
      setComplaints(result.items);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar la lista.');
    } finally {
      setListLoading(false);
    }
  };

  const loadDetail = async (id: string) => {
    setSelectedId(id);
    setError('');
    try {
      const result = await apiRequest<{ item: DetailItem }>(`/api/admin/complaints/${id}`);
      setDetail(result.item);
      setStatus(String(result.item.status ?? 'new'));
      setNotes(String(result.item.admin_notes ?? ''));
      if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
        setMobileDetailOpen(true);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el detalle.');
    }
  };

  useEffect(() => {
    void loadCatalogs();
    void loadList();
  }, []);

  const handleSave = async () => {
    if (!selectedId) return;
    try {
      const result = await apiRequest<{ item: DetailItem }>(`/api/admin/complaints/${selectedId}`, {
        method: 'PATCH',
        json: { status, adminNotes: notes },
      });
      setDetail(result.item);
      await loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const renderDetailContent = () => {
    if (!detail) {
      return (
        <div className="flex min-h-[420px] flex-col items-center justify-center text-center text-white/30 p-8">
          <MessageSquareText className="h-8 w-8 mb-4 opacity-50" />
          <p className="text-sm">Selecciona un registro para ver el detalle.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        <div className="p-6 lg:p-8 flex flex-col gap-8">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <h2 className="text-xl font-semibold text-white/90">Detalle del Reclamo</h2>
            {detail.attachment_original_name && selectedId && (
              <a
                href={apiUrl(`/api/admin/complaints/${selectedId}/attachment`)}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
              >
                <Download className="h-3.5 w-3.5" /> Adjunto
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {Object.entries(detail)
              .filter(([key]) => !['admin_notes', 'status', 'attachment_path'].includes(key))
              .map(([key, value]) => (
                <div key={key} className={key === 'detalle' || key === 'pedido' ? 'sm:col-span-2' : ''}>
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{key.replace(/_/g, ' ')}</p>
                  <p className="break-words text-sm text-white/80">
                    {key === 'created_at' || key === 'updated_at'
                      ? formatDate(String(value ?? ''))
                      : String(value ?? '-')}
                  </p>
                </div>
              ))}
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col gap-5">
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-white/40">Estado</label>
              <CustomDropdown value={status} placeholder="Seleccionar estado..." onChange={(val) => setStatus(val)} options={statuses} />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-white/40">Notas Internas</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Observaciones..."
                className="w-full resize-none rounded-lg bg-white/5 border border-white/5 px-3 py-2.5 text-sm text-white/80 outline-none focus:border-white/20 transition-colors custom-scrollbar"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-[#0a0a0a]">
          <div className="grid grid-cols-2 gap-4">
            {detail.email ? (
              <a href={`mailto:${detail.email}`} className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-medium transition hover:bg-white/10 text-white/80">
                <Mail className="h-4 w-4" /> Responder
              </a>
            ) : (
              <div />
            )}
            <button onClick={handleSave} className="flex items-center justify-center gap-2 rounded-lg bg-white text-black py-2.5 text-sm font-medium transition hover:bg-white/90">
              Guardar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-120px)] font-sansation">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <h1 className="text-2xl font-semibold tracking-wide text-white/90">Gestión de Reclamos</h1>
        <button onClick={loadList} className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white">
          <RefreshCw className="h-4 w-4" /> <span>Actualizar</span>
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-300 text-sm">
          {error}
        </p>
      )}

      <section className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        
        {/* Panel Izquierdo: Lista */}
        <AdminPanel className="flex max-h-[calc(100vh-190px)] flex-col overflow-hidden lg:max-h-none">
          <div className="border-b border-white/5 px-5 py-4 flex items-center justify-between bg-white/[0.01]">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Reclamos</span>
            <span className="bg-white/5 text-white/70 text-[10px] px-2 py-0.5 rounded font-medium">{complaints.length}</span>
          </div>
          <div className="divide-y divide-white/5 overflow-y-auto flex-1 custom-scrollbar">
            {listLoading ? (
              <div className="px-5 py-10 text-center text-white/30 text-sm">Cargando...</div>
            ) : complaints.length === 0 ? (
              <div className="px-5 py-10 text-center text-white/30 text-sm">No hay registros.</div>
            ) : (
              complaints.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadDetail(item.id)}
                  className={`w-full grid gap-2 px-5 py-4 text-left transition-colors duration-200 md:grid-cols-[1fr_auto] border-l-2 ${selectedId === item.id ? 'bg-white/5 border-white/40' : 'border-transparent hover:bg-white/[0.02]'}`}
                >
                  <div className="flex flex-col gap-0.5">
                    <p className={`font-medium text-sm transition-colors ${selectedId === item.id ? 'text-white' : 'text-white/80'}`}>{item.code} · {item.nombres} {item.apellidos}</p>
                    <p className="text-xs text-white/40">{item.tipo_reclamo}</p>
                    <p className="text-[10px] text-white/30 mt-1">{formatDate(item.created_at)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 justify-start">
                    <span className="h-fit rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-white/60 whitespace-nowrap">
                      {statusLabel(item.status)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </AdminPanel>

        {/* Panel Derecho: Detalle y Controles */}
        <AdminPanel className="hidden flex-col overflow-hidden lg:flex">
          {renderDetailContent()}
        </AdminPanel>
      </section>

      <AnimatePresence>
        {mobileDetailOpen && detail && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileDetailOpen(false)}
          >
            <motion.div
              className="max-h-[92vh] w-full overflow-y-auto rounded-2xl border border-white/10 bg-[#060c1d] shadow-2xl custom-scrollbar"
              initial={{ y: 32, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 32, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#060c1d]/95 px-5 py-4 backdrop-blur">
                <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Detalle de reclamo</span>
                <button
                  type="button"
                  onClick={() => setMobileDetailOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label="Cerrar detalle"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {renderDetailContent()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reclamos;

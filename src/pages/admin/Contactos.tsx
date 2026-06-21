import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageSquareText, RefreshCw, UserCheck, X } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import StatusHistoryTimeline from '../../components/admin/StatusHistoryTimeline';
import type { StatusHistoryRecord } from '../../types/status';

export interface ContactCase {
  id: string;
  case_code?: string;
  nombre: string;
  apellido?: string;
  cargo: string;
  email: string;
  celular: string;
  empresa: string;
  ruc: string;
  servicio: string;
  status: string;
  status_name?: string;
  admin_notes: string;
  assigned_to?: string;
  created_at: string;
}

type ContactItem = ContactCase;

type AssignmentHistoryItem = {
  id: string;
  contact_case_id: string;
  assigned_to: string;
  assigned_by: string;
  assigned_at: string;
  unassigned_at: string | null;
  notes: string | null;
  assigned_to_name: string;
  assigned_by_name: string | null;
};

type DetailItem = Record<string, string | number | null | undefined>;

const detailFields: Array<{ key: string; label: string }> = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'apellido', label: 'Apellido' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'email', label: 'Email' },
  { key: 'celular', label: 'Celular' },
  { key: 'empresa', label: 'Empresa' },
  { key: 'ruc', label: 'RUC' },
  { key: 'servicio', label: 'Servicio' },
  { key: 'message', label: 'Mensaje' },
  { key: 'created_at', label: 'Creado' },
  { key: 'updated_at', label: 'Actualizado' },
];

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : '';

const formatShortDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      }).format(new Date(value))
    : '';

const formatFullName = (item: Pick<ContactItem, 'nombre' | 'apellido'>) =>
  [item.nombre, item.apellido].filter(Boolean).join(' ');



import AdminPanel from '../../components/admin/AdminPanel';
import CustomDropdown from '../../components/ui/CustomDropdown';

// ... (skip to the component rendering)

const Contactos: React.FC = () => {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailItem | null>(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('new');
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState('');
  const [statuses, setStatuses] = useState<{ value: string, label: string }[]>([]);

  const [adminsList, setAdminsList] = useState<{ value: string, label: string }[]>([]);
  const [history, setHistory] = useState<AssignmentHistoryItem[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryRecord[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const statusLabel = (statusCode: string) => statuses.find((item) => item.value === statusCode)?.label ?? statusCode;

  const loadCatalogs = async () => {
    try {
      const res = await apiRequest<{ items: { id: string, code: string, name: string }[] }>('/api/catalog/statuses');
      setStatuses(res.items.map(s => ({ value: s.code, label: s.name })));
      
      const adminRes = await apiRequest<{ items: { id: string, name: string }[] }>('/api/admin/users');
      setAdminsList(adminRes.items.map(a => ({ value: a.id, label: a.name })));
    } catch (err) {
      console.error(err);
    }
  };

  const loadList = async () => {
    setListLoading(true);
    setError('');
    try {
      const result = await apiRequest<{ items: ContactItem[] }>('/api/admin/contacts');
      setContacts(result.items);
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
      const result = await apiRequest<{ item: DetailItem }>(`/api/admin/contacts/${id}`);
      setDetail(result.item);
      setStatus(String(result.item.status ?? 'new'));
      setNotes(String(result.item.admin_notes ?? ''));
      
      const [assignmentResult, statusResult] = await Promise.all([
        apiRequest<{ items: AssignmentHistoryItem[] }>(`/api/admin/contacts/${id}/assignment-history`),
        apiRequest<{ items: StatusHistoryRecord[] }>(`/api/admin/contacts/${id}/history`),
      ]);
      setHistory(assignmentResult.items);
      setStatusHistory(statusResult.items);
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
      const result = await apiRequest<{ item: DetailItem }>(`/api/admin/contacts/${selectedId}`, {
        method: 'PATCH',
        json: { status, adminNotes: notes },
      });
      setDetail(result.item);
      const statusResult = await apiRequest<{ items: StatusHistoryRecord[] }>(`/api/admin/contacts/${selectedId}/history`);
      setStatusHistory(statusResult.items);
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
            <h2 className="text-xl font-semibold text-white/90">Detalle del Contacto</h2>
            {detail.case_code && (
              <span className="text-sm font-mono text-white/50">
                #{String(detail.case_code)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {detailFields.map(({ key, label }) => (
              <div key={key} className={key === 'message' ? 'sm:col-span-2' : ''}>
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{label}</p>
                <p className="break-words text-sm text-white/80">
                  {key === 'created_at' || key === 'updated_at'
                    ? formatDate(String(detail[key] ?? ''))
                    : String(detail[key] ?? '-')}
                </p>
              </div>
            ))}
          </div>

          {history.length > 0 && (
            <div className="pt-6 border-t border-white/5">
              <h3 className="text-[10px] uppercase tracking-wider text-white/40 mb-8">Historial de Asignaciones</h3>
              <div className="flex flex-wrap items-center gap-y-12">
                {history.map((item, index) => {
                  const isEven = index % 2 === 0;
                  return (
                    <React.Fragment key={item.id}>
                      <div className="relative z-10 group">
                        <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 cursor-pointer transition-colors hover:bg-white/10 hover:text-white relative z-20">
                          <UserCheck className="w-3.5 h-3.5" />
                        </div>
                        <div className={`absolute left-1/2 -translate-x-1/2 w-max text-center pointer-events-none ${isEven ? 'top-full mt-2' : 'bottom-full mb-2'}`}>
                          <span className="text-[9px] text-white/30 font-mono block whitespace-nowrap">
                            {formatShortDate(item.assigned_at)}
                          </span>
                        </div>
                        <div className={`absolute left-1/2 -translate-x-1/2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-[#121212] border border-white/10 rounded-lg p-3 shadow-xl z-50 pointer-events-none ${isEven ? 'bottom-full mb-3' : 'top-full mt-3'}`}>
                          <div className="text-[10px] text-white/40 mb-1">{formatDate(item.assigned_at)}</div>
                          <div className="text-xs text-white/80">
                            A <span className="text-white font-medium">{item.assigned_to_name}</span><br />
                            <span className="text-[10px] text-white/40">por {item.assigned_by_name || 'Sistema'}</span>
                          </div>
                          {item.notes && (
                            <div className="mt-2 text-[10px] text-white/50 border-l border-white/20 pl-2">
                              "{item.notes}"
                            </div>
                          )}
                        </div>
                      </div>
                      {index < history.length - 1 && (
                        <div className="w-6 h-px bg-white/10 mx-1"></div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-white/5 flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-white/40">Agente</label>
                {isAssigning ? (
                  <div className="w-full rounded-lg bg-white/5 border border-white/5 px-3 py-2.5 text-sm text-white/40 text-center animate-pulse">Asignando...</div>
                ) : (
                  <CustomDropdown
                    value={String(detail.assigned_to ?? '')}
                    placeholder="Seleccionar..."
                    onChange={handleAssignCase}
                    options={adminsList}
                  />
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-white/40">Estado</label>
                <CustomDropdown
                  value={status}
                  placeholder="Seleccionar estado..."
                  onChange={(val) => setStatus(val)}
                  options={statuses}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-white/40">Notas</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={2}
                placeholder="Observaciones..."
                className="w-full resize-none rounded-lg bg-white/5 border border-white/5 px-3 py-2.5 text-sm text-white/80 outline-none focus:border-white/20 transition-colors custom-scrollbar"
              />
            </div>
          </div>

          <StatusHistoryTimeline records={statusHistory} />
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

  const handleAssignCase = async (adminId: string) => {
    if (!selectedId) return;
    setIsAssigning(true);
    try {
      const result = await apiRequest<{ item: DetailItem }>(`/api/admin/contacts/${selectedId}/assign`, {
        method: 'POST',
        json: { assigned_to: adminId },
      });
      setDetail(result.item);
      const histResult = await apiRequest<{ items: AssignmentHistoryItem[] }>(`/api/admin/contacts/${selectedId}/assignment-history`);
      setHistory(histResult.items);
      await loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar el caso');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-120px)] font-sansation">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <h1 className="text-2xl font-semibold tracking-wide text-white/90">Gestión de Contactos</h1>
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
        
        {/* Panel Izquierdo: Lista de Contactos */}
        <AdminPanel className="flex max-h-[calc(100vh-190px)] flex-col overflow-hidden lg:max-h-none">
          <div className="border-b border-white/5 px-5 py-4 flex items-center justify-between bg-white/[0.01]">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Bandeja</span>
            <span className="bg-white/5 text-white/70 text-[10px] px-2 py-0.5 rounded font-medium">{contacts.length}</span>
          </div>
          <div className="divide-y divide-white/5 overflow-y-auto flex-1 custom-scrollbar">
            {listLoading ? (
              <div className="px-5 py-10 text-center text-white/30 text-sm">Cargando...</div>
            ) : contacts.length === 0 ? (
              <div className="px-5 py-10 text-center text-white/30 text-sm">No hay registros.</div>
            ) : (
              contacts.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadDetail(item.id)}
                  className={`w-full grid gap-2 px-5 py-4 text-left transition-colors duration-200 md:grid-cols-[1fr_auto] border-l-2 ${selectedId === item.id ? 'bg-white/5 border-white/40' : 'border-transparent hover:bg-white/[0.02]'}`}
                >
                  <div className="flex flex-col gap-0.5">
                    <p className={`font-medium text-base transition-colors ${selectedId === item.id ? 'text-white' : 'text-white/80'}`}>{formatFullName(item)}</p>
                    <p className="text-xs text-white/40">{item.empresa}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 justify-start">
                    <span className="h-fit rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-white/60 whitespace-nowrap">
                      {statusLabel(item.status)}
                    </span>
                    {item.assigned_to && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#06CFD6]/70">
                        <UserCheck className="h-3 w-3" />
                      </span>
                    )}
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
                <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Detalle de contacto</span>
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

export default Contactos;

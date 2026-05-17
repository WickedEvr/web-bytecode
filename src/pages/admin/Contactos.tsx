import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageSquareText, RefreshCw, UserCheck } from 'lucide-react';
import { apiRequest } from '../../lib/api';

type ContactItem = {
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
  admin_notes: string;
  assigned_to?: string;
  created_at: string;
};

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
  { key: 'case_code', label: 'Código' },
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

const formatFullName = (item: Pick<ContactItem, 'nombre' | 'apellido'>) =>
  [item.nombre, item.apellido].filter(Boolean).join(' ');

interface DropdownOption { value: string; label: string; }
interface CustomDropdownProps { value: string; options: DropdownOption[]; onChange: (val: string) => void; placeholder: string; required?: boolean; }

const CustomDropdown: React.FC<CustomDropdownProps> = ({ value, options, onChange, placeholder, required}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Hidden input for native HTML5 validation */}
      <input
        type="text"
        value={value}
        onChange={() => {}}
        required={required}
        className="absolute opacity-0 w-full h-full -z-10 pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
      />
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full bg-white rounded-xl px-4 py-3 cursor-pointer shadow-sm transition-all ${isOpen ? 'ring-2 ring-[#06CFD6]' : 'lg:hover:bg-gray-50'}`}
      >
        <span className={`text-[14px] ${value ? 'text-[#333]' : 'text-gray-400'}`}>
          {selectedLabel}
        </span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-[100]"
          >
            <div className="py-2 max-h-[200px] overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => { onChange(option.value); setIsOpen(false); }}
                  className={`px-4 py-2 cursor-pointer transition-colors ${value === option.value ? 'bg-[#06CFD6]/15 text-[#06CFD6] font-bold' : 'text-gray-600 lg:hover:bg-gray-200 lg:hover:text-gray-900'}`}
                >
                  <span className="text-[14px]">{option.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
  const [isAssigning, setIsAssigning] = useState(false);

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
      
      const histResult = await apiRequest<{ items: AssignmentHistoryItem[] }>(`/api/admin/contacts/${id}/history`);
      setHistory(histResult.items);
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
      await loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
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
      const histResult = await apiRequest<{ items: AssignmentHistoryItem[] }>(`/api/admin/contacts/${selectedId}/history`);
      setHistory(histResult.items);
      await loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar el caso');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full min-h-[80vh]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contactos</h1>
        <button onClick={loadList} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold transition hover:border-[#06CFD6]">
          <RefreshCw className="h-4 w-4" /> Actualizar
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-500/15 px-4 py-3 text-red-100">{error}</p>}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] flex-1">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] flex flex-col">
          <div className="border-b border-white/10 px-5 py-4 text-sm text-white/60">
            {listLoading ? 'Cargando...' : `${contacts.length} registros`}
          </div>
          <div className="divide-y divide-white/10 overflow-y-auto flex-1">
            {contacts.map((item) => (
              <button
                key={item.id}
                onClick={() => loadDetail(item.id)}
                className={`grid w-full gap-2 px-5 py-4 text-left transition hover:bg-white/[0.06] md:grid-cols-[1fr_auto] ${selectedId === item.id ? 'bg-[#06CFD6]/10' : ''}`}
              >
                <div>
                  <p className="font-bold">{formatFullName(item)}</p>
                  <p className="text-sm text-white/60">{item.empresa}</p>
                  <p className="mt-1 text-sm text-white/45">{formatDate(item.created_at)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="h-fit rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#06CFD6] whitespace-nowrap">
                    {statusLabel(item.status)}
                  </span>
                  {item.assigned_to && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#06CFD6]/20 px-2 py-0.5 text-[10px] font-semibold text-[#06CFD6]">
                      <UserCheck className="h-3 w-3" /> Asignado
                    </span>
                  )}
                </div>
              </button>
            ))}
            {!listLoading && contacts.length === 0 && (
              <div className="px-5 py-12 text-center text-white/50">No hay registros todavía.</div>
            )}
          </div>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 flex flex-col">
          {!detail ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-white/50">
              <MessageSquareText className="mb-3 h-10 w-10 text-[#06CFD6]" />
              Selecciona un registro para ver el detalle.
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <h2 className="text-xl font-bold mb-5">Detalle</h2>
              <div className="mb-5 max-h-[46vh] space-y-3 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                {detailFields.map(({ key, label }) => (
                  <div key={key} className="rounded-xl bg-black/20 p-3">
                    <p className="text-xs uppercase tracking-wide text-[#06CFD6]">{label}</p>
                    <p className="break-words text-sm text-white/85">
                      {key === 'created_at' || key === 'updated_at'
                        ? formatDate(String(detail[key] ?? ''))
                        : String(detail[key] ?? '-')}
                    </p>
                  </div>
                ))}

                {history.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h3 className="text-sm font-bold text-white/70 mb-3">Historial de Asignaciones</h3>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                      {history.map((item, index) => (
                        <motion.div 
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                        >
                          <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white/20 bg-[#06CFD6]/20 text-[#06CFD6] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                            <UserCheck className="w-3 h-3" />
                          </div>
                          <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-white/10 bg-black/20 shadow">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-xs text-white/50">{formatDate(item.assigned_at)}</div>
                            </div>
                            <div className="text-sm text-white/85">
                              Asignado a <span className="font-bold text-white">{item.assigned_to_name}</span> por <span className="text-white/70">{item.assigned_by_name || 'Sistema'}</span>
                            </div>
                            {item.notes && (
                              <blockquote className="mt-2 text-xs italic text-white/60 border-l-2 border-[#06CFD6]/50 pl-2">
                                "{item.notes}"
                              </blockquote>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white/70">Asignado a:</label>
                <div className="mb-4">
                  {isAssigning ? (
                    <div className="w-full rounded-xl bg-white/5 px-4 py-3 text-sm text-white/60 text-center animate-pulse">Asignando...</div>
                  ) : (
                    <CustomDropdown 
                      value={String(detail.assigned_to ?? '')} 
                      placeholder="Seleccionar agente..." 
                      onChange={handleAssignCase} 
                      options={adminsList} 
                    />
                  )}
                </div>

                <label className="mb-2 block text-sm font-bold text-white/70">Estado</label>
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="mb-4 w-full rounded-xl bg-white px-4 py-3 text-black outline-none">
                  {statuses.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>

                <label className="mb-2 block text-sm font-bold text-white/70">Notas internas</label>
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="mb-4 w-full resize-none rounded-xl bg-white px-4 py-3 text-black outline-none custom-scrollbar" />

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {detail.email && (
                    <a href={`mailto:${detail.email}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 py-3 font-bold transition hover:border-[#06CFD6]">
                      <Mail className="h-4 w-4" /> Responder
                    </a>
                  )}
                  <button onClick={handleSave} className="rounded-full bg-[#06CFD6] py-3 font-bold transition hover:bg-[#0CA3C6]">
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
};

export default Contactos;

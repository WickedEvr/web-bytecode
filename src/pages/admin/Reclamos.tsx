import React, { useEffect, useState } from 'react';
import { Download, Mail, MessageSquareText, RefreshCw } from 'lucide-react';
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

const Reclamos: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailItem | null>(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('new');
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState('');
  const [statuses, setStatuses] = useState<{ value: string, label: string }[]>([]);

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

  return (
    <div className="flex flex-col gap-6 h-full min-h-[80vh]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reclamos</h1>
        <button onClick={loadList} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold transition hover:border-[#06CFD6]">
          <RefreshCw className="h-4 w-4" /> Actualizar
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-500/15 px-4 py-3 text-red-100">{error}</p>}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] flex-1">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] flex flex-col">
          <div className="border-b border-white/10 px-5 py-4 text-sm text-white/60">
            {listLoading ? 'Cargando...' : `${complaints.length} registros`}
          </div>
          <div className="divide-y divide-white/10 overflow-y-auto flex-1">
            {complaints.map((item) => (
              <button
                key={item.id}
                onClick={() => loadDetail(item.id)}
                className={`grid w-full gap-2 px-5 py-4 text-left transition hover:bg-white/[0.06] md:grid-cols-[1fr_auto] ${selectedId === item.id ? 'bg-[#06CFD6]/10' : ''}`}
              >
                <div>
                  <p className="font-bold">{item.code} · {item.nombres} {item.apellidos}</p>
                  <p className="text-sm text-white/60">{item.tipo_reclamo}</p>
                  <p className="mt-1 text-sm text-white/45">{formatDate(item.created_at)}</p>
                </div>
                <span className="h-fit rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#06CFD6] whitespace-nowrap">
                  {statusLabel(item.status)}
                </span>
              </button>
            ))}
            {!listLoading && complaints.length === 0 && (
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
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold">Detalle</h2>
                {detail.attachment_original_name && selectedId && (
                  <a
                    href={apiUrl(`/api/admin/complaints/${selectedId}/attachment`)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-[#040e1f]"
                  >
                    <Download className="h-4 w-4" /> Adjunto
                  </a>
                )}
              </div>

              <div className="mb-5 max-h-[46vh] space-y-3 overflow-y-auto pr-2 flex-1">
                {Object.entries(detail)
                  .filter(([key]) => !['admin_notes', 'status', 'attachment_path'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="rounded-xl bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-wide text-[#06CFD6]">{key}</p>
                      <p className="break-words text-sm text-white/85">{String(value ?? '-')}</p>
                    </div>
                  ))}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white/70">Estado</label>
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="mb-4 w-full rounded-xl bg-white px-4 py-3 text-black outline-none">
                  {statuses.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>

                <label className="mb-2 block text-sm font-bold text-white/70">Notas internas</label>
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="mb-4 w-full resize-none rounded-xl bg-white px-4 py-3 text-black outline-none" />

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

export default Reclamos;

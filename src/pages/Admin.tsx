import React, { useEffect, useMemo, useState } from 'react';
import { Download, LogOut, Mail, MessageSquareText, RefreshCw, ShieldCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest, apiUrl } from '../lib/api';

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type ContactItem = {
  id: string;
  nombre: string;
  cargo: string;
  email: string;
  celular: string;
  empresa: string;
  ruc: string;
  servicio: string;
  status: string;
  admin_notes: string;
  created_at: string;
};

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
type AdminTab = 'contacts' | 'complaints';

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : '';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [tab, setTab] = useState<AdminTab>('contacts');
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailItem | null>(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('new');
  const [listLoading, setListLoading] = useState(false);
  const [statuses, setStatuses] = useState<{ value: string, label: string }[]>([]);

  const statusLabel = (statusCode: string) => statuses.find((item) => item.value === statusCode)?.label ?? statusCode;

  const currentItems = useMemo(() => (tab === 'contacts' ? contacts : complaints), [complaints, contacts, tab]);

  const loadCatalogs = async () => {
    try {
      const res = await apiRequest<{ items: { id: string, code: string, name: string }[] }>('/api/catalog/statuses');
      setStatuses(res.items.map(s => ({ value: s.code, label: s.name })));
    } catch (err) {
      console.error(err);
    }
  };

  const loadMe = async () => {
    try {
      const result = await apiRequest<{ admin: AdminUser }>('/api/auth/me');
      setAdmin(result.admin);
      await loadCatalogs();
    } catch {
      setAdmin(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const loadList = async () => {
    if (!admin) return;
    setListLoading(true);
    setError('');
    try {
      const path = tab === 'contacts' ? '/api/admin/contacts' : '/api/admin/complaints';
      const result = await apiRequest<{ items: ContactItem[] | ComplaintItem[] }>(path);
      if (tab === 'contacts') {
        setContacts(result.items as ContactItem[]);
      } else {
        setComplaints(result.items as ComplaintItem[]);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el panel.');
    } finally {
      setListLoading(false);
    }
  };

  const loadDetail = async (id: string) => {
    setSelectedId(id);
    setError('');
    try {
      const path = tab === 'contacts' ? `/api/admin/contacts/${id}` : `/api/admin/complaints/${id}`;
      const result = await apiRequest<{ item: DetailItem }>(path);
      setDetail(result.item);
      setStatus(String(result.item.status ?? 'new'));
      setNotes(String(result.item.admin_notes ?? ''));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el detalle.');
    }
  };

  useEffect(() => {
    void loadMe();
  }, []);

  useEffect(() => {
    setSelectedId(null);
    setDetail(null);
    void loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, tab]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginLoading(true);
    setError('');
    try {
      const result = await apiRequest<{ admin: AdminUser }>('/api/auth/login', {
        method: 'POST',
        json: credentials,
      });
      setAdmin(result.admin);
      navigate(searchParams.get('redirect') || '/admin', { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await apiRequest('/api/auth/logout', { method: 'POST' }).catch(() => null);
    setAdmin(null);
    setDetail(null);
    setSelectedId(null);
  };

  const handleSave = async () => {
    if (!selectedId) return;
    const path = tab === 'contacts' ? `/api/admin/contacts/${selectedId}` : `/api/admin/complaints/${selectedId}`;
    const result = await apiRequest<{ item: DetailItem }>(path, {
      method: 'PATCH',
      json: { status, adminNotes: notes },
    });
    setDetail(result.item);
    await loadList();
  };

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#040e1f] text-white">Cargando...</div>;
  }

  if (!admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#040e1f] px-6 font-sansation text-white">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.06] p-8 shadow-[0_0_40px_rgba(6,207,214,0.12)]">
          <div className="mb-8 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-[#06CFD6]" />
            <div>
              <h1 className="text-2xl font-bold">Panel Bytecode</h1>
              <p className="text-sm text-white/60">Acceso solo para administradores.</p>
            </div>
          </div>
          <label className="mb-2 block text-sm font-bold text-white/70">Correo</label>
          <input
            type="email"
            value={credentials.email}
            onChange={(event) => setCredentials((prev) => ({ ...prev, email: event.target.value }))}
            className="mb-4 w-full rounded-full bg-white px-5 py-3 text-black outline-none focus:ring-2 focus:ring-[#06CFD6]"
            required
          />
          <label className="mb-2 block text-sm font-bold text-white/70">Contraseña</label>
          <input
            type="password"
            value={credentials.password}
            onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
            className="mb-6 w-full rounded-full bg-white px-5 py-3 text-black outline-none focus:ring-2 focus:ring-[#06CFD6]"
            required
          />
          {error && <p className="mb-4 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">{error}</p>}
          <button disabled={loginLoading} className="w-full rounded-full bg-[#06CFD6] py-3 text-lg font-bold text-white transition hover:bg-[#0CA3C6] disabled:opacity-60">
            {loginLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#040e1f] px-5 py-6 font-sansation text-white lg:px-8">
      <header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-[#06CFD6]">Bytecode Admin</p>
          <h1 className="text-3xl font-bold">Mensajes y reclamos</h1>
          <p className="text-white/60">{admin.name} · {admin.email}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadList} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold transition hover:border-[#06CFD6]">
            <RefreshCw className="h-4 w-4" /> Actualizar
          </button>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#040e1f] transition hover:bg-[#06CFD6] hover:text-white">
            <LogOut className="h-4 w-4" /> Salir
          </button>
        </div>
      </header>

      <div className="mb-5 flex gap-3">
        <button onClick={() => setTab('contacts')} className={`rounded-full px-5 py-2 font-bold transition ${tab === 'contacts' ? 'bg-[#06CFD6]' : 'bg-white/10 hover:bg-white/15'}`}>
          Contactos
        </button>
        <button onClick={() => setTab('complaints')} className={`rounded-full px-5 py-2 font-bold transition ${tab === 'complaints' ? 'bg-[#06CFD6]' : 'bg-white/10 hover:bg-white/15'}`}>
          Reclamos
        </button>
      </div>

      {error && <p className="mb-5 rounded-xl bg-red-500/15 px-4 py-3 text-red-100">{error}</p>}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="border-b border-white/10 px-5 py-4 text-sm text-white/60">
            {listLoading ? 'Cargando...' : `${currentItems.length} registros`}
          </div>
          <div className="divide-y divide-white/10">
            {currentItems.map((item) => {
              const isContact = tab === 'contacts';
              const title = isContact ? (item as ContactItem).nombre : `${(item as ComplaintItem).code} · ${(item as ComplaintItem).nombres} ${(item as ComplaintItem).apellidos}`;
              const subtitle = isContact ? (item as ContactItem).empresa : (item as ComplaintItem).tipo_reclamo;
              return (
                <button
                  key={item.id}
                  onClick={() => loadDetail(item.id)}
                  className={`grid w-full gap-2 px-5 py-4 text-left transition hover:bg-white/[0.06] md:grid-cols-[1fr_auto] ${selectedId === item.id ? 'bg-[#06CFD6]/10' : ''}`}
                >
                  <div>
                    <p className="font-bold">{title}</p>
                    <p className="text-sm text-white/60">{subtitle}</p>
                    <p className="mt-1 text-sm text-white/45">{formatDate(item.created_at)}</p>
                  </div>
                  <span className="h-fit rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#06CFD6]">
                    {statusLabel(item.status)}
                  </span>
                </button>
              );
            })}
            {!listLoading && currentItems.length === 0 && (
              <div className="px-5 py-12 text-center text-white/50">No hay registros todavía.</div>
            )}
          </div>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          {!detail ? (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center text-white/50">
              <MessageSquareText className="mb-3 h-10 w-10 text-[#06CFD6]" />
              Selecciona un registro para ver el detalle.
            </div>
          ) : (
            <div>
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold">Detalle</h2>
                {tab === 'complaints' && detail.attachment_original_name && selectedId && (
                  <a
                    href={apiUrl(`/api/admin/complaints/${selectedId}/attachment`)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-[#040e1f]"
                  >
                    <Download className="h-4 w-4" /> Adjunto
                  </a>
                )}
              </div>

              <div className="mb-5 max-h-[46vh] space-y-3 overflow-y-auto pr-2">
                {Object.entries(detail)
                  .filter(([key]) => !['admin_notes', 'status', 'attachment_path'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="rounded-xl bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-wide text-[#06CFD6]">{key}</p>
                      <p className="break-words text-sm text-white/85">{String(value ?? '-')}</p>
                    </div>
                  ))}
              </div>

              <label className="mb-2 block text-sm font-bold text-white/70">Estado</label>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="mb-4 w-full rounded-xl bg-white px-4 py-3 text-black outline-none">
                {statuses.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>

              <label className="mb-2 block text-sm font-bold text-white/70">Notas internas</label>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} className="mb-4 w-full resize-none rounded-xl bg-white px-4 py-3 text-black outline-none" />

              <div className="grid grid-cols-2 gap-3">
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
          )}
        </aside>
      </section>
    </main>
  );
};

export default Admin;

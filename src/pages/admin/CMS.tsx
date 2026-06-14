import React, { useEffect, useState } from 'react';
import { Database, Globe, MoreVertical, RefreshCw, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import AdminPanel from '../../components/admin/AdminPanel';

type CMSPage = {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  updated_at: string;
};

const AdminCMS: React.FC = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CMSPage>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const loadPages = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest<{ items: CMSPage[] }>('/api/admin/cms/pages');
      setPages(res.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar paginas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPages();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleEdit = (page: CMSPage) => {
    setEditingId(page.id);
    setFormData(page);
    setOpenMenuId(null);
  };

  const handleModify = (page: CMSPage) => {
    setOpenMenuId(null);
    if (page.slug === 'portafolio') {
      navigate('/admin/portafolio');
      return;
    }

    handleEdit(page);
  };

  const handleSave = async () => {
    if (!editingId) return;
    setLoading(true);
    setError('');
    try {
      await apiRequest(`/api/admin/cms/pages/${editingId}`, {
        method: 'PATCH',
        json: {
          title: formData.title,
          meta_title: formData.meta_title,
          meta_description: formData.meta_description,
          is_published: formData.is_published,
        },
      });
      setEditingId(null);
      await loadPages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar pagina');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));

  return (
    <div className="flex flex-col gap-6 font-sansation">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6 text-white/50" />
          <div>
            <h1 className="text-2xl font-semibold tracking-wide text-white/90">Gestor de Contenido (CMS)</h1>
            <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">Administracion de paginas y SEO</p>
          </div>
        </div>
        <button onClick={loadPages} className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white">
          <RefreshCw className="h-4 w-4" /> <span>Actualizar</span>
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-300 text-sm">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <AdminPanel className="flex flex-col overflow-visible">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/[0.02] text-white/50 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Pagina</th>
                  <th className="px-6 py-4 font-medium">Slug</th>
                  <th className="px-6 py-4 font-medium">Meta titulo</th>
                  <th className="px-6 py-4 font-medium">Meta descripcion</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium">Ultima mod.</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {pages.map((page) => (
                  <tr key={page.id} className={`transition-colors hover:bg-white/[0.02] ${editingId === page.id ? 'bg-white/5' : ''}`}>
                    <td className="px-6 py-4 font-medium">{page.title}</td>
                    <td className="px-6 py-4 font-mono text-xs text-white/50">/{page.slug}</td>
                    <td className="px-6 py-4 max-w-[220px] truncate text-white/60" title={page.meta_title ?? ''}>{page.meta_title || '-'}</td>
                    <td className="px-6 py-4 max-w-[280px] truncate text-white/50" title={page.meta_description ?? ''}>{page.meta_description || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium ${page.is_published ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}>
                        <Globe className="h-3 w-3" /> {page.is_published ? 'Publico' : 'Borrador'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/40 text-xs">{formatDate(page.updated_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-flex">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenMenuId((current) => (current === page.id ? null : page.id));
                          }}
                          className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                          aria-label="Abrir acciones"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {openMenuId === page.id && (
                          <div
                            onClick={(event) => event.stopPropagation()}
                            className="absolute right-0 top-full z-30 mt-2 w-36 rounded-xl border border-white/10 bg-[#121212] p-1 shadow-xl"
                          >
                            <button
                              type="button"
                              onClick={() => handleModify(page)}
                              className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                            >
                              {page.slug === 'portafolio' ? 'Modificar' : 'Editar'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {pages.length === 0 && !loading && (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-white/30 text-sm">No hay paginas configuradas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </AdminPanel>

        <AdminPanel className="p-6 flex flex-col">
          {!editingId ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-white/30">
              <Database className="mb-4 h-8 w-8 opacity-50" />
              <p className="text-sm">Selecciona una pagina para editar.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <h2 className="text-lg font-semibold border-b border-white/5 pb-4 text-white/90">
                Editar pagina: <span className="font-mono text-white/50 text-sm">/{formData.slug}</span>
              </h2>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">Titulo principal</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">SEO: Meta titulo</label>
                <input
                  type="text"
                  value={formData.meta_title || ''}
                  onChange={(event) => setFormData({ ...formData, meta_title: event.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">SEO: Meta descripcion</label>
                <textarea
                  rows={3}
                  value={formData.meta_description || ''}
                  onChange={(event) => setFormData({ ...formData, meta_description: event.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors custom-scrollbar resize-none"
                />
              </div>

              <label className="flex items-center gap-3 py-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={formData.is_published || false}
                  onChange={(event) => setFormData({ ...formData, is_published: event.target.checked })}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/20 focus:ring-offset-black"
                />
                <div>
                  <span className="block text-sm font-medium text-white/80">Pagina publicada</span>
                  <span className="text-[10px] text-white/40">Si se desactiva, devolvera error 404.</span>
                </div>
              </label>

              <div className="mt-4 flex gap-3 pt-4 border-t border-white/5">
                <button onClick={() => setEditingId(null)} className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={loading} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-white text-black py-2.5 text-sm font-medium transition-colors hover:bg-white/90 disabled:opacity-50">
                  <Save className="h-4 w-4" /> Guardar
                </button>
              </div>
            </div>
          )}
        </AdminPanel>
      </div>
    </div>
  );
};

export default AdminCMS;

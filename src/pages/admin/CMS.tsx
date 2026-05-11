import React, { useEffect, useState } from 'react';
import { Database, RefreshCw, Save, Globe } from 'lucide-react';
import { apiRequest } from '../../lib/api';

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
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CMSPage>>({});

  const loadPages = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest<{ items: CMSPage[] }>('/api/admin/cms/pages');
      setPages(res.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar páginas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPages();
  }, []);

  const handleEdit = (page: CMSPage) => {
    setEditingId(page.id);
    setFormData(page);
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
        }
      });
      setEditingId(null);
      await loadPages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar página');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (val: string) => 
    new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(val));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-[#06CFD6]" />
          <div>
            <h1 className="text-3xl font-bold">Gestor de Contenido (CMS)</h1>
            <p className="text-white/60 text-sm">Administración de páginas y SEO</p>
          </div>
        </div>
        <button onClick={loadPages} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold transition hover:border-[#06CFD6]">
          <RefreshCw className="h-4 w-4" /> Actualizar
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-500/15 px-4 py-3 text-red-100">{error}</p>}

      <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
        {/* Pages List */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden flex flex-col">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-5 py-4 font-medium">Página</th>
                <th className="px-5 py-4 font-medium">Slug</th>
                <th className="px-5 py-4 font-medium">Estado</th>
                <th className="px-5 py-4 font-medium">Última Mod.</th>
                <th className="px-5 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {pages.map(page => (
                <tr key={page.id} className={`transition hover:bg-white/[0.02] ${editingId === page.id ? 'bg-[#06CFD6]/10' : ''}`}>
                  <td className="px-5 py-4 font-bold">{page.title}</td>
                  <td className="px-5 py-4 font-mono text-xs text-white/60">/{page.slug}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${page.is_published ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                      <Globe className="h-3 w-3" /> {page.is_published ? 'Público' : 'Borrador'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/50">{formatDate(page.updated_at)}</td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => handleEdit(page)} className="text-[#06CFD6] hover:underline font-bold">Editar</button>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && !loading && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-white/50">No hay páginas configuradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Panel */}
        <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          {!editingId ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-white/50">
              <Database className="mb-3 h-10 w-10 text-[#06CFD6]" />
              Selecciona una página para editar su contenido y SEO.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold border-b border-white/10 pb-3">Editar Página: /{formData.slug}</h2>
              
              <div>
                <label className="mb-1 block text-sm font-bold text-white/70">Título Principal (H1)</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 outline-none focus:border-[#06CFD6]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-white/70">SEO: Meta Título</label>
                <input
                  type="text"
                  value={formData.meta_title || ''}
                  onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 outline-none focus:border-[#06CFD6]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-white/70">SEO: Meta Descripción</label>
                <textarea
                  rows={3}
                  value={formData.meta_description || ''}
                  onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                  className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 outline-none focus:border-[#06CFD6] resize-none"
                />
              </div>

              <label className="flex items-center gap-3 py-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={formData.is_published || false}
                  onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                  className="h-5 w-5 rounded border-white/20 bg-white/10 text-[#06CFD6] focus:ring-[#06CFD6]"
                />
                <div>
                  <span className="block text-sm font-bold text-white">Página Publicada</span>
                  <span className="text-xs text-white/50">Si se desactiva, devolverá un error 404 a los usuarios.</span>
                </div>
              </label>

              <div className="mt-4 flex gap-3">
                <button onClick={() => setEditingId(null)} className="flex-1 rounded-xl border border-white/10 py-3 font-bold hover:bg-white/5">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={loading} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#06CFD6] py-3 font-bold hover:bg-[#0CA3C6] disabled:opacity-50">
                  <Save className="h-4 w-4" /> Guardar
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default AdminCMS;

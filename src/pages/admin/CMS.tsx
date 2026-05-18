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

import AdminPanel from '../../components/admin/AdminPanel';

// ... (skip to component)

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
    <div className="flex flex-col gap-6 font-sansation">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6 text-white/50" />
          <div>
            <h1 className="text-2xl font-semibold tracking-wide text-white/90">Gestor de Contenido (CMS)</h1>
            <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">Administración de páginas y SEO</p>
          </div>
        </div>
        <button onClick={loadPages} className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white">
          <RefreshCw className="h-4 w-4" /> <span>Actualizar</span>
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-300 text-sm">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Pages List */}
        <AdminPanel className="flex flex-col overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/[0.02] text-white/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Página</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Última Mod.</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {pages.map(page => (
                <tr key={page.id} className={`transition-colors hover:bg-white/[0.02] ${editingId === page.id ? 'bg-white/5' : ''}`}>
                  <td className="px-6 py-4 font-medium">{page.title}</td>
                  <td className="px-6 py-4 font-mono text-xs text-white/50">/{page.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium ${page.is_published ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}>
                      <Globe className="h-3 w-3" /> {page.is_published ? 'Público' : 'Borrador'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/40 text-xs">{formatDate(page.updated_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(page)} className="text-sm font-medium text-white/60 hover:text-white transition-colors">Editar</button>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && !loading && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-white/30 text-sm">No hay páginas configuradas.</td></tr>
              )}
            </tbody>
          </table>
        </AdminPanel>

        {/* Edit Panel */}
        <AdminPanel className="p-6 flex flex-col">
          {!editingId ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-white/30">
              <Database className="mb-4 h-8 w-8 opacity-50" />
              <p className="text-sm">Selecciona una página para editar.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <h2 className="text-lg font-semibold border-b border-white/5 pb-4 text-white/90">Editar Página: <span className="font-mono text-white/50 text-sm">/{formData.slug}</span></h2>
              
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">Título Principal (H1)</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">SEO: Meta Título</label>
                <input
                  type="text"
                  value={formData.meta_title || ''}
                  onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">SEO: Meta Descripción</label>
                <textarea
                  rows={3}
                  value={formData.meta_description || ''}
                  onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors custom-scrollbar resize-none"
                />
              </div>

              <label className="flex items-center gap-3 py-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={formData.is_published || false}
                  onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/20 focus:ring-offset-black"
                />
                <div>
                  <span className="block text-sm font-medium text-white/80">Página Publicada</span>
                  <span className="text-[10px] text-white/40">Si se desactiva, devolverá error 404.</span>
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

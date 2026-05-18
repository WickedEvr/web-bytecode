import React, { useEffect, useMemo, useState } from 'react';
import { ImageUp, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import AdminPanel from '../../components/admin/AdminPanel';
import { apiRequest, type AdminPortfolioItemData, type PortfolioTechnologyData } from '../../lib/api';

type PortfolioForm = {
  name: string;
  clientName: string;
  description: string;
  websiteUrl: string;
  sortOrder: number;
  isFeatured: boolean;
  isPublished: boolean;
  technologyIds: string[];
};

const emptyForm: PortfolioForm = {
  name: '',
  clientName: '',
  description: '',
  websiteUrl: '',
  sortOrder: 0,
  isFeatured: true,
  isPublished: true,
  technologyIds: [],
};

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(value))
    : '-';

const toForm = (item: AdminPortfolioItemData): PortfolioForm => ({
  name: item.name,
  clientName: item.client_name ?? '',
  description: item.description ?? '',
  websiteUrl: item.website_url ?? '',
  sortOrder: item.sort_order,
  isFeatured: item.is_featured,
  isPublished: item.is_published,
  technologyIds: item.technologies.map((technology) => technology.id),
});

const AdminPortafolio: React.FC = () => {
  const [items, setItems] = useState<AdminPortfolioItemData[]>([]);
  const [technologies, setTechnologies] = useState<PortfolioTechnologyData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<PortfolioForm>(emptyForm);
  const [newTechnology, setNewTechnology] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageAlt, setImageAlt] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [itemsRes, technologiesRes] = await Promise.all([
        apiRequest<{ items: AdminPortfolioItemData[] }>('/api/admin/portfolio'),
        apiRequest<{ items: PortfolioTechnologyData[] }>('/api/admin/portfolio/technologies'),
      ]);
      setItems(itemsRes.items);
      setTechnologies(technologiesRes.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el portafolio.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSelect = (item: AdminPortfolioItemData) => {
    setSelectedId(item.id);
    setForm(toForm(item));
    setImageFile(null);
    setImageAlt(item.alt_text ?? '');
  };

  const handleNew = () => {
    setSelectedId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImageAlt('');
  };

  const toggleTechnology = (technologyId: string) => {
    setForm((current) => ({
      ...current,
      technologyIds: current.technologyIds.includes(technologyId)
        ? current.technologyIds.filter((id) => id !== technologyId)
        : [...current.technologyIds, technologyId],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        clientName: form.clientName,
        description: form.description,
        websiteUrl: form.websiteUrl || undefined,
        sortOrder: form.sortOrder,
        isFeatured: form.isFeatured,
        isPublished: form.isPublished,
        technologyIds: form.technologyIds,
      };

      const response = selectedId
        ? await apiRequest<{ item: AdminPortfolioItemData }>(`/api/admin/portfolio/${selectedId}`, {
            method: 'PATCH',
            json: payload,
          })
        : await apiRequest<{ item: AdminPortfolioItemData }>('/api/admin/portfolio', {
            method: 'POST',
            json: payload,
          });

      setSelectedId(response.item.id);
      setForm(toForm(response.item));
      setItems((current) => {
        const exists = current.some((item) => item.id === response.item.id);
        return exists
          ? current.map((item) => (item.id === response.item.id ? response.item : item))
          : [response.item, ...current];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el proyecto.');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedId || !imageFile) return;
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('altText', imageAlt || form.name);

      const response = await apiRequest<{ item: AdminPortfolioItemData }>(`/api/admin/portfolio/${selectedId}/image`, {
        method: 'POST',
        body: formData,
      });

      setItems((current) => current.map((item) => (item.id === response.item.id ? response.item : item)));
      setImageFile(null);
      setImageAlt(response.item.alt_text ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir la imagen.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTechnology = async () => {
    if (!newTechnology.trim()) return;
    setSaving(true);
    setError('');
    try {
      const response = await apiRequest<{ item: PortfolioTechnologyData }>('/api/admin/portfolio/technologies', {
        method: 'POST',
        json: { name: newTechnology.trim(), sortOrder: technologies.length * 10 + 10 },
      });
      setTechnologies((current) => {
        const exists = current.some((technology) => technology.id === response.item.id);
        return exists
          ? current.map((technology) => (technology.id === response.item.id ? response.item : technology))
          : [...current, response.item];
      });
      setForm((current) => ({
        ...current,
        technologyIds: current.technologyIds.includes(response.item.id)
          ? current.technologyIds
          : [...current.technologyIds, response.item.id],
      }));
      setNewTechnology('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la tecnologia.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const confirmed = window.confirm('¿Eliminar este proyecto del portafolio?');
    if (!confirmed) return;

    setSaving(true);
    setError('');
    try {
      await apiRequest(`/api/admin/portfolio/${selectedId}`, { method: 'DELETE' });
      setItems((current) => current.filter((item) => item.id !== selectedId));
      handleNew();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el proyecto.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sansation">
      <div className="flex flex-col gap-4 border-b border-white/5 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-white/90">Portafolio</h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-white/40">Proyectos, imagenes y tecnologias del carrusel publico</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleNew} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10">
            <Plus className="h-4 w-4" /> Nuevo
          </button>
          <button onClick={loadData} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10">
            <RefreshCw className="h-4 w-4" /> Actualizar
          </button>
        </div>
      </div>

      {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <AdminPanel className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.01] px-5 py-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Proyectos</span>
            <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/70">{items.length}</span>
          </div>
          <div className="max-h-[620px] divide-y divide-white/5 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="px-5 py-10 text-center text-sm text-white/30">Cargando...</div>
            ) : items.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-white/30">No hay proyectos creados.</div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`grid w-full grid-cols-[74px_1fr] gap-4 px-5 py-4 text-left transition ${selectedId === item.id ? 'bg-white/5' : 'hover:bg-white/[0.03]'}`}
                >
                  <div className="h-16 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/20">
                        <ImageUp className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white/85">{item.client_name || item.name}</p>
                    <p className="truncate text-xs text-white/40">{item.item_code}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.technologies.slice(0, 3).map((technology) => (
                        <span key={technology.id} className="rounded border border-[#06CFD6]/30 px-1.5 py-0.5 text-[10px] text-[#06CFD6]">
                          {technology.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </AdminPanel>

        <AdminPanel className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-white/90">{selectedId ? 'Editar proyecto' : 'Nuevo proyecto'}</h2>
                <p className="mt-1 text-xs text-white/40">{selectedItem ? `Actualizado: ${formatDate(selectedItem.updated_at)}` : 'Guarda el proyecto para habilitar la subida de imagen.'}</p>
              </div>
              {selectedId && (
                <button onClick={handleDelete} disabled={saving} className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-300 transition hover:bg-red-500/20 disabled:opacity-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-white/40">Nombre de la web</span>
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 outline-none transition focus:border-white/30" />
              </label>
              <label className="grid gap-1.5 md:col-span-2">
                <span className="text-[10px] uppercase tracking-wider text-white/40">URL publica</span>
                <input value={form.websiteUrl} onChange={(event) => setForm({ ...form, websiteUrl: event.target.value })} placeholder="https://..." className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 outline-none transition focus:border-white/30" />
              </label>
              <label className="grid gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-white/40">Orden</span>
                <input type="number" min={0} value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 outline-none transition focus:border-white/30" />
              </label>
              <div className="flex items-end gap-5">
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} />
                  Publicado
                </label>
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })} />
                  Destacado
                </label>
              </div>
            </div>

            <div className="grid gap-3 border-t border-white/5 pt-5">
              <div className="flex flex-col gap-3 md:flex-row">
                <input value={newTechnology} onChange={(event) => setNewTechnology(event.target.value)} placeholder="Nueva tecnologia" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 outline-none transition focus:border-white/30" />
                <button onClick={handleCreateTechnology} disabled={saving || !newTechnology.trim()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:opacity-50">
                  <Plus className="h-4 w-4" /> Agregar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {technologies.map((technology) => {
                  const active = form.technologyIds.includes(technology.id);
                  return (
                    <button
                      key={technology.id}
                      onClick={() => toggleTechnology(technology.id)}
                      className={`rounded-md border px-3 py-1.5 text-xs transition ${active ? 'border-[#06CFD6]/60 bg-[#06CFD6]/10 text-[#06CFD6]' : 'border-white/10 bg-white/5 text-white/50 hover:text-white/80'}`}
                    >
                      {technology.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end border-t border-white/5 pt-5">
              <button onClick={handleSave} disabled={saving || !form.name.trim()} className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50">
                <Save className="h-4 w-4" /> Guardar proyecto
              </button>
            </div>

            <div className="grid gap-4 border-t border-white/5 pt-5">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50">Imagen del carrusel</h3>
                {!selectedId && <p className="mt-2 text-xs text-white/35">Primero guarda el proyecto para poder subir la imagen.</p>}
              </div>
              <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                <div className="aspect-video overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  {selectedItem?.image_url ? (
                    <img src={selectedItem.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/20">
                      <ImageUp className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="grid gap-3">
                  <input type="file" accept="image/png,image/jpeg,image/webp" disabled={!selectedId} onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-black disabled:opacity-50" />
                  <input value={imageAlt} disabled={!selectedId} onChange={(event) => setImageAlt(event.target.value)} placeholder="Texto alternativo" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 outline-none transition focus:border-white/30 disabled:opacity-50" />
                  <button onClick={handleUploadImage} disabled={saving || !selectedId || !imageFile} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:opacity-50">
                    <ImageUp className="h-4 w-4" /> Subir imagen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </AdminPanel>
      </section>
    </div>
  );
};

export default AdminPortafolio;

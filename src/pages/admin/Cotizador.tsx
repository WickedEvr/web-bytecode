import React, { useEffect, useState } from 'react';
import { Calculator, RefreshCw, Plus, Save, X } from 'lucide-react';
import { apiRequest } from '../../lib/api';

type Quote = {
  id: string;
  quote_code: string;
  total_amount: string;
  status: string;
  created_at: string;
  first_name: string;
  primary_email: string;
};

type CatalogItem = {
  id: string;
  item_code: string;
  name: string;
  unit_price: string;
};

import AdminPanel from '../../components/admin/AdminPanel';

// ... (skip to component)

const AdminCotizador: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    notes: '',
  });
  const [selectedItems, setSelectedItems] = useState<{ catalog_item_id: string; quantity: number }[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [quotesRes, catalogRes] = await Promise.all([
        apiRequest<{ items: Quote[] }>('/api/admin/quotations'),
        apiRequest<{ items: CatalogItem[] }>('/api/admin/catalog/pricing')
      ]);
      setQuotes(quotesRes.items);
      setCatalog(catalogRes.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setError('Debes seleccionar al menos un ítem.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiRequest('/api/admin/quotations', {
        method: 'POST',
        json: {
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          notes: formData.notes,
          items: selectedItems,
        }
      });
      setIsModalOpen(false);
      setFormData({ customerName: '', customerEmail: '', notes: '' });
      setSelectedItems([]);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar cotización');
    } finally {
      setLoading(false);
    }
  };

  const addItem = (id: string) => {
    if (!id) return;
    const existing = selectedItems.find(i => i.catalog_item_id === id);
    if (existing) {
      setSelectedItems(selectedItems.map(i => i.catalog_item_id === id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setSelectedItems([...selectedItems, { catalog_item_id: id, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      setSelectedItems(selectedItems.filter(i => i.catalog_item_id !== id));
    } else {
      setSelectedItems(selectedItems.map(i => i.catalog_item_id === id ? { ...i, quantity: qty } : i));
    }
  };

  const calculateTotal = () => {
    return selectedItems.reduce((acc, item) => {
      const catalogItem = catalog.find(c => c.id === item.catalog_item_id);
      if (catalogItem) {
        return acc + (parseFloat(catalogItem.unit_price) * item.quantity);
      }
      return acc;
    }, 0);
  };

  const formatDate = (val: string) => 
    new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(val));

  return (
    <div className="flex flex-col gap-6 font-sansation">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Calculator className="h-6 w-6 text-white/50" />
          <div>
            <h1 className="text-2xl font-semibold tracking-wide text-white/90">Cotizador</h1>
            <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">Generación dinámica de cotizaciones</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={loadData} className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white">
            <RefreshCw className="h-4 w-4" /> <span>Actualizar</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90">
            <Plus className="h-4 w-4" /> <span>Nueva Cotización</span>
          </button>
        </div>
      </div>

      {error && !isModalOpen && <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-300 text-sm">{error}</p>}

      <AdminPanel className="flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/[0.02] text-white/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Código</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Monto Total</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {quotes.map(quote => (
                <tr key={quote.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-4 font-medium">{quote.quote_code}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{quote.first_name || 'Desconocido'}</p>
                    <p className="text-xs text-white/40">{quote.primary_email}</p>
                  </td>
                  <td className="px-6 py-4 font-mono">S/ {Number(quote.total_amount).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-white/5 border border-white/5 px-2 py-0.5 text-[10px] font-medium text-white/60 uppercase tracking-widest">
                      {quote.status || 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/40 text-xs">{formatDate(quote.created_at)}</td>
                </tr>
              ))}
              {quotes.length === 0 && !loading && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-white/30 text-sm">No hay cotizaciones registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>


      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0a0a0a] border border-white/10 p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white/90">Nueva Cotización</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-2 text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && isModalOpen && <p className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">{error}</p>}

            <form onSubmit={handleCreate} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">Nombre del Cliente</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">Agregar Ítem del Catálogo</label>
                <select
                  onChange={e => addItem(e.target.value)}
                  value=""
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors appearance-none"
                >
                  <option value="" className="bg-[#121212]">-- Seleccionar Servicio / Producto --</option>
                  {catalog.map(item => (
                    <option key={item.id} value={item.id} className="bg-[#121212]">{item.name} - S/ {item.unit_price}</option>
                  ))}
                </select>
              </div>

              {selectedItems.length > 0 && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                  <h3 className="text-[10px] font-medium uppercase tracking-wider text-white/50 mb-4">Ítems Seleccionados</h3>
                  <div className="flex flex-col gap-3">
                    {selectedItems.map(item => {
                      const cItem = catalog.find(c => c.id === item.catalog_item_id);
                      return (
                        <div key={item.catalog_item_id} className="flex items-center justify-between text-sm">
                          <span className="flex-1 text-white/80">{cItem?.name}</span>
                          <span className="w-24 text-center font-mono text-white/60">S/ {cItem?.unit_price}</span>
                          <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={e => updateQuantity(item.catalog_item_id, parseInt(e.target.value) || 0)}
                            className="w-16 rounded-md bg-white/5 border border-white/10 px-2 py-1.5 text-center text-white/90 outline-none focus:border-white/30"
                          />
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-5 border-t border-white/5 pt-4 text-right flex items-center justify-end gap-3">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-white/50">Total Estimado: </span>
                    <span className="text-lg font-mono text-white">S/ {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/60">Observaciones Internas</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full resize-none rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/30 transition-colors custom-scrollbar"
                />
              </div>

              <div className="mt-2 flex gap-3 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-white text-black py-2.5 text-sm font-medium transition-colors hover:bg-white/90 disabled:opacity-50">
                  <Save className="h-4 w-4" /> {loading ? 'Generando...' : 'Generar Cotización'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCotizador;

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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator className="h-8 w-8 text-[#06CFD6]" />
          <div>
            <h1 className="text-3xl font-bold">Cotizador</h1>
            <p className="text-white/60 text-sm">Generación dinámica de cotizaciones</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={loadData} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold transition hover:border-[#06CFD6]">
            <RefreshCw className="h-4 w-4" /> Actualizar
          </button>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-[#06CFD6] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0CA3C6]">
            <Plus className="h-4 w-4" /> Nueva Cotización
          </button>
        </div>
      </div>

      {error && !isModalOpen && <p className="rounded-xl bg-red-500/15 px-4 py-3 text-red-100">{error}</p>}

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="px-5 py-4 font-medium">Código</th>
                <th className="px-5 py-4 font-medium">Cliente</th>
                <th className="px-5 py-4 font-medium">Monto Total</th>
                <th className="px-5 py-4 font-medium">Estado</th>
                <th className="px-5 py-4 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {quotes.map(quote => (
                <tr key={quote.id} className="transition hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-bold">{quote.quote_code}</td>
                  <td className="px-5 py-4">
                    <p className="font-bold">{quote.first_name || 'Desconocido'}</p>
                    <p className="text-xs text-white/50">{quote.primary_email}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-[#06CFD6]">S/ {Number(quote.total_amount).toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-white/80 uppercase tracking-wide">
                      {quote.status || 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/50">{formatDate(quote.created_at)}</td>
                </tr>
              ))}
              {quotes.length === 0 && !loading && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-white/50">No hay cotizaciones registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#040e1f] border border-white/10 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Nueva Cotización</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-2 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && isModalOpen && <p className="mb-4 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">{error}</p>}

            <form onSubmit={handleCreate} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-bold text-white/70">Nombre del Cliente</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 outline-none focus:border-[#06CFD6]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-white/70">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 outline-none focus:border-[#06CFD6]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-white/70">Agregar Ítem del Catálogo</label>
                <select
                  onChange={e => addItem(e.target.value)}
                  value=""
                  className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 outline-none [&>option]:bg-[#040e1f]"
                >
                  <option value="">-- Seleccionar Servicio / Producto --</option>
                  {catalog.map(item => (
                    <option key={item.id} value={item.id}>{item.name} - S/ {item.unit_price}</option>
                  ))}
                </select>
              </div>

              {selectedItems.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <h3 className="text-sm font-bold mb-3 text-white/80">Ítems Seleccionados</h3>
                  <div className="flex flex-col gap-2">
                    {selectedItems.map(item => {
                      const cItem = catalog.find(c => c.id === item.catalog_item_id);
                      return (
                        <div key={item.catalog_item_id} className="flex items-center justify-between text-sm">
                          <span className="flex-1">{cItem?.name}</span>
                          <span className="w-24 text-center font-mono text-[#06CFD6]">S/ {cItem?.unit_price}</span>
                          <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={e => updateQuantity(item.catalog_item_id, parseInt(e.target.value) || 0)}
                            className="w-16 rounded bg-white/10 px-2 py-1 text-center outline-none"
                          />
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 border-t border-white/10 pt-3 text-right">
                    <span className="font-bold text-white/70">Total Estimado: </span>
                    <span className="text-xl font-bold text-[#06CFD6]">S/ {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-bold text-white/70">Observaciones Internas</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 outline-none focus:border-[#06CFD6] resize-none"
                />
              </div>

              <div className="mt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl border border-white/10 py-3 font-bold hover:bg-white/5">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#06CFD6] py-3 font-bold hover:bg-[#0CA3C6] disabled:opacity-50">
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

import React, { useEffect, useState } from 'react';
import { Calculator, Plus, RefreshCw, X } from 'lucide-react';
import AdminPanel from '../../components/admin/AdminPanel';
import DynamicQuoter from '../../components/admin/DynamicQuoter';
import { apiRequest } from '../../lib/api';
import type { PreparedQuotePayload, PricingCatalogItem } from '../../hooks/useQuoterState';

type Quote = {
  id: string;
  quote_code: string;
  total_amount: string;
  status: string;
  created_at: string;
  first_name: string;
  primary_email: string;
};

const AdminCotizador: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [catalog, setCatalog] = useState<PricingCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [quotesRes, catalogRes] = await Promise.all([
        apiRequest<{ items: Quote[] }>('/api/admin/quotations'),
        apiRequest<{ items: PricingCatalogItem[] }>('/api/admin/catalog/pricing'),
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

  const handleCreate = async (payload: PreparedQuotePayload) => {
    if (!payload.baseCatalogItemId || payload.items.length === 0) {
      setError('No se encontro el lienzo base de la cotizacion.');
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
          totalAmount: payload.developmentTotal,
          recurringMonthlyTotal: payload.recurringMonthlyTotal,
          recurringYearlyTotal: payload.recurringYearlyTotal,
          projectCategory: payload.projectCategory,
          legalNotes: payload.legalNotes,
          items: payload.items.map((item) => ({
            catalog_item_id: item.catalog_item_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            recurrence: item.recurrence,
            custom_name: item.name,
          })),
        },
      });
      setIsModalOpen(false);
      setFormData({ customerName: '', customerEmail: '', notes: '' });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar cotizacion');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (val: string) =>
    new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(val));

  return (
    <div className="flex flex-col gap-6 font-sansation">
      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Calculator className="h-6 w-6 text-white/50" />
          <div>
            <h1 className="text-2xl font-semibold tracking-wide text-white/90">Cotizador</h1>
            <p className="mt-1 text-xs uppercase tracking-widest text-white/40">Generacion dinamica de cotizaciones</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={loadData}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Cotizacion</span>
          </button>
        </div>
      </div>

      {error && !isModalOpen && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
      )}

      <AdminPanel className="flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-white/[0.02] text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-6 py-4 font-medium">Codigo</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Monto Total</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {quotes.map((quote) => (
                <tr key={quote.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-4 font-medium">{quote.quote_code}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{quote.first_name || 'Desconocido'}</p>
                    <p className="text-xs text-white/40">{quote.primary_email}</p>
                  </td>
                  <td className="px-6 py-4 font-mono">S/ {Number(quote.total_amount).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="rounded border border-white/5 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-white/60">
                      {quote.status || 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-white/40">{formatDate(quote.created_at)}</td>
                </tr>
              ))}
              {quotes.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-white/30">
                    No hay cotizaciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-7xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl custom-scrollbar md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-lg font-semibold text-white/90">Nueva Cotizacion</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <DynamicQuoter
              initialCatalog={catalog}
              customerName={formData.customerName}
              customerEmail={formData.customerEmail}
              notes={formData.notes}
              loading={loading}
              error={isModalOpen ? error : ''}
              onCustomerNameChange={(customerName) => setFormData({ ...formData, customerName })}
              onCustomerEmailChange={(customerEmail) => setFormData({ ...formData, customerEmail })}
              onNotesChange={(nextNotes) => setFormData({ ...formData, notes: nextNotes })}
              onCancel={() => setIsModalOpen(false)}
              onGenerate={handleCreate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCotizador;

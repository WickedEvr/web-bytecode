import React, { useEffect, useState } from 'react';
import { Calculator, Edit, MoreVertical, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import AdminPanel from '../../components/admin/AdminPanel';
import DynamicQuoter from '../../components/admin/DynamicQuoter';
import { apiRequest } from '../../lib/api';
import { useQuoterState, type EditableQuoteItemData, type PreparedQuotePayload, type PricingCatalogItem } from '../../hooks/useQuoterState';

type Quote = {
  id: string;
  quote_code: string;
  total_amount: string;
  status: string;
  created_at: string;
  first_name: string;
  primary_email: string;
};

type QuoteDetailResponse = {
  quote: Quote & {
    payment_policy?: string | null;
  };
  items: EditableQuoteItemData[];
};

type ActionMenuState = {
  quoteId: string;
  top: number;
  right: number;
};

const AdminCotizador: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [catalog, setCatalog] = useState<PricingCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionsMenu, setActionsMenu] = useState<ActionMenuState | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    notes: '',
  });
  const setCatalogInStore = useQuoterState((state) => state.setCatalog);
  const loadQuoteForEditing = useQuoterState((state) => state.loadQuoteForEditing);
  const resetQuoter = useQuoterState((state) => state.resetQuoter);
  const editingQuoteId = useQuoterState((state) => state.editingQuoteId);

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

  useEffect(() => {
    if (!actionsMenu) return;

    const closeActionsMenu = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('[data-quote-actions]')) return;
      setActionsMenu(null);
    };
    const closeActionsMenuOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActionsMenu(null);
    };
    const closeActionsMenuOnLayoutChange = () => setActionsMenu(null);

    document.addEventListener('click', closeActionsMenu);
    document.addEventListener('keydown', closeActionsMenuOnEscape);
    window.addEventListener('resize', closeActionsMenuOnLayoutChange);
    window.addEventListener('scroll', closeActionsMenuOnLayoutChange, true);
    return () => {
      document.removeEventListener('click', closeActionsMenu);
      document.removeEventListener('keydown', closeActionsMenuOnEscape);
      window.removeEventListener('resize', closeActionsMenuOnLayoutChange);
      window.removeEventListener('scroll', closeActionsMenuOnLayoutChange, true);
    };
  }, [actionsMenu]);

  const openNewQuote = () => {
    setCatalogInStore(catalog);
    resetQuoter();
    setFormData({ customerName: '', customerEmail: '', notes: '' });
    setError('');
    setIsModalOpen(true);
  };

  const handleEditQuote = async (quoteId: string) => {
    setActionsMenu(null);
    setLoading(true);
    setError('');
    try {
      setCatalogInStore(catalog);
      const detail = await apiRequest<QuoteDetailResponse>(`/api/admin/quotations/${quoteId}`);
      loadQuoteForEditing({ id: detail.quote.id }, detail.items);
      setFormData({
        customerName: detail.quote.first_name || '',
        customerEmail: detail.quote.primary_email || '',
        notes: detail.quote.payment_policy || '',
      });
      setIsModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cotizacion');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuote = async (quote: Quote) => {
    setActionsMenu(null);
    const confirmed = window.confirm(`¿Eliminar la cotizacion ${quote.quote_code}? Esta accion no se mostrara en el historial.`);
    if (!confirmed) return;

    setLoading(true);
    setError('');
    try {
      await apiRequest(`/api/admin/quotations/${quote.id}`, { method: 'DELETE' });
      if (editingQuoteId === quote.id) {
        resetQuoter();
        setIsModalOpen(false);
      }
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar cotizacion');
    } finally {
      setLoading(false);
    }
  };

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
          editingQuoteId: payload.editingQuoteId,
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
            quantity: item.pricing_model === 'per_unit' ? Math.max(1, item.billable_quantity) : item.quantity,
            unit_price: item.pricing_model === 'per_unit' && item.billable_quantity === 0 ? 0 : item.unit_price,
            recurrence: item.recurrence,
            custom_name: item.pricing_model === 'per_unit' && item.free_included_quantity > 0
              ? `${item.name} (${item.quantity} solicitados, ${item.free_included_quantity} incluidos)`
              : item.name,
          })),
        },
      });
      setIsModalOpen(false);
      setFormData({ customerName: '', customerEmail: '', notes: '' });
      resetQuoter();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar cotizacion');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (val: string) =>
    new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(val));

  const openActionsMenu = (quoteId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setActionsMenu((current) => current?.quoteId === quoteId
      ? null
      : {
        quoteId,
        top: rect.bottom + 6,
        right: Math.max(12, window.innerWidth - rect.right),
      });
  };

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
            onClick={openNewQuote}
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
          <table className="w-full min-w-[860px] table-fixed whitespace-nowrap text-left text-sm">
            <thead className="bg-white/[0.02] text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th className="w-[16%] px-6 py-4 font-medium">Codigo</th>
                <th className="w-[16%] px-6 py-4 font-medium">Cliente</th>
                <th className="w-[16%] px-6 py-4 text-right font-medium">Monto Total</th>
                <th className="w-[16%] px-6 py-4 text-center font-medium">Estado</th>
                <th className="w-[16%] px-6 py-4 text-center font-medium">Fecha</th>
                <th className="w-[20%] px-6 py-4 text-center font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {quotes.map((quote) => (
                <tr key={quote.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-4 font-medium">
                    <span className="block truncate">{quote.quote_code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="truncate font-medium">{quote.first_name || 'Desconocido'}</p>
                    <p className="truncate text-xs text-white/40">{quote.primary_email}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-mono">S/ {Number(quote.total_amount).toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="rounded border border-white/5 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-white/60">
                      {quote.status || 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-xs text-white/40">
                    <span className="block truncate">{formatDate(quote.created_at)}</span>
                  </td>
                  <td className="relative px-6 py-4 text-center" data-quote-actions>
                    <button
                      type="button"
                      onClick={(event) => openActionsMenu(quote.id, event)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/20"
                      aria-haspopup="menu"
                      aria-expanded={actionsMenu?.quoteId === quote.id}
                      aria-label={`Acciones para ${quote.quote_code}`}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    {false && (
                      <div
                        role="menu"
                        className="absolute right-6 top-12 z-10 w-48 overflow-hidden rounded-md border border-white/10 bg-[#0a0a0a] py-1 text-left shadow-xl"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => void handleEditQuote(quote.id)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                          Editar Cotización
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => void handleDeleteQuote(quote)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-white/5 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {quotes.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-white/30">
                    No hay cotizaciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      {actionsMenu && (
        <div
          role="menu"
          data-quote-actions
          className="fixed z-[100] w-48 overflow-hidden rounded-md border border-white/10 bg-[#0a0a0a] py-1 text-left shadow-xl"
          style={{ top: actionsMenu.top, right: actionsMenu.right }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => void handleEditQuote(actionsMenu.quoteId)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Edit className="h-4 w-4" />
            Editar Cotización
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              const quote = quotes.find((item) => item.id === actionsMenu.quoteId);
              if (quote) void handleDeleteQuote(quote);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-white/5 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-7xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl custom-scrollbar md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-lg font-semibold text-white/90">{editingQuoteId ? 'Editar Cotizacion' : 'Nueva Cotizacion'}</h2>
              <button
                type="button"
                onClick={() => {
                  resetQuoter();
                  setIsModalOpen(false);
                }}
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
              onCancel={() => {
                resetQuoter();
                setIsModalOpen(false);
              }}
              onGenerate={handleCreate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCotizador;

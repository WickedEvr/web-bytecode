import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import { DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import {
  Boxes,
  BriefcaseBusiness,
  CalendarClock,
  Calculator,
  Check,
  CreditCard,
  FileStack,
  GripVertical,
  LayoutTemplate,
  PackagePlus,
  Plus,
  Puzzle,
  Save,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { computeQuoteTotals, formatPen, quoteLegalNotes, useQuoterState, type NormalizedPricingCatalogItem, type PreparedQuotePayload, type PricingCatalogItem } from '../../hooks/useQuoterState';

type DynamicQuoterProps = {
  initialCatalog: PricingCatalogItem[];
  customerName: string;
  customerEmail: string;
  notes: string;
  loading?: boolean;
  error?: string;
  onCustomerNameChange: (value: string) => void;
  onCustomerEmailChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onCancel: () => void;
  onGenerate: (payload: PreparedQuotePayload) => void | Promise<void>;
};

const itemTypeLabels: Record<string, string> = {
  category_trigger: 'Triggers de Categoria',
  addon: 'Add-ons',
  recurring: 'Recurrentes',
};

const iconMap: Record<string, LucideIcon> = {
  boxes: Boxes,
  briefcase: BriefcaseBusiness,
  calendar: CalendarClock,
  calculator: Calculator,
  credit_card: CreditCard,
  file_stack: FileStack,
  layout: LayoutTemplate,
  package: PackagePlus,
  puzzle: Puzzle,
  shield: ShieldCheck,
  shopping_cart: ShoppingCart,
};

const priceText = (item: PricingCatalogItem) => {
  const base = formatPen(Number(item.base_price));
  if (item.max_price) return `${base} - ${formatPen(Number(item.max_price))}`;
  return base;
};

const resolveIcon = (item: PricingCatalogItem) => {
  const normalized = item.icon_name?.trim().toLowerCase().replace(/[-\s]+/g, '_') ?? '';
  return iconMap[normalized] ?? (
    item.item_type === 'category_trigger' ? BriefcaseBusiness :
    item.item_type === 'recurring' ? CalendarClock :
    PackagePlus
  );
};

const DraggableCatalogCard = ({ item }: { item: NormalizedPricingCatalogItem }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  });
  const Icon = resolveIcon(item);
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      className={`group flex w-full items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-left transition-colors hover:border-[#06CFD6]/60 hover:bg-[#06CFD6]/[0.06] ${isDragging ? 'opacity-50' : ''}`}
      {...listeners}
      {...attributes}
    >
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-[#06CFD6]">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-white/90">{item.name}</span>
        {item.description && <span className="mt-1 line-clamp-2 block text-xs leading-5 text-white/45">{item.description}</span>}
        <span className="mt-3 block font-mono text-xs text-white/70">{priceText(item)}</span>
      </span>
      <GripVertical className="mt-2 h-4 w-4 shrink-0 text-white/25 transition-colors group-hover:text-white/60" />
    </button>
  );
};

const Dropzone = ({ children }: { children: React.ReactNode }) => {
  const { isOver, setNodeRef } = useDroppable({ id: 'quote-dropzone' });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[420px] rounded-xl border p-5 transition-colors ${isOver ? 'border-[#06CFD6] bg-[#06CFD6]/[0.06]' : 'border-white/10 bg-white/[0.025]'}`}
    >
      {children}
    </div>
  );
};

const DynamicQuoter = ({
  initialCatalog,
  customerName,
  customerEmail,
  notes,
  loading = false,
  error = '',
  onCustomerNameChange,
  onCustomerEmailChange,
  onNotesChange,
  onCancel,
  onGenerate,
}: DynamicQuoterProps) => {
  const [activeItem, setActiveItem] = useState<NormalizedPricingCatalogItem | null>(null);
  const setCatalog = useQuoterState((state) => state.setCatalog);
  const addItem = useQuoterState((state) => state.addItem);
  const removeItem = useQuoterState((state) => state.removeItem);
  const updateQuantity = useQuoterState((state) => state.updateQuantity);
  const resetQuote = useQuoterState((state) => state.resetQuote);
  const storeCatalog = useQuoterState((state) => state.catalog);
  const cart = useQuoterState((state) => state.cart);
  const buildPayload = useQuoterState((state) => state.buildPayload);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const totals = useMemo(() => computeQuoteTotals(storeCatalog, cart), [storeCatalog, cart]);

  useEffect(() => {
    setCatalog(initialCatalog);
  }, [initialCatalog, setCatalog]);

  const groupedCatalog = useMemo(() => {
    const draggableItems = storeCatalog.filter((item) => item.is_draggable && item.item_type !== 'base_canvas');
    return draggableItems.reduce<Record<string, NormalizedPricingCatalogItem[]>>((groups, item) => {
      const key = item.item_type;
      groups[key] = [...(groups[key] ?? []), item];
      return groups;
    }, {});
  }, [storeCatalog]);

  const handleDragStart = (event: DragStartEvent) => {
    const item = storeCatalog.find((entry) => entry.id === event.active.id);
    setActiveItem(item ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over?.id === 'quote-dropzone') {
      addItem(String(event.active.id));
    }
    setActiveItem(null);
  };

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    await onGenerate(buildPayload());
  };

  return (
    <form onSubmit={handleGenerate} className="flex flex-col gap-6">
      {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-white/55">Nombre del Cliente</span>
          <input
            type="text"
            required
            value={customerName}
            onChange={(event) => onCustomerNameChange(event.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 outline-none transition-colors focus:border-[#06CFD6]/70"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-white/55">Correo Electronico</span>
          <input
            type="email"
            required
            value={customerEmail}
            onChange={(event) => onCustomerEmailChange(event.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 outline-none transition-colors focus:border-[#06CFD6]/70"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-white/55">Observaciones Internas</span>
          <input
            type="text"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 outline-none transition-colors focus:border-[#06CFD6]/70"
          />
        </label>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveItem(null)}>
        <div className="grid gap-6 xl:grid-cols-[minmax(300px,0.92fr)_minmax(420px,1.08fr)]">
          <section className="rounded-xl border border-white/10 bg-black/20 p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white/90">Catalogo</h3>
                <p className="mt-1 text-xs text-white/40">Arrastra servicios hacia la proforma.</p>
              </div>
              <button
                type="button"
                onClick={resetQuote}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              >
                Limpiar
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {Object.entries(itemTypeLabels).map(([type, label]) => {
                const items = groupedCatalog[type] ?? [];
                if (items.length === 0) return null;

                return (
                  <div key={type}>
                    <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{label}</h4>
                    <div className="flex flex-col gap-3">
                      {items.map((item) => <DraggableCatalogCard key={item.id} item={item} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <Dropzone>
            <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white/90">{totals.title}</h3>
                <p className="mt-1 text-xs text-white/45">Base activa: {totals.activeBaseSource?.name ?? 'Sin lienzo base'}</p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#06CFD6]/30 bg-[#06CFD6]/10 px-3 py-2 text-xs font-medium text-[#9ff8ff]">
                <Check className="h-4 w-4" />
                Proforma lista
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {totals.baseItem && (
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white/90">{totals.activeBaseSource?.name ?? totals.baseItem.name}</p>
                      <p className="mt-1 text-xs text-white/40">Estructura base aplicada automaticamente.</p>
                    </div>
                    <p className="font-mono text-sm text-white/80">{formatPen(Number(totals.activeBaseSource?.base_price ?? totals.baseItem.base_price))}</p>
                  </div>
                </div>
              )}

              {totals.visibleLines.length === 0 && (
                <div className="flex min-h-[160px] flex-col items-center justify-center rounded-lg border border-dashed border-white/15 text-center">
                  <Plus className="mb-3 h-6 w-6 text-white/25" />
                  <p className="text-sm text-white/50">Suelta aqui triggers, add-ons o recurrentes.</p>
                </div>
              )}

              {totals.visibleLines.map(({ item, quantity, subtotal, isActiveBaseTrigger }) => {
                const canEditQuantity = item.pricing_model === 'per_unit';
                const inactiveTrigger = item.item_type === 'category_trigger' && !isActiveBaseTrigger;

                return (
                  <div key={item.id} className={`rounded-lg border p-4 ${inactiveTrigger ? 'border-white/5 bg-white/[0.015] opacity-65' : 'border-white/10 bg-black/20'}`}>
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_110px_120px_44px] md:items-center">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white/90">{item.name}</p>
                        <p className="mt-1 text-xs text-white/40">
                          {item.item_type === 'category_trigger'
                            ? (isActiveBaseTrigger ? 'Sobreescribe el lienzo base.' : 'Trigger no sumado: existe uno de mayor precio.')
                            : item.pricing_model}
                        </p>
                      </div>
                      <div>
                        {canEditQuantity ? (
                          <input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                            className="h-10 w-24 rounded-lg border border-white/10 bg-white/5 px-3 text-center text-sm text-white/90 outline-none focus:border-[#06CFD6]/70"
                          />
                        ) : (
                          <span className="inline-flex h-10 w-24 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm text-white/60">x1</span>
                        )}
                      </div>
                      <div className="font-mono text-sm text-white/75">
                        <span className="block text-xs text-white/35">Unitario</span>
                        {formatPen(Number(item.base_price))}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white/45 transition-colors hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200"
                        aria-label={`Eliminar ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex justify-end border-t border-white/5 pt-3 font-mono text-sm text-white/80">
                      Subtotal: {formatPen(subtotal)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-wider text-white/40">Costo de Desarrollo</p>
                <p className="mt-2 font-mono text-lg text-white">{formatPen(totals.developmentTotal)}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-wider text-white/40">Mensual Recurrente</p>
                <p className="mt-2 font-mono text-lg text-white">{formatPen(totals.recurringMonthlyTotal)}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-wider text-white/40">Anual Recurrente</p>
                <p className="mt-2 font-mono text-lg text-white">{formatPen(totals.recurringYearlyTotal)}</p>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100/85">
              {quoteLegalNotes.map((note) => <p key={note}>* {note}</p>)}
            </div>
          </Dropzone>
        </div>

        <DragOverlay>
          {activeItem ? (
            <div className="w-80 rounded-lg border border-[#06CFD6]/60 bg-[#061114] p-4 shadow-2xl">
              <p className="text-sm font-medium text-white">{activeItem.name}</p>
              <p className="mt-2 font-mono text-xs text-white/70">{priceText(activeItem)}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <X className="h-4 w-4" />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !totals.activeBaseSource}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Generando...' : 'Generar Cotizacion'}
        </button>
      </div>
    </form>
  );
};

export default DynamicQuoter;

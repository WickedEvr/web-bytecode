import { create } from 'zustand';

export type PricingModel = 'fixed' | 'range' | 'per_unit' | 'monthly_recurring' | 'yearly_recurring';
export type PricingItemType = 'base_canvas' | 'category_trigger' | 'addon' | 'recurring';

export type PricingCatalogItem = {
  id: string;
  item_code?: string;
  name: string;
  description?: string | null;
  pricing_model: PricingModel;
  base_price: number | string;
  max_price?: number | string | null;
  currency_code?: string;
  item_type?: PricingItemType | null;
  upgrades_to_category?: string | null;
  is_draggable?: boolean | null;
  icon_name?: string | null;
};

export type NormalizedPricingCatalogItem = PricingCatalogItem & {
  item_type: PricingItemType;
  is_draggable: boolean;
};

export type QuoteCartLine = {
  catalogItemId: string;
  quantity: number;
};

export type QuotePreparedItem = {
  catalog_item_id: string;
  name: string;
  item_type: PricingItemType;
  pricing_model: PricingModel;
  quantity: number;
  unit_price: number;
  subtotal: number;
  recurrence: 'none' | 'monthly' | 'yearly';
};

export type PreparedQuotePayload = {
  title: string;
  projectCategory: string;
  baseCatalogItemId: string;
  developmentTotal: number;
  recurringMonthlyTotal: number;
  recurringYearlyTotal: number;
  grandTotalSnapshot: number;
  items: QuotePreparedItem[];
  cartItems: QuotePreparedItem[];
  legalNotes: string[];
};

type QuoteTotals = {
  title: string;
  projectCategory: string;
  baseItem: NormalizedPricingCatalogItem | null;
  activeBaseSource: NormalizedPricingCatalogItem | null;
  visibleLines: Array<QuoteCartLine & { item: NormalizedPricingCatalogItem; subtotal: number; isActiveBaseTrigger: boolean }>;
  persistedItems: QuotePreparedItem[];
  cartItems: QuotePreparedItem[];
  developmentTotal: number;
  recurringMonthlyTotal: number;
  recurringYearlyTotal: number;
};

type QuoterState = {
  catalog: NormalizedPricingCatalogItem[];
  cart: QuoteCartLine[];
  setCatalog: (catalog: PricingCatalogItem[]) => void;
  addItem: (catalogItemId: string) => void;
  removeItem: (catalogItemId: string) => void;
  updateQuantity: (catalogItemId: string, quantity: number) => void;
  resetQuote: () => void;
  totals: () => QuoteTotals;
  buildPayload: () => PreparedQuotePayload;
};

const DEFAULT_PROJECT_CATEGORY = 'Landing Page';
const LEGAL_NOTES = [
  'El Hosting, Dominio y certificado SSL estan incluidos sin costo por el primer ano.',
  'Nota Legal: Retrasos mayores a 60 dias por parte del cliente tendran un recargo del 20%. Cancelaciones en cualquier fase requieren un abono del 30% por tiempo invertido.',
];

const moneyValue = (value: number | string | null | undefined) => Number(value ?? 0);

const triggerCategoryByCode: Record<string, string> = {
  ecommerce: 'Tienda Online (E-commerce)',
  web_corporate: 'Web Corporativa',
  chatbot_basic: 'Automatizacion con Chatbot',
};

const inferItemType = (item: PricingCatalogItem): PricingItemType => {
  if (item.item_type) return item.item_type;
  if (item.item_code === 'landing_page') return 'base_canvas';
  if (item.item_code && Object.hasOwn(triggerCategoryByCode, item.item_code)) return 'category_trigger';
  if (item.pricing_model === 'monthly_recurring' || item.pricing_model === 'yearly_recurring') return 'recurring';
  return 'addon';
};

export const normalizePricingCatalog = (catalog: PricingCatalogItem[]): NormalizedPricingCatalogItem[] =>
  catalog.map((item) => {
    const itemType = inferItemType(item);
    return {
      ...item,
      item_type: itemType,
      upgrades_to_category: item.upgrades_to_category ?? (item.item_code ? triggerCategoryByCode[item.item_code] : null),
      is_draggable: item.is_draggable ?? itemType !== 'base_canvas',
    };
  });

const isRecurring = (item: NormalizedPricingCatalogItem) =>
  item.item_type === 'recurring' ||
  item.pricing_model === 'monthly_recurring' ||
  item.pricing_model === 'yearly_recurring';

const recurrenceFor = (item: NormalizedPricingCatalogItem): 'none' | 'monthly' | 'yearly' => {
  if (item.pricing_model === 'monthly_recurring') return 'monthly';
  if (item.pricing_model === 'yearly_recurring') return 'yearly';
  return item.item_type === 'recurring' ? 'monthly' : 'none';
};

const lineQuantity = (item: NormalizedPricingCatalogItem, quantity: number) =>
  item.pricing_model === 'per_unit' ? Math.max(1, quantity) : 1;

const preparedItem = (item: NormalizedPricingCatalogItem, quantity: number, unitPrice = moneyValue(item.base_price)): QuotePreparedItem => {
  const normalizedQuantity = lineQuantity(item, quantity);
  return {
    catalog_item_id: item.id,
    name: item.name,
    item_type: item.item_type,
    pricing_model: item.pricing_model,
    quantity: normalizedQuantity,
    unit_price: unitPrice,
    subtotal: unitPrice * normalizedQuantity,
    recurrence: recurrenceFor(item),
  };
};

export const computeQuoteTotals = (catalog: NormalizedPricingCatalogItem[], cart: QuoteCartLine[]): QuoteTotals => {
  const baseItem = catalog.find((item) => item.item_type === 'base_canvas') ?? null;
  const cartWithItems = cart
    .map((line) => ({ line, item: catalog.find((entry) => entry.id === line.catalogItemId) }))
    .filter((entry): entry is { line: QuoteCartLine; item: NormalizedPricingCatalogItem } => Boolean(entry.item));

  const triggerLines = cartWithItems.filter(({ item }) => item.item_type === 'category_trigger');
  const activeTrigger = triggerLines.reduce<NormalizedPricingCatalogItem | null>((current, { item }) => {
    if (!current) return item;
    return moneyValue(item.base_price) > moneyValue(current.base_price) ? item : current;
  }, null);

  const activeBaseSource = activeTrigger ?? baseItem;
  const baseAmount = activeBaseSource ? moneyValue(activeBaseSource.base_price) : 0;
  const projectCategory = activeTrigger?.upgrades_to_category || activeTrigger?.name || baseItem?.upgrades_to_category || DEFAULT_PROJECT_CATEGORY;

  const visibleLines = cartWithItems.map(({ line, item }) => {
    const quantity = lineQuantity(item, line.quantity);
    const isActiveBaseTrigger = activeTrigger?.id === item.id;
    const subtotal = item.item_type === 'category_trigger'
      ? (isActiveBaseTrigger ? moneyValue(item.base_price) : 0)
      : moneyValue(item.base_price) * quantity;

    return { ...line, quantity, item, subtotal, isActiveBaseTrigger };
  });

  const additiveItems = visibleLines.filter(({ item }) => item.item_type === 'addon' && !isRecurring(item));
  const recurringItems = visibleLines.filter(({ item }) => isRecurring(item));

  const developmentAddonsTotal = additiveItems.reduce((sum, line) => sum + line.subtotal, 0);
  const recurringMonthlyTotal = recurringItems
    .filter(({ item }) => recurrenceFor(item) === 'monthly')
    .reduce((sum, line) => sum + line.subtotal, 0);
  const recurringYearlyTotal = recurringItems
    .filter(({ item }) => recurrenceFor(item) === 'yearly')
    .reduce((sum, line) => sum + line.subtotal, 0);

  const basePrepared = activeBaseSource ? [preparedItem(activeBaseSource, 1, baseAmount)] : [];
  const additivePrepared = [...additiveItems, ...recurringItems].map(({ item, quantity }) => preparedItem(item, quantity));
  const cartItems = visibleLines.map(({ item, quantity, subtotal }) => ({
    ...preparedItem(item, quantity),
    subtotal,
  }));

  return {
    title: `Cotizacion de Proyecto: ${projectCategory}`,
    projectCategory,
    baseItem,
    activeBaseSource,
    visibleLines,
    persistedItems: [...basePrepared, ...additivePrepared],
    cartItems,
    developmentTotal: baseAmount + developmentAddonsTotal,
    recurringMonthlyTotal,
    recurringYearlyTotal,
  };
};

export const useQuoterState = create<QuoterState>((set, get) => ({
  catalog: [],
  cart: [],
  setCatalog: (catalog) => set({ catalog: normalizePricingCatalog(catalog) }),
  addItem: (catalogItemId) => set((state) => {
    const catalogItem = state.catalog.find((item) => item.id === catalogItemId);
    if (!catalogItem || !catalogItem.is_draggable || catalogItem.item_type === 'base_canvas') return state;

    const existing = state.cart.find((line) => line.catalogItemId === catalogItemId);
    if (existing) {
      if (catalogItem.pricing_model !== 'per_unit') return state;
      return {
        cart: state.cart.map((line) =>
          line.catalogItemId === catalogItemId ? { ...line, quantity: line.quantity + 1 } : line,
        ),
      };
    }

    return { cart: [...state.cart, { catalogItemId, quantity: 1 }] };
  }),
  removeItem: (catalogItemId) => set((state) => ({
    cart: state.cart.filter((line) => line.catalogItemId !== catalogItemId),
  })),
  updateQuantity: (catalogItemId, quantity) => set((state) => {
    const catalogItem = state.catalog.find((item) => item.id === catalogItemId);
    if (!catalogItem) return state;
    const normalizedQuantity = Math.max(1, Math.floor(quantity || 1));

    return {
      cart: state.cart.map((line) =>
        line.catalogItemId === catalogItemId
          ? { ...line, quantity: catalogItem.pricing_model === 'per_unit' ? normalizedQuantity : 1 }
          : line,
      ),
    };
  }),
  resetQuote: () => set({ cart: [] }),
  totals: () => computeQuoteTotals(get().catalog, get().cart),
  buildPayload: () => {
    const totals = computeQuoteTotals(get().catalog, get().cart);
    return {
      title: totals.title,
      projectCategory: totals.projectCategory,
      baseCatalogItemId: totals.activeBaseSource?.id ?? '',
      developmentTotal: totals.developmentTotal,
      recurringMonthlyTotal: totals.recurringMonthlyTotal,
      recurringYearlyTotal: totals.recurringYearlyTotal,
      grandTotalSnapshot: totals.developmentTotal + totals.recurringMonthlyTotal + totals.recurringYearlyTotal,
      items: totals.persistedItems,
      cartItems: totals.cartItems,
      legalNotes: LEGAL_NOTES,
    };
  },
}));

export const quoteLegalNotes = LEGAL_NOTES;
export const formatPen = (value: number) => `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

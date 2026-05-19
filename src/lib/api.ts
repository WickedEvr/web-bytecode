const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

interface RequestOptions extends RequestInit {
  json?: unknown;
}

const buildUrl = (path: string) => `${API_BASE_URL}${path}`;

let cachedCsrfToken: string | null = null;

export const initCsrf = async (): Promise<string | null> => {
  if (cachedCsrfToken) return cachedCsrfToken;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/csrf`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      cachedCsrfToken = data.csrfToken;
      return cachedCsrfToken;
    }
  } catch (error) {
    console.error('CSRF Handshake failed', error);
  }
  return null;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  let body = options.body;
  const method = (options.method ?? 'GET').toUpperCase();

  headers.set('Accept', 'application/json');

  if (options.json !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.json);
  }

  const isMutation = method !== 'GET';
  if (isMutation && !headers.has('x-csrf-token')) {
    const csrfToken = await initCsrf();
    if (csrfToken) {
      headers.set('x-csrf-token', csrfToken);
    }
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    credentials: 'include',
    headers,
    body,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message ?? 'No se pudo completar la solicitud.');
  }

  return response.json() as Promise<T>;
}

export const apiUrl = buildUrl;

export const createContactSubmission = (payload: Record<string, string>) =>
  apiRequest<{ id: string; createdAt: string }>('/api/contact-submissions', {
    method: 'POST',
    json: payload,
  });

export const createComplaint = (payload: FormData) =>
  apiRequest<{ id: string; code: string; createdAt: string }>('/api/complaints', {
    method: 'POST',
    body: payload,
  });

export const warmupBackend = async () => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    await fetch(buildUrl('/api/warmup'), {
      method: 'GET',
      credentials: 'omit',
      cache: 'no-store',
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
};

// --- Interfaces para tipar las respuestas del backend ---
export interface CountryData {
  id: string;
  iso: string;
  name: string;
  dialCode: string;
  maxLength: number;
  is_active?: boolean;
  tax_id_label: string;
  tax_id_regex: string;
  tax_id_placeholder: string;
}

export interface ServiceData {
  id: string;
  code: string;
  name: string;
}

export interface DocumentTypeData {
  id: string;
  code: string;
  name: string;
  countryId: string | null;
  validationRegex: string | null;
  minLength: number | null;
  maxLength: number | null;
  isCompanyDocument: boolean;
  placeholder: string | null;
}

// --- Nuevas peticiones GET usando tu wrapper apiRequest ---
export const fetchCountries = async () => {
  const response = await apiRequest<{ items: CountryData[] }>('/api/catalog/countries', {
    method: 'GET',
  });
  return response.items;
};

export const fetchServices = async () => {
  const response = await apiRequest<{ items: ServiceData[] }>('/api/catalog/services', {
    method: 'GET',
  });
  return response.items;
};

export const fetchDocumentTypes = async () => {
  const response = await apiRequest<any>('/api/catalog/document-types', {
    method: 'GET',
  });
  const responseData = response.items || response; // Handle wrapper safely
  return responseData.map((item: any) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    countryId: item.country_id,
    validationRegex: item.validation_regex,
    minLength: item.min_length,
    maxLength: item.max_length,
    isCompanyDocument: item.is_company_document,
    placeholder: item.placeholder,
  })) as DocumentTypeData[];
};

export interface PortfolioProjectData {
  id: string;
  name: string;
  clientName?: string | null;
  description?: string | null;
  url?: string | null;
  img?: string | null;
  tags: string[];
}

export interface PortfolioTechnologyData {
  id: string;
  code: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface AdminPortfolioItemData {
  id: string;
  item_code: string;
  name: string;
  client_name: string | null;
  description: string | null;
  website_url: string | null;
  sort_order: number;
  is_featured: boolean;
  is_published: boolean;
  published_at: string | null;
  image_url: string | null;
  alt_text: string | null;
  technologies: Array<{ id: string; name: string }>;
  created_at: string;
  updated_at: string;
}

export const fetchPortfolio = async () => {
  const response = await apiRequest<{ items: PortfolioProjectData[] }>('/api/portfolio', {
    method: 'GET',
  });
  return response.items;
};

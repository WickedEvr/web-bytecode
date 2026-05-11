const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

interface RequestOptions extends RequestInit {
  json?: unknown;
}

const buildUrl = (path: string) => `${API_BASE_URL}${path}`;
const csrfCookieName = 'bc_csrf';

const getCookie = (name: string) => {
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  const encodedName = `${encodeURIComponent(name)}=`;
  const cookie = cookies.find((item) => item.startsWith(encodedName));

  if (!cookie) return '';

  return decodeURIComponent(cookie.slice(encodedName.length));
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

  if (method !== 'GET' && !headers.has('x-csrf-token')) {
    const csrfToken = getCookie(csrfCookieName);
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

// --- Interfaces para tipar las respuestas del backend ---
export interface CountryData {
  id: string;
  iso: string;
  name: string;
  dialCode: string;
  maxLength: number;
  is_active?: boolean;
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
  const response = await apiRequest<{ items: DocumentTypeData[] }>('/api/catalog/document-types', {
    method: 'GET',
  });
  return response.items;
};
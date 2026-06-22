const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

interface RequestOptions extends RequestInit {
  json?: unknown;
}

const buildUrl = (path: string) => `${API_BASE_URL}${path}`;

let cachedCsrfToken: string | null = null;

export const resetCsrfToken = () => {
  cachedCsrfToken = null;
};

export const initCsrf = async (force = false): Promise<string | null> => {
  if (cachedCsrfToken && !force) return cachedCsrfToken;
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

export class ApiError extends Error {
  code?: string;
  payload?: any;
  constructor(message: string, code?: string, payload?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.payload = payload;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return apiRequestInternal<T>(path, options, true);
}

async function apiRequestInternal<T>(path: string, options: RequestOptions = {}, retryOnCsrf = true): Promise<T> {
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
    const message = payload?.message ?? '';
    const isCsrfError = response.status === 403 && typeof message === 'string' && message.toLowerCase().includes('csrf');

    if (isMutation && retryOnCsrf && isCsrfError) {
      resetCsrfToken();
      const csrfToken = await initCsrf(true);
      if (csrfToken) {
        const retryHeaders = new Headers(options.headers);
        retryHeaders.set('Accept', 'application/json');
        retryHeaders.set('x-csrf-token', csrfToken);
        if (options.json !== undefined) {
          retryHeaders.set('Content-Type', 'application/json');
        }

        return apiRequestInternal<T>(path, { ...options, headers: retryHeaders }, false);
      }
    }

    throw new ApiError(payload?.message ?? 'No se pudo completar la solicitud.', payload?.code, payload);
  }

  const result = await response.json() as T;

  if (path === '/api/auth/login' || path === '/api/auth/logout') {
    resetCsrfToken();
  }

  return result;
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
  status: string;
  status_name?: string;
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

export interface Project {
  id: string;
  project_code: string;
  customer_id: string;
  organization_id: string | null;
  quote_id: string | null;
  service_id: string;
  name: string;
  description: string | null;
  github_repo: string | null;
  github_branch: string | null;
  staging_url: string | null;
  production_url: string | null;
  start_date: string;
  estimated_end_date: string;
  actual_end_date: string | null;
  total_budget: string;
  currency_code: string;
  status: string;
  status_name?: string;
  customer_name: string | null;
  customer_email: string | null;
  service_name: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  due_date: string;
  payment_percentage: string;
  completed_at: string | null;
  status: string;
  status_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCommit {
  id: string;
  project_id: string | null;
  commit_hash: string;
  message: string;
  author_name: string | null;
  author_email: string | null;
  branch: string | null;
  github_url: string | null;
  committed_at: string | null;
  created_at: string | null;
}

export interface ProjectAssignment {
  project_id: string;
  user_id: string;
  role: string | null;
  assigned_at: string | null;
  name: string;
  email: string;
}

export interface ProjectAssignmentOption {
  id: string;
  name: string;
  email: string;
}

export interface ProjectInput {
  customerId: string;
  serviceId: string;
  quoteId?: string | null;
  name: string;
  description?: string;
  status: string;
  githubRepo?: string;
  githubBranch?: string;
  stagingUrl?: string;
  productionUrl?: string;
  startDate: string;
  estimatedEndDate: string;
  totalBudget: number;
  currencyCode: string;
}

export type ProjectUpdateInput = {
  name?: string;
  description?: string | null;
  status?: string;
  githubRepo?: string | null;
  githubBranch?: string | null;
  stagingUrl?: string | null;
  productionUrl?: string | null;
  quoteId?: string | null;
  totalBudget?: number;
};

export interface ProjectQuoteItem {
  id: string;
  catalog_item_id: string;
  item_code: string;
  name: string;
  custom_name: string | null;
  quantity: number;
  unit_price: string | number;
  subtotal: string | number;
  recurrence: 'none' | 'monthly' | 'yearly';
}

export interface ProjectQuoteOption {
  id: string;
  quote_code: string;
  total_amount: string;
  currency_code: string;
  valid_until: string;
  payment_policy: string | null;
  status: string;
  status_name: string;
  created_at: string;
  first_name: string;
  last_name: string | null;
  primary_email: string;
  items: ProjectQuoteItem[];
}

export const fetchProjects = (page = 1, limit = 9) =>
  apiRequest<{ data: Project[]; total: number }>(`/api/admin/projects?limit=${limit}&offset=${(page - 1) * limit}`);

export const fetchProject = (id: string) =>
  apiRequest<{ item: Project }>(`/api/admin/projects/${id}`).then((response) => response.item);

export const createProject = (input: ProjectInput) =>
  apiRequest<{ item: Project }>('/api/admin/projects', { method: 'POST', json: input }).then((response) => response.item);

export const updateProject = (id: string, input: ProjectUpdateInput) =>
  apiRequest<{ item: Project }>(`/api/admin/projects/${id}`, { method: 'PATCH', json: input }).then((response) => response.item);

export const deleteProject = (id: string) =>
  apiRequest<{ ok: true }>(`/api/admin/projects/${id}`, { method: 'DELETE' });

export const fetchProjectQuotesByEmail = (email: string) =>
  apiRequest<{ data: ProjectQuoteOption[]; total: number }>(`/api/admin/quotes?email=${encodeURIComponent(email)}`)
    .then((response) => response.data);

export const fetchProjectMilestones = (projectId: string) =>
  apiRequest<{ items: ProjectMilestone[] }>(`/api/admin/projects/${projectId}/milestones`).then((response) => response.items);

export const updateProjectMilestone = (projectId: string, milestoneId: string, status: string) =>
  apiRequest(`/api/admin/projects/${projectId}/milestones/${milestoneId}`, { method: 'PATCH', json: { status } });

export const fetchProjectCommits = (projectId: string) =>
  apiRequest<{ items: ProjectCommit[] }>(`/api/admin/projects/${projectId}/commits`).then((response) => response.items);

export const fetchProjectAssignments = (projectId: string) =>
  apiRequest<{ items: ProjectAssignment[] }>(`/api/admin/projects/${projectId}/assignments`).then((response) => response.items);

export const fetchProjectAssignmentOptions = () =>
  apiRequest<{ items: ProjectAssignmentOption[] }>('/api/admin/projects/assignment-options').then((response) => response.items);

export const assignProjectUser = (projectId: string, userId: string, role?: string) =>
  apiRequest(`/api/admin/projects/${projectId}/assignments`, { method: 'POST', json: { userId, role } });

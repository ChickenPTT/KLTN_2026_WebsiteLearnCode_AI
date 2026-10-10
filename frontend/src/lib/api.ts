/**
 * Client goi backend Spring Boot.
 * - Access token chi giu trong bo nho (khong localStorage/sessionStorage) -> XSS khong doc lai duoc sau reload.
 * - Refresh token nam trong cookie httpOnly do backend set (Path=/api/auth), JS khong dong toi.
 * - apiFetch tu dong goi /api/auth/refresh 1 lan khi gap 401 roi thu lai request.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export type BackendRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface BackendUser {
  id: number;
  email: string;
  fullName: string;
  role: BackendRole;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: BackendUser;
}

/** Loi tu backend (co status + message tieng Viet tu ApiExceptionHandler). */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Khong ket noi duoc backend (chua chay / Vite proxy bao loi) -> useAuth fallback sang mock. */
export class BackendUnavailableError extends Error {
  constructor() {
    super('Không kết nối được máy chủ.');
    this.name = 'BackendUnavailableError';
  }
}

let accessToken: string | null = null;
let onSessionExpired: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

/** useAuth dang ky de biet khi refresh that bai giua chung (vd. dang lam bai thi het phien). */
export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

async function rawFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers, credentials: 'include' });
  } catch {
    throw new BackendUnavailableError();
  }
  // Vite proxy tra 500 text/plain (hoac 502/503/504) khi backend tat -> coi nhu khong ket noi duoc
  const isJson = res.headers.get('content-type')?.includes('application/json') ?? false;
  if (res.status >= 502 || (res.status === 500 && !isJson)) {
    throw new BackendUnavailableError();
  }
  return res;
}

async function toError(res: Response): Promise<ApiError> {
  let message = `Lỗi máy chủ (${res.status}).`;
  try {
    const body = await res.json();
    if (body && typeof body.message === 'string') message = body.message;
  } catch {
    // body rong hoac khong phai JSON
  }
  return new ApiError(res.status, message);
}

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) throw await toError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// Dung chung 1 promise: StrictMode/nhieu request 401 cung luc chi goi /refresh dung 1 lan.
// Neu goi 2 lan song song voi cung cookie, lan 2 bi backend coi la dung lai token -> thu hoi ca phien.
let refreshInFlight: Promise<AuthResponse | null> | null = null;

/** Lay access token moi tu cookie refresh. Tra null neu khong co phien hop le. */
export function refreshSession(): Promise<AuthResponse | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const res = await rawFetch('/api/auth/refresh', { method: 'POST' });
      if (res.status === 401) {
        setAccessToken(null);
        return null;
      }
      const data = await parse<AuthResponse>(res);
      setAccessToken(data.accessToken);
      return data;
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

// 401 o cac endpoint nay la sai mat khau / het phien that, khong phai access token het han
const NO_RETRY_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/logout'];

/** fetch toi backend kem Bearer token; 401 -> refresh 1 lan roi thu lai. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res = await rawFetch(path, init);
  if (res.status === 401 && !NO_RETRY_PATHS.includes(path)) {
    const refreshed = await refreshSession();
    if (!refreshed) {
      onSessionExpired?.();
      throw await toError(res);
    }
    res = await rawFetch(path, init);
  }
  return parse<T>(res);
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (fullName: string, email: string, password: string) =>
    apiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    }),
  logout: () => apiFetch<void>('/api/auth/logout', { method: 'POST' }),
  completeOnboarding: () => apiFetch<BackendUser>('/api/auth/me/onboarding', { method: 'POST' }),
};

export interface DailySubmission {
  day: string;
  count: number;
}

export interface TopicStats {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface LevelStats {
  level: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AuditLog {
  id: number;
  action: string;
  user: string;
  target: string;
  time: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalTemplates: number;
  submissionsToday: number;
  aiAccuracy: number;
  weeklySubmissions: DailySubmission[];
  topTopics: TopicStats[];
  levelDistribution: LevelStats[];
  auditLogs: AuditLog[];
}

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  role: BackendRole;
  active: boolean;
  createdAt: string;
  solvedCount: number;
}

export type GeneratorType = 'TWO_INTEGERS' | 'INTEGER_ARRAY' | 'STRING_BASIC';

export interface Template {
  id: number;
  name: string;
  topic: {
    id: number;
    name: string;
    colorTag: string;
  };
  level: string;
  generatorType: GeneratorType;
  minN: number | null;
  maxN: number | null;
  minValue: number | null;
  maxValue: number | null;
  statementPattern: string;
  referenceSolutionCode: string;
  languageId: number;
  createdAt: string;
}

export const adminApi = {
  getDashboardStats: () => apiFetch<AdminDashboardStats>('/api/admin/dashboard'),
  getUsers: (role?: BackendRole, search?: string) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    const query = params.toString();
    return apiFetch<AdminUser[]>(`/api/admin/users${query ? `?${query}` : ''}`);
  },
  getUserById: (id: number) => apiFetch<AdminUser>(`/api/admin/users/${id}`),
  createUser: (data: { fullName: string; email: string; password: string; role: BackendRole }) =>
    apiFetch<AdminUser>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (id: number, data: { fullName: string; email: string; role: BackendRole }) =>
    apiFetch<AdminUser>(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggleUserStatus: (id: number) =>
    apiFetch<AdminUser>(`/api/admin/users/${id}/toggle-status`, { method: 'PATCH' }),
  deleteUser: (id: number) =>
    apiFetch<void>(`/api/admin/users/${id}`, { method: 'DELETE' }),
};

export const templatesApi = {
  list: () => apiFetch<Template[]>('/api/template'),
  create: (data: {
    name: string;
    topic: string;
    level: string;
    generatorType: GeneratorType;
    minN?: number;
    maxN?: number;
    minValue?: number;
    maxValue?: number;
    statementPattern: string;
    referenceSolutionCode: string;
    languageId: number;
  }) =>
    apiFetch<Template>('/api/template', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: {
    name: string;
    topic: string;
    level: string;
    generatorType: GeneratorType;
    minN?: number;
    maxN?: number;
    minValue?: number;
    maxValue?: number;
    statementPattern: string;
    referenceSolutionCode: string;
    languageId: number;
  }) =>
    apiFetch<Template>(`/api/template/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiFetch<void>(`/api/template/${id}`, { method: 'DELETE' }),
};

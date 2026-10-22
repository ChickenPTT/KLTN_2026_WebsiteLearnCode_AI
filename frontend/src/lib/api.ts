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
  updateProfile: (fullName: string, email: string) =>
    apiFetch<BackendUser>('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify({ fullName, email }),
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch<void>('/api/auth/me/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

export interface DailySubmission {
  day: string;
  count: number;
  passed: number;
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
  totalSubmissions7d: number;
  passedSubmissions7d: number;
  totalAiGeneratedProblems: number;
  publishedAiGeneratedProblems: number;
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
  getAuditLogs: (action?: string) => {
    const query = action ? `?action=${action}` : '';
    return apiFetch<AuditLog[]>(`/api/admin/audit-logs${query}`);
  },
};

export interface Topic {
  id: number;
  name: string;
  colorTag: string;
}

export const topicsApi = {
  list: () => apiFetch<Topic[]>('/api/topics'),
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
  generate: (templateId: number, useAiParaphrase?: boolean) =>
    apiFetch<BackendProblem>('/api/template/generate', {
      method: 'POST',
      body: JSON.stringify({ template_id: templateId, use_ai_paraphrase: useAiParaphrase ?? false }),
    }),
};

// ── Problem types ──

export interface BackendProblemSample {
  input: string;
  expectedOutput: string;
}

export interface BackendProblem {
  id: number;
  statement: string;
  topic: string;
  level: string;
  languageId: number;
  status: 'DRAFT' | 'PUBLISHED';
  sourceType: 'MANUAL' | 'AI_GENERATED';
  createdAt: string;
  samples: BackendProblemSample[];
  testCaseCount: number;
  templateName: string | null;
}

export const problemsApi = {
  // Admin: lấy tất cả problems (bao gồm draft)
  listAll: () => apiFetch<BackendProblem[]>('/api/problems/manage'),
  // Lấy problems đã publish
  listPublished: () => apiFetch<BackendProblem[]>('/api/problems'),
  // Lấy drafts
  listDrafts: () => apiFetch<BackendProblem[]>('/api/problems/drafts'),
  delete: (id: number) =>
    apiFetch<void>(`/api/problems/${id}`, { method: 'DELETE' }),
  publish: (id: number) =>
    apiFetch<BackendProblem>(`/api/problems/${id}/publish`, { method: 'PUT' }),
  unpublish: (id: number) =>
    apiFetch<BackendProblem>(`/api/problems/${id}/unpublish`, { method: 'PUT' }),
};

// ── History types ──

export interface BackendHistoryItem {
  id: number;
  problemId: number;
  problemTitle: string;
  topic: string | null;
  level: string | null;
  passed: boolean;
  submittedAt: string;
  languageId: number | null;
  /** null voi ban ghi cu (truoc khi luu chi tiet) */
  passedCount: number | null;
  totalCount: number | null;
  /** Giay */
  maxTime: number | null;
  /** KB */
  maxMemory: number | null;
  aiSeverity: string | null;
}

export interface BackendHistoryDetail {
  summary: BackendHistoryItem;
  sourceCode: string | null;
  aiFeedback: {
    errorType: string | null;
    suspectedLines: number[];
    explanation: string | null;
    hint: string | null;
    severity: string | null;
  } | null;
}

export const historyApi = {
  myHistory: () => apiFetch<BackendHistoryItem[]>('/api/history/me'),
  myHistoryDetail: (id: number) => apiFetch<BackendHistoryDetail>(`/api/history/me/${id}`),
};

export interface UserStats {
  streak: number;
  totalXp: number;
  solvedCount: number;
  totalSubmissions: number;
  topicProgress: Record<string, number>;
  joinedAt: string | null;
}

export const userApi = {
  getStats: () => apiFetch<UserStats>('/api/user/stats'),
};

// ── Flashcard types ──

export interface BackendFlashcardTerm {
  id: number;
  term: string;
  definition: string;
}

export interface BackendFlashcardDeck {
  id: number;
  name: string;
  description: string | null;
  authorName: string | null;
  authorRole: string | null;
  isPublic: boolean;
  viewCount: number;
  terms: BackendFlashcardTerm[];
  createdAt: string;
}

export interface TermRequest {
  term: string;
  definition: string;
}

export interface CreateDeckRequest {
  name: string;
  description?: string;
  authorName?: string;
  authorRole?: string;
  isPublic?: boolean;
  terms?: TermRequest[];
}

export interface UpdateDeckRequest {
  name?: string;
  description?: string;
  authorName?: string;
  authorRole?: string;
  isPublic?: boolean;
  terms?: TermRequest[];
}

export interface AdminFlashcardStats {
  totalDecks: number;
  totalTerms: number;
  publicDecks: number;
  unpublicDecks: number;
  adminDecks: number;
  teacherDecks: number;
  studentDecks: number;
}

export const flashcardApi = {
  listDecks: () => apiFetch<BackendFlashcardDeck[]>('/api/flashcard/decks'),
  getDeck: (id: number) => apiFetch<BackendFlashcardDeck>(`/api/flashcard/decks/${id}`),
  getTerms: (deckId: number) => apiFetch<BackendFlashcardTerm[]>(`/api/flashcard/decks/${deckId}/terms`),
  createDeck: (name: string, description?: string) =>
    apiFetch<BackendFlashcardDeck>('/api/flashcard/decks', {
      method: 'POST',
      body: JSON.stringify({ name, description: description ?? null }),
    }),
  updateDeck: (id: number, name: string, description?: string) =>
    apiFetch<BackendFlashcardDeck>(`/api/flashcard/decks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description: description ?? null }),
    }),
  deleteDeck: (id: number) =>
    apiFetch<void>(`/api/flashcard/decks/${id}`, { method: 'DELETE' }),
  addTerm: (deckId: number, term: string, definition: string) =>
    apiFetch<BackendFlashcardTerm>(`/api/flashcard/decks/${deckId}/terms`, {
      method: 'POST',
      body: JSON.stringify({ term, definition }),
    }),
  updateTerm: (termId: number, term: string, definition: string) =>
    apiFetch<BackendFlashcardTerm>(`/api/flashcard/decks/terms/${termId}`, {
      method: 'PUT',
      body: JSON.stringify({ term, definition }),
    }),
  deleteTerm: (termId: number) =>
    apiFetch<void>(`/api/flashcard/decks/terms/${termId}`, { method: 'DELETE' }),
  // Admin endpoints
  bulkCreate: (request: CreateDeckRequest) =>
    apiFetch<BackendFlashcardDeck>('/api/flashcard/decks/admin/bulk-create', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
  bulkUpdate: (id: number, request: UpdateDeckRequest) =>
    apiFetch<BackendFlashcardDeck>(`/api/flashcard/decks/admin/${id}/bulk-update`, {
      method: 'PUT',
      body: JSON.stringify(request),
    }),
  togglePublic: (id: number, isPublic: boolean) =>
    apiFetch<BackendFlashcardDeck>(`/api/flashcard/decks/${id}/public`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublic }),
    }),
  incrementView: (id: number) =>
    apiFetch<void>(`/api/flashcard/decks/${id}/view`, { method: 'POST' }),
  getAdminStats: () => apiFetch<AdminFlashcardStats>('/api/flashcard/decks/admin/stats'),
};

// ── Quiz (Flashcard Match) types ──

export interface GridCell {
  cellId: string;
  termId: number;
  cellType: 'TERM' | 'DEFINITION';
  displayText: string;
}

export interface RoundResponse {
  sessionId: number;
  roundNumber: number;
  totalRounds: number;
  timeLimit: number;
  timeRemaining: number;
  cells: GridCell[];
  matchedPairs: number;
  totalPairs: number;
}

export interface PairResult {
  correct: boolean;
  matchedPairs: number;
  totalPairs: number;
  timeRemaining: number;
  roundCompleted: boolean;
  quizCompleted: boolean;
}

export interface QuizRoundSummary {
  roundNumber: number;
  score: number;
  totalPairs: number;
  timeSpent: number;
  timeLimit: number;
  isTimeout: boolean;
}

export interface QuizResultResponse {
  sessionId: number;
  totalRounds: number;
  totalScore: number;
  totalPairs: number;
  rounds: QuizRoundSummary[];
  hasWrongTerms: boolean;
}

export type QuizType = 'BY_DECK' | 'RANDOM' | 'RETRY_WRONG';

export const quizApi = {
  startQuiz: (quizType: QuizType, deckId?: number, deckIds?: number[]) =>
    apiFetch<RoundResponse>('/api/flashcard/quiz/start', {
      method: 'POST',
      body: JSON.stringify({ quizType, deckId, deckIds }),
    }),
  submitPair: (sessionId: number, cellId1: string, cellId2: string) =>
    apiFetch<PairResult>('/api/flashcard/quiz/pair', {
      method: 'POST',
      body: JSON.stringify({ sessionId, cellId1, cellId2 }),
    }),
  getNextRound: (sessionId: number) =>
    apiFetch<RoundResponse>(`/api/flashcard/quiz/next-round/${sessionId}`),
  retryWrong: (sessionId: number) =>
    apiFetch<RoundResponse>(`/api/flashcard/quiz/retry-wrong/${sessionId}`, { method: 'POST' }),
  getQuizResult: (sessionId: number) =>
    apiFetch<QuizResultResponse>(`/api/flashcard/quiz/result/${sessionId}`),
  getQuizHistory: () =>
    apiFetch<QuizSession[]>('/api/flashcard/quiz/history'),
};

export interface QuizSession {
  id: number;
  quizType: QuizType;
  status: 'IN_PROGRESS' | 'COMPLETED';
  currentRound: number;
  totalRounds: number;
  createdAt: string;
}

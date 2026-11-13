// API quan tri mua giai thi dau (/api/admin/contest/seasons) — GET cho ADMIN/TEACHER, ghi chi ADMIN
import { apiFetch } from '@/lib/api';
import type { ContestSeason } from '@/lib/contestApi';
import type { Season } from '@/pages/user/league/types';

export interface AdminSeasonProblem {
  position: number;
  problemId: number;
  title: string;
  topic: string | null;
  level: string | null;
}

export interface AdminSeasonView {
  season: ContestSeason;
  problems: AdminSeasonProblem[];
  hasAttempts: boolean;
}

export interface AdminPoolProblem {
  problemId: number;
  title: string;
  topic: string | null;
  level: string | null;
  statement: string;
  samples: { input: string; expectedOutput: string }[];
  testCaseCount: number;
  sourceType: 'MANUAL' | 'AI_GENERATED' | null;
  selected: boolean;
  position: number | null;
  createdAt: string;
  /** Lời giải mẫu (mã thực thi) dùng để sinh output và kiểm thử */
  referenceSolution: string | null;
}

export interface SeasonWrite {
  name: string;
  description?: string | null;
  startAt: string;
  endAt: string;
  maxAttempts?: number;
  timeLimitMinutes?: number;
}

const BASE = '/api/admin/contest/seasons';
const body = (method: string, data?: unknown): RequestInit => ({
  method,
  body: data === undefined ? undefined : JSON.stringify(data),
});

export const adminContestApi = {
  list: () => apiFetch<AdminSeasonView[]>(BASE),
  get: (id: number) => apiFetch<AdminSeasonView>(`${BASE}/${id}`),
  create: (data: SeasonWrite) => apiFetch<AdminSeasonView>(BASE, body('POST', data)),
  update: (id: number, data: SeasonWrite) => apiFetch<AdminSeasonView>(`${BASE}/${id}`, body('PUT', data)),
  remove: (id: number) => apiFetch<void>(`${BASE}/${id}`, body('DELETE')),
  setProblems: (id: number, problemIds: number[]) =>
    apiFetch<AdminSeasonView>(`${BASE}/${id}/problems`, body('PUT', { problemIds })),
  pool: (id: number) => apiFetch<AdminPoolProblem[]>(`${BASE}/${id}/pool`),
  generate: (id: number, templateId: number, useAiParaphrase: boolean) =>
    apiFetch<AdminPoolProblem>(`${BASE}/${id}/pool/generate`, body('POST', { templateId, useAiParaphrase })),
  addFromBank: (id: number, problemId: number) =>
    apiFetch<AdminPoolProblem>(`${BASE}/${id}/pool`, body('POST', { problemId })),
  removeFromPool: (id: number, problemId: number) =>
    apiFetch<void>(`${BASE}/${id}/pool/${problemId}`, body('DELETE')),
};

// 'yyyy-mm-dd' (o chon ngay) -> LocalDateTime: bat dau 00:00, ket thuc 23:59:59 (gio may = gio VN)
export function dateToStart(date: string): string {
  return `${date}T00:00:00`;
}
export function dateToEnd(date: string): string {
  return `${date}T23:59:59`;
}
export function isoToDateInput(iso: string): string {
  return iso.slice(0, 10);
}

const STATUS: Record<ContestSeason['status'], Season['status']> = {
  ACTIVE: 'active',
  UPCOMING: 'upcoming',
  ENDED: 'completed',
};

// Chuyen sang kieu Season ma giao dien League dang dung (id = id backend dang chuoi)
export function toUiSeason(v: AdminSeasonView): Season {
  const s = v.season;
  const start = new Date(s.startAt).getTime();
  const end = new Date(s.endAt).getTime();
  return {
    id: String(s.id),
    name: s.name,
    status: STATUS[s.status],
    startDate: s.startAt,
    endDate: s.endAt,
    participants: s.participants,
    userPoints: 0,
    userRank: 0,
    progress: end > start ? Math.min(1, Math.max(0, (Date.now() - start) / (end - start))) : 0,
    rewards: [],
  };
}

export function errorText(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

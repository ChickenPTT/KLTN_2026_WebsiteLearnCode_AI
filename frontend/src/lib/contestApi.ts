/**
 * API thi dau (mua giai Dau hang) — luat: 4 bai/mua, 1 luot = 4 bai, toi da 3 luot, 90 phut/luot,
 * xep hang theo luot tot nhat: so bai dung > so luot da dung > tong thoi gian.
 */
import { apiFetch } from '@/lib/api';
import { LANGUAGE_IDS, type CodeLanguage, type TestCaseResult } from '@/lib/problemsApi';

export type SeasonStatus = 'UPCOMING' | 'ACTIVE' | 'ENDED';
export type AttemptStatus = 'IN_PROGRESS' | 'FINISHED';
export type SlotStatus = 'LOCKED' | 'OPEN' | 'SOLVED' | 'SKIPPED' | 'UNSOLVED';

export interface ContestSeason {
  id: number;
  name: string;
  description: string | null;
  startAt: string;
  endAt: string;
  status: SeasonStatus;
  problemCount: number;
  maxAttempts: number;
  timeLimitMinutes: number;
  participants: number;
}

export interface AttemptSummary {
  id: number;
  attemptNo: number;
  status: AttemptStatus;
  startedAt: string;
  finishedAt: string | null;
  solvedCount: number;
  totalTimeSeconds: number;
}

export interface MyStanding {
  attemptsUsed: number;
  attemptsLeft: number;
  inProgressAttemptId: number | null;
  best: { attemptNo: number; solvedCount: number; totalTimeSeconds: number } | null;
  rank: number | null;
  attempts: AttemptSummary[];
  /** Da dang ky mua giai hien tai chua (phai dang ky moi duoc thi) */
  registered: boolean;
}

export interface ContestCurrent {
  season: ContestSeason | null;
  me: MyStanding | null;
  serverNow: string;
}

export interface LeaderboardRow {
  rank: number;
  userId: number;
  name: string;
  solvedCount: number;
  attemptsUsed: number;
  totalTimeSeconds: number;
  me: boolean;
}

export interface ProblemSlot {
  position: number;
  status: SlotStatus;
  submitCount: number;
  timeSeconds: number;
}

export interface CurrentContestProblem {
  position: number;
  problemId: number;
  title: string;
  statement: string;
  topic: string | null;
  level: string | null;
  languageId: number;
  samples: { input: string; expectedOutput: string }[];
  openedAt: string;
}

export interface AttemptView {
  id: number;
  seasonId: number;
  seasonName: string;
  attemptNo: number;
  maxAttempts: number;
  status: AttemptStatus;
  startedAt: string;
  deadlineAt: string;
  finishedAt: string | null;
  serverNow: string;
  solvedCount: number;
  totalTimeSeconds: number;
  problems: ProblemSlot[];
  current: CurrentContestProblem | null;
}

export interface AchievementItem {
  id: string;
  title: string;
  desc: string;
  icon: 'crown' | 'brain' | 'rocket' | 'flame' | 'zap' | 'trophy';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  date: string | null;
}

export interface ContestRunResult {
  passed: boolean;
  testResults: TestCaseResult[];
}

export interface ContestSubmitResult {
  passed: boolean;
  passedCount: number;
  totalCount: number;
  /** Test an chi co passed/status, khong co input/output */
  testResults: TestCaseResult[];
  attempt: AttemptView;
}

const post = (body?: unknown): RequestInit => ({
  method: 'POST',
  body: body === undefined ? undefined : JSON.stringify(body),
});

const code = (sourceCode: string, language: CodeLanguage) =>
  post({ sourceCode, languageId: LANGUAGE_IDS[language] });

export const contestApi = {
  current: () => apiFetch<ContestCurrent>('/api/contest/current'),
  seasons: () => apiFetch<ContestSeason[]>('/api/contest/seasons'),
  /** Thanh tuu ca nhan (backend tinh tu ket qua thi that) */
  achievements: () => apiFetch<AchievementItem[]>('/api/contest/achievements'),
  leaderboard: (seasonId: number) => apiFetch<LeaderboardRow[]>(`/api/contest/seasons/${seasonId}/leaderboard`),
  /** Dang ky / huy dang ky mua giai hien tai — tra ve trang thai moi */
  register: () => apiFetch<ContestCurrent>('/api/contest/register', post()),
  unregister: () => apiFetch<ContestCurrent>('/api/contest/register', { method: 'DELETE' }),
  /** Bat dau luot moi (hoac tra ve luot dang lam do) */
  start: () => apiFetch<AttemptView>('/api/contest/attempts', post()),
  attempt: (attemptId: number) => apiFetch<AttemptView>(`/api/contest/attempts/${attemptId}`),
  run: (attemptId: number, sourceCode: string, language: CodeLanguage) =>
    apiFetch<ContestRunResult>(`/api/contest/attempts/${attemptId}/run`, code(sourceCode, language)),
  submit: (attemptId: number, sourceCode: string, language: CodeLanguage) =>
    apiFetch<ContestSubmitResult>(`/api/contest/attempts/${attemptId}/submit`, code(sourceCode, language)),
  skip: (attemptId: number) => apiFetch<AttemptView>(`/api/contest/attempts/${attemptId}/skip`, post()),
  finish: (attemptId: number) => apiFetch<AttemptView>(`/api/contest/attempts/${attemptId}/finish`, post()),
};

/** Do lech dong ho may khach so voi server (ms) — dem nguoc theo gio server */
export function serverOffsetMs(serverNow: string): number {
  return new Date(serverNow).getTime() - Date.now();
}

/** 3725 -> "1:02:05", 125 -> "2:05" */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return `${h > 0 ? `${h}:` : ''}${mm}:${String(sec).padStart(2, '0')}`;
}

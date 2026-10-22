/**
 * Tinh tien do hoc tap tu lich su nop bai that (/api/history/me).
 * Cach tinh diem theo trang ScoringGuidePage:
 * - Diem 1 lan nop = do chinh xac (% test dat) x he so do kho, tru diem so lan nop sai truoc do (5d/lan, toi da 15)
 *   va tru 2d neu AI phai chi ra loi nghiem trong (severity = major).
 * - Diem nang luc chu de = trung binh co trong so cua toi da 5 lan nop gan nhat (lan moi nang ky hon).
 */
import type { BackendHistoryItem } from '@/lib/api';
import { LANGUAGE_LABELS, sameTopic, toDifficulty } from '@/lib/problemsApi';

const DIFFICULTY_FACTOR: Record<'Easy' | 'Medium' | 'Hard', number> = { Easy: 0.8, Medium: 1, Hard: 1.2 };
const RETRY_PENALTY = 5;
const MAX_RETRY_PENALTY = 15;
const AI_MAJOR_PENALTY = 2;
const RECENT_LIMIT = 5;
export const XP_PER_SOLVED = 100;

export type SkillLabel = 'Mới bắt đầu' | 'Cơ bản' | 'Trung bình' | 'Khá' | 'Nâng cao';

export interface TopicSkill {
  name: string;
  score: number;
  label: SkillLabel;
  color: string;
  submissions: number;
  solvedCount: number;
  confidence: 'Thấp' | 'Trung bình' | 'Cao';
}

export interface DayActivity {
  date: Date;
  /** T2..CN */
  day: string;
  solved: number;
  attempts: number;
  xp: number;
}

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#ec4899', '#14b8a6', '#0ea5e9', '#84cc16'];

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function topicOf(h: BackendHistoryItem): string {
  return h.topic?.trim() || 'Khác';
}

export function skillLevel(score: number): { label: SkillLabel; color: string } {
  if (score >= 80) return { label: 'Nâng cao', color: '#a855f7' };
  if (score >= 60) return { label: 'Khá', color: '#f59e0b' };
  if (score >= 40) return { label: 'Trung bình', color: '#3b82f6' };
  if (score >= 20) return { label: 'Cơ bản', color: '#22c55e' };
  return { label: 'Mới bắt đầu', color: '#64748b' };
}

/** Diem (0-100) cua tung lan nop, key = history id */
export function submissionScores(history: BackendHistoryItem[]): Map<number, number> {
  const chronological = [...history].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const failedBefore = new Map<number, number>();
  const scores = new Map<number, number>();
  chronological.forEach((h) => {
    const accuracy =
      h.passedCount != null && h.totalCount ? (h.passedCount / h.totalCount) * 100 : h.passed ? 100 : 0;
    let score = accuracy * DIFFICULTY_FACTOR[toDifficulty(h.level)];
    const retries = failedBefore.get(h.problemId) ?? 0;
    if (h.passed) score -= Math.min(retries * RETRY_PENALTY, MAX_RETRY_PENALTY);
    else failedBefore.set(h.problemId, retries + 1);
    if (h.aiSeverity === 'major') score -= AI_MAJOR_PENALTY;
    scores.set(h.id, Math.round(Math.max(0, Math.min(100, score))));
  });
  return scores;
}

/** Nang luc theo chu de; topicNames = cac chu de can hien ke ca chua nop bai */
export function topicSkills(history: BackendHistoryItem[], topicNames: string[] = []): TopicSkill[] {
  const scores = submissionScores(history);
  const names: string[] = [];
  [...topicNames, ...history.map(topicOf)].forEach((n) => {
    if (!names.some((x) => sameTopic(x, n))) names.push(n);
  });

  return names
    .map((name) => {
      // history tu backend da sap xep moi nhat truoc
      const items = history.filter((h) => sameTopic(topicOf(h), name));
      const recent = items.slice(0, RECENT_LIMIT);
      let weighted = 0;
      let weights = 0;
      recent.forEach((h, i) => {
        const w = RECENT_LIMIT - i;
        weighted += (scores.get(h.id) ?? 0) * w;
        weights += w;
      });
      const score = weights ? Math.round(weighted / weights) : 0;
      const level = skillLevel(score);
      const solvedCount = new Set(items.filter((h) => h.passed).map((h) => h.problemId)).size;
      const confidence: TopicSkill['confidence'] = items.length < 3 ? 'Thấp' : items.length <= 7 ? 'Trung bình' : 'Cao';
      return { name, score, label: level.label, color: level.color, submissions: items.length, solvedCount, confidence };
    })
    .sort((a, b) => b.submissions - a.submissions || b.score - a.score);
}

/** So bai (khac nhau) da giai theo chu de — cho bieu do tron */
export function solvedByTopic(history: BackendHistoryItem[]): { name: string; count: number; color: string }[] {
  const solved = new Map<number, string>();
  history.forEach((h) => {
    if (h.passed && !solved.has(h.problemId)) solved.set(h.problemId, topicOf(h));
  });
  const counts: { name: string; count: number }[] = [];
  solved.forEach((topic) => {
    const found = counts.find((c) => sameTopic(c.name, topic));
    if (found) found.count++;
    else counts.push({ name: topic, count: 1 });
  });
  return counts
    .sort((a, b) => b.count - a.count)
    .map((c, i) => ({ ...c, color: PIE_COLORS[i % PIE_COLORS.length] }));
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Hoat dong `days` ngay gan nhat, cu nhat truoc, ngay cuoi la hom nay */
export function recentActivity(history: BackendHistoryItem[], days = 7): DayActivity[] {
  // Ngay giai duoc bai lan dau -> tinh XP cho ngay do
  const firstSolved = new Map<number, string>();
  [...history]
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))
    .forEach((h) => {
      if (h.passed && !firstSolved.has(h.problemId)) firstSolved.set(h.problemId, dayKey(new Date(h.submittedAt)));
    });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - i));
    const key = dayKey(date);
    const items = history.filter((h) => dayKey(new Date(h.submittedAt)) === key);
    const solved = new Set(items.filter((h) => h.passed).map((h) => h.problemId)).size;
    const newlySolved = [...firstSolved.values()].filter((k) => k === key).length;
    return { date, day: DAY_LABELS[date.getDay()], solved, attempts: items.length, xp: newlySolved * XP_PER_SOLVED };
  });
}

export function formatRuntime(seconds: number | null | undefined): string {
  if (seconds == null) return '—';
  return `${Math.round(seconds * 1000)} ms`;
}

export function formatMemory(kb: number | null | undefined): string {
  if (kb == null || kb <= 0) return '—';
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function languageLabel(id: number | null | undefined): string {
  return id != null ? LANGUAGE_LABELS[id] ?? `#${id}` : '—';
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

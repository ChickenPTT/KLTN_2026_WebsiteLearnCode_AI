/**
 * Tinh tien do hoc tap tu lich su nop bai that (/api/history/me).
 * PHUONG AN 1: Diem theo Muc Do Kho Tuyet doi.
 *
 * - Moi bai co do kho co dinh (Level1..Level5), anh xa sang 5 band nang luc.
 * - Diem 1 bai = accuracy x diem_tran_muc - phat_thu_lai (3d/lan, toi da 15).
 * - Diem quy doi = (diem_bai / diem_tran) x 100 -> thang 0-100 chung.
 * - Diem band = trung binh cac diem quy doi tu bai khac nhau, moi bai lay ket qua tot nhat.
 * - Bo phat AI khoi diem nang luc (van luu de thong ke).
 * - Deadband ±2: chi len band khi >= nguong + 2, chi xuong khi <= nguong - 2.
 * - Cold start: <2 bai -> "Chua du du lieu", 2-4 bai -> "Dang danh gia", >=5 -> binh thuong.
 * - Myen tru: accuracy < 30% o bai kho hon 1+ muc -> bo qua, khong lam giam band.
 * - Band hien tai luu tren backend (/api/auth/me/topic-bands) theo user+topic de co hysteresis.
 */
import type { BackendHistoryItem } from '@/lib/api';
import { LANGUAGE_LABELS, sameTopic, toScoringLevel } from '@/lib/problemsApi';
import type { DifficultyLevel, SkillLevel, TopicScore } from '@/types';
import { DIFFICULTY_CEILING } from '@/types';

export const XP_PER_SOLVED = 100;

export type SkillLabel = 'Mới bắt đầu' | 'Cơ bản' | 'Trung bình' | 'Khá' | 'Nâng cao';

const RETRY_PENALTY = 3;
const MAX_RETRY_PENALTY = 15;
const DEADBAND = 2;
const HARD_FAIL_THRESHOLD = 30;
const COLD_START_MIN = 2;
const EVALUATING_MIN = 2;
const EVALUATING_MAX = 4;

/**
 * Tu danh gia lam diem khoi dau (prior) khi chua du bai that.
 * w = PRIOR_WEIGHT x max(0, 1 - n / PRIOR_FADE_COUNT); tu n >= 5 bai -> w = 0 (chi con bai that).
 * Diem khoi dau = giua band tuong ung.
 */
const PRIOR_WEIGHT = 2;
const PRIOR_FADE_COUNT = 5;
const SELF_LEVEL_PRIOR_SCORE: Record<SkillLevel, number> = {
  beginner: 10,
  basic: 30,
  intermediate: 50,
  advanced: 70,
  expert: 90,
};

/** Nguong band tren thang 0-100 */
const BAND_THRESHOLDS = [0, 20, 40, 60, 80];
const BAND_LABELS: SkillLabel[] = ['Mới bắt đầu', 'Cơ bản', 'Trung bình', 'Khá', 'Nâng cao'];
const BAND_COLORS = ['#64748b', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7'];

export interface TopicSkill {
  name: string;
  score: number;
  label: SkillLabel;
  color: string;
  submissions: number;
  solvedCount: number;
  confidence: 'Thấp' | 'Trung bình' | 'Cao';
  /**
   * 'nodata' | 'self' | 'evaluating' | 'stable'
   * 'self': chua du 2 bai nhung co tu danh gia -> diem dua chu yeu vao tu danh gia.
   */
  bandStatus: 'nodata' | 'self' | 'evaluating' | 'stable';
  /** So bai khac nhau duoc ghi nhap chinh thuc */
  officialProblemCount: number;
  /** Muc tu danh gia cua chu de (neu co) */
  selfLevel?: SkillLevel;
  /**
   * Band can luu lai cho lan tinh sau (deadband). undefined = khong cap nhat.
   * Chi tinh tu bai that; trang thai 'nodata'/'self' khong luu.
   */
  nextBandIndex?: number;
}

/** Band hien tai theo chu de (0..4), luu tren backend (truoc day localStorage). */
export type TopicBands = Record<string, number>;

function isValidBand(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 4;
}

function findStoredBand(bands: TopicBands, topic: string): number | undefined {
  for (const [k, v] of Object.entries(bands)) {
    if (sameTopic(k, topic) && isValidBand(v)) return v;
  }
  return undefined;
}

/** Cac chu de co band moi khac voi band da luu -> can gui len backend. */
export function bandUpdates(skills: TopicSkill[], stored: TopicBands): { topic: string; bandIndex: number }[] {
  return skills
    .filter((s) => s.nextBandIndex !== undefined && findStoredBand(stored, s.name) !== s.nextBandIndex)
    .map((s) => ({ topic: s.name, bandIndex: s.nextBandIndex as number }));
}

// ─── Du lieu cu trong localStorage (chi dung de chuyen len backend 1 lan) ───

const LEGACY_BAND_PREFIX = 'mnemonic_band_';

export function readLegacyBands(userId: string): TopicBands {
  const result: TopicBands = {};
  const prefix = `${LEGACY_BAND_PREFIX}${userId}_`;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(prefix)) continue;
      const idx = parseInt(localStorage.getItem(key) ?? '', 10);
      const topic = key.slice(prefix.length);
      if (topic && isValidBand(idx)) result[topic] = idx;
    }
  } catch { /* ignore */ }
  return result;
}

export function clearLegacyBands(userId: string) {
  const prefix = `${LEGACY_BAND_PREFIX}${userId}_`;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) keys.push(key);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch { /* ignore */ }
}

// ─── Core scoring functions ───

/**
 * Tinh diem 1 bai tap theo muc do kho tuyet doi.
 * diem_bai = accuracy% x diem_tran_muc - min(retries x 3, 15)
 * Clamp vao [0, diem_tran_muc]
 */
function calculateProblemScore(accuracy: number, difficultyLevel: DifficultyLevel, failedAttempts: number): number {
  const ceiling = DIFFICULTY_CEILING[difficultyLevel];
  const rawScore = (accuracy / 100) * ceiling - Math.min(failedAttempts * RETRY_PENALTY, MAX_RETRY_PENALTY);
  return Math.max(0, Math.min(ceiling, rawScore));
}

/**
 * Quy doi diem bai ve thang 0-100.
 * diem_quy_doi = (diem_bai / diem_tran) x 100
 */
function normalizeScore(problemScore: number, difficultyLevel: DifficultyLevel): number {
  const ceiling = DIFFICULTY_CEILING[difficultyLevel];
  if (ceiling <= 0) return 0;
  return (problemScore / ceiling) * 100;
}

/**
 * Lay band index tu score tren thang 0-100.
 */
function scoreToBandIndex(score: number): number {
  if (score >= 80) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  if (score >= 20) return 1;
  return 0;
}

/**
 * Kiem tra neu la lan nop bai kho hon va that bai hoan toan.
 * Neu accuracy < 30% va bai kho hon band hien tai 1+ muc -> bo qua.
 */
function isHardFailExempt(accuracy: number, problemLevel: DifficultyLevel, currentBandIndex: number): boolean {
  if (accuracy >= HARD_FAIL_THRESHOLD) return false;
  const levelNum = parseInt(problemLevel.replace('Level', ''), 10);
  return levelNum > currentBandIndex + 1;
}

/**
 * Kiem tra neu bai de hon band hien tai 2+ muc -> bo qua.
 */
function isTooEasyToCount(problemLevel: DifficultyLevel, currentBandIndex: number): boolean {
  const levelNum = parseInt(problemLevel.replace('Level', ''), 10);
  return levelNum < currentBandIndex;
}

/**
 * Ap dung deadband ±2 de chong dao dong band.
 * Len band: rawScore >= threshold_band_ke + deadband
 * Xuong band: rawScore <= threshold_band_hien_tai - deadband
 */
function applyDeadband(rawScore: number, currentBandIndex: number): number {
  const rawBandIndex = scoreToBandIndex(rawScore);

  // Neu khong co band hien tai, lay raw
  if (currentBandIndex === undefined) return rawBandIndex;

  // Co gang len band
  if (rawBandIndex > currentBandIndex) {
    const nextThreshold = BAND_THRESHOLDS[rawBandIndex];
    if (rawScore >= nextThreshold + DEADBAND) {
      return rawBandIndex;
    }
    return currentBandIndex; // Chua du dieu de len
  }

  // Co gang xuong band
  if (rawBandIndex < currentBandIndex) {
    const currentThreshold = BAND_THRESHOLDS[currentBandIndex];
    if (rawScore <= currentThreshold - DEADBAND) {
      return rawBandIndex;
    }
    return currentBandIndex; // Van trong deadband, giu band
  }

  // Cung band
  return currentBandIndex;
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

/**
 * Tra ve label + color tu band index.
 * Co the tra ve them cold start info.
 */
export function skillLevel(
  score: number,
  officialCount: number = 0,
): { label: SkillLabel; color: string; bandStatus: 'nodata' | 'evaluating' | 'stable' } {
  const bandIdx = scoreToBandIndex(score);
  let bandStatus: 'nodata' | 'evaluating' | 'stable';
  if (officialCount < COLD_START_MIN) {
    bandStatus = 'nodata';
  } else if (officialCount <= EVALUATING_MAX) {
    bandStatus = 'evaluating';
  } else {
    bandStatus = 'stable';
  }
  return {
    label: BAND_LABELS[bandIdx],
    color: BAND_COLORS[bandIdx],
    bandStatus,
  };
}

/**
 * Tinh diem cho tung bai tap (khong con theo tung lan nop).
 * Moi bai tap co 1 diem quy doi (0-100) la ket qua tot nhat.
 * Tra ve Map<problemId, { normalizedScore, difficultyLevel }>
 */
export function submissionScores(
  history: BackendHistoryItem[],
  userId?: string,
): Map<number, { normalizedScore: number; difficultyLevel: DifficultyLevel }> {
  const chronological = [...history].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

  // Dem so lan sai truoc khi pass cho moi bai
  const failedBefore = new Map<number, number>();
  chronological.forEach((h) => {
    if (!h.passed) {
      failedBefore.set(h.problemId, (failedBefore.get(h.problemId) ?? 0) + 1);
    }
  });

  // Moi bai: lay lan nop tot nhat (accuracy cao nhat, neu co nhieu lan pass)
  const bestByProblem = new Map<number, BackendHistoryItem>();
  chronological.forEach((h) => {
    const existing = bestByProblem.get(h.problemId);
    const acc = h.passedCount != null && h.totalCount ? (h.passedCount / h.totalCount) * 100 : h.passed ? 100 : 0;
    const existingAcc = existing
      ? (existing.passedCount != null && existing.totalCount ? (existing.passedCount / existing.totalCount) * 100 : existing.passed ? 100 : 0)
      : -1;
    // Luu neu accuracy cao hon, hoac chua co
    if (acc > existingAcc) {
      bestByProblem.set(h.problemId, h);
    }
  });

  // Tinh diem cho moi bai
  const result = new Map<number, { normalizedScore: number; difficultyLevel: DifficultyLevel }>();
  bestByProblem.forEach((h, problemId) => {
    const difficultyLevel = toScoringLevel(h.level);
    const acc = h.passedCount != null && h.totalCount ? (h.passedCount / h.totalCount) * 100 : h.passed ? 100 : 0;
    const retries = failedBefore.get(problemId) ?? 0;

    // Bo qua neu la hard fail
    const problemLevelNum = parseInt(difficultyLevel.replace('Level', ''), 10);
    // Default band index = 0 (Moi bat dau) neu chua co
    if (isHardFailExempt(acc, difficultyLevel, 0)) {
      return; // Bo qua bai nay
    }

    const problemScore = calculateProblemScore(acc, difficultyLevel, retries);
    const normalized = normalizeScore(problemScore, difficultyLevel);
    result.set(problemId, { normalizedScore: Math.round(normalized), difficultyLevel });
  });

  return result;
}

/**
 * Nang luc theo chu de - PHUONG AN 1.
 * - Moi bai tap co 1 diem quy doi (0-100) la ket qua tot nhat.
 * - Diem band = trung binh cac diem quy doi tu bai khac nhau.
 * - Chi tinh bai co do kho >= band hien tai - 1 (bai de hon 2 muc bo qua).
 * - Deadband ±2 de chong dao dong.
 * - Cold start: <2 bai -> "Chua du du lieu", 2-4 bai -> "Dang danh gia".
 * - Band hien tai (storedBands, luu tren backend) de co hysteresis. Ham THUAN: khong doc/ghi storage;
 *   band moi tra ve qua TopicSkill.nextBandIndex, noi goi tu quyet dinh co luu hay khong.
 * - selfAssessment (tuy chon): tron diem tu danh gia khi < 5 bai.
 *   nextBandIndex van chi tinh tu bai that (tu danh gia khong anh huong bo loc lan sau).
 * Hoc vien (ProgressPage) va admin (AdminUserDetailModal) goi cung ham voi cung du lieu -> ket qua giong nhau.
 */
export function topicSkills(
  history: BackendHistoryItem[],
  topicNames: string[] = [],
  options: { storedBands?: TopicBands; selfAssessment?: TopicScore[] } = {},
): TopicSkill[] {
  const storedBands = options.storedBands ?? {};
  const selfAssessment = options.selfAssessment ?? [];
  const names: string[] = [];
  [...topicNames, ...history.map(topicOf)].forEach((n) => {
    if (!names.some((x) => sameTopic(x, n))) names.push(n);
  });

  return names
    .map((name) => {
      const items = history.filter((h) => sameTopic(topicOf(h), name));

      // Band hien tai da luu (de co hysteresis)
      const storedBandIndex = findStoredBand(storedBands, name);
      const currentBandIndex = storedBandIndex ?? 0;
      let nextBandIndex: number | undefined;

      // Gom ket qua theo bai tap - moi bai lay diem tot nhat
      const problemMap = new Map<number, {
        bestNormalizedScore: number;
        difficultyLevel: DifficultyLevel;
        bestAccuracy: number;
      }>();

      // Sap xep theo thoi gian de dem retries
      const chronological = [...items].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
      const failedBefore = new Map<number, number>();
      chronological.forEach((h) => {
        if (!h.passed) {
          failedBefore.set(h.problemId, (failedBefore.get(h.problemId) ?? 0) + 1);
        }
      });

      // Voi moi bai, tim lan nop tot nhat
      chronological.forEach((h) => {
        const difficultyLevel = toScoringLevel(h.level);
        const acc = h.passedCount != null && h.totalCount ? (h.passedCount / h.totalCount) * 100 : h.passed ? 100 : 0;
        const retries = failedBefore.get(h.problemId) ?? 0;

        // Kiem tra hard fail exemption
        if (isHardFailExempt(acc, difficultyLevel, currentBandIndex)) {
          return;
        }

        // Kiem tra too easy
        if (isTooEasyToCount(difficultyLevel, currentBandIndex)) {
          return;
        }

        const problemScore = calculateProblemScore(acc, difficultyLevel, retries);
        const normalized = normalizeScore(problemScore, difficultyLevel);

        const existing = problemMap.get(h.problemId);
        if (!existing || normalized > existing.bestNormalizedScore) {
          problemMap.set(h.problemId, {
            bestNormalizedScore: normalized,
            difficultyLevel,
            bestAccuracy: acc,
          });
        }
      });

      // Tinh diem band = trung binh cac diem quy doi
      const scores = Array.from(problemMap.values()).map(p => p.bestNormalizedScore);
      const officialProblemCount = scores.length;

      let bandScore = 0;
      let bandStatus: TopicSkill['bandStatus'];
      let bandIndex = currentBandIndex;

      const selfLevel = selfAssessment.find((s) => sameTopic(s.topic, name))?.level;
      const priorScore = selfLevel ? SELF_LEVEL_PRIOR_SCORE[selfLevel] : undefined;
      const priorWeight =
        priorScore !== undefined ? PRIOR_WEIGHT * Math.max(0, 1 - officialProblemCount / PRIOR_FADE_COUNT) : 0;

      if (priorScore !== undefined && priorWeight > 0) {
        // Tron tu danh gia voi bai that
        const sum = scores.reduce((a, b) => a + b, 0);
        bandScore = Math.round((priorWeight * priorScore + sum) / (priorWeight + officialProblemCount));

        if (officialProblemCount < COLD_START_MIN) {
          bandStatus = 'self';
          bandIndex = scoreToBandIndex(bandScore);
          // Khong luu band o trang thai tu danh gia
        } else {
          bandStatus = 'evaluating';
          bandIndex = applyDeadband(bandScore, currentBandIndex);
          // Luu band tinh tu bai that (giong logic cu) de bo loc lan sau khong bi tu danh gia lam lech
          const realScore = Math.round(sum / officialProblemCount);
          nextBandIndex = applyDeadband(realScore, currentBandIndex);
        }
      } else if (officialProblemCount < COLD_START_MIN) {
        bandStatus = 'nodata';
        bandScore = 0;
        bandIndex = 0;
      } else {
        bandScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        // Ap dung deadband
        bandIndex = applyDeadband(bandScore, currentBandIndex);
        // Band moi can luu
        nextBandIndex = bandIndex;

        if (officialProblemCount <= EVALUATING_MAX) {
          bandStatus = 'evaluating';
        } else {
          bandStatus = 'stable';
        }
      }

      const solvedCount = new Set(items.filter((h) => h.passed).map((h) => h.problemId)).size;

      // Do tin cay: dua tren so bai khac nhau
      let confidence: TopicSkill['confidence'];
      if (officialProblemCount < 3) confidence = 'Thấp';
      else if (officialProblemCount <= 7) confidence = 'Trung bình';
      else confidence = 'Cao';

      return {
        name,
        score: bandScore,
        label: BAND_LABELS[bandIndex],
        color: BAND_COLORS[bandIndex],
        submissions: items.length,
        solvedCount,
        confidence,
        bandStatus,
        officialProblemCount,
        selfLevel,
        nextBandIndex,
      };
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

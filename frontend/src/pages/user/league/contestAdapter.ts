// Chuyen du lieu mua giai tu backend sang kieu Season ma cac component giao dien League dang dung
import type { ContestSeason } from '@/lib/contestApi';
import type { Season } from './types';

const STATUS_MAP: Record<ContestSeason['status'], Season['status']> = {
  ACTIVE: 'active',
  UPCOMING: 'upcoming',
  ENDED: 'completed',
};

export function toLeagueSeason(s: ContestSeason, userRank?: number | null): Season {
  const start = new Date(s.startAt).getTime();
  const end = new Date(s.endAt).getTime();
  const progress = end > start ? Math.min(1, Math.max(0, (Date.now() - start) / (end - start))) : 0;
  return {
    id: String(s.id),
    name: s.name,
    status: STATUS_MAP[s.status],
    startDate: s.startAt,
    endDate: s.endAt,
    participants: s.participants,
    userPoints: 0,
    userRank: userRank ?? 0,
    progress,
    rewards: [],
  };
}

/** Giay -> phut (lam tron) de dung chung formatDuration */
export function secondsToMinutes(seconds: number): number {
  return Math.round(seconds / 60);
}

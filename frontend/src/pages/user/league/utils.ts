// Shared UI helpers for the Coding League feature.

export function formatNumber(n: number): string {
  return n.toLocaleString('vi-VN');
}

/** 95 -> "1 giờ 35 phút", 40 -> "40 phút" */
export function formatDuration(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(m / 60);
  const minutes = m % 60;
  if (hours === 0) return `${minutes} phút`;
  return minutes === 0 ? `${hours} giờ` : `${hours} giờ ${minutes} phút`;
}

/**
 * Tổng thời gian làm bài của học viên (phút).
 * Dữ liệu cũ đã lưu trong localStorage chưa có trường này -> ước lượng ~20 phút / bài hoàn thành.
 */
export function getPlayerTimeMinutes(p: { totalTimeMinutes?: number; completed: number }): number {
  return p.totalTimeMinutes ?? p.completed * 20;
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function getTimeRemaining(target: string | Date): TimeRemaining {
  const end = typeof target === 'string' ? new Date(target).getTime() : target.getTime();
  const total = Math.max(0, end - Date.now());
  const days = Math.floor(total / 86_400_000);
  const hours = Math.floor((total % 86_400_000) / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);
  return { days, hours, minutes, seconds, total };
}

// Deterministic pastel gradient from a string seed (used for avatars).
export function gradientFromSeed(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 48) % 360;
  return `linear-gradient(135deg, hsl(${h1} 70% 58%), hsl(${h2} 72% 46%))`;
}

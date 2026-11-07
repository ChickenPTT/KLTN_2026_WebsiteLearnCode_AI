import {
  seasons as initialSeasons,
  players as initialPlayers,
  achievements as initialAchievements,
} from '@/pages/user/league/mockData';
import type { Season, SeasonStatus, Reward, Player, UserAchievement } from '@/pages/user/league/types';

export const LEAGUE_SEASONS_KEY = 'app_league_seasons';
export const LEAGUE_PLAYERS_KEY = 'app_league_players';
export const LEAGUE_ACHIEVEMENTS_KEY = 'app_league_achievements';

/**
 * Lấy danh sách mùa giải từ localStorage hoặc dữ liệu khởi tạo
 */
export function getStoredSeasons(): Season[] {
  try {
    const raw = localStorage.getItem(LEAGUE_SEASONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Lỗi khi đọc danh sách mùa giải:', err);
  }

  // Khởi tạo ban đầu
  try {
    localStorage.setItem(LEAGUE_SEASONS_KEY, JSON.stringify(initialSeasons));
  } catch {
    // ignore
  }
  return [...initialSeasons];
}

/**
 * Lưu danh sách mùa giải và phát sự kiện đồng bộ
 */
export function saveStoredSeasons(seasons: Season[]): void {
  try {
    localStorage.setItem(LEAGUE_SEASONS_KEY, JSON.stringify(seasons));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('league_data_changed', { detail: { type: 'seasons', seasons } }));
    }
  } catch (err) {
    console.error('Lỗi khi lưu danh sách mùa giải:', err);
  }
}

/**
 * Lấy mùa giải đang diễn ra
 */
export function getActiveSeason(): Season {
  const all = getStoredSeasons();
  const active = all.find((s) => s.status === 'active');
  return active || all[0];
}

/**
 * Lấy mùa giải sắp tới
 */
export function getUpcomingSeason(): Season | undefined {
  const all = getStoredSeasons();
  return all.find((s) => s.status === 'upcoming');
}

/**
 * Thêm mùa giải mới
 */
export function createSeason(data: Partial<Omit<Season, 'id'>> & Pick<Season, 'name' | 'status' | 'startDate' | 'endDate'>): Season {
  const all = getStoredSeasons();
  const newId = `s_${Date.now()}`;

  // Nếu mùa giải mới là 'active', chuyển các mùa đang active thành 'completed'
  let updatedList = [...all];
  if (data.status === 'active') {
    updatedList = updatedList.map((s) =>
      s.status === 'active' ? { ...s, status: 'completed' as SeasonStatus, progress: 1 } : s,
    );
  }

  const defaultRewards: Reward[] = [
    { position: 1, title: 'Vô địch mùa giải', desc: 'Cúp Vô địch + 3.000.000đ + Học bổng' },
    { position: 2, title: 'Á quân', desc: 'Huy chương bạc + 2.000.000đ' },
    { position: 3, title: 'Hạng ba', desc: 'Huy chương đồng + 1.000.000đ' },
  ];

  const newSeason: Season = {
    ...data,
    id: newId,
    rewards: data.rewards && data.rewards.length > 0 ? data.rewards : defaultRewards,
    progress: data.progress ?? (data.status === 'completed' ? 1 : data.status === 'upcoming' ? 0 : 0.1),
    userPoints: data.userPoints ?? 0,
    userRank: data.userRank ?? 0,
    participants: data.participants ?? 0,
  };

  updatedList.unshift(newSeason);
  saveStoredSeasons(updatedList);
  return newSeason;
}

/**
 * Cập nhật thông tin mùa giải
 */
export function updateSeason(id: string, updates: Partial<Season>): Season | null {
  const all = getStoredSeasons();
  const targetIndex = all.findIndex((s) => s.id === id);
  if (targetIndex === -1) return null;

  let updatedList = [...all];

  // Nếu chuyển trạng thái sang active, tắt active ở các mùa khác
  if (updates.status === 'active') {
    updatedList = updatedList.map((s) =>
      s.id !== id && s.status === 'active' ? { ...s, status: 'completed' as SeasonStatus, progress: 1 } : s,
    );
  }

  const updatedSeason: Season = {
    ...updatedList[targetIndex],
    ...updates,
  };

  // Cập nhật progress tương ứng với trạng thái
  if (updates.status === 'completed') {
    updatedSeason.progress = 1;
  } else if (updates.status === 'upcoming') {
    updatedSeason.progress = 0;
  }

  updatedList[targetIndex] = updatedSeason;
  saveStoredSeasons(updatedList);
  return updatedSeason;
}

/**
 * Xóa mùa giải
 */
export function deleteSeason(id: string): boolean {
  const all = getStoredSeasons();
  const filtered = all.filter((s) => s.id !== id);
  if (filtered.length === all.length) return false;

  saveStoredSeasons(filtered);
  return true;
}

/**
 * Đổi nhanh trạng thái mùa giải
 */
export function changeSeasonStatus(id: string, newStatus: SeasonStatus): Season | null {
  return updateSeason(id, { status: newStatus });
}

/**
 * Lấy danh sách phần thưởng của một mùa giải
 */
export function getSeasonRewards(seasonId: string): Reward[] {
  const all = getStoredSeasons();
  const target = all.find((s) => s.id === seasonId);
  return target?.rewards || [];
}

/**
 * Cập nhật toàn bộ phần thưởng của một mùa giải
 */
export function updateSeasonRewards(seasonId: string, rewards: Reward[]): Season | null {
  // Sắp xếp lại theo thứ hạng tăng dần (1, 2, 3...)
  const sorted = [...rewards].sort((a, b) => a.position - b.position);
  return updateSeason(seasonId, { rewards: sorted });
}

/**
 * Thêm hoặc cập nhật một phần thưởng cụ thể
 */
export function saveSingleReward(seasonId: string, reward: Reward): Season | null {
  const currentRewards = getSeasonRewards(seasonId);
  const existingIdx = currentRewards.findIndex((r) => r.position === reward.position);

  let updated: Reward[];
  if (existingIdx >= 0) {
    updated = currentRewards.map((r) => (r.position === reward.position ? reward : r));
  } else {
    updated = [...currentRewards, reward];
  }

  return updateSeasonRewards(seasonId, updated);
}

/**
 * Xóa phần thưởng theo thứ hạng
 */
export function deleteReward(seasonId: string, position: number): Season | null {
  const currentRewards = getSeasonRewards(seasonId);
  const updated = currentRewards.filter((r) => r.position !== position);
  return updateSeasonRewards(seasonId, updated);
}

/**
 * Lấy danh sách học viên thi đấu (Leaderboard)
 */
export function getStoredPlayers(): Player[] {
  try {
    const raw = localStorage.getItem(LEAGUE_PLAYERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Lỗi khi đọc bảng xếp hạng:', err);
  }

  try {
    localStorage.setItem(LEAGUE_PLAYERS_KEY, JSON.stringify(initialPlayers));
  } catch {
    // ignore
  }
  return [...initialPlayers];
}

/**
 * Lưu danh sách học viên
 */
export function saveStoredPlayers(players: Player[]): void {
  try {
    localStorage.setItem(LEAGUE_PLAYERS_KEY, JSON.stringify(players));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('league_data_changed', { detail: { type: 'players', players } }));
    }
  } catch (err) {
    console.error('Lỗi khi lưu bảng xếp hạng:', err);
  }
}

/**
 * Điều chỉnh điểm của học viên và cập nhật lại thứ hạng
 */
export function adjustPlayerScore(playerId: string, deltaPoints: number): Player | null {
  const all = getStoredPlayers();
  const player = all.find((p) => p.id === playerId);
  if (!player) return null;

  const newPoints = Math.max(0, player.points + deltaPoints);
  player.points = newPoints;
  if (deltaPoints > 0) {
    player.rankChange = 'up';
    player.changeAmount = Math.abs(Math.round(deltaPoints / 100)) + 1;
  } else if (deltaPoints < 0) {
    player.rankChange = 'down';
    player.changeAmount = Math.abs(Math.round(deltaPoints / 100)) + 1;
  }

  // Sắp xếp lại theo điểm giảm dần
  all.sort((a, b) => b.points - a.points);
  saveStoredPlayers(all);
  return player;
}

/**
 * Tổng kết mùa giải: Chốt điểm, trao danh hiệu, lưu vào lịch sử
 */
export function finalizeSeason(seasonId: string, achievementTitle?: string): Season | null {
  const all = getStoredSeasons();
  const season = all.find((s) => s.id === seasonId);
  if (!season) return null;

  return updateSeason(seasonId, {
    status: 'completed',
    progress: 1,
    achievement: achievementTitle || season.achievement || 'Chiến binh xuất sắc',
  });
}

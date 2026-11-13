import {
  type Challenge,
  type Difficulty,
  type Player,
  type Reward,
  type Season,
  type UserAchievement,
} from './types';

// --- Helpers ---------------------------------------------------------------

const VI_NAMES = [
  'Nguyễn Minh Anh',
  'Trần Quốc Bảo',
  'Lê Thị Hương',
  'Phạm Hoàng Long',
  'Vũ Thu Hà',
  'Đặng Gia Huy',
  'Bùi Tiến Dũng',
  'Hồ Thị Mai',
  'Ngô Phúc Khang',
  'Dương Quỳnh Như',
  'Lý Thế Anh',
  'Đoàn Mỹ Linh',
  'Vương Hữu Phúc',
  'Phan Khánh Vy',
  'Trịnh Thanh Tú',
  'Tăng Đắc Trí',
  'Lâm Bảo Trâm',
  'Mai Văn Tuấn',
  'Chu Diễm Hằng',
  'Lương Anh Khoa',
  'Tô Như Quỳnh',
  'Kiều Đăng Khoa',
  'Sa Hoàng Yến',
  'Đinh Trọng Nhân',
  'Khúc Gia Hân',
  'Tạ Minh Khôi',
  'Vi Thị Phương',
  'Lục Hoàng Nam',
  'Giang Tử Lâm',
  'Sử Bích Ngọc',
  'Cao Thiên Phú',
  'Đinh Khánh Linh',
  'Âu Dương Vũ',
  'Ninh Đức Phát',
  'Tô Hoàng Oanh',
  'Lã Quốc Bảo',
  'Kiều Thị Thảo',
  'Mạc Trí Dũng',
  'Phí Tuấn Kiệt',
  'Sầm Bảo Châu',
];

const TOPICS = ['Mảng', 'Chuỗi', 'Sắp xếp', 'Đệ quy', 'Đồ thị', 'Quy hoạch động', 'Cây', 'Hàm'];

// Deterministic pseudo-random so the data is stable across reloads.
function seeded(n: number): number {
  const x = Math.sin(n * 99.13) * 43758.5453;
  return x - Math.floor(x);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function avatarSeed(name: string): string {
  return name
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    .toString(36);
}

function rankChange(i: number): 'up' | 'down' | 'same' {
  const r = seeded(i * 3.7);
  if (r < 0.45) return 'up';
  if (r < 0.78) return 'down';
  return 'same';
}

// --- Players ---------------------------------------------------------------

export const CURRENT_USER_ID = 'u-7';

function buildPlayers(): Player[] {
  return VI_NAMES.map((name, i) => {
    const base = 6850 - i * 78;
    const jitter = Math.round(seeded(i + 1) * 64);
    const points = Math.max(120, base - jitter);
    const completed = 62 - Math.round(seeded(i + 5) * 34) + (i < 3 ? 5 : 0);
    const submissions = completed + Math.round(seeded(i + 9) * 90) + 20;
    // Trung bình 14–30 phút cho mỗi bài hoàn thành
    const totalTimeMinutes = Math.round(Math.max(4, completed) * (14 + seeded(i + 17) * 16));
    return {
      id: `u-${i}`,
      name,
      avatarSeed: avatarSeed(name),
      initials: initials(name),
      points,
      completed: Math.max(4, completed),
      submissions,
      totalTimeMinutes,
      rankChange: rankChange(i),
      changeAmount: Math.round(seeded(i + 13) * 6) + 1,
      isCurrentUser: name === 'Đặng Gia Huy',
    };
  });
}

export const players: Player[] = buildPlayers();

// Mark the current user explicitly (independent of name matches above).
players.forEach((p) => (p.isCurrentUser = p.id === CURRENT_USER_ID));

// --- Season ----------------------------------------------------------------

const now = Date.now();
const DAY = 86_400_000;

export const seasons: Season[] = [
  {
    id: 's4',
    name: 'Code Warriors - Mùa 04',
    status: 'active',
    startDate: new Date(now - 18 * DAY).toISOString(),
    endDate: new Date(now + 23 * DAY).toISOString(),
    participants: 12480,
    userPoints: 5840,
    userRank: 7,
    progress: 0.44,
    rewards: [
      { position: 1, title: 'Vô địch mùa giải', desc: 'Cúp Code Warriors + 3.000.000đ + Học bổng 6 tháng' },
      { position: 2, title: 'Á quân', desc: 'Huy chương bạc + 2.000.000đ + Học bổng 3 tháng' },
      { position: 3, title: 'Hạng ba', desc: 'Huy chương đồng + 1.000.000đ + Voucher khóa học' },
    ],
  },
  {
    id: 's3',
    name: 'Algorithm Masters - Mùa 03',
    status: 'completed',
    startDate: new Date(now - 80 * DAY).toISOString(),
    endDate: new Date(now - 38 * DAY).toISOString(),
    participants: 9320,
    userPoints: 4610,
    userRank: 14,
    progress: 1,
    achievement: 'Algorithm Expert',
    rewards: [
      { position: 1, title: 'Vô địch mùa giải', desc: 'Cúp Algorithm Masters + 2.500.000đ' },
      { position: 2, title: 'Á quân', desc: 'Huy chương bạc + 1.500.000đ' },
      { position: 3, title: 'Hạng ba', desc: 'Huy chương đồng + 800.000đ' },
    ],
  },
  {
    id: 's2',
    name: 'Data Structure Cup - Mùa 02',
    status: 'completed',
    startDate: new Date(now - 140 * DAY).toISOString(),
    endDate: new Date(now - 100 * DAY).toISOString(),
    participants: 7840,
    userPoints: 3920,
    userRank: 22,
    progress: 1,
    achievement: 'Rising Star',
    rewards: [
      { position: 1, title: 'Vô địch mùa giải', desc: 'Cúp Data Structure + 2.000.000đ' },
      { position: 2, title: 'Á quân', desc: 'Huy chương bạc + 1.200.000đ' },
      { position: 3, title: 'Hạng ba', desc: 'Huy chương đồng + 600.000đ' },
    ],
  },
  {
    id: 's5',
    name: 'Code Legends - Mùa 05',
    status: 'upcoming',
    startDate: new Date(now + 28 * DAY).toISOString(),
    endDate: new Date(now + 84 * DAY).toISOString(),
    participants: 0,
    userPoints: 0,
    userRank: 0,
    progress: 0,
    rewards: [
      { position: 1, title: 'Vô địch mùa giải', desc: 'Cúp Code Legends + 4.000.000đ + Học bổng 12 tháng' },
      { position: 2, title: 'Á quân', desc: 'Huy chương bạc + 2.500.000đ' },
      { position: 3, title: 'Hạng ba', desc: 'Huy chương đồng + 1.500.000đ' },
    ],
  },
];

export const activeSeason: Season = seasons[0];
export const upcomingSeason: Season = seasons[3];

// --- Challenges ------------------------------------------------------------

export const challenges: Challenge[] = [
  {
    id: 'c1',
    title: 'Tổng cặp số đôi bằng K',
    difficulty: 'beginner',
    topic: 'Mảng',
    points: 120,
    status: 'completed',
    acceptedRate: 0.78,
    solveTime: 9,
  },
  {
    id: 'c2',
    title: 'Chuẩn hóa chuỗi văn bản',
    difficulty: 'basic',
    topic: 'Chuỗi',
    points: 100,
    status: 'completed',
    acceptedRate: 0.85,
    solveTime: 7,
  },
  {
    id: 'c3',
    title: 'Sắp xếp stable theo tần suất',
    difficulty: 'intermediate',
    topic: 'Sắp xếp',
    points: 260,
    status: 'in_progress',
    acceptedRate: 0.54,
    solveTime: 22,
  },
  {
    id: 'c4',
    title: 'Đếm số đảo ngược trong mảng',
    difficulty: 'intermediate',
    topic: 'Mảng',
    points: 320,
    status: 'in_progress',
    acceptedRate: 0.47,
    solveTime: 30,
  },
  {
    id: 'c5',
    title: 'Dãy con tăng dài nhất (LIS)',
    difficulty: 'advanced',
    topic: 'Quy hoạch động',
    points: 540,
    status: 'not_started',
    acceptedRate: 0.31,
    solveTime: 48,
  },
  {
    id: 'c6',
    title: 'Duyệt đồ thị BFS ngắn nhất',
    difficulty: 'advanced',
    topic: 'Đồ thị',
    points: 380,
    status: 'not_started',
    acceptedRate: 0.5,
    solveTime: 35,
  },
  {
    id: 'c7',
    title: 'Hoán vị chuỗi có điều kiện',
    difficulty: 'expert',
    topic: 'Đệ quy',
    points: 620,
    status: 'not_started',
    acceptedRate: 0.27,
    solveTime: 55,
  },
  {
    id: 'c8',
    title: 'Cây phân đoạn - truy vấn khoảng',
    difficulty: 'expert',
    topic: 'Cây',
    points: 700,
    status: 'not_started',
    acceptedRate: 0.22,
    solveTime: 60,
  },
  {
    id: 'c9',
    title: 'Xây dựng hàm toán học tổ hợp',
    difficulty: 'beginner',
    topic: 'Hàm',
    points: 90,
    status: 'completed',
    acceptedRate: 0.9,
    solveTime: 6,
  },
];

// --- Achievements ----------------------------------------------------------

export const achievements: UserAchievement[] = [
  {
    id: 'a1',
    title: 'Code Master',
    desc: 'Hoàn thành 100 bài khó trong sự nghiệp',
    icon: 'crown',
    earned: true,
    date: '15/09/2026',
    rarity: 'legendary',
  },
  {
    id: 'a2',
    title: 'Algorithm Expert',
    desc: 'Lọt Top 15 mùa Algorithm Masters',
    icon: 'brain',
    earned: true,
    date: '22/08/2026',
    rarity: 'epic',
  },
  {
    id: 'a3',
    title: 'Rising Star',
    desc: 'Tăng 20 hạng trong một mùa giải',
    icon: 'rocket',
    earned: true,
    date: '02/07/2026',
    rarity: 'rare',
  },
  {
    id: 'a4',
    title: 'Streak Warrior',
    desc: 'Giải bài liên tục 30 ngày',
    icon: 'flame',
    earned: true,
    date: '10/10/2026',
    rarity: 'rare',
  },
  {
    id: 'a5',
    title: 'Speed Coder',
    desc: 'Giải bài Hard dưới 15 phút',
    icon: 'zap',
    earned: false,
    date: '',
    rarity: 'epic',
  },
  {
    id: 'a6',
    title: 'Grand Champion',
    desc: 'Vô địch một mùa giải chính thức',
    icon: 'trophy',
    earned: false,
    date: '',
    rarity: 'legendary',
  },
];

export const rewardList: Reward[] = activeSeason.rewards;

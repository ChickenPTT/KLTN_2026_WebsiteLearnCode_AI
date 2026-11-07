import { useState, useMemo, useEffect } from 'react';
import {
  Trophy,
  Award,
  Crown,
  Medal,
  Calendar,
  Users,
  Search,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  Eye,
  SlidersHorizontal,
  Flame,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  History,
  X,
  Play,
  Check,
  BarChart2,
  PieChart,
  HelpCircle,
  Lightbulb,
  MoreHorizontal,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import type { LeagueSubTab } from './admin.types';
import type { Season, SeasonStatus, Player } from '@/pages/user/league/types';
import {
  getStoredSeasons,
  saveStoredSeasons,
  createSeason,
  updateSeason,
  deleteSeason,
  changeSeasonStatus,
  getStoredPlayers,
  adjustPlayerScore,
  finalizeSeason,
} from '@/lib/leagueService';
import { Pagination } from '@/components/Pagination';
import { formatNumber } from '@/pages/user/league/utils';
import { AdminSeasonConfigPage } from './AdminSeasonConfigPage';

export interface AdminLeagueTabProps {
  activeSubTab?: LeagueSubTab;
  onSubTabChange?: (subTab: LeagueSubTab) => void;
  seasonConfigMode?: 'none' | 'edit' | 'view';
  seasonId?: string;
  onSeasonNavigate?: (mode: 'none' | 'edit' | 'view', seasonId?: string) => void;
  onLogActivity?: (action: 'CREATE' | 'UPDATE' | 'DELETE' | 'TOGGLE', target: string) => void;
}

export function AdminLeagueTab({
  activeSubTab: controlledSubTab,
  onSubTabChange,
  seasonConfigMode: controlledSeasonConfigMode,
  seasonId: controlledSeasonId,
  onSeasonNavigate,
  onLogActivity,
}: AdminLeagueTabProps) {
  // Determine if this component is "controlled" for sub-tab & season navigation
  const isSubTabControlled = controlledSubTab !== undefined;
  const isSeasonControlled = controlledSeasonConfigMode !== undefined;

  // Internal states – always maintained so component works standalone too
  const [internalSubTab, setInternalSubTab] = useState<LeagueSubTab>(controlledSubTab ?? 'overview');
  const [internalSeasonConfigMode, setInternalSeasonConfigMode] = useState<'none' | 'edit' | 'view'>(controlledSeasonConfigMode ?? 'none');
  const [internalSeasonId, setInternalSeasonId] = useState<string | undefined>(controlledSeasonId);

  // Sync internal state whenever controlled props change (e.g. browser Back/Forward)
  useEffect(() => {
    if (controlledSubTab !== undefined) {
      setInternalSubTab(controlledSubTab);
    }
  }, [controlledSubTab]);

  useEffect(() => {
    if (controlledSeasonConfigMode !== undefined) {
      setInternalSeasonConfigMode(controlledSeasonConfigMode);
    }
  }, [controlledSeasonConfigMode]);

  useEffect(() => {
    setInternalSeasonId(controlledSeasonId);
  }, [controlledSeasonId]);

  // Effective values used for rendering
  const activeSubTab: LeagueSubTab = isSubTabControlled ? controlledSubTab! : internalSubTab;
  const seasonConfigMode: 'none' | 'edit' | 'view' = isSeasonControlled
    ? controlledSeasonConfigMode!
    : internalSeasonConfigMode;
  const activeSeasonId: string | undefined = isSeasonControlled
    ? controlledSeasonId
    : internalSeasonId;

  // Central navigation for season config/view
  const navigateSeason = (mode: 'none' | 'edit' | 'view', targetSeasonId?: string) => {
    // Always update internal as local fallback
    setInternalSeasonConfigMode(mode);
    setInternalSeasonId(mode === 'none' ? undefined : targetSeasonId);
    // Propagate to parent (App) if controlled
    if (onSeasonNavigate) {
      onSeasonNavigate(mode, mode === 'none' ? undefined : targetSeasonId);
    }
  };

  // Central navigation for sub-tabs
  const handleSubTabSwitch = (tab: LeagueSubTab) => {
    setInternalSubTab(tab);
    setInternalSeasonConfigMode('none');
    setInternalSeasonId(undefined);
    onSubTabChange?.(tab);
    if (onSeasonNavigate) {
      onSeasonNavigate('none');
    }
  };

  // Core Data States
  const [seasons, setSeasons] = useState<Season[]>(() => {
    const list = getStoredSeasons();
    // Ensure standard Code Warriors naming if starting empty
    if (!list.find((s) => s.name.includes('Mùa 04'))) {
      return [
        {
          id: 's4',
          name: 'Code Warriors - Mùa 04',
          status: 'active',
          startDate: '2026-10-19T00:00:00.000Z',
          endDate: '2026-11-29T23:59:59.000Z',
          participants: 12480,
          userPoints: 5840,
          userRank: 7,
          progress: 0.44,
          rewards: [],
        },
        {
          id: 's3',
          name: 'Code Warriors - Mùa 03',
          status: 'completed',
          startDate: '2025-09-01T00:00:00.000Z',
          endDate: '2025-09-30T23:59:59.000Z',
          participants: 10250,
          userPoints: 4610,
          userRank: 14,
          progress: 1,
          rewards: [],
        },
        {
          id: 's2',
          name: 'Code Warriors - Mùa 02',
          status: 'completed',
          startDate: '2024-09-01T00:00:00.000Z',
          endDate: '2024-09-30T23:59:59.000Z',
          participants: 8420,
          userPoints: 3920,
          userRank: 22,
          progress: 1,
          rewards: [],
        },
        {
          id: 's1',
          name: 'Code Warriors - Mùa 01',
          status: 'completed',
          startDate: '2023-09-01T00:00:00.000Z',
          endDate: '2023-09-30T23:59:59.000Z',
          participants: 7120,
          userPoints: 3100,
          userRank: 35,
          progress: 1,
          rewards: [],
        },
      ];
    }
    return list;
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    const list = getStoredPlayers();
    if (list.length > 0) return list;
    return [
      {
        id: 'p1',
        rank: 1,
        name: 'Nguyễn Minh Anh',
        avatarSeed: 'seed-p1',
        initials: 'MA',
        points: 9876,
        completed: 142,
        submissions: 168,
        rankChange: 'same',
        changeAmount: 0,
        isCurrentUser: false,
        streak: 15,
        solvedProblems: [],
      },
      {
        id: 'p2',
        rank: 2,
        name: 'Trần Quốc Bảo',
        avatarSeed: 'seed-p2',
        initials: 'QB',
        points: 9742,
        completed: 138,
        submissions: 165,
        rankChange: 'up',
        changeAmount: 1,
        isCurrentUser: false,
        streak: 12,
        solvedProblems: [],
      },
      {
        id: 'p3',
        rank: 3,
        name: 'Lê Thị Hương',
        avatarSeed: 'seed-p3',
        initials: 'TH',
        points: 9650,
        completed: 135,
        submissions: 159,
        rankChange: 'down',
        changeAmount: 1,
        isCurrentUser: false,
        streak: 9,
        solvedProblems: [],
      },
      {
        id: 'p4',
        rank: 4,
        name: 'Phạm Văn Duy',
        avatarSeed: 'seed-p4',
        initials: 'VD',
        points: 9534,
        completed: 130,
        submissions: 154,
        rankChange: 'up',
        changeAmount: 2,
        isCurrentUser: false,
        streak: 8,
        solvedProblems: [],
      },
      {
        id: 'p5',
        rank: 5,
        name: 'Hoàng Minh Đức',
        avatarSeed: 'seed-p5',
        initials: 'MD',
        points: 9420,
        completed: 127,
        submissions: 150,
        rankChange: 'same',
        changeAmount: 0,
        isCurrentUser: false,
        streak: 6,
        solvedProblems: [],
      },
    ];
  });

  // Listen for background updates
  useEffect(() => {
    const handleSync = () => {
      setSeasons(getStoredSeasons());
      setPlayers(getStoredPlayers());
    };
    window.addEventListener('league_data_changed', handleSync);
    return () => window.removeEventListener('league_data_changed', handleSync);
  }, []);

  // Active season
  const activeSeason = seasons.find((s) => s.status === 'active') || seasons[0];

  // Toast notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // ─────────────────────────────────────────────────────────────
  // SEASON CONFIGURATION & VIEW STATES (Screen 2)
  // ─────────────────────────────────────────────────────────────
  const currentConfigSeason = useMemo(() => {
    if (!activeSeasonId || activeSeasonId === 'new') return null;
    return seasons.find((s) => s.id === activeSeasonId) || null;
  }, [activeSeasonId, seasons]);

  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [seasonNameInput, setSeasonNameInput] = useState('');
  const [seasonStatusInput, setSeasonStatusInput] = useState<SeasonStatus>('upcoming');
  const [seasonStartInput, setSeasonStartInput] = useState('');
  const [seasonEndInput, setSeasonEndInput] = useState('');
  const [seasonParticipantsInput, setSeasonParticipantsInput] = useState<number>(0);

  const openCreateSeasonModal = () => {
  setEditingSeason(null);
  setSeasonNameInput('');
  setSeasonStatusInput('upcoming');
  setSeasonStartInput('');
  setSeasonEndInput('');
  setShowSeasonModal(true);
};

  const openEditSeasonModal = (s: Season) => {
    navigateSeason('edit', s.id);
  };

  const openViewSeasonPage = (s: Season) => {
    navigateSeason('view', s.id);
  };

  const handleSaveSeason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seasonNameInput.trim()) {
      showToast('Vui lòng nhập tên mùa giải', 'error');
      return;
    }
    if (!editingSeason) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startDate = new Date(`${seasonStartInput}T00:00:00`);
      const endDate = new Date(`${seasonEndInput}T00:00:00`);

      if (startDate <= today) {
        showToast('Ngày bắt đầu phải lớn hơn ngày hiện tại', 'error');
        return;
      }

      if (endDate < startDate) {
        showToast('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu', 'error');
        return;
      }
    }
    if (editingSeason) {
      const updated = updateSeason(editingSeason.id, {
        name: seasonNameInput.trim(),
        status: 'upcoming',
        startDate: seasonStartInput ? new Date(seasonStartInput).toISOString() : editingSeason.startDate,
        endDate: seasonEndInput ? new Date(seasonEndInput).toISOString() : editingSeason.endDate,
        participants: seasonParticipantsInput,
      });
      if (updated) {
        setSeasons(getStoredSeasons());
        showToast(`Đã cập nhật "${updated.name}"`);
        onLogActivity?.('UPDATE', `Cập nhật mùa giải: ${updated.name}`);
      }
    } else {
      const created = createSeason({
        name: seasonNameInput.trim(),
        status: seasonStatusInput,
        startDate: new Date(seasonStartInput || Date.now()).toISOString(),
        endDate: new Date(seasonEndInput || Date.now() + 30 * 86400000).toISOString(),
        participants: seasonParticipantsInput,
        userPoints: 0,
        userRank: 0,
      });
      setSeasons(getStoredSeasons());
      showToast(`Đã tạo mùa giải "${created.name}"`);
      onLogActivity?.('CREATE', `Tạo mùa giải mới: ${created.name}`);
    }
    setShowSeasonModal(false);
  };

  const handleDeleteSeason = (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mùa giải "${name}" không?`)) return;
    deleteSeason(id);
    setSeasons(getStoredSeasons());
    showToast(`Đã xóa mùa giải "${name}"`);
    onLogActivity?.('DELETE', `Xóa mùa giải: ${name}`);
  };

  // ─────────────────────────────────────────────────────────────
  // LEADERBOARD TAB FILTERS (Screen 4)
  // ─────────────────────────────────────────────────────────────
  const [selectedLeaderboardSeason, setSelectedLeaderboardSeason] = useState(
    activeSeason?.name || 'Code Warriors - Mùa 04',
  );
  const [leaderboardFilterType, setLeaderboardFilterType] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [leaderboardPage, setLeaderboardPage] = useState(1);

  // ─────────────────────────────────────────────────────────────
  // SUMMARY TAB STATES (Screen 5)
  // ─────────────────────────────────────────────────────────────
  const [selectedSummarySeason, setSelectedSummarySeason] = useState(
    seasons.find((s) => s.status === 'completed')?.name || 'Code Warriors - Mùa 03',
  );
  const [summaryViewTab, setSummaryViewTab] = useState<'overview' | 'details' | 'charts'>('overview');

  // Chart range toggle for Screen 1 Overview
  const [chartRange, setChartRange] = useState<'7d' | '30d' | '3m'>('7d');

  // Render helpers
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '---';
    try {
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="admin-league-tab space-y-6 text-slate-100">
      {/* ── NOTIFICATION TOAST ── */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-2xl transition-all duration-300 ${
            notification.type === 'success'
              ? 'border border-emerald-500/30 bg-emerald-950/90 text-emerald-200'
              : 'border border-rose-500/30 bg-rose-950/90 text-rose-200'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          SCREEN 1: TỔNG QUAN (OVERVIEW)
          ═════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <TrendingUp size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Tổng quan</h1>
              <p className="text-sm text-slate-400">Theo dõi tình hình hoạt động của mùa giải đang diễn ra</p>
            </div>
          </div>

          {/* Middle Row: Active Season Purple Card (Left) + Participants Chart (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Active Season Card */}
            <div className="admin-league-hero-card lg:col-span-5 rounded-2xl bg-gradient-to-br from-[#4c1d95] via-[#3b1d7d] to-[#1e144a] border border-violet-500/30 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
              {/* Background ambient lighting */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Đang diễn ra
                </div>

                <h3 className="text-2xl font-bold text-white mt-3">{activeSeason?.name || 'Code Warriors - Mùa 04'}</h3>

                <div className="space-y-2 mt-4 text-sm text-purple-200/90 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-purple-300" />
                    <span>19/10/2026 – 29/11/2026</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-purple-300" />
                    <span>{formatNumber(activeSeason?.participants || 12480)} thí sinh tham gia</span>
                  </div>
                </div>
              </div>

              {/* Bottom Progress Bar + Trophy Illustration */}
              <div className="mt-6 flex items-end justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-purple-200 mb-1.5">
                    <span>Tiến độ mùa giải</span>
                    <span className="text-white font-bold">44%</span>
                  </div>
                  <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-purple-400/20">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-300 shadow-md shadow-violet-500/50 transition-all duration-500"
                      style={{ width: '44%' }}
                    />
                  </div>
                </div>

                {/* 3D Glowing Trophy Vector */}
                <div className="relative flex-shrink-0 -mb-2">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-600/30 blur-md absolute inset-0" />
                  <div className="relative flex items-center justify-center w-20 h-20">
                    <Trophy size={48} className="text-amber-300 drop-shadow-[0_0_15px_rgba(252,211,77,0.6)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive SVG Chart Card */}
            <div className="lg:col-span-7 rounded-2xl border border-[#232b3e] bg-[#121622] p-6 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-violet-400" />
                  <span className="font-bold text-white text-base">Biểu đồ thí sinh tham gia</span>
                </div>

                {/* Time filter buttons */}
                <div className="flex items-center gap-1 bg-[#1a2030] p-1 rounded-xl border border-[#2a344a]">
                  <button
                    onClick={() => setChartRange('7d')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      chartRange === '7d'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    7 ngày
                  </button>
                  <button
                    onClick={() => setChartRange('30d')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      chartRange === '30d'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    30 ngày
                  </button>
                  <button
                    onClick={() => setChartRange('3m')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      chartRange === '3m'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    3 tháng
                  </button>
                </div>
              </div>

              {/* Responsive SVG Curve Chart */}
              <div className="relative w-full h-44 mt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 520 160">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Y-axis guidelines */}
                  <line x1="30" y1="20" x2="510" y2="20" stroke="#1f293d" strokeDasharray="4 4" />
                  <line x1="30" y1="60" x2="510" y2="60" stroke="#1f293d" strokeDasharray="4 4" />
                  <line x1="30" y1="100" x2="510" y2="100" stroke="#1f293d" strokeDasharray="4 4" />
                  <line x1="30" y1="140" x2="510" y2="140" stroke="#1f293d" />

                  {/* Y labels */}
                  <text x="15" y="24" fill="#64748b" fontSize="10" textAnchor="end">6k</text>
                  <text x="15" y="64" fill="#64748b" fontSize="10" textAnchor="end">4k</text>
                  <text x="15" y="104" fill="#64748b" fontSize="10" textAnchor="end">2k</text>
                  <text x="15" y="144" fill="#64748b" fontSize="10" textAnchor="end">0</text>

                  {/* Area fill */}
                  <path
                    d="M 50 115 C 100 100, 140 105, 190 92 C 240 80, 270 45, 330 40 C 390 35, 430 65, 490 62 L 490 140 L 50 140 Z"
                    fill="url(#chartGradient)"
                  />

                  {/* Smooth curved line */}
                  <path
                    d="M 50 115 C 100 100, 140 105, 190 92 C 240 80, 270 45, 330 40 C 390 35, 430 65, 490 62"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Data Points */}
                  {[
                    { cx: 50, cy: 115, date: '19/10', val: '1.8k' },
                    { cx: 120, cy: 104, date: '20/10', val: '2.4k' },
                    { cx: 190, cy: 92, date: '21/10', val: '3.1k' },
                    { cx: 260, cy: 68, date: '22/10', val: '4.2k' },
                    { cx: 330, cy: 40, date: '23/10', val: '5.6k' },
                    { cx: 410, cy: 55, date: '24/10', val: '4.9k' },
                    { cx: 490, cy: 62, date: '25/10', val: '4.7k' },
                  ].map((pt, idx) => (
                    <g key={idx} className="group cursor-pointer">
                      <circle cx={pt.cx} cy={pt.cy} r="4.5" fill="#a855f7" stroke="#ffffff" strokeWidth="2" />
                      <text x={pt.cx} y="156" fill="#94a3b8" fontSize="10" textAnchor="middle">
                        {pt.date}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom Row: 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Column 1: Top 5 thí sinh hiện tại */}
            <div className="rounded-2xl border border-[#232b3e] bg-[#121622] p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1f283b] mb-3">
                  <h4 className="font-bold text-white text-sm">Top 5 thí sinh hiện tại</h4>
                  <button
                    onClick={() => handleSubTabSwitch('leaderboard')}
                    className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    Xem bảng xếp hạng →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {/* Rank 1 */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#171d2c] border border-[#232b3e]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      <span className="text-xs font-semibold text-white truncate">Nguyễn Minh Anh</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded">
                        Vô địch
                      </span>
                    </div>
                  </div>

                  {/* Rank 2 */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#171d2c] border border-[#232b3e]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <span className="text-xs font-semibold text-white truncate">Trần Quốc Bảo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                        Á quân
                      </span>
                    </div>
                  </div>

                  {/* Rank 3 */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#171d2c] border border-[#232b3e]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <span className="text-xs font-semibold text-white truncate">Lê Thị Hương</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-orange-300 bg-orange-500/15 border border-orange-500/30 px-1.5 py-0.5 rounded">
                        Hạng 3
                      </span>
                    </div>
                  </div>

                  {/* Rank 4 */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#171d2c] border border-[#232b3e]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold">
                        4
                      </span>
                      <span className="text-xs font-semibold text-white truncate">Phạm Văn Duy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        Hạng 4
                      </span>
                    </div>
                  </div>

                  {/* Rank 5 */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#171d2c] border border-[#232b3e]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold">
                        5
                      </span>
                      <span className="text-xs font-semibold text-white truncate">Hoàng Minh Đức</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        Hạng 5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Thao tác nhanh */}
            <div className="rounded-2xl border border-[#232b3e] bg-[#121622] p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
              {/* Bottom stylized mountain silhouette */}
              <div className="absolute -bottom-6 -right-6 w-36 h-36 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="pb-3 border-b border-[#1f283b] mb-3">
                  <h4 className="font-bold text-white text-sm">Thao tác nhanh</h4>
                </div>

                <div className="space-y-2.5 relative z-10">
                  <button
                    onClick={openCreateSeasonModal}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[#171d2c] hover:bg-[#20283d] border border-[#232b3e] transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Calendar size={16} />
                      </div>
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-white">Tạo mùa giải mới</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    onClick={() => handleSubTabSwitch('leaderboard')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[#171d2c] hover:bg-[#20283d] border border-[#232b3e] transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Trophy size={16} />
                      </div>
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-white">Cập nhật bảng xếp hạng</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    onClick={() => handleSubTabSwitch('summary')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[#171d2c] hover:bg-[#20283d] border border-[#232b3e] transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BarChart2 size={16} />
                      </div>
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-white">Xem tổng kết mùa giải</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          SCREEN 2: QUẢN LÝ MÙA GIẢI (SEASONS)
          ═════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'seasons' && (
        seasonConfigMode !== 'none' ? (
          <AdminSeasonConfigPage
            season={currentConfigSeason}
            isReadOnly={seasonConfigMode === 'view'}
            onBack={() => {
              navigateSeason('none');
            }}
            onSaveSeason={(data) => {
              if (currentConfigSeason) {
                const updated = updateSeason(currentConfigSeason.id, {
                  name: data.name,
                  startDate: data.startDate,
                  endDate: data.endDate,
                  status: data.status,
                });
                if (updated) {
                  setSeasons(getStoredSeasons());
                  showToast(`Đã cập nhật cấu hình "${updated.name}" thành công`);
                  onLogActivity?.('UPDATE', `Cấu hình mùa giải: ${updated.name}`);
                }
              } else {
                const created = createSeason({
                  name: data.name,
                  startDate: data.startDate,
                  endDate: data.endDate,
                  status: data.status,
                  participants: 0,
                  userPoints: 0,
                  userRank: 0,
                });
                setSeasons(getStoredSeasons());
                showToast(`Đã tạo mùa giải mới "${created.name}" thành công`);
                onLogActivity?.('CREATE', `Tạo mùa giải mới: ${created.name}`);
              }
              navigateSeason('none');
            }}
            onLogActivity={onLogActivity}
          />
        ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                <Calendar size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Quản lý mùa giải</h1>
                <p className="text-sm text-slate-400">Tạo, chỉnh sửa và quản lý các mùa giải</p>
              </div>
            </div>

            <button
              onClick={openCreateSeasonModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 transition-all hover:shadow-violet-600/50"
            >
              <Plus size={16} />
              Tạo mùa giải mới
            </button>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl border border-[#232b3e] bg-[#121622] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#232b3e] bg-[#181f2f]/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Tên mùa giải</th>
                    <th className="py-3.5 px-4">Thời gian diễn ra</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4">Thí sinh</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f283b]">
                  {seasons.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-[#181f2e]/60 transition-colors">
                      <td className="py-4 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-4 px-4 font-bold text-white">{s.name}</td>
                      <td className="py-4 px-4 text-slate-300">
                        {formatDateDisplay(s.startDate)} - {formatDateDisplay(s.endDate)}
                      </td>
                      <td className="py-4 px-4">
                        {s.status === 'active' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Đang diễn ra
                          </span>
                        ) : s.status === 'upcoming' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Sắp diễn ra
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-300 border border-slate-600/40">
                            Đã kết thúc
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-200">
                        {formatNumber(s.participants || 0)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEditSeasonModal(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-violet-300 hover:bg-violet-600/20 border border-violet-500/30 transition-all"
                          >
                            <Edit3 size={13} />
                            Cấu hình mùa giải
                          </button>
                          <button
                            onClick={() => openViewSeasonPage(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-700/50 border border-slate-600/30 transition-all"
                          >
                            <Eye size={13} />
                            Xem
                          </button>
                          <button
                            onClick={() => handleDeleteSeason(s.id, s.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                            title="Xóa mùa giải"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#232b3e] bg-[#141a27]">
              <div className="text-xs text-slate-400">
                Hiển thị <span className="text-white font-semibold">1 - {seasons.length}</span> trên <span className="text-white font-semibold">{seasons.length}</span> mùa giải
              </div>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg border border-[#232b3e] text-slate-400 hover:text-white flex items-center justify-center text-xs">
                  <ChevronLeft size={14} />
                </button>
                <button className="w-8 h-8 rounded-lg bg-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                  1
                </button>
                <button className="w-8 h-8 rounded-lg border border-[#232b3e] text-slate-400 hover:text-white flex items-center justify-center text-xs">
                  2
                </button>
                <button className="w-8 h-8 rounded-lg border border-[#232b3e] text-slate-400 hover:text-white flex items-center justify-center text-xs">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Tip Banner matching Screen 2 */}
          <div className="admin-league-tip-banner rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 via-[#1e1a38] to-[#121622] p-5 shadow-lg flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center flex-shrink-0">
                <Lightbulb size={22} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Mẹo quản lý</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Bạn có thể chỉnh sửa thông tin mùa giải hoặc xem chi tiết thống kê tại mỗi mùa giải.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-violet-300 opacity-80">
              <Calendar size={28} />
              <Clock size={22} className="-ml-3 mt-2 text-indigo-400" />
            </div>
          </div>
        </div>
        )
      )}

      {/* ═════════════════════════════════════════════════════════════
          SCREEN 3: QUẢN LÝ BẢNG XẾP HẠNG (LEADERBOARD)
          ═════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Trophy size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Quản lý bảng xếp hạng</h1>
              <p className="text-sm text-slate-400">Theo dõi và quản lý bảng xếp hạng của các mùa giải</p>
            </div>
          </div>

          {/* 2-Column Layout matching Screen 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Sidebar (Season selector + 3 tabs) */}
            <div className="lg:col-span-4 rounded-2xl border border-[#232b3e] bg-[#121622] p-5 shadow-lg space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Chọn mùa giải
                </label>
                <div className="relative">
                  <select
                    value={selectedLeaderboardSeason}
                    onChange={(e) => setSelectedLeaderboardSeason(e.target.value)}
                    className="w-full appearance-none rounded-xl bg-[#181f2f] border border-[#29354d] px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-violet-500 pr-10 cursor-pointer"
                  >
                    {seasons.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* 3 Vertical Tabs matching Screen 4 */}
              <div className="space-y-2 pt-2 border-t border-[#1f283b]">
                <button
                  onClick={() => setLeaderboardFilterType('all')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-sm transition-all text-left ${
                    leaderboardFilterType === 'all'
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                      : 'bg-[#181f2f] text-slate-300 hover:text-white hover:bg-[#20293d]'
                  }`}
                >
                  <Trophy size={16} />
                  <span>Top 100 Tổng</span>
                </button>

                <button
                  onClick={() => setLeaderboardFilterType('weekly')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-sm transition-all text-left ${
                    leaderboardFilterType === 'weekly'
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                      : 'bg-[#181f2f] text-slate-300 hover:text-white hover:bg-[#20293d]'
                  }`}
                >
                  <Users size={16} />
                  <span>Top theo tuần</span>
                </button>

                <button
                  onClick={() => setLeaderboardFilterType('monthly')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-sm transition-all text-left ${
                    leaderboardFilterType === 'monthly'
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                      : 'bg-[#181f2f] text-slate-300 hover:text-white hover:bg-[#20293d]'
                  }`}
                >
                  <Users size={16} />
                  <span>Top theo tháng</span>
                </button>
              </div>
            </div>

            {/* Right Main Table */}
            <div className="lg:col-span-8 rounded-2xl border border-[#232b3e] bg-[#121622] overflow-hidden shadow-xl flex flex-col justify-between">
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#232b3e] bg-[#181f2f]/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-4 w-16 text-center">Hạng</th>
                        <th className="py-3.5 px-4">Thí sinh</th>
                        <th className="py-3.5 px-4">Điểm số</th>
                        <th className="py-3.5 px-4 text-right">Thời gian cập nhật</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1f283b]">
                      {players.slice(0, 5).map((p, idx) => (
                        <tr key={p.id} className="hover:bg-[#181f2e]/60 transition-colors">
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                p.rank === 1
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : p.rank === 2
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                  : p.rank === 3
                                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {p.rank}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-bold text-white flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                              {p.name.charAt(0)}
                            </div>
                            <span>{p.name}</span>
                          </td>
                          <td className="py-4 px-4 font-bold text-violet-300">
                            {p.points.toLocaleString('vi-VN')}
                          </td>
                          <td className="py-4 px-4 text-right text-xs text-slate-400">
                            25/10/2026 14:{30 - idx * 5}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination footer matching Screen 4 */}
              <div className="flex items-center justify-end px-5 py-3.5 border-t border-[#232b3e] bg-[#141a27] gap-1">
                <button className="w-8 h-8 rounded-lg border border-[#232b3e] text-slate-400 hover:text-white flex items-center justify-center text-xs">
                  <ChevronLeft size={14} />
                </button>
                <button className="w-8 h-8 rounded-lg bg-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                  1
                </button>
                <button className="w-8 h-8 rounded-lg border border-[#232b3e] text-slate-400 hover:text-white flex items-center justify-center text-xs">
                  2
                </button>
                <button className="w-8 h-8 rounded-lg border border-[#232b3e] text-slate-400 hover:text-white flex items-center justify-center text-xs">
                  3
                </button>
                <span className="text-slate-500 px-1 text-xs">...</span>
                <button className="w-8 h-8 rounded-lg border border-[#232b3e] text-slate-400 hover:text-white flex items-center justify-center text-xs">
                  10
                </button>
                <button className="w-8 h-8 rounded-lg border border-[#232b3e] text-slate-400 hover:text-white flex items-center justify-center text-xs">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          SCREEN 5: TỔNG KẾT MÙA GIẢI (SUMMARY)
          ═════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'summary' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                <BarChart2 size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Tổng kết mùa giải</h1>
                <p className="text-sm text-slate-400">Thống kê và xem kết quả các mùa giải đã kết thúc</p>
              </div>
            </div>

            {/* Season select dropdown top-right */}
            <div className="relative">
              <select
                value={selectedSummarySeason}
                onChange={(e) => setSelectedSummarySeason(e.target.value)}
                className="appearance-none rounded-xl bg-[#181f2f] border border-[#29354d] px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-violet-500 pr-10 cursor-pointer shadow-md"
              >
                {seasons
                  .filter((s) => s.status === 'completed' || s.name.includes('Mùa 03'))
                  .map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-8 border-b border-[#232b3e] pb-1">
            <button
              onClick={() => setSummaryViewTab('overview')}
              className={`pb-3 text-sm font-bold transition-all relative ${
                summaryViewTab === 'overview'
                  ? 'text-violet-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thống kê tổng quan
              {summaryViewTab === 'overview' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setSummaryViewTab('details')}
              className={`pb-3 text-sm font-bold transition-all relative ${
                summaryViewTab === 'details'
                  ? 'text-violet-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kết quả chi tiết
              {summaryViewTab === 'details' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setSummaryViewTab('charts')}
              className={`pb-3 text-sm font-bold transition-all relative ${
                summaryViewTab === 'charts'
                  ? 'text-violet-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Biểu đồ thống kê
              {summaryViewTab === 'charts' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-500 rounded-full" />
              )}
            </button>
          </div>

          {/* 3-Column Content matching Screen 5 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Card 1: Thống kê chung (Donut chart) */}
            <div className="md:col-span-4 rounded-2xl border border-[#232b3e] bg-[#121622] p-5 shadow-lg flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white text-sm mb-4">Thống kê chung</h4>

                {/* Donut Chart SVG */}
                <div className="relative flex items-center justify-center my-4">
                  <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      stroke="#ec4899"
                      strokeWidth="14"
                      fill="none"
                      opacity="0.9"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      stroke="#8b5cf6"
                      strokeWidth="14"
                      fill="none"
                      strokeDasharray="301.59"
                      strokeDashoffset="54"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-extrabold text-white">10.250</span>
                    <span className="text-xs text-slate-400 font-medium">Thí sinh</span>
                  </div>
                </div>

                {/* Legend matching Screen 5 */}
                <div className="space-y-2 mt-4 pt-3 border-t border-[#1f283b] text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                      <span className="text-slate-300">Hoàn thành</span>
                    </div>
                    <span className="font-bold text-white">8.420 (82.1%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                      <span className="text-slate-300">Bỏ thi</span>
                    </div>
                    <span className="font-bold text-white">1.830 (17.9%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Thống kê theo tuần (Bar chart) */}
            <div className="md:col-span-5 rounded-2xl border border-[#232b3e] bg-[#121622] p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-white text-sm">Thống kê theo tuần</h4>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-600" />
                      <span className="text-slate-400">Tham gia</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-300" />
                      <span className="text-slate-400">Hoàn thành</span>
                    </div>
                  </div>
                </div>

                {/* Bar Chart SVG */}
                <div className="relative w-full h-44 mt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 280 140">
                    {/* Y lines */}
                    <line x1="25" y1="20" x2="275" y2="20" stroke="#1f293d" strokeDasharray="3 3" />
                    <line x1="25" y1="55" x2="275" y2="55" stroke="#1f293d" strokeDasharray="3 3" />
                    <line x1="25" y1="90" x2="275" y2="90" stroke="#1f293d" strokeDasharray="3 3" />
                    <line x1="25" y1="120" x2="275" y2="120" stroke="#1f293d" />

                    <text x="18" y="24" fill="#64748b" fontSize="9" textAnchor="end">6k</text>
                    <text x="18" y="59" fill="#64748b" fontSize="9" textAnchor="end">4k</text>
                    <text x="18" y="94" fill="#64748b" fontSize="9" textAnchor="end">2k</text>
                    <text x="18" y="124" fill="#64748b" fontSize="9" textAnchor="end">0k</text>

                    {/* Tuần 1 */}
                    <rect x="42" y="42" width="10" height="78" rx="2" fill="#7c3aed" />
                    <rect x="54" y="60" width="10" height="60" rx="2" fill="#c4b5fd" />
                    <text x="53" y="134" fill="#94a3b8" fontSize="9" textAnchor="middle">Tuần 1</text>

                    {/* Tuần 2 */}
                    <rect x="105" y="32" width="10" height="88" rx="2" fill="#7c3aed" />
                    <rect x="117" y="52" width="10" height="68" rx="2" fill="#c4b5fd" />
                    <text x="116" y="134" fill="#94a3b8" fontSize="9" textAnchor="middle">Tuần 2</text>

                    {/* Tuần 3 */}
                    <rect x="168" y="36" width="10" height="84" rx="2" fill="#7c3aed" />
                    <rect x="180" y="58" width="10" height="62" rx="2" fill="#c4b5fd" />
                    <text x="179" y="134" fill="#94a3b8" fontSize="9" textAnchor="middle">Tuần 3</text>

                    {/* Tuần 4 */}
                    <rect x="231" y="28" width="10" height="92" rx="2" fill="#7c3aed" />
                    <rect x="243" y="48" width="10" height="72" rx="2" fill="#c4b5fd" />
                    <text x="242" y="134" fill="#94a3b8" fontSize="9" textAnchor="middle">Tuần 4</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 3: Kết quả nổi bật matching Screen 5 */}
            <div className="md:col-span-3 rounded-2xl border border-[#232b3e] bg-[#121622] p-5 shadow-lg flex flex-col justify-between text-center relative overflow-hidden">
              <div className="flex flex-col items-center justify-center py-3">
                <h4 className="font-bold text-white text-sm mb-4 w-full text-left">Kết quả nổi bật</h4>

                {/* Golden Laurel Wreath + Trophy */}
                <div className="relative my-2">
                  <div className="w-24 h-24 rounded-full bg-amber-400/10 flex items-center justify-center border border-amber-400/30 shadow-lg shadow-amber-400/10">
                    <Trophy size={42} className="text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]" />
                  </div>
                </div>

                <div className="inline-block mt-3 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  Giải Nhất
                </div>

                <div className="text-base font-bold text-white mt-2">Nguyễn Minh Anh</div>
                <div className="text-xs text-slate-400 mt-1 font-semibold">Điểm số: 9.950</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: TẠO / SỬA MÙA GIẢI
          ───────────────────────────────────────────────────────────── */}
      {showSeasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="admin-league-tab-modal w-full max-w-lg rounded-2xl border border-[#2d3852] bg-[#121622] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#232b3e] pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingSeason ? 'Sửa thông tin mùa giải' : 'Tạo mùa giải mới'}
              </h3>
              <button
                onClick={() => setShowSeasonModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSeason} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tên mùa giải</label>
                <input
                  type="text"
                  required
                  value={seasonNameInput}
                  onChange={(e) => setSeasonNameInput(e.target.value)}
                  placeholder="Code Warriors - Mùa 05"
                  className="w-full rounded-xl bg-[#181f2f] border border-[#2a354b] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  required
                  min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                    .toISOString().slice(0, 10)}
                  value={seasonStartInput}
                  onChange={(e) => setSeasonStartInput(e.target.value)}
                  className="w-full rounded-xl bg-[#181f2f] border border-[#2a354b] px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />

                {!editingSeason && seasonStartInput && (() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const startDate = new Date(`${seasonStartInput}T00:00:00`);

                  return startDate <= today ? (
                    <p className="mt-1 text-xs text-red-500">
                      Ngày bắt đầu phải lớn hơn ngày hiện tại!
                    </p>
                  ) : null;
                })()}
              </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    required
                    value={seasonEndInput}
                    onChange={(e) => setSeasonEndInput(e.target.value)}
                    className="w-full rounded-xl bg-[#181f2f] border border-[#2a354b] px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {editingSeason && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Trạng thái</label>
                    <select
                      value={seasonStatusInput}
                      onChange={(e) => setSeasonStatusInput(e.target.value as SeasonStatus)}
                      className="w-full rounded-xl bg-[#181f2f] border border-[#2a354b] px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option value="upcoming">Sắp diễn ra</option>
                      <option value="active">Đang diễn ra</option>
                      <option value="completed">Đã kết thúc</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-[#232b3e]">
                <button
                  type="button"
                  onClick={() => setShowSeasonModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold shadow-lg shadow-violet-600/30"
                >
                  Lưu mùa giải
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

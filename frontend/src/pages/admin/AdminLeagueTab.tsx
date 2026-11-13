import { useState, useMemo, useEffect, useCallback } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { contestApi, formatClock, type LeaderboardRow } from '@/lib/contestApi';
import {
  adminContestApi,
  dateToEnd,
  dateToStart,
  errorText,
  toUiSeason,
  type AdminSeasonView,
} from '@/lib/adminContestApi';
import { Pagination } from '@/components/Pagination';
import { formatNumber, formatDateShort } from '@/pages/user/league/utils';
import { AdminSeasonConfigPage } from './AdminSeasonConfigPage';

export interface AdminLeagueTabProps {
  activeSubTab?: LeagueSubTab;
  onSubTabChange?: (subTab: LeagueSubTab) => void;
  seasonConfigMode?: 'none' | 'edit' | 'view';
  seasonId?: string;
  onSeasonNavigate?: (mode: 'none' | 'edit' | 'view', seasonId?: string) => void;
  onLogActivity?: (action: 'CREATE' | 'UPDATE' | 'DELETE' | 'TOGGLE', target: string) => void;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts.length === 1 ? parts[0][0] : parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Dòng bảng xếp hạng backend -> Player (points = số bài đúng; thời gian lưu ở totalTimeMinutes)
function rowToPlayer(r: LeaderboardRow): Player {
  return {
    id: String(r.userId),
    rank: r.rank,
    name: r.name,
    avatarSeed: `${r.userId}-${r.name}`,
    initials: initialsOf(r.name),
    points: r.solvedCount,
    completed: r.solvedCount,
    submissions: r.attemptsUsed,
    totalTimeMinutes: Math.round(r.totalTimeSeconds / 60),
    rankChange: 'same',
    changeAmount: 0,
    isCurrentUser: false,
    solvedProblems: [],
  };
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

  // Core Data States — dữ liệu thật từ backend (/api/admin/contest/seasons)
  const { user } = useAuth();
  const canEdit = user?.role === 'admin';
  const [seasonViews, setSeasonViews] = useState<AdminSeasonView[]>([]);
  const seasons = useMemo<Season[]>(() => seasonViews.map(toUiSeason), [seasonViews]);
  const [seasonsError, setSeasonsError] = useState<string | null>(null);

  const reloadSeasons = useCallback(async () => {
    try {
      setSeasonViews(await adminContestApi.list());
      setSeasonsError(null);
    } catch (e) {
      setSeasonsError(errorText(e, 'Không tải được danh sách mùa giải.'));
    }
  }, []);

  useEffect(() => {
    reloadSeasons();
  }, [reloadSeasons]);

  // Bảng xếp hạng thật của 1 mùa -> đổi sang kiểu Player để dùng lại giao diện
  const [players, setPlayers] = useState<Player[]>([]);
  const loadLeaderboard = useCallback(async (seasonId?: string) => {
    if (!seasonId) {
      setPlayers([]);
      return;
    }
    try {
      const rows = await contestApi.leaderboard(Number(seasonId));
      setPlayers(rows.map(rowToPlayer));
    } catch {
      setPlayers([]);
    }
  }, []);

  // Active season
  const activeSeason = seasons.find((s) => s.status === 'active') || seasons[0];
  const activeSeasonView = seasonViews.find((v) => String(v.season.id) === activeSeason?.id) ?? null;

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
  const [seasonMaxAttemptsInput, setSeasonMaxAttemptsInput] = useState<number>(3);
  const [seasonStartInput, setSeasonStartInput] = useState('');
  const [seasonEndInput, setSeasonEndInput] = useState('');
  const [seasonTimeLimitInput, setSeasonTimeLimitInput] = useState<number>(90);

  const openCreateSeasonModal = () => {
  setEditingSeason(null);
  setSeasonNameInput('');
  setSeasonMaxAttemptsInput(3);
  setSeasonTimeLimitInput(90);
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

  const handleSaveSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (!seasonNameInput.trim()) {
      showToast('Vui lòng nhập tên mùa giải', 'error');
      return;
    }
    if (!seasonStartInput || !seasonEndInput) {
      showToast('Vui lòng chọn ngày bắt đầu và ngày kết thúc', 'error');
      return;
    }
    if (seasonEndInput < seasonStartInput) {
      showToast('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu', 'error');
      return;
    }
    const payload = {
      name: seasonNameInput.trim(),
      startAt: dateToStart(seasonStartInput),
      endAt: dateToEnd(seasonEndInput),
      maxAttempts: seasonMaxAttemptsInput,
      timeLimitMinutes: seasonTimeLimitInput,
    };
    try {
      if (editingSeason) {
        await adminContestApi.update(Number(editingSeason.id), payload);
        showToast(`Đã cập nhật "${payload.name}"`);
        onLogActivity?.('UPDATE', `Cập nhật mùa giải: ${payload.name}`);
      } else {
        await adminContestApi.create(payload);
        showToast(`Đã tạo mùa giải "${payload.name}"`);
        onLogActivity?.('CREATE', `Tạo mùa giải mới: ${payload.name}`);
      }
      await reloadSeasons();
      setShowSeasonModal(false);
    } catch (err) {
      showToast(errorText(err, 'Không lưu được mùa giải.'), 'error');
    }
  };

  const handleDeleteSeason = async (id: string, name: string) => {
    if (!canEdit) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mùa giải "${name}" không?`)) return;
    try {
      await adminContestApi.remove(Number(id));
      await reloadSeasons();
      showToast(`Đã xóa mùa giải "${name}"`);
      onLogActivity?.('DELETE', `Xóa mùa giải: ${name}`);
    } catch (err) {
      showToast(errorText(err, 'Không xóa được mùa giải.'), 'error');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // LEADERBOARD TAB FILTERS (Screen 4)
  // ─────────────────────────────────────────────────────────────
  const [selectedLeaderboardSeason, setSelectedLeaderboardSeason] = useState<string>('');
  useEffect(() => {
    if (!selectedLeaderboardSeason && activeSeason) setSelectedLeaderboardSeason(activeSeason.id);
  }, [activeSeason, selectedLeaderboardSeason]);
  useEffect(() => {
    loadLeaderboard(selectedLeaderboardSeason || undefined);
  }, [selectedLeaderboardSeason, loadLeaderboard]);
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [leaderboardPage, setLeaderboardPage] = useState(1);

  // ─────────────────────────────────────────────────────────────
  // SUMMARY TAB STATES (Screen 5)
  // ─────────────────────────────────────────────────────────────
  const [selectedSummarySeason, setSelectedSummarySeason] = useState<string>('');
  const [summaryPlayers, setSummaryPlayers] = useState<Player[]>([]);
  useEffect(() => {
    if (!selectedSummarySeason && seasons.length > 0) {
      setSelectedSummarySeason((seasons.find((x) => x.status === 'completed') ?? seasons[0]).id);
    }
  }, [seasons, selectedSummarySeason]);
  useEffect(() => {
    if (!selectedSummarySeason) return;
    contestApi
      .leaderboard(Number(selectedSummarySeason))
      .then((rows) => setSummaryPlayers(rows.map(rowToPlayer)))
      .catch(() => setSummaryPlayers([]));
  }, [selectedSummarySeason]);

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

                <h3 className="text-2xl font-bold text-white mt-3">{activeSeason?.name || 'Chưa có mùa giải'}</h3>

                <div className="space-y-2 mt-4 text-sm text-purple-200/90 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-purple-300" />
                    <span>{activeSeason ? `${formatDateShort(activeSeason.startDate)} – ${formatDateShort(activeSeason.endDate)}` : '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-purple-300" />
                    <span>{formatNumber(activeSeason?.participants ?? 0)} thí sinh tham gia</span>
                  </div>
                </div>
              </div>

              {/* Bottom Progress Bar + Trophy Illustration */}
              <div className="mt-6 flex items-end justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-purple-200 mb-1.5">
                    <span>Tiến độ mùa giải</span>
                    <span className="text-white font-bold">{Math.round((activeSeason?.progress ?? 0) * 100)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-purple-400/20">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-300 shadow-md shadow-violet-500/50 transition-all duration-500"
                      style={{ width: `${Math.round((activeSeason?.progress ?? 0) * 100)}%` }}
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

            {/* Thông tin mùa giải hiện tại (dữ liệu thật) */}
            <div className="lg:col-span-7 rounded-2xl border border-[#232b3e] bg-[#121622] p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-violet-400" />
                <span className="font-bold text-white text-base">Thông tin mùa giải</span>
              </div>
              {activeSeasonView ? (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: 'Đề thi', value: `${activeSeasonView.problems.length}/4 bài`, warn: activeSeasonView.problems.length !== 4 },
                    { label: 'Thí sinh tham gia', value: formatNumber(activeSeasonView.season.participants) },
                    { label: 'Số lượt tối đa', value: `${activeSeasonView.season.maxAttempts} lượt` },
                    { label: 'Thời gian mỗi lượt', value: `${activeSeasonView.season.timeLimitMinutes} phút` },
                    { label: 'Đã hoàn thành lượt thi', value: `${players.length} thí sinh` },
                    { label: 'Trạng thái đề', value: activeSeasonView.hasAttempts ? 'Đã khóa (có người thi)' : 'Có thể chỉnh sửa' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-[#171d2c] border border-[#232b3e] p-3">
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className={`mt-1 font-bold ${item.warn ? 'text-amber-300' : 'text-white'}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">{seasonsError ?? 'Chưa có mùa giải nào. Hãy tạo mùa giải ở tab Mùa giải.'}</p>
              )}
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
                  {players.length === 0 && (
                    <p className="text-xs text-slate-400 py-4 text-center">Chưa có thí sinh hoàn thành lượt thi.</p>
                  )}
                  {players.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-[#171d2c] border border-[#232b3e]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                          {p.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {p.completed} bài đúng · {p.submissions} lượt · {formatClock((p.totalTimeMinutes ?? 0) * 60)}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        Hạng {p.rank}
                      </span>
                    </div>
                  ))}
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
            isReadOnly={seasonConfigMode === 'view' || !canEdit}
            onBack={() => {
              navigateSeason('none');
            }}
            seasonView={seasonViews.find((v) => String(v.season.id) === activeSeasonId) ?? null}
            onSaveSeason={async (data) => {
              const payload = {
                name: data.name,
                startAt: dateToStart(data.startDate),
                endAt: dateToEnd(data.endDate),
                maxAttempts: data.maxAttempts,
                timeLimitMinutes: data.timeLimitMinutes,
              };
              const view = currentConfigSeason
                ? await adminContestApi.update(Number(currentConfigSeason.id), payload)
                : await adminContestApi.create(payload);
              await reloadSeasons();
              onLogActivity?.(currentConfigSeason ? 'UPDATE' : 'CREATE', `Cấu hình mùa giải: ${payload.name}`);
              // Mùa mới tạo -> chuyển sang chế độ sửa để sinh đề vào kho
              if (!currentConfigSeason) navigateSeason('edit', String(view.season.id));
              return view;
            }}
            onSaved={reloadSeasons}
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
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Luật xếp hạng (thay cho lọc tuần/tháng — backend không xếp hạng theo điểm) */}
              <div className="space-y-2 pt-3 border-t border-[#1f283b] text-xs text-slate-400 leading-relaxed">
                <p className="font-semibold text-slate-300">Thứ tự xếp hạng</p>
                <p>1. Số bài làm đúng (nhiều hơn)</p>
                <p>2. Số lượt đã dùng (ít hơn)</p>
                <p>3. Tổng thời gian làm bài (ít hơn)</p>
                <p className="pt-1">Mỗi thí sinh lấy lượt thi tốt nhất.</p>
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
                        <th className="py-3.5 px-4 text-center">Bài đúng</th>
                        <th className="py-3.5 px-4 text-center">Số lượt</th>
                        <th className="py-3.5 px-4 text-right">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1f283b]">
                      {players.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-sm text-slate-400">
                            Chưa có thí sinh nào hoàn thành lượt thi trong mùa giải này.
                          </td>
                        </tr>
                      )}
                      {players.map((p) => (
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
                          <td className="py-4 px-4 text-center font-bold text-violet-300">{p.completed}</td>
                          <td className="py-4 px-4 text-center text-slate-300">{p.submissions}</td>
                          <td className="py-4 px-4 text-right font-mono text-slate-300">
                            {formatClock((p.totalTimeMinutes ?? 0) * 60)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="px-5 py-3.5 border-t border-[#232b3e] bg-[#141a27] text-xs text-slate-400">
                {players.length} thí sinh
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
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Kết quả thật của mùa được chọn */}
          {(() => {
            const sv = seasonViews.find((v) => String(v.season.id) === selectedSummarySeason);
            const finished = summaryPlayers.length;
            const avgSolved = finished ? summaryPlayers.reduce((t, p) => t + p.completed, 0) / finished : 0;
            const fullScore = summaryPlayers.filter((p) => p.completed === (sv?.problems.length || 4)).length;
            const champion = summaryPlayers[0];
            const stats = [
              { label: 'Thí sinh tham gia', value: formatNumber(sv?.season.participants ?? 0) },
              { label: 'Hoàn thành lượt thi', value: formatNumber(finished) },
              { label: 'Số bài đúng trung bình', value: avgSolved.toFixed(1) },
              { label: 'Làm đúng cả 4 bài', value: formatNumber(fullScore) },
            ];
            return (
              <div className="space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((st) => (
                    <div key={st.label} className="rounded-2xl border border-[#232b3e] bg-[#121622] p-5">
                      <p className="text-xs text-slate-400">{st.label}</p>
                      <p className="mt-2 text-2xl font-bold text-white">{st.value}</p>
                    </div>
                  ))}
                </div>

                {champion && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 flex items-center gap-4">
                    <Crown size={28} className="text-amber-300" />
                    <div>
                      <p className="text-xs text-amber-200/80">Hạng nhất</p>
                      <p className="text-lg font-bold text-white">{champion.name}</p>
                      <p className="text-xs text-slate-300">
                        {champion.completed} bài đúng · {champion.submissions} lượt · {formatClock((champion.totalTimeMinutes ?? 0) * 60)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-[#232b3e] bg-[#121622] overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#232b3e] bg-[#181f2f]/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4 w-16 text-center">Hạng</th>
                        <th className="py-3 px-4">Thí sinh</th>
                        <th className="py-3 px-4 text-center">Bài đúng</th>
                        <th className="py-3 px-4 text-center">Số lượt</th>
                        <th className="py-3 px-4 text-right">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1f283b]">
                      {summaryPlayers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-slate-400">Mùa giải này chưa có kết quả.</td>
                        </tr>
                      )}
                      {summaryPlayers.map((p) => (
                        <tr key={p.id}>
                          <td className="py-3 px-4 text-center font-bold text-slate-300">{p.rank}</td>
                          <td className="py-3 px-4 font-semibold text-white">{p.name}</td>
                          <td className="py-3 px-4 text-center text-violet-300 font-bold">{p.completed}</td>
                          <td className="py-3 px-4 text-center text-slate-300">{p.submissions}</td>
                          <td className="py-3 px-4 text-right font-mono text-slate-300">
                            {formatClock((p.totalTimeMinutes ?? 0) * 60)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
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

              {/* Trạng thái tính tự động theo ngày; cấu hình số lượt + thời gian mỗi lượt */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Số lượt thi tối đa</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={seasonMaxAttemptsInput}
                    onChange={(e) => setSeasonMaxAttemptsInput(Number(e.target.value) || 1)}
                    className="w-full rounded-xl bg-[#181f2f] border border-[#2a354b] px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Thời gian mỗi lượt (phút)</label>
                  <input
                    type="number"
                    min={5}
                    max={600}
                    value={seasonTimeLimitInput}
                    onChange={(e) => setSeasonTimeLimitInput(Number(e.target.value) || 90)}
                    className="w-full rounded-xl bg-[#181f2f] border border-[#2a354b] px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">Trạng thái mùa giải (sắp diễn ra / đang diễn ra / đã kết thúc) được tính tự động theo ngày.</p>

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

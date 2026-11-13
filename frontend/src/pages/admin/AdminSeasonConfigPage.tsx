import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Trophy,
  Calendar,
  Sparkles,
  Sliders,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  FlaskConical,
  Clock,
  Check,
  X,
  FileText,
  FileCode,
  LayoutGrid,
  Zap,
  Swords,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Copy,
  ExternalLink, Code2,
} from 'lucide-react';
import type { Season, SeasonStatus } from '@/pages/user/league/types';
import {
  TOPICS,
  type PracticeProblem,
  type SkillLevel,
  LEVEL_COLORS,
  LEVEL_LABELS,
  LEVEL_OPTIONS,
} from '@/types';
import { normalizeDifficulty } from '@/lib/difficulty';
import { problemsApi, type AdminProblem, type BackendTemplate } from '@/lib/problemsApi';
import { templatesApi } from '@/lib/api';
import {
  adminContestApi,
  errorText,
  isoToDateInput,
  toUiSeason,
  type AdminPoolProblem,
  type AdminSeasonView,
} from '@/lib/adminContestApi';

interface AdminSeasonConfigPageProps {
  season: Season | null;
  /** Dữ liệu backend của mùa (số lượt, thời gian, đã có người thi chưa) */
  seasonView?: AdminSeasonView | null;
  isReadOnly?: boolean;
  onBack?: () => void;
  /** Lưu thông tin mùa lên backend; trả về mùa sau khi lưu */
  onSaveSeason: (data: {
    name: string;
    startDate: string;
    endDate: string;
    maxAttempts: number;
    timeLimitMinutes: number;
  }) => Promise<AdminSeasonView>;
  onSaved?: () => void;
  onLogActivity?: (action: 'CREATE' | 'UPDATE' | 'DELETE' | 'TOGGLE', target: string) => void;
}

const PROBLEMS_PER_SEASON = 4;

// Bài trong kho đề (backend) -> kiểu PracticeProblem mà giao diện đang dùng; isPublic = đang được chọn làm đề
function poolToProblem(p: AdminPoolProblem, verified: boolean): PracticeProblem {
  return {
    id: String(p.problemId),
    title: p.title,
    topic: p.topic ?? 'Khác',
    difficulty: normalizeDifficulty(p.level, 'intermediate'),
    description: p.statement ?? '',
    examples: (p.samples ?? []).map((s) => ({ input: s.input, output: s.expectedOutput })),
    starterCode: '',
    language: 'java',
    constraints: [`${p.testCaseCount} test case`],
    isPublic: p.selected,
    isAiGenerated: p.sourceType === 'AI_GENERATED',
    isVerified: verified,
    updatedAt: p.createdAt?.slice(0, 10),
    referenceSolution: p.referenceSolution ?? undefined,
  };
}

export function AdminSeasonConfigPage({
  season,
  seasonView,
  isReadOnly = false,
  onBack,
  onSaveSeason,
  onSaved,
  onLogActivity,
}: AdminSeasonConfigPageProps) {
  const seasonId = season ? Number(season.id) : null;
  const locked = !!seasonView?.hasAttempts; // đã có người thi -> không đổi đề

  // ── Season Core State ──────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const [seasonName, setSeasonName] = useState(season?.name || '');
  // Trạng thái tính tự động theo ngày (chỉ hiển thị)
  const [seasonStatus, setSeasonStatus] = useState<SeasonStatus>(season?.status || 'upcoming');
  const [seasonStart, setSeasonStart] = useState(season?.startDate ? isoToDateInput(season.startDate) : today);
  const [seasonEnd, setSeasonEnd] = useState(season?.endDate ? isoToDateInput(season.endDate) : today);
  const maxAttempts = seasonView?.season.maxAttempts ?? 3;
  const timeLimitMinutes = seasonView?.season.timeLimitMinutes ?? 90;

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ── Left Column: Generator Form State (template thật từ DB) ───
  const [genTopic, setGenTopic] = useState<string>('Array');
  const [genTemplate, setGenTemplate] = useState<string>('');
  const [genMode, setGenMode] = useState<'variant_input_output' | 'new_problem'>('variant_input_output');
  const [genCount, setGenCount] = useState<number>(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allTemplates, setAllTemplates] = useState<BackendTemplate[]>([]);

  useEffect(() => {
    templatesApi.list().then((list) => setAllTemplates(list as unknown as BackendTemplate[])).catch(() => setAllTemplates([]));
  }, []);

  const templateOptions = useMemo(
    () =>
      allTemplates
        .filter((t) => (t.topic?.name ?? 'Khác').toLowerCase() === genTopic.toLowerCase())
        .map((t) => ({ id: String(t.id), title: `${t.name} (${t.level})` })),
    [allTemplates, genTopic],
  );

  useEffect(() => {
    if (!templateOptions.some((t) => t.id === genTemplate)) setGenTemplate(templateOptions[0]?.id ?? '');
  }, [templateOptions, genTemplate]);

  // ── Right Column: Kho đề của mùa (backend) ────────────────────
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [verifiedIds, setVerifiedIds] = useState<Set<string>>(new Set());

  const reloadPool = useCallback(async () => {
    if (!seasonId) {
      setProblems([]);
      return;
    }
    try {
      const pool = await adminContestApi.pool(seasonId);
      setProblems(pool.map((p) => poolToProblem(p, verifiedIds.has(String(p.problemId)))));
    } catch (e) {
      showToast(errorText(e, 'Không tải được kho đề.'), 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seasonId]);

  useEffect(() => {
    reloadPool();
  }, [reloadPool]);

  // Filters for Right Column
  const [tabType, setTabType] = useState<'recent' | 'approved'>('recent');
  const [filterSource, setFilterSource] = useState<'all' | 'ai' | 'manual'>('all');
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'public' | 'draft'>('all');

  // Modal States
  const [
      previewProblem, setPreviewProblem] = useState<PracticeProblem | null>(null);
  // "Thêm bài" = chọn bài có sẵn (đã có test case) từ ngân hàng đề luyện tập -> sao chép vào kho đề của mùa
  const [showAddModal, setShowAddModalState] = useState(false);
  const [bank, setBank] = useState<AdminProblem[]>([]);
  const [bankSearch, setBankSearch] = useState('');
  const [addingId, setAddingId] = useState<number | null>(null);
  const setShowAddModal = (open: boolean) => {
    if (open && !seasonId) {
      showToast('Hãy lưu thông tin mùa giải trước khi thêm bài.', 'error');
      return;
    }
    if (open && locked) {
      showToast('Mùa giải đã có người thi, không thể thêm đề.', 'error');
      return;
    }
    setShowAddModalState(open);
    if (open) {
      problemsApi
        .listAll()
        .then((list) => setBank(list.filter((x) => ((x as unknown as { testCaseCount?: number }).testCaseCount ?? 0) > 0)))
        .catch((e) => showToast(errorText(e, 'Không tải được ngân hàng đề.'), 'error'));
    }
  };
  const handleAddFromBank = async (problemId: number) => {
    if (!seasonId) return;
    setAddingId(problemId);
    try {
      await adminContestApi.addFromBank(seasonId, problemId);
      await reloadPool();
      showToast('Đã thêm bài vào kho đề của mùa giải.', 'success');
    } catch (e) {
      showToast(errorText(e, 'Không thêm được bài.'), 'error');
    } finally {
      setAddingId(null);
    }
  };

  // ── Handlers ──────────────────────────────────────────────────
  const handleResetSeason = () => {
    if (isReadOnly) return;
    setSeasonName(season?.name || '');
    setSeasonStart(season?.startDate ? isoToDateInput(season.startDate) : today);
    setSeasonEnd(season?.endDate ? isoToDateInput(season.endDate) : today);
    reloadPool();
    showToast('Đã đặt lại thông tin mùa giải về ban đầu', 'info');
  };

  const handleSaveSeasonConfig = async () => {
    if (isReadOnly) return;
    if (!seasonName.trim()) {
      showToast('Vui lòng nhập tên mùa giải', 'error');
      return;
    }
    if (seasonEnd < seasonStart) {
      showToast('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu', 'error');
      return;
    }
    const selected = problems.filter((p) => p.isPublic).map((p) => Number(p.id));
    if (selected.length !== 0 && selected.length !== PROBLEMS_PER_SEASON) {
      showToast(`Cần chọn đúng ${PROBLEMS_PER_SEASON} bài làm đề thi (đang chọn ${selected.length}).`, 'error');
      return;
    }
    try {
      const view = await onSaveSeason({
        name: seasonName.trim(),
        startDate: seasonStart,
        endDate: seasonEnd,
        maxAttempts,
        timeLimitMinutes,
      });
      setSeasonStatus(toUiSeason(view).status);
      const current = view.problems.map((p) => p.problemId).sort().join(',');
      if (seasonId && selected.length === PROBLEMS_PER_SEASON && !locked && current !== [...selected].sort().join(',')) {
        await adminContestApi.setProblems(seasonId, selected);
        onLogActivity?.('UPDATE', `Chọn ${PROBLEMS_PER_SEASON} đề thi cho mùa: ${seasonName}`);
      }
      onSaved?.();
      await reloadPool();
      showToast('✓ Đã lưu mùa giải và đề thi thành công!', 'success');
    } catch (e) {
      showToast(errorText(e, 'Không lưu được mùa giải.'), 'error');
    }
  };

  // Sinh đề thật: mỗi bài 1 lần gọi API (lời giải mẫu chạy qua Judge0)
  const handleGenerateExam = async () => {
    if (isReadOnly) return;
    if (!seasonId) {
      showToast('Hãy lưu thông tin mùa giải trước khi sinh đề.', 'error');
      return;
    }
    if (locked) {
      showToast('Mùa giải đã có người thi, không thể thêm đề.', 'error');
      return;
    }
    if (!genTemplate) {
      showToast('Chủ đề này chưa có template.', 'error');
      return;
    }
    setIsGenerating(true);
    let ok = 0;
    let lastError = '';
    for (let i = 0; i < genCount; i++) {
      showToast(`Đang sinh đề ${i + 1}/${genCount}...`, 'info');
      try {
        await adminContestApi.generate(seasonId, Number(genTemplate), genMode === 'new_problem');
        ok++;
      } catch (e) {
        lastError = errorText(e, 'Lỗi không xác định');
      }
    }
    await reloadPool();
    setIsGenerating(false);
    if (ok === genCount) showToast(`🎉 Đã sinh ${ok} bài vào kho đề của mùa giải!`, 'success');
    else showToast(`Sinh được ${ok}/${genCount} bài. Lỗi: ${lastError}`, 'error');
    if (ok > 0) onLogActivity?.('CREATE', `Sinh ${ok} bài cho mùa giải ${seasonName}`);
  };

  // "Duyệt" = chọn / bỏ chọn bài làm đề thi (tối đa 4), lưu khi bấm "Lưu"
  const handleTogglePublic = (id: string) => {
    if (isReadOnly) return;
    if (locked) {
      showToast('Mùa giải đã có người thi, không thể đổi đề.', 'error');
      return;
    }
    const target = problems.find((p) => p.id === id);
    if (!target) return;
    const selectedCount = problems.filter((p) => p.isPublic).length;
    if (!target.isPublic && selectedCount >= PROBLEMS_PER_SEASON) {
      showToast(`Chỉ được chọn ${PROBLEMS_PER_SEASON} bài làm đề thi.`, 'error');
      return;
    }
    setProblems((prev) => prev.map((p) => (p.id === id ? { ...p, isPublic: !p.isPublic } : p)));
    showToast(target.isPublic ? `Đã bỏ chọn "${target.title}"` : `Đã chọn "${target.title}" làm đề thi (nhớ bấm Lưu)`, 'info');
  };

  // Kiểm thử thật: chạy lời giải mẫu với toàn bộ test case qua Judge0
  const handleTestProblem = async (id: string) => {
    if (isReadOnly) return;
    showToast('🧪 Đang kiểm thử qua Judge0...', 'info');
    try {
      const res = await problemsApi.verify(id);
      if (res.allPassed) {
        setVerifiedIds((prev) => new Set(prev).add(id));
        setProblems((prev) => prev.map((p) => (p.id === id ? { ...p, isVerified: true } : p)));
        showToast('✓ Lời giải mẫu vượt qua toàn bộ test case.', 'success');
      } else {
        showToast('Lời giải mẫu chưa qua hết test case, không nên dùng bài này.', 'error');
      }
    } catch (e) {
      showToast(errorText(e, 'Không kiểm thử được.'), 'error');
    }
  };

  const handleDeleteProblem = async (id: string, title: string) => {
    if (isReadOnly || !seasonId) return;
    if (!window.confirm(`Bạn có chắc muốn xóa bài "${title}" khỏi kho đề của mùa giải không?`)) return;
    try {
      await adminContestApi.removeFromPool(seasonId, Number(id));
      await reloadPool();
      showToast(`Đã xóa bài "${title}"`, 'info');
    } catch (e) {
      showToast(errorText(e, 'Không xóa được bài.'), 'error');
    }
  };

  // ── Filtered Problems List ────────────────────────────────────
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      if (tabType === 'approved' && !p.isPublic) return false;
      if (filterSource === 'ai' && !p.isAiGenerated) return false;
      if (filterSource === 'manual' && p.isAiGenerated) return false;
      if (filterTopic !== 'all' && p.topic !== filterTopic) return false;
      if (filterLevel !== 'all') {
        const norm = normalizeDifficulty(p.difficulty) || p.difficulty;
        if (norm !== filterLevel) return false;
      }
      if (filterStatus === 'public' && !p.isPublic) return false;
      if (filterStatus === 'draft' && p.isPublic) return false;
      return true;
    });
  }, [problems, tabType, filterSource, filterTopic, filterLevel, filterStatus]);

  const recentCount = problems.filter((p) => !p.isPublic).length;
  const approvedCount = problems.filter((p) => p.isPublic).length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* ── Toast Notification ─────────────────────────────────── */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold border backdrop-blur-md transition-all ${
            toastMessage.type === 'error'
              ? 'bg-rose-900/90 border-rose-500 text-rose-100'
              : toastMessage.type === 'info'
                ? 'bg-blue-900/90 border-blue-500 text-blue-100'
                : 'bg-emerald-900/90 border-emerald-500 text-emerald-100'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <XCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          {toastMessage.text}
        </div>
      )}

      {/* ── Banner: Cấu hình mùa giải (matching image) ──────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-[#2a344d] bg-gradient-to-r from-violet-50/70 via-white to-purple-50/40 dark:from-[#151a28] dark:via-[#131724] dark:to-[#1c1936] p-6 shadow-xl">
        {/* Decorative ambient graphics */}
        <div className="absolute top-0 right-0 w-80 h-full pointer-events-none opacity-20 dark:opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-400 via-purple-600 to-transparent" />
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Trophy + Name + Dates */}
          <div className="flex items-center gap-5 min-w-0 flex-1">
            {/* Glowing Golden Trophy circle */}
            <div className="flex-shrink-0 relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-purple-500/20 border border-amber-400/30 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-amber-400/20 blur-md absolute inset-0 m-auto" />
              <Trophy size={40} className="text-amber-400 drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]" />
            </div>

            <div className="space-y-3 flex-1 min-w-0">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-700 dark:text-violet-300 text-[11px] font-bold uppercase tracking-wider">
                {isReadOnly ? 'Thông tin mùa giải' : 'Cấu hình mùa giải'}
              </div>

              {/* Season Name Input with Edit Icon */}
              <div className="flex items-center gap-2 max-w-xl">
                <div className="relative w-full">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Edit3 size={15} />
                  </span>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={seasonName}
                    onChange={(e) => setSeasonName(e.target.value)}
                    placeholder="Nhập tên mùa giải..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#181f2f] border border-slate-300 dark:border-[#2b364e] text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:border-violet-500 disabled:opacity-80 disabled:cursor-not-allowed shadow-sm"
                  />
                </div>
              </div>

              {/* Dates & Status Row */}
              <div className="flex items-center flex-wrap gap-4 text-xs">
                {/* Ngày bắt đầu */}
                <div className="flex items-center gap-2 bg-white/80 dark:bg-[#181f2f]/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#2b364e]">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Ngày bắt đầu:</span>
                  <input
                    type="date"
                    disabled={isReadOnly}
                    value={seasonStart}
                    onChange={(e) => setSeasonStart(e.target.value)}
                    className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none disabled:cursor-not-allowed"
                  />
                </div>

                {/* Ngày kết thúc */}
                <div className="flex items-center gap-2 bg-white/80 dark:bg-[#181f2f]/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#2b364e]">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Ngày kết thúc:</span>
                  <input
                    type="date"
                    disabled={isReadOnly}
                    value={seasonEnd}
                    onChange={(e) => setSeasonEnd(e.target.value)}
                    className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none disabled:cursor-not-allowed"
                  />
                </div>

                {/* Trạng thái mùa giải */}
                <div className="flex items-center gap-2 bg-white/80 dark:bg-[#181f2f]/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#2b364e]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Trạng thái:</span>
                  <select
                    value={seasonStatus}
                    disabled
                    title="Tự động theo ngày bắt đầu / kết thúc"
                    onChange={(e) => setSeasonStatus(e.target.value as SeasonStatus)}
                    className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer disabled:cursor-not-allowed"
                  >
                    <option value="active"> Đang diễn ra</option>
                    <option value="upcoming"> Sắp diễn ra</option>
                    <option value="completed"> Đã kết thúc</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0 self-end lg:self-center">
            {!isReadOnly ? (
              <>
                <button
                  type="button"
                  onClick={handleResetSeason}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-[#2f3b54] bg-white dark:bg-[#181f2f] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#20283d] transition-all text-xs font-semibold shadow-sm"
                >
                  <RotateCcw size={14} />
                  Đặt lại
                </button>
                <button
                  type="button"
                  onClick={handleSaveSeasonConfig}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 transition-all"
                >
                  <Check size={15} />
                  Lưu thay đổi
                </button>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-semibold">
                <Eye size={14} />
                Chế độ chỉ xem
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Section Title: Generate Đề & Quản lý Đề thi Đấu Hạng ── */}
      <div className="flex items-center gap-3 pt-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 text-violet-600 dark:text-violet-400 border border-violet-500/30">
          <Swords size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Generate Đề & Quản lý Đề thi Đấu Hạng
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cấu hình tham số, tạo đề AI và quản lý các đề đã tạo một cách dễ dàng
          </p>
        </div>
      </div>

      {/* ── Two Columns Main Section (matching image) ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN: Tạo Đề Thi Mới (4 cols) ───────────────── */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-[#232b3e] bg-white dark:bg-[#121622] p-5 shadow-lg space-y-5">
          {/* Card Header */}
          <div className="border-b border-slate-100 dark:border-[#1e273a] pb-4">
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-violet-600 dark:text-violet-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Tạo Đề Thi Mới</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Cấu hình các thông số để AI sinh bộ đề phù hợp với yêu cầu của bạn
            </p>
          </div>

          {/* Field 1: Chủ đề chính */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <LayoutGrid size={14} className="text-violet-500" />
              Chủ đề chính
            </label>
            <select
              disabled={isReadOnly}
              value={genTopic}
              onChange={(e) => setGenTopic(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-[#181f2f] border border-slate-300 dark:border-[#2a354b] px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Field 2: Bài mẫu tham chiếu (Template) */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <FileCode size={14} className="text-blue-500" />
              Bài mẫu tham chiếu (Template)
            </label>
            <select
              disabled={isReadOnly}
              value={genTemplate}
              onChange={(e) => setGenTemplate(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-[#181f2f] border border-slate-300 dark:border-[#2a354b] px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {templateOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.title}
                </option>
              ))}
            </select>
          </div>

          {/* Field 3: Phương thức sinh đề AI (Generation Mode) */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Sparkles size={14} className="text-amber-500" />
              Phương thức sinh đề AI (Generation Mode)
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: Biến thể theo Bài Mẫu */}
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => setGenMode('variant_input_output')}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  genMode === 'variant_input_output'
                    ? 'border-violet-500 bg-violet-500/10 dark:bg-violet-600/15 ring-1 ring-violet-500'
                    : 'border-slate-200 dark:border-[#253047] bg-slate-50/50 dark:bg-[#161c2b] hover:border-slate-300'
                } ${isReadOnly ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
              >
                <div>
                  <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-300 font-bold text-xs mb-1">
                    <FileText size={14} />
                    <span>Biến thể theo Bài Mẫu</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Giữ nguyên bài toán gốc từ template, AI chỉ cập nhật & đổi mới dữ liệu Input/Output mẫu.
                  </p>
                </div>
                {genMode === 'variant_input_output' && (
                  <span className="w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400 self-end mt-2" />
                )}
              </button>

              {/* Option 2: Tạo Đề Mới Hoàn Toàn */}
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => setGenMode('new_problem')}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  genMode === 'new_problem'
                    ? 'border-violet-500 bg-violet-500/10 dark:bg-violet-600/15 ring-1 ring-violet-500'
                    : 'border-slate-200 dark:border-[#253047] bg-slate-50/50 dark:bg-[#161c2b] hover:border-slate-300'
                } ${isReadOnly ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
              >
                <div>
                  <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-300 font-bold text-xs mb-1">
                    <RefreshCw size={14} />
                    <span>Tạo Đề Mới Hoàn Toàn</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Dựa theo chủ đề Template, AI sáng tác bài toán, yêu cầu và thuật toán mới hoàn toàn.
                  </p>
                </div>
                {genMode === 'new_problem' && (
                  <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 self-end mt-2" />
                )}
              </button>
            </div>
          </div>

          {/* Field 4: Tổng số bài tập */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sliders size={14} className="text-emerald-500" />
                Tổng số bài tập ({genCount} bài)
              </span>
              <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#181f2f] border border-slate-300 dark:border-[#28354c] flex items-center justify-center font-bold text-slate-900 dark:text-white">
                {genCount}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              disabled={isReadOnly}
              value={genCount}
              onChange={(e) => setGenCount(Number(e.target.value))}
              className="w-full accent-violet-600 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              disabled={isReadOnly || isGenerating}
              onClick={handleGenerateExam}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition-all disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  AI đang sinh bộ đề...
                </>
              ) : (
                <>
                  <Zap size={14} />
                  Tạo Đề Ngay
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isReadOnly}
              onClick={() => {
                setGenTopic('Array');
                setGenMode('variant_input_output');
                setGenCount(4);
              }}
              className="p-3 rounded-xl border border-slate-300 dark:border-[#2d3852] bg-slate-50 dark:bg-[#181f2f] text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-200 dark:hover:bg-[#20283d] transition-all text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              title="Đặt lại tham số sinh đề"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Quản lý Đề Đã Tạo (7 cols) ──────────────── */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-[#232b3e] bg-white dark:bg-[#121622] p-5 shadow-lg space-y-4">
          {/* Card Header with action buttons */}
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 dark:border-[#1e273a] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-violet-600 dark:text-violet-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Quản lý Đề Đã Tạo</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Danh sách các đề thi bạn đã tạo ({recentCount} đề gần nhất, {approvedCount} đề đã duyệt)
              </p>
            </div>

            {!isReadOnly && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateExam}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-[#2e3a54] bg-slate-50 dark:bg-[#181f2f] text-slate-700 dark:text-slate-300 hover:text-violet-600 hover:border-violet-500 transition-all text-xs font-semibold"
                >
                  <Sparkles size={13} className="text-amber-500" />
                  Generate đề thi AI
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-md shadow-violet-600/30 transition-all"
                >
                  <Plus size={14} />
                  Thêm bài mới
                </button>
              </div>
            )}
          </div>

          {/* Filter Bar matching image */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Pill Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#171d2b] p-1 rounded-xl border border-slate-200 dark:border-[#232d42]">
              <button
                type="button"
                onClick={() => setTabType('recent')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  tabType === 'recent'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Đề gần nhất ({recentCount})
              </button>
              <button
                type="button"
                onClick={() => setTabType('approved')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  tabType === 'approved'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Đã duyệt ({approvedCount})
              </button>
            </div>

            {/* Dropdown Filters */}
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value as any)}
              className="rounded-xl bg-slate-50 dark:bg-[#181f2f] border border-slate-300 dark:border-[#2a354b] px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Tất cả nguồn tạo</option>
              <option value="ai">AI Generate</option>
              <option value="manual">Đề thêm tay</option>
            </select>

            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="rounded-xl bg-slate-50 dark:bg-[#181f2f] border border-slate-300 dark:border-[#2a354b] px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Tất cả kiểu bài</option>
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="rounded-xl bg-slate-50 dark:bg-[#181f2f] border border-slate-300 dark:border-[#2a354b] px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Mọi cấp độ (5 levels)</option>
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="rounded-xl bg-slate-50 dark:bg-[#181f2f] border border-slate-300 dark:border-[#2a354b] px-2.5 py-1.5 font-semibold text-slate-800 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="public">Public</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>

          {/* Subheader info pill */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <FlaskConical size={14} />
              Khung Đề cần kiểm thử & chờ duyệt ({problems.filter((p) => !p.isVerified).length} bài)
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Tổng số {filteredProblems.length} bài
            </span>
          </div>

          {/* Problem List Content */}
          {filteredProblems.length === 0 ? (
            /* Empty State matching image */
            <div className="border border-dashed border-slate-300 dark:border-[#263147] rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50 dark:bg-[#141926]/50">
              <div className="relative w-16 h-16 rounded-full bg-violet-500/15 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <Clock size={32} />
                <Sparkles size={16} className="absolute top-0 right-0 text-amber-400 animate-pulse" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Chưa có đề thi nào được tạo
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  Hãy tạo đề thi đầu tiên của bạn bằng cách điền thông tin ở bên trái nhé!
                </p>
              </div>

              {!isReadOnly && (
                <button
                  type="button"
                  onClick={handleGenerateExam}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-md shadow-violet-600/30 transition-all"
                >
                  <Zap size={14} />
                  Tạo Đề Ngay
                </button>
              )}
            </div>
          ) : (
            /* Problem Cards List */
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {filteredProblems.map((prob, idx) => {
                const normDiff = normalizeDifficulty(prob.difficulty) || 'basic';
                const diffColor = LEVEL_COLORS[normDiff];
                const diffLabel = LEVEL_LABELS[normDiff];

                return (
                  <div
                    key={prob.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-[#232d42] bg-slate-50/60 dark:bg-[#161c2b] hover:border-violet-500/50 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {prob.title}
                        </h5>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-[#20293d] text-slate-700 dark:text-slate-300 font-semibold">
                          {prob.topic}
                        </span>

                        <span
                          className="px-2 py-0.5 rounded-md font-semibold border"
                          style={{
                            color: diffColor,
                            backgroundColor: `${diffColor}18`,
                            borderColor: `${diffColor}40`,
                          }}
                        >
                          {diffLabel}
                        </span>

                        {prob.isAiGenerated ? (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-300 font-semibold flex items-center gap-1 border border-purple-500/30">
                            <Sparkles size={11} /> AI Generate
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-semibold">
                            Thêm tay
                          </span>
                        )}

                        {prob.isVerified ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-semibold border border-emerald-500/30">
                            ✓ Đã test Sandbox
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-300 font-semibold border border-amber-500/30">
                            Chờ kiểm thử
                          </span>
                        )}

                        {prob.isPublic ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold">
                            Public
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                            Bản nháp
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons on problem card */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewProblem(prob)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-[#2a354c] text-slate-600 dark:text-slate-300 hover:text-white hover:bg-violet-600 transition-all text-xs"
                        title="Xem chi tiết đề bài"
                      >
                        <Eye size={14} />
                      </button>

                      {!isReadOnly && (
                        <>
                          {!prob.isVerified && (
                            <button
                              type="button"
                              onClick={() => handleTestProblem(prob.id)}
                              className="p-1.5 rounded-lg border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 transition-all text-xs"
                              title="Chạy test Sandbox"
                            >
                              <FlaskConical size={14} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleTogglePublic(prob.id)}
                            className={`p-1.5 rounded-lg border transition-all text-xs ${
                              prob.isPublic
                                ? 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
                                : 'border-slate-300 dark:border-[#2a354c] text-slate-400 hover:text-white'
                            }`}
                            title={prob.isPublic ? 'Chuyển về nháp' : 'Duyệt bài này'}
                          >
                            <Check size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProblem(prob.id, prob.title)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-[#2a354c] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-xs"
                            title="Xóa bài"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: Xem Chi Tiết Đề Bài (Problem Preview) ───────── */}
      {previewProblem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setPreviewProblem(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-[#2d3852] bg-white dark:bg-[#121622] p-6 shadow-2xl text-slate-900 dark:text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#232b3e] pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={18} className="text-violet-500" />
                <h3 className="text-lg font-bold truncate">{previewProblem.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProblem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#1c2436] font-semibold">
                Chủ đề: {previewProblem.topic}
              </span>
              <span
                className="px-2.5 py-1 rounded-md font-semibold border"
                style={{
                  color: LEVEL_COLORS[normalizeDifficulty(previewProblem.difficulty) || 'basic'],
                  backgroundColor: `${LEVEL_COLORS[normalizeDifficulty(previewProblem.difficulty) || 'basic']}18`,
                  borderColor: `${LEVEL_COLORS[normalizeDifficulty(previewProblem.difficulty) || 'basic']}40`,
                }}
              >
                Độ khó: {LEVEL_LABELS[normalizeDifficulty(previewProblem.difficulty) || 'basic']}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-blue-500/15 text-blue-400 font-semibold">
                {previewProblem.isAiGenerated ? 'AI Generate' : 'Tạo thủ công'}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Mô tả bài toán
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#181f2f] p-3.5 rounded-xl border border-slate-200 dark:border-[#273248]">
                {previewProblem.description}
              </p>
            </div>

            {previewProblem.examples && previewProblem.examples.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Ví dụ minh họa
                </h4>
                <div className="space-y-2">
                  {previewProblem.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-[#161c2b] border border-slate-200 dark:border-[#253047] text-xs font-mono space-y-1"
                    >
                      <div>
                        <strong className="text-violet-600 dark:text-violet-400">Input:</strong> {ex.input}
                      </div>
                      <div>
                        <strong className="text-emerald-600 dark:text-emerald-400">Output:</strong> {ex.output}
                      </div>
                      {ex.explanation && (
                        <div className="text-slate-500 dark:text-slate-400 italic">
                          <strong>Giải thích:</strong> {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                <Code2 size={16} style={{ color: '#5e8dfa' }} /> Mã thực thi bài tập
              </h4>
              <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                  <code>{previewProblem.referenceSolution || '// Bài này chưa có mã thực thi'}</code>
              </pre>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-[#232b3e]">
              <button
                type="button"
                onClick={() => setPreviewProblem(null)}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-md"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Chọn bài từ ngân hàng đề ─────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowAddModal(false)}>
          <div
            className="w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl border border-slate-200 dark:border-[#232b3e] bg-white dark:bg-[#121622] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#232b3e]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thêm bài từ ngân hàng đề</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200 text-xl leading-none">
                ×
              </button>
            </div>
            <div className="px-5 py-3">
              <input
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                placeholder="Tìm theo chủ đề hoặc nội dung đề..."
                className="w-full rounded-xl border border-slate-200 dark:border-[#2a354b] bg-slate-50 dark:bg-[#181f2f] px-3 py-2 text-sm text-slate-800 dark:text-white"
              />
              <p className="mt-2 text-xs text-slate-500">Bài được sao chép sang kho đề của mùa; bài gốc vẫn ở trang luyện tập.</p>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2">
              {bank
                .filter((b) => {
                  const q = bankSearch.trim().toLowerCase();
                  return !q || (b.topic ?? '').toLowerCase().includes(q) || (b.statement ?? '').toLowerCase().includes(q);
                })
                .map((b) => (
                  <div key={b.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 dark:border-[#232b3e] p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        #{b.id} · {b.topic ?? 'Khác'} · {b.level ?? '—'}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-2">{b.statement}</p>
                    </div>
                    <button
                      onClick={() => handleAddFromBank(b.id)}
                      disabled={addingId !== null}
                      className="shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {addingId === b.id ? 'Đang thêm...' : 'Thêm'}
                    </button>
                  </div>
                ))}
              {bank.length === 0 && <p className="py-6 text-center text-sm text-slate-500">Ngân hàng đề chưa có bài nào có test case.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

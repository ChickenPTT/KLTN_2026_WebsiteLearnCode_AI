import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FlaskConical,
  Layers,
  ListOrdered,
  Type,
  KeyRound,
  MoveHorizontal,
  Link2,
  AlignJustify,
  Repeat,
  ArrowDownWideNarrow,
  TreePine,
  Share2,
  Play,
  X,
  Code2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileClock,
  Globe,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import type { PracticeProblem } from '@/types';
import { SearchableSelect, type SelectOption } from '@/components/SearchableSelect';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  toPracticeProblem,
  LANGUAGE_LABELS,
  type AdminProblem,
  type VerifyResult,
} from '@/lib/problemsApi';
import { AdminVerifyModal } from './AdminVerifyModal';
import { apiErrorMessage } from './adminApi.utils';

// Topic trong DB la chuoi tu do (thuong viet thuong: "array", "basic"...) -> tra icon khong phan biet hoa thuong
const TOPIC_ICON_MAP: Record<string, LucideIcon> = {
  array: ListOrdered,
  string: Type,
  'hash table': KeyRound,
  'two pointers': MoveHorizontal,
  'linked list': Link2,
  stack: Layers,
  queue: AlignJustify,
  recursion: Repeat,
  sorting: ArrowDownWideNarrow,
  'binary search': Search,
  tree: TreePine,
  graph: Share2,
};
const topicIcon = (topic: string): LucideIcon => TOPIC_ICON_MAP[topic.trim().toLowerCase()] ?? Layers;

const DIFF_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Mọi cấp độ' },
  { value: 'Easy', label: 'Dễ (Easy)' },
  { value: 'Medium', label: 'Trung bình (Medium)' },
  { value: 'Hard', label: 'Khó (Hard)' },
];

const SOURCE_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Mọi nguồn' },
  { value: 'ai', label: 'Sinh từ template' },
  { value: 'manual', label: 'Thêm tay' },
];

const VERIFY_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Tất cả kiểm tra' },
  { value: 'passed', label: '🟢 Kiểm tra đạt' },
  { value: 'failed', label: '🔴 Kiểm tra lỗi' },
  { value: 'unchecked', label: '🟡 Chưa kiểm tra' },
];

const DIFFICULTY_COLORS: Record<string, { bg: string; color: string; border: string; label: string }> = {
  Easy: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)', label: 'Dễ (Easy)' },
  Medium: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)', label: 'Trung bình' },
  Hard: { bg: 'rgba(244, 63, 94, 0.12)', color: '#f43f5e', border: 'rgba(244, 63, 94, 0.3)', label: 'Khó (Hard)' },
};

type StatusTab = 'draft' | 'published';

interface ProblemRow {
  raw: AdminProblem;
  ui: PracticeProblem;
}

interface AdminProblemsTabProps {
  problems: AdminProblem[];
  loading: boolean;
  error: string | null;
  /** Chi ADMIN duoc xoa (giang vien nhan 403) */
  canDelete: boolean;
  onReload: () => void;
  /** DRAFT -> publish, PUBLISHED -> unpublish */
  onTogglePublish: (problem: AdminProblem) => Promise<void>;
  onDelete: (problem: AdminProblem) => Promise<void>;
  onGoGenerator: () => void;
}

export function AdminProblemsTab({
  problems,
  loading,
  error,
  canDelete,
  onReload,
  onTogglePublish,
  onDelete,
  onGoGenerator,
}: AdminProblemsTabProps) {
  // Tab trang thai: "Chờ duyệt" (DRAFT) | "Đã xuất bản" (PUBLISHED)
  const [activeStatusTab, setActiveStatusTab] = useState<StatusTab>('draft');

  // Search & Filters
  const [searchKey, setSearchKey] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [diffFilter, setDiffFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [verifyFilter, setVerifyFilter] = useState<string>('all');

  // Modals / thao tac
  const [deletingProblem, setDeletingProblem] = useState<ProblemRow | null>(null);
  const [testingProblem, setTestingProblem] = useState<AdminProblem | null>(null);
  const [viewingProblem, setViewingProblem] = useState<ProblemRow | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Ket qua "Kiểm tra" trong phien (backend khong luu trang thai nay)
  const [verifyMap, setVerifyMap] = useState<Record<number, VerifyResult>>({});

  const rows = useMemo<ProblemRow[]>(() => problems.map((raw) => ({ raw, ui: toPracticeProblem(raw) })), [problems]);

  const draftCount = useMemo(() => problems.filter((p) => p.status === 'DRAFT').length, [problems]);
  const publishedCount = problems.length - draftCount;

  const topicOptions = useMemo<SelectOption[]>(() => {
    const topics = Array.from(new Set(rows.map((r) => r.ui.topic))).sort((a, b) => a.localeCompare(b));
    return [
      { value: 'all', label: 'Tất cả chủ đề' },
      ...topics.map((t) => ({ value: t, label: t, icon: topicIcon(t) })),
    ];
  }, [rows]);

  const verifyState = (id: number): 'passed' | 'failed' | 'unchecked' => {
    const r = verifyMap[id];
    if (!r) return 'unchecked';
    return r.allPassed ? 'passed' : 'failed';
  };

  const filteredProblems = useMemo(() => {
    const key = searchKey.trim().toLowerCase();
    return rows.filter(({ raw, ui }) => {
      if (activeStatusTab === 'draft' ? raw.status !== 'DRAFT' : raw.status !== 'PUBLISHED') return false;

      if (
        key &&
        !ui.title.toLowerCase().includes(key) &&
        !ui.description.toLowerCase().includes(key) &&
        !ui.topic.toLowerCase().includes(key) &&
        !String(raw.id).includes(key)
      ) {
        return false;
      }

      if (topicFilter !== 'all' && ui.topic !== topicFilter) return false;
      if (diffFilter !== 'all' && ui.difficulty !== diffFilter) return false;
      if (sourceFilter === 'ai' && raw.sourceType !== 'AI_GENERATED') return false;
      if (sourceFilter === 'manual' && raw.sourceType !== 'MANUAL') return false;

      if (verifyFilter !== 'all') {
        const r = verifyMap[raw.id];
        const state = !r ? 'unchecked' : r.allPassed ? 'passed' : 'failed';
        if (state !== verifyFilter) return false;
      }
      return true;
    });
  }, [rows, activeStatusTab, searchKey, topicFilter, diffFilter, sourceFilter, verifyFilter, verifyMap]);

  // ── PAGINATION LOGIC (20 ITEMS PER PAGE) ──
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProblems = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredProblems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProblems, safeCurrentPage]);

  const startItemIdx = filteredProblems.length > 0 ? (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const endItemIdx = Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredProblems.length);

  // Handlers that reset page to 1
  const withPageReset =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setCurrentPage(1);
    };
  const handleTabChange = withPageReset(setActiveStatusTab);
  const handleSearchChange = withPageReset(setSearchKey);
  const handleTopicFilterChange = withPageReset(setTopicFilter);
  const handleDiffFilterChange = withPageReset(setDiffFilter);
  const handleSourceFilterChange = withPageReset(setSourceFilter);
  const handleVerifyFilterChange = withPageReset(setVerifyFilter);

  const runAction = async (p: AdminProblem, action: (p: AdminProblem) => Promise<void>) => {
    setBusyId(p.id);
    setActionError(null);
    try {
      await action(p);
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const viewingRaw = viewingProblem?.raw ?? null;

  return (
    <div className="admin-tab-content">
      {/* 1. Xac nhan xoa */}
      <ConfirmDialog
        isOpen={deletingProblem !== null}
        title="Xóa bài tập khỏi hệ thống?"
        message={
          deletingProblem
            ? `Bạn có chắc chắn muốn xóa bài #${deletingProblem.raw.id} "${deletingProblem.ui.title}" không? Thao tác này không thể hoàn tác.`
            : ''
        }
        confirmLabel="Xác nhận xóa"
        cancelLabel="Hủy bỏ"
        variant="danger"
        onConfirm={() => {
          const target = deletingProblem;
          setDeletingProblem(null);
          if (target) void runAction(target.raw, onDelete);
        }}
        onCancel={() => setDeletingProblem(null)}
      />

      {/* 2. Kiem tra (verify) */}
      {testingProblem && (
        <AdminVerifyModal
          problem={testingProblem}
          onClose={() => setTestingProblem(null)}
          onResult={(id, res) => setVerifyMap((prev) => ({ ...prev, [id]: res }))}
          onPublish={onTogglePublish}
        />
      )}

      {/* 3. Chi tiet bai */}
      {viewingProblem && viewingRaw && (
        <div className="dialog-overlay" onClick={() => setViewingProblem(null)}>
          <div className="dialog-box" style={{ maxWidth: '760px', textAlign: 'left', padding: '28px 32px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      background: DIFFICULTY_COLORS[viewingProblem.ui.difficulty]?.bg || '#78d39e18',
                      color: DIFFICULTY_COLORS[viewingProblem.ui.difficulty]?.color || '#78d39e',
                      border: `1px solid ${DIFFICULTY_COLORS[viewingProblem.ui.difficulty]?.border || '#78d39e33'}`,
                    }}
                  >
                    {viewingRaw.level ?? viewingProblem.ui.difficulty}
                  </span>
                  <span className="prob-topic-badge" style={{ fontSize: '11.5px', padding: '2px 8px' }}>
                    {viewingProblem.ui.topic}
                  </span>
                  {viewingRaw.sourceType === 'AI_GENERATED' ? (
                    <span className="prob-badge-tag ai">Sinh từ template</span>
                  ) : (
                    <span className="prob-badge-tag manual">Thêm tay</span>
                  )}
                  <span className={`toggle-switch-label ${viewingRaw.status === 'PUBLISHED' ? 'is-public' : ''}`}>
                    {viewingRaw.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp'}
                  </span>
                </div>
                <h2 className="dialog-title admin-modal-title" style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                  #{viewingRaw.id} {viewingProblem.ui.title}
                </h2>
                <span className="admin-modal-sub" style={{ fontSize: '12px' }}>
                  {viewingRaw.template ? `Template: ${viewingRaw.template.name}` : 'Không có template'}
                  {' · '}Ngôn ngữ: {LANGUAGE_LABELS[viewingRaw.languageId] ?? `#${viewingRaw.languageId}`}
                  {' · '}Tạo lúc: {new Date(viewingRaw.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <button className="dialog-close" onClick={() => setViewingProblem(null)} aria-label="Đóng">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '65vh', overflowY: 'auto', paddingRight: '4px' }}>
              {/* De bai */}
              <div>
                <h4 className="admin-modal-section-title">Đề bài</h4>
                <p className="admin-modal-section-body" style={{ whiteSpace: 'pre-wrap' }}>
                  {viewingRaw.statement}
                </p>
              </div>

              {/* Test cases */}
              <div className="admin-example-card">
                <h4 className="admin-example-title">
                  <Code2 size={14} /> Bộ test case ({viewingRaw.testCases.length})
                </h4>
                {viewingRaw.testCases.length === 0 ? (
                  <div className="admin-example-code-box">Chưa có test case nào.</div>
                ) : (
                  viewingRaw.testCases.map((tc, i) => (
                    <div className="admin-example-code-box" key={tc.id} style={{ whiteSpace: 'pre-wrap', marginBottom: '8px' }}>
                      <div><strong>Test {i + 1} — Input:</strong> {tc.input}</div>
                      <div><strong>Output:</strong> {tc.expectedOutput}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Loi giai mau */}
              <div>
                <h4 className="admin-modal-section-title">Lời giải mẫu (Reference Solution)</h4>
                <pre className="admin-starter-code-block">
                  {viewingRaw.referenceSolution || viewingRaw.template?.referenceSolutionCode || '(Không có lời giải mẫu)'}
                </pre>
              </div>
            </div>

            <div className="dialog-actions" style={{ marginTop: '20px' }}>
              <button className="dialog-cancel" onClick={() => setViewingProblem(null)}>
                Đóng
              </button>
              <button
                className="dialog-confirm"
                style={{ background: '#4b78f5' }}
                onClick={() => {
                  setViewingProblem(null);
                  setTestingProblem(viewingRaw);
                }}
              >
                <FlaskConical size={15} /> Kiểm tra test case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ROW ── */}
      <div className="admin-header-row">
        <div>
          <h1 className="admin-page-title">Duyệt đề & Quản lý bài tập</h1>
          <p className="admin-page-sub">
            Ngân hàng hiện có <strong>{problems.length}</strong> bài tập ({draftCount} bài nháp chờ duyệt & {publishedCount} bài đã xuất bản).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="dialog-cancel"
            onClick={onReload}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Tải lại danh sách từ máy chủ"
          >
            <RefreshCw size={16} className={loading ? 'spin' : undefined} /> Tải lại
          </button>
          <button
            className="dialog-cancel"
            onClick={onGoGenerator}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#a995ff',
              borderColor: 'rgba(169, 149, 255, 0.3)',
              background: 'rgba(169, 149, 255, 0.1)',
            }}
          >
            <Sparkles size={16} /> Sinh đề tự động
          </button>
          <button
            className="assessment-primary"
            disabled
            title="Chưa hỗ trợ"
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            <Plus size={16} /> Thêm bài mới
          </button>
        </div>
      </div>

      {(error || actionError) && (
        <div
          style={{
            background: 'rgba(240, 138, 138, 0.12)',
            border: '1px solid rgba(240, 138, 138, 0.35)',
            color: '#f08a8a',
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertTriangle size={18} />
          <span style={{ flex: 1 }}>{actionError ?? error}</span>
          {actionError && (
            <button type="button" className="dialog-close" style={{ position: 'static' }} onClick={() => setActionError(null)} aria-label="Đóng">
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* ── UNIFIED CONTROL BAR (PILL TABS + FILTERS) ── */}
      <div className={`admin-unified-control-bar theme-${activeStatusTab === 'draft' ? 'ai' : 'manual'}`}>
        <div className="unified-toggle-tabs">
          <button
            type="button"
            className={`unified-tab-btn ${activeStatusTab === 'draft' ? 'is-active' : ''}`}
            onClick={() => handleTabChange('draft')}
          >
            <FileClock size={15} />
            <span>Nháp chờ duyệt ({draftCount})</span>
          </button>
          <button
            type="button"
            className={`unified-tab-btn ${activeStatusTab === 'published' ? 'is-active' : ''}`}
            onClick={() => handleTabChange('published')}
          >
            <Globe size={15} />
            <span>Đã xuất bản ({publishedCount})</span>
          </button>
        </div>

        <div className="unified-v-divider" />

        <div className="unified-filters-group">
          <div className="history-search-wrap" style={{ minWidth: '200px' }}>
            <Search size={16} className="history-search-icon" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã, chủ đề..."
              value={searchKey}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <SearchableSelect
            options={topicOptions}
            value={topicFilter}
            onChange={handleTopicFilterChange}
            icon={Filter}
            placeholder="Chủ đề"
          />

          <SearchableSelect
            options={DIFF_OPTIONS}
            value={diffFilter}
            onChange={handleDiffFilterChange}
            icon={Filter}
            placeholder="Độ khó"
            showSearch={false}
          />

          <SearchableSelect
            options={SOURCE_OPTIONS}
            value={sourceFilter}
            onChange={handleSourceFilterChange}
            icon={Sparkles}
            placeholder="Nguồn"
            showSearch={false}
          />

          <SearchableSelect
            options={VERIFY_OPTIONS}
            value={verifyFilter}
            onChange={handleVerifyFilterChange}
            icon={FlaskConical}
            placeholder="Kiểm tra"
            showSearch={false}
          />
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className={`admin-framed-tab-box theme-${activeStatusTab === 'draft' ? 'ai' : 'manual'}`}>
        <div className="admin-framed-tab-header">
          <div className="framed-tab-info-tag">
            {activeStatusTab === 'draft' ? (
              <span className="info-tag-content ai">
                <FileClock size={13} /> Bài nháp — Kiểm tra rồi Xuất bản cho sinh viên ({filteredProblems.length} bài)
              </span>
            ) : (
              <span className="info-tag-content manual">
                <Globe size={13} /> Bài đã xuất bản — sinh viên đang thấy ({filteredProblems.length} bài)
              </span>
            )}
          </div>
        </div>

        <div className="admin-framed-tab-body">
          {loading && problems.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#7d8599' }}>
              <RefreshCw size={18} className="spin" /> Đang tải danh sách bài tập...
            </div>
          ) : filteredProblems.length > 0 ? (
            <>
              <div className="admin-table-container">
                <table className="admin-problems-table">
                  <thead>
                    <tr>
                      <th style={{ width: '35px', textAlign: 'center' }}>#</th>
                      <th>Tên bài tập</th>
                      <th>Chủ đề</th>
                      <th>Độ khó</th>
                      <th>Kiểm tra</th>
                      <th>Trạng thái</th>
                      <th style={{ textAlign: 'center', width: '120px' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProblems.map((row, idx) => {
                      const { raw, ui } = row;
                      const TopicIcon = topicIcon(ui.topic);
                      const diffStyle = DIFFICULTY_COLORS[ui.difficulty] || DIFFICULTY_COLORS.Easy;
                      const vState = verifyState(raw.id);
                      const vr = verifyMap[raw.id];
                      const isPublic = raw.status === 'PUBLISHED';
                      const busy = busyId === raw.id;

                      return (
                        <tr key={raw.id}>
                          <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>
                            {startItemIdx + idx}
                          </td>

                          <td>
                            <div className="prob-title-wrap">
                              <div className="prob-title-text" title={ui.title}>
                                <span>#{raw.id} {ui.title}</span>
                                {raw.sourceType === 'AI_GENERATED' ? (
                                  <span className="prob-badge-tag ai">
                                    <Sparkles size={10} /> Template
                                  </span>
                                ) : (
                                  <span className="prob-badge-tag manual">
                                    <Edit3 size={10} /> Thêm tay
                                  </span>
                                )}
                              </div>
                              <div className="prob-desc-snippet" title={ui.description}>
                                {raw.template ? `${raw.template.name} · ` : ''}
                                {raw.testCases.length} test case
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="prob-topic-badge">
                              <TopicIcon size={13} style={{ color: '#5e8dfa' }} />
                              <span>{ui.topic}</span>
                            </div>
                          </td>

                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                background: diffStyle.bg,
                                color: diffStyle.color,
                                border: `1px solid ${diffStyle.border}`,
                              }}
                              title={raw.level ?? undefined}
                            >
                              {diffStyle.label}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`verify-status-badge ${vState === 'passed' ? 'verified' : 'pending'}`}
                              onClick={() => setTestingProblem(raw)}
                              style={vState === 'failed' ? { color: '#f08a8a', borderColor: 'rgba(240, 138, 138, 0.35)' } : undefined}
                              title="Bấm để chạy lời giải mẫu với toàn bộ test case"
                            >
                              {vState === 'passed' && vr ? (
                                <>
                                  <CheckCircle2 size={13} /> Đạt {vr.results.length}/{vr.results.length}
                                </>
                              ) : vState === 'failed' && vr ? (
                                <>
                                  <XCircle size={13} /> Lỗi {vr.results.filter((r) => r.passed).length}/{vr.results.length}
                                </>
                              ) : (
                                <>
                                  <FlaskConical size={13} /> Chưa kiểm tra
                                </>
                              )}
                            </span>
                          </td>

                          <td>
                            <div
                              className="toggle-switch-wrap"
                              onClick={() => {
                                if (!busy) void runAction(raw, onTogglePublish);
                              }}
                              style={busy ? { opacity: 0.5, cursor: 'wait' } : undefined}
                              title={isPublic ? 'Nhấp để gỡ xuất bản (chuyển về Nháp)' : 'Nhấp để xuất bản cho sinh viên'}
                            >
                              <div className={`toggle-switch-btn ${isPublic ? 'is-public' : ''}`}>
                                <div className="toggle-switch-knob" />
                              </div>
                              <span className={`toggle-switch-label ${isPublic ? 'is-public' : ''}`}>
                                {isPublic ? 'Đã xuất bản' : 'Nháp'}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div className="action-icon-group" style={{ justifyContent: 'center' }}>
                              <button
                                type="button"
                                className="icon-action-btn view"
                                onClick={() => setViewingProblem(row)}
                                title="Xem chi tiết: đề bài, test case, lời giải mẫu"
                              >
                                <Eye size={14} />
                              </button>

                              <button
                                type="button"
                                className="icon-action-btn test"
                                onClick={() => setTestingProblem(raw)}
                                title="Kiểm tra: chạy lời giải mẫu với toàn bộ test case"
                              >
                                <Play size={14} />
                              </button>

                              <button
                                type="button"
                                className="icon-action-btn delete"
                                onClick={() => setDeletingProblem(row)}
                                disabled={busy || !canDelete}
                                style={!canDelete ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
                                title={canDelete ? 'Xóa bài tập' : 'Chỉ admin được xóa bài'}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── PAGINATION CONTROLS BAR (20 ITEMS PER PAGE) ── */}
              <div
                className="admin-pagination-bar"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div className="pagination-info" style={{ fontSize: '13px' }}>
                  Hiển thị bài thứ <strong>{startItemIdx} - {endItemIdx}</strong> trên tổng số <strong>{filteredProblems.length}</strong> bài tập (Trang {safeCurrentPage}/{totalPages})
                </div>

                <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={14} /> Trước
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`pagination-num ${pageNum === safeCurrentPage ? 'is-active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Sau <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                color: '#7d8599',
                background: 'rgba(255, 255, 255, 0.015)',
                borderRadius: '12px',
                border: '1px dashed #1e2638',
              }}
            >
              <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 600, color: '#94a3b8' }}>
                {problems.length === 0
                  ? 'Chưa có bài tập nào trong hệ thống.'
                  : 'Không tìm thấy bài tập nào phù hợp với bộ lọc hiện tại.'}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                {problems.length === 0
                  ? 'Vào mục Sinh đề tự động để tạo bài nháp từ template.'
                  : 'Thử thay đổi từ khóa tìm kiếm hoặc chọn lại các bộ lọc.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

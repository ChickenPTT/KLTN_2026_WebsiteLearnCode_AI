import { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  Filter,
  Flame,
  Search,
  Sparkles,
  Terminal,
  X,
  XCircle,
  Zap,
  RotateCcw,
  Eye,
  Lightbulb,
} from 'lucide-react';
import { Header } from '@/layout/Header';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Pagination } from '@/components/Pagination';
import type { AuthMode } from '@/types';
import { historyApi, type BackendHistoryDetail, type BackendHistoryItem } from '@/lib/api';
import { sameTopic, toDifficulty } from '@/lib/problemsApi';
import { useMyHistory } from '@/hooks/useMyHistory';
import { formatDateTime, formatMemory, formatRuntime, languageLabel, topicOf } from '@/lib/progress';

interface HistoryPageProps {
  onBack: () => void;
  onGoLanding?: () => void;
  onGoAuth?: (mode: AuthMode) => void;
  onGoTopics?: () => void;
  onGoProfile?: () => void;
  onGoProgress?: () => void;
  onGoHistory?: () => void;
  onGoAdmin?: () => void;
  onGoSettings?: () => void;
  onLoggedOut?: () => void;
}

const DIFF_COLORS: Record<string, string> = {
  Easy: '#78d39e',
  Medium: '#f5c95d',
  Hard: '#f08a8a',
};

const ERROR_TYPE_LABELS: Record<string, string> = {
  logic: 'Lỗi logic',
  edge_case: 'Trường hợp biên',
  runtime: 'Lỗi runtime',
  compile: 'Lỗi biên dịch',
  performance: 'Hiệu năng',
  none: 'Không có lỗi',
};

/** Cac lan nop cua cung 1 bai, gop thanh 1 dong trong bang */
interface ProblemRecord {
  problemId: number;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  /** Moi nhat truoc */
  attempts: BackendHistoryItem[];
}

function groupByProblem(history: BackendHistoryItem[]): ProblemRecord[] {
  const map = new Map<number, ProblemRecord>();
  // history da sap xep moi nhat truoc -> thu tu dong theo lan nop gan nhat
  history.forEach((h) => {
    let rec = map.get(h.problemId);
    if (!rec) {
      rec = {
        problemId: h.problemId,
        title: h.problemTitle,
        topic: topicOf(h),
        difficulty: toDifficulty(h.level),
        attempts: [],
      };
      map.set(h.problemId, rec);
    }
    rec.attempts.push(h);
  });
  return [...map.values()];
}

export function HistoryPage({
  onGoLanding,
  onGoAuth,
  onGoTopics,
  onGoProfile,
  onGoProgress,
  onGoHistory,
  onGoAdmin,
  onGoSettings,
  onLoggedOut,
}: HistoryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');

  const [selectedRecord, setSelectedRecord] = useState<ProblemRecord | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [subPage, setSubPage] = useState(1);

  const { history, loading, error, reload } = useMyHistory();
  const records = useMemo(() => groupByProblem(history), [history]);

  // Chi tiet (code + nhan xet AI) tai khi mo, cache theo id lan nop
  const [details, setDetails] = useState<Record<number, BackendHistoryDetail>>({});
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAttemptId == null || details[selectedAttemptId]) return;
    let cancelled = false;
    setDetailError(null);
    historyApi
      .myHistoryDetail(selectedAttemptId)
      .then((d) => {
        if (!cancelled) setDetails((prev) => ({ ...prev, [d.summary.id]: d }));
      })
      .catch((e: unknown) => {
        if (!cancelled) setDetailError(e instanceof Error ? e.message : 'Không tải được chi tiết lần nộp.');
      });
    return () => {
      cancelled = true;
    };
  }, [selectedAttemptId, details]);

  const topicOptions = useMemo(() => {
    const names: string[] = [];
    records.forEach((r) => {
      if (!names.some((n) => sameTopic(n, r.topic))) names.push(r.topic);
    });
    return names.sort((a, b) => a.localeCompare(b));
  }, [records]);

  const filteredRecords = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return records.filter((r) => {
      const latestPassed = r.attempts[0].passed;
      const matchSearch = !q || r.title.toLowerCase().includes(q) || r.topic.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === 'all' || (statusFilter === 'passed' ? latestPassed : !latestPassed);
      const matchTopic = topicFilter === 'all' || sameTopic(r.topic, topicFilter);
      return matchSearch && matchStatus && matchTopic;
    });
  }, [records, searchTerm, statusFilter, topicFilter]);

  // ── Thong ke tong quan (tren toan bo lich su) ──
  const totalSubs = history.length;
  const passRate = totalSubs ? Math.round((history.filter((h) => h.passed).length / totalSubs) * 100) : 0;
  const runtimes = history.map((h) => h.maxTime).filter((t): t is number => t != null);
  const avgRuntime = runtimes.length ? runtimes.reduce((a, b) => a + b, 0) / runtimes.length : null;
  const topTopic = useMemo(() => {
    const counts = new Map<string, number>();
    history.forEach((h) => counts.set(topicOf(h), (counts.get(topicOf(h)) ?? 0) + 1));
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return sorted.length ? sorted[0][0] : null;
  }, [history]);

  const totalSubPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const safeSubPage = Math.min(subPage, totalSubPages);

  const paginatedRecords = useMemo(() => {
    const start = (safeSubPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, safeSubPage, pageSize]);

  const handleOpenDetail = (record: ProblemRecord) => {
    setSelectedRecord(record);
    setSelectedAttemptId(record.attempts[0]?.id ?? null);
  };

  const activeAttempt = useMemo(() => {
    if (!selectedRecord) return null;
    return selectedRecord.attempts.find((a) => a.id === selectedAttemptId) || selectedRecord.attempts[0];
  }, [selectedRecord, selectedAttemptId]);

  const activeDetail = activeAttempt ? details[activeAttempt.id] : undefined;
  // So thu tu lan nop (1 = cu nhat)
  const attemptNumber = (rec: ProblemRecord, id: number) => rec.attempts.length - rec.attempts.findIndex((a) => a.id === id);

  return (
    <div className="page-shell">
      <Header
        activeView="history"
        onGoLanding={onGoLanding}
        onGoAuth={onGoAuth}
        onGoTopics={onGoTopics}
        onGoProfile={onGoProfile}
        onGoProgress={onGoProgress}
        onGoHistory={onGoHistory}
        onGoAdmin={onGoAdmin}
        onGoSettings={onGoSettings}
        onLoggedOut={onLoggedOut}
      />

      <main className="history-main">
        {/* ── Title & Intro ── */}
        <div className="history-header">
          <h1 className="history-title" style={{ fontSize: '26px' }}>
            <BookOpen size={26} className="history-title-icon" /> Lịch sử nộp bài
          </h1>
          <p className="history-sub" style={{ marginTop: '2px', fontSize: '13.5px' }}>
            Xem lại tất cả các lần nộp bài, thời gian thực thi, kết quả test case và code đã viết.
          </p>
        </div>

        {/* ── Overview stats ── */}
        <div className="history-stats-grid">
          <div className="history-stat-card">
            <div className="history-stat-icon count">
              <Code2 size={20} />
            </div>
            <div>
              <strong>{totalSubs}</strong>
              <span>Lần nộp bài</span>
            </div>
          </div>

          <div className="history-stat-card">
            <div className="history-stat-icon pass">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <strong>{passRate}%</strong>
              <span>Tỷ lệ Accepted</span>
            </div>
          </div>

          <div className="history-stat-card">
            <div className="history-stat-icon time">
              <Zap size={20} />
            </div>
            <div>
              <strong>{formatRuntime(avgRuntime)}</strong>
              <span>Thời gian chạy trung bình</span>
            </div>
          </div>

          <div className="history-stat-card">
            <div className="history-stat-icon topic">
              <Flame size={20} />
            </div>
            <div>
              <strong>{topTopic ?? '—'}</strong>
              <span>Chủ đề làm nhiều nhất</span>
            </div>
          </div>
        </div>

        {/* ── Filters bar ── */}
        <div className="history-filter-bar">
          <div className="history-search-wrap">
            <Search size={16} className="history-search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên bài tập hoặc chủ đề..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSubPage(1);
              }}
            />
          </div>

          <div className="history-filter-controls">
            <SearchableSelect
              options={[
                { label: 'Tất cả kết quả', value: 'all' },
                { label: 'Accepted (Thành công)', value: 'passed' },
                { label: 'Wrong Answer (Thất bại)', value: 'failed' },
              ]}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val as 'all' | 'passed' | 'failed');
                setSubPage(1);
              }}
              icon={<Filter size={15} />}
              showSearch={false}
            />

            <SearchableSelect
              options={[
                { label: 'Tất cả chủ đề', value: 'all' },
                ...topicOptions.map((t) => ({ label: t, value: t })),
              ]}
              value={topicFilter}
              onChange={(val) => {
                setTopicFilter(val);
                setSubPage(1);
              }}
              icon={<Filter size={15} />}
              showSearch={true}
            />
          </div>
        </div>

        {/* ── Submissions Table ── */}
        <div className="history-table-card">
          <table className="history-table full-history-table">
            <thead>
              <tr>
                <th>Tên bài tập</th>
                <th>Chủ đề</th>
                <th>Độ khó</th>
                <th>Số lần đã luyện</th>
                <th>Kết quả gần nhất</th>
                <th>Thời gian nộp</th>
                <th style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#7d8599' }}>
                    Đang tải lịch sử nộp bài...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#f08a8a' }}>
                    Không tải được lịch sử: {error}{' '}
                    <button className="assessment-ghost" onClick={reload} style={{ marginLeft: 8, padding: '4px 12px' }}>
                      Thử lại
                    </button>
                  </td>
                </tr>
              ) : paginatedRecords.length > 0 ? (
                paginatedRecords.map((r) => {
                  const latest = r.attempts[0];
                  return (
                    <tr key={r.problemId} onClick={() => handleOpenDetail(r)} style={{ cursor: 'pointer' }}>
                      <td className="history-problem">{r.title}</td>
                      <td>
                        <span className="practice-topic-tag">{r.topic}</span>
                      </td>
                      <td>
                        <span style={{ color: DIFF_COLORS[r.difficulty], fontWeight: 600 }}>{r.difficulty}</span>
                      </td>
                      <td>
                        <span className="attempt-badge">
                          <RotateCcw size={12} /> {r.attempts.length} lần
                        </span>
                      </td>
                      <td>
                        {latest.passed ? (
                          <span className="history-status pass">
                            <CheckCircle2 size={14} /> Accepted
                          </span>
                        ) : (
                          <span className="history-status fail">
                            <XCircle size={14} /> Wrong Answer
                          </span>
                        )}
                      </td>
                      <td className="history-time">{formatDateTime(latest.submittedAt)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="history-eye-btn"
                          title="Xem chi tiết các lần nộp & nhận xét hệ thống"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(r);
                          }}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#7d8599' }}>
                    {records.length === 0
                      ? 'Bạn chưa nộp bài nào. Hãy chọn một chủ đề và bắt đầu luyện tập!'
                      : 'Không tìm thấy bài nộp nào phù hợp với bộ lọc.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ── Pagination Bar ── */}
          <Pagination
            currentPage={safeSubPage}
            totalPages={totalSubPages}
            pageSize={pageSize}
            totalItems={filteredRecords.length}
            onPageChange={setSubPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setSubPage(1);
            }}
          />
        </div>
      </main>

      {/* ── Expanded Detail Modal (XEM TẤT CẢ LẦN NỘP & NHẬN XÉT HỆ THỐNG) ── */}
      {selectedRecord && activeAttempt && (
        <div className="dialog-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="expanded-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="dialog-close" onClick={() => setSelectedRecord(null)}>
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="expanded-modal-header">
              <div className="expanded-modal-title-row">
                <Code2 size={22} className="title-icon" />
                <h2>{selectedRecord.title}</h2>
                <span className="practice-topic-tag">{selectedRecord.topic}</span>
                <span style={{ color: DIFF_COLORS[selectedRecord.difficulty], fontWeight: 600 }}>
                  {selectedRecord.difficulty}
                </span>
                <span className="attempt-badge modal-badge">
                  <RotateCcw size={12} /> Tổng {selectedRecord.attempts.length} lần nộp
                </span>
              </div>
            </div>

            {/* Modal Body: 2 Columns */}
            <div className="expanded-modal-body">
              {/* Left Column: Attempts list */}
              <div className="attempts-sidebar">
                <h4 className="attempts-sidebar-title">
                  <RotateCcw size={14} /> Các lần nộp ({selectedRecord.attempts.length})
                </h4>
                <div className="attempts-list">
                  {selectedRecord.attempts.map((att) => (
                    <button
                      key={att.id}
                      className={`attempt-item-btn ${att.id === activeAttempt.id ? 'is-active' : ''}`}
                      onClick={() => setSelectedAttemptId(att.id)}
                    >
                      <div className="attempt-item-head">
                        <span className="attempt-name">Lần {attemptNumber(selectedRecord, att.id)}</span>
                        <span className={`attempt-status-pill ${att.passed ? 'passed' : 'failed'}`}>
                          {att.passed ? 'Accepted' : 'Wrong Answer'}
                        </span>
                      </div>
                      <span className="attempt-time">{formatDateTime(att.submittedAt)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Detailed Attempt view */}
              <div className="attempt-detail-content">
                {/* Stats Summary Bar inside detail */}
                <div className="attempt-stats-bar">
                  <div className={`status-pill-large ${activeAttempt.passed ? 'passed' : 'failed'}`}>
                    {activeAttempt.passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    <span>{activeAttempt.passed ? 'Accepted' : 'Wrong Answer'}</span>
                    {activeAttempt.totalCount != null && (
                      <span className="test-count">
                        ({activeAttempt.passedCount ?? 0}/{activeAttempt.totalCount} test cases)
                      </span>
                    )}
                  </div>

                  <div className="attempt-metric-pills">
                    <span className="metric-pill">
                      <Clock size={14} /> Runtime: <strong>{formatRuntime(activeAttempt.maxTime)}</strong>
                    </span>
                    <span className="metric-pill">
                      <Zap size={14} /> Memory: <strong>{formatMemory(activeAttempt.maxMemory)}</strong>
                    </span>
                    <span className="metric-pill">
                      <Terminal size={14} /> Language: <strong>{languageLabel(activeAttempt.languageId)}</strong>
                    </span>
                  </div>
                </div>

                {detailError && !activeDetail && (
                  <p style={{ color: '#f08a8a', fontSize: 13 }}>{detailError}</p>
                )}
                {!activeDetail && !detailError && (
                  <p style={{ color: '#7d8599', fontSize: 13 }}>Đang tải chi tiết lần nộp...</p>
                )}

                {activeDetail && (
                  <>
                    {/* System & AI Feedback Box */}
                    <div className="ai-feedback-box">
                      <div className="ai-feedback-head">
                        <Sparkles size={16} className="sparkle-icon" />
                        <span>Nhận xét & Đánh giá từ Hệ thống / AI</span>
                      </div>

                      {activeDetail.aiFeedback ? (
                        <>
                          <p className="ai-feedback-overall">
                            {activeDetail.aiFeedback.explanation || 'AI không có nhận xét thêm cho lần nộp này.'}
                          </p>

                          <div className="ai-feedback-grid">
                            {activeDetail.aiFeedback.errorType && (
                              <div className="ai-feedback-chip">
                                <strong>Loại lỗi:</strong>{' '}
                                {ERROR_TYPE_LABELS[activeDetail.aiFeedback.errorType] ?? activeDetail.aiFeedback.errorType}
                              </div>
                            )}
                            {activeDetail.aiFeedback.severity && activeDetail.aiFeedback.severity !== 'none' && (
                              <div className="ai-feedback-chip">
                                <strong>Mức độ:</strong>{' '}
                                {activeDetail.aiFeedback.severity === 'major' ? 'Nghiêm trọng' : 'Nhẹ'}
                              </div>
                            )}
                            {activeDetail.aiFeedback.suspectedLines.length > 0 && (
                              <div className="ai-feedback-chip">
                                <strong>Dòng cần xem lại:</strong> {activeDetail.aiFeedback.suspectedLines.join(', ')}
                              </div>
                            )}
                          </div>

                          {activeDetail.aiFeedback.hint && (
                            <div className="ai-feedback-suggestions">
                              <div className="suggestions-title">
                                <Lightbulb size={14} /> Gợi ý cải thiện:
                              </div>
                              <ul>
                                <li>{activeDetail.aiFeedback.hint}</li>
                              </ul>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="ai-feedback-overall">
                          {activeAttempt.passed
                            ? 'Bài làm đã vượt qua toàn bộ test case.'
                            : 'Lần nộp này chưa có nhận xét từ AI.'}
                        </p>
                      )}
                    </div>

                    {/* Submitted Code Viewer */}
                    <div className="history-code-block">
                      <div className="history-code-header">
                        <span>
                          <Terminal size={14} /> Code đã nộp — {languageLabel(activeAttempt.languageId)} (Lần{' '}
                          {attemptNumber(selectedRecord, activeAttempt.id)})
                        </span>
                      </div>
                      <pre>
                        <code>{activeDetail.sourceCode ?? '(Lần nộp cũ — hệ thống chưa lưu code)'}</code>
                      </pre>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="dialog-actions" style={{ marginTop: '16px' }}>
              <button className="dialog-cancel" onClick={() => setSelectedRecord(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
import { TOPICS, type AuthMode } from '@/types';
import {
  MOCK_SUBMISSIONS,
  type SubmissionRecord,
} from '@/data/userMockData';

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

const SUBS_PER_PAGE = 5;

export function HistoryPage({
  onBack,
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
  
  const [selectedRecord, setSelectedRecord] = useState<SubmissionRecord | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string>('');
  const [subPage, setSubPage] = useState(1);

  const filteredSubmissions = useMemo(() => {
    return MOCK_SUBMISSIONS.filter((s) => {
      const matchSearch =
        s.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.topic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchTopic = topicFilter === 'all' || s.topic === topicFilter;
      return matchSearch && matchStatus && matchTopic;
    });
  }, [searchTerm, statusFilter, topicFilter]);

  const totalSubs = MOCK_SUBMISSIONS.length;
  const passedSubs = MOCK_SUBMISSIONS.filter((s) => s.status === 'passed').length;
  const passRate = Math.round((passedSubs / totalSubs) * 100);

  const totalSubPages = Math.max(1, Math.ceil(filteredSubmissions.length / SUBS_PER_PAGE));
  const paginatedSubmissions = useMemo(() => {
    const start = (subPage - 1) * SUBS_PER_PAGE;
    return filteredSubmissions.slice(start, start + SUBS_PER_PAGE);
  }, [filteredSubmissions, subPage]);

  const handleOpenDetail = (record: SubmissionRecord) => {
    setSelectedRecord(record);
    if (record.attempts.length > 0) {
      setSelectedAttemptId(record.attempts[0].attemptId);
    }
  };

  const activeAttempt = useMemo(() => {
    if (!selectedRecord) return null;
    return (
      selectedRecord.attempts.find((a) => a.attemptId === selectedAttemptId) ||
      selectedRecord.attempts[0]
    );
  }, [selectedRecord, selectedAttemptId]);

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
        <div style={{ marginBottom: '8px' }}>
          <button className="auth-back" style={{ position: 'static' }} onClick={onBack}>
            <ArrowLeft size={18} /> Quay lại
          </button>
        </div>

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
              <strong>48 ms</strong>
              <span>Thời gian chạy trung bình</span>
            </div>
          </div>

          <div className="history-stat-card">
            <div className="history-stat-icon topic">
              <Flame size={20} />
            </div>
            <div>
              <strong>Array</strong>
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
                ...TOPICS.map((t) => ({ label: t, value: t })),
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
              {paginatedSubmissions.length > 0 ? (
                paginatedSubmissions.map((s) => (
                  <tr key={s.id} onClick={() => handleOpenDetail(s)} style={{ cursor: 'pointer' }}>
                    <td className="history-problem">{s.problem}</td>
                    <td>
                      <span className="practice-topic-tag">{s.topic}</span>
                    </td>
                    <td>
                      <span style={{ color: DIFF_COLORS[s.difficulty], fontWeight: 600 }}>
                        {s.difficulty}
                      </span>
                    </td>
                    <td>
                      <span className="attempt-badge">
                        <RotateCcw size={12} /> {s.attemptCount} lần
                      </span>
                    </td>
                    <td>
                      {s.status === 'passed' ? (
                        <span className="history-status pass">
                          <CheckCircle2 size={14} /> Accepted
                        </span>
                      ) : (
                        <span className="history-status fail">
                          <XCircle size={14} /> Wrong Answer
                        </span>
                      )}
                    </td>
                    <td className="history-time">{s.timestamp}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="history-eye-btn"
                        title="Xem chi tiết các lần nộp & nhận xét hệ thống"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(s);
                        }}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#7d8599' }}>
                    Không tìm thấy bài nộp nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ── Pagination Bar ── */}
          <div className="admin-pagination-bar">
            <span className="pagination-info">
              Hiển thị {filteredSubmissions.length > 0 ? (subPage - 1) * SUBS_PER_PAGE + 1 : 0} -{' '}
              {Math.min(subPage * SUBS_PER_PAGE, filteredSubmissions.length)} trên tổng số{' '}
              {filteredSubmissions.length} lượt nộp
            </span>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                disabled={subPage === 1}
                onClick={() => setSubPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} /> Trước
              </button>

              {Array.from({ length: totalSubPages }).map((_, i) => (
                <button
                  key={i + 1}
                  className={`pagination-num ${subPage === i + 1 ? 'is-active' : ''}`}
                  onClick={() => setSubPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="pagination-btn"
                disabled={subPage === totalSubPages}
                onClick={() => setSubPage((p) => Math.min(totalSubPages, p + 1))}
              >
                Tiếp <ChevronRight size={16} />
              </button>
            </div>
          </div>
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
                <h2>{selectedRecord.problem}</h2>
                <span className="practice-topic-tag">{selectedRecord.topic}</span>
                <span style={{ color: DIFF_COLORS[selectedRecord.difficulty], fontWeight: 600 }}>
                  {selectedRecord.difficulty}
                </span>
                <span className="attempt-badge modal-badge">
                  <RotateCcw size={12} /> Tổng {selectedRecord.attemptCount} lần nộp
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
                      key={att.attemptId}
                      className={`attempt-item-btn ${att.attemptId === activeAttempt.attemptId ? 'is-active' : ''}`}
                      onClick={() => setSelectedAttemptId(att.attemptId)}
                    >
                      <div className="attempt-item-head">
                        <span className="attempt-name">Lần {att.attemptNumber}</span>
                        <span className={`attempt-status-pill ${att.status}`}>
                          {att.status === 'passed' ? 'Accepted' : 'Wrong Answer'}
                        </span>
                      </div>
                      <span className="attempt-time">{att.timestamp}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Detailed Attempt view */}
              <div className="attempt-detail-content">
                {/* Stats Summary Bar inside detail */}
                <div className="attempt-stats-bar">
                  <div className={`status-pill-large ${activeAttempt.status}`}>
                    {activeAttempt.status === 'passed' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    <span>{activeAttempt.status === 'passed' ? 'Accepted' : 'Wrong Answer'}</span>
                    <span className="test-count">({activeAttempt.testPassedCount}/{activeAttempt.testTotalCount} test cases)</span>
                  </div>

                  {/* THỜI GIAN & BỘ NHỚ ĐƯỢC ĐƯA VÀO ĐÂY */}
                  <div className="attempt-metric-pills">
                    <span className="metric-pill">
                      <Clock size={14} /> Runtime: <strong>{activeAttempt.runtime}</strong>
                    </span>
                    <span className="metric-pill">
                      <Zap size={14} /> Memory: <strong>{activeAttempt.memory}</strong>
                    </span>
                    <span className="metric-pill">
                      <Terminal size={14} /> Language: <strong>{activeAttempt.language}</strong>
                    </span>
                  </div>
                </div>

                {/* System & AI Feedback Box */}
                <div className="ai-feedback-box">
                  <div className="ai-feedback-head">
                    <Sparkles size={16} className="sparkle-icon" />
                    <span>Nhận xét & Đánh giá từ Hệ thống / AI</span>
                  </div>

                  <p className="ai-feedback-overall">{activeAttempt.feedback.overall}</p>

                  <div className="ai-feedback-grid">
                    <div className="ai-feedback-chip">
                      <strong>Độ phức tạp:</strong> {activeAttempt.feedback.complexity}
                    </div>
                    <div className="ai-feedback-chip">
                      <strong>Phong cách code:</strong> {activeAttempt.feedback.codeStyle}
                    </div>
                  </div>

                  {activeAttempt.feedback.suggestions.length > 0 && (
                    <div className="ai-feedback-suggestions">
                      <div className="suggestions-title"><Lightbulb size={14} /> Gợi ý cải thiện:</div>
                      <ul>
                        {activeAttempt.feedback.suggestions.map((sug, idx) => (
                          <li key={idx}>{sug}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Submitted Code Viewer */}
                <div className="history-code-block">
                  <div className="history-code-header">
                    <span><Terminal size={14} /> Code đã nộp — {activeAttempt.language} (Lần {activeAttempt.attemptNumber})</span>
                  </div>
                  <pre>
                    <code>{activeAttempt.code}</code>
                  </pre>
                </div>
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

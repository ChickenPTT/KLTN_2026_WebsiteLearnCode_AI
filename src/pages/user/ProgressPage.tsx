import { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Flame,
  Zap,
  Activity,
  History,
  X,
  RotateCcw,
  PieChart,
} from 'lucide-react';
import { Header } from '@/layout/Header';
import { LEVEL_COLORS, TOPIC_INFOS, type AuthMode } from '@/types';
import {
  MOCK_STREAK,
  MOCK_XP,
  MOCK_WEEKLY,
  MOCK_ACTIVITY_LOG,
  MOCK_TOPIC_PROGRESS,
  MOCK_SUBMISSIONS,
} from '@/data/userMockData';

interface ProgressPageProps {
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

const maxWeekly = Math.max(...MOCK_WEEKLY.map((d) => d.solved), 1);

interface TopicSkillStat {
  name: string;
  levelLabel: 'Khá' | 'Trung bình' | 'Cơ bản' | 'Mới bắt đầu' | 'Giỏi';
  levelColor: string;
  pct: number;
  solvedCount: number;
}

const TOPIC_SKILL_STATS: TopicSkillStat[] = [
  { name: 'Array', levelLabel: 'Khá', levelColor: '#f59e0b', pct: 70, solvedCount: 2 },
  { name: 'String', levelLabel: 'Trung bình', levelColor: '#3b82f6', pct: 50, solvedCount: 1 },
  { name: 'Hash Table', levelLabel: 'Trung bình', levelColor: '#3b82f6', pct: 50, solvedCount: 1 },
  { name: 'Two Pointers', levelLabel: 'Trung bình', levelColor: '#3b82f6', pct: 50, solvedCount: 1 },
  { name: 'Linked List', levelLabel: 'Cơ bản', levelColor: '#22c55e', pct: 35, solvedCount: 1 },
  { name: 'Stack', levelLabel: 'Cơ bản', levelColor: '#22c55e', pct: 35, solvedCount: 1 },
  { name: 'Queue', levelLabel: 'Mới bắt đầu', levelColor: '#64748b', pct: 20, solvedCount: 0 },
  { name: 'Recursion', levelLabel: 'Trung bình', levelColor: '#3b82f6', pct: 50, solvedCount: 1 },
  { name: 'Sorting', levelLabel: 'Trung bình', levelColor: '#3b82f6', pct: 50, solvedCount: 1 },
  { name: 'Binary Search', levelLabel: 'Cơ bản', levelColor: '#22c55e', pct: 35, solvedCount: 1 },
  { name: 'Tree', levelLabel: 'Mới bắt đầu', levelColor: '#64748b', pct: 20, solvedCount: 1 },
  { name: 'Graph', levelLabel: 'Mới bắt đầu', levelColor: '#64748b', pct: 20, solvedCount: 0 },
];

interface TopicPieData {
  name: string;
  count: number;
  color: string;
}

const TOPIC_PIE_DATA: TopicPieData[] = [
  { name: 'Array', count: 2, color: '#f59e0b' },
  { name: 'String', count: 1, color: '#3b82f6' },
  { name: 'Hash Table', count: 1, color: '#8b5cf6' },
  { name: 'Two Pointers', count: 1, color: '#06b6d4' },
  { name: 'Linked List', count: 1, color: '#10b981' },
  { name: 'Stack', count: 1, color: '#f43f5e' },
  { name: 'Recursion', count: 1, color: '#ec4899' },
  { name: 'Sorting', count: 1, color: '#14b8a6' },
  { name: 'Binary Search', count: 1, color: '#0ea5e9' },
  { name: 'Tree', count: 1, color: '#84cc16' },
];

const totalPieSolved = TOPIC_PIE_DATA.reduce((sum, item) => sum + item.count, 0);
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

let currentAccOffset = 0;
const pieSlices = TOPIC_PIE_DATA.map((item) => {
  const length = (item.count / totalPieSolved) * CIRCUMFERENCE;
  const offset = currentAccOffset;
  currentAccOffset += length;
  return {
    ...item,
    length,
    offset,
  };
});

export function ProgressPage({
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
}: ProgressPageProps) {
  // Modal state for 7-day activity log
  const [showActivityModal, setShowActivityModal] = useState(false);
  // Hover state for Pie Chart
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);

  const totalSolved = MOCK_SUBMISSIONS.filter((s) => s.status === 'passed').length;
  const accuracy = Math.round((totalSolved / MOCK_SUBMISSIONS.length) * 100);

  return (
    <div className="page-shell">
      <Header
        activeView="progress"
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

      <main className="progress-main">
        <div style={{ marginBottom: '10px' }}>
          <button className="auth-back" style={{ position: 'static' }} onClick={onBack}>
            <ArrowLeft size={18} /> Quay lại
          </button>
        </div>

        {/* ── Page Header ── */}
        <div className="page-header" style={{ marginBottom: '8px' }}>
          <h1 className="page-title" style={{ fontSize: '26px' }}>
            <Activity size={26} className="page-title-icon" /> Tiến độ học tập
          </h1>
          <p className="page-sub" style={{ marginTop: '3px', fontSize: '13.5px' }}>
            Theo dõi thống kê học tập, chuỗi streak liên tục và tiến độ nâng cao kỹ năng theo từng chủ đề.
          </p>
        </div>

        {/* ── Section 1: Thống kê tổng quan ── */}
        <section className="progress-section" style={{ marginBottom: '6px' }}>
          <div className="progress-overview-cards three-cols">
            <div className="overview-card">
              <div className="overview-card-icon streak">
                <Flame size={20} strokeWidth={1.6} />
              </div>
              <div>
                <strong>{MOCK_STREAK} ngày</strong>
                <span>Chuỗi streak liên tục</span>
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-card-icon xp">
                <Zap size={20} strokeWidth={1.6} />
              </div>
              <div>
                <strong>{MOCK_XP.toLocaleString()} XP</strong>
                <span>Tổng điểm tích lũy</span>
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-card-icon solved">
                <CheckCircle2 size={20} strokeWidth={1.6} />
              </div>
              <div>
                <strong>{totalSolved} bài</strong>
                <span>Đã hoàn thành ({accuracy}% chính xác)</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Ngang hàng (Biểu đồ 7 ngày & Pie Chart Thống kê bài giải theo chủ đề) ── */}
        <div className="progress-side-by-side">
          {/* Left: Biểu đồ hoạt động 7 ngày qua */}
          <div className="progress-chart-card">
            <div className="progress-card-head">
              <h2 className="progress-section-title">
                <Activity size={14} className="title-icon" /> Hoạt động 7 ngày qua
              </h2>
              <button
                className="view-activity-log-btn"
                onClick={() => setShowActivityModal(true)}
              >
                <Calendar size={13} /> Lịch sử hoạt động
              </button>
            </div>

            <div className="weekly-chart compact">
              {MOCK_WEEKLY.map((d) => (
                <div className="weekly-col" key={d.day}>
                  <span className="weekly-count">{d.solved > 0 ? d.solved : ''}</span>
                  <div className="weekly-bar-track">
                    <div
                      className="weekly-bar-fill"
                      style={{
                        height: `${(d.solved / maxWeekly) * 100}%`,
                        opacity: d.solved === 0 ? 0.15 : 1,
                      }}
                    />
                  </div>
                  <span className="weekly-day">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Pie Chart Thống kê bài giải theo chủ đề */}
          <div className="progress-pie-card">
            <div className="progress-card-head">
              <h2 className="progress-section-title">
                <PieChart size={14} className="title-icon" style={{ color: '#3b82f6' }} /> Phân bổ bài giải theo chủ đề
              </h2>
            </div>

            <div className="pie-chart-body">
              <div className="pie-chart-svg-wrap">
                <svg viewBox="0 0 180 180" className="pie-svg">
                  <circle
                    cx="90"
                    cy="90"
                    r="54"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="20"
                  />
                  {pieSlices.map((slice, idx) => (
                    <circle
                      key={slice.name}
                      cx="90"
                      cy="90"
                      r="54"
                      fill="none"
                      stroke={slice.color}
                      strokeWidth={hoveredPieIndex === idx ? 25 : 20}
                      strokeDasharray={`${slice.length} ${CIRCUMFERENCE}`}
                      strokeDashoffset={-slice.offset}
                      transform="rotate(-90 90 90)"
                      onMouseEnter={() => setHoveredPieIndex(idx)}
                      onMouseLeave={() => setHoveredPieIndex(null)}
                      style={{
                        cursor: 'pointer',
                        transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                        opacity: hoveredPieIndex === null || hoveredPieIndex === idx ? 1 : 0.35,
                      }}
                    />
                  ))}
                </svg>

                <div className="pie-center-info">
                  {hoveredPieIndex !== null ? (
                    <>
                      <span className="pie-center-count" style={{ color: TOPIC_PIE_DATA[hoveredPieIndex].color }}>
                        {TOPIC_PIE_DATA[hoveredPieIndex].count} bài
                      </span>
                      <span className="pie-center-label">{TOPIC_PIE_DATA[hoveredPieIndex].name}</span>
                    </>
                  ) : (
                    <>
                      <span className="pie-center-count">{totalPieSolved}</span>
                      <span className="pie-center-label">Bài đã giải</span>
                    </>
                  )}
                </div>
              </div>

              {/* Legend Side */}
              <div className="pie-legend-list scrollable">
                {TOPIC_PIE_DATA.map((item, idx) => (
                  <div
                    key={item.name}
                    className={`pie-legend-item ${hoveredPieIndex === idx ? 'is-active' : ''}`}
                    onMouseEnter={() => setHoveredPieIndex(idx)}
                    onMouseLeave={() => setHoveredPieIndex(null)}
                  >
                    <span className="legend-dot" style={{ backgroundColor: item.color }} />
                    <span className="legend-name">{item.name}</span>
                    <span className="legend-count">{item.count} bài</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 3: Thống kê trình độ theo từng chủ đề ── */}
        <div className="progress-topics-card" style={{ marginTop: '8px' }}>
          <h2 className="progress-section-title">
            <Flame size={14} className="title-icon" style={{ color: '#f59e0b' }} /> Thống kê trình độ theo từng chủ đề
          </h2>
          <div className="topic-skill-list scrollable" style={{ maxHeight: '240px' }}>
            {TOPIC_SKILL_STATS.map((topic) => (
              <div className="topic-skill-row three-cols" key={topic.name}>
                <span className="topic-skill-name">{topic.name}</span>
                <div className="topic-skill-track">
                  <div
                    className="topic-skill-fill"
                    style={{ width: `${topic.pct}%`, backgroundColor: topic.levelColor }}
                  />
                </div>
                <span className="topic-skill-label" style={{ color: topic.levelColor }}>
                  {topic.levelLabel}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Banner dẫn sang trang Lịch sử nộp bài ── */}
        {onGoHistory && (
          <div className="topics-cta-banner" style={{ marginTop: '20px' }}>
            <div className="topics-cta-icon">
              <History size={26} />
            </div>
            <div className="topics-cta-text">
              <h3>Xem lịch sử nộp bài & Đánh giá chi tiết từ AI</h3>
              <p>Tra cứu lại mã nguồn đã nộp, bộ test case, thời gian chạy và bài học từ AI cho từng bài tập.</p>
            </div>
            <div className="topics-cta-actions">
              <button className="auth-submit-btn" style={{ width: 'auto', padding: '10px 20px' }} onClick={onGoHistory}>
                Đến trang Lịch sử nộp bài
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Modal Lịch sử hoạt động 7 ngày ── */}
      {showActivityModal && (
        <div className="modal-backdrop" onClick={() => setShowActivityModal(false)}>
          <div className="modal-content activity-log-modal" onClick={(e) => e.stopPropagation()}>
            <button className="topic-modal-close" onClick={() => setShowActivityModal(false)}>
              <X size={18} />
            </button>

            <div className="topic-modal-header">
              <div className="topic-modal-icon">
                <Calendar size={24} />
              </div>
              <div>
                <h2 className="topic-modal-title">Lịch sử hoạt động 7 ngày qua</h2>
                <p className="topic-modal-desc">
                  Theo dõi thống kê số bài làm, lượt thử nghiệm và điểm kinh nghiệm mỗi ngày.
                </p>
              </div>
            </div>

            <div className="topic-modal-divider" />

            <div className="activity-modal-list">
              {MOCK_ACTIVITY_LOG.map((act) => (
                <div key={act.date} className="activity-log-item">
                  <div className="activity-log-date">
                    <strong>{act.date}</strong>
                    <span>Thời gian học: {act.timeSpent}</span>
                  </div>
                  <div className="activity-log-stats">
                    <span className="log-badge solved">
                      <CheckCircle2 size={13} /> {act.solved} bài hoàn thành
                    </span>
                    <span className="log-badge attempts">
                      <RotateCcw size={13} /> {act.attempts} lần nộp
                    </span>
                    <span className="log-badge xp">
                      <Zap size={13} /> +{act.xp} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

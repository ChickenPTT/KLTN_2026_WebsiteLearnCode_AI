import { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Flame,
  Zap,
  Activity,
  History,
  ArrowRight,
  X,
  RotateCcw,
  PieChart,
  HelpCircle,
} from 'lucide-react';
import { Header } from '@/layout/Header';
import type { AuthMode } from '@/types';
import { userApi, BackendUnavailableError, type UserStats } from '@/lib/api';
import { useMyHistory } from '@/hooks/useMyHistory';
import { usePublishedProblems } from '@/hooks/usePublishedProblems';
import { buildTopics } from '@/lib/topics';
import { formatDate, recentActivity, solvedByTopic, topicSkills } from '@/lib/progress';

interface ProgressPageProps {
  onBack: () => void;
  onGoLanding?: () => void;
  onGoAuth?: (mode: AuthMode) => void;
  onGoTopics?: () => void;
  onGoProfile?: () => void;
  onGoProgress?: () => void;
  onGoHistory?: () => void;
  onGoScoringGuide?: () => void;
  onGoAdmin?: () => void;
  onGoSettings?: () => void;
  onLoggedOut?: () => void;
  onGoFlashcards?: () => void;
  onGoFlashcardLibrary?: () => void;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressPage({
  onGoLanding,
  onGoAuth,
  onGoTopics,
  onGoProfile,
  onGoProgress,
  onGoHistory,
  onGoScoringGuide,
  onGoAdmin,
  onGoSettings,
  onLoggedOut,
  onGoFlashcards,
  onGoFlashcardLibrary,
}: ProgressPageProps) {
  // Modal state for 7-day activity log
  const [showActivityModal, setShowActivityModal] = useState(false);
  // Hover state for Pie Chart
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);

  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const { history, error: historyError } = useMyHistory();
  const { problems } = usePublishedProblems();

  useEffect(() => {
    let cancelled = false;
    userApi
      .getStats()
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatsError(
          err instanceof BackendUnavailableError
            ? 'Không kết nối được máy chủ.'
            : err instanceof Error
              ? err.message
              : 'Không tải được thống kê.',
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const weekly = useMemo(() => recentActivity(history, 7), [history]);
  const maxWeekly = Math.max(...weekly.map((d) => d.solved), 1);
  // Modal: moi nhat truoc
  const activityLog = useMemo(() => [...weekly].reverse(), [weekly]);

  const pieData = useMemo(() => solvedByTopic(history), [history]);
  const totalPieSolved = pieData.reduce((sum, item) => sum + item.count, 0);
  const pieSlices = useMemo(() => {
    let acc = 0;
    return pieData.map((item) => {
      const length = totalPieSolved ? (item.count / totalPieSolved) * CIRCUMFERENCE : 0;
      const offset = acc;
      acc += length;
      return { ...item, length, offset };
    });
  }, [pieData, totalPieSolved]);

  const skills = useMemo(
    () => topicSkills(history, buildTopics(problems).filter((t) => t.problemCount > 0).map((t) => t.name)),
    [history, problems],
  );

  const streak = stats?.streak ?? 0;
  const totalXp = stats?.totalXp ?? 0;
  const totalSolved = stats?.solvedCount ?? 0;
  const accuracy = history.length ? Math.round((history.filter((h) => h.passed).length / history.length) * 100) : 0;
  const loadError = statsError ?? historyError;

  return (
    <div className="page-shell">
      <Header
        activeView="progress"
        onGoLanding={onGoLanding}
        onGoAuth={onGoAuth}
        onGoTopics={onGoTopics}
        onGoFlashcards={onGoFlashcards}
        onGoFlashcardLibrary={onGoFlashcardLibrary}
        onGoProfile={onGoProfile}
        onGoProgress={onGoProgress}
        onGoHistory={onGoHistory}
        onGoAdmin={onGoAdmin}
        onGoSettings={onGoSettings}
        onLoggedOut={onLoggedOut}
      />

      <main className="progress-main">
        {/* ── Page Header ── */}
        <div className="page-header" style={{ marginBottom: '8px' }}>
          <h1 className="page-title" style={{ fontSize: '26px' }}>
            <Activity size={26} className="page-title-icon" /> Tiến độ học tập
          </h1>
          <p className="page-sub" style={{ marginTop: '3px', fontSize: '13.5px' }}>
            Theo dõi thống kê học tập, chuỗi streak liên tục và tiến độ nâng cao kỹ năng theo từng chủ đề.
          </p>
        </div>

        {loadError && (
          <p style={{ color: '#f87171', fontSize: 13, margin: '0 0 8px' }}>Không tải được dữ liệu: {loadError}</p>
        )}

        {/* ── Section 1: Thống kê tổng quan ── */}
        <section className="progress-section" style={{ marginBottom: '6px' }}>
          <div className="progress-overview-cards three-cols">
            <div className="overview-card">
              <div className="overview-card-icon streak">
                <Flame size={20} strokeWidth={1.6} />
              </div>
              <div>
                <strong>{streak} ngày</strong>
                <span>Chuỗi streak liên tục</span>
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-card-icon xp">
                <Zap size={20} strokeWidth={1.6} />
              </div>
              <div>
                <strong>{totalXp.toLocaleString()} XP</strong>
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
              {weekly.map((d) => (
                <div className="weekly-col" key={d.date.toISOString()}>
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
                      <span className="pie-center-count" style={{ color: pieData[hoveredPieIndex].color }}>
                        {pieData[hoveredPieIndex].count} bài
                      </span>
                      <span className="pie-center-label">{pieData[hoveredPieIndex].name}</span>
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
                {pieData.length === 0 && (
                  <span style={{ fontSize: 13, color: '#7d8599' }}>Chưa giải được bài nào.</span>
                )}
                {pieData.map((item, idx) => (
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
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="progress-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '15px' }}>
                <Flame size={16} className="title-icon" style={{ color: '#f59e0b' }} /> Thống kê trình độ theo từng chủ đề
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#7d8599' }}>
                Theo dõi năng lực và tiến độ luyện tập của bạn theo từng chủ đề.
              </p>
            </div>
            {onGoScoringGuide && (
              <button
                type="button"
                className="view-activity-log-btn"
                onClick={onGoScoringGuide}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12.5px' }}
              >
                <HelpCircle size={14} /> Cách tính điểm
              </button>
            )}
          </div>
          <div className="topic-skill-list scrollable" style={{ maxHeight: '240px' }}>
            {skills.length === 0 && (
              <span style={{ fontSize: 13, color: '#7d8599' }}>Chưa có dữ liệu luyện tập.</span>
            )}
            {skills.map((topic) => (
              <div
                className="topic-skill-row three-cols"
                key={topic.name}
                title={`${topic.score}/100 điểm • ${topic.submissions} lần nộp • Độ tin cậy: ${topic.confidence}`}
              >
                <span className="topic-skill-name">{topic.name}</span>
                <div className="topic-skill-track">
                  <div
                    className="topic-skill-fill"
                    style={{ width: `${Math.max(topic.score, 2)}%`, backgroundColor: topic.color }}
                  />
                </div>
                <span className="topic-skill-label" style={{ color: topic.color }}>
                  {topic.label} ({topic.score})
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
              <button
                type="button"
                className="primary-button"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 22px',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.45)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                onClick={onGoHistory}
              >
                <History size={16} />
                <span>Đến trang Lịch sử nộp bài</span>
                <ArrowRight size={16} />
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
              {activityLog.map((act, i) => (
                <div key={act.date.toISOString()} className="activity-log-item">
                  <div className="activity-log-date">
                    <strong>
                      {formatDate(act.date)}
                      {i === 0 ? ' (Hôm nay)' : ''}
                    </strong>
                    <span>{act.day}</span>
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

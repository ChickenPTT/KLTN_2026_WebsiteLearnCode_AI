import { ArrowRight, Sparkles, Trophy } from 'lucide-react';
import { Header } from '@/layout/Header';
import { LEVEL_COLORS, LEVEL_LABELS, type TopicScore, type AuthMode } from '@/types';

interface ResultPageProps {
  scores: TopicScore[];
  onGoTopics: () => void;
  onGoLanding?: () => void;
  onGoAuth?: (mode: AuthMode) => void;
  onGoProfile?: () => void;
  onGoProgress?: () => void;
}

const LEVEL_ORDER: SkillLevel[] = ['expert', 'advanced', 'intermediate', 'basic', 'beginner'];

export function ResultPage({
  scores,
  onGoTopics,
  onGoLanding,
  onGoAuth,
  onGoProfile,
  onGoProgress,
}: ResultPageProps) {
  const counts: Record<SkillLevel, number> = {
    expert: scores.filter((s) => s.level === 'expert').length,
    advanced: scores.filter((s) => s.level === 'advanced').length,
    intermediate: scores.filter((s) => s.level === 'intermediate').length,
    basic: scores.filter((s) => s.level === 'basic').length,
    beginner: scores.filter((s) => s.level === 'beginner').length,
  };

  // Sort: expert first, beginner last
  const sorted = [...scores].sort(
    (a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level),
  );

  const total = scores.length;

  const levelWidths: Record<SkillLevel, number> = {
    expert: 100,
    advanced: 80,
    intermediate: 60,
    basic: 40,
    beginner: 20,
  };

  return (
    <div className="page-shell result-shell">
      <Header
        onGoLanding={onGoLanding}
        onGoAuth={onGoAuth}
        onGoTopics={onGoTopics}
        onGoProfile={onGoProfile}
        onGoProgress={onGoProgress}
      />

      <main className="result-main">
        {/* Hero */}
        <div className="result-hero">
          <div className="result-trophy-wrap">
            <Trophy size={28} strokeWidth={1.6} />
          </div>
          <h1 className="result-title">Đánh giá hoàn tất!</h1>
          <p className="result-sub">
            Hệ thống đã ghi nhận trình độ của bạn. Độ khó bài tập sẽ được cá nhân hóa ngay từ bây giờ.
          </p>
        </div>

        {/* Summary stats */}
        <div className="result-summary-row">
          {LEVEL_ORDER.map((lvl) => (
            <div
              key={lvl}
              className="result-stat-card"
              style={{ '--accent': LEVEL_COLORS[lvl] } as React.CSSProperties}
            >
              <strong>{counts[lvl]}</strong>
              <span>{LEVEL_LABELS[lvl]}</span>
            </div>
          ))}
        </div>

        {/* Bar chart by topic */}
        <div className="result-chart-section">
          <h2 className="result-section-title">Chi tiết theo chủ đề</h2>
          <div className="result-bars">
            {sorted.map((s) => {
              const barWidth = levelWidths[s.level] ?? 20;
              return (
                <div className="result-bar-row" key={s.topic}>
                  <span className="result-bar-label">{s.topic}</span>
                  <div className="result-bar-track">
                    <div
                      className="result-bar-fill"
                      style={{
                        width: `${barWidth}%`,
                        background: LEVEL_COLORS[s.level],
                      }}
                    />
                  </div>
                  <span
                    className="result-bar-level"
                    style={{ color: LEVEL_COLORS[s.level] }}
                  >
                    {LEVEL_LABELS[s.level]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insight */}
        <div className="result-insight">
          <Sparkles size={16} />
          <p>
            {counts.none > 4
              ? `Bạn có ${counts.none} chủ đề chưa học — hệ thống sẽ ưu tiên nội dung nhập môn để xây dựng nền tảng vững chắc.`
              : counts.advanced >= Math.floor(total / 2)
                ? `Bạn đã thành thạo ${counts.advanced}/${total} chủ đề — hệ thống sẽ tập trung vào các bài khó hơn.`
                : `Bạn đang ở giai đoạn phát triển — hệ thống sẽ xen kẽ bài ôn và bài nâng cao để tiến bộ nhanh nhất.`}
          </p>
        </div>

        {/* CTA */}
        <div className="result-cta">
          <button className="assessment-primary result-cta-btn" onClick={onGoTopics}>
            <Sparkles size={17} /> Khám phá bài tập <ArrowRight size={17} />
          </button>
        </div>
      </main>
    </div>
  );
}

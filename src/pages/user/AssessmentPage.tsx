import { useState } from 'react';
import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardCheck,
} from 'lucide-react';
import {
  LEVEL_COLORS,
  LEVEL_LABELS,
  type SkillLevel,
  type TopicScore,
  TOPICS,
} from '@/types';
import { Header } from '@/layout/Header';

interface AssessmentPageProps {
  onBack: () => void;
  onComplete: (scores: TopicScore[]) => void;
  onGoLanding?: () => void;
  onGoTopics?: () => void;
  onGoProfile?: () => void;
  onGoProgress?: () => void;
}

const LEVELS: SkillLevel[] = ['beginner', 'basic', 'intermediate', 'advanced', 'expert'];

export function AssessmentPage({
  onBack,
  onComplete,
  onGoLanding,
  onGoTopics,
  onGoProfile,
  onGoProgress,
}: AssessmentPageProps) {
  const [ratings, setRatings] = useState<Record<string, SkillLevel>>({});
  const [step, setStep] = useState(0); // paginate topics 4 at a time

  const TOPICS_PER_PAGE = 4;
  const totalPages = Math.ceil(TOPICS.length / TOPICS_PER_PAGE);
  const pageTopics = TOPICS.slice(step * TOPICS_PER_PAGE, (step + 1) * TOPICS_PER_PAGE);
  const isLastPage = step === totalPages - 1;
  const allCurrentRated = pageTopics.every((t) => ratings[t]);
  const allRated = TOPICS.every((t) => ratings[t]);

  const handleSelect = (topic: string, level: SkillLevel) => {
    setRatings((prev) => ({ ...prev, [topic]: level }));
  };

  const handleConfirm = () => {
    const scores: TopicScore[] = TOPICS.map((t) => ({
      topic: t,
      level: ratings[t] ?? 'none',
    }));
    onComplete(scores);
  };

  return (
    <div className="page-shell">
      <Header
        onGoLanding={onGoLanding}
        onGoTopics={onGoTopics}
        onGoProfile={onGoProfile}
        onGoProgress={onGoProgress}
      />

      <main className="assessment-main" style={{ width: '100%', maxWidth: '880px', margin: '0 auto' }}>
        {/* Top nav: Quay lại */}
        <div className="assessment-top-nav" style={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
          <button className="auth-back" style={{ position: 'static' }} onClick={onBack}>
            <ArrowLeft size={18} /> Quay lại
          </button>
        </div>

        {/* Header Intro OUTSIDE the card */}
        <div className="assessment-header-hero" style={{ textAlign: 'center', marginBottom: '28px', width: '100%' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#e4e8f5', margin: '0 0 8px' }}>
            Đánh giá năng lực của bạn
          </h1>
          <p style={{ color: '#8b92a6', fontSize: '14.5px', margin: '0 auto', maxWidth: '600px', lineHeight: 1.55 }}>
            Chọn mức bạn <strong style={{ color: '#c2cdf0' }}>thực sự tự tin</strong> với từng chủ đề — hệ thống sẽ điều chỉnh độ khó bài tập cho phù hợp.
          </p>
        </div>

        {/* Card for Topics Grid & Actions */}
        <div className="assessment-card">
          <div className="assessment-body">
            {/* Topic grid */}
            <div className="self-rate-grid">
              {pageTopics.map((topic) => (
                <div className="self-rate-row" key={topic}>
                  <span className="self-rate-topic">{topic}</span>
                  <div className="self-rate-levels">
                    {LEVELS.map((level) => (
                      <button
                        key={level}
                        className={`rate-pill ${ratings[topic] === level ? 'is-active' : ''}`}
                        style={
                          ratings[topic] === level
                            ? {
                                borderColor: LEVEL_COLORS[level],
                                color: LEVEL_COLORS[level],
                                background: `${LEVEL_COLORS[level]}14`,
                              }
                            : undefined
                        }
                        onClick={() => handleSelect(topic, level)}
                      >
                        {ratings[topic] === level ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <Circle size={14} />
                        )}
                        {LEVEL_LABELS[level]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination dots (MOVED BELOW TOPIC GRID) */}
            <div className="assessment-page-indicator" style={{ marginTop: '8px', marginBottom: '4px' }}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <span
                  key={i}
                  className={`page-dot ${i === step ? 'is-active' : i < step ? 'is-done' : ''}`}
                />
              ))}
            </div>

            {/* Footer actions */}
            <div className="assessment-footer">
              <p className="assessment-hint">
                {isLastPage
                  ? allRated
                    ? 'Bạn đã đánh giá đủ tất cả chủ đề!'
                    : 'Hãy đánh giá đủ tất cả chủ đề để xác nhận.'
                  : allCurrentRated
                    ? 'Tốt! Tiếp tục sang nhóm chủ đề tiếp theo.'
                    : 'Đánh giá đủ các chủ đề trên để tiếp tục.'}
              </p>
              <div className="assessment-footer-actions">
                {step > 0 && (
                  <button className="assessment-ghost" onClick={() => setStep((s) => s - 1)}>
                    <ChevronLeft size={16} /> Trước
                  </button>
                )}
                {isLastPage ? (
                  <button
                    className="assessment-primary"
                    disabled={!allRated}
                    onClick={handleConfirm}
                  >
                    <ClipboardCheck size={16} /> Xác nhận &amp; xem kết quả{' '}
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    className="assessment-primary"
                    disabled={!allCurrentRated}
                    onClick={() => setStep((s) => s + 1)}
                  >
                    Tiếp theo <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

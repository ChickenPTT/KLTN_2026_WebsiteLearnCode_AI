import { useState } from 'react';
import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { QUIZ_QUESTIONS, TOPICS, type SkillLevel, type TopicScore } from '@/types';
import { Header } from '@/layout/Header';

interface QuizPageProps {
  onBack: () => void;
  onComplete: (scores: TopicScore[]) => void;
  onGoLanding?: () => void;
  onGoTopics?: () => void;
  onGoProfile?: () => void;
  onGoProgress?: () => void;
}

export function QuizPage({
  onBack,
  onComplete,
  onGoLanding,
  onGoTopics,
  onGoProfile,
  onGoProgress,
}: QuizPageProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const q = QUIZ_QUESTIONS[current];
  const isLast = current === QUIZ_QUESTIONS.length - 1;
  const selected = answers[q.id];
  const progress = ((current + 1) / QUIZ_QUESTIONS.length) * 100;

  const handleSelect = (idx: number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: idx }));
  };

  const handleFinish = () => {
    const topicCorrect: Record<string, number> = {};
    const topicTotal: Record<string, number> = {};
    QUIZ_QUESTIONS.forEach((question) => {
      topicTotal[question.topic] = (topicTotal[question.topic] ?? 0) + 1;
      if (answers[question.id] === question.correctIndex) {
        topicCorrect[question.topic] = (topicCorrect[question.topic] ?? 0) + 1;
      }
    });
    const scores: TopicScore[] = TOPICS.map((topic) => {
      const total = topicTotal[topic] ?? 0;
      const correct = topicCorrect[topic] ?? 0;
      let level: SkillLevel = 'none';
      if (total > 0) {
        const ratio = correct / total;
        if (ratio >= 0.75) level = 'advanced';
        else if (ratio >= 0.5) level = 'intermediate';
        else if (ratio > 0) level = 'beginner';
      }
      return { topic, level };
    });
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

      <main className="assessment-main">
        <div
          className="assessment-top-nav"
          style={{
            width: '100%',
            maxWidth: '720px',
            margin: '0 auto 16px',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
          }}
        >
          <button className="auth-back" style={{ position: 'static' }} onClick={onBack}>
            <ArrowLeft size={18} /> Quay lại
          </button>
          <div className="assessment-step-indicator">
            <span className="is-active">
              <BrainCircuit size={15} /> Trắc nghiệm
            </span>
          </div>
        </div>

        <div className="assessment-card">
          <div className="assessment-body">
            {/* Progress bar */}
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="quiz-header">
              <span className="quiz-counter">
                Câu {current + 1} / {QUIZ_QUESTIONS.length}
              </span>
              <span className="quiz-topic-tag">{q.topic}</span>
            </div>

            <h3 className="quiz-question">{q.question}</h3>

            <div className="quiz-choices">
              {q.choices.map((choice, idx) => (
                <button
                  key={idx}
                  className={`quiz-choice ${selected === idx ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(idx)}
                >
                  <span className="quiz-choice-letter">{String.fromCharCode(65 + idx)}</span>
                  <span>{choice}</span>
                </button>
              ))}
            </div>

            <div className="quiz-nav">
              <button
                className="assessment-ghost"
                disabled={current === 0}
                onClick={() => setCurrent((c) => c - 1)}
              >
                <ChevronLeft size={16} /> Câu trước
              </button>
              {isLast ? (
                <button
                  className="assessment-primary"
                  disabled={selected === undefined}
                  onClick={handleFinish}
                >
                  <CheckCircle2 size={16} /> Nộp bài
                </button>
              ) : (
                <button
                  className="assessment-primary"
                  disabled={selected === undefined}
                  onClick={() => setCurrent((c) => c + 1)}
                >
                  Câu tiếp <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { BrainCircuit, ChevronRight, ClipboardList, Clock, Target, Zap } from 'lucide-react';
import { Header } from '@/layout/Header';
import type { AuthMode } from '@/types';

/**
 * Nhom da quyet dinh chi dung phuong phap tu danh gia.
 * Giu lai code "Lam bai kiem tra nho" nhung an tren giao dien — doi thanh true neu can bat lai.
 */
export const SHOW_QUIZ_OPTION = false;

interface OnboardingPageProps {
  onChooseSelfRate: () => void;
  onChooseQuiz?: () => void;
  onGoLanding?: () => void;
  onGoAuth?: (mode: AuthMode) => void;
  onGoTopics?: () => void;
  onGoProfile?: () => void;
  onGoProgress?: () => void;
}

export function OnboardingPage({
  onChooseSelfRate,
  onChooseQuiz,
  onGoLanding,
  onGoAuth,
  onGoTopics,
  onGoProfile,
  onGoProgress,
}: OnboardingPageProps) {
  return (
    <div className="page-shell onboarding-shell">
      <Header
        onGoLanding={onGoLanding}
        onGoAuth={onGoAuth}
        onGoTopics={onGoTopics}
        onGoProfile={onGoProfile}
        onGoProgress={onGoProgress}
      />

      <main className="onboarding-main">
        <div className="onboarding-hero">
          <p className="eyebrow">Bước đầu tiên</p>
          <h1 className="onboarding-title">Hãy cho chúng tôi biết trình độ của bạn</h1>
          <p className="onboarding-sub">
            {SHOW_QUIZ_OPTION
              ? 'Chọn cách bạn muốn đánh giá năng lực — hệ thống sẽ tự động điều chỉnh độ khó bài tập phù hợp ngay từ đầu.'
              : 'Tự đánh giá mức độ hiểu biết của bạn ở từng chủ đề — đây sẽ là điểm khởi đầu cho thống kê trình độ, và được điều chỉnh dần theo kết quả làm bài thực tế.'}
          </p>
        </div>

        <div className="onboarding-cards">
          {/* Card 1: Tự đánh giá */}
          <button className="onboard-card" onClick={onChooseSelfRate}>
            <div className="onboard-card-icon self-rate-icon">
              <Target size={32} strokeWidth={1.5} />
            </div>
            <div className="onboard-card-body">
              <h2>Tự đánh giá</h2>
              <p>
                Bạn tự chọn mức độ hiểu biết của mình ở từng chủ đề. Nhanh và đơn giản.
              </p>
              <ul className="onboard-card-meta">
                <li>
                  <Clock size={14} /> ~1 phút
                </li>
                <li>
                  <ClipboardList size={14} /> 12 chủ đề
                </li>
                <li>
                  <Zap size={14} /> Bắt đầu ngay lập tức
                </li>
              </ul>
            </div>
            <div className="onboard-card-arrow">
              <ChevronRight size={22} />
            </div>
          </button>

          {/* Card 2: Làm bài kiểm tra (đang ẩn — xem SHOW_QUIZ_OPTION) */}
          {SHOW_QUIZ_OPTION && onChooseQuiz && (
          <button className="onboard-card onboard-card-quiz" onClick={onChooseQuiz}>
            <div className="onboard-card-icon quiz-icon">
              <BrainCircuit size={32} strokeWidth={1.5} />
            </div>
            <div className="onboard-card-body">
              <h2>Làm bài kiểm tra nhỏ</h2>
              <p>
                10 câu trắc nghiệm ngắn — hệ thống phân tích và tự xác định trình độ cho bạn.
              </p>
              <ul className="onboard-card-meta">
                <li>
                  <Clock size={14} /> ~5 phút
                </li>
                <li>
                  <BrainCircuit size={14} /> 10 câu hỏi
                </li>
                <li>
                  <Zap size={14} /> Kết quả chính xác hơn
                </li>
              </ul>
            </div>
            <div className="onboard-card-arrow">
              <ChevronRight size={22} />
            </div>
          </button>
          )}
        </div>

        <p className="onboarding-skip-hint">
          Bạn cần hoàn thành bước này trước khi bắt đầu luyện tập. Có thể đánh giá lại bất cứ lúc nào
          trong trang <strong>Tiến độ</strong>.
        </p>
      </main>
    </div>
  );
}

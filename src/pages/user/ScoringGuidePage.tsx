import {
  ArrowLeft,
  HelpCircle,
  CheckCircle2,
  Award,
  Zap,
  Bot,
  Layers,
  RotateCcw,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Lightbulb,
  FileText,
  Target,
  AlertCircle,
} from 'lucide-react';
import { Header } from '@/layout/Header';
import { Footer } from '@/layout/Footer';
import type { AuthMode } from '@/types';

interface ScoringGuidePageProps {
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

export function ScoringGuidePage({
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
}: ScoringGuidePageProps) {
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

      <main className="scoring-guide-main" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 20px 60px' }}>
        {/* Hero Header */}
        <div className="scoring-hero-card" style={{ marginBottom: '32px' }}>
          <div className="scoring-hero-badge">
            <HelpCircle size={15} /> TÀI LIỆU HƯỚNG DẪN & QUY TẮC
          </div>
          <h1 className="scoring-hero-title">Tìm hiểu cách tính điểm năng lực</h1>
          <p className="scoring-hero-subtitle">
            Bạn có bao giờ thắc mắc tại sao mình được xếp loại Khá ở chủ đề Array nhưng chỉ đạt Trung bình ở chủ đề String không? Hãy cùng tìm hiểu cách hệ thống đánh giá kết quả luyện tập của bạn nhé!
          </p>
        </div>

        {/* Section 1: Hệ thống đánh giá năng lực của bạn như thế nào? */}
        <section className="scoring-section">
          <div className="scoring-section-header">
            <span className="scoring-step-num">1</span>
            <h2>Hệ thống đánh giá năng lực của bạn như thế nào?</h2>
          </div>

          <p className="scoring-section-desc">
            Mỗi khi bạn luyện tập và nộp bài, hệ thống sẽ kiểm tra kết quả, xem xét độ khó của bài tập và quá trình bạn hoàn thành bài. Từ đó, hệ thống tính điểm cho lần nộp đó. Điểm của nhiều lần nộp gần nhất sẽ được tổng hợp để xác định mức năng lực của bạn trong từng chủ đề.
          </p>

          <div className="scoring-steps-grid">
            <div className="scoring-step-card">
              <div className="step-card-head">
                <span className="step-badge">Bước 1</span>
                <FileText size={20} className="step-icon" />
              </div>
              <h3>Nộp bài lập trình</h3>
              <p>Hệ thống kiểm tra chương trình của bạn có vượt qua các trường hợp kiểm thử hay không.</p>
            </div>

            <div className="scoring-step-card">
              <div className="step-card-head">
                <span className="step-badge">Bước 2</span>
                <Zap size={20} className="step-icon" />
              </div>
              <h3>Tính điểm bài làm</h3>
              <p>Điểm phụ thuộc vào độ chính xác, độ khó, số lần thử và mức hỗ trợ AI trong trường hợp nghiêm trọng.</p>
            </div>

            <div className="scoring-step-card">
              <div className="step-card-head">
                <span className="step-badge">Bước 3</span>
                <Award size={20} className="step-icon" />
              </div>
              <h3>Cập nhật mức năng lực</h3>
              <p>Hệ thống tổng hợp tối đa 5 lần nộp gần nhất để xác định điểm năng lực của từng chủ đề.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Các mức xếp loại năng lực */}
        <section className="scoring-section">
          <div className="scoring-section-header">
            <span className="scoring-step-num">2</span>
            <h2>Các mức xếp loại năng lực</h2>
          </div>

          <p className="scoring-section-desc">
            Điểm năng lực được tính trên thang điểm 100. Điểm càng cao, mức độ thành thạo của bạn trong chủ đề đó càng tốt.
          </p>

          <div className="scoring-levels-grid">
            <div className="scoring-level-card level-beginner">
              <div className="level-card-top">
                <span className="level-name">Mới bắt đầu</span>
                <span className="level-score-pill">0 – 19 điểm</span>
              </div>
              <p>Bạn nên bắt đầu từ kiến thức và các dạng bài cơ bản.</p>
            </div>

            <div className="scoring-level-card level-basic">
              <div className="level-card-top">
                <span className="level-name">Cơ bản</span>
                <span className="level-score-pill">20 – 39 điểm</span>
              </div>
              <p>Bạn đã nắm được một số kiến thức nền tảng và có thể giải quyết bài tập đơn giản.</p>
            </div>

            <div className="scoring-level-card level-medium">
              <div className="level-card-top">
                <span className="level-name">Trung bình</span>
                <span className="level-score-pill">40 – 59 điểm</span>
              </div>
              <p>Bạn có thể xử lý các dạng bài quen thuộc nhưng cần luyện tập thêm.</p>
            </div>

            <div className="scoring-level-card level-good">
              <div className="level-card-top">
                <span className="level-name">Khá</span>
                <span className="level-score-pill">60 – 79 điểm</span>
              </div>
              <p>Bạn đã giải quyết tương đối tốt nhiều dạng bài thuộc chủ đề.</p>
            </div>

            <div className="scoring-level-card level-advanced">
              <div className="level-card-top">
                <span className="level-name">Nâng cao</span>
                <span className="level-score-pill">80 – 100 điểm</span>
              </div>
              <p>Bạn thể hiện khả năng giải quyết bài tập ở mức cao và duy trì kết quả tốt.</p>
            </div>
          </div>
        </section>

        {/* Section 3: Điều gì ảnh hưởng đến điểm của bạn? */}
        <section className="scoring-section">
          <div className="scoring-section-header">
            <span className="scoring-step-num">3</span>
            <h2>Điều gì ảnh hưởng đến điểm của bạn?</h2>
          </div>

          <p className="scoring-section-desc">
            Không chỉ kết quả đúng hay sai, hệ thống còn xem xét cách bạn hoàn thành bài tập.
          </p>

          <div className="scoring-factors-grid">
            <div className="scoring-factor-card">
              <div className="factor-icon-wrap" style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.1)' }}>
                <Target size={22} />
              </div>
              <div>
                <h3>Độ chính xác của bài làm</h3>
                <p>
                  Chương trình vượt qua càng nhiều trường hợp kiểm thử thì điểm càng cao. Những trường hợp đặc biệt như dữ liệu rỗng, chỉ có một phần tử hoặc có phần tử trùng lặp được chú trọng hơn.
                </p>
              </div>
            </div>

            <div className="scoring-factor-card">
              <div className="factor-icon-wrap" style={{ color: '#60a5fa', background: 'rgba(96, 165, 250, 0.1)' }}>
                <Zap size={22} />
              </div>
              <div>
                <h3>Độ khó của bài tập</h3>
                <p>
                  Hoàn thành bài khó hơn mức hiện tại có thể giúp bạn đạt điểm cao hơn. Ngược lại, bài dễ hơn mức hiện tại sẽ có hệ số thấp hơn.
                </p>
              </div>
            </div>

            <div className="scoring-factor-card">
              <div className="factor-icon-wrap" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
                <RotateCcw size={22} />
              </div>
              <div>
                <h3>Số lần thử trước khi làm đúng</h3>
                <p>
                  Nếu bạn phải nộp sai nhiều lần rồi mới vượt qua bài kiểm tra, điểm sẽ bị trừ theo số lần thử, tối đa 15 điểm.
                </p>
              </div>
            </div>

            <div className="scoring-factor-card">
              <div className="factor-icon-wrap" style={{ color: '#c084fc', background: 'rgba(192, 132, 252, 0.1)' }}>
                <Bot size={22} />
              </div>
              <div>
                <h3>Mức độ cần AI hỗ trợ</h3>
                <p>
                  Nếu bạn cần AI chỉ ra lỗi nghiêm trọng như sai thuật toán hoặc điều kiện dừng, hệ thống sẽ trừ 2 điểm. Những lỗi biên nhẹ không bị áp dụng khoản trừ này.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Tại sao điểm năng lực không giống điểm của một lần nộp? */}
        <section className="scoring-section">
          <div className="scoring-section-header">
            <span className="scoring-step-num">4</span>
            <h2>Tại sao điểm năng lực không giống điểm của một lần nộp?</h2>
          </div>

          <p className="scoring-section-desc">
            Điểm của một lần nộp chỉ phản ánh kết quả bài làm tại thời điểm đó. Trong khi đó, điểm năng lực được tính từ tối đa 5 lần nộp gần nhất. các lần nộp mới có ảnh hưởng lớn hơn, vì vậy điểm năng lực có thể tăng hoặc giảm theo quá trình luyện tập của bạn.
          </p>

          <div className="scoring-example-card">
            <div className="example-header">
              <Sparkles size={18} style={{ color: '#f59e0b' }} /> Ví dụ minh họa thực tế
            </div>
            
            <div className="example-content-row">
              <div className="example-block">
                <span className="example-label">Điểm của 5 lần nộp gần nhất</span>
                <div className="example-numbers">
                  <span>55</span>
                  <span className="dot">•</span>
                  <span>62</span>
                  <span className="dot">•</span>
                  <span>58</span>
                  <span className="dot">•</span>
                  <span>71</span>
                  <span className="dot">•</span>
                  <strong className="recent-high">87</strong>
                </div>
              </div>

              <div className="example-arrow">➔</div>

              <div className="example-result">
                <span className="example-label">Điểm năng lực tổng hợp</span>
                <div className="result-score">
                  <strong>69</strong><span className="total-scale">/100</span>
                  <span className="result-badge-good">Khá</span>
                </div>
              </div>
            </div>

            <div className="example-note">
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Đây là ví dụ về cách hệ thống ưu tiên kết quả gần đây, không phải lấy trung bình cộng đơn giản của 5 điểm.</span>
            </div>
          </div>
        </section>

        {/* Section 5: Độ tin cậy của kết quả */}
        <section className="scoring-section">
          <div className="scoring-section-header">
            <span className="scoring-step-num">5</span>
            <h2>Độ tin cậy của kết quả</h2>
          </div>

          <p className="scoring-section-desc">
            Độ tin cậy cho biết bạn đã có bao nhiêu lần nộp bài để hệ thống đánh giá năng lực trong một chủ đề.
          </p>

          <div className="confidence-grid">
            <div className="confidence-card low">
              <div className="confidence-head">
                <span className="confidence-dot low" />
                <span className="confidence-title">Thấp</span>
                <span className="confidence-count">Dưới 3 lần nộp</span>
              </div>
              <p>Dữ liệu còn ít, kết quả chỉ mang tính tham khảo.</p>
            </div>

            <div className="confidence-card medium">
              <div className="confidence-head">
                <span className="confidence-dot medium" />
                <span className="confidence-title">Trung bình</span>
                <span className="confidence-count">Từ 3 đến 7 lần nộp</span>
              </div>
              <p>Đã có dữ liệu bước đầu để đánh giá năng lực.</p>
            </div>

            <div className="confidence-card high">
              <div className="confidence-head">
                <span className="confidence-dot high" />
                <span className="confidence-title">Cao</span>
                <span className="confidence-count">Trên 7 lần nộp</span>
              </div>
              <p>Có nhiều dữ liệu hơn để theo dõi quá trình luyện tập.</p>
            </div>
          </div>
        </section>

        {/* Section 6: Làm thế nào để cải thiện điểm năng lực? */}
        <section className="scoring-section">
          <div className="scoring-section-header">
            <span className="scoring-step-num">6</span>
            <h2>Làm thế nào để cải thiện điểm năng lực?</h2>
          </div>

          <div className="tips-list">
            <div className="tip-item">
              <div className="tip-icon"><CheckCircle2 size={18} /></div>
              <span>Luyện tập đều đặn các bài tập thuộc chủ đề bạn muốn cải thiện.</span>
            </div>

            <div className="tip-item">
              <div className="tip-icon"><CheckCircle2 size={18} /></div>
              <span>Đọc kỹ đề và kiểm tra các trường hợp đặc biệt trước khi nộp.</span>
            </div>

            <div className="tip-item">
              <div className="tip-icon"><CheckCircle2 size={18} /></div>
              <span>Khi bài làm sai, hãy tìm hiểu nguyên nhân và tự sửa lỗi thay vì chỉ dựa vào AI.</span>
            </div>

            <div className="tip-item">
              <div className="tip-icon"><CheckCircle2 size={18} /></div>
              <span>Thử sức với bài tập phù hợp và từng bước nâng cao độ khó.</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

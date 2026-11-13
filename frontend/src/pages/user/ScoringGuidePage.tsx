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
  onGoLeague?: () => void;
  onLoggedOut?: () => void;
  onGoFlashcards?: () => void;
  onGoFlashcardLibrary?: () => void;
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
  onGoLeague,
  onLoggedOut,
  onGoFlashcards,
  onGoFlashcardLibrary,
}: ScoringGuidePageProps) {
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
        onGoLeague={onGoLeague}
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
            Mỗi bài tập trong hệ thống có một mức độ khó cố định (từ Mức 1 đến Mức 5). Khi bạn nộp bài, hệ thống tính điểm trong thang điểm của mức độ khó đó, sau đó quy đổi về thang 0–100 chung. Điểm năng lực của bạn là trung bình các điểm quy đổi từ các bài khác nhau, mỗi bài chỉ ghi nhận kết quả tốt nhất.
          </p>

          <div className="scoring-steps-grid">
            <div className="scoring-step-card">
              <div className="step-card-head">
                <span className="step-badge">Bước 1</span>
                <Layers size={20} className="step-icon" />
              </div>
              <h3>5 mức độ khó bài tập</h3>
              <p>Mỗi bài có độ khó cố định: Mức 1 (Dễ) → Mức 5 (Khó). Độ khó quyết định thang điểm của bài đó.</p>
            </div>

            <div className="scoring-step-card">
              <div className="step-card-head">
                <span className="step-badge">Bước 2</span>
                <Zap size={20} className="step-icon" />
              </div>
              <h3>Tính điểm bài làm</h3>
              <p>Điểm = độ chính xác × điểm trần mức − phạt thử lại (3 điểm/lần, tối đa 15). Không trừ điểm khi dùng AI hỗ trợ.</p>
            </div>

            <div className="scoring-step-card">
              <div className="step-card-head">
                <span className="step-badge">Bước 3</span>
                <Award size={20} className="step-icon" />
              </div>
              <h3>Tổng hợp điểm năng lực</h3>
              <p>Trung bình các điểm quy đổi từ bài khác nhau. Vùng đệm ±2 điểm chống dao động band. Cần ít nhất 2 bài để có band.</p>
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
            Mỗi mức độ khó có một "điểm trần" tương ứng. Ví dụ, bài Mức 1 có điểm trần 19, bài Mức 5 có điểm trần 100. Sau khi tính điểm trong thang của bài, hệ thống quy đổi về thang 0–100 chung để so sánh giữa các bài khác nhau.
          </p>

          <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(94,143,250,0.06)', borderRadius: '12px', border: '1px solid rgba(94,143,250,0.15)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(94,143,250,0.2)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#94a3b8', fontSize: '13px' }}>Mức độ khó</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#94a3b8', fontSize: '13px' }}>Điểm trần</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#94a3b8', fontSize: '13px' }}>Band tương ứng</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(94,143,250,0.1)' }}>
                  <td style={{ padding: '8px 12px' }}>Mức 1 — Dễ</td>
                  <td style={{ padding: '8px 12px' }}>19</td>
                  <td style={{ padding: '8px 12px' }}>Mới bắt đầu (0–19)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(94,143,250,0.1)' }}>
                  <td style={{ padding: '8px 12px' }}>Mức 2 — Dễ-trung bình</td>
                  <td style={{ padding: '8px 12px' }}>39</td>
                  <td style={{ padding: '8px 12px' }}>Cơ bản (20–39)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(94,143,250,0.1)' }}>
                  <td style={{ padding: '8px 12px' }}>Mức 3 — Trung bình</td>
                  <td style={{ padding: '8px 12px' }}>59</td>
                  <td style={{ padding: '8px 12px' }}>Trung bình (40–59)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(94,143,250,0.1)' }}>
                  <td style={{ padding: '8px 12px' }}>Mức 4 — Khó-trung bình</td>
                  <td style={{ padding: '8px 12px' }}>79</td>
                  <td style={{ padding: '8px 12px' }}>Khá (60–79)</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 12px' }}>Mức 5 — Khó</td>
                  <td style={{ padding: '8px 12px' }}>100</td>
                  <td style={{ padding: '8px 12px' }}>Nâng cao (80–100)</td>
                </tr>
              </tbody>
            </table>
          </div>

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
                  Tỷ lệ test case vượt qua quyết định điểm cơ bản. Ví dụ, 3/3 test case pass = 100% accuracy.
                </p>
              </div>
            </div>

            <div className="scoring-factor-card">
              <div className="factor-icon-wrap" style={{ color: '#60a5fa', background: 'rgba(96, 165, 250, 0.1)' }}>
                <Layers size={22} />
              </div>
              <div>
                <h3>Điểm trần theo mức độ khó</h3>
                <p>
                  Bài Mức 1 có điểm trần 19, bài Mức 5 có điểm trần 100. Làm hoàn hảo bài Mức 1 vẫn chỉ đạt 19/19 điểm, sau đó quy đổi về 100%.
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
                  Mỗi lần nộp sai trước khi pass bị trừ 3 điểm, tối đa 15 điểm. Kết quả tốt nhất của mỗi bài được ghi nhận.
                </p>
              </div>
            </div>

            <div className="scoring-factor-card">
              <div className="factor-icon-wrap" style={{ color: '#c084fc', background: 'rgba(192, 132, 252, 0.1)' }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3>AI hỗ trợ không trừ điểm</h3>
                <p>
                  Sử dụng AI để học tập không bị trừ điểm năng lực. Lịch sử dùng AI vẫn được lưu để thống kê, nhưng không ảnh hưởng điểm.
                </p>
              </div>
            </div>

            <div className="scoring-factor-card">
              <div className="factor-icon-wrap" style={{ color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)' }}>
                <TrendingUp size={22} />
              </div>
              <div>
                <h3>Vùng đệm chống dao động</h3>
                <p>
                  Band chỉ thay đổi khi điểm vượt quá ngưỡng ±2 điểm. Ví dụ, từ Cơ bản lên Trung bình cần ≥ 42 điểm, không phải 40.
                </p>
              </div>
            </div>

            <div className="scoring-factor-card">
              <div className="factor-icon-wrap" style={{ color: '#14b8a6', background: 'rgba(20, 184, 166, 0.1)' }}>
                <Lightbulb size={22} />
              </div>
              <div>
                <h3>Miễn trừ thất bại bài khó</h3>
                <p>
                  Nếu bạn thử bài khó hơn 1+ mức và đạt dưới 30% accuracy, kết quả đó không làm giảm band hiện tại.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Cách tính điểm chi tiết */}
        <section className="scoring-section">
          <div className="scoring-section-header">
            <span className="scoring-step-num">4</span>
            <h2>Cách tính điểm chi tiết</h2>
          </div>

          <p className="scoring-section-desc">
            Điểm năng lực là trung bình các điểm quy đổi từ các bài khác nhau. Mỗi bài chỉ ghi nhận kết quả tốt nhất, không tính nhiều lần nộp cùng bài.
          </p>

          <div className="scoring-example-card">
            <div className="example-header">
              <Sparkles size={18} style={{ color: '#f59e0b' }} /> Ví dụ minh họa
            </div>

            <div style={{ padding: '12px 0' }}>
              <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600 }}>Tình huống: Bạn làm 3 bài chủ đề Array</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.08)', borderRadius: '8px', fontSize: '13px' }}>
                  <strong>Bài 1 (Mức 1):</strong> 100% accuracy, 0 lần sai → 19/19 điểm → quy đổi <strong>100%</strong>
                </div>
                <div style={{ padding: '10px 14px', background: 'rgba(94,143,250,0.08)', borderRadius: '8px', fontSize: '13px' }}>
                  <strong>Bài 2 (Mức 3):</strong> 67% accuracy, 1 lần sai → (0.67×59−3)=36.6 → 36.6/59 → quy đổi <strong>62%</strong>
                </div>
                <div style={{ padding: '10px 14px', background: 'rgba(169,149,255,0.08)', borderRadius: '8px', fontSize: '13px' }}>
                  <strong>Bài 3 (Mức 5):</strong> 0% accuracy → &lt;30% ở bài khó hơn → <strong>bỏ qua</strong> (miễn trừ)
                </div>
              </div>
              <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(245,158,11,0.08)', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
                Điểm năng lực = (100 + 62) / 2 = <span style={{ color: '#f59e0b' }}>81 → Khá</span>
              </div>
            </div>

            <div className="example-note">
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Bài Mức 1 dù làm hoàn hảo cũng không giúp bạn đạt band cao. Bạn cần làm bài ở mức cao hơn để lên band.</span>
            </div>
          </div>
        </section>

        {/* Section 4b: Cold start & Deadband */}
        <section className="scoring-section">
          <div className="scoring-section-header">
            <span className="scoring-step-num">4b</span>
            <h2>Cold start &amp; Vùng đệm</h2>
          </div>

          <div className="scoring-factors-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '20px', background: 'rgba(94,143,250,0.06)', borderRadius: '12px', border: '1px solid rgba(94,143,250,0.15)' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '15px' }}>🚀 Cold start</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', lineHeight: 1.8, color: '#cbd5e1' }}>
                <li><strong>&lt; 2 bài:</strong> "Chưa đủ dữ liệu" — không hiển thị band.</li>
                <li><strong>2–4 bài:</strong> "Đang đánh giá" — band tạm thời, độ tin cậy thấp.</li>
                <li><strong>≥ 5 bài:</strong> Band ổn định, độ tin cậy cao.</li>
              </ul>
            </div>
            <div style={{ padding: '20px', background: 'rgba(244,63,94,0.06)', borderRadius: '12px', border: '1px solid rgba(244,63,94,0.15)' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '15px' }}>🛡️ Vùng đệm ±2</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', lineHeight: 1.8, color: '#cbd5e1' }}>
                <li>Điểm 38–41: Vẫn giữ band Cơ bản.</li>
                <li>Điểm ≥ 42: Mới lên band Trung bình.</li>
                <li>Điểm ≤ 38: Mới xuống band Cơ bản.</li>
                <li>Tránh dao động khi điểm gần ngưỡng.</li>
              </ul>
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
            Độ tin cậy dựa trên số bài khác nhau đã được ghi nhận chính thức (không phải số lần nộp). Mỗi bài chỉ tính một lần với kết quả tốt nhất.
          </p>

          <div className="confidence-grid">
            <div className="confidence-card low">
              <div className="confidence-head">
                <span className="confidence-dot low" />
                <span className="confidence-title">Thấp</span>
                <span className="confidence-count">Dưới 3 bài khác nhau</span>
              </div>
              <p>Dữ liệu còn ít, kết quả chỉ mang tính tham khảo.</p>
            </div>

            <div className="confidence-card medium">
              <div className="confidence-head">
                <span className="confidence-dot medium" />
                <span className="confidence-title">Trung bình</span>
                <span className="confidence-count">Từ 3 đến 7 bài khác nhau</span>
              </div>
              <p>Đã có dữ liệu bước đầu để đánh giá năng lực.</p>
            </div>

            <div className="confidence-card high">
              <div className="confidence-head">
                <span className="confidence-dot high" />
                <span className="confidence-title">Cao</span>
                <span className="confidence-count">Trên 7 bài khác nhau</span>
              </div>
              <p>Có nhiều dữ liệu để đánh giá năng lực chính xác.</p>
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

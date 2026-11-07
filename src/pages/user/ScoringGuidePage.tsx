import {
  HelpCircle,
  CheckCircle2,
  Award,
  Zap,
  Bot,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  FileText,
  Target,
  AlertCircle,
  Info,
  Code2,
  Calculator,
  ArrowUpRight,
  MinusCircle,
  Lightbulb,
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
        {/* ── HERO BANNER ── */}
        <div className="scoring-hero-card" style={{ marginBottom: '32px' }}>
          <div className="scoring-hero-badge">
            <HelpCircle size={15} /> TÀI LIỆU HƯỚNG DẪN & QUY TẮC
          </div>
          <h1 className="scoring-hero-title">Quy tắc đánh giá năng lực lập trình</h1>
          <p className="scoring-hero-subtitle">
            Tìm hiểu cơ chế chấm điểm bài tập, cách tính năng lực theo chủ đề dựa trên 5 mức độ khó tuyệt đối và quy trình cập nhật band năng lực trên nền tảng Mnemonic.
          </p>
        </div>

        {/* ═════════════════════════════════════════════════════════════
            PHẦN 1: HỆ THỐNG ĐÁNH GIÁ NĂNG LỰC NHƯ THẾ NÀO?
            ═════════════════════════════════════════════════════════════ */}
        <section className="scoring-section">
          <div className="scoring-section-header">
            <span className="scoring-step-num">1</span>
            <h2>Hệ thống đánh giá năng lực như thế nào?</h2>
          </div>

          <p className="scoring-section-desc">
            Hệ thống Mnemonic xây dựng quy trình đánh giá 4 bước minh bạch và khoa học, giúp bạn theo dõi chính xác sự tiến bộ của bản thân theo từng chủ đề thuật toán:
          </p>

          <div className="scoring-steps-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
            <div className="scoring-step-card">
              <div className="step-card-head">
                <span className="step-badge">Bước 1</span>
                <Code2 size={20} className="step-icon text-sky-400" />
              </div>
              <h3>Hoàn thành & nộp bài</h3>
              <p>Sinh viên giải quyết bài toán trên trình soạn thảo và tiến hành nộp bài làm lên hệ thống.</p>
            </div>

            <div className="scoring-step-card">
              <div className="step-card-head">
                <span className="step-badge">Bước 2</span>
                <CheckCircle2 size={20} className="step-icon text-emerald-400" />
              </div>
              <h3>Kiểm tra & xác định Accuracy</h3>
              <p>Hệ thống tự động chấm điểm với bộ test case đầy đủ và xác định tỷ lệ kiểm thử vượt qua (Accuracy).</p>
            </div>

            <div className="scoring-step-card">
              <div className="step-card-head">
                <span className="step-badge">Bước 3</span>
                <Zap size={20} className="step-icon text-amber-400" />
              </div>
              <h3>Tính điểm bài tập</h3>
              <p>Điểm bài tập được tính dựa trên độ chính xác, điểm trần của độ khó và trừ điểm nếu có lần thử lại.</p>
            </div>

            <div className="scoring-step-card">
              <div className="step-card-head">
                <span className="step-badge">Bước 4</span>
                <Award size={20} className="step-icon text-indigo-400" />
              </div>
              <h3>Đánh giá năng lực chủ đề</h3>
              <p>Tổng hợp kết quả từ các bài tập độc lập khác nhau trong cùng chủ đề để xác định band năng lực.</p>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            PHẦN 2: CÁC MỨC XẾP LOẠI NĂNG LỰC (5 MỨC)
            ═════════════════════════════════════════════════════════════ */}
        <section className="scoring-section">
          <div className="scoring-section-header">
            <span className="scoring-step-num">2</span>
            <h2>Các mức xếp loại năng lực</h2>
          </div>

          <p className="scoring-section-desc">
            Điểm năng lực được đo lường trên thang điểm 100 tuyệt đối, phân định thành 5 band rõ ràng. Mỗi band phản ánh mức độ thành thạo và năng lực giải quyết vấn đề của sinh viên:
          </p>

          <div className="scoring-levels-grid">
            <div className="scoring-level-card level-beginner">
              <div className="level-card-top">
                <span className="level-name">Mới bắt đầu</span>
                <span className="level-score-pill">0 – 19 điểm</span>
              </div>
              <p>Làm quen với cú pháp, các thao tác lập trình nền tảng và dạng bài tập nhập môn.</p>
            </div>

            <div className="scoring-level-card level-basic">
              <div className="level-card-top">
                <span className="level-name">Cơ bản</span>
                <span className="level-score-pill">20 – 39 điểm</span>
              </div>
              <p>Nắm vững kiến thức cấu trúc dữ liệu nền tảng và xử lý tốt các bài toán đơn giản.</p>
            </div>

            <div className="scoring-level-card level-medium">
              <div className="level-card-top">
                <span className="level-name">Trung bình</span>
                <span className="level-score-pill">40 – 59 điểm</span>
              </div>
              <p>Xử lý thành thạo các dạng bài quen thuộc, cấu trúc điều khiển và thuật toán thông dụng.</p>
            </div>

            <div className="scoring-level-card level-good">
              <div className="level-card-top">
                <span className="level-name">Khá</span>
                <span className="level-score-pill">60 – 79 điểm</span>
              </div>
              <p>Vận dụng linh hoạt các kỹ thuật giải thuật phức tạp, tối ưu hóa thời gian và bộ nhớ.</p>
            </div>

            <div className="scoring-level-card level-advanced">
              <div className="level-card-top">
                <span className="level-name">Nâng cao</span>
                <span className="level-score-pill">80 – 100 điểm</span>
              </div>
              <p>Năng lực giải quyết bài toán chuyên sâu, thuật toán khó và duy trì độ ổn định xuất sắc.</p>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            PHẦN 3: CÁCH TÍNH ĐIỂM BÀI TẬP
            ═════════════════════════════════════════════════════════════ */}
        <section className="scoring-section">
          <div className="scoring-section-header">
            <span className="scoring-step-num">3</span>
            <h2>Cách tính điểm bài tập</h2>
          </div>

          <p className="scoring-section-desc">
            Điểm số của từng bài tập cụ thể được tính toán tường minh theo công thức chuẩn hóa dựa trên tỷ lệ vượt qua test case, điểm trần của bài và số lần nộp thử lại:
          </p>

          {/* Hộp hiển thị công thức trực quan */}
          <div className="scoring-formula-box">
            <span className="formula-tag">CÔNG THỨC CHUẨN</span>
            <div className="formula-main-expr">
              <span className="formula-part-target">Điểm bài tập</span>
              <span className="formula-operator">=</span>
              <span className="formula-part-core">(Accuracy × Điểm trần mức độ)</span>
              <span className="formula-operator">−</span>
              <span className="formula-part-penalty">Phạt thử lại</span>
            </div>
            <div className="formula-constraint-note">
              Ràng buộc điểm: <strong>0 ≤ Điểm bài tập ≤ Điểm trần mức độ</strong>
            </div>
          </div>

          {/* Bảng điểm trần theo 5 mức độ bài tập */}
          <div className="scoring-table-container">
            <table className="scoring-table">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Mức độ bài tập</th>
                  <th style={{ width: '25%', textAlign: 'center' }}>Điểm trần tối đa</th>
                  <th style={{ width: '45%' }}>Ý nghĩa & Phạm vi đánh giá</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600, color: '#94a3b8' }}>Mới bắt đầu</td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#f1f5f9' }}>19</td>
                  <td>Điểm tối đa có thể đạt được ở các bài tập nhập môn</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: '#22c55e' }}>Cơ bản</td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#f1f5f9' }}>39</td>
                  <td>Tương ứng trần điểm năng lực Cơ bản</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: '#3b82f6' }}>Trung bình</td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#f1f5f9' }}>59</td>
                  <td>Tương ứng trần điểm năng lực Trung bình</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: '#f59e0b' }}>Khá</td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#f1f5f9' }}>79</td>
                  <td>Tương ứng trần điểm năng lực Khá</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: '#c084fc' }}>Nâng cao</td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#f1f5f9' }}>100</td>
                  <td>Mức điểm cao nhất dành cho các bài toán giải thuật chuyên sâu</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Chi tiết các yếu tố tính điểm */}
          <div className="scoring-factors-grid" style={{ marginTop: '20px' }}>
            <div className="scoring-factor-card">
              <div className="factor-icon-wrap" style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)' }}>
                <Target size={22} />
              </div>
              <div>
                <h3>Accuracy (Độ chính xác)</h3>
                <p>
                  Tỷ lệ phần trăm test case mà mã nguồn của bạn vượt qua. Ví dụ: vượt qua 8/10 test case sẽ đạt Accuracy = 0.8 (80%).
                </p>
              </div>
            </div>

            <div className="scoring-factor-card">
              <div className="factor-icon-wrap" style={{ color: '#a78bfa', background: 'rgba(167, 139, 250, 0.1)' }}>
                <Calculator size={22} />
              </div>
              <div>
                <h3>Điểm trần theo độ khó</h3>
                <p>
                  Mức điểm tối đa của bài tập được cố định theo độ khó tuyệt đối (19, 39, 59, 79, 100), phản ánh giá trị kiến thức của bài toán.
                </p>
              </div>
            </div>

            <div className="scoring-factor-card">
              <div className="factor-icon-wrap" style={{ color: '#f87171', background: 'rgba(248, 113, 113, 0.1)' }}>
                <RotateCcw size={22} />
              </div>
              <div>
                <h3>Phạt thử lại (Retry Penalty)</h3>
                <p>
                  Mỗi lần nộp sai trước khi giải đúng sẽ bị trừ <strong>3 điểm</strong>. Tổng điểm phạt thử lại tối đa là <strong>15 điểm</strong>.
                </p>
              </div>
            </div>

            <div className="scoring-factor-card">
              <div className="factor-icon-wrap" style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.1)' }}>
                <Bot size={22} />
              </div>
              <div>
                <h3>Hỗ trợ học tập từ AI</h3>
                <p>
                  Việc sử dụng trợ lý AI để giải thích lỗi, gợi ý hướng giải và học tập <strong>không trực tiếp làm giảm điểm năng lực</strong> của bạn.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            PHẦN 4: PHÂN BIỆT ĐIỂM BÀI TẬP VÀ ĐIỂM NĂNG LỰC
            ═════════════════════════════════════════════════════════════ */}
        <section className="scoring-section">
          <div className="scoring-section-header">
            <span className="scoring-step-num">4</span>
            <h2>Phân biệt điểm bài tập và điểm năng lực</h2>
          </div>

          <p className="scoring-section-desc">
            Rất nhiều sinh viên nhầm lẫn giữa điểm của một bài tập và điểm năng lực toàn diện. Hệ thống phân định rõ ràng như sau:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: '#121827', border: '1px solid #1e2638', borderRadius: '12px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#38bdf8', fontWeight: 700 }}>
                <FileText size={18} /> Điểm bài tập (Problem Score)
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                Phản ánh kết quả cụ thể của <strong>một bài tập duy nhất</strong>. Mỗi bài chỉ được ghi nhận <strong>một kết quả chính thức duy nhất</strong> (lần nộp hợp lệ tốt nhất), không tính mỗi lần nộp thành một bài tập độc lập.
              </p>
            </div>

            <div style={{ background: '#121827', border: '1px solid #1e2638', borderRadius: '12px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#a78bfa', fontWeight: 700 }}>
                <Award size={18} /> Điểm năng lực (Competence Score)
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                Là thước đo tổng thể trình độ thành thạo trong <strong>toàn bộ chủ đề</strong>, được tổng hợp từ kết quả của <strong>nhiều bài tập độc lập khác nhau</strong> với các cấp độ khó đa dạng.
              </p>
            </div>
          </div>

          {/* Bảng ví dụ minh họa trực quan */}
          <div className="example-header" style={{ marginBottom: '12px' }}>
            <Sparkles size={16} style={{ color: '#f59e0b' }} /> Ví dụ minh họa: Tập hợp kết quả các bài tập trong chủ đề "Mảng (Array)"
          </div>

          <div className="scoring-table-container">
            <table className="scoring-table">
              <thead>
                <tr>
                  <th>Tên bài tập</th>
                  <th>Độ khó</th>
                  <th style={{ textAlign: 'center' }}>Điểm trần</th>
                  <th style={{ textAlign: 'center' }}>Accuracy</th>
                  <th style={{ textAlign: 'center' }}>Nộp lỗi</th>
                  <th>Cách tính điểm bài tập</th>
                  <th style={{ textAlign: 'center' }}>Điểm bài tập</th>
                  <th>Trạng thái ghi nhận</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600, color: '#f1f5f9' }}>Bài 1: Tìm số lớn nhất</td>
                  <td><span className="text-slate-400 font-medium">Mới bắt đầu</span></td>
                  <td style={{ textAlign: 'center' }}>19</td>
                  <td style={{ textAlign: 'center', color: '#22c55e', fontWeight: 600 }}>100%</td>
                  <td style={{ textAlign: 'center' }}>0 lần</td>
                  <td><code>19 × 1.0 − 0</code></td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#f1f5f9' }}>19.0</td>
                  <td><span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold"><CheckCircle2 size={13} /> Ghi nhận chính thức</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: '#f1f5f9' }}>Bài 2: Đảo ngược mảng</td>
                  <td><span className="text-emerald-400 font-medium">Cơ bản</span></td>
                  <td style={{ textAlign: 'center' }}>39</td>
                  <td style={{ textAlign: 'center', color: '#22c55e', fontWeight: 600 }}>100%</td>
                  <td style={{ textAlign: 'center', color: '#f87171' }}>1 lần (-3đ)</td>
                  <td><code>39 × 1.0 − 3</code></td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#f1f5f9' }}>36.0</td>
                  <td><span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold"><CheckCircle2 size={13} /> Ghi nhận chính thức</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: '#f1f5f9' }}>Bài 3: Hai con trỏ</td>
                  <td><span className="text-blue-400 font-medium">Trung bình</span></td>
                  <td style={{ textAlign: 'center' }}>59</td>
                  <td style={{ textAlign: 'center', color: '#60a5fa', fontWeight: 600 }}>80%</td>
                  <td style={{ textAlign: 'center', color: '#f87171' }}>2 lần (-6đ)</td>
                  <td><code>59 × 0.8 − 6</code></td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#f1f5f9' }}>41.2</td>
                  <td><span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold"><CheckCircle2 size={13} /> Ghi nhận chính thức</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: '#f1f5f9' }}>Bài 4: Mảng con lớn nhất</td>
                  <td><span className="text-amber-400 font-medium">Khá</span></td>
                  <td style={{ textAlign: 'center' }}>79</td>
                  <td style={{ textAlign: 'center', color: '#f59e0b', fontWeight: 600 }}>60%</td>
                  <td style={{ textAlign: 'center' }}>0 lần</td>
                  <td><code>79 × 0.6 − 0</code></td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#f1f5f9' }}>47.4</td>
                  <td><span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold"><CheckCircle2 size={13} /> Ghi nhận chính thức</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: '#f1f5f9' }}>Bài 5: Quy hoạch động mảng</td>
                  <td><span className="text-purple-400 font-medium">Nâng cao</span></td>
                  <td style={{ textAlign: 'center' }}>100</td>
                  <td style={{ textAlign: 'center', color: '#f87171', fontWeight: 600 }}>40%</td>
                  <td style={{ textAlign: 'center', color: '#f87171' }}>3 lần (-9đ)</td>
                  <td><code>100 × 0.4 − 9</code></td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#f1f5f9' }}>31.0</td>
                  <td><span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold"><CheckCircle2 size={13} /> Ghi nhận chính thức</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="scoring-note-box info">
            <Info size={18} className="text-sky-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4>Nguyên tắc tổng hợp năng lực chủ đề</h4>
              <p>
                Điểm năng lực chủ đề phản ánh tập hợp các bài tập độc lập mà bạn đã giải. Nộp lại nhiều lần cho cùng một bài toán không làm tăng số lượng bài ghi nhận. Năng lực chỉ thực sự tăng khi bạn mở rộng giải quyết các bài tập mới ở các độ khó phù hợp.
              </p>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            PHẦN 5: CƠ CHẾ CẬP NHẬT BAND
            ═════════════════════════════════════════════════════════════ */}
        <section className="scoring-section">
          <div className="scoring-section-header">
            <span className="scoring-step-num">5</span>
            <h2>Cơ chế cập nhật band năng lực</h2>
          </div>

          <p className="scoring-section-desc">
            Band năng lực của bạn trong mỗi chủ đề không cố định mà biến đổi linh hoạt theo quá trình rèn luyện qua 3 trạng thái đánh giá:
          </p>

          <div className="scoring-band-grid">
            <div className="scoring-band-card promote">
              <div className="band-card-header">
                <div className="band-card-icon">
                  <TrendingUp size={20} />
                </div>
                <h3>Tăng band</h3>
              </div>
              <p>
                Được kích hoạt khi bạn hoàn thành đủ số lượng bài tập độc lập với độ chính xác cao, chứng minh được sự sẵn sàng và thành thạo ở cấp độ khó cao hơn.
              </p>
            </div>

            <div className="scoring-band-card maintain">
              <div className="band-card-header">
                <div className="band-card-icon">
                  <ShieldCheck size={20} />
                </div>
                <h3>Giữ band</h3>
              </div>
              <p>
                Diễn ra khi kết quả luyện tập của bạn vẫn tiếp tục đáp ứng và duy trì ổn định trong khung năng lực tiêu chuẩn của band hiện tại.
              </p>
            </div>

            <div className="scoring-band-card demote">
              <div className="band-card-header">
                <div className="band-card-icon">
                  <TrendingDown size={20} />
                </div>
                <h3>Giảm band</h3>
              </div>
              <p>
                Xảy ra khi kết quả qua nhiều bài tập phù hợp với band cho thấy độ chính xác sụt giảm liên tục, phản ánh năng lực hiện tại chưa duy trì được ở band này.
              </p>
            </div>
          </div>

          {/* 2 Lưu ý cốt lõi */}
          <div className="scoring-note-box warning">
            <AlertCircle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 style={{ color: '#fbbf24' }}>Hai nguyên tắc quan trọng cần ghi nhớ:</h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
                <li>
                  <strong>Thử sức bài khó hơn không làm giảm band:</strong> Một lần nộp không đạt hoặc thất bại khi chủ động thử sức với bài toán ở mức độ cao hơn band hiện tại <em>tuyệt đối không tự động làm giảm band</em> của bạn. Hệ thống luôn khuyến khích sinh viên vượt qua vùng an toàn.
                </li>
                <li>
                  <strong>Chỉ làm nhiều bài dễ không đủ để tăng band:</strong> Việc giải liên tục nhiều bài ở mức độ thấp (như Mới bắt đầu hoặc Cơ bản) không thể dùng làm bằng chứng để tăng lên các band cao hơn như Khá hay Nâng cao.
                </li>
              </ul>
              <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                * Ghi chú: Các ngưỡng số lượng bài tập tối thiểu và tỷ lệ pass chi tiết cho từng điều kiện chuyển band sẽ do hệ thống Backend chuẩn hóa khi kích hoạt tính năng đánh giá tự động.
              </p>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════
            PHẦN 6: ĐỘ TIN CẬY VÀ CÁCH CẢI THIỆN NĂNG LỰC
            ═════════════════════════════════════════════════════════════ */}
        <section className="scoring-section">
          <div className="scoring-section-header">
            <span className="scoring-step-num">6</span>
            <h2>Độ tin cậy và cách cải thiện năng lực</h2>
          </div>

          <p className="scoring-section-desc">
            Chỉ số độ tin cậy thể hiện mức độ xác thực của band năng lực hiện tại, được tính toán dựa trên số lượng bài tập độc lập đã giải, độ bao phủ các mức độ khó và tính ổn định của kết quả:
          </p>

          <div className="confidence-grid" style={{ marginBottom: '24px' }}>
            <div className="confidence-card low">
              <div className="confidence-head">
                <span className="confidence-dot low" />
                <span className="confidence-title">Thấp</span>
              </div>
              <p>Số lượng bài tập độc lập còn ít hoặc chưa đa dạng mức độ khó. Kết quả band mang tính định hướng ban đầu.</p>
            </div>

            <div className="confidence-card medium">
              <div className="confidence-head">
                <span className="confidence-dot medium" />
                <span className="confidence-title">Trung bình</span>
              </div>
              <p>Đã hoàn thành một tập hợp bài tập đủ đa dạng qua nhiều cấp độ. Điểm số và band có độ chuẩn xác tương đối tốt.</p>
            </div>

            <div className="confidence-card high">
              <div className="confidence-head">
                <span className="confidence-dot high" />
                <span className="confidence-title">Cao</span>
              </div>
              <p>Số lượng bài tập phong phú, kết quả đạt độ ổn định vững chắc qua các mức độ khó. Năng lực được kiểm chứng tin cậy.</p>
            </div>
          </div>

          {/* Lời khuyên cải thiện */}
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightbulb size={18} className="text-amber-400" /> 5 Lời khuyên thiết thực để nâng cao điểm năng lực:
          </h3>

          <div className="tips-list">
            <div className="tip-item">
              <div className="tip-icon"><CheckCircle2 size={18} /></div>
              <span><strong>Luyện tập đa dạng bài tập:</strong> Giải nhiều bài toán khác nhau trong cùng chủ đề thay vì chỉ làm đi làm lại một bài tập quen thuộc.</span>
            </div>

            <div className="tip-item">
              <div className="tip-icon"><CheckCircle2 size={18} /></div>
              <span><strong>Kiểm tra kỹ các trường hợp biên:</strong> Chú ý các dữ liệu đặc biệt như mảng rỗng, giá trị âm, giới hạn cực trị trước khi bấm nộp bài để đạt Accuracy tối đa.</span>
            </div>

            <div className="tip-item">
              <div className="tip-icon"><CheckCircle2 size={18} /></div>
              <span><strong>Hạn chế nộp lại liên tục:</strong> Khi bài làm chưa đúng, hãy đọc kỹ thông báo lỗi và tự gỡ lỗi (debug) thay vì nộp mò nhiều lần để tránh bị trừ điểm phạt thử lại.</span>
            </div>

            <div className="tip-item">
              <div className="tip-icon"><CheckCircle2 size={18} /></div>
              <span><strong>Từng bước nâng dần độ khó:</strong> Sau khi đã vững ở mức độ hiện tại, hãy chủ động giải các bài tập ở mức cao hơn để tích lũy điều kiện tăng band.</span>
            </div>

            <div className="tip-item">
              <div className="tip-icon"><CheckCircle2 size={18} /></div>
              <span><strong>Tận dụng AI thông minh:</strong> Sử dụng trợ lý AI để hiểu sâu nguyên nhân lỗi và học hỏi cách tiếp cận bài toán tối ưu mà không lo bị trừ điểm.</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

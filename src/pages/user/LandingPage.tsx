import { useEffect } from 'react';
import {
  BrainCircuit,
  ChevronRight,
  Code2,
  Network,
  Sparkles,
  Terminal,
  Braces,
  Cpu,
  Binary,
  CheckCircle2,
  ArrowRight,
  Zap,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { Header } from '@/layout/Header';
import { Footer } from '@/layout/Footer';
import type { AuthMode } from '@/types';

interface LandingPageProps {
  onGoAuth: (mode: AuthMode) => void;
  onGoTopics: () => void;
  onGoProfile?: () => void;
  onGoProgress?: () => void;
  onGoSettings?: () => void;
  onGoStartPractice?: () => void;
  onLoggedOut?: () => void;
}

const features = [
  {
    title: 'Chấm bài tự động trong sandbox',
    description:
      'Biên dịch, chạy test case ẩn, đo thời gian thực thi và bộ nhớ tiêu thụ trong môi trường cô lập.',
    accent: 'mint',
    icon: Code2,
  },
  {
    title: 'AI phân tích lỗi & gợi ý',
    description:
      'Giải thích nguyên nhân và gợi ý hướng sửa – giúp bạn tự viết lời giải tối ưu nhất.',
    accent: 'violet',
    icon: BrainCircuit,
  },
  {
    title: 'Nội dung sát năng lực',
    description:
      'Giảng viên chọn chủ đề, template và mức độ; AI sinh đề, test case và lời giải tham khảo để duyệt.',
    accent: 'yellow',
    icon: Sparkles,
  },
  {
    title: 'Theo dõi tiến bộ trực quan',
    description:
      'Biểu đồ trực quan cho cả sinh viên và giảng viên để nắm tiến độ và độ khó theo thời gian thực.',
    accent: 'green',
    icon: Network,
  },
];

export function LandingPage({
  onGoAuth,
  onGoTopics,
  onGoProfile,
  onGoProgress,
  onGoSettings,
  onGoStartPractice,
  onLoggedOut,
}: LandingPageProps) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.12 }
    );

    const elements = document.querySelectorAll(
      '.animate-on-scroll, .workflow-step-card, .landing-topic-card, .feature-card'
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="site-shell">
      <Header
        onGoAuth={onGoAuth}
        onGoTopics={onGoTopics}
        onScrollFeatures={scrollToFeatures}
        onGoProfile={onGoProfile ?? (() => {})}
        onGoProgress={onGoProgress ?? (() => {})}
        onGoSettings={onGoSettings}
        onLoggedOut={onLoggedOut}
      />

      <main>
        {/* ===== HERO SECTION ===== */}
        <section className="hero">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <div className="hero-grid-pattern" />

          {/* Floating Watermark Tech Icons */}
          <div className="hero-watermark-icons" aria-hidden="true">
            <Code2 className="hero-wm-icon wm-1" size={54} />
            <Terminal className="hero-wm-icon wm-2" size={46} />
            <Braces className="hero-wm-icon wm-3" size={58} />
            <Cpu className="hero-wm-icon wm-4" size={48} />
            <Sparkles className="hero-wm-icon wm-5" size={40} />
            <Binary className="hero-wm-icon wm-6" size={50} />
          </div>

          <div className="hero-content animate-on-scroll">
            <h1 className="hero-banner-title">
              <span className="hero-word-code">Your <em>Code.</em></span>{' '}
              <span className="hero-word-level">Your <em>Level.</em></span>{' '}
              <span className="hero-word-challenge">Your <em>Challenge.</em></span>
            </h1>
            <p className="hero-copy">
              Every submission tells us more about you. Hệ thống phân tích kết quả và hiệu suất code để xây dựng mức độ phù hợp và liên tục điều chỉnh thử thách theo năng lực của bạn.
            </p>
            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={onGoStartPractice ?? onGoTopics}
              >
                Bắt đầu luyện tập <ChevronRight size={14} />
              </button>
              <button className="secondary-button" onClick={() => onGoAuth('login')}>
                Đã có tài khoản
              </button>
            </div>
          </div>
        </section>

        {/* ===== STATS COUNTER BAR ===== */}
        <div className="landing-stats-bar animate-on-scroll">
          <div className="landing-stats-container">
            <div className="stat-item">
              <div className="stat-icon-box blue">
                <Code2 size={18} />
              </div>
              <div className="stat-text">
                <span className="stat-number">1,500+</span>
                <span className="stat-label">Thử thách Sandbox</span>
              </div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-icon-box amber">
                <Zap size={18} />
              </div>
              <div className="stat-text">
                <span className="stat-number">&lt; 0.5s</span>
                <span className="stat-label">Chấm bài tức thì</span>
              </div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-icon-box emerald">
                <TrendingUp size={18} />
              </div>
              <div className="stat-text">
                <span className="stat-number">98%</span>
                <span className="stat-label">Nâng level thành công</span>
              </div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-icon-box purple">
                <BrainCircuit size={18} />
              </div>
              <div className="stat-text">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Trợ lý AI hỗ trợ</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION DIVIDER */}
        <div className="landing-section-divider">
          <div className="divider-line" />
        </div>

        {/* ===== FEATURES SECTION ===== */}
        <section className="features-section" id="features">
          <div className="section-heading animate-on-scroll">
            <h2>Được xây dựng cho người học lẫn giảng viên</h2>
          </div>
          <div className="feature-grid">
            {features.map(({ title, description, accent, icon: Icon }) => (
              <article className={`feature-card ${accent}`} key={title}>
                <div className="feature-icon">
                  <Icon size={19} strokeWidth={1.8} />
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION DIVIDER */}
        <div className="landing-section-divider">
          <div className="divider-line" />
        </div>

        {/* ===== POPULAR TOPICS PREVIEW ===== */}
        <section className="landing-topics-section">
          <div className="section-heading animate-on-scroll">
            <h2>Các chủ đề thuật toán nổi bật</h2>
            <p className="section-sub">
              Hệ thống chủ đề được thiết kế bài bản từ cơ bản đến nâng cao cho sinh viên lập trình
            </p>
          </div>

          <div className="landing-topics-grid">
            <div className="landing-topic-card" onClick={onGoTopics}>
              <div className="topic-card-header">
                <div className="topic-card-icon-box blue">
                  <Code2 size={24} />
                </div>
                <span className="topic-badge easy">Cơ bản</span>
              </div>
              <h3>Mảng & Chuỗi (Arrays & Strings)</h3>
              <p>Kỹ năng thao tác dữ liệu cơ bản, con trỏ đôi, cửa sổ trượt (Sliding Window) và biến đổi chuỗi.</p>
              <div className="topic-card-footer">
                <span className="topic-count">8 bài tập Sandbox</span>
                <span className="topic-link">Luyện tập <ArrowRight size={14} /></span>
              </div>
            </div>

            <div className="landing-topic-card" onClick={onGoTopics}>
              <div className="topic-card-header">
                <div className="topic-card-icon-box purple">
                  <Network size={24} />
                </div>
                <span className="topic-badge medium">Trung bình</span>
              </div>
              <h3>Cấu trúc Dữ liệu (Data Structures)</h3>
              <p>Danh sách liên kết (LinkedList), Ngăn xếp Stack, Hàng đợi Queue và Cây nhị phân Binary Tree.</p>
              <div className="topic-card-footer">
                <span className="topic-count">12 bài tập Sandbox</span>
                <span className="topic-link">Luyện tập <ArrowRight size={14} /></span>
              </div>
            </div>

            <div className="landing-topic-card" onClick={onGoTopics}>
              <div className="topic-card-header">
                <div className="topic-card-icon-box amber">
                  <Zap size={24} />
                </div>
                <span className="topic-badge hard">Nâng cao</span>
              </div>
              <h3>Giải thuật Nâng cao (Algorithms)</h3>
              <p>Tìm kiếm Nhị phân, Đồ thị BFS/DFS, Đệ quy Quay chỏ và Quy hoạch động (Dynamic Programming).</p>
              <div className="topic-card-footer">
                <span className="topic-count">10 bài tập Sandbox</span>
                <span className="topic-link">Luyện tập <ArrowRight size={14} /></span>
              </div>
            </div>
          </div>

          <div className="landing-topics-cta animate-on-scroll">
            <button className="secondary-button" onClick={onGoTopics}>
              <span>Khám phá tất cả chủ đề</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </section>

        {/* SECTION DIVIDER */}
        <div className="landing-section-divider">
          <div className="divider-line" />
        </div>

        {/* ===== WORKFLOW 3 STEPS SECTION ===== */}
        <section className="landing-workflow-section">
          <div className="section-heading animate-on-scroll">
            <h2>Quy trình rèn luyện 3 bước hiệu quả</h2>
          </div>

          <div className="workflow-steps-grid">
            <div className="workflow-step-card">
              <div className="step-number">01</div>
              <div className="step-icon-wrap">
                <BookOpen size={26} />
              </div>
              <h3>Chọn bài tập phù hợp</h3>
              <p>Hệ thống tự động gợi ý bài tập phù hợp với trình độ thực tế và lịch sử giải bài của bạn.</p>
            </div>

            <div className="workflow-step-card">
              <div className="step-number">02</div>
              <div className="step-icon-wrap">
                <Terminal size={26} />
              </div>
              <h3>Code trong Sandbox & nhận Gợi ý AI</h3>
              <p>Viết code trực tiếp, chấm tự động trong môi trường cô lập bảo mật, nhận phản hồi phân tích lỗi từ AI.</p>
            </div>

            <div className="workflow-step-card">
              <div className="step-number">03</div>
              <div className="step-icon-wrap">
                <TrendingUp size={26} />
              </div>
              <h3>Theo dõi tăng trưởng & Thăng cấp</h3>
              <p>Xem biểu đồ tiến bộ trực quan, thăng hạng level và sẵn sàng cho các bài kiểm tra thực tế.</p>
            </div>
          </div>
        </section>

        {/* SECTION DIVIDER */}
        <div className="landing-section-divider">
          <div className="divider-line" />
        </div>

        {/* ===== SHOWCASE AI & SANDBOX SECTION ===== */}
        <section className="landing-showcase-section">
          <div className="showcase-content animate-on-scroll">
            <div className="showcase-text">
              <h2>Trợ lý AI thông minh & Môi trường Chấm tự động</h2>
              <p>
                Không còn nỗi lo bế tắc khi gặp lỗi biên dịch hay sai testcase. Trợ lý AI phân tích nguyên nhân lỗi, hỗ trợ gợi ý hướng suy nghĩ mà vẫn đảm bảo bạn tự mình hoàn thiện bài tập.
              </p>

              <ul className="showcase-features-list">
                <li>
                  <CheckCircle2 size={18} className="check-icon" />
                  <span>Chấm bài tự động tức thì trong môi trường Sandbox cô lập an toàn</span>
                </li>
                <li>
                  <CheckCircle2 size={18} className="check-icon" />
                  <span>Gợi ý hướng sửa lỗi thông minh, giải thích nguyên nhân bug theo từng dòng</span>
                </li>
                <li>
                  <CheckCircle2 size={18} className="check-icon" />
                  <span>Đánh giá tối ưu bộ nhớ và độ phức tạp thuật toán O(n)</span>
                </li>
              </ul>

              <button className="primary-button" onClick={onGoTopics}>
                Bắt đầu luyện tập ngay <ArrowRight size={14} />
              </button>
            </div>

            <div className="showcase-visual">
              <div className="mockup-code-window">
                <div className="mockup-header">
                  <div className="mockup-dots">
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                  </div>
                  <span className="mockup-title">solution.py — Code Sandbox</span>
                </div>
                <div className="mockup-body">
                  <pre className="code-snippet">
                    <code>
{`def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`}
                    </code>
                  </pre>
                  <div className="mockup-ai-callout">
                    <div className="ai-callout-header">
                      <Sparkles size={14} /> AI Analysis Feedback
                    </div>
                    <p>
                      <strong>Đánh giá:</strong> Lời giải đạt độ phức tạp <code>O(N)</code> thời gian và <code>O(N)</code> bộ nhớ. Tối ưu xuất sắc!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION DIVIDER */}
        <div className="landing-section-divider">
          <div className="divider-line" />
        </div>

        {/* ===== FINAL CALL TO ACTION BANNER ===== */}
        <section className="landing-cta-banner">
          <div className="cta-banner-content animate-on-scroll">
            <h2>Sẵn sàng nâng tầm trình độ lập trình của bạn?</h2>
            <p>Gia nhập cộng đồng sinh viên luyện tập thuật toán và nâng cao tư duy giải quyết vấn đề ngay hôm nay.</p>
            <div className="cta-banner-buttons">
              <button className="primary-button" onClick={onGoTopics}>
                Khám phá bài tập <ChevronRight size={14} />
              </button>
              <button className="secondary-button" onClick={() => onGoAuth('signup')}>
                Tạo tài khoản miễn phí
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

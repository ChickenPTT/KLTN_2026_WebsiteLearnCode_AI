import { Brand } from '@/components/Brand';
import { Sparkles, Terminal, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">
            <Brand />
          </div>
          <p className="footer-desc">
            Nền tảng luyện tập lập trình thông minh kết hợp đánh giá năng lực tự động,
            chấm bài trong môi trường Sandbox bảo mật và phân tích tối ưu hóa mã nguồn bằng AI.
          </p>
          <div className="footer-tech-badges">
            <span className="tech-badge">
              <Terminal size={12} /> Code Sandbox
            </span>
            <span className="tech-badge">
              <Sparkles size={12} /> AI Assisted
            </span>
            <span className="tech-badge">
              <ShieldCheck size={12} /> Secure Eval
            </span>
          </div>
        </div>

        <div className="footer-columns">
          <div className="footer-column">
            <h3>Tính năng</h3>
            <a href="#features">Flashcard Thuật toán</a>
            <a href="#features">Trắc nghiệm Kiến thức</a>
            <a href="#features">Code Sandbox Online</a>
            <a href="#features">Phân tích Lỗi bằng AI</a>
          </div>

          <div className="footer-column">
            <h3>Lộ trình học tập</h3>
            <a href="#topics">Cấu trúc Dữ liệu</a>
            <a href="#topics">Giải thuật Tìm kiếm</a>
            <a href="#topics">Lập trình Hướng đối tượng</a>
            <a href="#topics">Tối ưu độ phức tạp O(n)</a>
          </div>

          <div className="footer-column">
            <h3>Hệ thống</h3>
            <a href="#features">Đánh giá Năng lực</a>
            <a href="#features">Dành cho Giảng viên</a>
            <a href="#features">Hệ thống Sandbox</a>
            <div className="system-status-indicator">
              <span className="status-dot"></span> System Operational
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-copyright">
          <span>© {currentYear} <strong>CodeArena Platform</strong>. All rights reserved.</span>
        </div>
        <div className="footer-signature">
          <span>
            Crafted with <Heart size={13} className="heart-icon" /> for Developers • <strong>{currentYear}</strong>
          </span>
        </div>
      </div>
    </footer>
  );
}

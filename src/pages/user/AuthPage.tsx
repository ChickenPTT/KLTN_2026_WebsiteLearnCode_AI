import { useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Github,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { Brand } from '@/components/Brand';
import { useAuth } from '@/hooks/useAuth';
import type { AuthMode } from '@/types';
import type { UserRole } from '@/data/mockAuth';

interface AuthPageProps {
  onBack: () => void;
  initialMode: AuthMode;
  onLoginSuccess?: (isNewUser?: boolean, role?: UserRole) => void;
}

export function AuthPage({ onBack, initialMode, onLoginSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const { login, signup, loading, error, clearError } = useAuth();
  const isSignup = mode === 'signup';

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setLocalError(null);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    let res: { success: boolean; isNewUser?: boolean; role?: UserRole } = { success: false, isNewUser: false, role: undefined };
    if (isSignup) {
      if (password !== confirmPassword) {
        setLocalError('Mật khẩu xác nhận không khớp.');
        return;
      }
      // Đăng ký mặc định là student
      res = await signup(name, email, password, 'student');
    } else {
      // Đăng nhập
      res = await login(email, password);
    }

    if (res.success) {
      onLoginSuccess?.(res.isNewUser, res.role);
    }
  };

  const displayError = error || localError;

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="auth-visual-glow" />
        <div className="auth-visual-content">
          <Brand size={26} />
          <h2 className="auth-visual-title">
            Luyện code đúng<br />năng lực thật của bạn
          </h2>
          <p className="auth-visual-copy">
            Hệ thống chấm bài tự động, phân tích lỗi bằng AI và điều chỉnh độ khó theo trình độ —
            tất cả trong một nền tảng.
          </p>
          <div className="auth-visual-stats">
            <div><strong>1,200+</strong><span>Bài tập</span></div>
            <div><strong>50+</strong><span>Chủ đề</span></div>
            <div><strong>30+</strong><span>Trường ĐH</span></div>
          </div>

          {/* Gợi ý tài khoản mock */}
          <div className="auth-visual-hint">
            <p style={{ marginTop: '1.5rem', fontSize: '0.78rem', opacity: 0.6 }}>
              🧪 Mock test accounts:
            </p>
            <p style={{ fontSize: '0.75rem', opacity: 0.55, lineHeight: 1.8 }}>
              student@demo.com / demo1234 (Sinh viên)<br />
              teacher@demo.com / demo1234 (Giảng viên/Admin)<br />
              admin@demo.com &nbsp;/ demo1234 (Quản trị viên)
            </p>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <button className="auth-back" onClick={onBack}>
          <ArrowLeft size={18} /> Về trang chủ
        </button>

        <div className="auth-form-wrap">
          <h2 className="auth-form-title">{isSignup ? 'Tạo tài khoản' : 'Đăng nhập'}</h2>
          <p className="auth-form-sub">
            {isSignup
              ? 'Tài khoản Sinh viên mới bắt đầu hành trình luyện code'
              : 'Chào mừng bạn quay lại Mnemonic'}
          </p>

          <div className="auth-social-row">
            <button className="auth-social" type="button">
              <Github size={18} /> GitHub
            </button>
            <button className="auth-social" type="button">
              <Mail size={18} /> Google
            </button>
          </div>
          <div className="auth-divider"><span>hoặc</span></div>

          {/* Error banner */}
          {displayError && (
            <div
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                padding: '0.6rem 0.9rem',
                marginBottom: '0.75rem',
                fontSize: '0.85rem',
                color: '#f87171',
              }}
            >
              {displayError}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignup && (
              <label className="auth-field">
                <span className="auth-label">Họ và tên</span>
                <div className="auth-input-wrap">
                  <User size={17} className="auth-input-icon" />
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </label>
            )}

            <label className="auth-field">
              <span className="auth-label">Email</span>
              <div className="auth-input-wrap">
                <Mail size={17} className="auth-input-icon" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="auth-field">
              <span className="auth-label">Mật khẩu</span>
              <div className="auth-input-wrap">
                <Lock size={17} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isSignup ? 'Tối thiểu 8 ký tự' : '••••••••'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            {isSignup && (
              <label className="auth-field">
                <span className="auth-label">Xác nhận mật khẩu</span>
                <div className="auth-input-wrap">
                  <Lock size={17} className="auth-input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading
                ? 'Đang xử lý...'
                : isSignup
                  ? 'Đăng ký'
                  : 'Đăng nhập'}{' '}
              <ChevronRight size={17} />
            </button>
          </form>

          <p className="auth-switch">
            {isSignup ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
            <button type="button" onClick={() => switchMode(isSignup ? 'login' : 'signup')}>
              {isSignup ? 'Đăng nhập ngay' : 'Tạo tài khoản'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

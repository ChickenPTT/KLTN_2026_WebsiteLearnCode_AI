import { useState, useEffect } from 'react';

import {
  ArrowLeft,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { Brand } from '@/components/Brand';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { useAuth } from '@/hooks/useAuth';
import type { AuthMode } from '@/types';
import type { UserRole } from '@/data/mockAuth';
import { publicApi } from '@/lib/api';
import type { PublicStats } from '@/lib/api';
interface AuthPageProps {
  onBack: () => void;
  initialMode: AuthMode;
  onLoginSuccess?: (isNewUser?: boolean, role?: UserRole) => void;
}

export function AuthPage({ onBack, initialMode, onLoginSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const DEFAULT_STATS: PublicStats = {
    totalUsers: 0,
    totalTemplates: 0,
    totalProblems: 0,
    publishedProblems: 0,
    submissionsToday: 0,
    totalSubmissions7d: 0,
    passedSubmissions7d: 0,
    passRate: 0,
  };
  const [stats, setStats] = useState<PublicStats>(DEFAULT_STATS);

  useEffect(() => {
    publicApi.getStats().then(setStats).catch(() => {});
  }, []);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  // Dang ky 2 buoc: 'form' (nhap thong tin) -> 'code' (nhap ma gui toi email)
  const [signupStep, setSignupStep] = useState<'form' | 'code'>('form');
  const [code, setCode] = useState('');
  const [resendIn, setResendIn] = useState(0);

  // Dem nguoc nut "Gui lai ma"
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const { login, signup, requestSignupCode, loginWithGoogle, loading, error, clearError } = useAuth();

  // Google tra credential -> backend kiem tra, tao/dang nhap tai khoan
  const handleGoogle = async (credential: string) => {
    clearError();
    setLocalError(null);
    const res = await loginWithGoogle(credential);
    if (res.success) {
      onLoginSuccess?.(res.isNewUser, res.role);
    }
  };
  const isSignup = mode === 'signup';

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setLocalError(null);
    setSignupStep('form');
    setCode('');
    setResendIn(0);
    clearError();
  };

  // Gui (hoac gui lai) ma; backend khong bat xac nhan -> dang ky luon
  const sendCode = async () => {
    clearError();
    setLocalError(null);
    const res = await requestSignupCode(email);
    if (!res) return;
    if (!res.required) {
      const done = await signup(name, email, password);
      if (done.success) onLoginSuccess?.(done.isNewUser, done.role);
      return;
    }
    setSignupStep('code');
    setCode('');
    setResendIn(res.resendAfterSeconds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    let res: { success: boolean; isNewUser?: boolean; role?: UserRole } = { success: false, isNewUser: false, role: undefined };
    if (isSignup) {
      if (signupStep === 'form') {
        if (password !== confirmPassword) {
          setLocalError('Mật khẩu xác nhận không khớp.');
          return;
        }
        // Buoc 1: gui ma toi email truoc, chua tao tai khoan
        await sendCode();
        return;
      }
      // Buoc 2: ma dung -> tao tai khoan (mac dinh student)
      if (!/^\d{6}$/.test(code.trim())) {
        setLocalError('Mã xác nhận gồm 6 chữ số.');
        return;
      }
      res = await signup(name, email, password, code.trim());
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
            <div><strong>{stats.publishedProblems.toLocaleString('vi-VN')}</strong><span>Bài tập</span></div>
            <div><strong>12</strong><span>Chủ đề</span></div>
            {/*<div><strong>30+</strong><span>Trường ĐH</span></div>*/}
          </div>

          {/* Gợi ý tài khoản mock */}
          <div className="auth-visual-hint">
            {/*<p style={{ marginTop: '1.5rem', fontSize: '0.78rem', opacity: 0.6 }}>*/}
            {/*  🧪 Mock test accounts:*/}
            {/*</p>*/}
            {/*<p style={{ fontSize: '0.75rem', opacity: 0.55, lineHeight: 1.8 }}>*/}
            {/*  student@demo.com / demo1234 (Sinh viên)<br />*/}
            {/*  teacher@demo.com / demo1234 (Giảng viên/Admin)<br />*/}
            {/*  admin@demo.com &nbsp;/ demo1234 (Quản trị viên)*/}
            {/*</p>*/}
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

          <GoogleSignInButton onCredential={handleGoogle} text={isSignup ? 'signup_with' : 'signin_with'} />
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

          {isSignup && signupStep === 'code' ? (
            <form className="auth-form" onSubmit={handleSubmit}>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Mã xác nhận 6 số đã được gửi tới <strong>{email}</strong>.
                <br />
                <span style={{ opacity: 0.7, fontSize: '0.82rem' }}>
                  Không thấy email? Hãy kiểm tra thư mục <b>Spam / Quảng cáo</b>. Mã có hiệu lực 10 phút.
                </span>
              </p>
              <label className="auth-field">
                <span className="auth-label">Mã xác nhận</span>
                <div className="auth-input-wrap">
                  <KeyRound size={17} className="auth-input-icon" />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    style={{ letterSpacing: '0.4em', fontWeight: 700 }}
                    autoFocus
                    required
                  />
                </div>
              </label>
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Xác nhận & tạo tài khoản'} <ChevronRight size={17} />
              </button>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={loading || resendIn > 0}
                  style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: resendIn > 0 ? 'default' : 'pointer', opacity: resendIn > 0 ? 0.6 : 1, padding: 0 }}
                >
                  {resendIn > 0 ? `Gửi lại mã (${resendIn}s)` : 'Gửi lại mã'}
                </button>
                <button
                  type="button"
                  onClick={() => { setSignupStep('form'); setCode(''); clearError(); setLocalError(null); }}
                  style={{ background: 'none', border: 'none', color: 'inherit', opacity: 0.75, cursor: 'pointer', padding: 0 }}
                >
                  Đổi email
                </button>
              </div>
            </form>
          ) : (
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
          )}

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

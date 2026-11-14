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
  // Xac nhan email: bam "Gui ma" canh o Email -> lay ma trong email -> nhap vao o "Ma xac nhan"
  const [code, setCode] = useState('');
  const [codeSentTo, setCodeSentTo] = useState<string | null>(null); // email da gui ma
  const [codeRequired, setCodeRequired] = useState(true); // backend tat xac nhan -> false
  const [resendIn, setResendIn] = useState(0);
  const [info, setInfo] = useState<string | null>(null);

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
    setCode('');
    setCodeSentTo(null);
    setResendIn(0);
    setInfo(null);
    clearError();
  };

  // Nut "Gui ma": gui ma 6 so toi email dang nhap trong o Email
  const sendCode = async () => {
    clearError();
    setLocalError(null);
    setInfo(null);
    const target = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
      setLocalError('Vui lòng nhập email hợp lệ trước khi gửi mã.');
      return;
    }
    const res = await requestSignupCode(target);
    if (!res) return;
    if (!res.required) {
      setCodeRequired(false);
      setInfo('Hệ thống hiện không yêu cầu mã xác nhận, bạn có thể bấm Đăng ký.');
      return;
    }
    setCodeRequired(true);
    setCodeSentTo(target);
    setResendIn(res.resendAfterSeconds);
    setInfo(`Đã gửi mã tới ${target}. Hãy kiểm tra cả thư mục Spam. Mã có hiệu lực 10 phút.`);
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
      if (codeRequired) {
        if (!codeSentTo) {
          setLocalError('Vui lòng bấm "Gửi mã" để nhận mã xác nhận qua email.');
          return;
        }
        if (codeSentTo !== email.trim()) {
          setLocalError('Bạn đã đổi email, vui lòng bấm "Gửi mã" lại.');
          return;
        }
        if (!/^\d{6}$/.test(code.trim())) {
          setLocalError('Mã xác nhận gồm 6 chữ số.');
          return;
        }
      }
      // Ma dung -> backend moi tao tai khoan (mac dinh student)
      res = await signup(name, email, password, codeRequired ? code.trim() : undefined);
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

          {/* Thong bao da gui ma */}
          {isSignup && info && !displayError && (
            <div
              style={{
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: '8px',
                padding: '0.6rem 0.9rem',
                marginBottom: '0.75rem',
                fontSize: '0.85rem',
                color: '#4ade80',
              }}
            >
              {info}
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
              <div style={{ display: 'flex', gap: 8 }}>
                <div className="auth-input-wrap" style={{ flex: 1 }}>
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
                {/* Nut gui ma xac nhan (chi o trang Tao tai khoan) */}
                {isSignup && codeRequired && (
                  <button
                    type="button"
                    className="auth-submit"
                    onClick={sendCode}
                    disabled={loading || (resendIn > 0 && email.trim() === codeSentTo)}
                    style={{
                      marginTop: 0,
                      padding: '0 14px',
                      whiteSpace: 'nowrap',
                      fontSize: 13,
                      opacity: loading || (resendIn > 0 && email.trim() === codeSentTo) ? 0.6 : 1,
                    }}
                  >
                    {resendIn > 0 && email.trim() === codeSentTo
                      ? `Gửi lại (${resendIn}s)`
                      : codeSentTo ? 'Gửi lại mã' : 'Gửi mã'}
                  </button>
                )}
              </div>
            </label>

            {isSignup && codeRequired && (
              <label className="auth-field">
                <span className="auth-label">Mã xác nhận</span>
                <div className="auth-input-wrap">
                  <KeyRound size={17} className="auth-input-icon" />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Nhập mã 6 số gửi tới email"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    style={code ? { letterSpacing: '0.4em', fontWeight: 700 } : undefined}
                  />
                </div>
              </label>
            )}

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

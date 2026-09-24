import { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Save,
  User,
} from 'lucide-react';
import { Header } from '@/layout/Header';
import { useAuth } from '@/hooks/useAuth.tsx';
import type { AuthMode } from '@/types';
import { MOCK_STREAK, MOCK_SUBMISSIONS } from '@/data/userMockData';

interface ProfilePageProps {
  onBack: () => void;
  onGoLanding?: () => void;
  onGoAuth?: (mode: AuthMode) => void;
  onGoTopics?: () => void;
  onGoProfile?: () => void;
  onGoProgress?: () => void;
  onGoHistory?: () => void;
  onGoAdmin?: () => void;
  onGoSettings?: () => void;
}

export function ProfilePage({
  onBack,
  onGoLanding,
  onGoAuth,
  onGoTopics,
  onGoProfile,
  onGoProgress,
  onGoHistory,
  onGoAdmin,
  onGoSettings,
}: ProfilePageProps) {
  const { user, updateUser } = useAuth();

  const defaultName = user?.name ?? 'Nguyễn Văn A';
  const defaultEmail = user?.email ?? 'student@demo.com';
  const defaultRole =
    user?.role === 'teacher'
      ? 'Giảng viên'
      : user?.role === 'admin'
        ? 'Quản trị viên'
        : 'Sinh viên';

  const [editName, setEditName] = useState(defaultName);
  const [editEmail, setEditEmail] = useState(defaultEmail);
  const [saved, setSaved] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name: editName, email: editEmail });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setNewPassword('');
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2500);
  };

  const initials = editName
    .split(' ')
    .map((w) => w[0] || '')
    .slice(-2)
    .join('')
    .toUpperCase();

  return (
    <div className="page-shell">
      <Header
        activeView="profile"
        onGoLanding={onGoLanding}
        onGoAuth={onGoAuth}
        onGoTopics={onGoTopics}
        onGoProfile={onGoProfile}
        onGoProgress={onGoProgress}
        onGoHistory={onGoHistory}
        onGoAdmin={onGoAdmin}
        onGoSettings={onGoSettings}
      />

      <main className="profile-main">
        <div style={{ marginBottom: '20px' }}>
          <button className="auth-back" style={{ position: 'static' }} onClick={onBack}>
            <ArrowLeft size={18} /> Quay lại
          </button>
        </div>

        <div className="profile-layout">
          {/* ── Left: Avatar + quick stats ── */}
          <aside className="profile-sidebar">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                <span className="profile-avatar-initials">{initials}</span>
              </div>
              <button className="profile-avatar-edit" aria-label="Đổi ảnh">
                <Camera size={14} />
              </button>
            </div>
            <h2 className="profile-name">{editName}</h2>
            <span className="profile-role-badge">{defaultRole}</span>

            <div className="profile-quick-stats">
              <div className="profile-stat">
                <BookOpen size={18} strokeWidth={1.6} />
                <div>
                  <strong>{MOCK_SUBMISSIONS.filter((s) => s.status === 'passed').length}</strong>
                  <span>Bài đã giải</span>
                </div>
              </div>
              <div className="profile-stat">
                <span className="profile-streak-icon">🔥</span>
                <div>
                  <strong>{MOCK_STREAK}</strong>
                  <span>Ngày streak</span>
                </div>
              </div>
              <div className="profile-stat">
                <Calendar size={18} strokeWidth={1.6} />
                <div>
                  <strong>10/09/2026</strong>
                  <span>Ngày tham gia</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Right: forms ── */}
          <div className="profile-forms">
            {/* Form: thông tin cá nhân */}
            <section className="profile-section">
              <h3 className="profile-section-title">
                <User size={18} /> Thông tin cá nhân
              </h3>
              <form className="profile-form" onSubmit={handleSaveProfile}>
                <div className="profile-form-grid">
                  <label className="auth-field">
                    <span className="auth-label">Họ và tên</span>
                    <div className="auth-input-wrap">
                      <User size={17} className="auth-input-icon" />
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Họ và tên"
                        required
                      />
                    </div>
                  </label>
                  <label className="auth-field">
                    <span className="auth-label">Email</span>
                    <div className="auth-input-wrap">
                      <Mail size={17} className="auth-input-icon" />
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="Email"
                        required
                      />
                    </div>
                  </label>
                </div>
                <button type="submit" className="profile-save-btn">
                  {saved ? (
                    <>
                      <CheckCircle2 size={16} /> Đã lưu!
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Lưu thay đổi
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* Form: đổi mật khẩu */}
            <section className="profile-section">
              <h3 className="profile-section-title">
                <Lock size={18} /> Đổi mật khẩu
              </h3>
              <form className="profile-form" onSubmit={handleSavePassword}>
                <div className="profile-form-grid">
                  <label className="auth-field">
                    <span className="auth-label">Mật khẩu hiện tại</span>
                    <div className="auth-input-wrap">
                      <Lock size={17} className="auth-input-icon" />
                      <input type="password" placeholder="••••••••" autoComplete="current-password" />
                    </div>
                  </label>
                  <label className="auth-field">
                    <span className="auth-label">Mật khẩu mới</span>
                    <div className="auth-input-wrap">
                      <Lock size={17} className="auth-input-icon" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="Tối thiểu 8 ký tự"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="auth-eye"
                        onClick={() => setShowPass(!showPass)}
                      >
                        {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </label>
                </div>
                <button type="submit" className="profile-save-btn" disabled={newPassword.length < 8}>
                  {pwSaved ? (
                    <>
                      <CheckCircle2 size={16} /> Mật khẩu đã đổi!
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Đổi mật khẩu
                    </>
                  )}
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

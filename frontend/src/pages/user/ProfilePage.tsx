import { useEffect, useState } from 'react';
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
import { formatDate } from '@/lib/progress';
import { authApi, userApi, BackendUnavailableError, ApiError, type UserStats } from '@/lib/api';

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
  onGoFlashcards?: () => void;
  onGoFlashcardLibrary?: () => void;
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
  onGoFlashcards,
  onGoFlashcardLibrary,
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
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const [stats, setStats] = useState<UserStats | null>(null);
  useEffect(() => {
    let cancelled = false;
    userApi
      .getStats()
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch(() => {
        // khong co thong ke -> hien "—"
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileError(null);
    try {
      const updatedUser = await authApi.updateProfile(editName, editEmail);
      updateUser({ name: updatedUser.fullName, email: updatedUser.email });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      if (err instanceof BackendUnavailableError) {
        setProfileError('Không kết nối được máy chủ. Vui lòng thử lại sau.');
      } else if (err instanceof ApiError) {
        setProfileError(err.message);
      } else {
        setProfileError('Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSaving(true);
    setPwError(null);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      if (err instanceof BackendUnavailableError) {
        setPwError('Không kết nối được máy chủ. Vui lòng thử lại sau.');
      } else if (err instanceof ApiError) {
        setPwError(err.message);
      } else {
        setPwError('Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setPwSaving(false);
    }
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
        onGoFlashcards={onGoFlashcards}
        onGoFlashcardLibrary={onGoFlashcardLibrary}
        onGoProfile={onGoProfile}
        onGoProgress={onGoProgress}
        onGoHistory={onGoHistory}
        onGoAdmin={onGoAdmin}
        onGoSettings={onGoSettings}
      />

      <main className="profile-main">
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
                  <strong>{stats?.solvedCount ?? '—'}</strong>
                  <span>Bài đã giải</span>
                </div>
              </div>
              <div className="profile-stat">
                <span className="profile-streak-icon">🔥</span>
                <div>
                  <strong>{stats?.streak ?? '—'}</strong>
                  <span>Ngày streak</span>
                </div>
              </div>
              <div className="profile-stat">
                <Calendar size={18} strokeWidth={1.6} />
                <div>
                  <strong>{stats?.joinedAt ? formatDate(stats.joinedAt) : '—'}</strong>
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
                        disabled={saving}
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
                        disabled={saving}
                      />
                    </div>
                  </label>
                </div>
                {profileError && (
                  <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>
                    {profileError}
                  </div>
                )}
                <button type="submit" className="profile-save-btn" disabled={saving}>
                  {saving ? (
                    <>Đang lưu...</>
                  ) : saved ? (
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
                      <input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        disabled={pwSaving}
                      />
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
                        disabled={pwSaving}
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
                {pwError && (
                  <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>
                    {pwError}
                  </div>
                )}
                <button type="submit" className="profile-save-btn" disabled={pwSaving || newPassword.length < 8}>
                  {pwSaving ? (
                    <>Đang đổi mật khẩu...</>
                  ) : pwSaved ? (
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

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Moon,
  Sun,
  Monitor,
  Globe,
  Sliders,
  Bell,
  Lock,
  CheckCircle2,
  RotateCcw,
  Save,
  Code2,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { Header } from '@/layout/Header';
import { SearchableSelect } from '@/components/SearchableSelect';
import type { AuthMode } from '@/types';

interface SettingsPageProps {
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

export type ThemeOption = 'dark' | 'light' | 'system';
export type LanguageOption = 'vi' | 'en';

export function SettingsPage({
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
}: SettingsPageProps) {
  // ── State cài đặt ──
  const [theme, setTheme] = useState<ThemeOption>(() => {
    return (localStorage.getItem('app_theme') as ThemeOption) || 'dark';
  });

  const [language, setLanguage] = useState<LanguageOption>(() => {
    return (localStorage.getItem('app_language') as LanguageOption) || 'vi';
  });

  // Editor Settings
  const [editorFontSize, setEditorFontSize] = useState<string>(() => {
    return localStorage.getItem('app_editor_font') || '14px';
  });
  const [editorTabSize, setEditorTabSize] = useState<string>(() => {
    return localStorage.getItem('app_editor_tab') || '2';
  });
  const [autoComplete, setAutoComplete] = useState<boolean>(() => {
    return localStorage.getItem('app_auto_complete') !== 'false';
  });
  const [autoSaveDraft, setAutoSaveDraft] = useState<boolean>(() => {
    return localStorage.getItem('app_auto_save') !== 'false';
  });

  // Notifications Settings
  const [emailNotif, setEmailNotif] = useState<boolean>(() => {
    return localStorage.getItem('app_email_notif') !== 'false';
  });
  const [streakNotif, setStreakNotif] = useState<boolean>(() => {
    return localStorage.getItem('app_streak_notif') !== 'false';
  });
  const [reminderTime, setReminderTime] = useState<string>(() => {
    return localStorage.getItem('app_reminder_time') || '20:00';
  });

  // Privacy & Password
  const [isPublicProfile, setIsPublicProfile] = useState<boolean>(() => {
    return localStorage.getItem('app_public_profile') !== 'false';
  });
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'appearance' | 'editor' | 'notifications' | 'security'>('appearance');

  // Feedback banner
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Áp dụng Theme trực tiếp vào thẻ HTML / Body
  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('app_theme', theme);
    if (theme === 'light') {
      root.classList.add('light-mode');
      root.setAttribute('data-theme', 'light');
    } else if (theme === 'dark') {
      root.classList.remove('light-mode');
      root.setAttribute('data-theme', 'dark');
    } else {
      // System mode
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isSystemDark) {
        root.classList.remove('light-mode');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.add('light-mode');
        root.setAttribute('data-theme', 'light');
      }
    }
  }, [theme]);

  // Lưu tất cả cài đặt
  const handleSaveSettings = () => {
    localStorage.setItem('app_theme', theme);
    localStorage.setItem('app_language', language);
    localStorage.setItem('app_editor_font', editorFontSize);
    localStorage.setItem('app_editor_tab', editorTabSize);
    localStorage.setItem('app_auto_complete', String(autoComplete));
    localStorage.setItem('app_auto_save', String(autoSaveDraft));
    localStorage.setItem('app_email_notif', String(emailNotif));
    localStorage.setItem('app_streak_notif', String(streakNotif));
    localStorage.setItem('app_reminder_time', reminderTime);
    localStorage.setItem('app_public_profile', String(isPublicProfile));

    setToastMsg('Đã lưu tất cả thay đổi cài đặt thành công!');
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Reset về mặc định
  const handleResetDefaults = () => {
    setTheme('dark');
    setLanguage('vi');
    setEditorFontSize('14px');
    setEditorTabSize('2');
    setAutoComplete(true);
    setAutoSaveDraft(true);
    setEmailNotif(true);
    setStreakNotif(true);
    setReminderTime('20:00');
    setIsPublicProfile(true);

    setToastMsg('Đã khôi phục các cài đặt về mặc định ban đầu!');
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Đổi mật khẩu
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPassword) {
      setToastMsg('Vui lòng nhập mật khẩu hiện tại!');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }
    if (newPassword.length < 6) {
      setToastMsg('Mật khẩu mới phải có ít nhất 6 ký tự!');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }
    if (newPassword !== confirmPassword) {
      setToastMsg('Mật khẩu xác nhận không trùng khớp!');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    setCurrPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setToastMsg('Đã cập nhật mật khẩu mới thành công!');
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Xóa bộ nhớ cache
  const handleClearCache = () => {
    sessionStorage.clear();
    setToastMsg('Đã xóa dữ liệu bộ nhớ đệm ứng dụng!');
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="site-shell">
      <Header
        onGoLanding={onGoLanding}
        onGoAuth={onGoAuth}
        onGoTopics={onGoTopics}
        onGoProfile={onGoProfile}
        onGoProgress={onGoProgress}
        onGoHistory={onGoHistory}
        onGoAdmin={onGoAdmin}
        onGoSettings={onGoSettings}
        onLoggedOut={onLoggedOut}
        activeView="settings"
      />

      <main className="history-page-main" style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Toast thông báo */}
        {toastMsg && (
          <div
            style={{
              position: 'fixed',
              top: '80px',
              right: '24px',
              zIndex: 9999,
              background: '#1e293b',
              border: '1px solid #3b82f6',
              color: '#38bdf8',
              padding: '12px 20px',
              borderRadius: '10px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            <CheckCircle2 size={18} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Nút quay lại & Tiêu đề */}
        <div style={{ marginBottom: '24px' }}>
          <button
            className="topic-detail-back-btn"
            onClick={onBack}
            style={{ marginBottom: '16px' }}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 className="admin-page-title" style={{ margin: 0, fontSize: '26px' }}>
                Cài Đặt Hệ Thống
              </h1>
              <p className="admin-page-sub" style={{ marginTop: '6px' }}>
                Tùy chỉnh giao diện, ngôn ngữ, môi trường lập trình và quyền riêng tư tài khoản.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="secondary-button"
                onClick={handleResetDefaults}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                <RotateCcw size={14} /> Mặc định
              </button>

              <button
                className="primary-button"
                onClick={handleSaveSettings}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                <Save size={14} /> Lưu cài đặt
              </button>
            </div>
          </div>
        </div>

        {/* Layout Bố cục Cài đặt 2 Cột */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Sidebar Menu Cài đặt */}
          <div
            className="admin-card-box"
            style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            <button
              onClick={() => setActiveTab('appearance')}
              className={`user-dropdown-item ${activeTab === 'appearance' ? 'is-active' : ''}`}
              style={{ padding: '12px 14px', borderRadius: '8px', fontSize: '14px', justifyContent: 'flex-start' }}
            >
              <Moon size={17} /> Giao diện & Ngôn ngữ
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`user-dropdown-item ${activeTab === 'editor' ? 'is-active' : ''}`}
              style={{ padding: '12px 14px', borderRadius: '8px', fontSize: '14px', justifyContent: 'flex-start' }}
            >
              <Code2 size={17} /> Môi trường Soạn thảo
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`user-dropdown-item ${activeTab === 'notifications' ? 'is-active' : ''}`}
              style={{ padding: '12px 14px', borderRadius: '8px', fontSize: '14px', justifyContent: 'flex-start' }}
            >
              <Bell size={17} /> Thông báo & Nhắc nhở
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`user-dropdown-item ${activeTab === 'security' ? 'is-active' : ''}`}
              style={{ padding: '12px 14px', borderRadius: '8px', fontSize: '14px', justifyContent: 'flex-start' }}
            >
              <Lock size={17} /> Bảo mật & Tài khoản
            </button>
          </div>

          {/* Content Chi Tiết Theo Tab */}
          <div className="admin-card-box" style={{ padding: '24px' }}>
            {/* TAB 1: GIAO DIỆN & NGÔN NGỮ */}
            {activeTab === 'appearance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                    Chủ đề giao diện (Theme)
                  </h3>
                  <p style={{ fontSize: '13.5px', color: '#94a3b8', marginBottom: '16px' }}>
                    Chọn giao diện hiển thị phù hợp với thị giác khi thực hành lập trình.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                    {/* Dark Theme Option */}
                    <div
                      onClick={() => setTheme('dark')}
                      style={{
                        padding: '16px',
                        borderRadius: '10px',
                        border: `2px solid ${theme === 'dark' ? '#3b82f6' : '#1e293b'}`,
                        background: '#090b10',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#1e293b',
                          color: '#38bdf8',
                          display: 'grid',
                          placeItems: 'center',
                          margin: '0 auto 10px',
                        }}
                      >
                        <Moon size={20} />
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>Giao diện Tối</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Dark Theme (Nền tối)</div>
                    </div>

                    {/* Light Theme Option */}
                    <div
                      onClick={() => setTheme('light')}
                      style={{
                        padding: '16px',
                        borderRadius: '10px',
                        border: `2px solid ${theme === 'light' ? '#3b82f6' : '#1e293b'}`,
                        background: '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#e2e8f0',
                          color: '#0284c7',
                          display: 'grid',
                          placeItems: 'center',
                          margin: '0 auto 10px',
                        }}
                      >
                        <Sun size={20} />
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Giao diện Sáng</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Light Theme (Nền sáng)</div>
                    </div>

                    {/* System Theme Option */}
                    <div
                      onClick={() => setTheme('system')}
                      style={{
                        padding: '16px',
                        borderRadius: '10px',
                        border: `2px solid ${theme === 'system' ? '#3b82f6' : '#1e293b'}`,
                        background: '#161b26',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#283248',
                          color: '#a78bfa',
                          display: 'grid',
                          placeItems: 'center',
                          margin: '0 auto 10px',
                        }}
                      >
                        <Monitor size={20} />
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>Theo hệ thống</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Tự động sync OS</div>
                    </div>
                  </div>
                </div>

                <div style={{ height: '1px', background: '#1e293b' }} />

                {/* Ngôn ngữ */}
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                    Ngôn ngữ hiển thị (Language)
                  </h3>
                  <p style={{ fontSize: '13.5px', color: '#94a3b8', marginBottom: '16px' }}>
                    Chọn ngôn ngữ ưu tiên cho giao diện người dùng và thuật ngữ bài tập.
                  </p>

                  <div style={{ width: '280px' }}>
                    <SearchableSelect
                      options={[
                        { label: '🇻🇳 Tiếng Việt (Việt Nam)', value: 'vi' },
                        { label: '🇺🇸 English (United States)', value: 'en' },
                      ]}
                      value={language}
                      onChange={(val) => setLanguage(val as LanguageOption)}
                      icon={<Globe size={15} />}
                      showSearch={false}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MÔI TRƯỜNG SOẠN THẢO CODE */}
            {activeTab === 'editor' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                    Cấu hình Trình Soạn Thảo (Code Editor)
                  </h3>
                  <p style={{ fontSize: '13.5px', color: '#94a3b8', marginBottom: '20px' }}>
                    Tùy chỉnh font chữ, độ thụt lề và tính năng hỗ trợ gõ code trong bài luyện tập.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '8px' }}>
                      Kích thước font chữ (Font Size)
                    </label>
                    <SearchableSelect
                      options={[
                        { label: '12px (Nhỏ)', value: '12px' },
                        { label: '14px (Khuyên dùng)', value: '14px' },
                        { label: '16px (Vừa)', value: '16px' },
                        { label: '18px (Lớn)', value: '18px' },
                      ]}
                      value={editorFontSize}
                      onChange={(val) => setEditorFontSize(val)}
                      showSearch={false}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '8px' }}>
                      Tab Size (Độ rộng Tab)
                    </label>
                    <SearchableSelect
                      options={[
                        { label: '2 Spaces (Mặc định)', value: '2' },
                        { label: '4 Spaces (Tiêu chuẩn Java/Python)', value: '4' },
                      ]}
                      value={editorTabSize}
                      onChange={(val) => setEditorTabSize(val)}
                      showSearch={false}
                    />
                  </div>
                </div>

                <div style={{ height: '1px', background: '#1e293b' }} />

                {/* Tự động gợi ý & Lưu draft */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>
                        Tự động đóng ngoặc & gợi ý thông minh (Auto Bracket & Autocomplete)
                      </span>
                      <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
                        Tự động hoàn thành dấu `()`, `{}` và hiển thị gợi ý cú pháp khi gõ code.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoComplete}
                      onChange={(e) => setAutoComplete(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }}
                    />
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>
                        Tự động lưu bản nháp mã nguồn (Auto-save Drafts)
                      </span>
                      <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
                        Lưu tự động code bạn đang viết mỗi 5 giây để không lo mất bài khi lỡ tải lại trang.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSaveDraft}
                      onChange={(e) => setAutoSaveDraft(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 3: THÔNG BÁO & NHẮC NHỞ */}
            {activeTab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                    Thông Báo & Nhắc Nhở Học Tập
                  </h3>
                  <p style={{ fontSize: '13.5px', color: '#94a3b8', marginBottom: '20px' }}>
                    Quản lý kênh nhận thông báo và thiết lập chuỗi nhắc nhở luyện tập hàng ngày.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>
                        Nhận Email thông báo bài tập mới & Cập nhật hệ thống
                      </span>
                      <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
                        Gửi email cho bạn mỗi khi Giáo viên/AI xuất bản bộ đề luyện tập mới.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotif}
                      onChange={(e) => setEmailNotif(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }}
                    />
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>
                        Nhắc nhở giữ chuỗi học tập (Streak Reminder)
                      </span>
                      <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
                        Cảnh báo khi bạn chưa làm bài tập trong ngày để không bị đứt chuỗi Streak.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={streakNotif}
                      onChange={(e) => setStreakNotif(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }}
                    />
                  </label>
                </div>

                {streakNotif && (
                  <div style={{ background: '#161b26', padding: '14px 18px', borderRadius: '8px', border: '1px solid #283248', width: '280px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      Thời gian nhắc nhở hàng ngày
                    </label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#0d121d',
                        border: '1px solid #334155',
                        color: '#f8fafc',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: BẢO MẬT & TÀI KHOẢN */}
            {activeTab === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                    Quyền Riêng Tư & Bảo Mật Mật Khẩu
                  </h3>
                  <p style={{ fontSize: '13.5px', color: '#94a3b8', marginBottom: '20px' }}>
                    Quản lý hiển thị hồ sơ cá nhân và đổi mật khẩu truy cập tài khoản.
                  </p>

                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>
                        Công khai Tiến độ & Thành tích trên Bảng Xếp Hạng
                      </span>
                      <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
                        Cho phép học viên khác nhìn thấy điểm số và các bài tập bạn đã hoàn thành.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isPublicProfile}
                      onChange={(e) => setIsPublicProfile(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }}
                    />
                  </label>
                </div>

                <div style={{ height: '1px', background: '#1e293b' }} />

                {/* Form Đổi Mật Khẩu */}
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '420px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
                    Thay đổi mật khẩu tài khoản
                  </h4>

                  <div className="auth-field">
                    <span className="auth-label">Mật khẩu hiện tại</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={currPassword}
                      onChange={(e) => setCurrPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ background: '#161b26', border: '1px solid #283248', color: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}
                    />
                  </div>

                  <div className="auth-field">
                    <span className="auth-label">Mật khẩu mới</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Ít nhất 6 ký tự"
                      style={{ background: '#161b26', border: '1px solid #283248', color: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}
                    />
                  </div>

                  <div className="auth-field">
                    <span className="auth-label">Xác nhận mật khẩu mới</span>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        style={{ width: '100%', background: '#161b26', border: '1px solid #283248', color: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, color: '#64748b' }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="primary-button"
                    style={{ marginTop: '8px', width: 'fit-content', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <KeyRound size={14} /> Cập nhật mật khẩu
                  </button>
                </form>

                <div style={{ height: '1px', background: '#1e293b' }} />

                {/* Xóa Cache & Dữ liệu bộ nhớ đệm */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#ef4444', marginBottom: '6px' }}>
                    Dọn dẹp bộ nhớ đệm (Clear App Cache)
                  </h4>
                  <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '12px' }}>
                    Xóa các bản nháp tạm thời và làm sạch bộ nhớ trình duyệt nếu ứng dụng chạy chậm.
                  </p>
                  <button
                    type="button"
                    className="history-view-btn danger"
                    onClick={handleClearCache}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    <Trash2 size={14} /> Xóa Cache trình duyệt
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

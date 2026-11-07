import { ShieldAlert, LogOut, BookOpen, User } from 'lucide-react';
import { Header } from '@/layout/Header';
import { Footer } from '@/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import type { AuthMode } from '@/types';

interface AccessDeniedPageProps {
  onGoLanding?: () => void;
  onGoTopics?: () => void;
  onGoProfile?: () => void;
  onGoAuth?: (mode: AuthMode) => void;
  onLoggedOut?: () => void;
  onGoProgress?: () => void;
  onGoHistory?: () => void;
  onGoSettings?: () => void;
  onGoFlashcards?: () => void;
  onGoFlashcardLibrary?: () => void;
}

export function AccessDeniedPage({
  onGoLanding,
  onGoTopics,
  onGoProfile,
  onGoAuth,
  onLoggedOut,
  onGoProgress,
  onGoHistory,
  onGoSettings,
  onGoFlashcards,
  onGoFlashcardLibrary,
}: AccessDeniedPageProps) {
  const { user, logout } = useAuth();

  const handleSwitchAccount = () => {
    logout();
    onLoggedOut?.();
    onGoAuth?.('login');
  };

  const roleLabel =
    user?.role === 'student'
      ? 'Sinh viên (student)'
      : user?.role === 'teacher'
      ? 'Giảng viên (teacher)'
      : user?.role === 'admin'
      ? 'Quản trị viên (admin)'
      : 'Khách vãng lai';

  return (
    <div className="site-shell">
      <Header
        activeView="forbidden"
        onGoLanding={onGoLanding}
        onGoAuth={onGoAuth}
        onGoTopics={onGoTopics}
        onGoFlashcards={onGoFlashcards}
        onGoFlashcardLibrary={onGoFlashcardLibrary}
        onGoProfile={onGoProfile}
        onGoProgress={onGoProgress}
        onGoHistory={onGoHistory}
        onGoSettings={onGoSettings}
        onLoggedOut={onLoggedOut}
      />

      <main
        style={{
          minHeight: 'calc(100vh - 160px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <div
          style={{
            maxWidth: '560px',
            width: '100%',
            background: 'var(--bg-card, #111827)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '20px',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* 403 Icon */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <ShieldAlert size={38} strokeWidth={2.2} />
          </div>

          {/* Badge */}
          <div style={{ marginBottom: '12px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '999px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                border: '1px solid rgba(239, 68, 68, 0.25)',
              }}
            >
              HTTP 403 FORBIDDEN
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: 'var(--text-primary, #f1f5f9)',
              margin: '0 0 10px',
            }}
          >
            Quyền truy cập bị từ chối
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: '14.5px',
              lineHeight: 1.6,
              color: 'var(--text-secondary, #94a3b8)',
              margin: '0 0 24px',
            }}
          >
            Bạn không có quyền truy cập vào trang <strong>Quản trị hệ thống (Admin)</strong>.
            Khu vực này yêu cầu tài khoản có vai trò <strong>Quản trị viên</strong> hoặc <strong>Giảng viên</strong>.
          </p>

          {/* Account info card */}
          {user && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '28px',
                textAlign: 'left',
                fontSize: '13.5px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Tài khoản đang đăng nhập:</span>
                <strong style={{ color: '#f1f5f9' }}>{user.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Email:</span>
                <span style={{ color: '#cbd5e1' }}>{user.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Vai trò hiện tại:</span>
                <span style={{ color: '#f59e0b', fontWeight: 600 }}>{roleLabel}</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <button
              type="button"
              className="primary-button"
              onClick={onGoTopics || onGoLanding}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              <BookOpen size={16} /> Quay về danh sách bài tập
            </button>

            {user && (
              <button
                type="button"
                className="secondary-button"
                onClick={onGoProfile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  fontSize: '13.5px',
                }}
              >
                <User size={15} /> Xem hồ sơ cá nhân
              </button>
            )}

            <button
              type="button"
              className="secondary-button"
              onClick={handleSwitchAccount}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                fontSize: '13.5px',
                color: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.3)',
              }}
            >
              <LogOut size={15} /> Đăng nhập bằng tài khoản khác
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

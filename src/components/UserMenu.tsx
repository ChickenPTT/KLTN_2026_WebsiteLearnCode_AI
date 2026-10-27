import { useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronDown, LogOut, Settings, ShieldCheck, TrendingUp, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface UserMenuProps {
  onGoProfile: () => void;
  onGoProgress: () => void;
  onGoHistory?: () => void;
  onGoAdmin?: () => void;
  onGoSettings?: () => void;
  onLoggedOut?: () => void;
  activeView?: string;
}

export function UserMenu({
  onGoProfile,
  onGoProgress,
  onGoHistory,
  onGoAdmin,
  onGoSettings,
  onLoggedOut,
  activeView,
}: UserMenuProps) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi click ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  // Lấy initials từ tên
  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  // Tên hiển thị ngắn (firstName)
  const displayName = user.name.split(' ').pop() ?? user.name;
  const isAdminOrTeacher = user.role === 'teacher' || user.role === 'admin';

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setOpen(false);
    onLoggedOut?.();
  };

  return (
    <>
      <div className="user-menu-wrap" ref={menuRef}>
        <button
          className={`user-menu-trigger ${open ? 'is-open' : ''}`}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <span className="user-avatar-sm">{initials}</span>
          <span className="user-display-name">{displayName}</span>
          <ChevronDown size={15} className={`user-chevron ${open ? 'is-open' : ''}`} />
        </button>

        {open && (
          <div className="user-dropdown">
            {/* Header thông tin */}
            <div className="user-dropdown-header">
              <span className="user-dropdown-avatar">{initials}</span>
              <div style={{ minWidth: 0 }}>
                <p className="user-dropdown-name">{user.name}</p>
                <p className="user-dropdown-email">{user.email}</p>
              </div>
            </div>

            <div className="user-dropdown-divider" />

            {isAdminOrTeacher && (
              <>
                <button
                  className={`user-dropdown-item ${activeView === 'admin' ? 'is-active' : ''}`}
                  style={{ color: '#a995ff', fontWeight: 600 }}
                  onClick={() => {
                    setOpen(false);
                    onGoAdmin?.();
                  }}
                >
                  <ShieldCheck size={15} /> Trang Quản trị
                </button>
                <div className="user-dropdown-divider" />
              </>
            )}

            <button
              className={`user-dropdown-item ${activeView === 'profile' ? 'is-active' : ''}`}
              onClick={() => {
                setOpen(false);
                onGoProfile();
              }}
            >
              <User size={15} /> Hồ sơ cá nhân
            </button>

            {!isAdminOrTeacher && (
              <>
                <button
                  className={`user-dropdown-item ${activeView === 'progress' ? 'is-active' : ''}`}
                  onClick={() => {
                    setOpen(false);
                    onGoProgress();
                  }}
                >
                  <TrendingUp size={15} /> Tiến độ học tập
                </button>

                <button
                  className={`user-dropdown-item ${activeView === 'history' ? 'is-active' : ''}`}
                  onClick={() => {
                    setOpen(false);
                    if (onGoHistory) {
                      onGoHistory();
                    } else {
                      onGoProgress();
                    }
                  }}
                >
                  <BookOpen size={15} /> Lịch sử học
                </button>
              </>
            )}

            <button
              className={`user-dropdown-item ${activeView === 'settings' ? 'is-active' : ''}`}
              onClick={() => {
                setOpen(false);
                onGoSettings?.();
              }}
            >
              <Settings size={15} /> Cài đặt hệ thống
            </button>

            <div className="user-dropdown-divider" />

            <button
              className="user-dropdown-item danger"
              onClick={() => {
                setOpen(false);
                setShowLogoutConfirm(true);
              }}
            >
              <LogOut size={15} /> Đăng xuất
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Đăng xuất tài khoản"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}

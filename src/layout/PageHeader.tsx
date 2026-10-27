import type { ReactNode } from 'react';
import { Brand } from '@/components/Brand';
import { UserMenu } from '@/components/UserMenu';
import { useAuth } from '@/hooks/useAuth.tsx';
import type { AuthMode } from '@/types';

/**
 * Header dùng chung cho tất cả trang nội dung (không phải landing).
 * Layout 3 cột: left | brand-center | right(UserMenu hoặc Login)
 *
 * - leftSlot: back button, step indicator, hoặc để trống
 * - rightSlot: extra info (topic tag, meta...), để trống thì chỉ có UserMenu
 */
interface PageHeaderProps {
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  onGoAuth?: (mode: AuthMode) => void;
  onGoProfile?: () => void;
  onGoProgress?: () => void;
  onLoggedOut?: () => void;
}

export function PageHeader({
  leftSlot,
  rightSlot,
  onGoAuth,
  onGoProfile,
  onGoProgress,
  onLoggedOut,
}: PageHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="topbar page-header">
      {/* Trái */}
      <div className="page-header-left">{leftSlot}</div>

      {/* Giữa — Brand luôn căn giữa */}
      <div className="topbar-brand-center">
        <Brand />
      </div>

      {/* Phải — extra slot + UserMenu/Login */}
      <div className="page-header-right">
        {rightSlot && <div className="page-header-right-slot">{rightSlot}</div>}

        {user ? (
          <UserMenu
            onGoProfile={onGoProfile ?? (() => {})}
            onGoProgress={onGoProgress ?? (() => {})}
            onLoggedOut={onLoggedOut}
          />
        ) : onGoAuth ? (
          <button className="login-button" onClick={() => onGoAuth('login')}>
            Login
          </button>
        ) : null}
      </div>
    </header>
  );
}

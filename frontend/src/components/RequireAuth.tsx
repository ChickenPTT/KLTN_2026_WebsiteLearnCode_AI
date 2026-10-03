import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { homePathFor, useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/data/mockAuth';

export function FullPageLoader() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#7d8599',
        fontSize: '0.9rem',
      }}
    >
      Đang tải...
    </div>
  );
}

interface RequireAuthProps {
  /** Bo trong = chi can dang nhap; co gia tri = phai thuoc mot trong cac vai tro nay */
  roles?: UserRole[];
  children?: ReactNode;
}

/**
 * Chan route can dang nhap. Chua dang nhap -> /login (nho trang dang muon vao trong state.from);
 * sai vai tro -> ve trang mac dinh cua vai tro do. Chi la chan UI — backend van tu kiem tra quyen.
 */
export function RequireAuth({ roles, children }: RequireAuthProps) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homePathFor(user)} replace />;
  return <>{children ?? <Outlet />}</>;
}

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { MOCK_USERS, type MockUser, type UserRole } from '@/data/mockAuth';
import {
  ApiError,
  BackendUnavailableError,
  authApi,
  refreshSession,
  setAccessToken,
  setSessionExpiredHandler,
  type AuthResponse,
  type BackendUser,
} from '@/lib/api';

/**
 * VITE_AUTH_MODE:
 *   'api'  — chi dung backend /api/auth/*
 *   'mock' — chi dung tai khoan mock (khong can backend)
 *   'auto' (mac dinh) — dung backend, neu backend chua chay thi tu chuyen sang mock
 */
const AUTH_MODE_ENV = import.meta.env.VITE_AUTH_MODE ?? 'auto';
const MOCK_AUTH_KEY = 'mock_auth_user';
const MOCK_USERS_KEY = 'mock_users';

type Backend = 'api' | 'mock';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isNewUser?: boolean;
}

export interface AuthResult {
  success: boolean;
  isNewUser?: boolean;
  role?: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** true khi dang khoi phuc phien luc mo trang (goi /refresh) — RequireAuth cho, chua redirect */
  initializing: boolean;
  loading: boolean;
  error: string | null;
  /** Dang dung backend that hay mock (de hien canh bao tren UI neu can) */
  backend: Backend;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateUser: (updatedData: Partial<AuthUser>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(u: BackendUser): AuthUser {
  const role = u.role.toLowerCase() as UserRole;
  return {
    id: String(u.id),
    name: u.fullName,
    email: u.email,
    role,
    isNewUser: role === 'student' && !u.onboardingCompleted,
  };
}

function toResult(user: AuthUser): AuthResult {
  return { success: true, isNewUser: user.isNewUser ?? false, role: user.role };
}

// ─── Mock store (chi dung khi backend = 'mock') ─────────────────────────────
function loadMockUsers(): MockUser[] {
  try {
    const saved = localStorage.getItem(MOCK_USERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [...MOCK_USERS];
}

let mockUsers: MockUser[] = loadMockUsers();

function saveMockUsers() {
  try {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(mockUsers));
  } catch {
    // ignore
  }
}

function loadMockSession(): AuthUser | null {
  try {
    const saved = sessionStorage.getItem(MOCK_AUTH_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return null;
}

function saveMockSession(user: AuthUser | null) {
  if (user) sessionStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(user));
  else sessionStorage.removeItem(MOCK_AUTH_KEY);
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backend, setBackend] = useState<Backend>(AUTH_MODE_ENV === 'mock' ? 'mock' : 'api');

  const clearError = useCallback(() => setError(null), []);

  const switchToMock = useCallback(() => {
    if (AUTH_MODE_ENV !== 'auto') return false;
    console.warn('[auth] Backend chưa chạy — chuyển sang tài khoản mock.');
    setBackend('mock');
    return true;
  }, []);

  // Khoi phuc phien khi mo trang: api -> doi refresh cookie lay access token; mock -> doc sessionStorage
  useEffect(() => {
    let cancelled = false;
    setSessionExpiredHandler(() => setUser(null));

    (async () => {
      if (AUTH_MODE_ENV === 'mock') {
        if (!cancelled) setUser(loadMockSession());
      } else {
        try {
          const session = await refreshSession();
          if (!cancelled) setUser(session ? toAuthUser(session.user) : null);
        } catch (e) {
          if (cancelled) return;
          if (e instanceof BackendUnavailableError && switchToMock()) {
            setUser(loadMockSession());
          } else {
            setUser(null);
          }
        }
      }
      if (!cancelled) setInitializing(false);
    })();

    return () => {
      cancelled = true;
      setSessionExpiredHandler(null);
    };
  }, [switchToMock]);

  const updateUser = (updatedData: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };
      if (backend === 'mock') saveMockSession(updated);
      return updated;
    });
  };

  // ─── MOCK ─────────────────────────────────────────────────────────────────
  const mockLogin = async (email: string, password: string): Promise<AuthResult> => {
    await delay(400);
    const found = mockUsers.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password,
    );
    if (!found) {
      setError('Email hoặc mật khẩu không đúng.');
      return { success: false };
    }
    const authUser: AuthUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
      isNewUser: found.isNewUser ?? false,
    };
    setUser(authUser);
    saveMockSession(authUser);
    return toResult(authUser);
  };

  const mockSignup = async (name: string, email: string, password: string): Promise<AuthResult> => {
    await delay(400);
    const normalized = email.trim().toLowerCase();
    if (mockUsers.some((u) => u.email === normalized)) {
      setError('Email đã được đăng ký.');
      return { success: false };
    }
    if (password.length < 8) {
      setError('Mật khẩu phải từ 8 đến 32 ký tự.');
      return { success: false };
    }
    const newUser: MockUser = {
      id: `mock-${Date.now()}`,
      name: name.trim(),
      email: normalized,
      password,
      role: 'student',
      isNewUser: true,
    };
    mockUsers = [...mockUsers, newUser];
    saveMockUsers();
    const authUser: AuthUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: 'student',
      isNewUser: true,
    };
    setUser(authUser);
    saveMockSession(authUser);
    return toResult(authUser);
  };

  // ─── API ──────────────────────────────────────────────────────────────────
  const applySession = (session: AuthResponse): AuthResult => {
    setAccessToken(session.accessToken);
    const authUser = toAuthUser(session.user);
    setUser(authUser);
    return toResult(authUser);
  };

  /** Chay thao tac api; neu backend tat (va dang o che do auto) thi chay ban mock. */
  const run = async (
    apiCall: () => Promise<AuthResponse>,
    mockCall: () => Promise<AuthResult>,
  ): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    try {
      if (backend === 'mock') return await mockCall();
      try {
        return applySession(await apiCall());
      } catch (e) {
        if (e instanceof BackendUnavailableError && switchToMock()) return await mockCall();
        throw e;
      }
    } catch (e) {
      setError(e instanceof ApiError || e instanceof BackendUnavailableError ? e.message : 'Đã có lỗi xảy ra.');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const login = (email: string, password: string) =>
    run(
      () => authApi.login(email, password),
      () => mockLogin(email, password),
    );

  const signup = (name: string, email: string, password: string) =>
    run(
      () => authApi.register(name, email, password),
      () => mockSignup(name, email, password),
    );

  const logout = async () => {
    // Xoa state client truoc (dong bo) de man hinh dieu huong ngay khong bi "nhay" ve trang cua user cu
    setAccessToken(null);
    saveMockSession(null);
    setUser(null);
    if (backend === 'api') {
      try {
        await authApi.logout(); // thu hoi refresh token + xoa cookie
      } catch {
        // backend loi van coi nhu da dang xuat phia client
      }
    }
  };

  const completeOnboarding = async () => {
    if (!user?.isNewUser) return;
    if (backend === 'api') {
      try {
        await authApi.completeOnboarding();
      } catch {
        // khong chan UI; lan dang nhap sau se hien onboarding lai
      }
    } else {
      mockUsers = mockUsers.map((u) => (u.id === user.id ? { ...u, isNewUser: false } : u));
      saveMockUsers();
    }
    updateUser({ isNewUser: false });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        initializing,
        loading,
        error,
        backend,
        clearError,
        updateUser,
        login,
        signup,
        logout,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Hook dùng trong bất kỳ component nào trong cây */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** Trang mac dinh sau khi dang nhap theo vai tro */
export function homePathFor(user: AuthUser): string {
  if (user.role === 'admin' || user.role === 'teacher') return '/admin';
  if (user.isNewUser) return '/onboarding';
  return '/topics';
}

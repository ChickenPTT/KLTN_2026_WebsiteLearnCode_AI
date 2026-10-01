import { createContext, useContext, useState, type ReactNode } from 'react';
import { MOCK_USERS, type MockUser, type UserRole } from '@/data/mockAuth';

const MOCK_MODE = !import.meta.env.VITE_SUPABASE_URL;
const AUTH_KEY = 'auth_user';
const MOCK_USERS_KEY = 'mock_users';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isNewUser?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (
    email: string,
    password: string,
    role?: UserRole,
  ) => Promise<{ success: boolean; isNewUser?: boolean; role?: UserRole }>;
  signup: (
    name: string,
    email: string,
    password: string,
    role?: UserRole,
  ) => Promise<{ success: boolean; isNewUser?: boolean; role?: UserRole }>;
  logout: () => void;
  updateUser: (updatedData: Partial<AuthUser>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getInitialMockUsers(): MockUser[] {
  try {
    const saved = localStorage.getItem(MOCK_USERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [...MOCK_USERS];
}

function getInitialUser(): AuthUser | null {
  try {
    // Clear old persistent localStorage session if any
    localStorage.removeItem(AUTH_KEY);
    const saved = sessionStorage.getItem(AUTH_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return null;
}

let mockSession: MockUser[] = getInitialMockUsers();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getInitialUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const saveUserSession = (authUser: AuthUser | null) => {
    setUser(authUser);
    if (authUser) {
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
      localStorage.removeItem(AUTH_KEY);
    } else {
      sessionStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem('current_view');
      localStorage.removeItem('current_view');
    }
  };

  const updateUser = (updatedData: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // ─── MOCK MODE ────────────────────────────────────────────────────────────
  const mockLogin = async (
    email: string,
    password: string,
    loginRole?: UserRole,
  ): Promise<{ success: boolean; isNewUser?: boolean; role?: UserRole }> => {
    setLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 600));

    // Tìm user khớp email + password
    let found = mockSession.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password,
    );

    // Nếu chọn vai trò Giảng viên/Admin nhưng nhập email bất kỳ hoặc demo
    if (!found && loginRole === 'teacher' && password === 'demo1234') {
      found = mockSession.find((u) => u.role === 'teacher') ?? mockSession[1];
    } else if (!found && loginRole === 'student' && password === 'demo1234') {
      found = mockSession.find((u) => u.role === 'student') ?? mockSession[0];
    }

    if (!found) {
      setError('Email hoặc mật khẩu không đúng.');
      setLoading(false);
      return { success: false };
    }

    const assignedRole = found.role;
    const isNewUser = found.isNewUser ?? false;
    const authUser: AuthUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: assignedRole,
      isNewUser,
    };
    saveUserSession(authUser);
    setLoading(false);
    return { success: true, isNewUser, role: assignedRole };
  };

  const mockSignup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole = 'student',
  ): Promise<{ success: boolean; isNewUser?: boolean; role?: UserRole }> => {
    setLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 600));
    const exists = mockSession.find((u) => u.email === email.trim().toLowerCase());
    if (exists) {
      setError('Email này đã được sử dụng.');
      setLoading(false);
      return { success: false };
    }
    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      setLoading(false);
      return { success: false };
    }
    const isNewStudent = role === 'student';
    const newUser: MockUser = {
      id: `mock-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      isNewUser: isNewStudent,
    };
    mockSession = [...mockSession, newUser];
    try {
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(mockSession));
    } catch {
      // ignore
    }

    const authUser: AuthUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isNewUser: isNewStudent,
    };
    saveUserSession(authUser);
    setLoading(false);
    return { success: true, isNewUser: isNewStudent, role };
  };

  const mockLogout = () => saveUserSession(null);

  // ─── SUPABASE MODE (TODO) ─────────────────────────────────────────────────
  const supabaseLogin = async (
    email: string,
    password: string,
    loginRole?: UserRole,
  ): Promise<{ success: boolean; isNewUser?: boolean; role?: UserRole }> => {
    void email;
    void password;
    void loginRole;
    setError('Supabase chưa được cấu hình.');
    return { success: false };
  };
  const supabaseSignup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole = 'student',
  ): Promise<{ success: boolean; isNewUser?: boolean; role?: UserRole }> => {
    void name;
    void email;
    void password;
    void role;
    setError('Supabase chưa được cấu hình.');
    return { success: false };
  };
  const supabaseLogout = () => saveUserSession(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        clearError,
        updateUser,
        login: MOCK_MODE ? mockLogin : supabaseLogin,
        signup: MOCK_MODE ? mockSignup : supabaseSignup,
        logout: MOCK_MODE ? mockLogout : supabaseLogout,
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

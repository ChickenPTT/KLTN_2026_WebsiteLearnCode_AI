export type UserRole = 'student' | 'teacher' | 'admin';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isNewUser?: boolean;
}

/**
 * Tài khoản mock để test đăng nhập/đăng ký khi chưa kết nối Supabase thật.
 *
 * Tài khoản test:
 *   student@demo.com  / demo1234  (Sinh viên - đã đánh giá)
 *   teacher@demo.com  / demo1234  (Giảng viên)
 *   admin@demo.com    / demo1234  (Quản trị viên)
 */
export const MOCK_USERS: MockUser[] = [
  {
    id: 'mock-001',
    name: 'Sinh viên Demo',
    email: 'student@demo.com',
    password: 'demo1234',
    role: 'student',
    isNewUser: false,
  },
  {
    id: 'mock-002',
    name: 'Giảng viên Demo',
    email: 'teacher@demo.com',
    password: 'demo1234',
    role: 'teacher',
    isNewUser: false,
  },
  {
    id: 'mock-003',
    name: 'Admin Demo',
    email: 'admin@demo.com',
    password: 'demo1234',
    role: 'admin',
    isNewUser: false,
  },
];

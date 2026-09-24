import { createClient } from '@supabase/supabase-js';

// Thêm các biến này vào file .env.local:
// VITE_SUPABASE_URL=https://xxxx.supabase.co
// VITE_SUPABASE_ANON_KEY=your-anon-key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Khi chưa có env thật, client sẽ được tạo với giá trị rỗng.
// Mock mode trong useAuth sẽ xử lý trường hợp này mà không cần gọi Supabase thật.
export const supabase = createClient(
  supabaseUrl ?? 'http://localhost:54321',
  supabaseAnonKey ?? 'mock-anon-key',
);

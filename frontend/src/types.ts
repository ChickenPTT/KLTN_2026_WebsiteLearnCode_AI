export type View =
  | 'landing'
  | 'auth'
  | 'onboarding'
  | 'self-rate'
  | 'quiz'
  | 'result'
  | 'practice'
  | 'topics'
  | 'topic-detail'
  | 'profile'
  | 'progress'
  | 'history'
  | 'settings'
  | 'admin'
  | 'scoring-guide'
  | 'flashcards'
  | 'flashcard-detail'
  | 'flashcard-library'
  | 'create-flashcard'
  | 'flashcard-match';
export type AuthMode = 'login' | 'signup';

/**
 * 5 muc do kho bai tap, anh xa sang 5 band nang luc.
 * DB luu chuoi: Easy | MediumEasy | Medium | MediumHard | Hard
 * Legacy map: Easy->Level1, Medium->Level3, Hard->Level5
 */
export type DifficultyLevel = 'Level1' | 'Level2' | 'Level3' | 'Level4' | 'Level5';

export const DIFFICULTY_CEILING: Record<DifficultyLevel, number> = {
  Level1: 19,
  Level2: 39,
  Level3: 59,
  Level4: 79,
  Level5: 100,
};

export const DIFFICULTY_BAND_LABEL: Record<DifficultyLevel, string> = {
  Level1: 'Mới bắt đầu',
  Level2: 'Cơ bản',
  Level3: 'Trung bình',
  Level4: 'Khá',
  Level5: 'Nâng cao',
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  Level1: 'Dễ (Mức 1)',
  Level2: 'Dễ-trung bình (Mức 2)',
  Level3: 'Trung bình (Mức 3)',
  Level4: 'Khó-trung bình (Mức 4)',
  Level5: 'Khó (Mức 5)',
};

export const DIFFICULTY_COLORS_UI: Record<DifficultyLevel, { bg: string; color: string; border: string }> = {
  Level1: { bg: 'rgba(100,116,139,0.12)', color: '#64748b', border: 'rgba(100,116,139,0.3)' },
  Level2: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
  Level3: { bg: 'rgba(94,143,250,0.12)', color: '#5e8dfa', border: 'rgba(94,143,250,0.3)' },
  Level4: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  Level5: { bg: 'rgba(169,149,255,0.12)', color: '#a995ff', border: 'rgba(169,149,255,0.3)' },
};

export type SkillLevel = 'beginner' | 'basic' | 'intermediate' | 'advanced' | 'expert';

export interface TopicScore {
  topic: string;
  level: SkillLevel;
}

export interface FlashcardItem {
  id: string;
  term: string;
  definition: string;
  example?: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  wordCount: number;
  viewCount: number;
  authorName: string;
  authorAvatar?: string;
  cards: FlashcardItem[];
}

export interface QuizQuestion {
  id: number;
  topic: string;
  question: string;
  code?: string;
  choices: string[];
  correctIndex: number;
}

export interface PracticeProblem {
  id: string;
  title: string;
  topic: string;
  difficulty: DifficultyLevel;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: string;
  starterCodes?: {
    java: string;
    python: string;
  };
  language: string;
  constraints: string[];
  isPublic?: boolean; // Trạng thái công khai cho sinh viên (default true)
  isAiGenerated?: boolean; // Đánh dấu bài do AI sinh ra hay nhập tay
  isVerified?: boolean; // Tình trạng đã chạy test kiểm tra kết quả AI generate hay chưa
  updatedAt?: string;
}

export const TOPICS = [
  'Array',
  'String',
  'Hash Table',
  'Two Pointers',
  'Linked List',
  'Stack',
  'Queue',
  'Recursion',
  'Sorting',
  'Binary Search',
  'Tree',
  'Graph',
] as const;

export const LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: 'Mới bắt đầu',
  basic: 'Cơ bản',
  intermediate: 'Trung bình',
  advanced: 'Khá',
  expert: 'Nâng cao',
};

export const LEVEL_COLORS: Record<SkillLevel, string> = {
  beginner: '#7d8599',
  basic: '#78d39e',
  intermediate: '#5e8dfa',
  advanced: '#f5c95d',
  expert: '#a995ff',
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    topic: 'Array',
    question: 'Độ phức tạp thời gian khi truy cập phần tử theo index trong mảng là gì?',
    choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctIndex: 0,
  },
  {
    id: 2,
    topic: 'Hash Table',
    question: 'Trong trường hợp xấu nhất, độ phức tạp thời gian tìm kiếm trong Hash Table là bao nhiêu?',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctIndex: 2,
  },
  {
    id: 3,
    topic: 'Two Pointers',
    question: 'Cho mảng đã sắp xếp, kỹ thuật hai con trỏ tìm cặp có tổng bằng k có độ phức tạp nào?',
    choices: ['O(n²)', 'O(n)', 'O(n log n)', 'O(1)'],
    correctIndex: 1,
  },
  {
    id: 4,
    topic: 'Linked List',
    question: 'Độ phức tạp thời gian khi xóa phần tử đầu tiên của danh sách liên kết đơn là gì?',
    choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctIndex: 0,
  },
  {
    id: 5,
    topic: 'Stack',
    question: 'Cấu trúc dữ liệu nào hoạt động theo nguyên lý LIFO?',
    choices: ['Queue', 'Stack', 'Linked List', 'Tree'],
    correctIndex: 1,
  },
  {
    id: 6,
    topic: 'Binary Search',
    question: 'Tìm kiếm nhị phân yêu cầu mảng phải có đặc điểm gì?',
    choices: [
      'Mảng chưa sắp xếp',
      'Mảng đã sắp xếp',
      'Mảng có số phần tử lẻ',
      'Mảng chỉ chứa số nguyên',
    ],
    correctIndex: 1,
  },
  {
    id: 7,
    topic: 'Recursion',
    question: 'Mọi hàm đệ quy đều phải có điều kiện gì để dừng?',
    choices: ['Vòng lặp for', 'Điều kiện dừng (base case)', 'Biến toàn cục', 'Tham chiếu'],
    correctIndex: 1,
  },
  {
    id: 8,
    topic: 'Tree',
    question: 'Chiều cao của cây nhị phân cân bằng có n nút là bao nhiêu?',
    choices: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctIndex: 2,
  },
  {
    id: 9,
    topic: 'Graph',
    question: 'Thuật toán BFS duyệt đồ thị theo cách nào?',
    choices: [
      'Theo chiều sâu',
      'Theo chiều rộng',
      'Theo thứ tự ngẫu nhiên',
      'Theo thứ tự giảm dần',
    ],
    correctIndex: 1,
  },
  {
    id: 10,
    topic: 'Sorting',
    question: 'Độ phức tạp thời gian trung bình của QuickSort là gì?',
    choices: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    correctIndex: 1,
  },
];

export interface TopicInfo {
  name: string;
  slug: string;
  title: string;
  icon: string;
  description: string;
  problemCount: number;
  difficulties: { easy: number; medium: number; hard: number };
}

export const TOPIC_INFOS: TopicInfo[] = [
  { name: 'Array', slug: 'array', title: 'Array', icon: 'ListOrdered', description: 'Truy cập ngẫu nhiên, duyệt mảng, mảng hai chiều.', problemCount: 2, difficulties: { easy: 1, medium: 1, hard: 0 } },
  { name: 'String', slug: 'string', title: 'String', icon: 'Type', description: 'Thao tác chuỗi, so khớp mẫu, xử lý ký tự.', problemCount: 2, difficulties: { easy: 1, medium: 1, hard: 0 } },
  { name: 'Hash Table', slug: 'hash-table', title: 'Hash Table', icon: 'KeyRound', description: 'Bản đồ băm, tra cứu O(1), đếm tần suất.', problemCount: 2, difficulties: { easy: 1, medium: 1, hard: 0 } },
  { name: 'Two Pointers', slug: 'two-pointers', title: 'Two Pointers', icon: 'MoveHorizontal', description: 'Hai con trỏ di chuyển ngược chiều hoặc cùng chiều.', problemCount: 2, difficulties: { easy: 0, medium: 2, hard: 0 } },
  { name: 'Linked List', slug: 'linked-list', title: 'Linked List', icon: 'Link2', description: 'Danh sách liên kết đơn, đôi, xoay, hợp nhất.', problemCount: 2, difficulties: { easy: 1, medium: 1, hard: 0 } },
  { name: 'Stack', slug: 'stack', title: 'Stack', icon: 'Layers', description: 'Ngăn xếp LIFO, xử lý dấu ngoặc, biểu thức.', problemCount: 2, difficulties: { easy: 1, medium: 1, hard: 0 } },
  { name: 'Queue', slug: 'queue', title: 'Queue', icon: 'AlignJustify', description: 'Hàng đợi FIFO, deque, BFS.', problemCount: 2, difficulties: { easy: 1, medium: 0, hard: 1 } },
  { name: 'Recursion', slug: 'recursion', title: 'Recursion', icon: 'Repeat', description: 'Đệ quy, quay lui, nhánh cận.', problemCount: 2, difficulties: { easy: 1, medium: 1, hard: 0 } },
  { name: 'Sorting', slug: 'sorting', title: 'Sorting', icon: 'ArrowDownWideNarrow', description: 'Sắp xếp nổi bọt, chọn, trộn, nhanh, heap.', problemCount: 2, difficulties: { easy: 0, medium: 2, hard: 0 } },
  { name: 'Binary Search', slug: 'binary-search', title: 'Binary Search', icon: 'Search', description: 'Tìm kiếm nhị phân, chia để trị trên mảng/dãy.', problemCount: 2, difficulties: { easy: 1, medium: 1, hard: 0 } },
  { name: 'Tree', slug: 'tree', title: 'Tree', icon: 'TreePine', description: 'Cây nhị phân, BST, duyệt cây, cân bằng.', problemCount: 2, difficulties: { easy: 2, medium: 0, hard: 0 } },
  { name: 'Graph', slug: 'graph', title: 'Graph', icon: 'Share2', description: 'BFS, DFS, liên thông, chu trình, đường đi ngắn nhất.', problemCount: 2, difficulties: { easy: 0, medium: 1, hard: 1 } },
];



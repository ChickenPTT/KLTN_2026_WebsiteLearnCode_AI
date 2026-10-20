import type { FlashcardItem } from '@/types';

export type CardIcon = 'Binary' | 'Database' | 'Cpu' | 'Code2' | 'BrainCircuit' | 'Globe';

export interface FlashcardMockSet {
  id: string;
  title: string;
  subtitle: string;
  wordCount: number;
  viewCount: number;
  authorName: string;
  iconName: CardIcon;
  iconBg: string;
  iconColor: string;
  cards: FlashcardItem[];
  isPublic?: boolean;
  authorRole?: 'admin' | 'teacher' | 'student';
}

export const DEFAULT_ALGORITHM_CARDS: FlashcardItem[] = [
  // Trang 1 (6 từ)
  { id: 'c1', term: 'Algorithm', definition: 'Thuật toán', example: 'A sorting algorithm arranges data.' },
  { id: 'c2', term: 'Complexity', definition: 'Độ phức tạp', example: 'Time complexity of merge sort is O(n log n).' },
  { id: 'c3', term: 'Recursion', definition: 'Đệ quy', example: 'Fibonacci uses recursion.' },
  { id: 'c4', term: 'Binary Search', definition: 'Tìm kiếm nhị phân', example: 'Binary search runs in O(log n) time.' },
  { id: 'c5', term: 'Sorting', definition: 'Sắp xếp dữ liệu', example: 'Quick sort partitions elements around a pivot.' },
  { id: 'c6', term: 'Dynamic Programming', definition: 'Quy hoạch động', example: 'DP solves subproblems and stores results.' },
  // Trang 2 (6 từ)
  { id: 'c7', term: 'Graph Traversal', definition: 'Duyệt đồ thị', example: 'BFS uses a queue while DFS uses a stack.' },
  { id: 'c8', term: 'Hash Table', definition: 'Bảng băm', example: 'A hash table provides average O(1) lookups.' },
  { id: 'c9', term: 'Stack', definition: 'Ngăn xếp (LIFO)', example: 'Stack follows Last-In-First-Out order.' },
  { id: 'c10', term: 'Queue', definition: 'Hàng đợi (FIFO)', example: 'Queue follows First-In-First-Out order.' },
  { id: 'c11', term: 'Greedy Method', definition: 'Thuật toán tham lam', example: 'Dijkstra is a greedy shortest path algorithm.' },
  { id: 'c12', term: 'Backtracking', definition: 'Thuật toán quay lui', example: 'N-Queens problem is solved with backtracking.' },
];

export const MOCK_FLASHCARD_SETS: FlashcardMockSet[] = [
  {
    id: 'fc-1',
    title: 'Thuật toán - 1',
    subtitle: 'Tiếng Anh chuyên ngành',
    wordCount: 12,
    viewCount: 5,
    authorName: 'Hệ thống Mnemonic',
    authorRole: 'admin',
    iconName: 'Binary',
    iconBg: '#EEF2FF',
    iconColor: '#4F46E5',
    isPublic: true,
    cards: DEFAULT_ALGORITHM_CARDS,
  },
  {
    id: 'fc-2',
    title: 'Hệ thống dữ liệu - 1',
    subtitle: 'Tiếng Anh chuyên ngành',
    wordCount: 2,
    viewCount: 7,
    authorName: 'Giảng viên Demo',
    authorRole: 'teacher',
    iconName: 'Database',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    isPublic: true,
    cards: [
      { id: 'c1', term: 'Database', definition: 'Cơ sở dữ liệu', example: 'MySQL is a relational database.' },
      { id: 'c2', term: 'Query', definition: 'Truy vấn', example: 'This SQL query returns all users.' },
    ]
  },
  {
    id: 'fc-3',
    title: 'Thuật toán - 2',
    subtitle: 'Tiếng Anh chuyên ngành',
    wordCount: 3,
    viewCount: 30,
    authorName: 'Hệ thống Mnemonic',
    authorRole: 'admin',
    iconName: 'Binary',
    iconBg: '#EEF2FF',
    iconColor: '#4F46E5',
    isPublic: true,
    cards: []
  },
  {
    id: 'fc-4',
    title: 'Hệ thống dữ liệu - 2',
    subtitle: 'Tiếng Anh chuyên ngành',
    wordCount: 3,
    viewCount: 13,
    authorName: 'Giảng viên Demo',
    authorRole: 'teacher',
    iconName: 'Database',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    isPublic: true,
    cards: []
  },
  {
    id: 'fc-5',
    title: 'Kiến trúc máy tính',
    subtitle: 'Tiếng Anh chuyên ngành',
    wordCount: 3,
    viewCount: 5,
    authorName: 'Hệ thống Mnemonic',
    authorRole: 'admin',
    iconName: 'Cpu',
    iconBg: '#FFF7ED',
    iconColor: '#EA580C',
    isPublic: true,
    cards: []
  },
  {
    id: 'fc-6',
    title: 'Lập trình hướng đối tượng',
    subtitle: 'Tiếng Anh chuyên ngành',
    wordCount: 3,
    viewCount: 13,
    authorName: 'Giảng viên Demo',
    authorRole: 'teacher',
    iconName: 'Code2',
    iconBg: '#F0F9FF',
    iconColor: '#0284C7',
    isPublic: true,
    cards: []
  },
  {
    id: 'fc-7',
    title: 'Trí tuệ nhân tạo',
    subtitle: 'Tiếng Anh chuyên ngành',
    wordCount: 3,
    viewCount: 1,
    authorName: 'Hệ thống Mnemonic',
    authorRole: 'admin',
    iconName: 'BrainCircuit',
    iconBg: '#FDF4FF',
    iconColor: '#9333EA',
    isPublic: true,
    cards: []
  },
  {
    id: 'fc-8',
    title: 'Mạng máy tính',
    subtitle: 'Tiếng Anh chuyên ngành',
    wordCount: 2,
    viewCount: 7,
    authorName: 'Giảng viên Demo',
    authorRole: 'teacher',
    iconName: 'Globe',
    iconBg: '#F0FDF4',
    iconColor: '#16A34A',
    isPublic: true,
    cards: []
  }
];

export const MOCK_USER_FLASHCARD_SETS: FlashcardMockSet[] = [
  {
    id: 'my-fc-1',
    title: 'Từ vựng C++ & Lập trình mạng',
    subtitle: 'Bộ thẻ tôi đã tạo',
    wordCount: 3,
    viewCount: 2,
    authorName: 'Sinh viên Demo',
    authorRole: 'student',
    iconName: 'Code2',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    isPublic: false,
    cards: [
      { id: 'mc-1', term: 'Socket', definition: 'Điểm đầu mút trong giao tiếp mạng giữa 2 chương trình.', example: 'Socket socket = new Socket("localhost", 8080);' },
      { id: 'mc-2', term: 'Handshake', definition: 'Quá trình bắt tay 3 bước TCP để thiết lập kết nối.', example: 'TCP 3-way handshake SYN, SYN-ACK, ACK.' },
      { id: 'mc-3', term: 'Deadlock', definition: 'Tình trạng bế tắc khi 2 tiến trình chờ tài nguyên của nhau.', example: 'Prevent deadlock using lock ordering.' },
    ]
  },
  {
    id: 'my-fc-2',
    title: 'Cấu trúc dữ liệu nâng cao',
    subtitle: 'Bộ thẻ tôi đã tạo',
    wordCount: 2,
    viewCount: 1,
    authorName: 'Sinh viên Demo',
    authorRole: 'student',
    iconName: 'Binary',
    iconBg: '#F5F3FF',
    iconColor: '#7C3AED',
    isPublic: false,
    cards: [
      { id: 'mc-4', term: 'Red-Black Tree', definition: 'Cây nhị phân tìm kiếm tự cân bằng theo màu sắc nút.', example: 'Used internally by std::map in C++.' },
      { id: 'mc-5', term: 'Trie', definition: 'Cây tiền tố dùng để tìm kiếm chuỗi nhanh.', example: 'Trie is useful for autocomplete dictionary.' },
    ]
  },
  {
    id: 'my-fc-3',
    title: 'Database Indexing & Tối ưu SQL',
    subtitle: 'Bộ thẻ tôi đã tạo',
    wordCount: 2,
    viewCount: 5,
    authorName: 'Sinh viên Demo',
    authorRole: 'student',
    iconName: 'Database',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    isPublic: true,
    cards: [
      { id: 'mc-6', term: 'B-Tree Index', definition: 'Cấu trúc chỉ mục phổ biến nhất trong RDBMS.', example: 'CREATE INDEX idx_user_email ON users(email);' },
      { id: 'mc-7', term: 'Query Plan', definition: 'Kế hoạch thực thi truy vấn do SQL optimizer sinh ra.', example: 'Run EXPLAIN ANALYZE to see query plan.' },
    ]
  }
];

export const ALL_FLASHCARD_SETS: FlashcardMockSet[] = [
  ...MOCK_FLASHCARD_SETS,
  ...MOCK_USER_FLASHCARD_SETS,
];

export function addUserFlashcardSet(newSet: FlashcardMockSet) {
  MOCK_USER_FLASHCARD_SETS.unshift(newSet);
  ALL_FLASHCARD_SETS.unshift(newSet);
}

export function updateUserFlashcardSet(updatedSet: FlashcardMockSet) {
  const idxUser = MOCK_USER_FLASHCARD_SETS.findIndex((s) => s.id === updatedSet.id);
  if (idxUser !== -1) {
    MOCK_USER_FLASHCARD_SETS[idxUser] = updatedSet;
  }
  const idxAll = ALL_FLASHCARD_SETS.findIndex((s) => s.id === updatedSet.id);
  if (idxAll !== -1) {
    ALL_FLASHCARD_SETS[idxAll] = updatedSet;
  }
}

export function addSystemFlashcardSet(newSet: FlashcardMockSet) {
  MOCK_FLASHCARD_SETS.unshift(newSet);
  ALL_FLASHCARD_SETS.unshift(newSet);
}

export function deleteFlashcardSet(id: string) {
  const idxAll = ALL_FLASHCARD_SETS.findIndex((s) => s.id === id);
  if (idxAll !== -1) ALL_FLASHCARD_SETS.splice(idxAll, 1);

  const idxSys = MOCK_FLASHCARD_SETS.findIndex((s) => s.id === id);
  if (idxSys !== -1) MOCK_FLASHCARD_SETS.splice(idxSys, 1);

  const idxUser = MOCK_USER_FLASHCARD_SETS.findIndex((s) => s.id === id);
  if (idxUser !== -1) MOCK_USER_FLASHCARD_SETS.splice(idxUser, 1);
}

export function updateFlashcardSet(updatedSet: FlashcardMockSet) {
  updateUserFlashcardSet(updatedSet);
  const idxSys = MOCK_FLASHCARD_SETS.findIndex((s) => s.id === updatedSet.id);
  if (idxSys !== -1) {
    MOCK_FLASHCARD_SETS[idxSys] = updatedSet;
  }
}

export interface CompletedFlashcardSet extends FlashcardMockSet {
  completedAt: string;
  masteryPercent: number;
  knownCards: number;
}

export const MOCK_COMPLETED_FLASHCARD_SETS: CompletedFlashcardSet[] = [
  {
    ...MOCK_FLASHCARD_SETS[0],
    completedAt: 'Hôm nay, 09:30',
    masteryPercent: 100,
    knownCards: MOCK_FLASHCARD_SETS[0].cards.length || 3,
  },
  {
    ...MOCK_USER_FLASHCARD_SETS[0],
    completedAt: 'Hôm qua, 15:45',
    masteryPercent: 100,
    knownCards: MOCK_USER_FLASHCARD_SETS[0].cards.length || 3,
  },
  {
    ...MOCK_FLASHCARD_SETS[1],
    completedAt: '3 ngày trước',
    masteryPercent: 100,
    knownCards: MOCK_FLASHCARD_SETS[1].cards.length || 2,
  },
];

export function markSetCompleted(setId: string, knownCount: number, totalCount: number) {
  const existingSet = ALL_FLASHCARD_SETS.find((s) => s.id === setId);
  if (!existingSet) return;
  const existingIndex = MOCK_COMPLETED_FLASHCARD_SETS.findIndex((s) => s.id === setId);
  const percent = totalCount > 0 ? Math.round((knownCount / totalCount) * 100) : 100;
  const completedItem: CompletedFlashcardSet = {
    ...existingSet,
    completedAt: 'Vừa xong',
    masteryPercent: percent,
    knownCards: knownCount,
  };
  if (existingIndex !== -1) {
    MOCK_COMPLETED_FLASHCARD_SETS[existingIndex] = completedItem;
  } else {
    MOCK_COMPLETED_FLASHCARD_SETS.unshift(completedItem);
  }
}

/**
 * Trả về danh sách 12 từ vựng chuẩn cho trò chơi ghép thẻ (2 trang x 6 từ/trang)
 */
export function getFlashcardMatchCards(set?: FlashcardMockSet): FlashcardItem[] {
  const cards = (set?.cards && set.cards.length > 0) ? [...set.cards] : [];
  if (cards.length >= 12) {
    return cards.slice(0, 12);
  }
  // Bổ sung các từ từ DEFAULT_ALGORITHM_CARDS để đảm bảo đủ 12 từ (2 trang x 6 từ)
  const existingIds = new Set(cards.map((c) => c.id));
  const existingTerms = new Set(cards.map((c) => c.term.toLowerCase()));
  for (const item of DEFAULT_ALGORITHM_CARDS) {
    if (cards.length >= 12) break;
    if (!existingIds.has(item.id) && !existingTerms.has(item.term.toLowerCase())) {
      cards.push(item);
    }
  }
  // Nếu vẫn chưa đủ 12 thì lặp lại với id mới
  let fillIdx = 1;
  while (cards.length < 12) {
    const fallback = DEFAULT_ALGORITHM_CARDS[(fillIdx - 1) % DEFAULT_ALGORITHM_CARDS.length];
    cards.push({
      ...fallback,
      id: `${fallback.id}-copy-${fillIdx}`,
    });
    fillIdx++;
  }
  return cards.slice(0, 12);
}


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
  | 'admin';
export type AuthMode = 'login' | 'signup';

export type SkillLevel = 'beginner' | 'basic' | 'intermediate' | 'advanced' | 'expert';

export interface TopicScore {
  topic: string;
  level: SkillLevel;
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
  difficulty: 'Easy' | 'Medium' | 'Hard';
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
  icon: string;
  description: string;
  problemCount: number;
  difficulties: { easy: number; medium: number; hard: number };
}

export const TOPIC_INFOS: TopicInfo[] = [
  { name: 'Array', icon: 'ListOrdered', description: 'Truy cập ngẫu nhiên, duyệt mảng, mảng hai chiều.', problemCount: 2, difficulties: { easy: 1, medium: 1, hard: 0 } },
  { name: 'String', icon: 'Type', description: 'Thao tác chuỗi, so khớp mẫu, xử lý ký tự.', problemCount: 2, difficulties: { easy: 1, medium: 1, hard: 0 } },
  { name: 'Hash Table', icon: 'KeyRound', description: 'Bản đồ băm, tra cứu O(1), đếm tần suất.', problemCount: 2, difficulties: { easy: 1, medium: 1, hard: 0 } },
  { name: 'Two Pointers', icon: 'MoveHorizontal', description: 'Hai con trỏ di chuyển ngược chiều hoặc cùng chiều.', problemCount: 2, difficulties: { easy: 0, medium: 2, hard: 0 } },
  { name: 'Linked List', icon: 'Link2', description: 'Danh sách liên kết đơn, đôi, xoay, hợp nhất.', problemCount: 2, difficulties: { easy: 1, medium: 1, hard: 0 } },
  { name: 'Stack', icon: 'Layers', description: 'Ngăn xếp LIFO, xử lý dấu ngoặc, biểu thức.', problemCount: 2, difficulties: { easy: 1, medium: 1, hard: 0 } },
  { name: 'Queue', icon: 'AlignJustify', description: 'Hàng đợi FIFO, deque, BFS.', problemCount: 2, difficulties: { easy: 1, medium: 0, hard: 1 } },
  { name: 'Recursion', icon: 'Repeat', description: 'Đệ quy, quay lui, nhánh cận.', problemCount: 2, difficulties: { easy: 1, medium: 1, hard: 0 } },
  { name: 'Sorting', icon: 'ArrowDownWideNarrow', description: 'Sắp xếp nổi bọt, chọn, trộn, nhanh, heap.', problemCount: 2, difficulties: { easy: 0, medium: 2, hard: 0 } },
  { name: 'Binary Search', icon: 'Search', description: 'Tìm kiếm nhị phân, chia để trị trên mảng/dãy.', problemCount: 2, difficulties: { easy: 1, medium: 1, hard: 0 } },
  { name: 'Tree', icon: 'TreePine', description: 'Cây nhị phân, BST, duyệt cây, cân bằng.', problemCount: 2, difficulties: { easy: 2, medium: 0, hard: 0 } },
  { name: 'Graph', icon: 'Share2', description: 'BFS, DFS, liên thông, chu trình, đường đi ngắn nhất.', problemCount: 2, difficulties: { easy: 0, medium: 1, hard: 1 } },
];

export const PRACTICE_PROBLEMS: PracticeProblem[] = [
  // ── 1. ARRAY ──
  {
    id: 'two-sum',
    title: 'Two Sum',
    topic: 'Array',
    difficulty: 'Easy',
    description: 'Cho một mảng số nguyên nums và một số nguyên target, trả về chỉ số của hai phần tử có tổng bằng target.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    starterCode: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Viết code Java tại đây\n        return new int[]{};\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Viết code Java tại đây\n        return new int[]{};\n    }\n}`,
      python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Chỉ có một đáp án duy nhất'],
  },
  {
    id: 'best-time-to-buy-stock',
    title: 'Best Time to Buy and Sell Stock',
    topic: 'Array',
    difficulty: 'Medium',
    description: 'Cho mảng prices trong đó prices[i] là giá cổ phiếu vào ngày thứ i. Chọn 1 ngày mua và 1 ngày bán để tối đa hóa lợi nhuận.',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Mua ở ngày 2 (giá = 1) và bán ở ngày 5 (giá = 6), lợi nhuận = 6-1 = 5.' },
      { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'Không có giao dịch nào sinh lời.' },
    ],
    starterCode: `class Solution {\n    public int maxProfit(int[] prices) {\n        // Viết code Java tại đây\n        return 0;\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public int maxProfit(int[] prices) {\n        // Viết code Java tại đây\n        return 0;\n    }\n}`,
      python: `class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['1 ≤ prices.length ≤ 10⁵', '0 ≤ prices[i] ≤ 10⁴'],
    isAiGenerated: true,
  },

  // ── 2. STRING ──
  {
    id: 'valid-anagram',
    title: 'Valid Anagram',
    topic: 'String',
    difficulty: 'Easy',
    description: 'Cho hai chuỗi s và t, trả về true nếu t là đảo từ (anagram) của s, ngược lại trả về false.',
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' },
    ],
    starterCode: `class Solution {\n    public boolean isAnagram(String s, String t) {\n        // Viết code Java tại đây\n        return false;\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public boolean isAnagram(String s, String t) {\n        // Viết code Java tại đây\n        return false;\n    }\n}`,
      python: `class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['1 ≤ s.length, t.length ≤ 5 * 10⁴'],
  },
  {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    topic: 'String',
    difficulty: 'Medium',
    description: 'Cho một chuỗi s, tìm độ dài của chuỗi con dài nhất mà không chứa bất kỳ ký tự nào lặp lại.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'Chuỗi con dài nhất là "abc" độ dài 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'Chuỗi con dài nhất là "b" độ dài 1.' },
    ],
    starterCode: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Viết code Java tại đây\n        return 0;\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Viết code Java tại đây\n        return 0;\n    }\n}`,
      python: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['0 ≤ s.length ≤ 5 * 10⁴'],
  },

  // ── 3. HASH TABLE ──
  {
    id: 'contains-duplicate',
    title: 'Contains Duplicate',
    topic: 'Hash Table',
    difficulty: 'Easy',
    description: 'Cho một mảng số nguyên nums, trả về true nếu có bất kỳ giá trị nào xuất hiện ít nhất 2 lần trong mảng.',
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true' },
      { input: 'nums = [1,2,3,4]', output: 'false' },
    ],
    starterCode: `class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        // Viết code Java tại đây\n        return false;\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        // Viết code Java tại đây\n        return false;\n    }\n}`,
      python: `class Solution:\n    def containsDuplicate(self, nums: list[int]) -> bool:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['1 ≤ nums.length ≤ 10⁵'],
  },
  {
    id: 'group-anagrams',
    title: 'Group Anagrams',
    topic: 'Hash Table',
    difficulty: 'Medium',
    description: 'Cho mảng chuỗi strs, hãy gom nhóm các chuỗi đảo từ (anagram) lại với nhau.',
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
    ],
    starterCode: `class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        // Viết code Java tại đây\n        return new ArrayList<>();\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        // Viết code Java tại đây\n        return new ArrayList<>();\n    }\n}`,
      python: `class Solution:\n    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['1 ≤ strs.length ≤ 10⁴'],
  },

  // ── 4. TWO POINTERS ──
  {
    id: 'two-sum-ii',
    title: 'Two Sum II - Input Array Is Sorted',
    topic: 'Two Pointers',
    difficulty: 'Medium',
    description: 'Cho mảng số nguyên numbers đã được sắp xếp tăng dần 1-indexed, tìm hai số có tổng đúng bằng target.',
    examples: [
      { input: 'numbers = [2,7,11,15], target = 9', output: '[1,2]' },
      { input: 'numbers = [2,3,4], target = 6', output: '[1,3]' },
    ],
    starterCode: `class Solution {\n    public int[] twoSum(int[] numbers, int target) {\n        // Viết code Java tại đây\n        return new int[]{};\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public int[] twoSum(int[] numbers, int target) {\n        // Viết code Java tại đây\n        return new int[]{};\n    }\n}`,
      python: `class Solution:\n    def twoSum(self, numbers: list[int], target: int) -> list[int]:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['2 ≤ numbers.length ≤ 3 * 10⁴'],
  },
  {
    id: 'container-with-most-water',
    title: 'Container With Most Water',
    topic: 'Two Pointers',
    difficulty: 'Medium',
    description: 'Cho mảng height chứa n đường dựng đứng. Tìm hai đường cùng với trục hoành tạo thành bể chứa nhiều nước nhất.',
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49' },
    ],
    starterCode: `class Solution {\n    public int maxArea(int[] height) {\n        // Viết code Java tại đây\n        return 0;\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public int maxArea(int[] height) {\n        // Viết code Java tại đây\n        return 0;\n    }\n}`,
      python: `class Solution:\n    def maxArea(self, height: list[int]) -> int:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['2 ≤ height.length ≤ 10⁵'],
  },

  // ── 5. LINKED LIST ──
  {
    id: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists',
    topic: 'Linked List',
    difficulty: 'Easy',
    description: 'Hợp nhất hai danh sách liên kết đơn đã sắp xếp tăng dần thành một danh sách liên kết sắp xếp mới.',
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
    ],
    starterCode: `class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Viết code Java tại đây\n        return null;\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Viết code Java tại đây\n        return null;\n    }\n}`,
      python: `class Solution:\n    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['Số lượng nút từ 0 đến 50'],
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    topic: 'Linked List',
    difficulty: 'Medium',
    description: 'Cho đầu (head) của một danh sách liên kết đơn, hãy đảo ngược danh sách và trả về head mới.',
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
    ],
    starterCode: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Viết code Java tại đây\n        return null;\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Viết code Java tại đây\n        return null;\n    }\n}`,
      python: `class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['0 ≤ Node count ≤ 5000'],
  },

  // ── 6. STACK ──
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    topic: 'Stack',
    difficulty: 'Easy',
    description: 'Cho một chuỗi s chứa các dấu ngoặc. Xác định chuỗi ngoặc có mở/đóng đúng loại và đúng thứ tự không.',
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    starterCode: `class Solution {\n    public boolean isValid(String s) {\n        // Viết code Java tại đây\n        return false;\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public boolean isValid(String s) {\n        // Viết code Java tại đây\n        return false;\n    }\n}`,
      python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['1 ≤ s.length ≤ 10⁴'],
  },
  {
    id: 'min-stack',
    title: 'Min Stack',
    topic: 'Stack',
    difficulty: 'Medium',
    description: 'Thiết kế một Stack hỗ trợ push, pop, top và lấy phần tử nhỏ nhất (getMin) trong thời gian O(1).',
    examples: [
      { input: 'push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()', output: '-3, 0, -2' },
    ],
    starterCode: `class MinStack {\n    public MinStack() {}\n    public void push(int val) {}\n    public void pop() {}\n    public int top() { return 0; }\n    public int getMin() { return 0; }\n}`,
    starterCodes: {
      java: `class MinStack {\n    public MinStack() {}\n    public void push(int val) {}\n    public void pop() {}\n    public int top() { return 0; }\n    public int getMin() { return 0; }\n}`,
      python: `class MinStack:\n    def __init__(self):\n        pass\n    def push(self, val: int) -> None:\n        pass\n    def pop(self) -> None:\n        pass\n    def top(self) -> int:\n        return 0\n    def getMin(self) -> int:\n        return 0`,
    },
    language: 'java',
    constraints: ['Tối đa 3 * 10⁴ lần gọi hàm'],
  },

  // ── 7. QUEUE ──
  {
    id: 'implement-queue-using-stacks',
    title: 'Implement Queue using Stacks',
    topic: 'Queue',
    difficulty: 'Easy',
    description: 'Cài đặt một hàng đợi FIFO chỉ bằng hai ngăn xếp (Stack). Hàng đợi hỗ trợ push, pop, peek và empty.',
    examples: [
      { input: 'push(1), push(2), peek(), pop(), empty()', output: '1, 1, false' },
    ],
    starterCode: `class MyQueue {\n    public MyQueue() {}\n    public void push(int x) {}\n    public int pop() { return 0; }\n    public int peek() { return 0; }\n    public boolean empty() { return false; }\n}`,
    starterCodes: {
      java: `class MyQueue {\n    public MyQueue() {}\n    public void push(int x) {}\n    public int pop() { return 0; }\n    public int peek() { return 0; }\n    public boolean empty() { return false; }\n}`,
      python: `class MyQueue:\n    def __init__(self):\n        pass\n    def push(self, x: int) -> None:\n        pass\n    def pop(self) -> int:\n        return 0\n    def peek(self) -> int:\n        return 0\n    def empty(self) -> bool:\n        return False`,
    },
    language: 'java',
    constraints: ['1 ≤ x ≤ 9'],
  },
  {
    id: 'sliding-window-maximum',
    title: 'Sliding Window Maximum',
    topic: 'Queue',
    difficulty: 'Hard',
    description: 'Cho mảng nums và kích thước cửa sổ k. Trả về giá trị lớn nhất trong mỗi cửa sổ trượt di chuyển từ trái sang phải.',
    examples: [
      { input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]' },
    ],
    starterCode: `class Solution {\n    public int[] maxSlidingWindow(int[] nums, int k) {\n        // Viết code Java tại đây\n        return new int[]{};\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public int[] maxSlidingWindow(int[] nums, int k) {\n        // Viết code Java tại đây\n        return new int[]{};\n    }\n}`,
      python: `class Solution:\n    def maxSlidingWindow(self, nums: list[int], k: int) -> list[int]:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['1 ≤ nums.length ≤ 10⁵', '1 ≤ k ≤ nums.length'],
  },

  // ── 8. RECURSION ──
  {
    id: 'fibonacci-number',
    title: 'Fibonacci Number',
    topic: 'Recursion',
    difficulty: 'Easy',
    description: 'Dãy Fibonacci: F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2). Tính F(n).',
    examples: [
      { input: 'n = 2', output: '1' },
      { input: 'n = 4', output: '3' },
    ],
    starterCode: `class Solution {\n    public int fib(int n) {\n        // Viết code Java tại đây\n        return 0;\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public int fib(int n) {\n        // Viết code Java tại đây\n        return 0;\n    }\n}`,
      python: `class Solution:\n    def fib(self, n: int) -> int:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['0 ≤ n ≤ 30'],
  },
  {
    id: 'subsets',
    title: 'Subsets',
    topic: 'Recursion',
    difficulty: 'Medium',
    description: 'Cho mảng số nguyên nums gồm các phần tử duy nhất, trả về tất cả các tập con (power set) bằng thuật toán đệ quy quay lui.',
    examples: [
      { input: 'nums = [1,2,3]', output: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' },
    ],
    starterCode: `class Solution {\n    public List<List<Integer>> subsets(int[] nums) {\n        // Viết code Java tại đây\n        return new ArrayList<>();\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public List<List<Integer>> subsets(int[] nums) {\n        // Viết code Java tại đây\n        return new ArrayList<>();\n    }\n}`,
      python: `class Solution:\n    def subsets(self, nums: list[int]) -> list[list[int]]:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['1 ≤ nums.length ≤ 10'],
  },

  // ── 9. SORTING ──
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    topic: 'Sorting',
    difficulty: 'Medium',
    description: 'Cho mảng các khoảng intervals, gộp tất cả các khoảng chồng lấp và trả về mảng các khoảng không chồng lấp.',
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' },
    ],
    starterCode: `class Solution {\n    public int[][] merge(int[][] intervals) {\n        // Viết code Java tại đây\n        return new int[][]{};\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public int[][] merge(int[][] intervals) {\n        // Viết code Java tại đây\n        return new int[][]{};\n    }\n}`,
      python: `class Solution:\n    def merge(self, intervals: list[list[int]]) -> list[list[int]]:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['1 ≤ intervals.length ≤ 10⁴'],
  },
  {
    id: 'kth-largest-element',
    title: 'Kth Largest Element in an Array',
    topic: 'Sorting',
    difficulty: 'Medium',
    description: 'Cho mảng số nguyên nums và số k, tìm phần tử lớn thứ k trong mảng.',
    examples: [
      { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' },
    ],
    starterCode: `class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        // Viết code Java tại đây\n        return 0;\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        // Viết code Java tại đây\n        return 0;\n    }\n}`,
      python: `class Solution:\n    def findKthLargest(self, nums: list[int], k: int) -> int:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['1 ≤ k ≤ nums.length ≤ 10⁵'],
  },

  // ── 10. BINARY SEARCH ──
  {
    id: 'binary-search',
    title: 'Binary Search',
    topic: 'Binary Search',
    difficulty: 'Easy',
    description: 'Cho một mảng số nguyên đã sắp xếp nums và một số nguyên target. Tìm target trong nums với độ phức tạp O(log n).',
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' },
    ],
    starterCode: `class Solution {\n    public int search(int[] nums, int target) {\n        // Viết code Java tại đây\n        return -1;\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public int search(int[] nums, int target) {\n        // Viết code Java tại đây\n        return -1;\n    }\n}`,
      python: `class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['1 ≤ nums.length ≤ 10⁴'],
  },
  {
    id: 'search-a-2d-matrix',
    title: 'Search a 2D Matrix',
    topic: 'Binary Search',
    difficulty: 'Medium',
    description: 'Viết thuật toán tìm kiếm nhị phân kiểm tra giá trị target có xuất hiện trong ma trận m x n đã sắp xếp không.',
    examples: [
      { input: 'matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3', output: 'true' },
    ],
    starterCode: `class Solution {\n    public boolean searchMatrix(int[][] matrix, int target) {\n        // Viết code Java tại đây\n        return false;\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public boolean searchMatrix(int[][] matrix, int target) {\n        // Viết code Java tại đây\n        return false;\n    }\n}`,
      python: `class Solution:\n    def searchMatrix(self, matrix: list[list[int]], target: int) -> bool:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['1 ≤ m, n ≤ 100'],
  },

  // ── 11. TREE ──
  {
    id: 'invert-binary-tree',
    title: 'Invert Binary Tree',
    topic: 'Tree',
    difficulty: 'Easy',
    description: 'Cho gốc (root) của một cây nhị phân, hãy lật ngược cây (đổi vị trí cây con trái và phải) và trả về gốc.',
    examples: [
      { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' },
    ],
    starterCode: `class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        // Viết code Java tại đây\n        return null;\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        // Viết code Java tại đây\n        return null;\n    }\n}`,
      python: `class Solution:\n    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['Số nút trong cây từ 0 đến 100'],
  },
  {
    id: 'maximum-depth-of-binary-tree',
    title: 'Maximum Depth of Binary Tree',
    topic: 'Tree',
    difficulty: 'Easy',
    description: 'Cho gốc của một cây nhị phân, hãy tìm chiều cao (độ sâu tối đa) từ nút gốc đến nút lá xa nhất.',
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3' },
    ],
    starterCode: `class Solution {\n    public int maxDepth(TreeNode root) {\n        // Viết code Java tại đây\n        return 0;\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public int maxDepth(TreeNode root) {\n        // Viết code Java tại đây\n        return 0;\n    }\n}`,
      python: `class Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['Số nút trong cây từ 0 đến 10⁴'],
  },

  // ── 12. GRAPH ──
  {
    id: 'clone-graph',
    title: 'Clone Graph',
    topic: 'Graph',
    difficulty: 'Medium',
    description: 'Cho tham chiếu của một nút trong đồ thị vô hướng liên thông, hãy tạo một bản sao sâu (deep copy) của đồ thị.',
    examples: [
      { input: 'adjList = [[2,4],[1,3],[2,4],[1,3]]', output: '[[2,4],[1,3],[2,4],[1,3]]' },
    ],
    starterCode: `class Solution {\n    public Node cloneGraph(Node node) {\n        // Viết code Java tại đây\n        return null;\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public Node cloneGraph(Node node) {\n        // Viết code Java tại đây\n        return null;\n    }\n}`,
      python: `class Solution:\n    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['Số nút trong đồ thị từ 0 đến 100'],
  },
  {
    id: 'number-of-islands',
    title: 'Number of Islands',
    topic: 'Graph',
    difficulty: 'Hard',
    description: 'Cho lưới grid 2D m x n gồm các ký tự 1 (đất) và 0 (nước), hãy đếm số lượng hòn đảo liên thông.',
    examples: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: '1' },
    ],
    starterCode: `class Solution {\n    public int numIslands(char[][] grid) {\n        // Viết code Java tại đây\n        return 0;\n    }\n}`,
    starterCodes: {
      java: `class Solution {\n    public int numIslands(char[][] grid) {\n        // Viết code Java tại đây\n        return 0;\n    }\n}`,
      python: `class Solution:\n    def numIslands(self, grid: list[list[str]]) -> int:\n        # Viết code Python tại đây\n        pass`,
    },
    language: 'java',
    constraints: ['1 ≤ m, n ≤ 300'],
  },
];

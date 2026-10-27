export interface SubmissionAttempt {
  attemptId: string;
  attemptNumber: number;
  timestamp: string;
  status: 'passed' | 'failed';
  runtime: string;
  memory: string;
  language: string;
  testPassedCount: number;
  testTotalCount: number;
  code: string;
  feedback: {
    overall: string;
    complexity: string;
    codeStyle: string;
    suggestions: string[];
  };
}

export interface SubmissionRecord {
  id: string;
  problem: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'passed' | 'failed';
  timestamp: string;
  attemptCount: number;
  attempts: SubmissionAttempt[];
}

export interface DailyActivity {
  date: string;
  day: string;
  solved: number;
  attempts: number;
  xp: number;
  timeSpent: string;
}

// ── Centralized Synced User Mock Data ──────────────────────────────────────

export const MOCK_STREAK = 12;
export const MOCK_XP = 1480;

export const MOCK_WEEKLY = [
  { day: 'T2', solved: 3 },
  { day: 'T3', solved: 5 },
  { day: 'T4', solved: 0 },
  { day: 'T5', solved: 7 },
  { day: 'T6', solved: 4 },
  { day: 'T7', solved: 6 },
  { day: 'CN', solved: 2 },
];

export const MOCK_ACTIVITY_LOG: DailyActivity[] = [
  { date: '12/09/2026 (Hôm nay)', day: 'T7', solved: 6, attempts: 8, xp: 180, timeSpent: '55 phút' },
  { date: '11/09/2026', day: 'T6', solved: 4, attempts: 6, xp: 140, timeSpent: '45 phút' },
  { date: '10/09/2026', day: 'T5', solved: 7, attempts: 9, xp: 210, timeSpent: '70 phút' },
  { date: '09/09/2026', day: 'T4', solved: 0, attempts: 1, xp: 10, timeSpent: '10 phút' },
  { date: '08/09/2026', day: 'T3', solved: 5, attempts: 7, xp: 150, timeSpent: '50 phút' },
  { date: '07/09/2026', day: 'T2', solved: 3, attempts: 4, xp: 90, timeSpent: '30 phút' },
  { date: '06/09/2026', day: 'CN', solved: 2, attempts: 3, xp: 60, timeSpent: '25 phút' },
];

export const MOCK_TOPIC_PROGRESS: Record<string, number> = {
  Array: 100,
  String: 50,
  'Hash Table': 50,
  'Two Pointers': 50,
  'Linked List': 50,
  Stack: 50,
  Queue: 0,
  Recursion: 50,
  Sorting: 50,
  'Binary Search': 50,
  Tree: 50,
  Graph: 0,
};

export const MOCK_SUBMISSIONS: SubmissionRecord[] = [
  {
    id: 'sub-001',
    problem: 'Two Sum',
    topic: 'Array',
    difficulty: 'Easy',
    status: 'passed',
    timestamp: '12/09/2026 10:30',
    attemptCount: 3,
    attempts: [
      {
        attemptId: 'att-3',
        attemptNumber: 3,
        timestamp: '12/09/2026 10:30',
        status: 'passed',
        runtime: '42 ms',
        memory: '41.2 MB',
        language: 'Java',
        testPassedCount: 2,
        testTotalCount: 2,
        code: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) {\n                return new int[]{map.get(diff), i};\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`,
        feedback: {
          overall: 'Thuật toán tối ưu O(N) sử dụng HashMap. Bài làm chính xác và hoàn thành tất cả test case ẩn.',
          complexity: 'Thời gian: O(N) | Bộ nhớ phụ: O(N)',
          codeStyle: 'Code chuẩn phong cách Java, tên biến diff và map tường minh.',
          suggestions: ['Có thể khởi tạo kích thước HashMap = nums.length ban đầu để tránh rehash bộ nhớ.'],
        },
      },
      {
        attemptId: 'att-2',
        attemptNumber: 2,
        timestamp: '11/09/2026 14:15',
        status: 'failed',
        runtime: '78 ms',
        memory: '42.0 MB',
        language: 'Java',
        testPassedCount: 1,
        testTotalCount: 2,
        code: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        for (int i = 0; i < nums.length; i++) {\n            for (int j = 0; j < nums.length; j++) {\n                if (nums[i] + nums[j] == target) return new int[]{i, j};\n            }\n        }\n        return new int[]{};\n    }\n}`,
        feedback: {
          overall: 'Thuật toán vét cạn bị lặp phần tử trùng nhau (chỉ số i == j).',
          complexity: 'Thời gian: O(N²) | Bộ nhớ phụ: O(1)',
          codeStyle: 'Vòng lặp j nên bắt đầu từ i + 1 thay vì 0.',
          suggestions: [
            'Chỉ nên cho vòng lặp j bắt đầu từ i + 1 để tránh cộng 1 phần tử 2 lần.',
            'Dùng HashMap để giảm độ phức tạp thời gian từ O(N²) xuống O(N).',
          ],
        },
      },
      {
        attemptId: 'att-1',
        attemptNumber: 1,
        timestamp: '10/09/2026 09:10',
        status: 'failed',
        runtime: 'N/A',
        memory: 'N/A',
        language: 'Python',
        testPassedCount: 0,
        testTotalCount: 2,
        code: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        return [0, 1]`,
        feedback: {
          overall: 'Hardcode kết quả cố định [0, 1]. Không thỏa mãn các bài toán tổng quát.',
          complexity: 'Chưa tính toán độ phức tạp.',
          codeStyle: 'Cần triển khai logic tìm kiếm mảng.',
          suggestions: ['Duyệt từng phần tử và lưu giá trị bù (target - num) vào Dictionary.'],
        },
      },
    ],
  },
  {
    id: 'sub-002',
    problem: 'Valid Parentheses',
    topic: 'Stack',
    difficulty: 'Easy',
    status: 'passed',
    timestamp: '11/09/2026 15:45',
    attemptCount: 2,
    attempts: [
      {
        attemptId: 'att-2',
        attemptNumber: 2,
        timestamp: '11/09/2026 15:45',
        status: 'passed',
        runtime: '38 ms',
        memory: '40.8 MB',
        language: 'Java',
        testPassedCount: 3,
        testTotalCount: 3,
        code: `class Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}`,
        feedback: {
          overall: 'Cách dùng Stack đảo dấu ngoặc rất ngắn gọn và thông minh. Qua 100% test case.',
          complexity: 'Thời gian: O(N) | Bộ nhớ phụ: O(N)',
          codeStyle: 'Code gọn gàng, điều kiện dừng dứt khoát.',
          suggestions: ['Dùng ArrayDeque thay cho Stack để tối ưu hiệu năng trong Java.'],
        },
      },
      {
        attemptId: 'att-1',
        attemptNumber: 1,
        timestamp: '11/09/2026 15:30',
        status: 'failed',
        runtime: '45 ms',
        memory: '41.0 MB',
        language: 'Java',
        testPassedCount: 1,
        testTotalCount: 3,
        code: `class Solution {\n    public boolean isValid(String s) {\n        return s.length() % 2 == 0;\n    }\n}`,
        feedback: {
          overall: 'Chỉ kiểm tra độ dài chuỗi chẵn/lẻ, không kiểm tra được thứ tự đóng mở ngoặc.',
          complexity: 'Thời gian: O(1) | Bộ nhớ phụ: O(1)',
          codeStyle: 'Thiếu cấu trúc dữ liệu Stack.',
          suggestions: ['Sử dụng Ngăn xếp (Stack) để quản lý thứ tự LIFO của các dấu ngoặc.'],
        },
      },
    ],
  },
  {
    id: 'sub-003',
    problem: 'Binary Search',
    topic: 'Binary Search',
    difficulty: 'Easy',
    status: 'failed',
    timestamp: '11/09/2026 11:20',
    attemptCount: 2,
    attempts: [
      {
        attemptId: 'att-2',
        attemptNumber: 2,
        timestamp: '11/09/2026 11:20',
        status: 'failed',
        runtime: '54 ms',
        memory: '42.1 MB',
        language: 'Java',
        testPassedCount: 1,
        testTotalCount: 2,
        code: `class Solution {\n    public int search(int[] nums, int target) {\n        int left = 0, right = nums.length - 1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[mid] < target) left = mid;\n            else right = mid - 1;\n        }\n        return -1;\n    }\n}`,
        feedback: {
          overall: 'Lỗi lặp vô tận (Infinite loop) do cập nhật `left = mid` thay vì `left = mid + 1`.',
          complexity: 'Thời gian: O(log N) | Bộ nhớ phụ: O(1)',
          codeStyle: 'Thuật toán chia để trị chuẩn, chỉ cần sửa bước nhảy con trỏ.',
          suggestions: ['Cập nhật `left = mid + 1` để thu hẹp khoảng tìm kiếm khi `nums[mid] < target`.'],
        },
      },
      {
        attemptId: 'att-1',
        attemptNumber: 1,
        timestamp: '11/09/2026 11:00',
        status: 'failed',
        runtime: '65 ms',
        memory: '42.5 MB',
        language: 'Python',
        testPassedCount: 0,
        testTotalCount: 2,
        code: `class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        for i in range(len(nums)):\n            if nums[i] == target: return i\n        return -1`,
        feedback: {
          overall: 'Thuật toán tuyến tính O(N) bị từ chối do yêu cầu độ phức tạp O(log N).',
          complexity: 'Thời gian: O(N) (Không đạt yêu cầu bài toán)',
          codeStyle: 'Duyệt mảng tuần tự không dùng được ưu thế mảng đã sắp xếp.',
          suggestions: ['Áp dụng thuật toán Tìm kiếm nhị phân chia đôi khoảng tìm kiếm [left, right].'],
        },
      },
    ],
  },
  {
    id: 'sub-004',
    problem: 'Reverse Linked List',
    topic: 'Linked List',
    difficulty: 'Medium',
    status: 'passed',
    timestamp: '10/09/2026 18:10',
    attemptCount: 2,
    attempts: [
      {
        attemptId: 'att-2',
        attemptNumber: 2,
        timestamp: '10/09/2026 18:10',
        status: 'passed',
        runtime: '48 ms',
        memory: '43.5 MB',
        language: 'Java',
        testPassedCount: 2,
        testTotalCount: 2,
        code: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null, curr = head;\n        while (curr != null) {\n            ListNode next = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = next;\n        }\n        return prev;\n    }\n}`,
        feedback: {
          overall: 'Đảo ngược danh sách liên kết đơn bằng 3 con trỏ rất chuẩn xác.',
          complexity: 'Thời gian: O(N) | Bộ nhớ phụ: O(1)',
          codeStyle: 'Biến prev, curr, next đặt tên chuẩn mực, dễ đọc.',
          suggestions: ['Thử thách thêm cách giải đệ quy (Recursion) để nâng cao tư duy.'],
        },
      },
    ],
  },
  {
    id: 'sub-005',
    problem: 'Best Time to Buy Stock',
    topic: 'Array',
    difficulty: 'Medium',
    status: 'passed',
    timestamp: '10/09/2026 14:05',
    attemptCount: 1,
    attempts: [
      {
        attemptId: 'att-1',
        attemptNumber: 1,
        timestamp: '10/09/2026 14:05',
        status: 'passed',
        runtime: '52 ms',
        memory: '44.8 MB',
        language: 'Java',
        testPassedCount: 2,
        testTotalCount: 2,
        code: `class Solution {\n    public int maxProfit(int[] prices) {\n        int minPrice = Integer.MAX_VALUE;\n        int maxProfit = 0;\n        for (int p : prices) {\n            if (p < minPrice) minPrice = p;\n            else if (p - minPrice > maxProfit) maxProfit = p - minPrice;\n        }\n        return maxProfit;\n    }\n}`,
        feedback: {
          overall: 'Thuật toán 1 lần duyệt (One-pass) tìm minPrice và maxProfit cực kỳ tối ưu.',
          complexity: 'Thời gian: O(N) | Bộ nhớ phụ: O(1)',
          codeStyle: 'Cấu trúc ngắn gọn, mượt mà.',
          suggestions: ['Thuật toán đã tối ưu tối đa.'],
        },
      },
    ],
  },
];

import type { SkillLevel } from '@/types';

export type AdminTab = 'dashboard' | 'users' | 'problems' | 'templates' | 'generator';

export interface UserTopicStat {
  topic: string;
  solvedCount: number;
  level: SkillLevel;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  solvedCount: number;
  status: 'active' | 'suspended';
  joinDate: string;
  topicStats?: UserTopicStat[];
}

export interface ActivityLog {
  id: string;
  user: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'TOGGLE';
  target: string;
  time: string;
}

// Template mẫu đại diện cho 1 bài tập mẫu chuẩn dùng làm cơ sở cho AI sinh đề
export interface SampleTemplate {
  id: string;
  title: string;
  topic: string;
  level: SkillLevel;
  description: string;
  starterCode: string;
  solutionCode?: string;
  sampleInput?: string;
  sampleOutput?: string;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  updatedAt: string;
}

export interface GeneratedQuestion {
  id: string;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  starterCode: string;
  description?: string;
  sampleInput?: string;
  sampleOutput?: string;
  isPublic?: boolean; // Trạng thái xuất bản / public
}

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'log-1', user: 'Quản trị viên Demo', action: 'CREATE', target: 'Thêm tài khoản Vũ Đức Thành (Sinh viên)', time: '10 phút trước' },
  { id: 'log-2', user: 'Quản trị viên Demo', action: 'UPDATE', target: 'Cập nhật thông tin tài khoản Phạm Minh Anh', time: '35 phút trước' },
  { id: 'log-3', user: 'Quản trị viên Demo', action: 'CREATE', target: 'Tạo Template bài mẫu "Two Sum - Hash Map"', time: '2 giờ trước' },
  { id: 'log-4', user: 'TS. Nguyễn Quốc Bảo', action: 'DELETE', target: 'Xóa câu hỏi bài tập nháp #104', time: '5 giờ trước' },
  { id: 'log-5', user: 'Quản trị viên Demo', action: 'TOGGLE', target: 'Thay đổi trạng thái (Khóa): Lê Thị Mai', time: '1 ngày trước' },
];

export const DEFAULT_TOPIC_STATS: UserTopicStat[] = [
  { topic: 'Array', solvedCount: 2, level: 'advanced' },
  { topic: 'String', solvedCount: 1, level: 'intermediate' },
  { topic: 'Hash Table', solvedCount: 1, level: 'intermediate' },
  { topic: 'Two Pointers', solvedCount: 1, level: 'intermediate' },
  { topic: 'Linked List', solvedCount: 1, level: 'basic' },
  { topic: 'Stack', solvedCount: 1, level: 'basic' },
  { topic: 'Queue', solvedCount: 0, level: 'beginner' },
  { topic: 'Recursion', solvedCount: 1, level: 'intermediate' },
  { topic: 'Sorting', solvedCount: 1, level: 'intermediate' },
  { topic: 'Binary Search', solvedCount: 1, level: 'basic' },
  { topic: 'Tree', solvedCount: 1, level: 'beginner' },
  { topic: 'Graph', solvedCount: 0, level: 'beginner' },
];

export const MOCK_USERS_LIST: UserRecord[] = [
  { id: 'u-1', name: 'Sinh viên Demo', email: 'student@demo.com', role: 'student', solvedCount: 11, status: 'active', joinDate: '10/09/2026', topicStats: DEFAULT_TOPIC_STATS },
  { id: 'u-2', name: 'Giảng viên Demo', email: 'teacher@demo.com', role: 'teacher', solvedCount: 24, status: 'active', joinDate: '01/09/2026', topicStats: DEFAULT_TOPIC_STATS },
  { id: 'u-3', name: 'Quản trị viên Demo', email: 'admin@demo.com', role: 'admin', solvedCount: 24, status: 'active', joinDate: '15/08/2026', topicStats: DEFAULT_TOPIC_STATS },
  { id: 'u-4', name: 'Trần Văn Hoàng', email: 'hoang.tv@student.edu.vn', role: 'student', solvedCount: 8, status: 'active', joinDate: '05/09/2026', topicStats: DEFAULT_TOPIC_STATS },
  { id: 'u-5', name: 'Lê Thị Mai', email: 'mai.lt@student.edu.vn', role: 'student', solvedCount: 5, status: 'suspended', joinDate: '08/09/2026', topicStats: DEFAULT_TOPIC_STATS },
  { id: 'u-6', name: 'TS. Nguyễn Quốc Bảo', email: 'bao.nq@fit.edu.vn', role: 'teacher', solvedCount: 20, status: 'active', joinDate: '20/08/2026', topicStats: DEFAULT_TOPIC_STATS },
  { id: 'u-7', name: 'Phạm Minh Anh', email: 'anh.pm@student.edu.vn', role: 'student', solvedCount: 6, status: 'active', joinDate: '12/09/2026', topicStats: DEFAULT_TOPIC_STATS },
  { id: 'u-8', name: 'Vũ Đức Thành', email: 'thanh.vd@student.edu.vn', role: 'student', solvedCount: 12, status: 'active', joinDate: '14/09/2026', topicStats: DEFAULT_TOPIC_STATS },
];

export const MOCK_SAMPLE_TEMPLATES: SampleTemplate[] = [
  // ── 1. ARRAY ──
  {
    id: 'tpl-1',
    title: 'Tìm hai số có tổng bằng Target (Two Sum)',
    topic: 'Array',
    level: 'basic',
    description: 'Bài mẫu cơ bản về mảng: Tìm vị trí hai chỉ số trong mảng sao cho tổng của chúng bằng target cho trước.',
    starterCode: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}',
    sampleInput: 'nums = [2, 7, 11, 15], target = 9',
    sampleOutput: '[0, 1]',
    updatedAt: '11/09/2026',
  },
  {
    id: 'tpl-2',
    title: 'Best Time to Buy and Sell Stock (Mua bán cổ phiếu)',
    topic: 'Array',
    level: 'intermediate',
    description: 'Tối ưu hóa lợi nhuận khi mua bán cổ phiếu trong mảng giá theo 1 lần duyệt (One-pass).',
    starterCode: 'function maxProfit(prices) {\n  let minPrice = Infinity, maxProfit = 0;\n  for (const p of prices) {\n    if (p < minPrice) minPrice = p;\n    else if (p - minPrice > maxProfit) maxProfit = p - minPrice;\n  }\n  return maxProfit;\n}',
    sampleInput: 'prices = [7, 1, 5, 3, 6, 4]',
    sampleOutput: '5',
    updatedAt: '11/09/2026',
  },

  // ── 2. STRING ──
  {
    id: 'tpl-3',
    title: 'Valid Anagram (Kiểm tra chuỗi đảo từ)',
    topic: 'String',
    level: 'beginner',
    description: 'Bài mẫu nhập môn xử lý chuỗi: Kiểm tra hai chuỗi có cùng số lượng và loại ký tự hay không.',
    starterCode: 'function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const count = {};\n  for (const c of s) count[c] = (count[c] || 0) + 1;\n  for (const c of t) {\n    if (!count[c]) return false;\n    count[c]--;\n  }\n  return true;\n}',
    sampleInput: 's = "anagram", t = "nagaram"',
    sampleOutput: 'true',
    updatedAt: '10/09/2026',
  },
  {
    id: 'tpl-4',
    title: 'Longest Substring Without Repeating Characters',
    topic: 'String',
    level: 'intermediate',
    description: 'Tìm độ dài chuỗi con dài nhất không chứa ký tự lặp bằng thuật toán Cửa sổ trượt (Sliding Window).',
    starterCode: 'function lengthOfLongestSubstring(s) {\n  let set = new Set(), left = 0, maxLen = 0;\n  for (let right = 0; right < s.length; right++) {\n    while (set.has(s[right])) { set.delete(s[left]); left++; }\n    set.add(s[right]);\n    maxLen = Math.max(maxLen, right - left + 1);\n  }\n  return maxLen;\n}',
    sampleInput: 's = "abcabcbb"',
    sampleOutput: '3',
    updatedAt: '10/09/2026',
  },

  // ── 3. HASH TABLE ──
  {
    id: 'tpl-5',
    title: 'Contains Duplicate (Kiểm tra phần tử trùng lặp)',
    topic: 'Hash Table',
    level: 'basic',
    description: 'Kiểm tra mảng có chứa bất kỳ phần tử nào lặp lại ít nhất 2 lần bằng Hash Set O(N).',
    starterCode: 'function containsDuplicate(nums) {\n  const seen = new Set();\n  for (const n of nums) {\n    if (seen.has(n)) return true;\n    seen.add(n);\n  }\n  return false;\n}',
    sampleInput: 'nums = [1, 2, 3, 1]',
    sampleOutput: 'true',
    updatedAt: '09/09/2026',
  },
  {
    id: 'tpl-6',
    title: 'Group Anagrams (Gom nhóm các chuỗi đảo từ)',
    topic: 'Hash Table',
    level: 'intermediate',
    description: 'Bài mẫu gom nhóm mảng chuỗi thành các tập chuỗi đảo từ bằng Bảng băm Hash Map.',
    starterCode: 'function groupAnagrams(strs) {\n  const map = {};\n  for (const s of strs) {\n    const key = s.split("").sort().join("");\n    if (!map[key]) map[key] = [];\n    map[key].push(s);\n  }\n  return Object.values(map);\n}',
    sampleInput: 'strs = ["eat","tea","tan","ate","nat","bat"]',
    sampleOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]',
    updatedAt: '09/09/2026',
  },

  // ── 4. TWO POINTERS ──
  {
    id: 'tpl-7',
    title: 'Two Sum II - Input Array Is Sorted',
    topic: 'Two Pointers',
    level: 'intermediate',
    description: 'Tìm 2 số có tổng bằng target trên mảng đã sắp xếp sử dụng kỹ thuật 2 con trỏ O(N).',
    starterCode: 'function twoSumSorted(numbers, target) {\n  let left = 0, right = numbers.length - 1;\n  while (left < right) {\n    const sum = numbers[left] + numbers[right];\n    if (sum === target) return [left + 1, right + 1];\n    else if (sum < target) left++;\n    else right--;\n  }\n  return [];\n}',
    sampleInput: 'numbers = [2, 7, 11, 15], target = 9',
    sampleOutput: '[1, 2]',
    updatedAt: '09/09/2026',
  },
  {
    id: 'tpl-8',
    title: 'Container With Most Water (Chứa nhiều nước nhất)',
    topic: 'Two Pointers',
    level: 'advanced',
    description: 'Tính thể tích nước tối đa giữa hai cột chắn bằng 2 con trỏ di chuyển vào giữa.',
    starterCode: 'function maxArea(height) {\n  let left = 0, right = height.length - 1, max = 0;\n  while (left < right) {\n    const area = Math.min(height[left], height[right]) * (right - left);\n    max = Math.max(max, area);\n    if (height[left] < height[right]) left++;\n    else right--;\n  }\n  return max;\n}',
    sampleInput: 'height = [1,8,6,2,5,4,8,3,7]',
    sampleOutput: '49',
    updatedAt: '09/09/2026',
  },

  // ── 5. LINKED LIST ──
  {
    id: 'tpl-9',
    title: 'Merge Two Sorted Lists (Hợp nhất 2 danh sách)',
    topic: 'Linked List',
    level: 'basic',
    description: 'Trộn 2 danh sách liên kết đơn đã sắp xếp tăng dần thành 1 danh sách duy nhất.',
    starterCode: 'function mergeTwoLists(l1, l2) {\n  const dummy = { val: 0, next: null };\n  let curr = dummy;\n  while (l1 && l2) {\n    if (l1.val <= l2.val) { curr.next = l1; l1 = l1.next; }\n    else { curr.next = l2; l2 = l2.next; }\n    curr = curr.next;\n  }\n  curr.next = l1 || l2;\n  return dummy.next;\n}',
    sampleInput: 'l1 = [1,2,4], l2 = [1,3,4]',
    sampleOutput: '[1,1,2,3,4,4]',
    updatedAt: '08/09/2026',
  },
  {
    id: 'tpl-10',
    title: 'Reverse Linked List (Đảo ngược Danh sách)',
    topic: 'Linked List',
    level: 'advanced',
    description: 'Đảo ngược danh sách liên kết đơn bằng phương pháp 3 con trỏ (prev, curr, next).',
    starterCode: 'function reverseList(head) {\n  let prev = null, curr = head;\n  while (curr) {\n    let next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}',
    sampleInput: 'head = [1, 2, 3, 4, 5]',
    sampleOutput: '[5, 4, 3, 2, 1]',
    updatedAt: '08/09/2026',
  },

  // ── 6. STACK ──
  {
    id: 'tpl-11',
    title: 'Valid Parentheses (Chuỗi ngoặc hợp lệ)',
    topic: 'Stack',
    level: 'beginner',
    description: 'Đánh giá tính đúng đắn của các cặp ngoặc mở/đóng trong chuỗi bằng cấu trúc Stack LIFO.',
    starterCode: 'function isValidParentheses(s) {\n  const stack = [];\n  const pairs = { ")": "(", "}": "{", "]": "[" };\n  for (const char of s) {\n    if (["(", "{", "["].includes(char)) stack.push(char);\n    else if (stack.pop() !== pairs[char]) return false;\n  }\n  return stack.length === 0;\n}',
    sampleInput: 's = "{[()]}"',
    sampleOutput: 'true',
    updatedAt: '07/09/2026',
  },
  {
    id: 'tpl-12',
    title: 'Min Stack (Ngăn xếp lấy Min O(1))',
    topic: 'Stack',
    level: 'intermediate',
    description: 'Cài đặt Ngăn xếp hỗ trợ truy xuất giá trị nhỏ nhất (getMin) trong O(1) bằng auxiliary Stack.',
    starterCode: 'class MinStack {\n  constructor() {\n    this.stack = [];\n    this.minStack = [];\n  }\n  push(val) {\n    this.stack.push(val);\n    const min = this.minStack.length ? Math.min(val, this.getMin()) : val;\n    this.minStack.push(min);\n  }\n  pop() { this.stack.pop(); this.minStack.pop(); }\n  top() { return this.stack[this.stack.length - 1]; }\n  getMin() { return this.minStack[this.minStack.length - 1]; }\n}',
    sampleInput: 'push(-2), push(0), push(-3), getMin()',
    sampleOutput: '-3',
    updatedAt: '07/09/2026',
  },

  // ── 7. QUEUE ──
  {
    id: 'tpl-13',
    title: 'Implement Queue using Stacks',
    topic: 'Queue',
    level: 'beginner',
    description: 'Mô phỏng Hàng đợi FIFO bằng 2 Ngăn xếp Stack (inStack và outStack).',
    starterCode: 'class MyQueue {\n  constructor() {\n    this.in = []; this.out = [];\n  }\n  push(x) { this.in.push(x); }\n  pop() {\n    this.peek();\n    return this.out.pop();\n  }\n  peek() {\n    if (!this.out.length) {\n      while (this.in.length) this.out.push(this.in.pop());\n    }\n    return this.out[this.out.length - 1];\n  }\n  empty() { return !this.in.length && !this.out.length; }\n}',
    sampleInput: 'push(1), push(2), peek()',
    sampleOutput: '1',
    updatedAt: '07/09/2026',
  },
  {
    id: 'tpl-14',
    title: 'Sliding Window Maximum (Cửa sổ trượt Max)',
    topic: 'Queue',
    level: 'expert',
    description: 'Tìm giá trị lớn nhất trong mỗi cửa sổ độ dài K trượt trên mảng sử dụng Monotonic Deque O(N).',
    starterCode: 'function maxSlidingWindow(nums, k) {\n  const deque = [], res = [];\n  for (let i = 0; i < nums.length; i++) {\n    while (deque.length && deque[0] <= i - k) deque.shift();\n    while (deque.length && nums[deque[deque.length - 1]] <= nums[i]) deque.pop();\n    deque.push(i);\n    if (i >= k - 1) res.push(nums[deque[0]]);\n  }\n  return res;\n}',
    sampleInput: 'nums = [1,3,-1,-3,5,3,6,7], k = 3',
    sampleOutput: '[3,3,5,5,6,7]',
    updatedAt: '07/09/2026',
  },

  // ── 8. RECURSION ──
  {
    id: 'tpl-15',
    title: 'Fibonacci Number (Tính số Fibonacci Đệ quy)',
    topic: 'Recursion',
    level: 'beginner',
    description: 'Tính số Fibonacci thứ N sử dụng đệ quy nhớ (Memoization) để tránh lặp tính toán.',
    starterCode: 'function fib(n, memo = {}) {\n  if (n <= 1) return n;\n  if (memo[n]) return memo[n];\n  return memo[n] = fib(n - 1, memo) + fib(n - 2, memo);\n}',
    sampleInput: 'n = 4',
    sampleOutput: '3',
    updatedAt: '06/09/2026',
  },
  {
    id: 'tpl-16',
    title: 'Subsets (Tập con quay lui)',
    topic: 'Recursion',
    level: 'intermediate',
    description: 'Sinh tất cả tập con (power set) của một mảng bằng thuật toán Đệ quy Quay lui (Backtracking).',
    starterCode: 'function subsets(nums) {\n  const res = [];\n  function backtrack(start, path) {\n    res.push([...path]);\n    for (let i = start; i < nums.length; i++) {\n      path.push(nums[i]);\n      backtrack(i + 1, path);\n      path.pop();\n    }\n  }\n  backtrack(0, []);\n  return res;\n}',
    sampleInput: 'nums = [1, 2, 3]',
    sampleOutput: '[[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]',
    updatedAt: '06/09/2026',
  },

  // ── 9. SORTING ──
  {
    id: 'tpl-17',
    title: 'Merge Intervals (Gộp các khoảng chồng lấp)',
    topic: 'Sorting',
    level: 'intermediate',
    description: 'Sắp xếp mảng khoảng theo start_time và hợp nhất các khoảng có phần giao nhau.',
    starterCode: 'function mergeIntervals(intervals) {\n  if (!intervals.length) return [];\n  intervals.sort((a, b) => a[0] - b[0]);\n  const res = [intervals[0]];\n  for (let i = 1; i < intervals.length; i++) {\n    const last = res[res.length - 1];\n    if (intervals[i][0] <= last[1]) last[1] = Math.max(last[1], intervals[i][1]);\n    else res.push(intervals[i]);\n  }\n  return res;\n}',
    sampleInput: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
    sampleOutput: '[[1,6],[8,10],[15,18]]',
    updatedAt: '06/09/2026',
  },
  {
    id: 'tpl-18',
    title: 'Kth Largest Element in an Array',
    topic: 'Sorting',
    level: 'advanced',
    description: 'Tìm phần tử lớn thứ K trong mảng bằng giải thuật QuickSelect hoặc MaxHeap.',
    starterCode: 'function findKthLargest(nums, k) {\n  nums.sort((a, b) => b - a);\n  return nums[k - 1];\n}',
    sampleInput: 'nums = [3,2,1,5,6,4], k = 2',
    sampleOutput: '5',
    updatedAt: '06/09/2026',
  },

  // ── 10. BINARY SEARCH ──
  {
    id: 'tpl-19',
    title: 'Binary Search (Tìm kiếm nhị phân cơ bản)',
    topic: 'Binary Search',
    level: 'basic',
    description: 'Tìm vị trí của phần tử target trong mảng đã sắp xếp với độ phức tạp O(log N).',
    starterCode: 'function binarySearch(nums, target) {\n  let left = 0, right = nums.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (nums[mid] === target) return mid;\n    else if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}',
    sampleInput: 'nums = [-1,0,3,5,9,12], target = 9',
    sampleOutput: '4',
    updatedAt: '06/09/2026',
  },
  {
    id: 'tpl-20',
    title: 'Search a 2D Matrix (Tìm kiếm Ma trận 2D)',
    topic: 'Binary Search',
    level: 'intermediate',
    description: 'Áp dụng tìm kiếm nhị phân xem ma trận 2D đã sắp xếp thành 1 dải 1D O(log(M*N)).',
    starterCode: 'function searchMatrix(matrix, target) {\n  const m = matrix.length, n = matrix[0].length;\n  let left = 0, right = m * n - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    const val = matrix[Math.floor(mid / n)][mid % n];\n    if (val === target) return true;\n    if (val < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return false;\n}',
    sampleInput: 'matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3',
    sampleOutput: 'true',
    updatedAt: '06/09/2026',
  },

  // ── 11. TREE ──
  {
    id: 'tpl-21',
    title: 'Invert Binary Tree (Lật ngược cây nhị phân)',
    topic: 'Tree',
    level: 'beginner',
    description: 'Hoán đổi vị trí hai cây con trái và phải của mọi nút trên Cây nhị phân bằng Đệ quy.',
    starterCode: 'function invertTree(root) {\n  if (!root) return null;\n  const temp = root.left;\n  root.left = invertTree(root.right);\n  root.right = invertTree(temp);\n  return root;\n}',
    sampleInput: 'root = [4,2,7,1,3,6,9]',
    sampleOutput: '[4,7,2,9,6,3,1]',
    updatedAt: '05/09/2026',
  },
  {
    id: 'tpl-22',
    title: 'Maximum Depth of Binary Tree (Độ sâu tối đa)',
    topic: 'Tree',
    level: 'basic',
    description: 'Tính độ sâu lớn nhất từ nút gốc đến nút lá của Cây nhị phân.',
    starterCode: 'function maxDepth(root) {\n  if (!root) return 0;\n  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}',
    sampleInput: 'root = [3,9,20,null,null,15,7]',
    sampleOutput: '3',
    updatedAt: '05/09/2026',
  },

  // ── 12. GRAPH ──
  {
    id: 'tpl-23',
    title: 'Clone Graph (Sao chép đồ thị vô hướng)',
    topic: 'Graph',
    level: 'intermediate',
    description: 'Tạo bản sao sâu (deep copy) của đồ thị vô hướng liên thông bằng BFS/DFS và Bảng băm.',
    starterCode: 'function cloneGraph(node) {\n  if (!node) return null;\n  const visited = new Map();\n  function dfs(curr) {\n    if (visited.has(curr)) return visited.get(curr);\n    const copy = { val: curr.val, neighbors: [] };\n    visited.set(curr, copy);\n    for (const n of curr.neighbors) copy.neighbors.push(dfs(n));\n    return copy;\n  }\n  return dfs(node);\n}',
    sampleInput: 'adjList = [[2,4],[1,3],[2,4],[1,3]]',
    sampleOutput: '[[2,4],[1,3],[2,4],[1,3]]',
    updatedAt: '05/09/2026',
  },
  {
    id: 'tpl-24',
    title: 'Number of Islands (Đếm số hòn đảo BFS/DFS)',
    topic: 'Graph',
    level: 'expert',
    description: 'Đếm số lượng hòn đảo ô 1 liên thông trên lưới 2D bằng thuật toán duyệt BFS hoặc DFS.',
    starterCode: 'function numIslands(grid) {\n  if (!grid.length) return 0;\n  let count = 0;\n  const m = grid.length, n = grid[0].length;\n  function dfs(r, c) {\n    if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] === "0") return;\n    grid[r][c] = "0";\n    dfs(r + 1, c); dfs(r - 1, c);\n    dfs(r, c + 1); dfs(r, c - 1);\n  }\n  for (let r = 0; r < m; r++) {\n    for (let c = 0; c < n; c++) {\n      if (grid[r][c] === "1") { count++; dfs(r, c); }\n    }\n  }\n  return count;\n}',
    sampleInput: 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]',
    sampleOutput: '2',
    updatedAt: '05/09/2026',
  },
];

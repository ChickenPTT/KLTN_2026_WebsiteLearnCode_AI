import { PRACTICE_PROBLEMS, type PracticeProblem, type SkillLevel } from '@/types';
import type { GeneratedQuestion } from '@/pages/admin/admin.types';
import {
  normalizeDifficulty,
  sanitizeStoredProblemDifficulty,
  isValidDifficulty,
  getDifficultyLevel,
  getDifficultyLabel,
  getDifficultyColor,
} from './difficulty';

export {
  normalizeDifficulty,
  sanitizeStoredProblemDifficulty,
  isValidDifficulty,
  getDifficultyLevel,
  getDifficultyLabel,
  getDifficultyColor,
};

export const PROBLEMS_STORAGE_KEY = 'app_practice_problems';

/**
 * Chuẩn hóa danh sách ví dụ: Đảm bảo luôn là mảng hợp lệ có ít nhất 1 ví dụ
 */
export function normalizeExamples(raw: any): { input: string; output: string; explanation?: string }[] {
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((ex, idx) => ({
      input: typeof ex?.input === 'string' && ex.input.trim().length > 0
        ? ex.input
        : (typeof ex === 'string' && ex.trim().length > 0 ? ex : `nums = [${idx + 1}, ${idx + 2}, ${idx + 3}]`),
      output: typeof ex?.output === 'string' && ex.output.trim().length > 0
        ? ex.output
        : (typeof ex === 'string' && ex.trim().length > 0 ? ex : `${idx + 1}`),
      explanation: typeof ex?.explanation === 'string' ? ex.explanation : undefined,
    }));
  }

  // Fallback từ các trường đơn nếu có
  const singleInput = raw?.sampleInput || raw?.inputExample || raw?.input;
  const singleOutput = raw?.sampleOutput || raw?.outputExample || raw?.output;
  if (singleInput || singleOutput) {
    return [
      {
        input: typeof singleInput === 'string' && singleInput.trim().length > 0 ? singleInput : 'nums = [2, 7, 11, 15], target = 9',
        output: typeof singleOutput === 'string' && singleOutput.trim().length > 0 ? singleOutput : '[0, 1]',
        explanation: 'Ví dụ mẫu mặc định',
      },
    ];
  }

  // Fallback an toàn mặc định để không bao giờ bị rỗng hoặc undefined
  return [
    {
      input: 'nums = [2, 7, 11, 15], target = 9',
      output: '[0, 1]',
      explanation: 'nums[0] + nums[1] = 2 + 7 = 9',
    },
  ];
}

/**
 * Chuẩn hóa danh sách ràng buộc (constraints): Đảm bảo luôn là mảng string hợp lệ
 */
export function normalizeConstraints(raw: any): string[] {
  if (Array.isArray(raw) && raw.length > 0) {
    const list = raw.map((c) => String(c).trim()).filter((c) => c.length > 0);
    if (list.length > 0) return list;
  }
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return [raw.trim()];
  }
  return ['1 ≤ N ≤ 10⁵', 'Thời gian chạy Sandbox < 1000ms'];
}

/**
 * Chuẩn hóa mã nguồn mẫu khởi tạo theo ngôn ngữ
 */
export function normalizeStarterCodes(
  starterCode?: string,
  starterCodes?: { java?: string; python?: string },
): { java: string; python: string } {
  const javaDefault = `class Solution {\n    public int solve(int[] nums) {\n        // Viết mã nguồn Java tại đây\n        return 0;\n    }\n}`;
  const pyDefault = `class Solution:\n    def solve(self, nums: list[int]) -> int:\n        # Viết mã nguồn Python tại đây\n        return 0`;

  const javaCode = starterCodes?.java || starterCode || javaDefault;
  const pyCode = starterCodes?.python || pyDefault;

  return {
    java: javaCode,
    python: pyCode,
  };
}

/**
 * Hàm chuẩn hóa toàn bộ một bài tập PracticeProblem:
 * Thống nhất cấu trúc dữ liệu giữa Admin, AI Generator và PracticePage
 */
export function normalizeProblem(raw: Partial<PracticeProblem> | GeneratedQuestion | any): PracticeProblem {
  const id = raw?.id && String(raw.id).trim().length > 0 ? String(raw.id).trim() : `prob-${Date.now()}`;
  const title = raw?.title && String(raw.title).trim().length > 0 ? String(raw.title).trim() : 'Bài tập thực hành mới';
  const topic = raw?.topic && String(raw.topic).trim().length > 0 ? String(raw.topic).trim() : 'Array';
  const difficulty = sanitizeStoredProblemDifficulty(raw);
  const description = raw?.description && String(raw.description).trim().length > 0
    ? String(raw.description).trim()
    : 'Cho đầu vào tương ứng, hãy triển khai thuật toán tối ưu để giải quyết bài toán.';

  const examples = normalizeExamples(raw?.examples || raw);
  const constraints = normalizeConstraints(raw?.constraints);
  const normalizedCodes = normalizeStarterCodes(raw?.starterCode || raw?.initialCode, raw?.starterCodes);
  const language = raw?.language || 'java';

  // Đồng bộ giữa starterCode và initialCode
  const starterCode = raw?.starterCode || normalizedCodes.java;
  const initialCode = raw?.initialCode || starterCode;

  // Đồng bộ testCases từ examples hoặc testCases gốc
  const testCases = Array.isArray(raw?.testCases) && raw.testCases.length > 0
    ? raw.testCases.map((tc: any) => ({
        input: String(tc.input || ''),
        output: String(tc.output || ''),
      }))
    : examples.map((ex) => ({ input: ex.input, output: ex.output }));

  // Tags
  const tags = Array.isArray(raw?.tags) && raw.tags.length > 0
    ? raw.tags
    : [topic, difficulty];

  // Trạng thái công khai: false nếu explicitly false (Draft), mặc định true nếu publish
  const isPublic = raw?.isPublic !== undefined ? Boolean(raw.isPublic) : true;
  const isAiGenerated = Boolean(raw?.isAiGenerated);
  const isVerified = raw?.isVerified !== undefined ? Boolean(raw.isVerified) : true;
  const updatedAt = raw?.updatedAt || new Date().toISOString().split('T')[0];

  return {
    id,
    title,
    topic,
    difficulty,
    description,
    examples,
    starterCode,
    starterCodes: normalizedCodes,
    language,
    constraints,
    isPublic,
    isAiGenerated,
    isVerified,
    updatedAt,
    initialCode,
    testCases,
    tags,
    author: raw?.author || (isAiGenerated ? 'AI Generator' : 'Giảng viên'),
    points: typeof raw?.points === 'number' ? raw.points : 100,
    solvedCount: typeof raw?.solvedCount === 'number' ? raw.solvedCount : 0,
    acceptanceRate: raw?.acceptanceRate || '100%',
  };
}

/**
 * Đọc toàn bộ bài tập từ localStorage. Nếu chưa có, tự động nạp từ PRACTICE_PROBLEMS gốc và lưu lại.
 */
export function getStoredProblems(): PracticeProblem[] {
  if (typeof window === 'undefined') {
    return PRACTICE_PROBLEMS.map(normalizeProblem);
  }

  try {
    const raw = localStorage.getItem(PROBLEMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalized = parsed.map(normalizeProblem);
        // Kiểm tra xem có bài tập nào đã được chuẩn hóa lại độ khó so với dữ liệu cũ
        const hasCorrection = normalized.some((p, idx) => p.difficulty !== parsed[idx]?.difficulty);
        if (hasCorrection) {
          try {
            // Cập nhật lại độ khó đã chuẩn hóa mà KHÔNG xóa bất kỳ bài tập hay thuộc tính nào
            localStorage.setItem(PROBLEMS_STORAGE_KEY, JSON.stringify(normalized));
          } catch {
            // ignore
          }
        }
        return normalized;
      }
    }
  } catch (err) {
    console.error('Lỗi khi đọc bài tập từ localStorage:', err);
  }

  // Khởi tạo lần đầu từ dữ liệu mẫu
  const initial = PRACTICE_PROBLEMS.map(normalizeProblem);
  try {
    localStorage.setItem(PROBLEMS_STORAGE_KEY, JSON.stringify(initial));
  } catch (err) {
    console.error('Lỗi khi khởi tạo bài tập vào localStorage:', err);
  }
  return initial;
}

/**
 * Chỉ lấy các bài tập đã xuất bản (isPublic !== false) dành cho phía User
 */
export function getPublishedProblems(): PracticeProblem[] {
  return getStoredProblems().filter((p) => p.isPublic !== false);
}

/**
 * Lưu danh sách bài tập vào localStorage và bắn sự kiện để đồng bộ giao diện
 */
export function saveProblems(problems: PracticeProblem[]): PracticeProblem[] {
  const normalized = problems.map(normalizeProblem);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PROBLEMS_STORAGE_KEY, JSON.stringify(normalized));
      window.dispatchEvent(new CustomEvent('problems_updated', { detail: normalized }));
    } catch (err) {
      console.error('Lỗi khi lưu bài tập vào localStorage:', err);
    }
  }
  return normalized;
}

/**
 * Thêm bài tập mới vào đầu danh sách và lưu lại
 */
export function addProblem(newProb: Partial<PracticeProblem> | GeneratedQuestion | any): PracticeProblem {
  const current = getStoredProblems();
  const normalized = normalizeProblem(newProb);
  const filtered = current.filter((p) => p.id !== normalized.id);
  const updated = [normalized, ...filtered];
  saveProblems(updated);
  return normalized;
}

/**
 * Thêm hàng loạt bài tập mới (ví dụ AI Generator) và lưu lại
 */
export function addProblems(newProbs: (Partial<PracticeProblem> | GeneratedQuestion | any)[]): PracticeProblem[] {
  const current = getStoredProblems();
  const normalized = newProbs.map(normalizeProblem);
  const newIds = new Set(normalized.map((p) => p.id));
  const filtered = current.filter((p) => !newIds.has(p.id));
  const updated = [...normalized, ...filtered];
  saveProblems(updated);
  return normalized;
}

/**
 * Cập nhật bài tập đã có và lưu lại
 */
export function updateProblem(updatedProb: Partial<PracticeProblem> & { id: string }): PracticeProblem {
  const current = getStoredProblems();
  const index = current.findIndex((p) => p.id === updatedProb.id);
  let finalProb: PracticeProblem;
  if (index !== -1) {
    finalProb = normalizeProblem({ ...current[index], ...updatedProb });
    current[index] = finalProb;
  } else {
    finalProb = normalizeProblem(updatedProb);
    current.unshift(finalProb);
  }
  saveProblems(current);
  return finalProb;
}

/**
 * Xóa một bài tập và lưu lại
 */
export function deleteProblem(id: string): void {
  const current = getStoredProblems();
  const updated = current.filter((p) => p.id !== id);
  saveProblems(updated);
}

/**
 * Bật/tắt trạng thái xuất bản (Công khai <-> Ẩn / Draft) của bài tập
 */
export function togglePublicProblem(id: string): PracticeProblem | undefined {
  const current = getStoredProblems();
  const target = current.find((p) => p.id === id);
  if (!target) return undefined;
  const isNowPublic = !(target.isPublic !== false);
  target.isPublic = isNowPublic;
  saveProblems(current);
  return target;
}

/**
 * Tìm bài tập theo ID (hỗ trợ cả bài nháp cho Admin hoặc chỉ bài đã xuất bản cho User)
 */
export function getProblemById(id: string, includeDrafts: boolean = true): PracticeProblem | undefined {
  const pool = includeDrafts ? getStoredProblems() : getPublishedProblems();
  return pool.find((p) => p.id === id);
}

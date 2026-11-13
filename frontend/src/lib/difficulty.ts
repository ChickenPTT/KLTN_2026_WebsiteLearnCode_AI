import type { SkillLevel } from '@/types';

/**
 * 5 Cấp độ kỹ năng / Mức độ khó chuẩn hóa trong hệ thống:
 * Level 1: beginner     ('Mới bắt đầu')
 * Level 2: basic        ('Cơ bản')
 * Level 3: intermediate ('Trung bình')
 * Level 4: advanced     ('Khá')
 * Level 5: expert       ('Nâng cao')
 */
export const SKILL_LEVELS: readonly SkillLevel[] = [
  'beginner',
  'basic',
  'intermediate',
  'advanced',
  'expert',
] as const;

export const DIFFICULTY_LEVEL_NUMBERS: Record<SkillLevel, 1 | 2 | 3 | 4 | 5> = {
  beginner: 1,
  basic: 2,
  intermediate: 3,
  advanced: 4,
  expert: 5,
};

export const DIFFICULTY_LABELS: Record<SkillLevel, string> = {
  beginner: 'Mới bắt đầu',
  basic: 'Cơ bản',
  intermediate: 'Trung bình',
  advanced: 'Khá',
  expert: 'Nâng cao',
};

export const DIFFICULTY_COLORS: Record<SkillLevel, string> = {
  beginner: '#7d8599',
  basic: '#78d39e',
  intermediate: '#5e8dfa',
  advanced: '#f5c95d',
  expert: '#a995ff',
};

/**
 * Kiểm tra xem một giá trị có phải là SkillLevel chuẩn hóa hợp lệ hay không.
 */
export function isValidDifficulty(val?: unknown): val is SkillLevel {
  return typeof val === 'string' && (SKILL_LEVELS as readonly string[]).includes(val);
}

/**
 * Lấy số thứ tự cấp độ (1 -> 5). Trả về null nếu không hợp lệ.
 */
export function getDifficultyLevel(val?: unknown): 1 | 2 | 3 | 4 | 5 | null {
  const normalized = normalizeDifficulty(val);
  return normalized ? DIFFICULTY_LEVEL_NUMBERS[normalized] : null;
}

/**
 * Lấy nhãn tiếng Việt tương ứng. Trả về null nếu không hợp lệ.
 */
export function getDifficultyLabel(val?: unknown): string | null {
  const normalized = normalizeDifficulty(val);
  return normalized ? DIFFICULTY_LABELS[normalized] : null;
}

/**
 * Lấy mã màu tương ứng. Trả về null nếu không hợp lệ.
 */
export function getDifficultyColor(val?: unknown): string | null {
  const normalized = normalizeDifficulty(val);
  return normalized ? DIFFICULTY_COLORS[normalized] : null;
}

// ── Overloads cho normalizeDifficulty ──
export function normalizeDifficulty(diff: unknown, fallback: SkillLevel): SkillLevel;
export function normalizeDifficulty(diff?: unknown, fallback?: null): SkillLevel | null;
export function normalizeDifficulty(diff?: unknown, fallback?: SkillLevel | null): SkillLevel | null;

/**
 * Chuẩn hóa độ khó về 1 trong 5 cấp độ kỹ năng:
 * - Level 1: beginner     (Easy / Dễ)
 * - Level 2: basic        (Medium-dễ / Medium-easy / Cơ bản)
 * - Level 3: intermediate (Medium / Trung bình)
 * - Level 4: advanced     (Medium-khó / Medium-hard / Khá)
 * - Level 5: expert       (Hard / Khó / Nâng cao)
 *
 * ĐẶC BIỆT:
 * - 'Easy' KHÔNG ĐƯỢC ánh xạ thành 'basic' (phải thành 'beginner').
 * - 'Hard' KHÔNG ĐƯỢC ánh xạ thành 'advanced' (phải thành 'expert').
 * - 'Medium-dễ' và 'Medium-khó' được hỗ trợ đầy đủ.
 * - KHÔNG âm thầm biến giá trị không hợp lệ thành 'basic'. Nếu không hợp lệ, trả về null (hoặc fallback nếu được truyền).
 */
export function normalizeDifficulty(diff?: unknown, fallback: SkillLevel | null = null): SkillLevel | null {
  if (diff === null || diff === undefined) {
    return fallback;
  }

  // Hỗ trợ số 1 -> 5
  if (typeof diff === 'number') {
    if (diff === 1) return 'beginner';
    if (diff === 2) return 'basic';
    if (diff === 3) return 'intermediate';
    if (diff === 4) return 'advanced';
    if (diff === 5) return 'expert';
    return fallback;
  }

  if (typeof diff !== 'string') {
    return fallback;
  }

  const raw = diff.trim().toLowerCase();
  if (!raw) {
    return fallback;
  }

  // ── 1. Chuẩn hóa chuỗi (bỏ dấu gạch, khoảng trắng thừa) ──
  const clean = raw.replace(/[_\s]+/g, '-');

  // ── 2. LEVEL 2: basic (Kiểm tra Medium-dễ trước để không bị bắt nhầm bởi Medium) ──
  if (
    clean === 'medium-dễ' ||
    clean === 'medium-de' ||
    clean === 'medium-easy' ||
    clean === 'med-easy' ||
    clean === 'med-de' ||
    clean === 'med-dễ' ||
    clean === 'basic' ||
    clean === 'cơ-bản' ||
    clean === 'co-ban' ||
    raw === 'cơ bản' ||
    raw === 'co ban' ||
    raw === 'coban' ||
    clean === 'level-2' ||
    clean === 'level2' ||
    raw === '2'
  ) {
    return 'basic';
  }

  // ── 3. LEVEL 4: advanced (Kiểm tra Medium-khó trước để không bị bắt nhầm bởi Medium) ──
  if (
    clean === 'medium-khó' ||
    clean === 'medium-kho' ||
    clean === 'medium-hard' ||
    clean === 'med-hard' ||
    clean === 'med-kho' ||
    clean === 'med-khó' ||
    clean === 'advanced' ||
    clean === 'khá' ||
    clean === 'kha' ||
    clean === 'level-4' ||
    clean === 'level4' ||
    raw === '4'
  ) {
    return 'advanced';
  }

  // ── 4. LEVEL 1: beginner (Easy / Dễ) ──
  if (
    clean === 'beginner' ||
    clean === 'easy' ||
    clean === 'dễ' ||
    clean === 'de' ||
    clean === 'mới-bắt-đầu' ||
    clean === 'moi-bat-dau' ||
    raw === 'mới bắt đầu' ||
    raw === 'moi bat dau' ||
    raw === 'moibatdau' ||
    clean === 'level-1' ||
    clean === 'level1' ||
    raw === '1'
  ) {
    return 'beginner';
  }

  // ── 5. LEVEL 3: intermediate (Medium / Trung bình) ──
  if (
    clean === 'intermediate' ||
    clean === 'medium' ||
    clean === 'med' ||
    clean === 'moderate' ||
    clean === 'trung-bình' ||
    clean === 'trung-binh' ||
    raw === 'trung bình' ||
    raw === 'trung binh' ||
    raw === 'trungbinh' ||
    clean === 'level-3' ||
    clean === 'level3' ||
    raw === '3'
  ) {
    return 'intermediate';
  }

  // ── 6. LEVEL 5: expert (Hard / Khó / Nâng cao) ──
  if (
    clean === 'expert' ||
    clean === 'hard' ||
    clean === 'khó' ||
    clean === 'kho' ||
    clean === 'nâng-cao' ||
    clean === 'nang-cao' ||
    raw === 'nâng cao' ||
    raw === 'nang cao' ||
    raw === 'nangcao' ||
    clean === 'level-5' ||
    clean === 'level5' ||
    raw === '5'
  ) {
    return 'expert';
  }

  // Giá trị không hợp lệ: Tuyệt đối KHÔNG âm thầm biến thành 'basic'
  return fallback;
}

/**
 * Hàm kiểm tra và sửa chữa an toàn mức độ khó cho một đối tượng bài tập cũ (localStorage/API)
 * KHÔNG xóa dữ liệu người dùng, chỉ phát hiện và sửa các giá trị bị lưu sai lệch lịch sử.
 */
export function sanitizeStoredProblemDifficulty<T extends { difficulty?: unknown; tags?: unknown; title?: unknown; id?: unknown }>(
  prob: T,
): SkillLevel {
  const rawDiff = prob.difficulty;
  let parsed = normalizeDifficulty(rawDiff);

  // Đối chiếu thêm với tags xem có dấu vết lưu sai do bug cũ ('Easy' -> 'basic', 'Hard' -> 'advanced')
  if (Array.isArray(prob.tags)) {
    const stringTags = prob.tags.filter((t): t is string => typeof t === 'string').map((t) => t.toLowerCase().trim());
    const hasEasyTag = stringTags.some((t) => t === 'easy' || t === 'dễ' || t === 'de' || t === 'beginner');
    const hasHardTag = stringTags.some((t) => t === 'hard' || t === 'khó' || t === 'kho' || t === 'expert');
    const hasMedDeTag = stringTags.some((t) => t.includes('medium-dễ') || t.includes('medium-de') || t.includes('medium-easy'));
    const hasMedKhoTag = stringTags.some((t) => t.includes('medium-khó') || t.includes('medium-kho') || t.includes('medium-hard'));

    if (hasEasyTag && parsed === 'basic') {
      // Dữ liệu cũ bị bug 'Easy' -> 'basic'
      parsed = 'beginner';
    } else if (hasHardTag && parsed === 'advanced') {
      // Dữ liệu cũ bị bug 'Hard' -> 'advanced'
      parsed = 'expert';
    } else if (hasMedDeTag && parsed !== 'basic') {
      parsed = 'basic';
    } else if (hasMedKhoTag && parsed !== 'advanced') {
      parsed = 'advanced';
    }
  }

  if (parsed === null) {
    // Giá trị không hợp lệ: Log cảnh báo rõ ràng để truy vết, không gán ngầm basic
    if (rawDiff !== undefined && rawDiff !== null && String(rawDiff).trim() !== '') {
      console.warn(
        `[DifficultySanitizer] Phát hiện độ khó không hợp lệ "${String(rawDiff)}" tại bài tập "${String(prob.title || prob.id)}". Gán an toàn về mức Level 1 ('beginner') để đảm bảo render.`,
      );
    }
    return 'beginner';
  }

  return parsed;
}

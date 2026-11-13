import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeDifficulty,
  isValidDifficulty,
  getDifficultyLevel,
  getDifficultyLabel,
  getDifficultyColor,
  sanitizeStoredProblemDifficulty,
  SKILL_LEVELS,
} from '@/lib/difficulty';

describe('Đồng bộ & Chuẩn hóa 5 Cấp độ Khó (SkillLevel / Difficulty)', () => {
  // ── 1. LEVEL 1: beginner ──────────────────────────────────────────────
  describe('Level 1: beginner (Easy / Dễ)', () => {
    it('ánh xạ chính xác các biến thể của Level 1 thành beginner', () => {
      const variants = [
        'beginner',
        'Beginner',
        'BEGINNER',
        'easy',
        'Easy',
        'EASY',
        'dễ',
        'Dễ',
        'DỄ',
        'de',
        'De',
        'mới bắt đầu',
        'Mới bắt đầu',
        'MỚI BẮT ĐẦU',
        'moi bat dau',
        'level 1',
        'Level 1',
        'level-1',
        'level1',
        '1',
        1,
      ];

      for (const val of variants) {
        assert.equal(
          normalizeDifficulty(val),
          'beginner',
          `Giá trị "${val}" phải được chuẩn hóa thành "beginner"`,
        );
      }
    });

    it('RÀNG BUỘC CỐT LÕI: Easy TUYỆT ĐỐI KHÔNG được ánh xạ thành basic', () => {
      assert.notEqual(normalizeDifficulty('Easy'), 'basic');
      assert.notEqual(normalizeDifficulty('easy'), 'basic');
      assert.notEqual(normalizeDifficulty('Dễ'), 'basic');
      assert.equal(normalizeDifficulty('Easy'), 'beginner');
      assert.equal(normalizeDifficulty('dễ'), 'beginner');
    });

    it('trả về số cấp độ 1 và nhãn "Mới bắt đầu"', () => {
      assert.equal(getDifficultyLevel('Easy'), 1);
      assert.equal(getDifficultyLevel('beginner'), 1);
      assert.equal(getDifficultyLabel('Easy'), 'Mới bắt đầu');
    });
  });

  // ── 2. LEVEL 2: basic ─────────────────────────────────────────────────
  describe('Level 2: basic (Medium-dễ / Medium-easy / Cơ bản)', () => {
    it('ánh xạ chính xác các biến thể của Level 2 thành basic', () => {
      const variants = [
        'basic',
        'Basic',
        'BASIC',
        'medium-dễ',
        'Medium-dễ',
        'MEDIUM-DỄ',
        'medium dễ',
        'Medium dễ',
        'medium-de',
        'medium de',
        'medium-easy',
        'Medium-easy',
        'medium easy',
        'med-easy',
        'med-de',
        'cơ bản',
        'Cơ bản',
        'CƠ BẢN',
        'co ban',
        'coban',
        'level 2',
        'Level 2',
        'level-2',
        'level2',
        '2',
        2,
      ];

      for (const val of variants) {
        assert.equal(
          normalizeDifficulty(val),
          'basic',
          `Giá trị "${val}" phải được chuẩn hóa thành "basic"`,
        );
      }
    });

    it('RÀNG BUỘC CỐT LÕI: Medium-dễ bắt buộc phải được hỗ trợ đầy đủ', () => {
      assert.equal(normalizeDifficulty('Medium-dễ'), 'basic');
      assert.equal(normalizeDifficulty('medium-dễ'), 'basic');
      assert.equal(normalizeDifficulty('Medium-easy'), 'basic');
    });

    it('trả về số cấp độ 2 và nhãn "Cơ bản"', () => {
      assert.equal(getDifficultyLevel('Medium-dễ'), 2);
      assert.equal(getDifficultyLevel('basic'), 2);
      assert.equal(getDifficultyLabel('Medium-dễ'), 'Cơ bản');
    });
  });

  // ── 3. LEVEL 3: intermediate ──────────────────────────────────────────
  describe('Level 3: intermediate (Medium / Trung bình)', () => {
    it('ánh xạ chính xác các biến thể của Level 3 thành intermediate', () => {
      const variants = [
        'intermediate',
        'Intermediate',
        'INTERMEDIATE',
        'medium',
        'Medium',
        'MEDIUM',
        'trung bình',
        'Trung bình',
        'TRUNG BÌNH',
        'trung binh',
        'trungbinh',
        'moderate',
        'level 3',
        'Level 3',
        'level-3',
        'level3',
        '3',
        3,
      ];

      for (const val of variants) {
        assert.equal(
          normalizeDifficulty(val),
          'intermediate',
          `Giá trị "${val}" phải được chuẩn hóa thành "intermediate"`,
        );
      }
    });

    it('trả về số cấp độ 3 và nhãn "Trung bình"', () => {
      assert.equal(getDifficultyLevel('Medium'), 3);
      assert.equal(getDifficultyLevel('intermediate'), 3);
      assert.equal(getDifficultyLabel('Medium'), 'Trung bình');
    });
  });

  // ── 4. LEVEL 4: advanced ──────────────────────────────────────────────
  describe('Level 4: advanced (Medium-khó / Medium-hard / Khá)', () => {
    it('ánh xạ chính xác các biến thể của Level 4 thành advanced', () => {
      const variants = [
        'advanced',
        'Advanced',
        'ADVANCED',
        'medium-khó',
        'Medium-khó',
        'MEDIUM-KHÓ',
        'medium khó',
        'Medium khó',
        'medium-kho',
        'medium kho',
        'medium-hard',
        'Medium-hard',
        'medium hard',
        'med-hard',
        'med-kho',
        'khá',
        'Khá',
        'KHÁ',
        'kha',
        'level 4',
        'Level 4',
        'level-4',
        'level4',
        '4',
        4,
      ];

      for (const val of variants) {
        assert.equal(
          normalizeDifficulty(val),
          'advanced',
          `Giá trị "${val}" phải được chuẩn hóa thành "advanced"`,
        );
      }
    });

    it('RÀNG BUỘC CỐT LÕI: Medium-khó bắt buộc phải được hỗ trợ đầy đủ', () => {
      assert.equal(normalizeDifficulty('Medium-khó'), 'advanced');
      assert.equal(normalizeDifficulty('medium-khó'), 'advanced');
      assert.equal(normalizeDifficulty('Medium-hard'), 'advanced');
    });

    it('trả về số cấp độ 4 và nhãn "Khá"', () => {
      assert.equal(getDifficultyLevel('Medium-khó'), 4);
      assert.equal(getDifficultyLevel('advanced'), 4);
      assert.equal(getDifficultyLabel('Medium-khó'), 'Khá');
    });
  });

  // ── 5. LEVEL 5: expert ────────────────────────────────────────────────
  describe('Level 5: expert (Hard / Khó / Nâng cao)', () => {
    it('ánh xạ chính xác các biến thể của Level 5 thành expert', () => {
      const variants = [
        'expert',
        'Expert',
        'EXPERT',
        'hard',
        'Hard',
        'HARD',
        'khó',
        'Khó',
        'KHÓ',
        'kho',
        'nâng cao',
        'Nâng cao',
        'NÂNG CAO',
        'nang cao',
        'nangcao',
        'level 5',
        'Level 5',
        'level-5',
        'level5',
        '5',
        5,
      ];

      for (const val of variants) {
        assert.equal(
          normalizeDifficulty(val),
          'expert',
          `Giá trị "${val}" phải được chuẩn hóa thành "expert"`,
        );
      }
    });

    it('RÀNG BUỘC CỐT LÕI: Hard TUYỆT ĐỐI KHÔNG được ánh xạ thành advanced', () => {
      assert.notEqual(normalizeDifficulty('Hard'), 'advanced');
      assert.notEqual(normalizeDifficulty('hard'), 'advanced');
      assert.notEqual(normalizeDifficulty('Khó'), 'advanced');
      assert.equal(normalizeDifficulty('Hard'), 'expert');
      assert.equal(normalizeDifficulty('khó'), 'expert');
    });

    it('trả về số cấp độ 5 và nhãn "Nâng cao"', () => {
      assert.equal(getDifficultyLevel('Hard'), 5);
      assert.equal(getDifficultyLevel('expert'), 5);
      assert.equal(getDifficultyLabel('Hard'), 'Nâng cao');
    });
  });

  // ── 6. CÁC TRƯỜNG HỢP KHÔNG HỢP LỆ (INVALID CASES) ───────────────────
  describe('Xử lý giá trị không hợp lệ (Không âm thầm biến thành basic)', () => {
    it('RÀNG BUỘC CỐT LÕI: Không bao giờ tự ý trả về "basic" cho dữ liệu rác/lỗi', () => {
      const invalidValues = [
        null,
        undefined,
        '',
        '   ',
        'unknown',
        'invalid',
        'random_string',
        'hardcore',
        'extreme',
        'super-easy',
        'abc123',
        0,
        6,
        -1,
        999,
        NaN,
        Infinity,
        {},
        [],
        true,
        false,
      ];

      for (const val of invalidValues) {
        const res = normalizeDifficulty(val);
        assert.equal(
          res,
          null,
          `Giá trị không hợp lệ "${JSON.stringify(val)}" phải trả về null, KHÔNG ĐƯỢC trả về basic`,
        );
      }
    });

    it('hỗ trợ tham số fallback rõ ràng khi người dùng yêu cầu', () => {
      assert.equal(normalizeDifficulty('invalid', 'beginner'), 'beginner');
      assert.equal(normalizeDifficulty(null, 'expert'), 'expert');
      assert.equal(normalizeDifficulty(undefined, 'intermediate'), 'intermediate');
      assert.equal(normalizeDifficulty('unknown', null), null);
    });

    it('isValidDifficulty chỉ chấp nhận chính xác 5 giá trị SkillLevel chuẩn hóa', () => {
      assert.equal(isValidDifficulty('beginner'), true);
      assert.equal(isValidDifficulty('basic'), true);
      assert.equal(isValidDifficulty('intermediate'), true);
      assert.equal(isValidDifficulty('advanced'), true);
      assert.equal(isValidDifficulty('expert'), true);

      // Các chuỗi chưa chuẩn hóa hoặc không hợp lệ phải trả về false
      assert.equal(isValidDifficulty('Easy'), false);
      assert.equal(isValidDifficulty('Hard'), false);
      assert.equal(isValidDifficulty('Medium-dễ'), false);
      assert.equal(isValidDifficulty('invalid'), false);
      assert.equal(isValidDifficulty(null), false);
      assert.equal(isValidDifficulty(undefined), false);
    });

    it('getDifficultyLevel, getDifficultyLabel, getDifficultyColor trả về null khi không hợp lệ', () => {
      assert.equal(getDifficultyLevel('garbage'), null);
      assert.equal(getDifficultyLabel(null), null);
      assert.equal(getDifficultyColor(undefined), null);
    });
  });

  // ── 7. KHÔI PHỤC VÀ SỬA CHỮA DỮ LIỆU CŨ TRONG LOCALSTORAGE ─────────
  describe('Khôi phục và sửa chữa dữ liệu cũ trong localStorage (Không xóa dữ liệu)', () => {
    it('tự động chữa bài tập cũ có difficulty="Easy" thành "beginner"', () => {
      const oldProblem = {
        id: 'old-1',
        title: 'Two Sum Old',
        difficulty: 'Easy',
      };
      assert.equal(sanitizeStoredProblemDifficulty(oldProblem), 'beginner');
    });

    it('tự động chữa bài tập cũ có difficulty="Hard" thành "expert"', () => {
      const oldProblem = {
        id: 'old-2',
        title: 'Merge K Sorted Lists',
        difficulty: 'Hard',
      };
      assert.equal(sanitizeStoredProblemDifficulty(oldProblem), 'expert');
    });

    it('phát hiện và sửa bài tập bị lưu sai thành "basic" do bug cũ khi tags chứa "Easy"', () => {
      const corruptedProblem = {
        id: 'old-3',
        title: 'Valid Palindrome',
        difficulty: 'basic', // Bị bug cũ lưu nhầm
        tags: ['String', 'Easy'],
      };
      assert.equal(sanitizeStoredProblemDifficulty(corruptedProblem), 'beginner');
    });

    it('phát hiện và sửa bài tập bị lưu sai thành "advanced" do bug cũ khi tags chứa "Hard"', () => {
      const corruptedProblem = {
        id: 'old-4',
        title: 'Trapping Rain Water',
        difficulty: 'advanced', // Bị bug cũ lưu nhầm
        tags: ['Array', 'Hard'],
      };
      assert.equal(sanitizeStoredProblemDifficulty(corruptedProblem), 'expert');
    });

    it('phát hiện bài tập có tags chứa "Medium-dễ" chữa thành "basic"', () => {
      const medDeProblem = {
        id: 'old-5',
        title: 'Subarray Sum',
        difficulty: 'unknown',
        tags: ['Array', 'Medium-dễ'],
      };
      assert.equal(sanitizeStoredProblemDifficulty(medDeProblem), 'basic');
    });

    it('phát hiện bài tập có tags chứa "Medium-khó" chữa thành "advanced"', () => {
      const medKhoProblem = {
        id: 'old-6',
        title: 'Word Search',
        difficulty: 'unknown',
        tags: ['Backtracking', 'Medium-khó'],
      };
      assert.equal(sanitizeStoredProblemDifficulty(medKhoProblem), 'advanced');
    });

    it('nếu dữ liệu hoàn toàn không hợp lệ, gán an toàn về mức tối thiểu beginner (Level 1) thay vì basic', () => {
      const brokenProblem = {
        id: 'old-7',
        title: 'Corrupted Problem',
        difficulty: 'completely_broken',
        tags: ['Array'],
      };
      assert.equal(sanitizeStoredProblemDifficulty(brokenProblem), 'beginner');
    });
  });
});

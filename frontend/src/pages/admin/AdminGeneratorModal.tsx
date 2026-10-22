import { useState } from 'react';
import { X, Sliders, Sparkles, FileCode2, RefreshCw } from 'lucide-react';
import { SearchableSelect } from '@/components/SearchableSelect';
import { TOPICS, LEVEL_LABELS, LEVEL_COLORS, type PracticeProblem, type SkillLevel } from '@/types';

interface AdminGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateSuccess: (newProblems: PracticeProblem[]) => void;
}

export type GenMode = 'variant_input_output' | 'new_problem';

export function AdminGeneratorModal({
  isOpen,
  onClose,
  onGenerateSuccess,
}: AdminGeneratorModalProps) {
  const [genTopic, setGenTopic] = useState<string>(TOPICS[0]);
  const [genMode, setGenMode] = useState<GenMode>('variant_input_output');

  // 5 Level percentage distribution
  const [levelPcts, setLevelPcts] = useState<Record<SkillLevel, number>>({
    beginner: 30,
    basic: 30,
    intermediate: 20,
    advanced: 10,
    expert: 10,
  });

  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleLevelChange = (lvl: SkillLevel, val: number) => {
    setLevelPcts((prev) => ({
      ...prev,
      [lvl]: Math.max(0, Math.min(100, val)),
    }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate AI generation delay
    await new Promise((r) => setTimeout(r, 700));

    const now = Date.now();
    const isVariant = genMode === 'variant_input_output';

    const titleText = isVariant
      ? `${genTopic} - Biến thể Input/Testcase Mới`
      : `${genTopic} - Đề thi mới sinh bởi AI`;

    const descText = isVariant
      ? `[Biến thể từ Template] Giữ nguyên cấu trúc bài toán ${genTopic}. Bộ Testcases Input được AI sinh tự động. Cần bấm Nút Test 🧪 để chạy Sandbox sinh Output & kiểm thử.`
      : `[Sáng tác mới AI Engine] Bài toán sinh mới theo kiến trúc chủ đề ${genTopic}. Yêu cầu tối ưu thời gian xử lý và dữ liệu bộ nhớ.`;

    const newProblem: PracticeProblem = {
      id: `ai-gen-${now}`,
      title: titleText,
      topic: genTopic,
      difficulty: 'Easy',
      description: descText,
      examples: [
        {
          input: isVariant ? `nums = [3, 8, 12, 5], k = 15` : `input_data = [10, 25, 40]`,
          output: `Chưa test (Sandbox Pending)`,
          explanation: `Nhấp nút Test (🧪/▶) để biên dịch chạy thử trong Sandbox. Kết quả Output sẽ tự động cập nhật & Verified.`,
        },
      ],
      starterCode: `class Solution {\n    public int solve(int[] nums) {\n        // Viết mã nguồn giải thuật tại đây\n        return 0;\n    }\n}`,
      starterCodes: {
        java: `class Solution {\n    public int solve(int[] nums) {\n        // Viết mã nguồn Java tại đây\n        return 0;\n    }\n}`,
        python: `class Solution:\n    def solve(self, nums: list[int]) -> int:\n        # Viết mã nguồn Python tại đây\n        return 0`,
      },
      language: 'java',
      constraints: ['1 ≤ N ≤ 10⁵', 'Thời gian chạy Sandbox < 1000ms'],
      isPublic: false, // Mặc định là Bản nháp / Ẩn cho đến khi chạy Sandbox kiểm thử thành công
      isAiGenerated: true,
      isVerified: false, // Chưa test Sandbox
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setLoading(false);
    onGenerateSuccess([newProblem]);
    onClose();
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="dialog-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '94%',
          textAlign: 'left',
          padding: '32px 36px',
        }}
      >
        <button className="dialog-close" onClick={onClose} aria-label="Đóng">
          <X size={18} />
        </button>

        <div style={{ marginBottom: '24px' }}>
          <h3
            className="dialog-title admin-modal-title"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '20px',
              margin: '0 0 6px',
              textAlign: 'left',
            }}
          >
            <Sliders size={22} style={{ color: '#5e8dfa' }} /> Thiết Lập Tiêu Chí Sinh Đề AI
          </h3>
          <p className="admin-modal-sub" style={{ margin: 0 }}>
            Cấu hình phương thức và tỷ lệ độ khó theo 5 cấp độ kỹ năng để AI tự động sinh đề thi thực hành.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="profile-form" style={{ gap: '20px' }}>
          {/* 1. Chọn Chủ Đề Chính */}
          <div className="auth-field">
            <span className="auth-label" style={{ fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>
              Chủ đề bài tập chính
            </span>
            <SearchableSelect
              options={TOPICS.map((t) => ({ label: `Chủ đề: ${t}`, value: t }))}
              value={genTopic}
              onChange={(val) => setGenTopic(val)}
              showSearch={true}
            />
          </div>

          {/* 2. Chọn Cách thức Generate AI */}
          <div className="auth-field">
            <span className="auth-label" style={{ fontSize: '13.5px', fontWeight: 600 }}>
              Phương thức sinh đề AI (Generation Mode)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
              <div
                onClick={() => setGenMode('variant_input_output')}
                className={`gen-mode-card ${genMode === 'variant_input_output' ? 'active-blue' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <FileCode2 size={16} style={{ color: genMode === 'variant_input_output' ? '#5e8dfa' : '#7d8599' }} />
                  <strong className="gen-mode-title-blue">
                    Biến thể theo Bài Mẫu
                  </strong>
                </div>
                <p className="gen-mode-desc">
                  Giữ nguyên bài toán gốc từ Template, AI chỉ cập nhật & đổi mới dữ liệu Input/Output mẫu.
                </p>
              </div>

              <div
                onClick={() => setGenMode('new_problem')}
                className={`gen-mode-card ${genMode === 'new_problem' ? 'active-purple' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <RefreshCw size={16} style={{ color: genMode === 'new_problem' ? '#a995ff' : '#7d8599' }} />
                  <strong className="gen-mode-title-purple">
                    Tạo Đề Mới Hoàn Toàn
                  </strong>
                </div>
                <p className="gen-mode-desc">
                  Dựa theo chủ đề Template, AI sáng tác bài toán, yêu cầu và thuật toán mới hoàn toàn.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Tỷ lệ phân bổ độ khó theo 5 Level bài tập */}
          <div className="gen-levels-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span className="auth-label" style={{ fontSize: '13.5px', fontWeight: 600 }}>
                Tỷ lệ phân bổ độ khó theo 5 Cấp độ Kỹ năng (%)
              </span>
              <span style={{ fontSize: '12px', color: '#5e8dfa', fontWeight: 600 }}>
                Tổng: {Object.values(levelPcts).reduce((a, b) => a + b, 0)}%
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {(['beginner', 'basic', 'intermediate', 'advanced', 'expert'] as SkillLevel[]).map((lvl) => (
                <div key={lvl} style={{ textAlign: 'center' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: LEVEL_COLORS[lvl],
                      display: 'block',
                      marginBottom: '6px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {LEVEL_LABELS[lvl]}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={levelPcts[lvl]}
                    onChange={(e) => handleLevelChange(lvl, Number(e.target.value))}
                    className="gen-level-input"
                    style={{
                      borderColor: `${LEVEL_COLORS[lvl]}44`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="dialog-actions" style={{ marginTop: '12px', gap: '12px' }}>
            <button
              type="button"
              className="dialog-cancel"
              onClick={onClose}
              disabled={loading}
              style={{ height: '42px', fontSize: '14px' }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="assessment-primary"
              disabled={loading}
              style={{
                flex: 1,
                justifyContent: 'center',
                height: '42px',
                fontSize: '14.5px',
                gap: '8px',
                background: 'linear-gradient(135deg, #4b78f5 0%, #764ba2 100%)',
                borderColor: 'transparent',
              }}
            >
              {loading ? (
                'Đang thực thi AI Generator...'
              ) : (
                <>
                  <Sparkles size={18} /> Sinh bộ đề AI ngay
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
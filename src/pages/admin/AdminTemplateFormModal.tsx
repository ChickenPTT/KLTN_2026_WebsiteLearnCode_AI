import { useState } from 'react';
import { X, ShieldAlert, SlidersHorizontal } from 'lucide-react';
import { SearchableSelect } from '@/components/SearchableSelect';
import { TOPICS, LEVEL_LABELS, type SkillLevel } from '@/types';
import type { SampleTemplate } from './admin.types';

interface AdminTemplateFormModalProps {
  templateToEdit?: SampleTemplate | null;
  onClose: () => void;
  onSubmit: (tplData: Omit<SampleTemplate, 'id' | 'updatedAt'>) => void;
}

export function AdminTemplateFormModal({
  templateToEdit,
  onClose,
  onSubmit,
}: AdminTemplateFormModalProps) {
  const [title, setTitle] = useState(templateToEdit?.title ?? '');
  const [topic, setTopic] = useState(templateToEdit?.topic ?? TOPICS[0]);
  const [level, setLevel] = useState<SkillLevel>(templateToEdit?.level ?? 'basic');
  const [description, setDescription] = useState(templateToEdit?.description ?? '');
  const [starterCode, setStarterCode] = useState(
    templateToEdit?.starterCode ??
      `function solution(input) {\n  // Code mẫu khởi tạo cho bài tập\n  return null;\n}`
  );

  // 4 New Constraint Fields for AI Random generation
  const [minLength, setMinLength] = useState<string>(
    templateToEdit?.minLength !== undefined ? String(templateToEdit.minLength) : ''
  );
  const [maxLength, setMaxLength] = useState<string>(
    templateToEdit?.maxLength !== undefined ? String(templateToEdit.maxLength) : ''
  );
  const [minValue, setMinValue] = useState<string>(
    templateToEdit?.minValue !== undefined ? String(templateToEdit.minValue) : ''
  );
  const [maxValue, setMaxValue] = useState<string>(
    templateToEdit?.maxValue !== undefined ? String(templateToEdit.maxValue) : ''
  );

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 3) {
      setError('Tên bài tập mẫu phải có ít nhất 3 ký tự.');
      return;
    }
    if (!description.trim()) {
      setError('Vui lòng nhập mô tả cho bài tập mẫu.');
      return;
    }
    if (!starterCode.trim()) {
      setError('Vui lòng nhập mã khởi tạo (starter code).');
      return;
    }

    const minLenNum = minLength.trim() !== '' ? Number(minLength) : undefined;
    const maxLenNum = maxLength.trim() !== '' ? Number(maxLength) : undefined;
    const minValNum = minValue.trim() !== '' ? Number(minValue) : undefined;
    const maxValNum = maxValue.trim() !== '' ? Number(maxValue) : undefined;

    if (minLenNum !== undefined && maxLenNum !== undefined && minLenNum > maxLenNum) {
      setError('Số lượng tối thiểu của mảng/chuỗi không được lớn hơn số lượng tối đa.');
      return;
    }
    if (minValNum !== undefined && maxValNum !== undefined && minValNum > maxValNum) {
      setError('Giá trị nhỏ nhất của phần tử không được lớn hơn giá trị lớn nhất.');
      return;
    }

    onSubmit({
      title: title.trim(),
      topic,
      level,
      description: description.trim(),
      starterCode: starterCode.trim(),
      minLength: minLenNum,
      maxLength: maxLenNum,
      minValue: minValNum,
      maxValue: maxValNum,
    });
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="dialog-box"
        onClick={(e) => e.stopPropagation()}
        style={{ textAlign: 'left', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button className="dialog-close" onClick={onClose}>
          <X size={18} />
        </button>
        <h3 className="dialog-title" style={{ marginBottom: '16px' }}>
          {templateToEdit ? 'Chỉnh sửa Template Mẫu' : 'Tạo Template Mẫu Mới'}
        </h3>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '8px 12px', marginBottom: '14px', color: '#f87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label className="auth-field">
            <span className="auth-label">Tên bài tập mẫu</span>
            <input
              type="text"
              placeholder="Ví dụ: Tìm hai số có tổng bằng Target..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="admin-input"
              required
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="auth-field">
              <span className="auth-label" style={{ marginBottom: '6px' }}>Chủ đề (Topic)</span>
              <SearchableSelect
                options={TOPICS.map((t) => ({ label: t, value: t }))}
                value={topic}
                onChange={(val) => setTopic(val)}
                showSearch={true}
              />
            </div>

            <div className="auth-field">
              <span className="auth-label" style={{ marginBottom: '6px' }}>Trình độ (Level)</span>
              <SearchableSelect
                options={[
                  { label: `${LEVEL_LABELS.beginner} (Mức 1)`, value: 'beginner' },
                  { label: `${LEVEL_LABELS.basic} (Mức 2)`, value: 'basic' },
                  { label: `${LEVEL_LABELS.intermediate} (Mức 3)`, value: 'intermediate' },
                  { label: `${LEVEL_LABELS.advanced} (Mức 4)`, value: 'advanced' },
                  { label: `${LEVEL_LABELS.expert} (Mức 5)`, value: 'expert' },
                ]}
                value={level}
                onChange={(val) => setLevel(val as SkillLevel)}
                showSearch={false}
              />
            </div>
          </div>

          <label className="auth-field">
            <span className="auth-label">Mô tả bài tập mẫu</span>
            <textarea
              rows={2}
              placeholder="Mô tả phạm vi kiến thức và yêu cầu giải thuật..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="admin-input"
              style={{ resize: 'vertical' }}
              required
            />
          </label>

          {/* ===== 4 RÀNG BUỘC KÍCH THƯỚC & GIÁ TRỊ (KHI RANDOM ĐỀ MỚI) ===== */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#60a5fa' }}>
              <SlidersHorizontal size={16} /> Thông số ràng buộc sinh dữ liệu ngẫu nhiên (Random Constraints)
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
              💡 Hệ thống sẽ dựa trên 4 chỉ số này để khi sinh (random) đề bài mới, số lượng phần tử và các giá trị trong mảng/chuỗi luôn nằm chuẩn trong khoảng đã thiết lập.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '2px' }}>
              <label className="auth-field">
                <span className="auth-label" style={{ fontSize: '12px' }}>Số lượng tối thiểu của mảng/chuỗi</span>
                <input
                  type="number"
                  placeholder="Ví dụ: 1"
                  value={minLength}
                  onChange={(e) => setMinLength(e.target.value)}
                  className="admin-input"
                />
              </label>

              <label className="auth-field">
                <span className="auth-label" style={{ fontSize: '12px' }}>Số lượng tối đa của mảng/chuỗi</span>
                <input
                  type="number"
                  placeholder="Ví dụ: 100"
                  value={maxLength}
                  onChange={(e) => setMaxLength(e.target.value)}
                  className="admin-input"
                />
              </label>

              <label className="auth-field">
                <span className="auth-label" style={{ fontSize: '12px' }}>Giá trị nhỏ nhất của phần tử (Min Value)</span>
                <input
                  type="number"
                  placeholder="Ví dụ: -100"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  className="admin-input"
                />
              </label>

              <label className="auth-field">
                <span className="auth-label" style={{ fontSize: '12px' }}>Giá trị lớn nhất của phần tử (Max Value)</span>
                <input
                  type="number"
                  placeholder="Ví dụ: 1000"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  className="admin-input"
                />
              </label>
            </div>
          </div>

          <label className="auth-field">
            <span className="auth-label">Mã khởi tạo mẫu (Starter Code)</span>
            <textarea
              rows={4}
              placeholder="function solution(input) { ... }"
              value={starterCode}
              onChange={(e) => setStarterCode(e.target.value)}
              className="admin-input"
              style={{ fontFamily: 'monospace', fontSize: '13px', resize: 'vertical' }}
              required
            />
          </label>

          <div className="dialog-actions" style={{ marginTop: '14px' }}>
            <button type="button" className="dialog-cancel" onClick={onClose}>
              Huỷ
            </button>
            <button type="submit" className="dialog-confirm primary">
              {templateToEdit ? 'Lưu cập nhật' : 'Tạo Template mẫu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

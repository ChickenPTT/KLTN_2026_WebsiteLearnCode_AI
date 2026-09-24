import { useState } from 'react';
import { X, FileSpreadsheet, Download, Upload, CheckCircle2 } from 'lucide-react';
import type { SampleTemplate } from './admin.types';

interface AdminImportExcelModalProps {
  onClose: () => void;
  onImport: (importedTemplates: SampleTemplate[]) => void;
}

export function AdminImportExcelModal({
  onClose,
  onImport,
}: AdminImportExcelModalProps) {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<SampleTemplate[] | null>(null);

  const handleSimulateFileSelect = (fileName: string) => {
    setSelectedFileName(fileName);
    setIsParsing(true);
    setTimeout(() => {
      // Mock parsing 2 sample templates from Excel/JSON file
      const mockImported: SampleTemplate[] = [
        {
          id: `tpl-imp-${Date.now()}-1`,
          title: 'Bài mẫu Import #1: Chuỗi Anagram (Kỹ thuật Hash Table)',
          topic: 'Hash Table',
          level: 'basic',
          description: 'Kiểm tra xem chuỗi t có phải là chuỗi Anagram sắp đặt lại từ chuỗi s hay không.',
          starterCode: 'function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const count = {};\n  for (let c of s) count[c] = (count[c] || 0) + 1;\n  for (let c of t) {\n    if (!count[c]) return false;\n    count[c]--;\n  }\n  return true;\n}',
          sampleInput: 's = "anagram", t = "nagaram"',
          sampleOutput: 'true',
          updatedAt: new Date().toLocaleDateString('vi-VN'),
        },
        {
          id: `tpl-imp-${Date.now()}-2`,
          title: 'Bài mẫu Import #2: Tìm kiếm số bị thiếu trong mảng (Missing Number)',
          topic: 'Array',
          level: 'beginner',
          description: 'Bài mẫu nhập môn: Cho mảng chứa n số phân biệt từ 0 đến n, hãy tìm số duy nhất bị thiếu.',
          starterCode: 'function missingNumber(nums) {\n  const n = nums.length;\n  const expectedSum = (n * (n + 1)) / 2;\n  const actualSum = nums.reduce((acc, curr) => acc + curr, 0);\n  return expectedSum - actualSum;\n}',
          sampleInput: 'nums = [3,0,1]',
          sampleOutput: '2',
          updatedAt: new Date().toLocaleDateString('vi-VN'),
        },
      ];
      setParsedPreview(mockImported);
      setIsParsing(false);
    }, 800);
  };

  const handleConfirmImport = () => {
    if (!parsedPreview) return;
    onImport(parsedPreview);
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'left', maxWidth: '640px' }}>
        <button className="dialog-close" onClick={onClose}>
          <X size={18} />
        </button>
        <h3 className="dialog-title" style={{ marginBottom: '6px' }}>Import Template từ file Excel / JSON</h3>
        <p style={{ fontSize: '13.5px', color: '#7d8599', margin: '0 0 20px' }}>
          Tải file danh sách bài tập mẫu định dạng Excel (`.xlsx`, `.csv`) hoặc `.json` để nhập hàng loạt vào hệ thống.
        </p>

        {/* Upload Zone */}
        {!parsedPreview ? (
          <div>
            <div
              className="excel-upload-zone"
              onClick={() => handleSimulateFileSelect('danh_sach_template_mau_2026.xlsx')}
            >
              <Upload size={36} style={{ color: '#5e8dfa', marginBottom: '10px' }} />
              <strong className="excel-upload-title">
                {selectedFileName ?? 'Nhấp để chọn file Excel / JSON từ máy tính'}
              </strong>
              <span className="excel-upload-sub">
                Hỗ trợ các định dạng: `.xlsx`, `.csv`, `.json` (Dung lượng tối đa 10MB)
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="history-view-btn"
                onClick={() => handleSimulateFileSelect('template_sample_excel.xlsx')}
              >
                <Download size={14} /> Tải file Excel mẫu (.xlsx)
              </button>

              <button
                type="button"
                className="dialog-cancel"
                onClick={onClose}
              >
                Huỷ
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ background: 'rgba(120,211,158,0.1)', border: '1px solid rgba(120,211,158,0.25)', padding: '12px 14px', borderRadius: '10px', color: '#78d39e', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CheckCircle2 size={16} /> Đọc file thành công! Tìm thấy <strong>{parsedPreview.length} bài tập mẫu</strong> sẵn sàng nhập.
            </div>

            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', paddingRight: '4px' }}>
              {parsedPreview.map((item, idx) => (
                <div key={idx} className="excel-preview-card">
                  <strong className="excel-preview-title">
                    {item.title}
                  </strong>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#7d8599' }}>
                    <span>Chủ đề: <strong style={{ color: '#5e8dfa' }}>{item.topic}</strong></span>
                    <span>Trình độ: <strong style={{ color: '#78d39e' }}>{item.level}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            <div className="dialog-actions" style={{ justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="dialog-cancel"
                onClick={() => setParsedPreview(null)}
              >
                Chọn file khác
              </button>
              <button
                type="button"
                className="dialog-confirm primary"
                onClick={handleConfirmImport}
              >
                Import {parsedPreview.length} bài mẫu vào hệ thống
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

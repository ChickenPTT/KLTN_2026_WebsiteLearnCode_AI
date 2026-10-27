import { useState } from 'react';
import { X, Code2, Edit3, Trash2, Layers } from 'lucide-react';
import { LEVEL_COLORS, LEVEL_LABELS } from '@/types';
import type { SampleTemplate } from './admin.types';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface AdminTemplateDetailModalProps {
  template: SampleTemplate;
  onClose: () => void;
  onEdit: (tpl: SampleTemplate) => void;
  onDelete: (id: string) => void;
}

export function AdminTemplateDetailModal({
  template,
  onClose,
  onEdit,
  onDelete,
}: AdminTemplateDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="history-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px' }}
      >
        <button className="dialog-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="history-modal-header">
          <div className="history-modal-title-row">
            <h2>{template.title}</h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="practice-topic-tag">
                <Layers size={12} /> {template.topic}
              </span>
              <span
                className="profile-role-badge"
                style={{
                  background: `${LEVEL_COLORS[template.level]}18`,
                  color: LEVEL_COLORS[template.level],
                  borderColor: `${LEVEL_COLORS[template.level]}33`,
                }}
              >
                {LEVEL_LABELS[template.level]}
              </span>
            </div>
          </div>
          <p className="history-modal-meta">
            ID: <strong>{template.id}</strong> • Cập nhật lần cuối: <strong>{template.updatedAt}</strong>
          </p>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <h4 className="tpl-detail-heading">Mô tả bài tập mẫu</h4>
          <p className="tpl-detail-desc-box">
            {template.description}
          </p>
        </div>
        {/* Random Generation Constraints */}
        {(template.minLength !== undefined || template.maxLength !== undefined || template.minValue !== undefined || template.maxValue !== undefined) && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '20px'
          }}>
            <h4 className="tpl-detail-heading" style={{ margin: '0 0 10px', color: '#60a5fa', fontSize: '13px' }}>
              Ràng buộc sinh dữ liệu ngẫu nhiên (Random Constraints)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Số lượng tối thiểu</span>
                <strong style={{ fontSize: '13px', color: '#e2e8f0' }}>{template.minLength ?? 'Chưa đặt'}</strong>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Số lượng tối đa</span>
                <strong style={{ fontSize: '13px', color: '#e2e8f0' }}>{template.maxLength ?? 'Chưa đặt'}</strong>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Giá trị nhỏ nhất</span>
                <strong style={{ fontSize: '13px', color: '#e2e8f0' }}>{template.minValue ?? 'Chưa đặt'}</strong>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Giá trị lớn nhất</span>
                <strong style={{ fontSize: '13px', color: '#e2e8f0' }}>{template.maxValue ?? 'Chưa đặt'}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Starter Code Block */}
        <div className="history-code-block" style={{ marginBottom: '24px', padding: '16px' }}>
          <h4 className="tpl-detail-heading" style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code2 size={16} style={{ color: '#5e8dfa' }} /> Mã khởi tạo mẫu (Starter Code)
          </h4>
          <pre className="gen-code-preview" style={{ padding: '14px', borderRadius: '8px', overflowX: 'auto' }}>
            <code>{template.starterCode}</code>
          </pre>
        </div>

        {/* Actions */}
        <div className="dialog-actions" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="history-view-btn"
            style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)', padding: '10px 18px' }}
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={15} /> Xóa Template
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="dialog-cancel" onClick={onClose}>
              Đóng
            </button>
            <button
              type="button"
              className="dialog-confirm primary"
              onClick={() => onEdit(template)}
            >
              <Edit3 size={15} /> Chỉnh sửa Template
            </button>
          </div>
        </div>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Xóa Template bài mẫu?"
          message={`Bạn có chắc chắn muốn xóa bài mẫu "${template.title}" không? Thao tác này không thể hoàn tác.`}
          confirmLabel="Xác nhận xóa"
          cancelLabel="Hủy bỏ"
          variant="danger"
          onConfirm={() => {
            setShowDeleteConfirm(false);
            onDelete(template.id);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
}

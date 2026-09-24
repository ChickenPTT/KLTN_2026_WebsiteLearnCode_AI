import { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, Flame, Trash2 } from 'lucide-react';
import { LEVEL_COLORS, LEVEL_LABELS } from '@/types';
import { DEFAULT_TOPIC_STATS, type UserRecord } from './admin.types';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface AdminUserDetailModalProps {
  userRecord: UserRecord;
  onClose: () => void;
  onDeleteUser: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onSaveUserDetail: (updatedData: { name: string; email: string; role: 'student' | 'teacher' | 'admin' }) => boolean;
}

export function AdminUserDetailModal({
  userRecord,
  onClose,
  onDeleteUser,
  onToggleStatus,
  onSaveUserDetail,
}: AdminUserDetailModalProps) {
  const [editName, setEditName] = useState(userRecord.name);
  const [editEmail, setEditEmail] = useState(userRecord.email);
  const [editRole, setEditRole] = useState<'student' | 'teacher' | 'admin'>(userRecord.role);
  const [editUserError, setEditUserError] = useState<string | null>(null);
  const [editUserSaved, setEditUserSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditUserError(null);

    if (editName.trim().length < 2) {
      setEditUserError('Họ và tên phải có ít nhất 2 ký tự.');
      return;
    }
    if (!validateEmail(editEmail)) {
      setEditUserError('Định dạng email không hợp lệ.');
      return;
    }

    const success = onSaveUserDetail({
      name: editName.trim(),
      email: editEmail.trim().toLowerCase(),
      role: editRole,
    });

    if (success) {
      setEditUserSaved(true);
      setTimeout(() => setEditUserSaved(false), 2500);
    }
  };

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
            <h2>Chi tiết tài khoản người dùng</h2>
            {userRecord.role === 'admin' ? (
              <span className="profile-role-badge" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>
                Quản trị viên
              </span>
            ) : userRecord.role === 'teacher' ? (
              <span className="profile-role-badge" style={{ background: 'rgba(169,149,255,0.12)', color: '#a995ff', borderColor: 'rgba(169,149,255,0.3)' }}>
                Giảng viên
              </span>
            ) : (
              <span className="profile-role-badge">Sinh viên</span>
            )}
          </div>
          <p className="history-modal-meta">
            ID: <strong>{userRecord.id}</strong> • Ngày tham gia: <strong>{userRecord.joinDate}</strong> • Đã giải: <strong>{userRecord.solvedCount} bài</strong>
          </p>
        </div>

        {/* Error & Success Notification Banners */}
        {editUserError && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#f87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} /> {editUserError}
          </div>
        )}
        {editUserSaved && (
          <div style={{ background: 'rgba(120,211,158,0.12)', border: '1px solid rgba(120,211,158,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#78d39e', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} /> Đã cập nhật thông tin thành công!
          </div>
        )}

        {/* Editable Form Fields */}
        <form onSubmit={handleFormSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '24px' }}>
          <label className="auth-field">
            <span className="auth-label">Họ và tên</span>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="admin-input"
              required
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="admin-input"
              required
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Vai trò</span>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as any)}
              className="admin-select"
            >
              <option value="student">Sinh viên</option>
              <option value="teacher">Giảng viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </label>
        </form>

        {/* Topic Level Statistics */}
        <div className="history-code-block" style={{ marginBottom: '20px', padding: '16px' }}>
          <h4 style={{ margin: '0 0 14px', fontSize: '14px', color: '#c8d0e8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={16} className="text-yellow" /> Thống kê trình độ theo từng chủ đề của người dùng
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(userRecord.topicStats ?? DEFAULT_TOPIC_STATS).map((t) => (
              <div key={t.topic} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 110px 90px', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <span style={{ color: '#9ba5bf', fontWeight: 500 }}>{t.topic}</span>
                <div className="topic-progress-track">
                  <div
                    className="topic-progress-fill"
                    style={{
                      width: t.level === 'expert' ? '100%' : t.level === 'advanced' ? '80%' : t.level === 'intermediate' ? '60%' : t.level === 'basic' ? '40%' : '20%',
                      background: LEVEL_COLORS[t.level],
                    }}
                  />
                </div>
                <span style={{ color: LEVEL_COLORS[t.level], fontWeight: 600, fontSize: '12px' }}>
                  {LEVEL_LABELS[t.level]}
                </span>
                <span style={{ color: '#888f9c', fontSize: '12px', textAlign: 'right' }}>
                  {t.solvedCount} bài giải
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="dialog-actions" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="history-view-btn"
            style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)', padding: '10px 18px' }}
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={15} /> Xóa người dùng này
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="dialog-cancel"
              onClick={onClose}
            >
              Đóng
            </button>
            <button
              type="button"
              className="dialog-cancel"
              onClick={() => onToggleStatus(userRecord.id)}
            >
              {userRecord.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            </button>
            <button
              type="button"
              className="dialog-confirm primary"
              onClick={handleFormSubmit}
            >
              Lưu chỉnh sửa
            </button>
          </div>
        </div>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Xóa người dùng?"
          message={`Bạn có chắc chắn muốn xóa tài khoản "${userRecord.name}" (${userRecord.email}) khỏi hệ thống không?`}
          confirmLabel="Xác nhận xóa"
          cancelLabel="Hủy bỏ"
          variant="danger"
          onConfirm={() => {
            setShowDeleteConfirm(false);
            onDeleteUser(userRecord.id);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
}

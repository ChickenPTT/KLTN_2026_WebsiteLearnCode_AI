import { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import type { UserRecord } from './admin.types';

interface AdminAddUserModalProps {
  existingUsers: UserRecord[];
  onClose: () => void;
  onAddUser: (user: { name: string; email: string; role: 'student' | 'teacher' | 'admin' }) => void;
}

export function AdminAddUserModal({
  existingUsers,
  onClose,
  onAddUser,
}: AdminAddUserModalProps) {
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [addUserError, setAddUserError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError(null);

    if (newUserName.trim().length < 2) {
      setAddUserError('Họ và tên phải có ít nhất 2 ký tự.');
      return;
    }
    if (!validateEmail(newUserEmail)) {
      setAddUserError('Định dạng email không hợp lệ (ví dụ: name@domain.com).');
      return;
    }
    if (existingUsers.some((u) => u.email.toLowerCase() === newUserEmail.trim().toLowerCase())) {
      setAddUserError('Email này đã tồn tại trong hệ thống.');
      return;
    }

    onAddUser({
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
    });
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'left' }}>
        <button className="dialog-close" onClick={onClose}>
          <X size={18} />
        </button>
        <h3 className="dialog-title" style={{ marginBottom: '16px' }}>Thêm người dùng mới</h3>

        {addUserError && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '8px 12px', marginBottom: '14px', color: '#f87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={15} /> {addUserError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <label className="auth-field">
            <span className="auth-label">Họ và tên</span>
            <input
              type="text"
              placeholder="Nguyễn Văn B"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="admin-input"
              required
            />
          </label>
          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input
              type="email"
              placeholder="user@example.com"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="admin-input"
              required
            />
          </label>
          <label className="auth-field">
            <span className="auth-label">Vai trò</span>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as any)}
              className="admin-select"
            >
              <option value="student">Sinh viên</option>
              <option value="teacher">Giảng viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </label>
          <div className="dialog-actions" style={{ marginTop: '20px' }}>
            <button type="button" className="dialog-cancel" onClick={onClose}>
              Huỷ
            </button>
            <button type="submit" className="dialog-confirm primary">
              Tạo người dùng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

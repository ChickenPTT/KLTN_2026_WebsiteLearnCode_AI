import { useState } from 'react';
import { Search, Filter, UserPlus, Eye, Trash2, ChevronLeft, ChevronRight, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { UserRecord } from './admin.types';

interface AdminUsersTabProps {
  users: UserRecord[];
  onOpenAddUserModal: () => void;
  onOpenUserDetail: (u: UserRecord) => void;
  onToggleStatus: (id: string) => void;
  onDeleteUser: (id: string) => void;
}

export function AdminUsersTab({
  users,
  onOpenAddUserModal,
  onOpenUserDetail,
  onToggleStatus,
  onDeleteUser,
}: AdminUsersTabProps) {
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');
  const [userPage, setUserPage] = useState(1);
  const USERS_PER_PAGE = 5;

  // Confirmation Modals State
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);
  const [togglingUser, setTogglingUser] = useState<UserRecord | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * USERS_PER_PAGE,
    userPage * USERS_PER_PAGE,
  );

  return (
    <div className="admin-tab-content">
      {/* 1. Delete User Confirmation Modal */}
      {deletingUser && (
        <div className="dialog-overlay" onClick={() => setDeletingUser(null)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-icon danger">
              <AlertTriangle size={28} />
            </div>
            <h3 className="dialog-title">Xóa tài khoản người dùng?</h3>
            <p className="dialog-message">
              Bạn có chắc chắn muốn xóa tài khoản của <strong>{deletingUser.name}</strong> ({deletingUser.email}) khỏi hệ thống không?
            </p>
            <div className="dialog-actions">
              <button
                className="dialog-cancel"
                onClick={() => setDeletingUser(null)}
              >
                Hủy bỏ
              </button>
              <button
                className="dialog-confirm danger"
                onClick={() => {
                  onDeleteUser(deletingUser.id);
                  setDeletingUser(null);
                }}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Toggle Status Confirmation Modal */}
      {togglingUser && (
        <div className="dialog-overlay" onClick={() => setTogglingUser(null)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-icon primary">
              <ShieldAlert size={28} />
            </div>
            <h3 className="dialog-title">
              {togglingUser.status === 'active' ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?'}
            </h3>
            <p className="dialog-message">
              Bạn có chắc chắn muốn {togglingUser.status === 'active' ? 'tạm khóa' : 'kích hoạt lại'} tài khoản của <strong>{togglingUser.name}</strong> không?
            </p>
            <div className="dialog-actions">
              <button
                className="dialog-cancel"
                onClick={() => setTogglingUser(null)}
              >
                Hủy bỏ
              </button>
              <button
                className="dialog-confirm primary"
                onClick={() => {
                  onToggleStatus(togglingUser.id);
                  setTogglingUser(null);
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-header-row">
        <div>
          <h1 className="admin-page-title">Quản lý người dùng</h1>
          <p className="admin-page-sub">
            Quản lý danh sách sinh viên, giảng viên và phân quyền tài khoản hệ thống.
          </p>
        </div>
        <button className="assessment-primary" onClick={onOpenAddUserModal}>
          <UserPlus size={16} /> Thêm người dùng mới
        </button>
      </div>

      <div className="history-filter-bar" style={{ marginBottom: '24px' }}>
        <div className="history-search-wrap">
          <Search size={16} className="history-search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={userSearch}
            onChange={(e) => {
              setUserSearch(e.target.value);
              setUserPage(1);
            }}
          />
        </div>

        <div className="history-select-wrap">
          <Filter size={15} />
          <select
            value={userRoleFilter}
            onChange={(e) => {
              setUserRoleFilter(e.target.value as any);
              setUserPage(1);
            }}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="student">Sinh viên</option>
            <option value="teacher">Giảng viên</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>
      </div>

      <div className="history-table-card">
        <table className="history-table full-history-table">
          <thead>
            <tr>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Trạng thái tài khoản</th>
              <th>Ngày tham gia</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((u) => (
                <tr key={u.id} onClick={() => onOpenUserDetail(u)} style={{ cursor: 'pointer' }}>
                  <td className="history-problem">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="user-avatar-sm" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                        {u.name[0].toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#888f9c' }}>{u.email}</td>
                  <td>
                    {/* Toggle Switch UI cho trạng thái */}
                    <button
                      type="button"
                      className={`admin-toggle-switch ${u.status === 'active' ? 'is-on' : 'is-off'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTogglingUser(u);
                      }}
                      title={u.status === 'active' ? 'Click để khóa tài khoản' : 'Click để mở khóa tài khoản'}
                    >
                      <span className="toggle-slider" />
                      <span className="toggle-label">{u.status === 'active' ? 'Hoạt động' : 'Đã khóa'}</span>
                    </button>
                  </td>
                  <td className="history-time">{u.joinDate}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        className="history-view-btn"
                        onClick={() => onOpenUserDetail(u)}
                        title="Xem chi tiết người dùng"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className="history-view-btn"
                        style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)' }}
                        onClick={() => setDeletingUser(u)}
                        title="Xóa tài khoản"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#7d8599' }}>
                  Không tìm thấy người dùng nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ── thanh Phân trang (Pagination) ── */}
        <div className="admin-pagination-bar">
          <span className="pagination-info">
            Hiển thị {filteredUsers.length > 0 ? (userPage - 1) * USERS_PER_PAGE + 1 : 0} -{' '}
            {Math.min(userPage * USERS_PER_PAGE, filteredUsers.length)} trên tổng số {filteredUsers.length} người dùng
          </span>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={userPage === 1}
              onClick={() => setUserPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} /> Trước
            </button>

            {Array.from({ length: totalUserPages }).map((_, i) => (
              <button
                key={i + 1}
                className={`pagination-num ${userPage === i + 1 ? 'is-active' : ''}`}
                onClick={() => setUserPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="pagination-btn"
              disabled={userPage === totalUserPages}
              onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
            >
              Tiếp <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

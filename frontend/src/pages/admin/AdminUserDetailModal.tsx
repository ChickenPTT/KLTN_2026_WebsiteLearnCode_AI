import { useState, useEffect } from 'react';
import { X, ShieldAlert, CheckCircle2, Flame, Trash2, Loader2 } from 'lucide-react';
import { LEVEL_LABELS, type SkillLevel, type TopicScore } from '@/types';
import { type UserRecord } from './admin.types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { adminApi } from '@/lib/api';
import { topicSkills, type TopicBands, type TopicSkill } from '@/lib/progress';
import { loadPublishedProblems } from '@/hooks/usePublishedProblems';
import { buildTopics } from '@/lib/topics';

const SKILL_LEVELS: SkillLevel[] = ['beginner', 'basic', 'intermediate', 'advanced', 'expert'];

interface AdminUserDetailModalProps {
  userRecord: UserRecord;
  onClose: () => void;
  onDeleteUser: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onSaveUserDetail: (updatedData: { name: string; email: string; role: 'student' | 'teacher' | 'admin' }) => boolean | Promise<boolean>;
  currentUserId?: string;
}

export function AdminUserDetailModal({
  userRecord,
  onClose,
  onDeleteUser,
  onToggleStatus,
  onSaveUserDetail,
  currentUserId,
}: AdminUserDetailModalProps) {
  const [editName, setEditName] = useState(userRecord.name);
  const [editEmail, setEditEmail] = useState(userRecord.email);
  const [editRole, setEditRole] = useState<'student' | 'teacher' | 'admin'>(userRecord.role);
  const [editUserError, setEditUserError] = useState<string | null>(null);
  const [editUserSaved, setEditUserSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Thống kê trình độ: tính bằng CÙNG hàm topicSkills + cùng dữ liệu như trang Tiến độ của học viên
  // (lịch sử nộp bài, tự đánh giá, band đã lưu, danh sách chủ đề có bài). Chỉ đọc — không lưu band.
  const [topicStats, setTopicStats] = useState<TopicSkill[] | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const backendId = Number(userRecord.id);
    if (isNaN(backendId)) {
      setStatsLoading(false);
      setTopicStats(null);
      return;
    }
    setStatsLoading(true);
    Promise.all([
      adminApi.getUserHistory(backendId),
      adminApi.getUserSelfAssessment(backendId).catch(() => []),
      adminApi.getUserTopicBands(backendId).catch(() => []),
      loadPublishedProblems().catch(() => []),
    ])
      .then(([history, selfItems, bandItems, problems]) => {
        if (cancelled) return;
        const selfAssessment: TopicScore[] = selfItems
          .map((i) => ({ topic: i.topic, level: (i.level ?? '').toLowerCase() as SkillLevel }))
          .filter((s) => SKILL_LEVELS.includes(s.level));
        const storedBands: TopicBands = {};
        bandItems.forEach((b) => {
          storedBands[b.topic] = b.bandIndex;
        });
        const topicNames = buildTopics(problems).filter((t) => t.problemCount > 0).map((t) => t.name);
        const skills = topicSkills(history, topicNames, { storedBands, selfAssessment });
        setTopicStats(skills.length > 0 ? skills : null);
        setStatsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setTopicStats(null);
          setStatsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [userRecord.id]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
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

    const success = await onSaveUserDetail({
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

          {statsLoading ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#7d8599', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader2 size={16} className="spin" />
              <span style={{ fontSize: '13px' }}>Đang tải thống kê...</span>
            </div>
          ) : topicStats && topicStats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topicStats.map((t) => {
                // Hiển thị giống hệt trang Tiến độ (ProgressPage)
                const isNoData = t.bandStatus === 'nodata';
                const isSelf = t.bandStatus === 'self';
                const isEvaluating = t.bandStatus === 'evaluating';
                const scoreDisplay = isNoData ? 0 : t.score;
                const labelDisplay = isNoData
                  ? 'Chưa đủ dữ liệu'
                  : isSelf
                    ? `${t.label} (Tự đánh giá)`
                    : isEvaluating
                      ? `${t.label} (Đang đánh giá)`
                      : t.label;
                const color = isNoData ? '#7d8599' : t.color;
                const selfNote = t.selfLevel ? ` • Tự đánh giá: ${LEVEL_LABELS[t.selfLevel]}` : '';
                return (
                  <div
                    key={t.name}
                    title={`${scoreDisplay}/100 điểm • ${t.submissions} lần nộp • ${t.officialProblemCount} bài chính thức • Độ tin cậy: ${t.confidence}${selfNote}`}
                    style={{ display: 'grid', gridTemplateColumns: '120px 1fr 190px 80px', alignItems: 'center', gap: '12px', fontSize: '13px' }}
                  >
                    <span style={{ color: '#9ba5bf', fontWeight: 500 }}>{t.name}</span>
                    <div className="topic-progress-track">
                      <div
                        className="topic-progress-fill"
                        style={{
                          width: `${Math.max(scoreDisplay, isNoData ? 0 : 2)}%`,
                          background: color,
                          opacity: isEvaluating ? 0.6 : isSelf ? 0.45 : 1,
                        }}
                      />
                    </div>
                    <span style={{ color, fontWeight: 600, fontSize: '12px', opacity: isEvaluating ? 0.7 : isSelf ? 0.75 : 1 }}>
                      {labelDisplay} ({scoreDisplay})
                    </span>
                    <span style={{ color: '#888f9c', fontSize: '12px', textAlign: 'right' }}>
                      {t.solvedCount} bài giải
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: '#7d8599', fontSize: '13px' }}>
              Chưa có dữ liệu luyện tập.
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="dialog-actions" style={{ justifyContent: 'space-between' }}>
          {userRecord.id !== currentUserId && (
            <button
              type="button"
              className="history-view-btn"
              style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)', padding: '10px 18px' }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={15} /> Xóa người dùng này
            </button>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="dialog-cancel"
              onClick={onClose}
            >
              Đóng
            </button>
            {userRecord.id !== currentUserId && (
              <button
                type="button"
                className="dialog-cancel"
                onClick={() => onToggleStatus(userRecord.id)}
              >
                {userRecord.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
              </button>
            )}
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

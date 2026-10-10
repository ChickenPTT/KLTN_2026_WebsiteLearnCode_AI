import { useState, useMemo } from 'react';
import { Clock, Search, ShieldCheck, Filter, ArrowLeft } from 'lucide-react';
import { Pagination } from '@/components/Pagination';
import type { ActivityLog } from './admin.types';

interface AdminAuditLogsTabProps {
  activityLogs: ActivityLog[];
  onBackToDashboard?: () => void;
}

export function AdminAuditLogsTab({ activityLogs, onBackToDashboard }: AdminAuditLogsTabProps) {
  const [filterAction, setFilterAction] = useState<'ALL' | 'CREATE' | 'UPDATE' | 'DELETE' | 'TOGGLE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      const matchesAction = filterAction === 'ALL' || log.action === filterAction;
      const matchesSearch =
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesAction && matchesSearch;
    });
  }, [activityLogs, filterAction, searchQuery]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedLogs = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, safeCurrentPage, pageSize]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return { label: 'Thêm mới', className: 'create' };
      case 'UPDATE':
        return { label: 'Cập nhật', className: 'update' };
      case 'DELETE':
        return { label: 'Xóa', className: 'delete' };
      case 'TOGGLE':
        return { label: 'Khóa / Đổi', className: 'toggle' };
      default:
        return { label: action, className: 'default' };
    }
  };

  return (
    <div className="admin-tab-content">
      {/* ── HEADER ROW ── */}
      <div className="admin-header-row" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="admin-page-title" style={{ marginBottom: '6px' }}>
            Nhật ký Lịch sử thao tác (Audit Log)
          </h1>
          <p className="admin-page-sub">
            Toàn bộ nhật ký thao tác và thay đổi hệ thống từ trước đến nay.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="history-stat-card" style={{ padding: '10px 16px', minWidth: 'auto' }}>
            <Clock size={18} style={{ color: '#5e8dfa', marginRight: '8px' }} />
            <div>
              <strong style={{ fontSize: '16px' }}>{activityLogs.length}</strong>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}> Tổng nhật ký</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="admin-card-box" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          {/* Action Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12.5px', color: '#7d8599', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
              <Filter size={14} /> Lọc theo:
            </span>
            <button
              type="button"
              className={`audit-filter-pill ${filterAction === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterAction('ALL')}
            >
              Tất cả ({activityLogs.length})
            </button>
            <button
              type="button"
              className={`audit-filter-pill ${filterAction === 'CREATE' ? 'active' : ''}`}
              onClick={() => setFilterAction('CREATE')}
            >
              Thêm mới ({activityLogs.filter((l) => l.action === 'CREATE').length})
            </button>
            <button
              type="button"
              className={`audit-filter-pill ${filterAction === 'UPDATE' ? 'active' : ''}`}
              onClick={() => setFilterAction('UPDATE')}
            >
              Cập nhật ({activityLogs.filter((l) => l.action === 'UPDATE').length})
            </button>
            <button
              type="button"
              className={`audit-filter-pill ${filterAction === 'DELETE' ? 'active' : ''}`}
              onClick={() => setFilterAction('DELETE')}
            >
              Xóa ({activityLogs.filter((l) => l.action === 'DELETE').length})
            </button>
            <button
              type="button"
              className={`audit-filter-pill ${filterAction === 'TOGGLE' ? 'active' : ''}`}
              onClick={() => setFilterAction('TOGGLE')}
            >
              Khóa / Đổi trạng thái ({activityLogs.filter((l) => l.action === 'TOGGLE').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="auth-input-wrap" style={{ width: '280px' }}>
            <Search size={16} className="auth-input-icon" />
            <input
              type="text"
              placeholder="Tìm theo người thực hiện hoặc thao tác..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '13px', padding: '8px 12px 8px 36px' }}
            />
          </div>
        </div>
      </div>

      {/* ── FULL AUDIT LOG LIST ── */}
      <div className="admin-card-box">
        {filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#7d8599' }}>
            <Clock size={36} style={{ opacity: 0.4, marginBottom: '12px' }} />
            <h4 className="admin-page-sub" style={{ margin: '0 0 4px', fontSize: '15px' }}>Không tìm thấy nhật ký thao tác</h4>
            <p className="admin-page-sub" style={{ fontSize: '13px', margin: 0 }}>
              Không có nhật ký nào khớp với từ khóa "{searchQuery}" hoặc bộ lọc được chọn.
            </p>
          </div>
        ) : (
          <>
            <div className="audit-log-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {paginatedLogs.map((log) => {
                const badge = getActionBadge(log.action);
                return (
                  <div key={log.id} className="audit-log-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                      <span className={`audit-action-badge ${badge.className}`} style={{ minWidth: '72px', textAlign: 'center' }}>
                        {badge.label}
                      </span>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="audit-user-name">
                            {log.user}
                          </span>
                          <span className="audit-role-tag">
                            <ShieldCheck size={10} style={{ display: 'inline', marginRight: '3px' }} /> User
                          </span>
                        </div>
                        <span className="audit-target-desc">
                          {log.target}
                        </span>
                      </div>
                    </div>

                    <div className="audit-log-time">
                      {log.time}
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredLogs.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

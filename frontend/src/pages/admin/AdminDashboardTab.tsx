import {
  Users,
  FileSpreadsheet,
  Code2,
  Sparkles,
  TrendingUp,
  Flame,
  GraduationCap,
  Clock,
  RefreshCw,
} from 'lucide-react';
import type { ActivityLog, SampleTemplate, UserRecord } from './admin.types';
import type { AdminDashboardStats } from '@/lib/api';

interface AdminDashboardTabProps {
  users: UserRecord[];
  templates: SampleTemplate[];
  activityLogs: ActivityLog[];
  dashboardStats: AdminDashboardStats | null;
  dashboardLoading: boolean;
  dashboardError: string | null;
  onReloadDashboard: () => void;
  onGoGenerator: () => void;
}

export function AdminDashboardTab({
  users,
  templates,
  activityLogs,
  dashboardStats,
  dashboardLoading,
  dashboardError,
  onReloadDashboard,
  onGoGenerator,
}: AdminDashboardTabProps) {
  const stats = dashboardStats;

  return (
    <div className="admin-tab-content">
      <div className="admin-header-row">
        <div>
          <h1 className="admin-page-title">Dashboard tổng quan</h1>
          <p className="admin-page-sub">
            Tổng quan hiệu suất hệ thống, số lượng sinh viên, bài tập và đề thi.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="assessment-ghost" onClick={onReloadDashboard} disabled={dashboardLoading}>
            <RefreshCw size={16} className={dashboardLoading ? 'spin' : ''} /> Làm mới
          </button>
          <button className="assessment-primary" onClick={onGoGenerator}>
            <Sparkles size={16} /> Tạo đề mới ngay
          </button>
        </div>
      </div>

      {dashboardError && (
        <div style={{ padding: '12px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '24px' }}>
          {dashboardError}
        </div>
      )}

      <div className="history-stats-grid" style={{ marginBottom: '32px' }}>
        <div className="history-stat-card">
          <div className="history-stat-icon count">
            <Users size={24} />
          </div>
          <div>
            <strong>{stats?.totalUsers ?? users.length}</strong>
            <span>Tổng người dùng</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon pass">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <strong>{stats?.totalTemplates ?? templates.length}</strong>
            <span>Template đề thi</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon time">
            <Code2 size={24} />
          </div>
          <div>
            <strong>{stats?.submissionsToday ?? 0}</strong>
            <span>Lượt nộp hôm nay</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon topic">
            <Sparkles size={24} />
          </div>
          <div>
            <strong>{stats?.aiAccuracy.toFixed(1) ?? '96.4'}%</strong>
            <span>Độ chính xác AI chấm</span>
          </div>
        </div>
      </div>

      <div className="admin-two-col">
        <div className="admin-card-box">
          <h3 className="admin-card-title">
            <TrendingUp size={18} /> Hoạt động nộp bài 7 ngày qua
          </h3>
          <div className="weekly-chart">
            {stats?.weeklySubmissions.map((d) => {
              const maxCount = Math.max(...stats.weeklySubmissions.map(s => s.count), 1);
              return (
                <div className="weekly-col" key={d.day}>
                  <span className="weekly-count">{d.count}</span>
                  <div className="weekly-bar-track">
                    <div
                      className="weekly-bar-fill"
                      style={{ height: `${(d.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="weekly-day">{d.day}</span>
                </div>
              );
            }) ?? [
              { day: 'T2', count: 0 },
              { day: 'T3', count: 0 },
              { day: 'T4', count: 0 },
              { day: 'T5', count: 0 },
              { day: 'T6', count: 0 },
              { day: 'T7', count: 0 },
              { day: 'CN', count: 0 },
            ].map((d) => (
              <div className="weekly-col" key={d.day}>
                <span className="weekly-count">{d.count}</span>
                <div className="weekly-bar-track">
                  <div className="weekly-bar-fill" style={{ height: '0%' }} />
                </div>
                <span className="weekly-day">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card-box">
          <h3 className="admin-card-title">
            <Flame size={18} /> Chủ đề sinh viên làm nhiều nhất
          </h3>
          <div className="topic-progress-list">
            {stats?.topTopics.map((t) => (
              <div className="topic-progress-row" key={t.name}>
                <span className="topic-progress-name" style={{ textAlign: 'left', width: '130px' }}>{t.name}</span>
                <div className="topic-progress-track">
                  <div className="topic-progress-fill" style={{ width: `${t.percentage}%`, background: t.color }} />
                </div>
                <span className="topic-progress-pct" style={{ color: t.color }}>{t.percentage}%</span>
              </div>
            )) ?? <p style={{ color: '#7d8599', fontSize: '13px' }}>Không có dữ liệu</p>}
          </div>
        </div>
      </div>

      {/* ── ROW 3: THỐNG KÊ LEVEL & LỊCH SỬ THAO TÁC HỆ THỐNG ── */}
      <div className="admin-two-col" style={{ marginTop: '24px' }}>
        {/* Pie Chart Card for Level Distribution */}
        <div className="admin-card-box">
          <h3 className="admin-card-title">
            <GraduationCap size={18} /> Phân bổ trình độ (Level) người dùng
          </h3>
          <p style={{ fontSize: '13px', color: '#7d8599', margin: '0 0 16px' }}>
            Thống kê tỷ lệ và số lượng sinh viên theo từng cấp độ giải thuật trong hệ thống.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {/* Donut SVG Pie Chart */}
            <div style={{ position: 'relative', width: '150px', height: '150px', flexShrink: 0, margin: '0 auto' }}>
              <svg width="150" height="150" viewBox="0 0 150 150">
                {stats?.levelDistribution.map((level, index) => {
                  const circumference = 2 * Math.PI * 54;
                  const previousPercentage = stats.levelDistribution.slice(0, index)
                    .reduce((sum, l) => sum + l.percentage, 0);
                  const strokeDasharray = `${(level.percentage / 100) * circumference} ${circumference}`;
                  const offset = -1 * (previousPercentage / 100) * circumference;
                  return (
                    <circle
                      key={level.level}
                      cx="75"
                      cy="75"
                      r="54"
                      fill="transparent"
                      stroke={level.color}
                      strokeWidth="18"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={offset}
                      transform="rotate(-90 75 75)"
                    />
                  );
                }) ?? <circle cx="75" cy="75" r="54" fill="transparent" stroke="#7d8599" strokeWidth="18" />}
              </svg>
              {/* Donut Center Label */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <strong style={{ fontSize: '18px', lineHeight: 1.1 }}>{stats?.totalUsers ?? users.length}</strong>
                <span style={{ fontSize: '11px', opacity: 0.7 }}>Tài khoản</span>
              </div>
            </div>

            {/* Pie Chart Legend */}
            <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stats?.levelDistribution.map((item) => (
                <div key={item.level} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                    <span className="level-legend-text" style={{ fontWeight: 500 }}>{item.level}</span>
                  </div>
                  <span style={{ color: item.color, fontWeight: 700 }}>{item.count} TK ({item.percentage}%)</span>
                </div>
              )) ?? <p style={{ color: '#7d8599', fontSize: '13px' }}>Không có dữ liệu</p>}
            </div>
          </div>
        </div>

        {/* Audit Log Card */}
        <div className="admin-card-box" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="admin-card-title">
            <Clock size={18} /> Lịch sử thao tác hệ thống (Audit Log)
          </h3>
          <div className="audit-log-list" style={{ minHeight: '230px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px', flex: 1 }}>
            {(stats?.auditLogs.length > 0 ? stats.auditLogs : activityLogs).map((log) => (
              <div key={log.id} className="audit-log-item">
                <span className={`audit-action-badge ${log.action.toLowerCase()}`}>
                  {log.action === 'CREATE' ? 'Thêm' : log.action === 'UPDATE' ? 'Sửa' : log.action === 'DELETE' ? 'Xóa' : 'Khóa'}
                </span>
                <div className="audit-content">
                  <span className="audit-user">{log.user}</span>
                  <span className="audit-target">{log.target}</span>
                </div>
                <span className="audit-time">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

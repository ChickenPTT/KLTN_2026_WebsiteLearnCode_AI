import {
  Users,
  FileSpreadsheet,
  Code2,
  Sparkles,
  TrendingUp,
  Flame,
  GraduationCap,
  Clock,
} from 'lucide-react';
import type { ActivityLog, ExamTemplate, UserRecord } from './admin.types';

interface AdminDashboardTabProps {
  users: UserRecord[];
  templates: ExamTemplate[];
  activityLogs: ActivityLog[];
  onGoGenerator: () => void;
}

export function AdminDashboardTab({
  users,
  templates,
  activityLogs,
  onGoGenerator,
}: AdminDashboardTabProps) {
  return (
    <div className="admin-tab-content">
      <div className="admin-header-row">
        <div>
          <h1 className="admin-page-title">Dashboard tổng quan</h1>
          <p className="admin-page-sub">
            Tổng quan hiệu suất hệ thống, số lượng sinh viên, bài tập và đề thi.
          </p>
        </div>
        <button className="assessment-primary" onClick={onGoGenerator}>
          <Sparkles size={16} /> Tạo đề mới ngay
        </button>
      </div>

      <div className="history-stats-grid" style={{ marginBottom: '32px' }}>
        <div className="history-stat-card">
          <div className="history-stat-icon count">
            <Users size={24} />
          </div>
          <div>
            <strong>{users.length}</strong>
            <span>Tổng người dùng</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon pass">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <strong>{templates.length}</strong>
            <span>Template đề thi</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon time">
            <Code2 size={24} />
          </div>
          <div>
            <strong>342</strong>
            <span>Lượt nộp hôm nay</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon topic">
            <Sparkles size={24} />
          </div>
          <div>
            <strong>96.4%</strong>
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
            {[
              { day: 'T2', count: 120 },
              { day: 'T3', count: 190 },
              { day: 'T4', count: 240 },
              { day: 'T5', count: 310 },
              { day: 'T6', count: 280 },
              { day: 'T7', count: 342 },
              { day: 'CN', count: 160 },
            ].map((d) => (
              <div className="weekly-col" key={d.day}>
                <span className="weekly-count">{d.count}</span>
                <div className="weekly-bar-track">
                  <div
                    className="weekly-bar-fill"
                    style={{ height: `${(d.count / 342) * 100}%` }}
                  />
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
            {[
              { name: 'Array & Mảng', pct: 88, color: '#78d39e' },
              { name: 'String & Chuỗi', pct: 72, color: '#5e8dfa' },
              { name: 'Hash Table', pct: 64, color: '#f5c95d' },
              { name: 'Binary Search', pct: 51, color: '#a995ff' },
            ].map((t) => (
              <div className="topic-progress-row" key={t.name}>
                <span className="topic-progress-name" style={{ textAlign: 'left', width: '130px' }}>{t.name}</span>
                <div className="topic-progress-track">
                  <div className="topic-progress-fill" style={{ width: `${t.pct}%`, background: t.color }} />
                </div>
                <span className="topic-progress-pct" style={{ color: t.color }}>{t.pct}%</span>
              </div>
            ))}
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
                {/* Expert (25% -> 84.82) */}
                <circle
                  cx="75"
                  cy="75"
                  r="54"
                  fill="transparent"
                  stroke="#a995ff"
                  strokeWidth="18"
                  strokeDasharray="84.82 339.29"
                  strokeDashoffset="0"
                  transform="rotate(-90 75 75)"
                />
                {/* Advanced (25% -> 84.82) */}
                <circle
                  cx="75"
                  cy="75"
                  r="54"
                  fill="transparent"
                  stroke="#f5c95d"
                  strokeWidth="18"
                  strokeDasharray="84.82 339.29"
                  strokeDashoffset="-84.82"
                  transform="rotate(-90 75 75)"
                />
                {/* Intermediate (25% -> 84.82) */}
                <circle
                  cx="75"
                  cy="75"
                  r="54"
                  fill="transparent"
                  stroke="#5e8dfa"
                  strokeWidth="18"
                  strokeDasharray="84.82 339.29"
                  strokeDashoffset="-169.64"
                  transform="rotate(-90 75 75)"
                />
                {/* Basic (12.5% -> 42.41) */}
                <circle
                  cx="75"
                  cy="75"
                  r="54"
                  fill="transparent"
                  stroke="#78d39e"
                  strokeWidth="18"
                  strokeDasharray="42.41 339.29"
                  strokeDashoffset="-254.46"
                  transform="rotate(-90 75 75)"
                />
                {/* Beginner (12.5% -> 42.41) */}
                <circle
                  cx="75"
                  cy="75"
                  r="54"
                  fill="transparent"
                  stroke="#7d8599"
                  strokeWidth="18"
                  strokeDasharray="42.41 339.29"
                  strokeDashoffset="-296.87"
                  transform="rotate(-90 75 75)"
                />
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
                <strong style={{ fontSize: '18px', lineHeight: 1.1 }}>8</strong>
                <span style={{ fontSize: '11px', opacity: 0.7 }}>Tài khoản</span>
              </div>
            </div>

            {/* Pie Chart Legend */}
            <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { level: 'Nâng cao (Expert)', label: '2 TK (25%)', color: '#a995ff' },
                { level: 'Khá (Advanced)', label: '2 TK (25%)', color: '#f5c95d' },
                { level: 'Trung bình (Intermediate)', label: '2 TK (25%)', color: '#5e8dfa' },
                { level: 'Cơ bản (Basic)', label: '1 TK (12.5%)', color: '#78d39e' },
                { level: 'Mới bắt đầu (Beginner)', label: '1 TK (12.5%)', color: '#7d8599' },
              ].map((item) => (
                <div key={item.level} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                    <span className="level-legend-text" style={{ fontWeight: 500 }}>{item.level}</span>
                  </div>
                  <span style={{ color: item.color, fontWeight: 700 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Log Card */}
        <div className="admin-card-box" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="admin-card-title">
            <Clock size={18} /> Lịch sử thao tác hệ thống (Audit Log)
          </h3>
          <div className="audit-log-list" style={{ minHeight: '230px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px', flex: 1 }}>
            {activityLogs.map((log) => (
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

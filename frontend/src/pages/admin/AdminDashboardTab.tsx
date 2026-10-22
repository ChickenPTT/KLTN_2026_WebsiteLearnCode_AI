import { useState } from 'react';
import {
  Users,
  FileSpreadsheet,
  Code2,
  Sparkles,
  TrendingUp,
  GraduationCap,
  Clock,
  ChevronRight,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { ActivityLog, SampleTemplate, UserRecord } from './admin.types';
import type { PracticeProblem } from '@/types';
import type { AdminDashboardStats as BackendDashboardStats } from '@/lib/api';
import {
  calculateLevelDistribution,
  getOverviewModules,
} from './dashboardData';

interface AdminDashboardTabProps {
  users: UserRecord[];
  templates: SampleTemplate[];
  problems?: PracticeProblem[];
  activityLogs: ActivityLog[];
  dashboardStats?: BackendDashboardStats | null;
  onGoGenerator: () => void;
  onNavigateTab?: (tab: import('./admin.types').AdminTab) => void;
}

export function AdminDashboardTab({
  users,
  templates,
  problems = [],
  activityLogs,
  dashboardStats,
  onGoGenerator,
  onNavigateTab,
}: AdminDashboardTabProps) {
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);

  const activeUserCount = users.filter((u) => u.status === 'active').length;

  // ── BUILD REAL SUBMISSION DATA FROM BACKEND ──
  // Convert backend weeklySubmissions to chart data points
  const buildRealDataPoints = (): { label: string; date: string; total: number; passed: number; failed: number }[] => {
    if (!dashboardStats?.weeklySubmissions || dashboardStats.weeklySubmissions.length === 0) return [];
    const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const today = new Date();
    return dashboardStats.weeklySubmissions.map((ds, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
      return {
        label: dayLabels[i] ?? ds.day,
        date: dateStr,
        total: ds.count,
        passed: ds.passed,
        failed: ds.count - ds.passed,
      };
    });
  };

  const realDataPoints = buildRealDataPoints();
  const realTotal7d = dashboardStats?.totalSubmissions7d ?? 0;
  const realPassed7d = dashboardStats?.passedSubmissions7d ?? 0;
  const realPassRate7d = realTotal7d > 0 ? Math.round((realPassed7d / realTotal7d) * 1000) / 10 : 0;

  // Always use real data from backend — no mock fallback
  const selectedTimeline = {
    periodLabel: '7 ngày qua',
    totalSubmissions: realTotal7d,
    passedSubmissions: realPassed7d,
    failedSubmissions: realTotal7d - realPassed7d,
    passRatePercentage: realPassRate7d,
    growthPercentage: 0,
    dataPoints: realDataPoints.length > 0 ? realDataPoints : [
      { label: 'T2', date: '', total: 0, passed: 0, failed: 0 },
      { label: 'T3', date: '', total: 0, passed: 0, failed: 0 },
      { label: 'T4', date: '', total: 0, passed: 0, failed: 0 },
      { label: 'T5', date: '', total: 0, passed: 0, failed: 0 },
      { label: 'T6', date: '', total: 0, passed: 0, failed: 0 },
      { label: 'T7', date: '', total: 0, passed: 0, failed: 0 },
      { label: 'CN', date: '', total: 0, passed: 0, failed: 0 },
    ],
  };

  const levelDist = calculateLevelDistribution(users);

  // Build overview modules with real AI stats
  // Ưu tiên đếm trực tiếp từ danh sách bài (luôn được refresh), fallback về số liệu backend
  const aiProblems = problems.filter((p) => p.isAiGenerated);
  const aiGeneratedTotal = problems.length > 0 ? aiProblems.length : dashboardStats?.totalAiGeneratedProblems ?? 0;
  const aiGeneratedPublished = problems.length > 0
    ? aiProblems.filter((p) => p.isPublic !== false).length
    : dashboardStats?.publishedAiGeneratedProblems ?? 0;
  const aiSuccessRate = aiGeneratedTotal > 0 ? Math.round((aiGeneratedPublished / aiGeneratedTotal) * 1000) / 10 : 0;

  const overviewModules = getOverviewModules(
    problems.length,
    templates.length,
    aiGeneratedTotal,
    aiSuccessRate,
    aiGeneratedPublished,
    problems.filter((p) => p.isPublic !== false).length,
    new Set(problems.map((p) => p.topic).filter(Boolean)).size,
  );

  // ── PREPARE LINE CHART DATA & Y-AXIS TICKS ──
  const points = selectedTimeline.dataPoints;
  const maxVal = Math.max(...points.map((p) => p.total), 10);
  const chartWidth = 760;
  const chartHeight = 200;
  const paddingLeft = 54;
  const paddingRight = 24;
  const paddingTop = 20;
  const paddingBottom = 34;

  // Y-axis ticks (5 values: 0, 25%, 50%, 75%, 100% of maxVal)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(maxVal * ratio));

  const coords = points.map((p, i) => {
    const x = paddingLeft + (i / Math.max(points.length - 1, 1)) * (chartWidth - paddingLeft - paddingRight);
    const availableH = chartHeight - paddingTop - paddingBottom;
    const y = chartHeight - paddingBottom - (p.total / maxVal) * availableH;
    const yPassed = chartHeight - paddingBottom - (p.passed / maxVal) * availableH;
    return { x, y, yPassed, ...p };
  });

  const linePathD = coords.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const passedLinePathD = coords.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.yPassed}` : `${acc} L ${pt.x} ${pt.yPassed}`;
  }, '');

  const areaPathD = coords.length > 0
    ? `${linePathD} L ${coords[coords.length - 1].x} ${chartHeight - paddingBottom} L ${coords[0].x} ${chartHeight - paddingBottom} Z`
    : '';

  // Handle mouse move across entire SVG to pick nearest point
  const handleMouseMoveSVG = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - svgRect.left) / svgRect.width) * chartWidth;
    let closestIndex = 0;
    let minDistance = Infinity;

    coords.forEach((pt, idx) => {
      const dist = Math.abs(pt.x - mouseX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    setHoveredPointIndex(closestIndex);
  };

  // ── PREPARE PIE/DONUT CHART (PROGRESS PAGE STYLE) ──
  const CIRCUMFERENCE = 339.29; // 2 * PI * 54
  let cumulativeOffset = 0;

  const pieSlices = levelDist.items.map((item) => {
    const sliceLength = (item.percentage / 100) * CIRCUMFERENCE;
    const sliceOffset = cumulativeOffset;
    cumulativeOffset += sliceLength;
    return {
      ...item,
      length: sliceLength,
      offset: sliceOffset,
    };
  });

  return (
    <div className="admin-tab-content">
      {/* ── HEADER ROW ── */}
      <div className="admin-header-row" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="admin-page-title">Dashboard tổng quan</h1>
          <p className="admin-page-sub">
            Tổng quan hiệu suất hệ thống Mnemonic, số lượng sinh viên, bài tập và đề thi.
          </p>
        </div>
        <button className="assessment-primary" onClick={onGoGenerator}>
          <Sparkles size={16} /> Tạo đề mới ngay
        </button>
      </div>

      {/* ── ROW 1: COMPACT MODERN KPI CARDS ── */}
      <div className="kpi-grid-3">
        {/* KPI 1: TỔNG NGƯỜI DÙNG */}
        <div className="kpi-card-compact">
          <div className="kpi-top-row">
            <div className="kpi-icon-box blue">
              <Users size={18} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{users.length}</div>
            <div className="kpi-title">Tổng số người dùng</div>
            <div className="kpi-sub">{activeUserCount}/{users.length} tài khoản đang hoạt động</div>
          </div>
        </div>

        {/* KPI 2: TEMPLATE ĐỀ THI MẪU */}
        <div className="kpi-card-compact">
          <div className="kpi-top-row">
            <div className="kpi-icon-box green">
              <FileSpreadsheet size={18} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{templates.length}</div>
            <div className="kpi-title">Template đề thi mẫu</div>
            <div className="kpi-sub">100% sẵn sàng sinh đề AI</div>
          </div>
        </div>

        {/* KPI 3: LƯỢT NỘP BÀI */}
        <div className="kpi-card-compact">
          <div className="kpi-top-row">
            <div className="kpi-icon-box amber">
              <Code2 size={18} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{selectedTimeline.totalSubmissions.toLocaleString('vi-VN')}</div>
            <div className="kpi-title">Lượt nộp bài ({selectedTimeline.periodLabel})</div>
            <div className="kpi-sub">{selectedTimeline.passedSubmissions.toLocaleString('vi-VN')} đạt ({selectedTimeline.passRatePercentage}%)</div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: BIỂU ĐỒ ĐƯỜNG HOẠT ĐỘNG NỘP BÀI (VỚI TRỤC Y & HOVER CHÍNH XÁC) ── */}
      <div className="admin-card-box" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <h3 className="admin-card-title" style={{ margin: 0 }}>
              <TrendingUp size={18} /> Biểu đồ đường hoạt động nộp bài
            </h3>
            <p style={{ fontSize: '13px', color: '#7d8599', margin: '4px 0 0' }}>
              Xu hướng lượt nộp bài tổng quan và kết quả nộp bài thành công theo thời gian.
            </p>
          </div>

        </div>

        {/* Chart Sub-header summary & legend */}
        <div className="chart-summary-bar">
          <div className="chart-summary-text">
            Tổng lượt nộp ({selectedTimeline.periodLabel}): <strong style={{ color: '#5e8dfa', fontSize: '15px' }}>{selectedTimeline.totalSubmissions.toLocaleString('vi-VN')}</strong>
            <span style={{ margin: '0 8px', opacity: 0.5 }}>|</span>
            Tỷ lệ thành công: <strong style={{ color: '#34d399' }}>{selectedTimeline.passRatePercentage}%</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '3px', borderRadius: '2px', background: '#5e8dfa', display: 'inline-block' }} />
              <span className="chart-legend-text">— Tổng lượt nộp</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '3px', borderRadius: '2px', background: '#34d399', display: 'inline-block' }} />
              <span className="chart-legend-text">— Thành công</span>
            </div>
          </div>
        </div>

        {/* SVG Line Chart Container with Y-Axis */}
        <div className="line-chart-wrapper">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="line-chart-svg"
            onMouseMove={handleMouseMoveSVG}
            onMouseLeave={() => setHoveredPointIndex(null)}
          >
            <defs>
              <linearGradient id="lineGlowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5e8dfa" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#5e8dfa" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Y-Axis Ticks and Horizontal Grid Lines */}
            {yTicks.map((val, idx) => {
              const ratio = val / maxVal;
              const availableH = chartHeight - paddingTop - paddingBottom;
              const yPos = chartHeight - paddingBottom - ratio * availableH;

              return (
                <g key={idx}>
                  {/* Grid line */}
                  <line
                    x1={paddingLeft}
                    y1={yPos}
                    x2={chartWidth - paddingRight}
                    y2={yPos}
                    stroke="rgba(255, 255, 255, 0.06)"
                    strokeDasharray="4 4"
                  />
                  {/* Y-Axis label */}
                  <text
                    x={paddingLeft - 10}
                    y={yPos + 4}
                    textAnchor="end"
                    fill="#7d8599"
                    fontSize="11"
                    fontWeight="500"
                  >
                    {val.toLocaleString('vi-VN')}
                  </text>
                </g>
              );
            })}

            {/* Gradient Area Fill under total line */}
            <path d={areaPathD} fill="url(#lineGlowGrad)" />

            {/* Passed Submissions Line (Green) */}
            <path
              d={passedLinePathD}
              fill="none"
              stroke="#34d399"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.85"
            />

            {/* Total Submissions Line (Blue) */}
            <path
              d={linePathD}
              fill="none"
              stroke="#5e8dfa"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Node Dots & X Axis Labels */}
            {coords.map((pt, i) => {
              const isHovered = hoveredPointIndex === i;
              return (
                <g key={i}>
                  {/* Vertical guide line on hover */}
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={paddingTop}
                      x2={pt.x}
                      y2={chartHeight - paddingBottom}
                      stroke="rgba(94, 141, 250, 0.45)"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Total Dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 4}
                    fill={isHovered ? '#ffffff' : '#5e8dfa'}
                    stroke="#5e8dfa"
                    strokeWidth="2"
                    className="chart-node-point"
                  />

                  {/* X Axis Label */}
                  <text
                    x={pt.x}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    fill={isHovered ? '#5e8dfa' : '#94a3b8'}
                    fontSize="11"
                    fontWeight={isHovered ? '700' : '500'}
                  >
                    {pt.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip Card on Hover */}
          {hoveredPointIndex !== null && (
            <div
              className="chart-tooltip"
              style={{
                left: `${(coords[hoveredPointIndex].x / chartWidth) * 100}%`,
                top: `${(coords[hoveredPointIndex].y / chartHeight) * 100 - 8}%`,
                transform: 'translate(-50%, -100%)',
                opacity: 1,
                visibility: 'visible',
              }}
            >
              <div className="chart-tooltip-title">
                {coords[hoveredPointIndex].label} {coords[hoveredPointIndex].date ? `(${coords[hoveredPointIndex].date})` : ''}
              </div>
              <div className="chart-tooltip-row">
                <span>Tổng lượt nộp:</span>
                <span className="chart-tooltip-val" style={{ color: '#ffffff' }}>{coords[hoveredPointIndex].total}</span>
              </div>
              <div className="chart-tooltip-row">
                <span>Thành công:</span>
                <span className="chart-tooltip-val" style={{ color: '#34d399' }}>
                  {coords[hoveredPointIndex].passed} ({Math.round((coords[hoveredPointIndex].passed / coords[hoveredPointIndex].total) * 100)}%)
                </span>
              </div>
              <div className="chart-tooltip-row">
                <span>Thất bại:</span>
                <span className="chart-tooltip-val" style={{ color: '#f5c95d' }}>{coords[hoveredPointIndex].failed}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 3: KHU VỰC TỔNG QUAN MODULE NỘI DUNG VÀ AI ── */}
      <div style={{ marginBottom: '24px' }}>
        <h3 className="admin-card-title" style={{ marginBottom: '4px' }}>
          <Layers size={18} /> Tổng quan Module Quản trị & AI Engine
        </h3>
        <p style={{ fontSize: '13px', color: '#7d8599', margin: '0 0 14px' }}>
          Nắm bắt nhanh trạng thái dữ liệu của các module chính trên hệ thống Mnemonic.
        </p>

        <div className="overview-modules-grid">
          {overviewModules.map((mod) => (
            <div key={mod.id} className="overview-module-card">
              <div>
                <div className="overview-module-header">
                  <span className="overview-module-title">
                    {mod.id === 'mod-problems' && <Code2 size={16} style={{ color: '#5e8dfa' }} />}
                    {mod.id === 'mod-templates' && <FileSpreadsheet size={16} style={{ color: '#34d399' }} />}
                    {mod.id === 'mod-generator' && <Sparkles size={16} style={{ color: '#c084fc' }} />}
                    {mod.title}
                  </span>
                </div>

                <div className="overview-module-metric">{mod.mainMetric}</div>

                <div className="overview-module-subgrid">
                  {mod.subMetrics.map((sub, idx) => (
                    <div key={idx} className="overview-module-subitem">
                      <span>{sub.label}: </span>
                      <strong>{sub.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="overview-module-action-btn"
                onClick={() => onNavigateTab?.(mod.targetTab)}
              >
                Quản lý {mod.title} <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── ROW 4: PHÂN BỔ TRÌNH ĐỘ (STYLE TRANG USER) & AUDIT LOG ── */}
      <div className="admin-two-col">
        {/* Pie Chart Card for Level Distribution (User Progress Page Style) */}
        <div className="admin-card-box">
          <h3 className="admin-card-title" style={{ marginBottom: '4px' }}>
            <GraduationCap size={18} /> Phân bổ trình độ (Level) người dùng
          </h3>
          <p style={{ fontSize: '13px', color: '#7d8599', margin: '0 0 16px' }}>
            Thống kê số lượng và tỷ lệ % sinh viên phân loại theo cấp độ giải thuật.
          </p>

          {levelDist.totalCount === 0 ? (
            /* Empty State */
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#7d8599' }}>
              <AlertTriangle size={32} style={{ opacity: 0.5, marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', margin: 0 }}>Chưa có dữ liệu sinh viên được phân loại.</p>
            </div>
          ) : (
            <div className="pie-chart-body-admin">
              {/* SVG Ring Donut Chart */}
              <div className="pie-chart-svg-wrap-admin">
                <svg viewBox="0 0 180 180" className="pie-svg-admin">
                  <circle
                    cx="90"
                    cy="90"
                    r="54"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="20"
                  />
                  {pieSlices.map((slice, idx) => (
                    <circle
                      key={slice.level}
                      cx="90"
                      cy="90"
                      r="54"
                      fill="none"
                      stroke={slice.color}
                      strokeWidth={hoveredPieIndex === idx ? 25 : 20}
                      strokeDasharray={`${slice.length} ${CIRCUMFERENCE}`}
                      strokeDashoffset={-slice.offset}
                      onMouseEnter={() => setHoveredPieIndex(idx)}
                      onMouseLeave={() => setHoveredPieIndex(null)}
                      style={{
                        cursor: 'pointer',
                        transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                        opacity: hoveredPieIndex === null || hoveredPieIndex === idx ? 1 : 0.35,
                      }}
                    />
                  ))}
                </svg>

                {/* Center Info Text */}
                <div className="pie-center-info-admin">
                  {hoveredPieIndex !== null ? (
                    <>
                      <span className="pie-center-count-admin" style={{ color: pieSlices[hoveredPieIndex].color }}>
                        {pieSlices[hoveredPieIndex].count} TK
                      </span>
                      <span className="pie-center-label-admin">{pieSlices[hoveredPieIndex].displayName.split(' ')[0]}</span>
                    </>
                  ) : (
                    <>
                      <span className="pie-center-count-admin">{levelDist.totalCount}</span>
                      <span className="pie-center-label-admin">Sinh viên</span>
                    </>
                  )}
                </div>
              </div>

              {/* Side Legend List */}
              <div className="pie-legend-list-admin">
                {pieSlices.map((item, idx) => (
                  <div
                    key={item.level}
                    className={`pie-legend-item-admin ${hoveredPieIndex === idx ? 'is-active' : ''}`}
                    onMouseEnter={() => setHoveredPieIndex(idx)}
                    onMouseLeave={() => setHoveredPieIndex(null)}
                  >
                    <span className="legend-dot-admin" style={{ backgroundColor: item.color }} />
                    <span className="legend-name-admin">{item.displayName}</span>
                    <span className="legend-count-admin" style={{ color: item.color }}>
                      {item.count} TK ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Audit Log Card with Option to Navigate to Full Logs Page */}
        <div className="admin-card-box" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 className="admin-card-title" style={{ margin: 0 }}>
              <Clock size={18} /> Lịch sử thao tác (Audit Log)
            </h3>
          </div>

          <div
            className="audit-log-list scrollable"
            style={{
              minHeight: '220px',
              maxHeight: '260px',
              overflowY: 'auto',
              paddingRight: '4px',
              flex: 1,
            }}
          >
            {activityLogs.slice(0, 5).map((log) => {
              const actionClass = log.action.toLowerCase();
              const actionLabel =
                log.action === 'CREATE'
                  ? 'Thêm'
                  : log.action === 'UPDATE'
                  ? 'Sửa'
                  : log.action === 'DELETE'
                  ? 'Xóa'
                  : 'Khóa/Đổi';

              return (
                <div key={log.id} className="audit-log-item">
                  <span className={`audit-action-badge ${actionClass}`}>
                    {actionLabel}
                  </span>
                  <div className="audit-content">
                    <span className="audit-user">{log.user}</span>
                    <span className="audit-target">{log.target}</span>
                  </div>
                  <span className="audit-time">{log.time}</span>
                </div>
              );
            })}
          </div>

          {/* Bottom Button to Switch to Dedicated Audit Log Page */}
          <button
            type="button"
            className="overview-module-action-btn"
            style={{ marginTop: '12px', padding: '9px 12px' }}
            onClick={() => onNavigateTab?.('logs')}
          >
            Xem lịch sử <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

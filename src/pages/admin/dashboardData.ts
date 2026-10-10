import type { SkillLevel } from '@/types';
import type { UserRecord } from './admin.types';

export type TimeRangeFilter = '7d' | '30d' | '90d';

export interface SubmissionDataPoint {
  label: string;
  date: string;
  total: number;
  passed: number;
  failed: number;
}

export interface TimePeriodStats {
  periodKey: TimeRangeFilter;
  periodLabel: string;
  totalSubmissions: number;
  passedSubmissions: number;
  failedSubmissions: number;
  passRatePercentage: number;
  growthPercentage: number;
  dataPoints: SubmissionDataPoint[];
}

export interface LevelDistributionItem {
  level: SkillLevel;
  displayName: string;
  count: number;
  percentage: number;
  color: string;
}

export interface OverviewModuleStat {
  id: string;
  title: string;
  iconName: string;
  mainMetric: string;
  subMetrics: { label: string; value: string }[];
  targetTab: 'problems' | 'templates' | 'generator';
  badgeText: string;
  badgeType: 'success' | 'info' | 'purple';
}

// ── 1. MOCK SUBMISSION DATA BY TIME RANGE ──
export const SUBMISSION_TIMELINE_DATA: Record<TimeRangeFilter, TimePeriodStats> = {
  '7d': {
    periodKey: '7d',
    periodLabel: '7 ngày qua',
    totalSubmissions: 2410,
    passedSubmissions: 2185,
    failedSubmissions: 225,
    passRatePercentage: 90.7,
    growthPercentage: 13.7,
    dataPoints: [
      { label: 'T2', date: '03/10', total: 240, passed: 215, failed: 25 },
      { label: 'T3', date: '04/10', total: 310, passed: 282, failed: 28 },
      { label: 'T4', date: '05/10', total: 380, passed: 345, failed: 35 },
      { label: 'T5', date: '06/10', total: 420, passed: 382, failed: 38 },
      { label: 'T6', date: '07/10', total: 390, passed: 351, failed: 39 },
      { label: 'T7', date: '08/10', total: 460, passed: 423, failed: 37 },
      { label: 'CN', date: '09/10', total: 210, passed: 187, failed: 23 },
    ],
  },
  '30d': {
    periodKey: '30d',
    periodLabel: '30 ngày qua',
    totalSubmissions: 10850,
    passedSubmissions: 9650,
    failedSubmissions: 1200,
    passRatePercentage: 88.9,
    growthPercentage: 15.2,
    dataPoints: [
      { label: '10/09 - 13/09', date: 'Tuần 1', total: 1120, passed: 980, failed: 140 },
      { label: '14/09 - 17/09', date: 'Tuần 1', total: 1280, passed: 1130, failed: 150 },
      { label: '18/09 - 21/09', date: 'Tuần 2', total: 1450, passed: 1290, failed: 160 },
      { label: '22/09 - 25/09', date: 'Tuần 2', total: 1580, passed: 1410, failed: 170 },
      { label: '26/09 - 29/09', date: 'Tuần 3', total: 1720, passed: 1540, failed: 180 },
      { label: '30/09 - 03/10', date: 'Tuần 3', total: 1640, passed: 1470, failed: 170 },
      { label: '04/10 - 09/10', date: 'Tuần 4', total: 2060, passed: 1830, failed: 230 },
    ],
  },
  '90d': {
    periodKey: '90d',
    periodLabel: '90 ngày qua',
    totalSubmissions: 31400,
    passedSubmissions: 27940,
    failedSubmissions: 3460,
    passRatePercentage: 89.0,
    growthPercentage: 18.5,
    dataPoints: [
      { label: 'Tháng 7/2026', date: 'T7', total: 8400, passed: 7420, failed: 980 },
      { label: 'Tháng 8/2026', date: 'T8', total: 10200, passed: 9100, failed: 1100 },
      { label: 'Tháng 9/2026', date: 'T9', total: 12800, passed: 11420, failed: 1380 },
    ],
  },
};

// ── 2. DYNAMIC LEVEL DISTRIBUTION CALCULATION ──
export function calculateLevelDistribution(users: UserRecord[]): {
  totalCount: number;
  items: LevelDistributionItem[];
} {
  if (!users || users.length === 0) {
    return {
      totalCount: 0,
      items: [
        { level: 'expert', displayName: 'Nâng cao (Expert)', count: 0, percentage: 0, color: '#a995ff' },
        { level: 'advanced', displayName: 'Khá (Advanced)', count: 0, percentage: 0, color: '#f5c95d' },
        { level: 'intermediate', displayName: 'Trung bình (Intermediate)', count: 0, percentage: 0, color: '#5e8dfa' },
        { level: 'basic', displayName: 'Cơ bản (Basic)', count: 0, percentage: 0, color: '#78d39e' },
        { level: 'beginner', displayName: 'Mới bắt đầu (Beginner)', count: 0, percentage: 0, color: '#7d8599' },
      ],
    };
  }

  // Count levels from users solvedCount or assigned distribution
  const counts: Record<SkillLevel, number> = {
    expert: 0,
    advanced: 0,
    intermediate: 0,
    basic: 0,
    beginner: 0,
  };

  users.forEach((u) => {
    if (u.solvedCount >= 20) counts.expert += 1;
    else if (u.solvedCount >= 12) counts.advanced += 1;
    else if (u.solvedCount >= 8) counts.intermediate += 1;
    else if (u.solvedCount >= 5) counts.basic += 1;
    else counts.beginner += 1;
  });

  const total = users.length;

  const items: LevelDistributionItem[] = [
    {
      level: 'expert',
      displayName: 'Nâng cao (Expert)',
      count: counts.expert,
      percentage: Math.round((counts.expert / total) * 1000) / 10,
      color: '#a995ff',
    },
    {
      level: 'advanced',
      displayName: 'Khá (Advanced)',
      count: counts.advanced,
      percentage: Math.round((counts.advanced / total) * 1000) / 10,
      color: '#f5c95d',
    },
    {
      level: 'intermediate',
      displayName: 'Trung bình (Intermediate)',
      count: counts.intermediate,
      percentage: Math.round((counts.intermediate / total) * 1000) / 10,
      color: '#5e8dfa',
    },
    {
      level: 'basic',
      displayName: 'Cơ bản (Basic)',
      count: counts.basic,
      percentage: Math.round((counts.basic / total) * 1000) / 10,
      color: '#78d39e',
    },
    {
      level: 'beginner',
      displayName: 'Mới bắt đầu (Beginner)',
      count: counts.beginner,
      percentage: Math.round((counts.beginner / total) * 1000) / 10,
      color: '#7d8599',
    },
  ];

  return { totalCount: total, items };
}

// ── 3. CONTENT & AI MODULE OVERVIEW GENERATOR ──
export function getOverviewModules(
  problemCount: number,
  templateCount: number,
): OverviewModuleStat[] {
  return [
    {
      id: 'mod-problems',
      title: 'Quản lý Bài tập',
      iconName: 'Code2',
      mainMetric: `${problemCount} bài tập`,
      subMetrics: [
        { label: 'Công khai', value: `${problemCount} bài` },
        { label: 'Chủ đề', value: '12 chủ đề' },
      ],
      targetTab: 'problems',
      badgeText: 'Ngân hàng bài tập',
      badgeType: 'info',
    },
    {
      id: 'mod-templates',
      title: 'Template bài mẫu AI',
      iconName: 'FileSpreadsheet',
      mainMetric: `${templateCount} Template`,
      subMetrics: [
        { label: 'Cấp độ', value: '4 cấp độ' },
        { label: 'Cập nhật', value: 'Tuần này' },
      ],
      targetTab: 'templates',
      badgeText: 'Bộ bài mẫu AI',
      badgeType: 'success',
    },
    {
      id: 'mod-generator',
      title: 'Sinh đề thi bằng AI',
      iconName: 'Sparkles',
      mainMetric: '148 lượt yêu cầu',
      subMetrics: [
        { label: 'Tỷ lệ thành công', value: '98.6%' },
        { label: 'Xuất bản', value: '86 bài mới' },
      ],
      targetTab: 'generator',
      badgeText: 'Mnemonic AI Engine',
      badgeType: 'purple',
    },
  ];
}

import {
  Trophy,
  Zap,
  CheckCircle2,
  Code2,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from 'lucide-react';
import type { Season } from '../types';
import { Card } from './Primitives';
import { formatNumber } from '../utils';

interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  trend?: { dir: 'up' | 'down'; value: string };
  iconClass: string;
}

const STATS: StatItem[] = [
  {
    icon: Trophy,
    label: 'Hạng hiện tại',
    value: '#7',
    sub: 'Trong 12.480 người tham gia',
    trend: { dir: 'up', value: 'Tăng 3 hạng' },
    iconClass: 'bg-violet-100 text-violet-600',
  },
  {
    icon: Zap,
    label: 'Tổng điểm tích lũy',
    value: '5.840',
    sub: 'Cách Top 3 còn 1.180 điểm',
    trend: { dir: 'up', value: '+320 tuần này' },
    iconClass: 'bg-amber-100 text-amber-600',
  },
  {
    icon: CheckCircle2,
    label: 'Bài đã hoàn thành',
    value: '32',
    sub: 'Trên tổng 48 thử thách',
    trend: { dir: 'up', value: '+5 tuần này' },
    iconClass: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: Code2,
    label: 'Lượt nộp bài thành công',
    value: '184',
    sub: 'Tỉ lệ chấp nhận 78%',
    trend: { dir: 'up', value: '+18 tuần này' },
    iconClass: 'bg-blue-100 text-blue-600',
  },
];

function StatCard({ stat, delay }: { stat: StatItem; delay: number }) {
  const Icon = stat.icon;
  return (
    <Card
      className={`stat-card animate-fade-in-up p-5 transition-shadow hover:shadow-md [animation-delay:${delay}ms]`}
    >
      <div className="flex items-start justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${stat.iconClass}`}>
          <Icon className="h-5 w-5" />
        </span>
        {stat.trend && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${
              stat.trend.dir === 'up' ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            {stat.trend.dir === 'up' ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {stat.trend.value}
          </span>
        )}
      </div>
      <p className="stat-card-value mt-4 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
      <p className="stat-card-label mt-1 text-sm font-medium text-slate-700">{stat.label}</p>
      <p className="stat-card-sub mt-0.5 text-xs text-slate-400">{stat.sub}</p>
    </Card>
  );
}

interface MyStatsProps {
  season: Season;
  participated: boolean;
}

export function MyStats({ season, participated }: MyStatsProps) {
  if (!participated) {
    return (
      <Card className="not-participated-card flex flex-col items-center justify-center px-6 py-12 text-center">
        <span className="not-participated-icon grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
          <Trophy className="h-7 w-7" />
        </span>
        <h3 className="not-participated-title mt-4 text-lg font-bold text-slate-800">Bạn chưa tham gia mùa giải</h3>
        <p className="not-participated-desc mt-1.5 max-w-sm text-sm text-slate-500">
          Tham gia ngay để bắt đầu tích lũy điểm, giải bài và leo lên bảng xếp hạng Code Warriors.
        </p>
        <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-transform hover:scale-[1.02] active:scale-95">
          <Zap className="h-4 w-4" /> Tham gia ngay
        </button>
      </Card>
    );
  }

  // Pull a couple values from the season to keep them in sync with banner.
  const stats: StatItem[] = STATS.map((s) =>
    s.label === 'Hạng hiện tại'
      ? { ...s, value: `#${season.userRank}`, sub: `Trong ${formatNumber(season.participants)} người tham gia` }
      : s.label === 'Tổng điểm tích lũy'
        ? { ...s, value: formatNumber(season.userPoints) }
        : s,
  );

  return (
    <div className="grid gap-4 stagger sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} delay={0} />
      ))}
    </div>
  );
}

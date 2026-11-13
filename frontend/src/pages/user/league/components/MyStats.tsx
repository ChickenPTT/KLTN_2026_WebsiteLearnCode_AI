import { Trophy, CheckCircle2, Clock, RotateCcw, LogIn, type LucideIcon } from 'lucide-react';
import type { ContestSeason, MyStanding } from '@/lib/contestApi';
import { Card } from './Primitives';
import { formatNumber } from '../utils';
import { formatClock } from '@/lib/contestApi';

interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  iconClass: string;
}

function StatCard({ stat }: { stat: StatItem }) {
  const Icon = stat.icon;
  return (
    <Card className="stat-card animate-fade-in-up p-5 transition-shadow hover:shadow-md">
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${stat.iconClass}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="stat-card-value mt-4 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
      <p className="stat-card-label mt-1 text-sm font-medium text-slate-700">{stat.label}</p>
      <p className="stat-card-sub mt-0.5 text-xs text-slate-400">{stat.sub}</p>
    </Card>
  );
}

interface MyStatsProps {
  season: ContestSeason;
  me: MyStanding | null;
  isLoggedIn: boolean;
  onLogin?: () => void;
}

export function MyStats({ season, me, isLoggedIn, onLogin }: MyStatsProps) {
  if (!isLoggedIn || !me) {
    return (
      <Card className="not-participated-card flex flex-col items-center justify-center px-6 py-12 text-center">
        <span className="not-participated-icon grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
          <Trophy className="h-7 w-7" />
        </span>
        <h3 className="not-participated-title mt-4 text-lg font-bold text-slate-800">Đăng nhập để thi đấu</h3>
        <p className="not-participated-desc mt-1.5 max-w-sm text-sm text-slate-500">
          Đăng nhập để bắt đầu lượt thi và xem thứ hạng của bạn trong mùa giải.
        </p>
        {onLogin && (
          <button
            onClick={onLogin}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-transform hover:scale-[1.02] active:scale-95"
          >
            <LogIn className="h-4 w-4" /> Đăng nhập
          </button>
        )}
      </Card>
    );
  }

  const best = me.best;
  const stats: StatItem[] = [
    {
      icon: Trophy,
      label: 'Hạng hiện tại',
      value: me.rank ? `#${me.rank}` : '—',
      sub: me.rank ? `Trong ${formatNumber(season.participants)} người tham gia` : 'Hoàn thành 1 lượt để có thứ hạng',
      iconClass: 'bg-violet-100 text-violet-600',
    },
    {
      icon: CheckCircle2,
      label: 'Bài làm đúng',
      value: best ? `${best.solvedCount}/${season.problemCount}` : '—',
      sub: best ? `Lượt tốt nhất: lượt ${best.attemptNo}` : 'Chưa có lượt nào hoàn thành',
      iconClass: 'bg-emerald-100 text-emerald-600',
    },
    {
      icon: Clock,
      label: 'Thời gian làm bài',
      value: best ? formatClock(best.totalTimeSeconds) : '—',
      sub: 'Tổng thời gian các bài làm đúng',
      iconClass: 'bg-amber-100 text-amber-600',
    },
    {
      icon: RotateCcw,
      label: 'Lượt thi còn lại',
      value: `${me.attemptsLeft}/${season.maxAttempts}`,
      sub: `Đã dùng ${me.attemptsUsed} lượt`,
      iconClass: 'bg-blue-100 text-blue-600',
    },
  ];

  return (
    <div className="grid gap-4 stagger sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}

import {
  Crown,
  Lock,
  Brain,
  Rocket,
  Flame,
  Zap,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import type { UserAchievement, AchievementRarity } from '../types';
import { Card } from './Primitives';

const ACHIEVEMENT_ICONS: Record<UserAchievement['icon'], LucideIcon> = {
  crown: Crown,
  brain: Brain,
  rocket: Rocket,
  flame: Flame,
  zap: Zap,
  trophy: Trophy,
};

const RARITY_META: Record<
  AchievementRarity,
  { label: string; classes: string; glow: string }
> = {
  common: {
    label: 'Phổ biến',
    classes: 'text-slate-600 ring-slate-200',
    glow: 'shadow-none',
  },
  rare: {
    label: 'Hiếm',
    classes: 'text-blue-600 ring-blue-200',
    glow: 'shadow-md shadow-blue-500/10',
  },
  epic: {
    label: 'Sử thi',
    classes: 'text-violet-600 ring-violet-200',
    glow: 'shadow-md shadow-violet-500/15',
  },
  legendary: {
    label: 'Huyền thoại',
    classes: 'text-amber-600 ring-amber-200',
    glow: 'shadow-lg shadow-amber-500/20',
  },
};

function AchievementCard({ ach }: { ach: UserAchievement }) {
  const Icon = ACHIEVEMENT_ICONS[ach.icon];
  const r = RARITY_META[ach.rarity];
  return (
    <div
      className={`achievement-card achievement-rarity-${ach.rarity} ${
        ach.earned ? 'is-earned' : 'is-unearned'
      } group relative flex flex-col items-center rounded-2xl border bg-white p-5 text-center ring-1 transition-all ${r.classes} ${
        ach.earned ? `hover:-translate-y-0.5 ${r.glow}` : 'opacity-70'
      }`}
    >
      <span
        className={`achievement-icon-wrap grid h-12 w-12 place-items-center rounded-xl ${
          ach.earned ? r.classes : 'bg-slate-100 text-slate-400'
        }`}
      >
        {ach.earned ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
      </span>
      <h4 className="achievement-title mt-3 text-sm font-bold text-slate-900">{ach.title}</h4>
      <p className="achievement-desc mt-1 text-xs leading-relaxed text-slate-500">{ach.desc}</p>
      <div className="mt-3 flex items-center gap-2">
        <span
          className={`achievement-rarity-pill rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${r.classes}`}
        >
          {r.label}
        </span>
        <span className="achievement-status-date text-[10px] font-medium text-slate-400">
          {ach.earned ? ach.date : 'Chưa đạt'}
        </span>
      </div>
    </div>
  );
}

interface RewardsProps {
  achievements: UserAchievement[];
  rewards?: unknown[];
}

export function Rewards({ achievements }: RewardsProps) {
  const earned = achievements.filter((a) => a.earned).length;
  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="achievement-header-icon h-5 w-5 text-amber-500" />
            <h3 className="league-card-title text-base font-bold text-slate-900">Thành tựu & danh hiệu</h3>
          </div>
          <span className="leaderboard-count-badge rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
            {earned}/{achievements.length} đã đạt
          </span>
        </div>
        <p className="league-card-subtitle mt-1 text-sm text-slate-500">
          Sưu tập huy hiệu và danh hiệu đặc biệt qua các mùa giải
        </p>
        <div className="mt-6 grid gap-4 stagger sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a) => (
            <AchievementCard key={a.id} ach={a} />
          ))}
        </div>
      </Card>
    </div>
  );
}

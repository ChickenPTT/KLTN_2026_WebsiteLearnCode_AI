import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Difficulty, RankMovement } from '../types';

export function RankMovement({ change, amount }: { change: RankMovement; amount: number }) {
  if (change === 'up') {
    return (
      <span className="rank-move-up inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-600">
        <TrendingUp className="h-3 w-3" />
        {amount}
      </span>
    );
  }
  if (change === 'down') {
    return (
      <span className="rank-move-down inline-flex items-center gap-0.5 rounded-full bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-500">
        <TrendingDown className="h-3 w-3" />
        {amount}
      </span>
    );
  }
  return (
    <span className="rank-move-neutral inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-400">
      <Minus className="h-3 w-3" />
    </span>
  );
}

const DIFF_META: Record<Difficulty, { label: string; classes: string; dot: string }> = {
  beginner: {
    label: 'Mới bắt đầu',
    classes: 'bg-slate-500/10 text-slate-400 ring-slate-500/20',
    dot: 'bg-slate-400',
  },
  basic: {
    label: 'Cơ bản',
    classes: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  intermediate: {
    label: 'Trung bình',
    classes: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
    dot: 'bg-blue-400',
  },
  advanced: {
    label: 'Khá',
    classes: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    dot: 'bg-amber-400',
  },
  expert: {
    label: 'Nâng cao',
    classes: 'bg-purple-500/10 text-purple-400 ring-purple-500/20',
    dot: 'bg-purple-400',
  },
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const m = DIFF_META[difficulty] || DIFF_META.basic;
  return (
    <span
      className={`league-diff-badge league-diff-${difficulty} inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${m.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

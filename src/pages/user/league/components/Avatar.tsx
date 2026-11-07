import { gradientFromSeed } from '../utils';
import { Crown, Medal, Award } from 'lucide-react';

interface AvatarProps {
  seed: string;
  initials: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;
}

const SIZES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-14 w-14 text-base',
};

export function Avatar({ seed, initials, size = 'md', ring = false }: AvatarProps) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full font-bold text-white ${
        SIZES[size]
      } ${ring ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-50' : ''}`}
      style={{ background: gradientFromSeed(seed) }}
    >
      {initials}
    </span>
  );
}

interface RankBadgeProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
}

// Top-3 rank visuals: gold / silver / bronze.
export function RankBadge({ rank, size = 'md' }: RankBadgeProps) {
  const dims = size === 'lg' ? 'h-11 w-11' : size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
  const text = size === 'lg' ? 'text-base' : 'text-sm';

  if (rank === 1) {
    return (
      <span
        className={`relative grid ${dims} place-items-center rounded-xl bg-gradient-to-br from-amber-300 to-yellow-500 font-bold text-amber-900 shadow-md shadow-amber-500/40 ${text}`}
      >
        <Crown className={size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} />
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span
        className={`relative grid ${dims} place-items-center rounded-xl bg-gradient-to-br from-slate-300 to-slate-400 font-bold text-slate-700 shadow-md shadow-slate-400/40 ${text}`}
      >
        <Medal className={size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} />
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span
        className={`relative grid ${dims} place-items-center rounded-xl bg-gradient-to-br from-orange-300 to-amber-600 font-bold text-orange-900 shadow-md shadow-amber-700/40 ${text}`}
      >
        <Award className={size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} />
      </span>
    );
  }
  return (
    <span
      className={`rank-badge-default grid ${dims} place-items-center rounded-lg bg-slate-100 font-bold text-slate-500 ${text}`}
    >
      {rank}
    </span>
  );
}

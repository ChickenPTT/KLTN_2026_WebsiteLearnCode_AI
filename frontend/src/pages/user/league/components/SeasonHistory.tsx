import { useState } from 'react';
import {
  History,
  Calendar,
  Trophy,
  Zap,
  Award,
  ChevronRight,
  CheckCircle2,
  Clock,
  Play,
} from 'lucide-react';
import type { Season } from '../types';
import { Card, Badge } from './Primitives';
import { formatDateShort, formatNumber } from '../utils';

function SeasonCard({ season }: { season: Season }) {
  const isCompleted = season.status === 'completed';
  const isActive = season.status === 'active';
  const isUpcoming = season.status === 'upcoming';

  return (
    <div className="season-card group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/10">
      <div
        className={`relative h-24 bg-gradient-to-br ${
          isCompleted
            ? 'from-slate-700 to-slate-900'
            : isUpcoming
              ? 'from-blue-600 to-indigo-700'
              : 'from-violet-600 to-indigo-700'
        }`}
      >
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative flex h-full items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Trophy className="h-5 w-5 text-white" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                Mùa giải
              </p>
              <p className="text-sm font-bold leading-tight text-white">{season.name}</p>
            </div>
          </div>
          {isCompleted ? (
            <Badge color="slate" className="bg-white/15 text-white ring-white/20">
              <CheckCircle2 className="h-3 w-3" /> Đã kết thúc
            </Badge>
          ) : isActive ? (
            <Badge color="green" className="bg-emerald-400/20 text-emerald-100 ring-emerald-300/40">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Đang diễn ra
            </Badge>
          ) : (
            <Badge color="blue" className="bg-blue-400/20 text-blue-100 ring-blue-300/40">
              <Clock className="h-3 w-3" /> Sắp diễn ra
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 py-4">
        <div className="season-card-date flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5" />
          {formatDateShort(season.startDate)} — {formatDateShort(season.endDate)}
        </div>

        <div className="mt-4">
          <div className="season-card-statbox rounded-lg bg-slate-50 p-3">
            <p className="season-card-statlabel text-xs text-slate-400">Hạng cuối cùng</p>
            <p className="season-card-statval mt-0.5 text-lg font-bold text-slate-900">
              {season.userRank > 0 ? `#${season.userRank}` : '—'}
            </p>
          </div>
        </div>

        {season.achievement && (
          <div className="season-card-achievement mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 ring-1 ring-inset ring-amber-200">
            <Award className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700">
              Danh hiệu: {season.achievement}
            </span>
          </div>
        )}

        <div className="season-card-footer mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            {formatNumber(season.participants)} người tham gia
          </span>
          <button className="season-card-link group/btn inline-flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-700">
            Xem chi tiết
            <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface SeasonHistoryProps {
  seasons: Season[];
}

export function SeasonHistory({ seasons }: SeasonHistoryProps) {
  const [tab, setTab] = useState<'all' | 'completed' | 'upcoming'>('all');

  const filtered = seasons.filter((s) => {
    if (tab === 'completed') return s.status === 'completed';
    if (tab === 'upcoming') return s.status === 'upcoming';
    return true;
  });

  return (
    <Card className="p-6 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="season-history-icon grid h-11 w-11 place-items-center rounded-xl bg-violet-100 text-violet-600 ring-1 ring-violet-200">
            <History className="h-5 w-5" />
          </span>
          <div>
            <h2 className="league-section-title text-xl font-bold tracking-tight text-slate-900">Lịch sử mùa giải</h2>
            <p className="league-section-desc mt-0.5 text-sm text-slate-500">
              Nhìn lại thành tích và chuẩn bị cho các mùa sắp tới
            </p>
          </div>
        </div>

        <div className="season-history-tab-wrap flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {(
            [
              { k: 'all', label: 'Tất cả' },
              { k: 'completed', label: 'Đã kết thúc' },
              { k: 'upcoming', label: 'Sắp tới' },
            ] as const
          ).map((o) => (
            <button
              key={o.k}
              onClick={() => setTab(o.k)}
              className={`season-history-tab-btn rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === o.k ? 'is-active bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-5 stagger sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((s) => (
          <SeasonCard key={s.id} season={s} />
        ))}
      </div>
    </Card>
  );
}

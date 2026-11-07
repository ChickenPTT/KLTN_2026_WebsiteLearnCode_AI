import { useMemo, useState } from 'react';
import {
  Code2,
  Play,
  CheckCircle2,
  Loader2,
  Clock,
  Target,
  Zap,
  Filter,
} from 'lucide-react';
import type { Challenge, ChallengeFilter, ChallengeStatus, Difficulty } from '../types';
import { Card } from './Primitives';
import { DifficultyBadge } from './Badges';

const STATUS_META: Record<
  ChallengeStatus,
  { label: string; classes: string; icon: typeof Play }
> = {
  not_started: { label: 'Chưa bắt đầu', classes: 'challenge-status-not-started text-slate-500 bg-slate-100', icon: Play },
  in_progress: { label: 'Đang làm', classes: 'challenge-status-in-progress text-amber-700 bg-amber-100', icon: Loader2 },
  completed: { label: 'Đã hoàn thành', classes: 'challenge-status-completed text-emerald-700 bg-emerald-100', icon: CheckCircle2 },
};

function StatusChip({ status }: { status: ChallengeStatus }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span
      className={`challenge-status-chip inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${m.classes}`}
    >
      <Icon className={`h-3 w-3 ${status === 'in_progress' ? 'animate-spin' : ''}`} />
      {m.label}
    </span>
  );
}

const DIFF_OPTIONS: { key: Difficulty | 'all'; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'beginner', label: 'Mới bắt đầu' },
  { key: 'basic', label: 'Cơ bản' },
  { key: 'intermediate', label: 'Trung bình' },
  { key: 'advanced', label: 'Khá' },
  { key: 'expert', label: 'Nâng cao' },
];

const STATUS_OPTIONS: { key: ChallengeStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'not_started', label: 'Chưa làm' },
  { key: 'in_progress', label: 'Đang làm' },
  { key: 'completed', label: 'Đã xong' },
];

interface ChallengesProps {
  challenges: Challenge[];
  onSolveChallenge?: (challenge: Challenge) => void;
}

export function Challenges({ challenges, onSolveChallenge }: ChallengesProps) {
  const [filter, setFilter] = useState<ChallengeFilter>({
    difficulty: 'all',
    topic: 'all',
    status: 'all',
  });

  const topics = useMemo(
    () => ['all', ...Array.from(new Set(challenges.map((c) => c.topic)))],
    [challenges],
  );

  const filtered = useMemo(
    () =>
      challenges.filter(
        (c) =>
          (filter.difficulty === 'all' || c.difficulty === filter.difficulty) &&
          (filter.topic === 'all' || c.topic === filter.topic) &&
          (filter.status === 'all' || c.status === filter.status),
      ),
    [challenges, filter],
  );

  return (
    <Card className="overflow-hidden">
      {/* Filters */}
      <div className="league-card-header flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="challenge-filter-icon h-4 w-4 text-slate-400" />
          <span className="league-card-title text-sm font-semibold text-slate-700">Lọc thử thách</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="challenge-filter-pill-wrap flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            {DIFF_OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => setFilter((f) => ({ ...f, difficulty: o.key }))}
                className={`challenge-filter-pill rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  filter.difficulty === o.key
                    ? 'is-active bg-white text-violet-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          <select
            value={filter.topic}
            onChange={(e) => setFilter((f) => ({ ...f, topic: e.target.value }))}
            className="challenge-filter-pill-wrap rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 outline-none focus:border-violet-400"
          >
            {topics.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'Chủ đề' : t}
              </option>
            ))}
          </select>

          <select
            value={filter.status}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value as ChallengeStatus | 'all' }))}
            className="challenge-filter-pill-wrap rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 outline-none focus:border-violet-400"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="p-5 sm:p-6">
        {filtered.length === 0 ? (
          <div className="grid place-items-center py-12 text-center">
            <Code2 className="h-10 w-10 text-slate-300" />
            <p className="league-card-subtitle mt-3 text-sm text-slate-500">Không có thử thách phù hợp bộ lọc.</p>
          </div>
        ) : (
          <div className="grid gap-4 stagger sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => {
              const done = c.status === 'completed';
              return (
                <div
                  key={c.id}
                  className="challenge-row group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <DifficultyBadge difficulty={c.difficulty} />
                    <StatusChip status={c.status} />
                  </div>

                  <h3 className="challenge-title mt-3.5 text-base font-bold leading-snug text-slate-900">
                    {c.title}
                  </h3>

                  <div className="challenge-meta-time mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Target className="h-3.5 w-3.5" /> {c.topic}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> ~{c.solveTime} phút
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {Math.round(c.acceptedRate * 100)}% AC
                    </span>
                  </div>

                  <div className="challenge-card-footer mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="challenge-points inline-flex items-center gap-1.5 font-mono text-sm font-bold text-amber-600">
                      <Zap className="h-4 w-4 fill-amber-100 text-amber-500" />+{c.points}
                      <span className="challenge-points-label text-xs font-medium text-slate-400">điểm</span>
                    </span>
                    <button
                      disabled={done}
                      onClick={() => !done && onSolveChallenge?.(c)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all ${
                        done
                          ? 'challenge-btn-completed cursor-default bg-emerald-50 text-emerald-600'
                          : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20 hover:scale-[1.03] active:scale-95'
                      }`}
                    >
                      {done ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> Đã xong
                        </>
                      ) : c.status === 'in_progress' ? (
                        <>
                          <Loader2 className="h-4 w-4" /> Tiếp tục
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 fill-current" /> Làm bài
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

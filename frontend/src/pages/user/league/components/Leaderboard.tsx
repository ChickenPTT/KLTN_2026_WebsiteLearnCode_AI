import { useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Crown, Medal, Award, Users, Trophy, Clock } from 'lucide-react';
import type { LeaderboardRow } from '@/lib/contestApi';
import { formatClock } from '@/lib/contestApi';
import { Card } from './Primitives';
import { Avatar, RankBadge } from './Avatar';
import { formatNumber } from '../utils';

const PAGE_SIZE = 10;

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function seedOf(row: LeaderboardRow): string {
  return `${row.userId}-${row.name}`;
}

interface LeaderboardProps {
  rows: LeaderboardRow[];
  problemCount: number;
  loading?: boolean;
}

function Top3Podium({ rows, problemCount }: { rows: LeaderboardRow[]; problemCount: number }) {
  const heights = ['h-28', 'h-36', 'h-24'];
  const meta = [
    rows[1] && { ...rows[1], place: 2 },
    rows[0] && { ...rows[0], place: 1 },
    rows[2] && { ...rows[2], place: 3 },
  ];

  return (
    <div className="grid grid-cols-3 items-end gap-3 sm:gap-5">
      {meta.map((p, i) =>
        !p ? (
          <div key={`empty-${i}`} />
        ) : (
          <div key={p.userId} className="flex flex-col items-center">
            {p.place === 1 && (
              <Crown className="mb-1.5 h-7 w-7 animate-float-slow fill-amber-400 text-amber-500 drop-shadow" />
            )}
            <div className="relative">
              <Avatar seed={seedOf(p)} initials={initialsOf(p.name)} size={p.place === 1 ? 'xl' : 'lg'} ring />
              <span
                className={`podium-rank-badge absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full text-xs font-bold ring-2 ring-white ${
                  p.place === 1
                    ? 'bg-amber-400 text-amber-900'
                    : p.place === 2
                      ? 'bg-slate-300 text-slate-700'
                      : 'bg-orange-400 text-orange-900'
                }`}
              >
                {p.place}
              </span>
            </div>
            <p className="podium-player-name mt-2.5 max-w-[140px] truncate text-center text-sm font-semibold text-slate-800">
              {p.name}
            </p>
            <p className="podium-player-points inline-flex items-center gap-1.5 font-mono text-sm font-bold text-violet-600">
              {p.solvedCount}/{problemCount} bài
              <span className="text-slate-300">·</span>
              <Clock className="h-3.5 w-3.5" />
              {formatClock(p.totalTimeSeconds)}
            </p>
            <div
              className={`mt-3 w-full ${heights[i]} rounded-t-xl border border-b-0 border-slate-200 ${
                p.place === 1
                  ? 'podium-pillar-1 bg-gradient-to-b from-amber-100 to-amber-50'
                  : p.place === 2
                    ? 'podium-pillar-2 bg-gradient-to-b from-slate-100 to-slate-50'
                    : 'podium-pillar-3 bg-gradient-to-b from-orange-100 to-orange-50'
              }`}
            >
              <div className="flex h-full flex-col items-center justify-end pb-3">
                {p.place === 1 ? (
                  <Medal className="h-6 w-6 text-amber-500" />
                ) : p.place === 2 ? (
                  <Medal className="h-6 w-6 text-slate-400" />
                ) : (
                  <Award className="h-6 w-6 text-orange-500" />
                )}
                <span className="podium-rank-label mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Hạng {p.rank}
                </span>
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  );
}

export function Leaderboard({ rows, problemCount, loading }: LeaderboardProps) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => r.name.toLowerCase().includes(q)) : rows;
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {rows.length > 0 && (
        <Card className="overflow-hidden">
          <div className="league-card-header border-b border-slate-100 px-6 py-5 sm:px-8">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h3 className="league-card-title text-base font-bold text-slate-900">Bục vinh quang Top 3</h3>
            </div>
            <p className="league-card-subtitle mt-1 text-sm text-slate-500">
              Xếp theo số bài đúng, sau đó số lượt đã dùng (ít hơn) và tổng thời gian (nhanh hơn)
            </p>
          </div>
          <div className="podium-banner bg-gradient-to-b from-violet-50/50 to-white px-6 pb-8 pt-6 sm:px-8">
            <Top3Podium rows={rows} problemCount={problemCount} />
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="league-card-header flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-600" />
            <h3 className="league-card-title text-base font-bold text-slate-900">Bảng xếp hạng đầy đủ</h3>
            <span className="leaderboard-count-badge rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
              {formatNumber(filtered.length)}
            </span>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm học viên theo tên..."
              className="leaderboard-search-input w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="leaderboard-table w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="w-16 px-5 py-3 sm:px-6">Hạng</th>
                <th className="px-3 py-3">Học viên</th>
                <th className="px-3 py-3 text-center">Bài đúng</th>
                <th className="px-3 py-3 text-center">Số lượt</th>
                <th className="px-5 py-3 text-right sm:px-6">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                    Đang tải bảng xếp hạng...
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                    {rows.length === 0
                      ? 'Chưa có ai hoàn thành lượt thi nào trong mùa giải này.'
                      : 'Không tìm thấy học viên phù hợp.'}
                  </td>
                </tr>
              ) : (
                pageRows.map((r) => (
                  <tr
                    key={r.userId}
                    className={`group border-b border-slate-50 transition-colors last:border-0 ${
                      r.me ? 'is-current-user bg-violet-50/70 hover:bg-violet-50' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="px-5 py-3.5 sm:px-6">
                      <div className="flex items-center gap-1.5">
                        <RankBadge rank={r.rank} />
                        {r.me && (
                          <span className="rounded-md bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            Bạn
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar seed={seedOf(r)} initials={initialsOf(r.name)} size="md" />
                        <p className="player-name truncate font-semibold text-slate-800">{r.name}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <span className="player-completed font-medium text-slate-700">{r.solvedCount}</span>
                      <span className="player-total text-slate-400"> / {problemCount}</span>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <span className="player-submissions font-mono text-slate-600">{r.attemptsUsed}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right sm:px-6">
                      <span className="player-points whitespace-nowrap font-mono font-semibold text-slate-900">
                        {formatClock(r.totalTimeSeconds)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="league-card-header flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:px-6">
            <p className="pagination-info text-xs text-slate-500">
              Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} trên{' '}
              {filtered.length} học viên
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="pagination-btn grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Trang trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`pagination-btn h-8 min-w-8 rounded-lg px-2 text-sm font-medium transition-colors ${
                    n === safePage
                      ? 'is-active bg-violet-600 text-white shadow-sm shadow-violet-500/30'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="pagination-btn grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Trang sau"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

 import { Play, RotateCcw, Lock, Clock, Shuffle, SkipForward, ListChecks, Loader2 } from 'lucide-react';
import type { ContestSeason, MyStanding } from '@/lib/contestApi';
import { formatClock } from '@/lib/contestApi';
import { Card } from './Primitives';
import { formatDateShort } from '../utils';

interface ContestPanelProps {
  season: ContestSeason;
  me: MyStanding | null;
  isLoggedIn: boolean;
  starting: boolean;
  error: string | null;
  onStart: () => void;
  onRegister: () => void;
  onUnregister: () => void;
  onLogin: () => void;
}

export function ContestPanel({
  season,
  me,
  isLoggedIn,
  starting,
  error,
  onStart,
  onRegister,
  onUnregister,
  onLogin,
}: ContestPanelProps) {
  const active = season.status === 'ACTIVE';
  const ended = season.status === 'ENDED';
  const resuming = !!me?.inProgressAttemptId;
  const outOfAttempts = !!me && me.attemptsLeft <= 0 && !resuming;
  const noProblems = season.problemCount === 0;
  const registered = !!me?.registered;
  // Bước đăng ký: đã đăng nhập, chưa đăng ký, mùa chưa kết thúc
  const needRegister = isLoggedIn && !registered && !ended;
  // Chỉ được hủy khi chưa thi lượt nào
  const canUnregister = isLoggedIn && registered && !ended && (me?.attemptsUsed ?? 0) === 0;

  let buttonLabel = 'Bắt đầu lượt thi';
  if (!isLoggedIn) buttonLabel = 'Đăng nhập để thi';
  else if (needRegister) buttonLabel = 'Đăng ký tham gia';
  else if (registered && season.status === 'UPCOMING') buttonLabel = 'Đã đăng ký – chờ mùa giải mở';
  else if (resuming) buttonLabel = 'Tiếp tục lượt đang làm';
  else if (me && me.attemptsUsed > 0) buttonLabel = `Thi lại (lượt ${me.attemptsUsed + 1}/${season.maxAttempts})`;

  const onClick = !isLoggedIn ? onLogin : needRegister ? onRegister : onStart;
  const disabled = starting || (isLoggedIn && !needRegister && (!active || noProblems || outOfAttempts));
  let note: string | null = null;
  if (needRegister) note = 'Bạn cần đăng ký trước khi thi.';
  else if (season.status === 'UPCOMING') note = 'Mùa giải chưa bắt đầu.';
  else if (ended) note = 'Mùa giải đã kết thúc.';
  else if (noProblems) note = 'Mùa giải chưa có đề thi.';
  else if (outOfAttempts) note = `Bạn đã dùng hết ${season.maxAttempts} lượt thi.`;

  const rules = [
    { icon: ListChecks, text: `Mỗi lượt gồm ${season.problemCount || 4} bài, mọi người làm cùng bộ đề.` },
    { icon: Shuffle, text: 'Thứ tự bài được xáo ngẫu nhiên, hiện từng bài một.' },
    { icon: Clock, text: `Mỗi lượt có ${season.timeLimitMinutes} phút. Hết giờ, bài chưa xong tính là sai.` },
    { icon: SkipForward, text: 'Được nộp lại không giới hạn. Bài bỏ qua tính là sai và không quay lại được.' },
    { icon: RotateCcw, text: `Tối đa ${season.maxAttempts} lượt. Bảng xếp hạng lấy lượt tốt nhất của bạn.` },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <Card className="p-6">
        <h3 className="league-card-title text-base font-bold text-slate-900">Luật thi</h3>
        <ul className="mt-4 space-y-3">
          {rules.map((r) => (
            <li key={r.text} className="flex items-start gap-3 text-sm text-slate-600">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-600">
                <r.icon className="h-4 w-4" />
              </span>
              <span className="pt-1">{r.text}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={onClick}
          disabled={disabled}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-transform hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : outOfAttempts ? <Lock className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
          {buttonLabel}
        </button>
        {note && isLoggedIn && <p className="mt-2 text-center text-xs text-slate-500">{note}</p>}
        {canUnregister && (
          <button
            onClick={onUnregister}
            disabled={starting}
            className="mt-2 block w-full text-center text-xs font-medium text-slate-500 underline hover:text-red-500 disabled:opacity-50"
          >
            Hủy đăng ký
          </button>
        )}
        {error && <p className="mt-2 text-center text-xs font-medium text-red-500">{error}</p>}
      </Card>

      <Card className="overflow-hidden">
        <div className="league-card-header border-b border-slate-100 px-6 py-4">
          <h3 className="league-card-title text-base font-bold text-slate-900">Các lượt thi của bạn</h3>
        </div>
        {!isLoggedIn || !me || me.attempts.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-400">
            {isLoggedIn ? 'Bạn chưa thi lượt nào trong mùa giải này.' : 'Đăng nhập để xem các lượt thi.'}
          </p>
        ) : (
          <table className="leaderboard-table w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Lượt</th>
                <th className="px-3 py-3">Ngày</th>
                <th className="px-3 py-3 text-center">Bài đúng</th>
                <th className="px-6 py-3 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {me.attempts.map((a) => {
                const isBest = me.best?.attemptNo === a.attemptNo;
                return (
                  <tr key={a.id} className={`border-b border-slate-50 last:border-0 ${isBest ? 'is-current-user bg-violet-50/70' : ''}`}>
                    <td className="px-6 py-3 font-semibold text-slate-800">
                      #{a.attemptNo}
                      {isBest && (
                        <span className="ml-2 rounded-md bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                          Tốt nhất
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-500">{formatDateShort(a.startedAt)}</td>
                    <td className="px-3 py-3 text-center text-slate-700">
                      {a.status === 'IN_PROGRESS' ? (
                        <span className="text-amber-600">Đang làm</span>
                      ) : (
                        `${a.solvedCount}/${season.problemCount}`
                      )}
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-slate-700">
                      {a.status === 'IN_PROGRESS' ? '—' : formatClock(a.totalTimeSeconds)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

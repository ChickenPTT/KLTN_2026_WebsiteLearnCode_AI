import { useEffect, useState } from 'react';
import {
  Calendar,
  Users,
  Sparkles,
  Clock,
  Play,
  ChevronRight,
} from 'lucide-react';
import type { Season } from '../types';
import { formatDateLong, formatDuration, formatNumber, getTimeRemaining } from '../utils';

function CountdownUnit({ value, label }: { value: number; label: string }) {
  const v = value.toString().padStart(2, '0');
  return (
    <div className="flex flex-col items-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/20 bg-white/10 font-mono text-2xl font-bold text-white tabular-nums backdrop-blur-sm sm:h-[72px] sm:w-[72px] sm:text-3xl">
        {v}
      </div>
      <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-200/90 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

function StatusPill({ status }: { status: Season['status'] }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-inset ring-emerald-300/40">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
        </span>
        Đang diễn ra
      </span>
    );
  }
  if (status === 'upcoming') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-400/20 px-3 py-1 text-xs font-semibold text-blue-100 ring-1 ring-inset ring-blue-300/40">
        <Sparkles className="h-3 w-3" /> Sắp diễn ra
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-400/20 px-3 py-1 text-xs font-semibold text-slate-100 ring-1 ring-inset ring-slate-300/40">
      Đã kết thúc
    </span>
  );
}

interface HeroBannerProps {
  season: Season;
  onSeasonChange?: (status: Season['status']) => void;
  /** Tổng thời gian làm bài của học viên trong mùa (phút) */
  userTimeMinutes?: number;
  /** Nút chính khi mùa đang diễn ra (bắt đầu / tiếp tục lượt thi) */
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;

}

export function HeroBanner({
  season,
  onSeasonChange,
  userTimeMinutes,
  primaryLabel = 'Tham gia thử thách',
  onPrimary,
  primaryDisabled,
}: HeroBannerProps) {
  const [time, setTime] = useState(() =>
    getTimeRemaining(season.status === 'upcoming' ? season.startDate : season.endDate),
  );

  useEffect(() => {
    const target = season.status === 'upcoming' ? season.startDate : season.endDate;
    const id = setInterval(() => setTime(getTimeRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [season]);

  const isUpcoming = season.status === 'upcoming';
  const isCompleted = season.status === 'completed';
  const countdownLabel = isUpcoming
    ? 'Bắt đầu sau'
    : isCompleted
      ? 'Mùa giải đã kết thúc'
      : 'Kết thúc sau';

  return (
    <section className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-[#2a1a5e] via-[#3b1d8a] to-[#5b2a9e] shadow-2xl shadow-violet-900/30">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-violet-400/20 blur-2xl" />

      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      <div className="relative px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Left: info */}
          <div className="animate-fade-in-up">
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill status={season.status} />
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-200/80">
                <Sparkles className="h-3.5 w-3.5" /> Mùa giải chính thức
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              <span className="shimmer-text">{season.name}</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-violet-100/80 sm:text-base">
              {season.status === 'active'
                ? 'Thi đấu với hàng ngàn sinh viên CNTT, giải bài mỗi ngày và leo lên đỉnh cao bảng xếp hạng mùa này.'
                : season.status === 'upcoming'
                  ? 'Mùa giải mới sắp mở. Đăng ký ngay để nhận thông báo và tham gia ngay khi đấu trường mở cửa.'
                  : 'Mùa giải đã khép lại. Xem lại thành tích và chuẩn bị cho mùa giải tiếp theo.'}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-violet-100/90">
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4 text-violet-300" />
                {formatDateLong(season.startDate)} — {formatDateLong(season.endDate)}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <span className="inline-flex items-center gap-2 font-medium text-white">
                <Users className="h-4 w-4 text-violet-300" />
                {formatNumber(season.participants)} người tham gia
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-6 max-w-md">
              <div className="flex items-center justify-between text-xs font-medium text-violet-200/80">
                <span>Tiến độ mùa giải</span>
                <span>{Math.round(season.progress * 100)}%</span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 via-fuchsia-400 to-violet-300 transition-all duration-700"
                  style={{ width: `${Math.max(4, season.progress * 100)}%` }}
                />
              </div>
            </div>

            {/* CTA buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {isCompleted ? (
                <button
                  disabled
                  className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white/60 ring-1 ring-inset ring-white/20"
                >
                  Mùa giải đã kết thúc
                </button>
              ) : isUpcoming ? (
                <button
                  onClick={onPrimary}
                  disabled={primaryDisabled}
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                >
                  <Sparkles className="h-4 w-4" />
                  {primaryLabel}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              ) : (
                <button
                  onClick={onPrimary}
                  disabled={primaryDisabled}
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-lg shadow-violet-900/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                >
                  <Play className="h-4 w-4 fill-current" />
                  {primaryLabel}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              )}

              {onSeasonChange && (
                <button
                  onClick={() => onSeasonChange('upcoming')}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm transition-colors hover:bg-white/15"
                >
                  Xem mùa sắp tới
                </button>
              )}
            </div>
          </div>

          {/* Right: countdown card */}
          <div className="animate-fade-in-up rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md [animation-delay:120ms] sm:p-7">
            <div className="flex items-center gap-2 text-sm font-semibold text-violet-100">
              <Clock className="h-4 w-4 text-amber-300" />
              {countdownLabel}
            </div>

            {isCompleted ? (
              <div className="mt-6 grid place-items-center py-6 text-center">
                <p className="text-4xl font-extrabold text-white">Mùa đã kết thúc</p>
                <p className="mt-2 text-sm text-violet-200/80">Cảm ơn bạn đã tham gia!</p>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-4">
                <CountdownUnit value={time.days} label="Ngày" />
                <CountdownUnit value={time.hours} label="Giờ" />
                <CountdownUnit value={time.minutes} label="Phút" />
                <div className="col-span-3 mt-1 flex items-center justify-center gap-1.5 font-mono text-sm text-violet-200/80">
                  <span className="tabular-nums">{time.seconds.toString().padStart(2, '0')}</span>
                  <span>giây</span>
                </div>
              </div>
            )}

            {season.status === 'active' && (
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
                <div className="rounded-xl bg-white/5 p-3.5">
                  <p className="text-xs font-medium text-violet-200/70">Hạng của bạn</p>
                  <p className="mt-1 text-2xl font-bold text-white">{season.userRank > 0 ? `#${season.userRank}` : '—'}</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3.5">
                  <p className="text-xs font-medium text-violet-200/70">Thời gian làm bài</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {userTimeMinutes != null ? formatDuration(userTimeMinutes) : '—'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Trophy, BarChart3, Swords, History, Loader2 } from 'lucide-react';
import { Header } from '@/layout/Header';
import { Footer } from '@/layout/Footer';
import { useAuth } from '@/hooks/useAuth.tsx';
import type { AuthMode } from '@/types';
import {
  contestApi,
  type ContestCurrent,
  type ContestSeason,
  type LeaderboardRow,
} from '@/lib/contestApi';
import type { UserAchievement } from './types';
import { HeroBanner } from './components/HeroBanner';
import { MyStats } from './components/MyStats';
import { Leaderboard } from './components/Leaderboard';
import { ContestPanel } from './components/ContestPanel';
import { Rewards } from './components/Rewards';
import { SeasonHistory } from './components/SeasonHistory';
import { SectionHeading, Card } from './components/Primitives';
import { secondsToMinutes, toLeagueSeason } from './contestAdapter';

interface LeaguePageProps {
  onGoLanding?: () => void;
  onGoAuth?: (mode: AuthMode) => void;
  onGoTopics?: () => void;
  onGoFlashcards?: () => void;
  onGoFlashcardLibrary?: () => void;
  onGoProfile?: () => void;
  onGoProgress?: () => void;
  onGoHistory?: () => void;
  onGoAdmin?: () => void;
  onGoSettings?: () => void;
  onLoggedOut?: () => void;
  onGoPractice?: (problemId?: string) => void;
  /** Mở trang làm bài của lượt thi */
  onGoContest?: (attemptId: number) => void;
}

function errorText(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

export function LeaguePage({
  onGoLanding,
  onGoAuth,
  onGoTopics,
  onGoFlashcards,
  onGoFlashcardLibrary,
  onGoProfile,
  onGoProgress,
  onGoHistory,
  onGoAdmin,
  onGoSettings,
  onLoggedOut,
  onGoContest,
}: LeaguePageProps) {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [current, setCurrent] = useState<ContestCurrent | null>(null);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [seasons, setSeasons] = useState<ContestSeason[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [startError, setStartError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [cur, seasonList] = await Promise.all([contestApi.current(), contestApi.seasons()]);
      setCurrent(cur);
      setSeasons(seasonList);
      setRows(cur.season ? await contestApi.leaderboard(cur.season.id) : []);
      // Thanh tuu chi co khi da dang nhap
      if (cur.me) {
        const list = await contestApi.achievements().catch(() => []);
        setAchievements(
          list.map((a) => ({
            id: a.id,
            title: a.title,
            desc: a.desc,
            icon: a.icon,
            rarity: a.rarity,
            earned: a.earned,
            date: a.date ? new Date(a.date).toLocaleDateString('vi-VN') : '',
          })),
        );
      } else {
        setAchievements([]);
      }
    } catch (e) {
      setLoadError(errorText(e, 'Không tải được dữ liệu mùa giải.'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải lại khi đăng nhập / đăng xuất để cập nhật phần "của bạn"
  useEffect(() => {
    load();
  }, [load, user?.id]);

  const season = current?.season ?? null;
  const me = current?.me ?? null;

  const registered = !!me?.registered;

  // Đăng ký / hủy đăng ký -> backend trả về trạng thái mới, chỉ cần setCurrent
  const handleRegister = async (cancel = false) => {
    setStarting(true);
    setStartError(null);
    try {
      setCurrent(cancel ? await contestApi.unregister() : await contestApi.register());
    } catch (e) {
      setStartError(errorText(e, cancel ? 'Không hủy đăng ký được.' : 'Không đăng ký được.'));
    } finally {
      setStarting(false);
    }
  };

  const handleStart = async () => {
    if (!isLoggedIn) {
      onGoAuth?.('login');
      return;
    }
    if (!registered) {
      await handleRegister();
      return;
    }
    if (me?.inProgressAttemptId) {
      onGoContest?.(me.inProgressAttemptId);
      return;
    }
    setStarting(true);
    setStartError(null);
    try {
      const attempt = await contestApi.start();
      onGoContest?.(attempt.id);
    } catch (e) {
      setStartError(errorText(e, 'Không bắt đầu được lượt thi.'));
    } finally {
      setStarting(false);
    }
  };

  const leagueSeason = useMemo(() => (season ? toLeagueSeason(season, me?.rank) : null), [season, me?.rank]);
  const historySeasons = useMemo(
    () => seasons.map((s) => toLeagueSeason(s, s.id === season?.id ? me?.rank : null)),
    [seasons, season?.id, me?.rank],
  );

  const outOfAttempts = !!me && me.attemptsLeft <= 0 && !me.inProgressAttemptId;
  const upcoming = season?.status === 'UPCOMING';
  const heroLabel = !isLoggedIn
    ? 'Đăng nhập để thi'
    : !registered
      ? 'Đăng ký tham gia'
      : upcoming
        ? 'Đã đăng ký – chờ mở'
        : me?.inProgressAttemptId
          ? 'Tiếp tục lượt đang làm'
          : outOfAttempts
            ? 'Đã hết lượt thi'
            : 'Bắt đầu lượt thi';
  // Chưa đăng ký thì luôn bấm được (để đăng ký); đã đăng ký thì khóa khi chưa mở / hết lượt / chưa có đề
  const heroDisabled =
    starting ||
    (isLoggedIn && registered && (upcoming || outOfAttempts || (season?.problemCount ?? 0) === 0));

  return (
    <div className="page-shell league-page min-h-screen">
      <Header
        activeView="league"
        onGoLanding={onGoLanding}
        onGoAuth={onGoAuth}
        onGoTopics={onGoTopics}
        onGoFlashcards={onGoFlashcards}
        onGoFlashcardLibrary={onGoFlashcardLibrary}
        onGoProfile={onGoProfile}
        onGoProgress={onGoProgress}
        onGoHistory={onGoHistory}
        onGoAdmin={onGoAdmin}
        onGoSettings={onGoSettings}
        onLoggedOut={onLoggedOut}
      />

      <main id="arena" className="league-main mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {loading && !current ? (
          <div className="grid place-items-center py-32 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="mt-3 text-sm">Đang tải mùa giải...</p>
          </div>
        ) : loadError ? (
          <Card className="px-6 py-12 text-center">
            <p className="text-sm text-red-500">{loadError}</p>
            <button onClick={load} className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">
              Thử lại
            </button>
          </Card>
        ) : !season || !leagueSeason ? (
          <Card className="px-6 py-16 text-center">
            <Trophy className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-lg font-bold text-slate-800">Chưa có mùa giải nào</h2>
            <p className="mt-1 text-sm text-slate-500">Mùa giải thi đấu sẽ sớm được mở. Hãy quay lại sau nhé!</p>
          </Card>
        ) : (
          <>
            {/* A. Season Overview / Hero */}
            <HeroBanner
              season={leagueSeason}
              userTimeMinutes={me?.best ? secondsToMinutes(me.best.totalTimeSeconds) : undefined}
              primaryLabel={heroLabel}
              onPrimary={handleStart}
              primaryDisabled={heroDisabled}
            />

            {/* B. My Competition Statistics */}
            <section className="mt-10">
              <SectionHeading
                eyebrow="Thành tích của bạn"
                title="Thống kê thi đấu"
                description="Kết quả lượt thi tốt nhất của bạn trong mùa giải."
                icon={<BarChart3 className="h-5 w-5" />}
              />
              <div className="mt-5">
                <MyStats season={season} me={me} isLoggedIn={isLoggedIn} onLogin={() => onGoAuth?.('login')} />
              </div>
            </section>

            {/* C. Contest attempts */}
            <section className="mt-12">
              <SectionHeading
                eyebrow="Thi đấu"
                title="Lượt thi của bạn"
                description={`${season.problemCount || 4} bài · ${season.timeLimitMinutes} phút mỗi lượt · tối đa ${season.maxAttempts} lượt`}
                icon={<Swords className="h-5 w-5" />}
              />
              <div className="mt-5">
                <ContestPanel
                  season={season}
                  me={me}
                  isLoggedIn={isLoggedIn}
                  starting={starting}
                  error={startError}
                  onStart={handleStart}
                  onRegister={() => handleRegister()}
                  onUnregister={() => handleRegister(true)}
                  onLogin={() => onGoAuth?.('login')}
                />
              </div>
            </section>

            {/* D. Leaderboard */}
            <section className="mt-12">
              <SectionHeading
                eyebrow="Bảng xếp hạng"
                title="Xếp hạng mùa giải"
                description="Xếp theo số bài đúng, sau đó số lượt đã dùng và tổng thời gian."
                icon={<Trophy className="h-5 w-5" />}
              />
              <div className="mt-5">
                <Leaderboard rows={rows} problemCount={season.problemCount || 4} loading={loading} />
              </div>
            </section>

            {/* E. Achievements & Badges — chỉ hiện khi đã đăng nhập */}
            {isLoggedIn && (
              <>
            <section className="mt-12">
              <SectionHeading
                eyebrow="Huy hiệu & danh hiệu"
                title="Thành tựu cá nhân"
                description="Sưu tập các huy hiệu và danh hiệu đặc biệt qua các mùa giải thi đấu."
                icon={<Trophy className="h-5 w-5" />}
              />
              <div className="mt-5">
                <Rewards achievements={achievements} />
              </div>
            </section>

              </>
            )}

            {/* F. Season History */}
            <section className="mt-12">
              <SectionHeading
                eyebrow="Lưu trữ"
                title="Lịch sử các mùa giải"
                description="Các mùa giải đã và sắp diễn ra."
                icon={<History className="h-5 w-5" />}
              />
              <div className="mt-5">
                <SeasonHistory seasons={historySeasons} />
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

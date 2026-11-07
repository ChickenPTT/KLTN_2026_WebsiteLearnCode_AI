import { useState, useEffect } from 'react';
import { Trophy, BarChart3, Swords, Gift, History } from 'lucide-react';
import { Header } from '@/layout/Header';
import { Footer } from '@/layout/Footer';
import { useAuth } from '@/hooks/useAuth.tsx';
import type { AuthMode } from '@/types';
import { HeroBanner } from './components/HeroBanner';
import { MyStats } from './components/MyStats';
import { Leaderboard } from './components/Leaderboard';
import { Challenges } from './components/Challenges';
import { Rewards } from './components/Rewards';
import { SeasonHistory } from './components/SeasonHistory';
import { SectionHeading } from './components/Primitives';
import {
  achievements,
  challenges,
  CURRENT_USER_ID,
} from './mockData';
import { getStoredSeasons, getStoredPlayers } from '@/lib/leagueService';
import type { Challenge, Season, Player } from './types';

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
  onGoPractice,
}: LeaguePageProps) {
  const { user } = useAuth();

  const [seasonList, setSeasonList] = useState<Season[]>(() => getStoredSeasons());
  const [playerList, setPlayerList] = useState<Player[]>(() => getStoredPlayers());

  useEffect(() => {
    const handleSync = () => {
      setSeasonList(getStoredSeasons());
      setPlayerList(getStoredPlayers());
    };
    window.addEventListener('league_data_changed', handleSync);
    return () => window.removeEventListener('league_data_changed', handleSync);
  }, []);

  // Switch between the active season view and the upcoming season view.
  const [view, setView] = useState<'active' | 'upcoming'>('active');
  const activeSeason = seasonList.find((s) => s.status === 'active') || seasonList[0];
  const upcomingSeason = seasonList.find((s) => s.status === 'upcoming') || activeSeason;
  const season: Season = view === 'active' ? activeSeason : upcomingSeason;

  // A toggle for demonstrating the "user has not participated" state.
  const [participated, setParticipated] = useState(true);

  const handleSolveChallenge = (challenge: Challenge) => {
    // If a problem id or practice handler exists, navigate to practice
    if (onGoPractice) {
      onGoPractice();
    } else if (onGoTopics) {
      onGoTopics();
    }
  };

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
        {/* Season switcher tabs */}
        <div className="mb-6 flex items-center gap-2">
          <div className="league-switcher-container flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setView('active')}
              className={`league-switcher-btn rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                view === 'active' ? 'is-active bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Mùa hiện tại
            </button>
            <button
              onClick={() => setView('upcoming')}
              className={`league-switcher-btn rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                view === 'upcoming' ? 'is-active bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Mùa sắp tới
            </button>
          </div>

          <button
            onClick={() => setParticipated((p) => !p)}
            className="league-status-btn ml-auto rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm transition-colors hover:bg-slate-50"
            title="Chuyển đổi trạng thái tham gia để xem các giao diện khác nhau"
          >
            Trạng thái: {participated ? 'Đã tham gia' : 'Chưa tham gia'}
          </button>
        </div>

        {/* A. Season Overview / Hero */}
        <HeroBanner season={season} onSeasonChange={() => setView('upcoming')} />

        {/* B. My Competition Statistics */}
        <section className="mt-10">
          <SectionHeading
            eyebrow="Thành tích của bạn"
            title="Thống kê thi đấu"
            description="Theo dõi vị thế của bạn trong mùa giải hiện tại."
            icon={<BarChart3 className="h-5 w-5" />}
            action={
              <button
                onClick={() => setParticipated((p) => !p)}
                className="text-xs font-medium text-violet-600 hover:text-violet-700"
              >
                {participated ? 'Ẩn (xem trạng thái chưa tham gia)' : 'Hiện thống kê'}
              </button>
            }
          />
          <div className="mt-5">
            <MyStats season={season} participated={participated && view === 'active'} />
          </div>
        </section>

        {/* C. Leaderboard */}
        <section className="mt-12">
          <SectionHeading
            eyebrow="Bảng xếp hạng"
            title="Xếp hạng mùa giải"
            description="Vị thế hiện tại của bạn so với hàng ngàn sinh viên CNTT khác."
            icon={<Trophy className="h-5 w-5" />}
          />
          <div className="mt-5">
            <Leaderboard players={playerList} currentUserId={CURRENT_USER_ID} />
          </div>
        </section>

        {/* D. Coding Challenges */}
        <section className="mt-12">
          <SectionHeading
            eyebrow="Thử thách lập trình"
            title="Bài tập mùa này"
            description="Giải bài để tích lũy điểm và leo lên bảng xếp hạng."
            icon={<Swords className="h-5 w-5" />}
          />
          <div className="mt-5">
            <Challenges challenges={challenges} onSolveChallenge={handleSolveChallenge} />
          </div>
        </section>

        {/* E. Achievements & Badges */}
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

        {/* F. Season History */}
        <section className="mt-12">
          <SectionHeading
            eyebrow="Lưu trữ"
            title="Lịch sử các mùa giải"
            description="Xem lại thành tích của bạn qua các mùa giải trước."
            icon={<History className="h-5 w-5" />}
          />
          <div className="mt-5">
            <SeasonHistory seasons={seasonList} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

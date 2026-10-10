import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { AuthMode, TopicScore } from '@/types';
import { homePathFor, useAuth } from '@/hooks/useAuth.tsx';
import { FullPageLoader, RequireAuth } from '@/components/RequireAuth';
import { LandingPage } from '@/pages/user/LandingPage';
import { AuthPage } from '@/pages/user/AuthPage';
import { OnboardingPage } from '@/pages/user/OnboardingPage';
import { AssessmentPage } from '@/pages/user/AssessmentPage';
import { QuizPage } from '@/pages/user/QuizPage';
import { ResultPage } from '@/pages/user/ResultPage';
import PracticePage from '@/pages/user/PracticePage';
import { TopicsPage } from '@/pages/user/TopicsPage';
import { TopicDetailPage } from '@/pages/user/TopicDetailPage';
import { ProfilePage } from '@/pages/user/ProfilePage';
import { ProgressPage } from '@/pages/user/ProgressPage';
import { HistoryPage } from '@/pages/user/HistoryPage';
import { SettingsPage } from '@/pages/user/SettingsPage';
import { AdminPage } from '@/pages/admin/AdminPage';
import type { TopicInfo } from '@/types';
import { usePublishedProblems } from '@/hooks/usePublishedProblems';
import { findTopic } from '@/lib/topics';

const topicPath = (t: TopicInfo) => `/topics/${encodeURIComponent(t.name)}`;

/** Cac ham dieu huong truyen xuong page (giu nguyen props cu cua cac page). */
function useAppNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isStaff = user?.role === 'teacher' || user?.role === 'admin';

  const goLanding = () => navigate('/');
  const goAuth = (m: AuthMode) => navigate(m === 'signup' ? '/signup' : '/login');
  const goTopics = () => navigate('/topics');
  // Khong co id (vd. nut Luyen tap chung) -> ve danh sach chu de de chon bai
  const goPractice = (problemId?: string) =>
    navigate(problemId ? `/practice/${encodeURIComponent(problemId)}` : '/topics');
  const goProfile = () => navigate('/profile');
  const goProgress = () => navigate('/progress');
  const goHistory = () => navigate('/history');
  const goSettings = () => navigate('/settings');
  const goAdmin = () => navigate('/admin');
  // Nut "quay lai" o cac trang ca nhan: staff ve dashboard, sinh vien ve trang chu
  const goHomeByRole = () => (isStaff ? goAdmin() : goLanding());
  // Quay lai trang truoc; neu vao thang bang URL (khong co lich su) thi ve fallback
  const goBack = (fallback: string) => (location.key === 'default' ? navigate(fallback) : navigate(-1));

  return {
    user, isStaff, navigate,
    goLanding, goAuth, goTopics, goPractice, goProfile, goProgress,
    goHistory, goSettings, goAdmin, goHomeByRole, goBack,
  };
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

/** /login, /signup: da dang nhap thi chuyen di (ve trang dang muon vao truoc do, hoac trang mac dinh). */
function AuthRoute({ mode }: { mode: AuthMode }) {
  const { user, initializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (initializing) return <FullPageLoader />;
  if (user) {
    const from = (location.state as { from?: string } | null)?.from;
    const target = user.isNewUser || !from ? homePathFor(user) : from;
    return <Navigate to={target} replace />;
  }
  return (
    <AuthPage
      key={mode}
      initialMode={mode}
      onBack={() => navigate('/')}
      // replace + giu state.from de doi tab khong lam mat trang can quay lai
      onModeChange={(m) => navigate(m === 'signup' ? '/signup' : '/login', { replace: true, state: location.state })}
    />
  );
}

function LandingRoute() {
  const n = useAppNav();
  // Giang vien/admin vao trang chu -> dua thang ve dashboard
  if (n.isStaff) return <Navigate to="/admin" replace />;
  return (
    <LandingPage
      onGoAuth={n.goAuth}
      onGoTopics={n.goTopics}
      onGoProfile={n.goProfile}
      onGoProgress={n.goProgress}
      onGoSettings={n.goSettings}
      onGoStartPractice={() => (n.user ? n.navigate(homePathFor(n.user)) : n.goAuth('login'))}
      onLoggedOut={n.goLanding}
    />
  );
}

function TopicDetailRoute() {
  const n = useAppNav();
  const { topicName } = useParams();
  const { problems, loading } = usePublishedProblems();
  const topic = findTopic(topicName, problems);
  if (!topic) {
    // Chu de chi co trong du lieu backend -> doi tai xong moi biet co ton tai khong
    if (loading) return <FullPageLoader />;
    return <Navigate to="/topics" replace />;
  }
  return (
    <TopicDetailPage
      topic={topic}
      onBack={n.goTopics}
      onGoPractice={n.goPractice}
      onGoLanding={n.goLanding}
      onGoAuth={n.goAuth}
      onGoTopics={n.goTopics}
      onGoProfile={n.goProfile}
      onGoProgress={n.goProgress}
      onGoAdmin={n.goAdmin}
      onGoSettings={n.goSettings}
      onLoggedOut={n.goLanding}
    />
  );
}

function PracticeRoute() {
  const n = useAppNav();
  const { problemId = '' } = useParams();
  return (
    <PracticePage
      key={problemId}
      onBack={() => n.goBack('/topics')}
      initialProblemId={problemId}
      onGoLanding={n.goLanding}
      onGoAuth={n.goAuth}
      onGoTopics={n.goTopics}
      onGoProfile={n.goProfile}
      onGoProgress={n.goProgress}
      onGoHistory={n.goHistory}
      onGoAdmin={n.goAdmin}
      onGoSettings={n.goSettings}
      onLoggedOut={n.goLanding}
    />
  );
}

function App() {
  const n = useAppNav();
  const { completeOnboarding } = useAuth();
  // Ket qua danh gia chi song trong phien hien tai; reload /result thi quay lai onboarding
  const [assessmentScores, setAssessmentScores] = useState<TopicScore[]>([]);

  const handleAssessmentComplete = (scores: TopicScore[]) => {
    setAssessmentScores(scores);
    void completeOnboarding();
    n.navigate('/result');
  };

  // Props chung cua cac trang ca nhan (profile/progress/history/settings)
  const accountNav = {
    onGoLanding: n.goLanding,
    onGoAuth: n.goAuth,
    onGoTopics: n.goTopics,
    onGoProfile: n.goProfile,
    onGoProgress: n.goProgress,
    onGoHistory: n.goHistory,
    onGoAdmin: n.goAdmin,
    onGoSettings: n.goSettings,
  };
  const assessmentNav = {
    onGoLanding: n.goLanding,
    onGoTopics: n.goTopics,
    onGoProfile: n.goProfile,
    onGoProgress: n.goProgress,
  };

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ── Public ─────────────────────────────────────────────────────── */}
        <Route path="/" element={<LandingRoute />} />
        <Route path="/login" element={<AuthRoute mode="login" />} />
        <Route path="/signup" element={<AuthRoute mode="signup" />} />
        <Route
          path="/topics"
          element={
            <TopicsPage
              onBack={n.goHomeByRole}
              onAuth={n.goAuth}
              onSelectTopic={(t) => n.navigate(topicPath(t))}
              onGoPractice={n.goPractice}
              onGoProfile={n.goProfile}
              onGoProgress={n.goProgress}
              onGoAdmin={n.goAdmin}
              onGoSettings={n.goSettings}
              onLoggedOut={n.goLanding}
            />
          }
        />
        <Route path="/topics/:topicName" element={<TopicDetailRoute />} />

        {/* ── Can dang nhap ──────────────────────────────────────────────── */}
        <Route element={<RequireAuth />}>
          <Route
            path="/onboarding"
            element={
              <OnboardingPage
                onChooseSelfRate={() => n.navigate('/self-rate')}
                onChooseQuiz={() => n.navigate('/quiz')}
                onGoAuth={n.goAuth}
                {...assessmentNav}
              />
            }
          />
          <Route
            path="/self-rate"
            element={
              <AssessmentPage
                onBack={() => n.navigate('/onboarding')}
                onComplete={handleAssessmentComplete}
                {...assessmentNav}
              />
            }
          />
          <Route
            path="/quiz"
            element={
              <QuizPage
                onBack={() => n.navigate('/onboarding')}
                onComplete={handleAssessmentComplete}
                {...assessmentNav}
              />
            }
          />
          <Route
            path="/result"
            element={
              assessmentScores.length === 0 ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <ResultPage scores={assessmentScores} onGoAuth={n.goAuth} {...assessmentNav} />
              )
            }
          />
          <Route path="/practice/:problemId" element={<PracticeRoute />} />
          <Route path="/practice" element={<Navigate to="/topics" replace />} />
          <Route path="/profile" element={<ProfilePage onBack={n.goHomeByRole} {...accountNav} />} />
          <Route path="/progress" element={<ProgressPage onBack={n.goHomeByRole} {...accountNav} />} />
          <Route path="/history" element={<HistoryPage onBack={n.goHomeByRole} {...accountNav} />} />
          <Route
            path="/settings"
            element={
              <SettingsPage
                onBack={() => (n.isStaff ? n.goAdmin() : n.goTopics())}
                onLoggedOut={n.goLanding}
                {...accountNav}
              />
            }
          />
        </Route>

        {/* ── Giang vien / Admin ─────────────────────────────────────────── */}
        <Route element={<RequireAuth roles={['admin', 'teacher']} />}>
          <Route
            path="/admin"
            element={
              <AdminPage
                onBack={n.goLanding}
                onGoLanding={n.goAdmin}
                onGoAuth={n.goAuth}
                onGoTopics={n.goTopics}
                onGoProfile={n.goProfile}
                onGoProgress={n.goProgress}
                onGoHistory={n.goHistory}
                onGoSettings={n.goSettings}
                onGoPractice={n.goPractice}
              />
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;

import { useState, useEffect } from 'react';
import type { AuthMode, TopicScore, View } from '@/types';
import type { UserRole } from '@/data/mockAuth';
import { useAuth } from '@/hooks/useAuth.tsx';
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
import { TOPIC_INFOS, type TopicInfo } from '@/types';

const VIEW_KEY = 'current_view';

function getInitialView(): View {
  try {
    localStorage.removeItem(VIEW_KEY);
    const authSaved = sessionStorage.getItem('auth_user');
    const u = authSaved ? JSON.parse(authSaved) : null;

    if (u && (u.role === 'admin' || u.role === 'teacher')) {
      const saved = sessionStorage.getItem(VIEW_KEY) as View | null;
      if (saved && (saved === 'admin' || saved === 'settings' || saved === 'profile')) {
        return saved;
      }
      return 'admin';
    }

    const saved = sessionStorage.getItem(VIEW_KEY) as View | null;
    if (saved && saved !== 'auth') {
      if (!u && (saved === 'admin' || saved === 'profile' || saved === 'progress' || saved === 'history' || saved === 'settings')) {
        return 'landing';
      }
      return saved;
    }
    if (u) {
      return 'topics';
    }
  } catch {
    // ignore
  }
  return 'landing';
}

function App() {
  const [view, setView] = useState<View>(getInitialView);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [assessmentScores, setAssessmentScores] = useState<TopicScore[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState<string>('two-sum');
  const [selectedTopic, setSelectedTopic] = useState<TopicInfo>(TOPIC_INFOS[0]);

  const { user } = useAuth();

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'teacher')) {
      if (view === 'landing' || view === 'topics') {
        nav('admin');
      }
    }
  }, [user, view]);

  const nav = (v: View) => {
    setView(v);
    try {
      sessionStorage.setItem(VIEW_KEY, v);
      localStorage.removeItem(VIEW_KEY);
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0 });
  };

  const goLanding = () => nav('landing');
  const goAuth = (m: AuthMode) => { setAuthMode(m); nav('auth'); };
  const goOnboarding = () => nav('onboarding');
  const goPractice = (problemId?: string) => {
    if (problemId) {
      setSelectedProblemId(problemId);
    }
    nav('practice');
  };
  const goTopics = () => nav('topics');
  const handleSelectTopic = (t: TopicInfo) => {
    setSelectedTopic(t);
    nav('topic-detail');
  };
  const goProfile = () => nav('profile');
  const goProgress = () => nav('progress');
  const goHistory = () => nav('history');
  const goSettings = () => nav('settings');
  const goAdmin = () => nav('admin');

  // "Bắt đầu luyện tập" — nếu đã login → vào topics, nếu chưa → login
  const goStartPractice = () => {
    if (user) {
      if (user.role === 'teacher' || user.role === 'admin') {
        nav('admin');
      } else {
        nav('topics');
      }
    } else {
      goAuth('login');
    }
  };

  // Logout về landing
  const handleLoggedOut = () => {
    try {
      localStorage.removeItem(VIEW_KEY);
    } catch {
      // ignore
    }
    nav('landing');
  };

  const handleAssessmentComplete = (scores: TopicScore[]) => {
    setAssessmentScores(scores);
    nav('result');
  };

  // ── Auth ──────────────────────────────────────────────────────────────────
  if (view === 'auth') {
    return (
      <AuthPage
        onBack={goLanding}
        initialMode={authMode}
        onLoginSuccess={(isNewUser?: boolean, role?: UserRole) => {
          if (role === 'teacher' || role === 'admin') {
            nav('admin');
          } else if (isNewUser) {
            nav('onboarding');
          } else {
            nav('topics');
          }
        }}
      />
    );
  }

  // ── Onboarding ────────────────────────────────────────────────────────────
  if (view === 'onboarding') {
    return (
      <OnboardingPage
        onChooseSelfRate={() => nav('self-rate')}
        onChooseQuiz={() => nav('quiz')}
        onGoLanding={goLanding}
        onGoAuth={goAuth}
        onGoTopics={goTopics}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
      />
    );
  }

  // ── Self-rate ─────────────────────────────────────────────────────────────
  if (view === 'self-rate') {
    return (
      <AssessmentPage
        onBack={() => nav('onboarding')}
        onComplete={handleAssessmentComplete}
        onGoLanding={goLanding}
        onGoTopics={goTopics}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
      />
    );
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────
  if (view === 'quiz') {
    return (
      <QuizPage
        onBack={() => nav('onboarding')}
        onComplete={handleAssessmentComplete}
        onGoLanding={goLanding}
        onGoTopics={goTopics}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
      />
    );
  }

  // ── Result → dẫn sang TopicsPage ─────────────────────────────────────────
  if (view === 'result') {
    return (
      <ResultPage
        scores={assessmentScores}
        onGoLanding={goLanding}
        onGoAuth={goAuth}
        onGoTopics={goTopics}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
      />
    );
  }

  // ── Topics (danh sách chủ đề) ─────────────────────────────────────────────
  if (view === 'topics') {
    return (
      <TopicsPage
        onBack={() => {
          if (user?.role === 'teacher' || user?.role === 'admin') {
            goAdmin();
          } else {
            goLanding();
          }
        }}
        onAuth={goAuth}
        onSelectTopic={handleSelectTopic}
        onGoPractice={goPractice}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoAdmin={goAdmin}
        onGoSettings={goSettings}
        onLoggedOut={handleLoggedOut}
      />
    );
  }

  // ── Topic Detail (chi tiết danh sách bài tập của 1 chủ đề) ─────────────────
  if (view === 'topic-detail') {
    return (
      <TopicDetailPage
        topic={selectedTopic}
        onBack={goTopics}
        onGoPractice={goPractice}
        onGoLanding={goLanding}
        onGoAuth={goAuth}
        onGoTopics={goTopics}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoAdmin={goAdmin}
        onGoSettings={goSettings}
        onLoggedOut={handleLoggedOut}
      />
    );
  }

  // ── Practice ──────────────────────────────────────────────────────────────
  if (view === 'practice') {
    return (
      <PracticePage
        onBack={() => nav('topic-detail')}
        initialProblemId={selectedProblemId}
        onGoLanding={goLanding}
        onGoAuth={goAuth}
        onGoTopics={goTopics}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoAdmin={goAdmin}
        onGoSettings={goSettings}
        onLoggedOut={handleLoggedOut}
      />
    );
  }

  // ── Profile ───────────────────────────────────────────────────────────────
  if (view === 'profile') {
    return (
      <ProfilePage
        onBack={() => {
          if (user?.role === 'teacher' || user?.role === 'admin') {
            goAdmin();
          } else {
            goLanding();
          }
        }}
        onGoLanding={goLanding}
        onGoAuth={goAuth}
        onGoTopics={goTopics}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoAdmin={goAdmin}
        onGoSettings={goSettings}
      />
    );
  }

  // ── Progress ──────────────────────────────────────────────────────────────
  if (view === 'progress') {
    return (
      <ProgressPage
        onBack={() => {
          if (user?.role === 'teacher' || user?.role === 'admin') {
            goAdmin();
          } else {
            goLanding();
          }
        }}
        onGoLanding={goLanding}
        onGoAuth={goAuth}
        onGoTopics={goTopics}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoAdmin={goAdmin}
        onGoSettings={goSettings}
      />
    );
  }

  // ── History ───────────────────────────────────────────────────────────────
  if (view === 'history') {
    return (
      <HistoryPage
        onBack={() => {
          if (user?.role === 'teacher' || user?.role === 'admin') {
            goAdmin();
          } else {
            goLanding();
          }
        }}
        onGoLanding={goLanding}
        onGoAuth={goAuth}
        onGoTopics={goTopics}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoAdmin={goAdmin}
        onGoSettings={goSettings}
      />
    );
  }

  // ── Settings ──────────────────────────────────────────────────────────────
  if (view === 'settings') {
    return (
      <SettingsPage
        onBack={() => {
          if (user?.role === 'teacher' || user?.role === 'admin') {
            goAdmin();
          } else {
            goTopics();
          }
        }}
        onGoLanding={goLanding}
        onGoAuth={goAuth}
        onGoTopics={goTopics}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoAdmin={goAdmin}
        onGoSettings={goSettings}
        onLoggedOut={handleLoggedOut}
      />
    );
  }

  // ── Admin Dashboard ───────────────────────────────────────────────────────
  if (view === 'admin') {
    return (
      <AdminPage
        onBack={goLanding}
        onGoLanding={goAdmin}
        onGoAuth={goAuth}
        onGoTopics={goTopics}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoSettings={goSettings}
        onGoPractice={goPractice}
      />
    );
  }

  // ── Landing (default) ─────────────────────────────────────────────────────
  return (
    <LandingPage
      onGoAuth={goAuth}
      onGoTopics={goTopics}
      onGoProfile={goProfile}
      onGoProgress={goProgress}
      onGoSettings={goSettings}
      onGoStartPractice={goStartPractice}
      onLoggedOut={handleLoggedOut}
    />
  );
}

export default App;

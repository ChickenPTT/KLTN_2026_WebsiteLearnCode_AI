import { useState, useEffect } from 'react';
import type { AuthMode, TopicScore, View } from '@/types';
import type { UserRole } from '@/data/mockAuth';
import type { AdminTab } from '@/pages/admin/admin.types';
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
import { ScoringGuidePage } from '@/pages/user/ScoringGuidePage';
import { AdminPage } from '@/pages/admin/AdminPage';
import { TOPIC_INFOS, type TopicInfo } from '@/types';

const VIEW_KEY = 'current_view';

// ── BROWSER HISTORY & HASH ROUTING HELPERS ──
function buildHash(
  v: View,
  params?: {
    problemId?: string;
    topicSlug?: string;
    authMode?: AuthMode;
    adminTab?: AdminTab;
  },
): string {
  let hash = `#${v}`;
  const queryParts: string[] = [];
  if (params?.problemId) queryParts.push(`problem=${encodeURIComponent(params.problemId)}`);
  if (params?.topicSlug) queryParts.push(`topic=${encodeURIComponent(params.topicSlug)}`);
  if (params?.authMode) queryParts.push(`mode=${encodeURIComponent(params.authMode)}`);
  if (params?.adminTab) queryParts.push(`tab=${encodeURIComponent(params.adminTab)}`);
  if (queryParts.length > 0) hash += `?${queryParts.join('&')}`;
  return hash;
}

function parseHash(hashStr: string): {
  view: View;
  problemId?: string;
  topicSlug?: string;
  authMode?: AuthMode;
  adminTab?: AdminTab;
} {
  const clean = hashStr.startsWith('#') ? hashStr.slice(1) : hashStr;
  if (!clean) return { view: 'landing' };

  const [viewPart, queryPart] = clean.split('?');
  const view = (viewPart || 'landing') as View;

  const params: Record<string, string> = {};
  if (queryPart) {
    queryPart.split('&').forEach((pair) => {
      const [k, val] = pair.split('=');
      if (k && val) params[k] = decodeURIComponent(val);
    });
  }

  return {
    view,
    problemId: params.problem,
    topicSlug: params.topic,
    authMode: params.mode as AuthMode,
    adminTab: params.tab as AdminTab,
  };
}

function getInitialNavigationState(): {
  view: View;
  authMode: AuthMode;
  selectedProblemId: string;
  selectedTopic: TopicInfo;
  adminTab: AdminTab;
} {
  let view: View = 'landing';
  let authMode: AuthMode = 'login';
  let selectedProblemId = 'two-sum';
  let selectedTopic = TOPIC_INFOS[0];
  let adminTab: AdminTab = 'dashboard';

  try {
    // 1. Check URL hash first
    const hashData = parseHash(window.location.hash);
    if (hashData.view && hashData.view !== 'landing') {
      view = hashData.view;
      if (hashData.problemId) selectedProblemId = hashData.problemId;
      if (hashData.topicSlug) {
        const found = TOPIC_INFOS.find(
          (t) => t.slug === hashData.topicSlug || t.title === hashData.topicSlug,
        );
        if (found) selectedTopic = found;
      }
      if (hashData.authMode) authMode = hashData.authMode;
      if (hashData.adminTab) adminTab = hashData.adminTab;
    } else {
      // 2. Fallback to Session Storage
      const authSaved = sessionStorage.getItem('auth_user');
      const u = authSaved ? JSON.parse(authSaved) : null;

      if (u && (u.role === 'admin' || u.role === 'teacher')) {
        const saved = sessionStorage.getItem(VIEW_KEY) as View | null;
        view = saved && (saved === 'admin' || saved === 'settings' || saved === 'profile') ? saved : 'admin';
      } else {
        const saved = sessionStorage.getItem(VIEW_KEY) as View | null;
        if (saved && saved !== 'auth') {
          if (!u && (saved === 'admin' || saved === 'profile' || saved === 'progress' || saved === 'history' || saved === 'settings')) {
            view = 'landing';
          } else {
            view = saved;
          }
        } else if (u) {
          view = 'topics';
        }
      }
    }
  } catch {
    // ignore
  }

  return { view, authMode, selectedProblemId, selectedTopic, adminTab };
}

function App() {
  const initialState = getInitialNavigationState();

  const [view, setView] = useState<View>(initialState.view);
  const [authMode, setAuthMode] = useState<AuthMode>(initialState.authMode);
  const [assessmentScores, setAssessmentScores] = useState<TopicScore[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState<string>(initialState.selectedProblemId);
  const [selectedTopic, setSelectedTopic] = useState<TopicInfo>(initialState.selectedTopic);
  const [adminTab, setAdminTab] = useState<AdminTab>(initialState.adminTab);

  const { user } = useAuth();

  // ── NAVIGATE FUNCTION WITH FULL SUB-VIEW HISTORY API INTEGRATION ──
  const nav = (
    v: View,
    params?: {
      problemId?: string;
      topic?: TopicInfo;
      authMode?: AuthMode;
      adminTab?: AdminTab;
    },
    options?: { replace?: boolean },
  ) => {
    setView(v);
    if (params?.problemId) setSelectedProblemId(params.problemId);
    if (params?.topic) setSelectedTopic(params.topic);
    if (params?.authMode) setAuthMode(params.authMode);
    if (params?.adminTab) setAdminTab(params.adminTab);

    const activeProblemId = params?.problemId ?? selectedProblemId;
    const activeTopic = params?.topic ?? selectedTopic;
    const activeAuthMode = params?.authMode ?? authMode;
    const activeAdminTab = params?.adminTab ?? (v === 'admin' ? adminTab : 'dashboard');

    const hashStr = buildHash(v, {
      problemId: activeProblemId,
      topicSlug: activeTopic?.slug ?? activeTopic?.title,
      authMode: activeAuthMode,
      adminTab: v === 'admin' ? activeAdminTab : undefined,
    });

    const stateObj = {
      view: v,
      problemId: activeProblemId,
      topicSlug: activeTopic?.slug ?? activeTopic?.title,
      authMode: activeAuthMode,
      adminTab: activeAdminTab,
    };

    try {
      sessionStorage.setItem(VIEW_KEY, v);
      localStorage.removeItem(VIEW_KEY);

      if (options?.replace) {
        window.history.replaceState(stateObj, '', hashStr);
      } else {
        if (window.location.hash !== hashStr || window.history.state?.adminTab !== activeAdminTab) {
          window.history.pushState(stateObj, '', hashStr);
        }
      }
    } catch {
      // ignore
    }

    window.scrollTo({ top: 0 });
  };

  // ── POPSTATE LISTENER FOR ALL VIEWS & SUB-TAB NAVIGATION ──
  useEffect(() => {
    const activeHash = buildHash(view, {
      problemId: selectedProblemId,
      topicSlug: selectedTopic?.slug ?? selectedTopic?.title,
      authMode,
      adminTab: view === 'admin' ? adminTab : undefined,
    });

    const activeState = {
      view,
      problemId: selectedProblemId,
      topicSlug: selectedTopic?.slug ?? selectedTopic?.title,
      authMode,
      adminTab,
    };

    // Ensure initial entry in browser history stack is populated
    if (!window.history.state || !window.history.state.view) {
      window.history.replaceState(activeState, '', activeHash);
    }

    const handlePopState = (e: PopStateEvent) => {
      const state = e.state;
      let targetView: View = 'landing';
      let targetProblemId = selectedProblemId;
      let targetTopic = selectedTopic;
      let targetAuthMode = authMode;
      let targetAdminTab: AdminTab = 'dashboard';

      if (state && state.view) {
        targetView = state.view;
        if (state.problemId) targetProblemId = state.problemId;
        if (state.topicSlug) {
          const found = TOPIC_INFOS.find(
            (t) => t.slug === state.topicSlug || t.title === state.topicSlug,
          );
          if (found) targetTopic = found;
        }
        if (state.authMode) targetAuthMode = state.authMode;
        if (state.adminTab) targetAdminTab = state.adminTab;
      } else {
        // Fallback: parse window.location.hash if state is empty
        const parsed = parseHash(window.location.hash);
        targetView = parsed.view;
        if (parsed.problemId) targetProblemId = parsed.problemId;
        if (parsed.topicSlug) {
          const found = TOPIC_INFOS.find(
            (t) => t.slug === parsed.topicSlug || t.title === parsed.topicSlug,
          );
          if (found) targetTopic = found;
        }
        if (parsed.authMode) targetAuthMode = parsed.authMode;
        if (parsed.adminTab) targetAdminTab = parsed.adminTab;
      }

      setView(targetView);
      setSelectedProblemId(targetProblemId);
      setSelectedTopic(targetTopic);
      setAuthMode(targetAuthMode);
      setAdminTab(targetAdminTab);

      try {
        sessionStorage.setItem(VIEW_KEY, targetView);
      } catch {
        // ignore
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ── ADMIN / TEACHER AUTOMATIC REDIRECT GUARD ──
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'teacher')) {
      if (view === 'landing' || view === 'topics') {
        nav('admin', { adminTab: 'dashboard' }, { replace: true });
      }
    }
  }, [user, view]);

  // Quick navigation shortcuts
  const goLanding = () => nav('landing');
  const goAuth = (m: AuthMode) => nav('auth', { authMode: m });
  const goOnboarding = () => nav('onboarding');
  const goPractice = (problemId?: string) => nav('practice', { problemId });
  const goTopics = () => nav('topics');
  const handleSelectTopic = (t: TopicInfo) => nav('topic-detail', { topic: t });
  const goProfile = () => nav('profile');
  const goProgress = () => nav('progress');
  const goHistory = () => nav('history');
  const goSettings = () => nav('settings');
  const goScoringGuide = () => nav('scoring-guide');
  const goAdmin = (tab?: AdminTab) => nav('admin', { adminTab: tab ?? 'dashboard' });

  // "Bắt đầu luyện tập"
  const goStartPractice = () => {
    if (user) {
      if (user.role === 'teacher' || user.role === 'admin') {
        nav('admin', { adminTab: 'dashboard' }, { replace: true });
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
      sessionStorage.removeItem(VIEW_KEY);
    } catch {
      // ignore
    }
    nav('landing', {}, { replace: true });
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
            nav('admin', { adminTab: 'dashboard' }, { replace: true });
          } else if (isNewUser) {
            nav('onboarding');
          } else {
            nav('topics', {}, { replace: true });
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
            goAdmin('dashboard');
          } else {
            goLanding();
          }
        }}
        onAuth={goAuth}
        onSelectTopic={handleSelectTopic}
        onGoPractice={goPractice}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoAdmin={() => goAdmin('dashboard')}
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
        onGoAdmin={() => goAdmin('dashboard')}
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
        onGoAdmin={() => goAdmin('dashboard')}
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
            goAdmin('dashboard');
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
        onGoAdmin={() => goAdmin('dashboard')}
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
            goAdmin('dashboard');
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
        onGoScoringGuide={goScoringGuide}
        onGoAdmin={() => goAdmin('dashboard')}
        onGoSettings={goSettings}
      />
    );
  }

  // ── Scoring Guide ─────────────────────────────────────────────────────────
  if (view === 'scoring-guide') {
    return (
      <ScoringGuidePage
        onBack={goProgress}
        onGoLanding={goLanding}
        onGoAuth={goAuth}
        onGoTopics={goTopics}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoAdmin={() => goAdmin('dashboard')}
        onGoSettings={goSettings}
        onLoggedOut={handleLoggedOut}
      />
    );
  }

  // ── History ───────────────────────────────────────────────────────────────
  if (view === 'history') {
    return (
      <HistoryPage
        onBack={() => {
          if (user?.role === 'teacher' || user?.role === 'admin') {
            goAdmin('dashboard');
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
        onGoAdmin={() => goAdmin('dashboard')}
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
            goAdmin('dashboard');
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
        onGoAdmin={() => goAdmin('dashboard')}
        onGoSettings={goSettings}
        onLoggedOut={handleLoggedOut}
      />
    );
  }

  // ── Admin Dashboard ───────────────────────────────────────────────────────
  if (view === 'admin') {
    return (
      <AdminPage
        activeTab={adminTab}
        onTabChange={(tab) => nav('admin', { adminTab: tab })}
        onBack={goLanding}
        onGoLanding={() => goAdmin('dashboard')}
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

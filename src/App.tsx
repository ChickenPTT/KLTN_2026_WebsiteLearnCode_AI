import { useState, useEffect } from 'react';
import type { AuthMode, TopicScore, View } from '@/types';
import type { UserRole } from '@/data/mockAuth';
import type { AdminTab, LeagueSubTab } from '@/pages/admin/admin.types';
import { useAuth } from '@/hooks/useAuth.tsx';
import { LandingPage } from '@/pages/user/LandingPage';
import { AuthPage } from '@/pages/user/AuthPage';
import { OnboardingPage } from '@/pages/user/OnboardingPage';
import { AssessmentPage } from '@/pages/user/AssessmentPage';
import { QuizPage } from '@/pages/user/QuizPage';
import { LeaguePage } from '@/pages/user/league/LeaguePage';
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
import { FlashcardsPage } from '@/pages/user/FlashcardsPage';
import { FlashcardDetailPage } from '@/pages/user/FlashcardDetailPage';
import { FlashcardLibraryPage } from '@/pages/user/FlashcardLibraryPage';
import { CreateFlashcardSetPage } from '@/pages/user/CreateFlashcardSetPage';
import { FlashcardMatchPage } from '@/pages/user/FlashcardMatchPage';
import { AccessDeniedPage } from '@/pages/user/AccessDeniedPage';
import { initTheme } from '@/lib/theme';
import { TOPIC_INFOS, getTopicBySlugOrName, getTopicForProblem, type TopicInfo, type FlashcardItem } from '@/types';
import { getProblemById, normalizeDifficulty } from '@/lib/problemService';

const VIEW_KEY = 'current_view';

// ── CENTRAL ROUTE GUARD & ROLE-BASED ACCESS CONTROL (RBAC) ──
function checkRouteAccess(
  targetView: View,
  user: { role?: UserRole } | null,
): {
  allowed: boolean;
  view: View;
  authMode?: AuthMode;
  redirectAfterLogin?: View;
} {
  // 1. Quản trị viên & Giảng viên: Chỉ admin/teacher mới được vào trang admin
  if (targetView === 'admin') {
    if (!user) {
      return { allowed: false, view: 'auth', authMode: 'login', redirectAfterLogin: 'admin' };
    }
    if (user.role !== 'admin' && user.role !== 'teacher') {
      return { allowed: false, view: 'forbidden' };
    }
    return { allowed: true, view: 'admin' };
  }

  // 2. Các trang bảo vệ yêu cầu đăng nhập (Profile, Settings, Progress, History, Create Flashcard)
  const userProtectedViews: View[] = ['profile', 'settings', 'progress', 'history', 'create-flashcard'];
  if (userProtectedViews.includes(targetView)) {
    if (!user) {
      return { allowed: false, view: 'auth', authMode: 'login', redirectAfterLogin: targetView };
    }
    return { allowed: true, view: targetView };
  }

  // 3. Trang đăng nhập khi đã có session: tránh login lặp lại
  if (targetView === 'auth' && user) {
    if (user.role === 'admin' || user.role === 'teacher') {
      return { allowed: false, view: 'admin' };
    }
    return { allowed: false, view: 'topics' };
  }

  // 4. Các trang công khai (landing, topics, topic-detail, practice, flashcards, v.v.)
  return { allowed: true, view: targetView };
}

// ── BROWSER HISTORY & HASH ROUTING HELPERS ──
function buildHash(
  v: View,
  params?: {
    problemId?: string;
    topicSlug?: string;
    authMode?: AuthMode;
    adminTab?: AdminTab;
    leagueSub?: LeagueSubTab;
    seasonMode?: 'none' | 'edit' | 'view';
    seasonId?: string;
    flashcardSetId?: string;
  },
): string {
  if (v === 'forbidden') return '#forbidden';
  let hash = `#${v}`;
  const queryParts: string[] = [];
  if (v === 'topic-detail') {
    if (params?.topicSlug) queryParts.push(`topic=${encodeURIComponent(params.topicSlug)}`);
  } else if (v === 'practice') {
    if (params?.problemId) queryParts.push(`problem=${encodeURIComponent(params.problemId)}`);
    if (params?.topicSlug) queryParts.push(`topic=${encodeURIComponent(params.topicSlug)}`);
  } else if (v === 'auth') {
    if (params?.authMode) queryParts.push(`mode=${encodeURIComponent(params.authMode)}`);
  } else if (v === 'admin') {
    if (params?.adminTab) queryParts.push(`tab=${encodeURIComponent(params.adminTab)}`);
    if (params?.adminTab === 'league') {
      if (params?.leagueSub && params.leagueSub !== 'overview') {
        queryParts.push(`sub=${encodeURIComponent(params.leagueSub)}`);
      }
      if (params?.seasonMode && params.seasonMode !== 'none') {
        queryParts.push(`mode=${encodeURIComponent(params.seasonMode)}`);
      }
      if (params?.seasonId) {
        queryParts.push(`season=${encodeURIComponent(params.seasonId)}`);
      }
    }
  } else if (v === 'flashcard-detail' || v === 'flashcard-match') {
    if (params?.flashcardSetId) queryParts.push(`set=${encodeURIComponent(params.flashcardSetId)}`);
  }
  if (queryParts.length > 0) hash += `?${queryParts.join('&')}`;
  return hash;
}

function parseHash(hashStr: string): {
  view: View;
  problemId?: string;
  topicSlug?: string;
  authMode?: AuthMode;
  adminTab?: AdminTab;
  leagueSub?: LeagueSubTab;
  seasonMode?: 'edit' | 'view';
  seasonId?: string;
  flashcardSetId?: string;
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
    authMode: view === 'auth' ? (params.mode as AuthMode) : undefined,
    adminTab: params.tab as AdminTab,
    leagueSub: (params.sub as LeagueSubTab) || (params.tab === 'league' ? 'overview' : undefined),
    seasonMode: view === 'admin' && (params.mode === 'edit' || params.mode === 'view') ? params.mode : undefined,
    seasonId: params.season,
    flashcardSetId: params.set,
  };
}

function getInitialNavigationState(): {
  view: View;
  authMode: AuthMode;
  selectedProblemId: string;
  selectedTopic: TopicInfo;
  adminTab: AdminTab;
  leagueSubTab: LeagueSubTab;
  seasonConfigMode: 'none' | 'edit' | 'view';
  seasonId?: string;
  selectedFlashcardSetId: string;
} {
  let view: View = 'landing';
  let authMode: AuthMode = 'login';
  let selectedProblemId = 'two-sum';
  let selectedTopic = TOPIC_INFOS[0];
  let adminTab: AdminTab = 'dashboard';
  let leagueSubTab: LeagueSubTab = 'overview';
  let seasonConfigMode: 'none' | 'edit' | 'view' = 'none';
  let seasonId: string | undefined = undefined;
  let selectedFlashcardSetId = 'fc-1';

  try {
    let authUser: { role?: UserRole } | null = null;
    const authSaved = sessionStorage.getItem('auth_user');
    if (authSaved) {
      authUser = JSON.parse(authSaved);
    }

    // 1. Check URL hash first with route guard validation
    const hashData = parseHash(window.location.hash);
    if (hashData.view && hashData.view !== 'landing') {
      const guardResult = checkRouteAccess(hashData.view, authUser);
      view = guardResult.view;
      if (guardResult.authMode) authMode = guardResult.authMode;
      if (guardResult.redirectAfterLogin) {
        sessionStorage.setItem('redirect_after_login', guardResult.redirectAfterLogin);
      }

      if (hashData.problemId) {
        selectedProblemId = hashData.problemId;
        const topicFromProb = getTopicForProblem(hashData.problemId);
        if (topicFromProb) selectedTopic = topicFromProb;
      }
      if (hashData.topicSlug) {
        const found = getTopicBySlugOrName(hashData.topicSlug);
        if (found) selectedTopic = found;
      }
      if (hashData.authMode && !guardResult.authMode) authMode = hashData.authMode;
      if (hashData.adminTab) adminTab = hashData.adminTab;
      if (hashData.leagueSub) leagueSubTab = hashData.leagueSub;
      if (hashData.seasonMode) {
        seasonConfigMode = hashData.seasonMode;
        seasonId = hashData.seasonId;
      }
      if (hashData.flashcardSetId) selectedFlashcardSetId = hashData.flashcardSetId;
    } else {
      // 2. Fallback to Session Storage
      if (authUser && (authUser.role === 'admin' || authUser.role === 'teacher')) {
        const saved = sessionStorage.getItem(VIEW_KEY) as View | null;
        view = saved && (saved === 'admin' || saved === 'profile') ? saved : 'admin';
      } else {
        const saved = sessionStorage.getItem(VIEW_KEY) as View | null;
        if (saved && saved !== 'auth') {
          const guard = checkRouteAccess(saved, authUser);
          view = guard.allowed ? saved : (authUser ? 'topics' : 'landing');
        } else if (authUser) {
          view = 'topics';
        }
      }
    }
  } catch {
    // ignore
  }

  return {
    view,
    authMode,
    selectedProblemId,
    selectedTopic,
    adminTab,
    leagueSubTab,
    seasonConfigMode,
    seasonId,
    selectedFlashcardSetId,
  };
}

function App() {
  const initialState = getInitialNavigationState();

  const [view, setView] = useState<View>(initialState.view);
  const [authMode, setAuthMode] = useState<AuthMode>(initialState.authMode);
  const [assessmentScores, setAssessmentScores] = useState<TopicScore[]>(() => {
    try {
      const stored = localStorage.getItem('user_assessment_scores');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            topic: String(item.topic || ''),
            level: (normalizeDifficulty(item.level) || item.level || 'beginner') as any,
          }));
        }
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [selectedProblemId, setSelectedProblemId] = useState<string>(initialState.selectedProblemId);
  const [selectedTopic, setSelectedTopic] = useState<TopicInfo>(initialState.selectedTopic);
  const [adminTab, setAdminTab] = useState<AdminTab>(initialState.adminTab);
  const [leagueSubTab, setLeagueSubTab] = useState<LeagueSubTab>(initialState.leagueSubTab);
  const [seasonConfigMode, setSeasonConfigMode] = useState<'none' | 'edit' | 'view'>(initialState.seasonConfigMode);
  const [currentSeasonId, setCurrentSeasonId] = useState<string | undefined>(initialState.seasonId);
  const [selectedFlashcardSetId, setSelectedFlashcardSetId] = useState<string>(initialState.selectedFlashcardSetId);
  const [editingFlashcardSetId, setEditingFlashcardSetId] = useState<string | null>(null);
  const [multiSetMatchCards, setMultiSetMatchCards] = useState<FlashcardItem[] | null>(null);
  const [multiSetMatchTitle, setMultiSetMatchTitle] = useState<string>('');

  const { user } = useAuth();

  // ── THEME INITIALIZATION & SYSTEM PREFERENCE LISTENER ──
  useEffect(() => {
    return initTheme();
  }, []);

  // ── NAVIGATE FUNCTION WITH FULL SUB-VIEW HISTORY API INTEGRATION & ROUTE GUARDS ──
  const nav = (
    v: View,
    params?: {
      problemId?: string;
      topic?: TopicInfo;
      authMode?: AuthMode;
      adminTab?: AdminTab;
      leagueSub?: LeagueSubTab;
      seasonMode?: 'none' | 'edit' | 'view';
      seasonId?: string;
      flashcardSetId?: string;
    },
    options?: { replace?: boolean },
  ) => {
    // Evaluate Route Guard
    const guard = checkRouteAccess(v, user);
    let effectiveView = v;
    let effectiveAuthMode = params?.authMode ?? authMode;

    if (!guard.allowed) {
      effectiveView = guard.view;
      if (guard.authMode) effectiveAuthMode = guard.authMode;
      if (guard.redirectAfterLogin) {
        sessionStorage.setItem('redirect_after_login', guard.redirectAfterLogin);
      }
    }

    setView(effectiveView);
    if (params?.problemId) setSelectedProblemId(params.problemId);
    if (params?.topic) setSelectedTopic(params.topic);
    setAuthMode(effectiveAuthMode);

    const activeAdminTab = params?.adminTab ?? (effectiveView === 'admin' ? adminTab : 'dashboard');
    if (params?.adminTab !== undefined) setAdminTab(params.adminTab);

    const activeLeagueSub = params?.leagueSub ?? (activeAdminTab === 'league' ? leagueSubTab : 'overview');
    if (params?.leagueSub !== undefined) setLeagueSubTab(params.leagueSub);

    const activeSeasonMode = params?.seasonMode !== undefined
      ? params.seasonMode
      : (activeAdminTab === 'league' && activeLeagueSub === 'seasons' ? seasonConfigMode : 'none');
    if (params?.seasonMode !== undefined) setSeasonConfigMode(params.seasonMode);

    const activeSeasonId = params?.seasonId !== undefined
      ? params.seasonId
      : (activeSeasonMode !== 'none' ? currentSeasonId : undefined);
    if (params?.seasonId !== undefined || params?.seasonMode === 'none') {
      setCurrentSeasonId(params?.seasonMode === 'none' ? undefined : params?.seasonId);
    }

    if (params?.flashcardSetId) setSelectedFlashcardSetId(params.flashcardSetId);

    const activeProblemId = params?.problemId ?? selectedProblemId;
    const activeTopic = params?.topic ?? selectedTopic;

    const hashStr = buildHash(effectiveView, {
      problemId: activeProblemId,
      topicSlug: activeTopic?.slug,
      authMode: effectiveAuthMode,
      adminTab: effectiveView === 'admin' ? activeAdminTab : undefined,
      leagueSub: effectiveView === 'admin' && activeAdminTab === 'league' ? activeLeagueSub : undefined,
      seasonMode: effectiveView === 'admin' && activeAdminTab === 'league' && activeSeasonMode !== 'none' ? activeSeasonMode : undefined,
      seasonId: effectiveView === 'admin' && activeAdminTab === 'league' && activeSeasonMode !== 'none' ? activeSeasonId : undefined,
      flashcardSetId: params?.flashcardSetId ?? selectedFlashcardSetId,
    });

    const stateObj = {
      view: effectiveView,
      problemId: activeProblemId,
      topicSlug: activeTopic?.slug,
      authMode: effectiveAuthMode,
      adminTab: activeAdminTab,
      leagueSub: activeLeagueSub,
      seasonMode: activeSeasonMode,
      seasonId: activeSeasonId,
      flashcardSetId: params?.flashcardSetId ?? selectedFlashcardSetId,
    };

    try {
      sessionStorage.setItem(VIEW_KEY, effectiveView);
      localStorage.removeItem(VIEW_KEY);

      if (options?.replace || !guard.allowed) {
        window.history.replaceState(stateObj, '', hashStr);
      } else {
        if (window.location.hash !== hashStr) {
          window.history.pushState(stateObj, '', hashStr);
        } else {
          window.history.replaceState(stateObj, '', hashStr);
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
      topicSlug: selectedTopic?.slug,
      authMode,
      adminTab: view === 'admin' ? adminTab : undefined,
      leagueSub: view === 'admin' && adminTab === 'league' ? leagueSubTab : undefined,
      seasonMode: view === 'admin' && adminTab === 'league' && seasonConfigMode !== 'none' ? seasonConfigMode : undefined,
      seasonId: view === 'admin' && adminTab === 'league' && seasonConfigMode !== 'none' ? currentSeasonId : undefined,
      flashcardSetId: selectedFlashcardSetId,
    });

    const activeState = {
      view,
      problemId: selectedProblemId,
      topicSlug: selectedTopic?.slug,
      authMode,
      adminTab,
      leagueSub: leagueSubTab,
      seasonMode: seasonConfigMode,
      seasonId: currentSeasonId,
      flashcardSetId: selectedFlashcardSetId,
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
      let targetLeagueSub: LeagueSubTab = 'overview';
      let targetSeasonMode: 'none' | 'edit' | 'view' = 'none';
      let targetSeasonId: string | undefined = undefined;
      let targetFlashcardSetId = selectedFlashcardSetId;

      if (state && state.view) {
        targetView = state.view;
        if (state.problemId) {
          targetProblemId = state.problemId;
          const topicFromProb = getTopicForProblem(state.problemId);
          if (topicFromProb) targetTopic = topicFromProb;
        }
        if (state.topicSlug) {
          const found = getTopicBySlugOrName(state.topicSlug);
          if (found) targetTopic = found;
        }
        if (state.authMode) targetAuthMode = state.authMode;
        if (state.adminTab) targetAdminTab = state.adminTab;
        if (state.leagueSub) targetLeagueSub = state.leagueSub;
        if (state.seasonMode) targetSeasonMode = state.seasonMode;
        if (state.seasonId) targetSeasonId = state.seasonId;
        if (state.flashcardSetId) targetFlashcardSetId = state.flashcardSetId;
      } else {
        // Fallback: parse window.location.hash if state is empty
        const parsed = parseHash(window.location.hash);
        targetView = parsed.view;
        if (parsed.problemId) {
          targetProblemId = parsed.problemId;
          const topicFromProb = getTopicForProblem(parsed.problemId);
          if (topicFromProb) targetTopic = topicFromProb;
        }
        if (parsed.topicSlug) {
          const found = getTopicBySlugOrName(parsed.topicSlug);
          if (found) targetTopic = found;
        }
        if (parsed.authMode) targetAuthMode = parsed.authMode;
        if (parsed.adminTab) targetAdminTab = parsed.adminTab;
        if (parsed.leagueSub) targetLeagueSub = parsed.leagueSub;
        if (parsed.seasonMode) targetSeasonMode = parsed.seasonMode;
        if (parsed.seasonId) targetSeasonId = parsed.seasonId;
        if (parsed.flashcardSetId) targetFlashcardSetId = parsed.flashcardSetId;
      }

      // Check route guard on browser back/forward navigation
      const guard = checkRouteAccess(targetView, user);
      if (!guard.allowed) {
        targetView = guard.view;
        if (guard.authMode) targetAuthMode = guard.authMode;
        if (guard.redirectAfterLogin) {
          sessionStorage.setItem('redirect_after_login', guard.redirectAfterLogin);
        }
        const safeHash = buildHash(targetView, { authMode: targetAuthMode });
        window.history.replaceState({ view: targetView, authMode: targetAuthMode }, '', safeHash);
      }

      setView(targetView);
      setSelectedProblemId(targetProblemId);
      setSelectedTopic(targetTopic);
      setAuthMode(targetAuthMode);
      setAdminTab(targetAdminTab);
      setLeagueSubTab(targetLeagueSub);
      setSeasonConfigMode(targetSeasonMode);
      setCurrentSeasonId(targetSeasonId);
      setSelectedFlashcardSetId(targetFlashcardSetId);

      try {
        sessionStorage.setItem(VIEW_KEY, targetView);
      } catch {
        // ignore
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, view, selectedProblemId, selectedTopic, authMode, adminTab, leagueSubTab, seasonConfigMode, currentSeasonId, selectedFlashcardSetId]);

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
  const goPractice = (problemId?: string) => {
    let topicForProblem: TopicInfo | undefined;
    if (problemId) {
      topicForProblem = getTopicForProblem(problemId);
    }
    nav('practice', {
      problemId,
      topic: topicForProblem ?? selectedTopic,
    });
  };
  const goTopics = () => nav('topics');
  const handleSelectTopic = (t: TopicInfo) => nav('topic-detail', { topic: t });
  const goProfile = () => nav('profile');
  const goProgress = () => nav('progress');
  const goHistory = () => nav('history');
  const goSettings = () => nav('settings');
  const goScoringGuide = () => nav('scoring-guide');
  const goAdmin = (tab?: AdminTab) => nav('admin', { adminTab: tab ?? 'dashboard' });
  const goFlashcards = () => nav('flashcards');
  const goFlashcardLibrary = () => nav('flashcard-library');
  const goLeague = () => nav('league');
  const goCreateFlashcardSet = (setId?: unknown) => {
    const validId = typeof setId === 'string' && setId.trim().length > 0 ? setId.trim() : null;
    setEditingFlashcardSetId(validId);
    nav('create-flashcard', validId ? { flashcardSetId: validId } : undefined);
  };
  const handleSelectFlashcardSet = (setId: string) => {
    setMultiSetMatchCards(null);
    setMultiSetMatchTitle('');
    nav('flashcard-detail', { flashcardSetId: setId });
  };
  const handleStartMultiSetPractice = (cards: FlashcardItem[], title: string) => {
    setMultiSetMatchCards(cards);
    setMultiSetMatchTitle(title);
    nav('flashcard-match');
  };
  const goFlashcardMatch = (setId?: string) => nav('flashcard-match', setId ? { flashcardSetId: setId } : undefined);

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
      sessionStorage.removeItem('redirect_after_login');
      sessionStorage.removeItem('auth_user');
    } catch {
      // ignore
    }
    nav('landing', {}, { replace: true });
  };

  const handleAssessmentComplete = (scores: TopicScore[]) => {
    setAssessmentScores(scores);
    try {
      localStorage.setItem('user_assessment_scores', JSON.stringify(scores));
    } catch {
      // ignore
    }
    nav('result');
  };

  // ── Auth ──────────────────────────────────────────────────────────────────
  if (view === 'auth') {
    return (
      <AuthPage
        onBack={goLanding}
        initialMode={authMode}
        onLoginSuccess={(isNewUser?: boolean, role?: UserRole) => {
          const redirectTarget = sessionStorage.getItem('redirect_after_login') as View | null;
          sessionStorage.removeItem('redirect_after_login');

          if (role === 'teacher' || role === 'admin') {
            if (redirectTarget && ['admin', 'profile', 'settings', 'progress', 'history'].includes(redirectTarget)) {
              nav(redirectTarget, {}, { replace: true });
            } else {
              nav('admin', { adminTab: 'dashboard' }, { replace: true });
            }
          } else if (isNewUser) {
            nav('onboarding');
          } else {
            // Student user: fallback to topics if target was admin/forbidden/auth
            if (
              redirectTarget &&
              redirectTarget !== 'admin' &&
              redirectTarget !== 'forbidden' &&
              redirectTarget !== 'auth'
            ) {
              nav(redirectTarget, {}, { replace: true });
            } else {
              nav('topics', {}, { replace: true });
            }
          }
        }}
      />
    );
  }

  // ── 403 Forbidden Access Denied ───────────────────────────────────────────
  if (view === 'forbidden' || (view === 'admin' && user?.role === 'student')) {
    return (
      <AccessDeniedPage
        onGoLanding={goLanding}
        onGoTopics={goTopics}
        onGoProfile={goProfile}
        onGoAuth={goAuth}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoSettings={goSettings}
        onGoFlashcards={goFlashcards}
        onGoFlashcardLibrary={goFlashcardLibrary}
        onLoggedOut={handleLoggedOut}
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

  // ── League / Đấu hạng ─────────────────────────────────────────────────────
  if (view === 'league') {
    return (
      <LeaguePage
        onGoLanding={goLanding}
        onGoAuth={goAuth}
        onGoTopics={goTopics}
        onGoFlashcards={goFlashcards}
        onGoFlashcardLibrary={goFlashcardLibrary}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoAdmin={goAdmin}
        onGoSettings={goSettings}
        onLoggedOut={handleLoggedOut}
        onGoPractice={goPractice}
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
        onGoFlashcards={goFlashcards}
        onGoFlashcardLibrary={goFlashcardLibrary}
        onGoLeague={goLeague}
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
        onGoFlashcards={goFlashcards}
        onGoFlashcardLibrary={goFlashcardLibrary}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoAdmin={() => goAdmin('dashboard')}
        onGoSettings={goSettings}
        onGoLeague={goLeague}
        onLoggedOut={handleLoggedOut}
      />
    );
  }

  // ── Practice ──────────────────────────────────────────────────────────────
  if (view === 'practice') {
    return (
      <PracticePage
        onBack={(currentProblem) => {
          const prob = currentProblem || (selectedProblemId ? getProblemById(selectedProblemId) : undefined);
          const targetTopic = prob ? getTopicForProblem(prob) : selectedTopic;
          if (targetTopic) {
            nav('topic-detail', { topic: targetTopic });
          } else {
            nav('topics');
          }
        }}
        initialProblemId={selectedProblemId}
        onProblemChange={(newProb) => {
          setSelectedProblemId(newProb.id);
          const targetTopic = getTopicForProblem(newProb);
          if (targetTopic) {
            setSelectedTopic(targetTopic);
          }
          const hashStr = buildHash('practice', {
            problemId: newProb.id,
            topicSlug: targetTopic?.slug ?? selectedTopic.slug,
          });
          try {
            window.history.replaceState(
              {
                view: 'practice',
                problemId: newProb.id,
                topicSlug: targetTopic?.slug ?? selectedTopic.slug,
                authMode,
                adminTab,
              },
              '',
              hashStr,
            );
          } catch {
            // ignore
          }
        }}
        onGoLanding={goLanding}
        onGoAuth={goAuth}
        onGoTopics={goTopics}
        onGoFlashcards={goFlashcards}
        onGoFlashcardLibrary={goFlashcardLibrary}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoAdmin={() => goAdmin('dashboard')}
        onGoSettings={goSettings}
        onGoLeague={goLeague}
        onLoggedOut={handleLoggedOut}
      />
    );
  }

  // ── Profile ───────────────────────────────────────────────────────────────
  if (view === 'profile') {
    if (!user) {
      return (
        <AuthPage
          onBack={goLanding}
          initialMode="login"
          onLoginSuccess={() => nav('profile', {}, { replace: true })}
        />
      );
    }
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
        onGoFlashcards={goFlashcards}
        onGoFlashcardLibrary={goFlashcardLibrary}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoAdmin={() => goAdmin('dashboard')}
        onGoSettings={goSettings}
        onGoLeague={goLeague}
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
        onGoFlashcards={goFlashcards}
        onGoFlashcardLibrary={goFlashcardLibrary}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoScoringGuide={goScoringGuide}
        onGoAdmin={() => goAdmin('dashboard')}
        onGoSettings={goSettings}
        onGoLeague={goLeague}
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
        onGoFlashcards={goFlashcards}
        onGoFlashcardLibrary={goFlashcardLibrary}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoAdmin={() => goAdmin('dashboard')}
        onGoSettings={goSettings}
        onGoLeague={goLeague}
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
        onGoFlashcards={goFlashcards}
        onGoFlashcardLibrary={goFlashcardLibrary}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoAdmin={() => goAdmin('dashboard')}
        onGoSettings={goSettings}
        onGoLeague={goLeague}
      />
    );
  }

  // ── Settings ──────────────────────────────────────────────────────────────
  if (view === 'settings') {
    if (!user) {
      return (
        <AuthPage
          onBack={goLanding}
          initialMode="login"
          onLoginSuccess={() => nav('settings', {}, { replace: true })}
        />
      );
    }
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
        onGoFlashcards={goFlashcards}
        onGoFlashcardLibrary={goFlashcardLibrary}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoAdmin={() => goAdmin('dashboard')}
        onGoSettings={goSettings}
        onGoLeague={goLeague}
        onLoggedOut={handleLoggedOut}
      />
    );
  }

  // ── Admin Dashboard ───────────────────────────────────────────────────────
  if (view === 'admin') {
    if (!user) {
      return (
        <AuthPage
          onBack={goLanding}
          initialMode="login"
          onLoginSuccess={(isNewUser?: boolean, role?: UserRole) => {
            if (role === 'teacher' || role === 'admin') {
              nav('admin', { adminTab: 'dashboard' }, { replace: true });
            } else {
              nav('topics', {}, { replace: true });
            }
          }}
        />
      );
    }
    if (user.role !== 'admin' && user.role !== 'teacher') {
      return (
        <AccessDeniedPage
          onGoLanding={goLanding}
          onGoTopics={goTopics}
          onGoProfile={goProfile}
          onGoAuth={goAuth}
          onLoggedOut={handleLoggedOut}
        />
      );
    }
    return (
      <AdminPage
        activeTab={adminTab}
        onTabChange={(tab) =>
          nav('admin', {
            adminTab: tab,
            leagueSub: tab === 'league' ? leagueSubTab : undefined,
            seasonMode: 'none',
          })
        }
        leagueSubTab={leagueSubTab}
        onLeagueSubTabChange={(sub) =>
          nav('admin', {
            adminTab: 'league',
            leagueSub: sub,
            seasonMode: 'none',
          })
        }
        seasonConfigMode={seasonConfigMode}
        seasonId={currentSeasonId}
        onSeasonNavigate={(mode, targetSeasonId) =>
          nav('admin', {
            adminTab: 'league',
            leagueSub: 'seasons',
            seasonMode: mode,
            seasonId: targetSeasonId,
          })
        }
        onBack={goLanding}
        onGoLanding={() => goAdmin('dashboard')}
        onGoAuth={goAuth}
        onGoTopics={goTopics}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoPractice={goPractice}
      />
    );
  }

  // ── Flashcards ────────────────────────────────────────────────────────────
  if (view === 'flashcards') {
    return (
      <FlashcardsPage
        onAuth={goAuth}
        onGoLanding={goLanding}
        onGoTopics={goTopics}
        onGoFlashcards={goFlashcards}
        onGoFlashcardLibrary={goFlashcardLibrary}
        onGoCreateSet={() => goCreateFlashcardSet()}
        onEditSet={(setId) => goCreateFlashcardSet(setId)}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoAdmin={() => goAdmin('dashboard')}
        onGoSettings={goSettings}
        onGoLeague={goLeague}
        onLoggedOut={handleLoggedOut}
        onSelectSet={handleSelectFlashcardSet}
        onStartMultiSetPractice={handleStartMultiSetPractice}
        onBack={goLanding}
        initialTab="explore"
      />
    );
  }

  // ── Flashcard Library ─────────────────────────────────────────────────────
  if (view === 'flashcard-library') {
    return (
      <FlashcardLibraryPage
        onBack={goFlashcards}
        onAuth={goAuth}
        onGoLanding={goLanding}
        onGoTopics={goTopics}
        onGoFlashcards={goFlashcards}
        onGoFlashcardLibrary={goFlashcardLibrary}
        onGoCreateSet={() => goCreateFlashcardSet()}
        onEditSet={(setId) => goCreateFlashcardSet(setId)}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoAdmin={() => goAdmin('dashboard')}
        onGoSettings={goSettings}
        onGoLeague={goLeague}
        onLoggedOut={handleLoggedOut}
        onSelectSet={handleSelectFlashcardSet}
        onGoMatch={goFlashcardMatch}
      />
    );
  }

  // ── Create Flashcard Set ──────────────────────────────────────────────────
  if (view === 'create-flashcard') {
    return (
      <CreateFlashcardSetPage
        editSetId={editingFlashcardSetId}
        onBack={goFlashcardLibrary}
        onAuth={goAuth}
        onGoLanding={goLanding}
        onGoTopics={goTopics}
        onGoFlashcards={goFlashcards}
        onGoFlashcardLibrary={goFlashcardLibrary}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoAdmin={() => goAdmin('dashboard')}
        onGoSettings={goSettings}
        onGoLeague={goLeague}
        onLoggedOut={handleLoggedOut}
        onCreated={(newSetId, studyNow) => {
          if (studyNow) {
            handleSelectFlashcardSet(newSetId);
          } else {
            goFlashcardLibrary();
          }
        }}
      />
    );
  }

  // ── Flashcard Detail ──────────────────────────────────────────────────────
  if (view === 'flashcard-detail') {
    return (
      <FlashcardDetailPage
        setId={selectedFlashcardSetId}
        onBack={goFlashcards}
        onAuth={goAuth}
        onGoLanding={goLanding}
        onGoTopics={goTopics}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoAdmin={() => goAdmin('dashboard')}
        onGoSettings={goSettings}
        onGoLeague={goLeague}
        onLoggedOut={handleLoggedOut}
        onGoMatch={goFlashcardMatch}
      />
    );
  }

  // ── Flashcard Match (Ghép thẻ ôn luyện) ───────────────────────────────────
  if (view === 'flashcard-match') {
    return (
      <FlashcardMatchPage
        setId={selectedFlashcardSetId}
        customCards={multiSetMatchCards || undefined}
        customTitle={multiSetMatchTitle || undefined}
        isMultiSetMode={Boolean(multiSetMatchCards && multiSetMatchCards.length > 0)}
        onBack={() => {
          if (multiSetMatchCards) {
            setMultiSetMatchCards(null);
            setMultiSetMatchTitle('');
            goFlashcards();
          } else {
            nav('flashcard-detail', { flashcardSetId: selectedFlashcardSetId });
          }
        }}
        onAuth={goAuth}
        onGoLanding={goLanding}
        onGoTopics={goTopics}
        onGoFlashcards={goFlashcards}
        onGoFlashcardLibrary={goFlashcardLibrary}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
        onGoHistory={goHistory}
        onGoAdmin={() => goAdmin('dashboard')}
        onGoSettings={goSettings}
        onGoLeague={goLeague}
        onLoggedOut={handleLoggedOut}
      />
    );
  }

  // ── Landing (default) ─────────────────────────────────────────────────────
  return (
    <LandingPage
      onGoAuth={goAuth}
      onGoTopics={goTopics}
      onGoFlashcards={goFlashcards}
      onGoFlashcardLibrary={goFlashcardLibrary}
      onGoLeague={goLeague}
      onGoProfile={goProfile}
      onGoProgress={goProgress}
      onGoSettings={goSettings}
      onGoStartPractice={goStartPractice}
      onLoggedOut={handleLoggedOut}
    />
  );
}

export default App;

import { useState, useEffect, lazy, Suspense, type ComponentType } from 'react';
import type { AuthMode, TopicScore, View } from '@/types';
import type { UserRole } from '@/data/mockAuth';
import type { AdminTab, LeagueSubTab } from '@/pages/admin/admin.types';
import { useAuth } from '@/hooks/useAuth.tsx';
import { FullPageLoader } from '@/components/RequireAuth';
// Trang vào đầu tiên: tải ngay cùng bundle chính
import { LandingPage } from '@/pages/user/LandingPage';
import { AuthPage } from '@/pages/user/AuthPage';
import { OnboardingPage, SHOW_QUIZ_OPTION } from '@/pages/user/OnboardingPage';
import { TOPIC_INFOS, getTopicBySlugOrName, type TopicInfo, type PracticeProblem } from '@/types';
import { initTheme } from '@/lib/theme';
import { getCachedPublishedProblems } from '@/hooks/usePublishedProblems';
import { AccessDeniedPage } from '@/pages/user/AccessDeniedPage';

const VIEW_KEY = 'current_view';
const CONTEST_ATTEMPT_KEY = 'contest_attempt_id';
const CHUNK_RELOAD_KEY = 'chunk_reload_once';

/**
 * Tải trang theo nhu cầu (code splitting). Mỗi trang thành một file JS riêng, chỉ tải khi người dùng mở trang đó.
 * Nếu file cũ không còn trên server (vừa deploy bản mới) -> tải lại trang 1 lần để lấy bản mới.
 */
function lazyPage<P>(loader: () => Promise<ComponentType<P>>) {
  return lazy(async () => {
    try {
      const Comp = await loader();
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      return { default: Comp };
    } catch (err) {
      if (!sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
        window.location.reload();
      }
      throw err;
    }
  });
}

const AssessmentPage = lazyPage(() => import('@/pages/user/AssessmentPage').then((m) => m.AssessmentPage));
const QuizPage = lazyPage(() => import('@/pages/user/QuizPage').then((m) => m.QuizPage));
const ResultPage = lazyPage(() => import('@/pages/user/ResultPage').then((m) => m.ResultPage));
const PracticePage = lazyPage(() => import('@/pages/user/PracticePage').then((m) => m.default));
const TopicsPage = lazyPage(() => import('@/pages/user/TopicsPage').then((m) => m.TopicsPage));
const TopicDetailPage = lazyPage(() => import('@/pages/user/TopicDetailPage').then((m) => m.TopicDetailPage));
const ProfilePage = lazyPage(() => import('@/pages/user/ProfilePage').then((m) => m.ProfilePage));
const ProgressPage = lazyPage(() => import('@/pages/user/ProgressPage').then((m) => m.ProgressPage));
const HistoryPage = lazyPage(() => import('@/pages/user/HistoryPage').then((m) => m.HistoryPage));
const SettingsPage = lazyPage(() => import('@/pages/user/SettingsPage').then((m) => m.SettingsPage));
const ScoringGuidePage = lazyPage(() => import('@/pages/user/ScoringGuidePage').then((m) => m.ScoringGuidePage));
const AdminPage = lazyPage(() => import('@/pages/admin/AdminPage').then((m) => m.AdminPage));
const FlashcardsPage = lazyPage(() => import('@/pages/user/FlashcardsPage').then((m) => m.FlashcardsPage));
const FlashcardDetailPage = lazyPage(() => import('@/pages/user/FlashcardDetailPage').then((m) => m.FlashcardDetailPage));
const FlashcardLibraryPage = lazyPage(() => import('@/pages/user/FlashcardLibraryPage').then((m) => m.FlashcardLibraryPage));
const CreateFlashcardSetPage = lazyPage(() =>
  import('@/pages/user/CreateFlashcardSetPage').then((m) => m.CreateFlashcardSetPage),
);
const LeaguePage = lazyPage(() => import('@/pages/user/league/LeaguePage').then((m) => m.LeaguePage));
const ContestPage = lazyPage(() => import('@/pages/user/league/ContestPage').then((m) => m.ContestPage));
const FlashcardMatchPage = lazyPage(() => import('@/pages/user/FlashcardMatchPage').then((m) => m.FlashcardMatchPage));

/** Các trang học viên mới (chưa tự đánh giá) vẫn được vào */
const ONBOARDING_ALLOWED_VIEWS: View[] = ['landing', 'auth', 'onboarding', 'self-rate', 'quiz', 'result'];

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
  const userProtectedViews: View[] = ['profile', 'settings', 'progress', 'history', 'create-flashcard', 'contest'];
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

/**
 * Chu de tu URL: uu tien TOPIC_INFOS (co icon/mo ta), chu de la do giang vien tao (vd. "basic")
 * thi dung the mac dinh — TopicDetailPage tu loc bai theo ten va dem so bai tu backend.
 */
function resolveTopic(slugOrName: string): TopicInfo {
  const found = getTopicBySlugOrName(slugOrName);
  if (found) return found;
  const name = slugOrName.replace(/-/g, ' ');
  const title = name.charAt(0).toUpperCase() + name.slice(1);
  return {
    name: title,
    slug: title.toLowerCase().replace(/\s+/g, '-'),
    title,
    icon: 'Code2',
    description: `Các bài tập thuộc chủ đề ${title}.`,
    problemCount: 0,
    difficulties: { beginner: 0, basic: 0, intermediate: 0, advanced: 0, expert: 0 },
  };
}

/** Chu de cua 1 bai: tra theo doi tuong bai, hoac theo id trong danh sach bai backend da tai (khong dung du lieu mau) */
function topicForProblem(problem?: PracticeProblem | string): TopicInfo | undefined {
  const prob = typeof problem === 'string' ? getCachedPublishedProblems().find((p) => p.id === problem) : problem;
  return prob?.topic ? resolveTopic(prob.topic) : undefined;
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
        const topicFromProb = topicForProblem(hashData.problemId);
        if (topicFromProb) selectedTopic = topicFromProb;
      }
      if (hashData.topicSlug) {
        selectedTopic = resolveTopic(hashData.topicSlug);
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
  const [assessmentScores, setAssessmentScores] = useState<TopicScore[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState<string>(initialState.selectedProblemId);
  const [selectedTopic, setSelectedTopic] = useState<TopicInfo>(initialState.selectedTopic);
  const [adminTab, setAdminTab] = useState<AdminTab>(initialState.adminTab);
  const [leagueSubTab, setLeagueSubTab] = useState<LeagueSubTab>(initialState.leagueSubTab);
  const [seasonConfigMode, setSeasonConfigMode] = useState<'none' | 'edit' | 'view'>(initialState.seasonConfigMode);
  const [currentSeasonId, setCurrentSeasonId] = useState<string | undefined>(initialState.seasonId);
  const [selectedFlashcardSetId, setSelectedFlashcardSetId] = useState<string>(initialState.selectedFlashcardSetId);
  const [editingFlashcardSetId, setEditingFlashcardSetId] = useState<string | null>(null);

  const { user, initializing } = useAuth();

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
          const topicFromProb = topicForProblem(state.problemId);
          if (topicFromProb) targetTopic = topicFromProb;
        }
        if (state.topicSlug) {
          targetTopic = resolveTopic(state.topicSlug);
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
          const topicFromProb = topicForProblem(parsed.problemId);
          if (topicFromProb) targetTopic = topicFromProb;
        }
        if (parsed.topicSlug) {
          targetTopic = resolveTopic(parsed.topicSlug);
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

  // ── ONBOARDING GUARDS (tự đánh giá bắt buộc) ──
  useEffect(() => {
    if (initializing) return;

    // Bài kiểm tra nhỏ đang ẩn -> #quiz chuyển sang tự đánh giá
    if (view === 'quiz' && !SHOW_QUIZ_OPTION) {
      nav('self-rate', {}, { replace: true });
      return;
    }

    // Các bước đánh giá cần đăng nhập
    if (!user && (view === 'onboarding' || view === 'self-rate' || view === 'quiz' || view === 'result')) {
      nav('auth', { authMode: 'login' }, { replace: true });
      return;
    }

    // Học viên mới chưa tự đánh giá -> không vào được các trang học tập
    if (user?.role === 'student' && user.isNewUser && !ONBOARDING_ALLOWED_VIEWS.includes(view)) {
      nav('onboarding', {}, { replace: true });
    }
  }, [user, view, initializing]);

  // Quick navigation shortcuts
  const goLanding = () => nav('landing');
  const goAuth = (m: AuthMode) => nav('auth', { authMode: m });
  const goOnboarding = () => nav('onboarding');
  const goPractice = (problemId?: string) => {
    const problemTopic = problemId ? topicForProblem(problemId) : undefined;
    nav('practice', {
      problemId,
      topic: problemTopic ?? selectedTopic,
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
  // Lượt thi đang làm: lưu id để tải lại trang (F5) vẫn vào đúng lượt
  const [contestAttemptId, setContestAttemptId] = useState<number | null>(() => {
    try {
      const raw = sessionStorage.getItem(CONTEST_ATTEMPT_KEY);
      return raw ? Number(raw) : null;
    } catch {
      return null;
    }
  });
  const goContest = (attemptId: number) => {
    setContestAttemptId(attemptId);
    try {
      sessionStorage.setItem(CONTEST_ATTEMPT_KEY, String(attemptId));
    } catch {
      // ignore
    }
    nav('contest');
  };
  const goCreateFlashcardSet = (setId?: unknown) => {
    const validId = typeof setId === 'string' && setId.trim().length > 0 ? setId.trim() : null;
    setEditingFlashcardSetId(validId);
    nav('create-flashcard', validId ? { flashcardSetId: validId } : undefined);
  };
  const handleSelectFlashcardSet = (setId: string) => nav('flashcard-detail', { flashcardSetId: setId });
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
        onBack={() => (user?.isNewUser ? nav('onboarding') : goProgress())}
        onComplete={handleAssessmentComplete}
        onGoLanding={goLanding}
        onGoTopics={goTopics}
        onGoProfile={goProfile}
        onGoProgress={goProgress}
      />
    );
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────
  // Đang ẩn (SHOW_QUIZ_OPTION = false) — giữ code để bật lại khi cần
  if (view === 'quiz' && SHOW_QUIZ_OPTION) {
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
        onGoContest={goContest}
      />
    );
  }

  // ── Contest / Làm bài thi đấu ─────────────────────────────────────────────
  if (view === 'contest') {
    if (!contestAttemptId) {
      return (
        <LeaguePage
          onGoLanding={goLanding}
          onGoAuth={goAuth}
          onGoTopics={goTopics}
          onGoProfile={goProfile}
          onGoProgress={goProgress}
          onGoHistory={goHistory}
          onGoSettings={goSettings}
          onLoggedOut={handleLoggedOut}
          onGoContest={goContest}
        />
      );
    }
    return <ContestPage attemptId={contestAttemptId} onBack={goLeague} />;
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
          const targetTopic = topicForProblem(currentProblem ?? selectedProblemId) ?? selectedTopic;
          if (targetTopic) {
            nav('topic-detail', { topic: targetTopic });
          } else {
            nav('topics');
          }
        }}
        initialProblemId={selectedProblemId}
        onGoPractice={goPractice}
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
        onGoSelfRate={() => nav('self-rate')}
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
        onBack={() => nav('flashcard-detail', { flashcardSetId: selectedFlashcardSetId })}
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

/** Hiện "Đang tải..." trong lúc file JS của trang được tải về lần đầu */
function AppWithSuspense() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <App />
    </Suspense>
  );
}

export default AppWithSuspense;

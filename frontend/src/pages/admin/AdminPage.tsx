import { useState, useEffect } from 'react';
import { Header } from '@/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { PRACTICE_PROBLEMS, TOPIC_INFOS, type PracticeProblem, type AuthMode, type SkillLevel, type TopicInfo } from '@/types';

import {
  type AdminTab,
  type UserRecord,
  type SampleTemplate,
  type GeneratedQuestion,
  type ActivityLog,
  MOCK_USERS_LIST,
  MOCK_SAMPLE_TEMPLATES,
  DEFAULT_TOPIC_STATS,
} from './admin.types';
import { AdminSidebarNav } from './AdminSidebarNav';
import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminProblemsTab } from './AdminProblemsTab';
import { AdminTemplatesTab } from './AdminTemplatesTab';
import { AdminGeneratorTab } from './AdminGeneratorTab';
import { AdminFlashcardsTab } from './AdminFlashcardsTab';
import { AdminAuditLogsTab } from './AdminAuditLogsTab';
import { AdminUserDetailModal } from './AdminUserDetailModal';
import { AdminAddUserModal } from './AdminAddUserModal';
import { AdminTemplateDetailModal } from './AdminTemplateDetailModal';
import { AdminTemplateFormModal } from './AdminTemplateFormModal';
import { AdminImportExcelModal } from './AdminImportExcelModal';
import {
  adminApi,
  templatesApi,
  topicsApi,
  problemsApi,
  type Template as BackendTemplate,
  type Topic as BackendTopic,
  type AdminUser as BackendAdminUser,
  type AdminDashboardStats as BackendDashboardStats,
  type BackendProblem,
  type BackendRole,
} from '@/lib/api';
import { AdminProfileContent } from './AdminProfileContent';

interface AdminPageProps {
  activeTab?: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
  onBack: () => void;
  onGoLanding?: () => void;
  onGoAuth?: (mode: AuthMode) => void;
  onGoTopics?: () => void;
  onGoProfile?: () => void;
  onGoProgress?: () => void;
  onGoHistory?: () => void;
  onGoSettings?: () => void;
  onGoPractice?: () => void;
  onLoggedOut?: () => void;
}

export function AdminPage({
  activeTab: controlledActiveTab,
  onTabChange,
  onGoLanding,
  onGoAuth,
  onGoTopics,
  onGoProfile,
  onGoProgress,
  onGoHistory,
  onGoSettings,
  onLoggedOut,
}: AdminPageProps) {
  const { user } = useAuth();
  const [internalActiveTab, setInternalActiveTab] = useState<AdminTab>('dashboard');

  const activeTab = controlledActiveTab ?? internalActiveTab;
  const setActiveTab = (tab: AdminTab) => {
    setInternalActiveTab(tab);
    onTabChange?.(tab);
  };

  // Shared state
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [practiceProblems, setPracticeProblems] = useState<PracticeProblem[]>([]);
  const [sampleTemplates, setSampleTemplates] = useState<SampleTemplate[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [dashboardStats, setDashboardStats] = useState<BackendDashboardStats | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Topics state — fetch from DB, fallback to hardcoded TOPIC_INFOS
  const [topicsList, setTopicsList] = useState<TopicInfo[]>(TOPIC_INFOS);

  // Mapping backend level string to SkillLevel
  const mapLevel = (level: string): SkillLevel => {
    const l = level.toLowerCase();
    if (l === 'beginner' || l === 'basic' || l === 'intermediate' || l === 'advanced' || l === 'expert') {
      return l as SkillLevel;
    }
    return 'basic';
  };

  // Mapping backend Template to frontend SampleTemplate
  const mapTemplate = (t: BackendTemplate): SampleTemplate => ({
    id: String(t.id),
    title: t.name,
    topic: t.topic?.name ?? 'Khác',
    level: mapLevel(t.level),
    description: t.statementPattern,
    starterCode: t.referenceSolutionCode,
    minLength: t.minN ?? undefined,
    maxLength: t.maxN ?? undefined,
    minValue: t.minValue ?? undefined,
    maxValue: t.maxValue ?? undefined,
    generatorType: t.generatorType,
    languageId: t.languageId,
    updatedAt: t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
  });

  // Mapping backend Topic to frontend TopicInfo (dùng TOPIC_INFOS làm reference cho icon/description)
  const mapTopic = (t: BackendTopic): TopicInfo => {
    const known = TOPIC_INFOS.find((ti) => ti.name.toLowerCase() === t.name.toLowerCase());
    if (known) {
      return { ...known, problemCount: 0, difficulties: { easy: 0, medium: 0, hard: 0 } };
    }
    const slug = t.name.toLowerCase().replace(/\s+/g, '-');
    return {
      name: t.name,
      slug,
      title: t.name,
      icon: 'Layers',
      description: `Chủ đề: ${t.name}`,
      problemCount: 0,
      difficulties: { easy: 0, medium: 0, hard: 0 },
    };
  };

  // Mapping backend AdminUser to frontend UserRecord
  const mapAdminUser = (u: BackendAdminUser): UserRecord => ({
    id: String(u.id),
    name: u.fullName,
    email: u.email,
    role: u.role.toLowerCase() as 'student' | 'teacher' | 'admin',
    solvedCount: u.solvedCount,
    status: u.active ? 'active' : 'suspended',
    joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
    topicStats: DEFAULT_TOPIC_STATS,
  });

  // Mapping backend Problem level to frontend difficulty
  const mapDifficulty = (level: string): 'Easy' | 'Medium' | 'Hard' => {
    const l = level.toLowerCase();
    if (l === 'beginner' || l === 'basic') return 'Easy';
    if (l === 'intermediate' || l === 'advanced') return 'Medium';
    if (l === 'expert') return 'Hard';
    return 'Medium';
  };

  // Mapping backend Problem to frontend PracticeProblem
  const mapBackendProblem = (p: BackendProblem): PracticeProblem => ({
    id: String(p.id),
    title: p.statement.length > 80 ? p.statement.substring(0, 80) + '...' : p.statement,
    topic: p.topic,
    difficulty: mapDifficulty(p.level),
    description: p.statement,
    examples: (p.samples ?? []).map(s => ({ input: s.input, output: s.expectedOutput })),
    starterCode: '',
    language: 'java',
    constraints: [],
    isPublic: p.status === 'PUBLISHED',
    isAiGenerated: p.sourceType === 'AI_GENERATED',
  });

  // Mapping backend AuditLog to frontend ActivityLog
  const mapAuditLog = (log: { id: number; action: string; user: string; target: string; time: string }): ActivityLog => ({
    id: String(log.id),
    user: log.user,
    action: log.action as 'CREATE' | 'UPDATE' | 'DELETE' | 'TOGGLE',
    target: log.target,
    time: log.time,
  });

  // Fetch all admin data from API on mount
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          adminApi.getDashboardStats(),
          adminApi.getUsers(),
          templatesApi.list(),
          topicsApi.list(),
          problemsApi.listAll(),
          adminApi.getAuditLogs(),
        ]);

        if (cancelled) return;

        // Dashboard stats
        if (results[0].status === 'fulfilled') {
          setDashboardStats(results[0].value);
        }

        // Users
        if (results[1].status === 'fulfilled' && results[1].value.length > 0) {
          setUsers(results[1].value.map(mapAdminUser));
        }

        // Templates
        if (results[2].status === 'fulfilled' && results[2].value.length > 0) {
          setSampleTemplates(results[2].value.map(mapTemplate));
        }

        // Topics
        if (results[3].status === 'fulfilled' && results[3].value.length > 0) {
          setTopicsList(results[3].value.map(mapTopic));
        }

        // Problems
        if (results[4].status === 'fulfilled' && results[4].value.length > 0) {
          setPracticeProblems(results[4].value.map(mapBackendProblem));
        }

        // Audit Logs — load from dedicated API
        if (results[5].status === 'fulfilled' && results[5].value.length > 0) {
          setActivityLogs(results[5].value.map(mapAuditLog));
        }

        setDataError(null);
      } catch (err) {
        if (!cancelled) {
          setDataError('Không thể tải dữ liệu từ máy chủ.');
        }
      } finally {
        if (!cancelled) {
          setDataLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Refresh functions to reload data from API after CRUD operations
  const refreshProblems = async () => {
    try {
      const allProblems = await problemsApi.listAll();
      if (allProblems.length > 0) {
        setPracticeProblems(allProblems.map(mapBackendProblem));
      }
    } catch {
      // Keep existing data if refresh fails
    }
  };

  // Auto-refresh problems list when switching to the problems tab
  useEffect(() => {
    if (activeTab === 'problems') {
      refreshProblems();
    }
  }, [activeTab]);

  const refreshUsers = async () => {
    try {
      const allUsers = await adminApi.getUsers();
      if (allUsers.length > 0) {
        setUsers(allUsers.map(mapAdminUser));
      }
    } catch {
      // Keep existing data if refresh fails
    }
  };

  const refreshTemplates = async () => {
    try {
      const allTemplates = await templatesApi.list();
      if (allTemplates.length > 0) {
        setSampleTemplates(allTemplates.map(mapTemplate));
      }
    } catch {
      // Keep existing data if refresh fails
    }
  };

  const refreshAuditLogs = async () => {
    try {
      const logs = await adminApi.getAuditLogs();
      if (logs.length > 0) {
        setActivityLogs(logs.map(mapAuditLog));
      }
    } catch {
      // Keep existing data if refresh fails
    }
  };

  // User Modals state
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Template Modals state
  const [selectedTemplateForDetail, setSelectedTemplateForDetail] = useState<SampleTemplate | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<SampleTemplate | null>(null);
  const [showTemplateFormModal, setShowTemplateFormModal] = useState(false);
  const [showImportExcelModal, setShowImportExcelModal] = useState(false);

  // ── USER HANDLERS ──
  const handleToggleStatus = async (id: string) => {
    const targetUser = users.find((u) => u.id === id);
    const backendId = Number(id);
    try {
      const updated = await adminApi.toggleUserStatus(backendId);
      // Refresh users list from API
      await refreshUsers();
      // Refresh audit logs from API
      await refreshAuditLogs();
    } catch {
      // Fallback: cập nhật local
      setActivityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          user: user?.name ?? 'Quản trị viên',
          action: 'TOGGLE',
          target: `Chuyển trạng thái ${targetUser?.name ?? 'tài khoản'} sang: ${targetUser?.status === 'active' ? 'Đã khóa' : 'Hoạt động'}`,
          time: 'Vừa xong',
        },
        ...prev,
      ]);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u,
        ),
      );
    }
  };

  const handleDeleteUser = async (id: string) => {
    const targetUser = users.find((u) => u.id === id);
    const backendId = Number(id);
    try {
      await adminApi.deleteUser(backendId);
      // Refresh users list from API
      await refreshUsers();
      // Refresh audit logs from API
      await refreshAuditLogs();
      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }
    } catch {
      // Fallback: cập nhật local
      setUsers((prev) => prev.filter((u) => u.id !== id));
      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }
    }
  };

  const handleAddUser = async (newUserData: { name: string; email: string; role: 'student' | 'teacher' | 'admin' }) => {
    try {
      const backendRole = newUserData.role.toUpperCase() as BackendRole;
      const created = await adminApi.createUser({
        fullName: newUserData.name,
        email: newUserData.email,
        password: 'changeme123',
        role: backendRole,
      });
      const mapped = mapAdminUser(created);
      // Refresh users list from API
      await refreshUsers();
      // Refresh audit logs from API
      await refreshAuditLogs();
    } catch {
      // Fallback: tạo local
      setActivityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          user: user?.name ?? 'Quản trị viên',
          action: 'CREATE',
          target: `Thêm mới tài khoản: ${newUserData.name} (${newUserData.role})`,
          time: 'Vừa xong',
        },
        ...prev,
      ]);
      const newUser: UserRecord = {
        id: `u-${Date.now()}`,
        ...newUserData,
        solvedCount: 0,
        status: 'active',
        joinDate: new Date().toLocaleDateString('vi-VN'),
        topicStats: DEFAULT_TOPIC_STATS,
      };
      setUsers((prev) => [newUser, ...prev]);
    }
    setShowAddUserModal(false);
  };

  const handleSaveUserDetail = async (updatedUserData: { name: string; email: string; role: 'student' | 'teacher' | 'admin' }): Promise<boolean> => {
    if (!selectedUser) return false;
    const backendId = Number(selectedUser.id);
    try {
      const backendRole = updatedUserData.role.toUpperCase() as BackendRole;
      const updated = await adminApi.updateUser(backendId, {
        fullName: updatedUserData.name,
        email: updatedUserData.email,
        role: backendRole,
      });
      const mapped = mapAdminUser(updated);
      // Refresh users list from API
      await refreshUsers();
      // Refresh audit logs from API
      await refreshAuditLogs();
      setSelectedUser(mapped);
      return true;
    } catch {
      // Fallback: cập nhật local
      setActivityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          user: user?.name ?? 'Quản trị viên',
          action: 'UPDATE',
          target: `Cập nhật thông tin chi tiết tài khoản: ${updatedUserData.name}`,
          time: 'Vừa xong',
        },
        ...prev,
      ]);
      const updatedUser: UserRecord = { ...selectedUser, ...updatedUserData };
      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setSelectedUser(updatedUser);
      return true;
    }
  };

  // ── PROBLEM HANDLERS ──
  const handleDeleteProblem = async (id: string) => {
    const targetProb = practiceProblems.find((p) => p.id === id);
    const backendId = Number(id);
    try {
      await problemsApi.delete(backendId);
      // Refresh problems list from API
      await refreshProblems();
      // Refresh audit logs from API
      await refreshAuditLogs();
    } catch {
      // Fallback: cập nhật local
      setActivityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          user: user?.name ?? 'Quản trị viên',
          action: 'DELETE',
          target: `Xóa bài tập luyện code: "${targetProb?.title ?? id}"`,
          time: 'Vừa xong',
        },
        ...prev,
      ]);
      setPracticeProblems((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleTogglePublicProblem = async (id: string) => {
    const targetProb = practiceProblems.find((p) => p.id === id);
    const backendId = Number(id);
    const isNowPublic = !(targetProb?.isPublic ?? true);
    try {
      if (isNowPublic) {
        await problemsApi.publish(backendId);
      } else {
        await problemsApi.unpublish(backendId);
      }
      // Refresh problems list from API
      await refreshProblems();
      // Refresh audit logs from API
      await refreshAuditLogs();
    } catch {
      // Fallback: cập nhật local
      setActivityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          user: user?.name ?? 'Quản trị viên',
          action: 'TOGGLE',
          target: `Đổi trạng thái hiển thị bài "${targetProb?.title}" sang: ${
            isNowPublic ? 'Công khai' : 'Ẩn'
          }`,
          time: 'Vừa xong',
        },
        ...prev,
      ]);
      setPracticeProblems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isPublic: isNowPublic } : p)),
      );
    }
  };

  // ── GENERATOR & TEMPLATE HANDLERS ──
  const handlePublishQuestion = async (question: GeneratedQuestion) => {
    // Refresh problems list from API
    await refreshProblems();
    // Refresh audit logs from API
    await refreshAuditLogs();
  };

  const handlePublishAllQuestions = async (questions: GeneratedQuestion[]) => {
    // Refresh problems list from API
    await refreshProblems();
    // Refresh audit logs from API
    await refreshAuditLogs();
  };

  const handleSaveTemplate = async (tplData: Omit<SampleTemplate, 'id' | 'updatedAt'>) => {
    if (templateToEdit) {
      const backendId = Number(templateToEdit.id);
      try {
        await templatesApi.update(backendId, {
          name: tplData.title,
          topic: tplData.topic,
          level: tplData.level,
          generatorType: tplData.generatorType ?? 'TWO_INTEGERS',
          minN: tplData.minLength ?? undefined,
          maxN: tplData.maxLength ?? undefined,
          minValue: tplData.minValue ?? undefined,
          maxValue: tplData.maxValue ?? undefined,
          statementPattern: tplData.description,
          referenceSolutionCode: tplData.starterCode,
          languageId: tplData.languageId ?? 62,
        });
        // Reload templates from API
        const refreshed = await templatesApi.list();
        setSampleTemplates(refreshed.map(mapTemplate));
      } catch {
        // Fallback: cập nhật local
        setSampleTemplates((prev) =>
          prev.map((t) =>
            t.id === templateToEdit.id
              ? { ...tplData, id: t.id, updatedAt: new Date().toLocaleDateString('vi-VN') }
              : t,
          ),
        );
      }
      // Refresh audit logs from API
      await refreshAuditLogs();
    } else {
      try {
        const created = await templatesApi.create({
          name: tplData.title,
          topic: tplData.topic,
          level: tplData.level,
          generatorType: tplData.generatorType ?? 'TWO_INTEGERS',
          minN: tplData.minLength ?? undefined,
          maxN: tplData.maxLength ?? undefined,
          minValue: tplData.minValue ?? undefined,
          maxValue: tplData.maxValue ?? undefined,
          statementPattern: tplData.description,
          referenceSolutionCode: tplData.starterCode,
          languageId: tplData.languageId ?? 62,
        });
        const mapped = mapTemplate(created);
        setSampleTemplates((prev) => [mapped, ...prev]);
      } catch {
        // Fallback: tạo local
        const newTpl: SampleTemplate = {
          id: `tpl-${Date.now()}`,
          ...tplData,
          updatedAt: new Date().toLocaleDateString('vi-VN'),
        };
        setSampleTemplates((prev) => [newTpl, ...prev]);
      }
      // Refresh audit logs from API
      await refreshAuditLogs();
    }
    setShowTemplateFormModal(false);
    setTemplateToEdit(null);
  };

  const handleDeleteTemplate = async (id: string) => {
    const targetTpl = sampleTemplates.find((t) => t.id === id);
    const backendId = Number(id);
    try {
      await templatesApi.delete(backendId);
      // Refresh templates list from API
      await refreshTemplates();
      // Refresh audit logs from API
      await refreshAuditLogs();
      if (selectedTemplateForDetail?.id === id) {
        setSelectedTemplateForDetail(null);
      }
    } catch {
      // Fallback: cập nhật local
      setActivityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          user: user?.name ?? 'Quản trị viên',
          action: 'DELETE',
          target: `Xóa Template bài mẫu: "${targetTpl?.title ?? id}"`,
          time: 'Vừa xong',
        },
        ...prev,
      ]);
      setSampleTemplates((prev) => prev.filter((t) => t.id !== id));
      if (selectedTemplateForDetail?.id === id) {
        setSelectedTemplateForDetail(null);
      }
    }
  };

  const handleImportTemplates = (importedTemplates: SampleTemplate[]) => {
    setSampleTemplates((prev) => [...importedTemplates, ...prev]);
    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        user: user?.name ?? 'Quản trị viên Demo',
        action: 'CREATE',
        target: `Import thành công ${importedTemplates.length} bài mẫu từ file Excel / JSON`,
        time: 'Vừa xong',
      },
      ...prev,
    ]);
    setShowImportExcelModal(false);
  };

  const handleRemoveTopic = (topicName: string) => {
    setTopicsList((prev) => prev.filter((t) => t.name !== topicName));
  };

  return (
    <div className="page-shell">
      <Header
        hideNav={true}
        onGoLanding={() => setActiveTab('dashboard')}
        onGoAdmin={() => setActiveTab('dashboard')}
        onGoAuth={onGoAuth}
        onGoTopics={onGoTopics}
        onGoProfile={() => setActiveTab('profile')}
        onGoProgress={onGoProgress}
        onGoHistory={onGoHistory}
        onGoSettings={onGoSettings}
        onLoggedOut={onLoggedOut}
      />

      <div className="admin-layout-shell">
        <AdminSidebarNav
          userName={user?.name}
          userRole={user?.role}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onGoSettings={onGoSettings}
        />

        <main className="admin-main-panel">
          {activeTab === 'dashboard' && (
            <AdminDashboardTab
              users={users}
              templates={sampleTemplates as any}
              problems={practiceProblems}
              activityLogs={activityLogs}
              dashboardStats={dashboardStats}
              onGoGenerator={() => setActiveTab('generator')}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersTab
              users={users}
              onOpenAddUserModal={() => setShowAddUserModal(true)}
              onOpenUserDetail={(u) => setSelectedUser(u)}
              onToggleStatus={handleToggleStatus}
              onDeleteUser={handleDeleteUser}
              currentUserId={user?.id}
            />
          )}

          {activeTab === 'problems' && (
            <AdminProblemsTab
              problems={practiceProblems}
              onAddProblem={(newProb) => {
                if (newProb) setPracticeProblems((prev) => [newProb, ...prev]);
              }}
              onEditProblem={(updatedProb) => {
                setPracticeProblems((prev) =>
                  prev.map((p) => (p.id === updatedProb.id ? updatedProb : p))
                );
              }}
              onDeleteProblem={handleDeleteProblem}
              onTogglePublicStatus={handleTogglePublicProblem}
              onViewDetail={() => {}}
              onAddGeneratedProblems={(newProbs) => {
                setPracticeProblems((prev) => [...newProbs, ...prev]);
              }}
              onGoGenerator={() => setActiveTab('generator')}
            />
          )}

          {activeTab === 'templates' && (
            <AdminTemplatesTab
              templates={sampleTemplates}
              loading={dataLoading}
              error={dataError}
              topicsList={topicsList}
              onRemoveTopic={handleRemoveTopic}
              onOpenAddTplModal={() => {
                setTemplateToEdit(null);
                setShowTemplateFormModal(true);
              }}
              onOpenImportExcelModal={() => setShowImportExcelModal(true)}
              onOpenDetailModal={(tpl) => setSelectedTemplateForDetail(tpl)}
              onOpenEditModal={(tpl) => {
                setTemplateToEdit(tpl);
                setShowTemplateFormModal(true);
              }}
              onDeleteTemplate={handleDeleteTemplate}
            />
          )}

          {activeTab === 'generator' && (
            <AdminGeneratorTab
              onPublishQuestion={handlePublishQuestion}
              onPublishAllQuestions={handlePublishAllQuestions}
              onNavigateToProblems={async () => {
                await refreshProblems();
                setActiveTab('problems');
              }}
            />
          )}

          {activeTab === 'logs' && (
            <AdminAuditLogsTab
              activityLogs={activityLogs}
              onBackToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'flashcards' && (
            <AdminFlashcardsTab
              onLogActivity={(action, target) => {
                setActivityLogs((prev) => [
                  {
                    id: `log-${Date.now()}`,
                    user: user?.name ?? 'Quản trị viên Demo',
                    action,
                    target,
                    time: 'Vừa xong',
                  },
                  ...prev,
                ]);
              }}
            />
          )}

          {activeTab === 'profile' && <AdminProfileContent />}
        </main>
      </div>

      {/* ── ADMIN FOOTER SIGNATURE BAR ── */}
      <footer className="admin-footer-bar">
        <div className="admin-footer-status">
          <span className="status-dot green" />
          <span>Mnemonic Sandbox AI Engine v2.4.0 — Hệ thống hoạt động tốt</span>
        </div>
        <div className="admin-footer-signature">
          <span>© 2026 Mnemonic Admin Console. Nền tảng tự động hóa và quản trị AI cho sinh viên CNTT.</span>
        </div>
      </footer>

      {/* ── USER MODALS ── */}
      {selectedUser && (
        <AdminUserDetailModal
          userRecord={selectedUser}
          onClose={() => setSelectedUser(null)}
          onDeleteUser={handleDeleteUser}
          onToggleStatus={handleToggleStatus}
          onSaveUserDetail={handleSaveUserDetail}
          currentUserId={user?.id}
        />
      )}

      {showAddUserModal && (
        <AdminAddUserModal
          existingUsers={users}
          onClose={() => setShowAddUserModal(false)}
          onAddUser={handleAddUser}
        />
      )}

      {/* ── TEMPLATE MODALS (DETAIL, ADD/EDIT, EXCEL IMPORT) ── */}
      {selectedTemplateForDetail && (
        <AdminTemplateDetailModal
          template={selectedTemplateForDetail}
          onClose={() => setSelectedTemplateForDetail(null)}
          onEdit={(tpl) => {
            setSelectedTemplateForDetail(null);
            setTemplateToEdit(tpl);
            setShowTemplateFormModal(true);
          }}
          onDelete={handleDeleteTemplate}
        />
      )}

      {showTemplateFormModal && (
        <AdminTemplateFormModal
          templateToEdit={templateToEdit}
          onClose={() => {
            setShowTemplateFormModal(false);
            setTemplateToEdit(null);
          }}
          onSubmit={handleSaveTemplate}
        />
      )}

      {showImportExcelModal && (
        <AdminImportExcelModal
          onClose={() => setShowImportExcelModal(false)}
          onImport={handleImportTemplates}
        />
      )}
    </div>
  );
}

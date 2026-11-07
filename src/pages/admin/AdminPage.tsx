import { useState } from 'react';
import { Header } from '@/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { type PracticeProblem, type AuthMode, type SkillLevel } from '@/types';
import {
  getStoredProblems,
  addProblem,
  addProblems,
  updateProblem,
  deleteProblem,
  togglePublicProblem,
  normalizeProblem,
} from '@/lib/problemService';

import {
  type AdminTab,
  type LeagueSubTab,
  type UserRecord,
  type SampleTemplate,
  type GeneratedQuestion,
  type ActivityLog,
  MOCK_USERS_LIST,
  MOCK_SAMPLE_TEMPLATES,
  INITIAL_ACTIVITY_LOGS,
  DEFAULT_TOPIC_STATS,
} from './admin.types';
import { AdminSidebarNav } from './AdminSidebarNav';
import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminProblemsTab } from './AdminProblemsTab';
import { AdminTemplatesTab } from './AdminTemplatesTab';
import { AdminGeneratorTab } from './AdminGeneratorTab';
import { AdminFlashcardsTab } from './AdminFlashcardsTab';
import { AdminLeagueTab } from './AdminLeagueTab';
import { AdminAuditLogsTab } from './AdminAuditLogsTab';
import { AdminUserDetailModal } from './AdminUserDetailModal';
import { AdminAddUserModal } from './AdminAddUserModal';
import { AdminTemplateDetailModal } from './AdminTemplateDetailModal';
import { AdminTemplateFormModal } from './AdminTemplateFormModal';
import { AdminImportExcelModal } from './AdminImportExcelModal';
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
  onLoggedOut,
}: AdminPageProps) {
  const { user } = useAuth();
  const [internalActiveTab, setInternalActiveTab] = useState<AdminTab>('dashboard');
  const [leagueSubTab, setLeagueSubTab] = useState<LeagueSubTab>('overview');

  const activeTab = controlledActiveTab ?? internalActiveTab;
  const setActiveTab = (tab: AdminTab) => {
    setInternalActiveTab(tab);
    onTabChange?.(tab);
  };

  // Shared state
  const [users, setUsers] = useState<UserRecord[]>(MOCK_USERS_LIST);
  const [practiceProblems, setPracticeProblems] = useState<PracticeProblem[]>(() => getStoredProblems());
  const [sampleTemplates, setSampleTemplates] = useState<SampleTemplate[]>(MOCK_SAMPLE_TEMPLATES);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);

  // User Modals state
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Template Modals state
  const [selectedTemplateForDetail, setSelectedTemplateForDetail] = useState<SampleTemplate | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<SampleTemplate | null>(null);
  const [showTemplateFormModal, setShowTemplateFormModal] = useState(false);
  const [showImportExcelModal, setShowImportExcelModal] = useState(false);

  // ── USER HANDLERS ──
  const handleToggleStatus = (id: string) => {
    const targetUser = users.find((u) => u.id === id);
    const newStatusLabel = targetUser?.status === 'active' ? 'Đã khóa' : 'Hoạt động';
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u,
      ),
    );
    if (selectedUser && selectedUser.id === id) {
      setSelectedUser((prev) =>
        prev ? { ...prev, status: prev.status === 'active' ? 'suspended' : 'active' } : null,
      );
    }
    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        user: user?.name ?? 'Quản trị viên Demo',
        action: 'TOGGLE',
        target: `Chuyển trạng thái ${targetUser?.name ?? 'tài khoản'} sang: ${newStatusLabel}`,
        time: 'Vừa xong',
      },
      ...prev,
    ]);
  };

  const handleDeleteUser = (id: string) => {
    const targetUser = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (selectedUser?.id === id) {
      setSelectedUser(null);
    }
    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        user: user?.name ?? 'Quản trị viên Demo',
        action: 'DELETE',
        target: `Xóa tài khoản người dùng: ${targetUser?.name ?? id}`,
        time: 'Vừa xong',
      },
      ...prev,
    ]);
  };

  const handleAddUser = (userForm: { name: string; email: string; role: 'student' | 'teacher' | 'admin' }) => {
    const newUser: UserRecord = {
      id: `usr-${Date.now()}`,
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
      status: 'active',
      solvedCount: 0,
      joinDate: new Date().toLocaleDateString('vi-VN'),
    };
    setUsers((prev) => [newUser, ...prev]);
    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        user: user?.name ?? 'Quản trị viên Demo',
        action: 'CREATE',
        target: `Thêm mới tài khoản: ${newUser.name} (${newUser.role})`,
        time: 'Vừa xong',
      },
      ...prev,
    ]);
    setShowAddUserModal(false);
  };

  const handleSaveUserDetail = (updatedData: { name: string; email: string; role: 'student' | 'teacher' | 'admin' }): boolean => {
    if (!selectedUser) return false;
    const updatedUser: UserRecord = {
      ...selectedUser,
      name: updatedData.name,
      email: updatedData.email,
      role: updatedData.role,
    };
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setSelectedUser(updatedUser);
    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        user: user?.name ?? 'Quản trị viên Demo',
        action: 'UPDATE',
        target: `Cập nhật thông tin chi tiết tài khoản: ${updatedUser.name}`,
        time: 'Vừa xong',
      },
      ...prev,
    ]);
    return true;
  };

  // ── PROBLEM HANDLERS ──
  const handleDeleteProblem = (id: string) => {
    const targetProb = practiceProblems.find((p) => p.id === id);
    deleteProblem(id);
    setPracticeProblems(getStoredProblems());
    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        user: user?.name ?? 'Quản trị viên Demo',
        action: 'DELETE',
        target: `Xóa bài tập luyện code: "${targetProb?.title ?? id}"`,
        time: 'Vừa xong',
      },
      ...prev,
    ]);
  };

  const handleTogglePublicProblem = (id: string) => {
    const targetProb = practiceProblems.find((p) => p.id === id);
    const toggled = togglePublicProblem(id);
    const isNowPublic = toggled?.isPublic ?? true;
    setPracticeProblems(getStoredProblems());
    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        user: user?.name ?? 'Quản trị viên Demo',
        action: 'TOGGLE',
        target: `Đổi trạng thái hiển thị bài "${targetProb?.title}" sang: ${
          isNowPublic ? 'Công khai' : 'Ẩn'
        }`,
        time: 'Vừa xong',
      },
      ...prev,
    ]);
  };

  // ── GENERATOR & TEMPLATE HANDLERS ──
  const handlePublishQuestion = (question: GeneratedQuestion) => {
    const newProb = addProblem({
      ...normalizeProblem(question),
      isPublic: true,
      isAiGenerated: true,
      isVerified: true,
      updatedAt: 'Vừa xong',
    });
    setPracticeProblems(getStoredProblems());
    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        user: user?.name ?? 'Quản trị viên Demo',
        action: 'CREATE',
        target: `Xuất bản bài tập AI tạo tự động: "${question.title}" vào Ngân hàng đề`,
        time: 'Vừa xong',
      },
      ...prev,
    ]);
  };

  const handlePublishAllQuestions = (questions: GeneratedQuestion[]) => {
    addProblems(
      questions.map((q) => ({
        ...normalizeProblem(q),
        isPublic: true,
        isAiGenerated: true,
        isVerified: true,
        updatedAt: 'Vừa xong',
      }))
    );
    setPracticeProblems(getStoredProblems());
    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        user: user?.name ?? 'Quản trị viên Demo',
        action: 'CREATE',
        target: `Xuất bản hàng loạt ${questions.length} bài tập AI vào Ngân hàng đề`,
        time: 'Vừa xong',
      },
      ...prev,
    ]);
  };

  const handleSaveTemplate = (tplData: Omit<SampleTemplate, 'id' | 'updatedAt'>) => {
    if (templateToEdit) {
      setSampleTemplates((prev) =>
        prev.map((t) =>
          t.id === templateToEdit.id
            ? { ...tplData, id: t.id, updatedAt: new Date().toLocaleDateString('vi-VN') }
            : t,
        ),
      );
      setActivityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          user: user?.name ?? 'Quản trị viên Demo',
          action: 'UPDATE',
          target: `Cập nhật Template bài mẫu: "${tplData.title}"`,
          time: 'Vừa xong',
        },
        ...prev,
      ]);
    } else {
      const newTpl: SampleTemplate = {
        id: `tpl-${Date.now()}`,
        ...tplData,
        updatedAt: new Date().toLocaleDateString('vi-VN'),
      };
      setSampleTemplates((prev) => [newTpl, ...prev]);
      setActivityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          user: user?.name ?? 'Quản trị viên Demo',
          action: 'CREATE',
          target: `Thêm mới Template bài mẫu: "${tplData.title}"`,
          time: 'Vừa xong',
        },
        ...prev,
      ]);
    }
    setShowTemplateFormModal(false);
    setTemplateToEdit(null);
  };

  const handleDeleteTemplate = (id: string) => {
    const targetTpl = sampleTemplates.find((t) => t.id === id);
    setSampleTemplates((prev) => prev.filter((t) => t.id !== id));
    if (selectedTemplateForDetail?.id === id) {
      setSelectedTemplateForDetail(null);
    }
    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        user: user?.name ?? 'Quản trị viên Demo',
        action: 'DELETE',
        target: `Xóa Template bài mẫu: "${targetTpl?.title ?? id}"`,
        time: 'Vừa xong',
      },
      ...prev,
    ]);
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

  return (
    <div className="page-shell">
      <Header
        hideNav={true}
        showThemeToggle={true}
        onGoLanding={() => setActiveTab('dashboard')}
        onGoAdmin={() => setActiveTab('dashboard')}
        onGoAuth={onGoAuth}
        onGoTopics={onGoTopics}
        onGoProfile={() => setActiveTab('profile')}
        onGoProgress={onGoProgress}
        onGoHistory={onGoHistory}
        onLoggedOut={onLoggedOut}
      />

      <div className="admin-layout-shell">
        <AdminSidebarNav
          userName={user?.name}
          userRole={user?.role}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeLeagueSubTab={leagueSubTab}
          setActiveLeagueSubTab={(sub) => {
            setLeagueSubTab(sub);
            setActiveTab('league');
          }}
        />

        <main className="admin-main-panel">
          {activeTab === 'dashboard' && (
            <AdminDashboardTab
              users={users}
              templates={sampleTemplates as any}
              problems={practiceProblems}
              activityLogs={activityLogs}
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
            />
          )}

          {activeTab === 'problems' && (
            <AdminProblemsTab
              problems={practiceProblems}
              onAddProblem={(newProb) => {
                if (newProb) {
                  addProblem(newProb);
                  setPracticeProblems(getStoredProblems());
                }
              }}
              onEditProblem={(updatedProb) => {
                updateProblem(updatedProb);
                setPracticeProblems(getStoredProblems());
              }}
              onDeleteProblem={handleDeleteProblem}
              onTogglePublicStatus={handleTogglePublicProblem}
              onViewDetail={() => {}}
              onAddGeneratedProblems={(newProbs) => {
                addProblems(newProbs);
                setPracticeProblems(getStoredProblems());
              }}
              onGoGenerator={() => setActiveTab('generator')}
            />
          )}

          {activeTab === 'templates' && (
            <AdminTemplatesTab
              templates={sampleTemplates}
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

          {activeTab === 'league' && (
            <AdminLeagueTab
              activeSubTab={leagueSubTab}
              onSubTabChange={setLeagueSubTab}
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

          {activeTab === 'logs' && (
            <AdminAuditLogsTab
              activityLogs={activityLogs}
              onBackToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'profile' && (
            <AdminProfileContent onBack={() => setActiveTab('dashboard')} />
          )}
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

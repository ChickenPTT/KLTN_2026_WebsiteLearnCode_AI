import { useState } from 'react';
import { Header } from '@/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { PRACTICE_PROBLEMS, type PracticeProblem, type AuthMode, type SkillLevel } from '@/types';

import {
  type AdminTab,
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
import { AdminUserDetailModal } from './AdminUserDetailModal';
import { AdminAddUserModal } from './AdminAddUserModal';
import { AdminTemplateDetailModal } from './AdminTemplateDetailModal';
import { AdminTemplateFormModal } from './AdminTemplateFormModal';
import { AdminImportExcelModal } from './AdminImportExcelModal';

interface AdminPageProps {
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
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Shared state
  const [users, setUsers] = useState<UserRecord[]>(MOCK_USERS_LIST);
  const [practiceProblems, setPracticeProblems] = useState<PracticeProblem[]>(PRACTICE_PROBLEMS);
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

  const handleAddUser = (newUser: UserRecord) => {
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

  const handleSaveUserDetail = (updatedUser: UserRecord) => {
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
  };

  // ── PROBLEM HANDLERS ──
  const handleDeleteProblem = (id: string) => {
    const targetProb = practiceProblems.find((p) => p.id === id);
    setPracticeProblems((prev) => prev.filter((p) => p.id !== id));
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
    const isNowPublic = !(targetProb?.isPublic ?? true);
    setPracticeProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isPublic: isNowPublic } : p)),
    );
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
    const newProb: PracticeProblem = {
      id: question.id,
      title: question.title,
      difficulty: question.difficulty as SkillLevel,
      topic: question.topic,
      topicSlug: question.topic.toLowerCase().replace(/\s+/g, '-'),
      tags: question.tags,
      points: question.points,
      solvedCount: 0,
      acceptanceRate: '100%',
      description: question.description,
      initialCode: question.initialCode,
      testCases: question.testCases,
      aiGuidePrompt: question.aiGuidePrompt,
      isPublic: true,
      author: user?.name ?? 'AI Generator',
    };
    setPracticeProblems((prev) => [newProb, ...prev]);
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
    const newProbs: PracticeProblem[] = questions.map((q) => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty as SkillLevel,
      topic: q.topic,
      topicSlug: q.topic.toLowerCase().replace(/\s+/g, '-'),
      tags: q.tags,
      points: q.points,
      solvedCount: 0,
      acceptanceRate: '100%',
      description: q.description,
      initialCode: q.initialCode,
      testCases: q.testCases,
      aiGuidePrompt: q.aiGuidePrompt,
      isPublic: true,
      author: user?.name ?? 'AI Generator',
    }));
    setPracticeProblems((prev) => [...newProbs, ...prev]);
    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        user: user?.name ?? 'Quản trị viên Demo',
        action: 'CREATE',
        target: `Xuất bản hàng loạt ${questions.length} câu hỏi AI tạo tự động vào Ngân hàng đề`,
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
        onGoLanding={() => setActiveTab('dashboard')}
        onGoAdmin={() => setActiveTab('dashboard')}
        onGoAuth={onGoAuth}
        onGoTopics={onGoTopics}
        onGoProfile={onGoProfile}
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
              activityLogs={activityLogs}
              onGoGenerator={() => setActiveTab('generator')}
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

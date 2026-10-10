import { useCallback, useEffect, useState } from 'react';
import { Header } from '@/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import type { AuthMode, SkillLevel } from '@/types';
import { problemsApi, titleFromStatement, type AdminProblem } from '@/lib/problemsApi';
import { apiErrorMessage } from './adminApi.utils';
import { adminApi, templatesApi, type AdminDashboardStats, type AdminUser, type BackendRole, type Template } from '@/lib/api';

import {
  type AdminTab,
  type UserRecord,
  type SampleTemplate,
  type ActivityLog,
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
import AdminTemplateFormModal from './AdminTemplateFormModal';
import { AdminImportExcelModal } from './AdminImportExcelModal';

// Backend chua co thong ke theo chu de cho tung user -> tam hien muc khoi dau
function toUserRecord(au: AdminUser): UserRecord {
  return {
    id: String(au.id),
    name: au.fullName,
    email: au.email,
    role: au.role.toLowerCase() as UserRecord['role'],
    solvedCount: au.solvedCount,
    status: au.active ? 'active' : 'suspended',
    joinDate: new Date(au.createdAt).toLocaleDateString('vi-VN'),
    topicStats: DEFAULT_TOPIC_STATS.map((t) => ({ ...t, solvedCount: 0, level: 'beginner' })),
  };
}

// Chuyen tu Template backend sang SampleTemplate frontend
function toSampleTemplate(tpl: Template): SampleTemplate {
  return {
    id: String(tpl.id),
    title: tpl.name,
    topic: tpl.topic.name,
    level: tpl.level.toLowerCase() as 'beginner' | 'basic' | 'intermediate' | 'advanced' | 'expert',
    description: tpl.statementPattern,
    starterCode: tpl.referenceSolutionCode,
    minLength: tpl.minN ?? undefined,
    maxLength: tpl.maxN ?? undefined,
    minValue: tpl.minValue ?? undefined,
    maxValue: tpl.maxValue ?? undefined,
    generatorType: tpl.generatorType,
    languageId: tpl.languageId,
    updatedAt: new Date(tpl.createdAt).toLocaleDateString('vi-VN'),
  };
}

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
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [adminProblems, setAdminProblems] = useState<AdminProblem[]>([]);
  const [problemsLoading, setProblemsLoading] = useState(false);
  const [problemsError, setProblemsError] = useState<string | null>(null);
  const canDeleteProblems = user?.role === 'admin';
  // Giang vien chi xem danh sach; them/sua/khoa/xoa chi admin (khop SecurityConfig)
  const canManageUsers = user?.role === 'admin';
  const [sampleTemplates, setSampleTemplates] = useState<SampleTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // User Modals state
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Template Modals state
  const [selectedTemplateForDetail, setSelectedTemplateForDetail] = useState<SampleTemplate | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<SampleTemplate | null>(null);
  const [showTemplateFormModal, setShowTemplateFormModal] = useState(false);
  const [showImportExcelModal, setShowImportExcelModal] = useState(false);

  // ── USER HANDLERS (backend that: /api/admin/users) ──
  // Giu lai topicStats da co tren UI khi thay ban ghi moi tu server
  const mergeUser = (updated: UserRecord) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...updated, topicStats: u.topicStats } : u)));
    setSelectedUser((prev) => (prev && prev.id === updated.id ? { ...updated, topicStats: prev.topicStats } : prev));
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const updated = toUserRecord(await adminApi.toggleUserStatus(Number(id)));
      mergeUser(updated);
      setActivityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          user: user?.name ?? 'Quản trị viên',
          action: 'TOGGLE',
          target: `Chuyển trạng thái ${updated.name} sang: ${updated.status === 'active' ? 'Hoạt động' : 'Đã khóa'}`,
          time: 'Vừa xong',
        },
        ...prev,
      ]);
    } catch (err: unknown) {
      alert(apiErrorMessage(err));
    }
  };

  const handleDeleteUser = async (id: string) => {
    const targetUser = users.find((u) => u.id === id);
    try {
      await adminApi.deleteUser(Number(id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }
      setActivityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          user: user?.name ?? 'Quản trị viên',
          action: 'DELETE',
          target: `Xóa tài khoản người dùng: ${targetUser?.name ?? id}`,
          time: 'Vừa xong',
        },
        ...prev,
      ]);
    } catch (err: unknown) {
      alert(apiErrorMessage(err));
    }
  };

  const handleAddUser = async (data: { name: string; email: string; role: UserRecord['role']; password: string }) => {
    try {
      const backendRole = data.role.toUpperCase() as 'STUDENT' | 'TEACHER' | 'ADMIN';
      const newUser = await adminApi.createUser({
        fullName: data.name,
        email: data.email,
        password: data.password,
        role: backendRole,
      });
      const userRecord = toUserRecord(newUser);
      setUsers((prev) => [userRecord, ...prev]);
      setActivityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          user: user?.name ?? 'Quản trị viên',
          action: 'CREATE',
          target: `Thêm mới tài khoản: ${userRecord.name} (${userRecord.role})`,
          time: 'Vừa xong',
        },
        ...prev,
      ]);
      setShowAddUserModal(false);
    } catch (err: unknown) {
      alert(apiErrorMessage(err));
    }
  };

  // Tra ve null neu thanh cong, nguoc lai la thong bao loi de modal hien thi
  const handleSaveUserDetail = async (data: {
    name: string;
    email: string;
    role: UserRecord['role'];
  }): Promise<string | null> => {
    if (!selectedUser) return 'Không tìm thấy người dùng.';
    try {
      const updated = toUserRecord(
        await adminApi.updateUser(Number(selectedUser.id), {
          fullName: data.name,
          email: data.email,
          role: data.role.toUpperCase() as BackendRole,
        }),
      );
      mergeUser(updated);
      setActivityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          user: user?.name ?? 'Quản trị viên',
          action: 'UPDATE',
          target: `Cập nhật thông tin chi tiết tài khoản: ${updated.name}`,
          time: 'Vừa xong',
        },
        ...prev,
      ]);
      return null;
    } catch (err: unknown) {
      return apiErrorMessage(err);
    }
  };

  // ── PROBLEM HANDLERS (backend that: /api/problems/manage) ──
  const addLog = (action: ActivityLog['action'], target: string) => {
    setActivityLogs((prev) => [
      { id: `log-${Date.now()}`, user: user?.name ?? 'Quản trị viên', action, target, time: 'Vừa xong' },
      ...prev,
    ]);
  };

  const loadProblems = useCallback(() => {
    setProblemsLoading(true);
    setProblemsError(null);
    problemsApi
      .listAll()
      .then((list) => setAdminProblems(list))
      .catch((err: unknown) => setProblemsError(apiErrorMessage(err)))
      .finally(() => setProblemsLoading(false));
  }, []);

  const loadDashboardStats = useCallback(() => {
    setDashboardLoading(true);
    setDashboardError(null);
    adminApi
      .getDashboardStats()
      .then((stats) => setDashboardStats(stats))
      .catch((err: unknown) => setDashboardError(apiErrorMessage(err)))
      .finally(() => setDashboardLoading(false));
  }, []);

  const loadUsers = useCallback(() => {
    setUsersLoading(true);
    setUsersError(null);
    adminApi
      .getUsers()
      .then((adminUsers) => setUsers(adminUsers.map(toUserRecord)))
      .catch((err: unknown) => setUsersError(apiErrorMessage(err)))
      .finally(() => setUsersLoading(false));
  }, []);

  const loadTemplates = useCallback(() => {
    setTemplatesLoading(true);
    setTemplatesError(null);
    templatesApi
      .list()
      .then((templates) => setSampleTemplates(templates.map(toSampleTemplate)))
      .catch((err: unknown) => setTemplatesError(apiErrorMessage(err)))
      .finally(() => setTemplatesLoading(false));
  }, []);

  // Tai lai moi lan mo tab "Quản lý bài tập" -> thay ngay cac bai nhap vua sinh o tab Sinh de
  useEffect(() => {
    if (activeTab === 'problems') loadProblems();
  }, [activeTab, loadProblems]);

  // Load dashboard stats khi vao tab dashboard
  useEffect(() => {
    if (activeTab === 'dashboard') loadDashboardStats();
  }, [activeTab, loadDashboardStats]);

  // Load users khi vao tab users
  useEffect(() => {
    if (activeTab === 'users') loadUsers();
  }, [activeTab, loadUsers]);

  // Load templates khi vao tab templates
  useEffect(() => {
    if (activeTab === 'templates') loadTemplates();
  }, [activeTab, loadTemplates]);

  const handleTogglePublishProblem = async (p: AdminProblem) => {
    const updated = p.status === 'PUBLISHED' ? await problemsApi.unpublish(p.id) : await problemsApi.publish(p.id);
    setAdminProblems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    addLog(
      'TOGGLE',
      `${updated.status === 'PUBLISHED' ? 'Xuất bản' : 'Gỡ xuất bản'} bài "${titleFromStatement(p.statement, p.id)}"`,
    );
  };

  const handleDeleteProblem = async (p: AdminProblem) => {
    await problemsApi.remove(p.id);
    setAdminProblems((prev) => prev.filter((x) => x.id !== p.id));
    addLog('DELETE', `Xóa bài tập "${titleFromStatement(p.statement, p.id)}"`);
  };

  const handleSaveTemplate = async (tplData: Omit<SampleTemplate, 'id' | 'updatedAt'>) => {
    try {
      // Chuyen du lieu frontend sang format backend yeu cau
      const backendData = {
        name: tplData.title,
        topic: tplData.topic,
        level: tplData.level.toUpperCase(),
        generatorType: tplData.generatorType || 'INTEGER_ARRAY',
        minN: tplData.minLength,
        maxN: tplData.maxLength,
        minValue: tplData.minValue,
        maxValue: tplData.maxValue,
        statementPattern: tplData.description,
        referenceSolutionCode: tplData.starterCode,
        languageId: tplData.languageId || 62, // 62 = Java
      };

      let savedTemplate: Template;
      if (templateToEdit) {
        savedTemplate = await templatesApi.update(Number(templateToEdit.id), backendData);
        setActivityLogs((prev) => [
          {
            id: `log-${Date.now()}`,
            user: user?.name ?? 'Quản trị viên',
            action: 'UPDATE',
            target: `Cập nhật Template bài mẫu: "${tplData.title}"`,
            time: 'Vừa xong',
          },
          ...prev,
        ]);
      } else {
        savedTemplate = await templatesApi.create(backendData);
        setActivityLogs((prev) => [
          {
            id: `log-${Date.now()}`,
            user: user?.name ?? 'Quản trị viên',
            action: 'CREATE',
            target: `Thêm mới Template bài mẫu: "${tplData.title}"`,
            time: 'Vừa xong',
          },
          ...prev,
        ]);
      }

      // Reload templates de hien thi danh sach moi
      await loadTemplates();
      setShowTemplateFormModal(false);
      setTemplateToEdit(null);
    } catch (err: unknown) {
      alert(apiErrorMessage(err));
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    const targetTpl = sampleTemplates.find((t) => t.id === id);
    try {
      await templatesApi.delete(Number(id));
      setSampleTemplates((prev) => prev.filter((t) => t.id !== id));
      if (selectedTemplateForDetail?.id === id) {
        setSelectedTemplateForDetail(null);
      }
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
    } catch (err: unknown) {
      alert(apiErrorMessage(err));
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
              templates={sampleTemplates}
              activityLogs={activityLogs}
              dashboardStats={dashboardStats}
              dashboardLoading={dashboardLoading}
              dashboardError={dashboardError}
              onReloadDashboard={loadDashboardStats}
              onGoGenerator={() => setActiveTab('generator')}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersTab
              users={users}
              loading={usersLoading}
              error={usersError}
              canManage={canManageUsers}
              currentUserId={user?.id}
              onReload={loadUsers}
              onOpenAddUserModal={() => setShowAddUserModal(true)}
              onOpenUserDetail={(u) => setSelectedUser(u)}
              onToggleStatus={handleToggleStatus}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'problems' && (
            <AdminProblemsTab
              problems={adminProblems}
              loading={problemsLoading}
              error={problemsError}
              canDelete={canDeleteProblems}
              onReload={loadProblems}
              onTogglePublish={handleTogglePublishProblem}
              onDelete={handleDeleteProblem}
              onGoGenerator={() => setActiveTab('generator')}
            />
          )}

          {activeTab === 'templates' && (
            <AdminTemplatesTab
              templates={sampleTemplates}
              loading={templatesLoading}
              error={templatesError}
              onReload={loadTemplates}
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
            <AdminGeneratorTab canDelete={canDeleteProblems} onLog={addLog} />
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
          canManage={canManageUsers}
          isSelf={selectedUser.id === user?.id}
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

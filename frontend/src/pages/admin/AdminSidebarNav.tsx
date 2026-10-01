import { useState } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Code2,
  FileSpreadsheet,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react';
import type { AdminTab } from './admin.types';

interface AdminSidebarNavProps {
  userName?: string;
  userRole?: string;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  onGoSettings?: () => void;
}

export function AdminSidebarNav({
  userName,
  userRole,
  activeTab,
  setActiveTab,
  onGoSettings,
}: AdminSidebarNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`admin-sidebar-nav ${isCollapsed ? 'is-collapsed' : ''}`}>
      {/* Toggle Collapse Button */}
      <button
        type="button"
        className="admin-sidebar-toggle"
        onClick={() => setIsCollapsed((prev) => !prev)}
        title={isCollapsed ? 'Mở rộng Sidebar' : 'Thu gọn Sidebar'}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Navigation Menu Links */}
      <nav className="admin-nav-menu">
        <button
          className={`admin-nav-item ${activeTab === 'dashboard' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          title={isCollapsed ? 'Dashboard tổng quan' : undefined}
        >
          <LayoutDashboard size={18} />
          {!isCollapsed && <span>Dashboard</span>}
        </button>

        <button
          className={`admin-nav-item ${activeTab === 'users' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('users')}
          title={isCollapsed ? 'Quản lý người dùng' : undefined}
        >
          <Users size={18} />
          {!isCollapsed && <span>Quản lý người dùng</span>}
        </button>

        <button
          className={`admin-nav-item ${activeTab === 'problems' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('problems')}
          title={isCollapsed ? 'Quản lý Đề & Bài tập' : undefined}
        >
          <Code2 size={18} />
          {!isCollapsed && <span>Quản lý Đề & Bài tập</span>}
        </button>

        <button
          className={`admin-nav-item ${activeTab === 'templates' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('templates')}
          title={isCollapsed ? 'Quản lý Template mẫu AI' : undefined}
        >
          <FileSpreadsheet size={18} />
          {!isCollapsed && <span>Quản lý Template AI</span>}
        </button>

        <button
          className={`admin-nav-item ${activeTab === 'generator' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('generator')}
          title={isCollapsed ? 'Generate đề thi AI' : undefined}
        >
          <Sparkles size={18} />
          {!isCollapsed && <span>Generate đề thi AI</span>}
        </button>
      </nav>
    </aside>
  );
}

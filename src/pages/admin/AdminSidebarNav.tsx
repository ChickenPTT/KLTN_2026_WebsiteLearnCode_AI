import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Code2,
  FileSpreadsheet,
  Sparkles,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Trophy,
  Calendar,
  Gift,
  Award,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import type { AdminTab, LeagueSubTab } from './admin.types';

interface AdminSidebarNavProps {
  userName?: string;
  userRole?: string;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  activeLeagueSubTab?: LeagueSubTab;
  setActiveLeagueSubTab?: (subTab: LeagueSubTab) => void;
}

export function AdminSidebarNav({
  userName,
  userRole,
  activeTab,
  setActiveTab,
  activeLeagueSubTab = 'overview',
  setActiveLeagueSubTab,
}: AdminSidebarNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLeagueExpanded, setIsLeagueExpanded] = useState(activeTab === 'league');

  // Auto expand league submenu if active tab becomes 'league'
  useEffect(() => {
    if (activeTab === 'league') {
      setIsLeagueExpanded(true);
    }
  }, [activeTab]);

  const handleLeagueParentClick = () => {
    if (activeTab !== 'league') {
      setActiveTab('league');
      setIsLeagueExpanded(true);
    } else {
      setIsLeagueExpanded((prev) => !prev);
    }
  };

  const handleSubTabClick = (sub: LeagueSubTab) => {
    if (setActiveLeagueSubTab) {
      setActiveLeagueSubTab(sub);
    } else if (activeTab !== 'league') {
      setActiveTab('league');
    }
  };

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

        <button
          className={`admin-nav-item ${activeTab === 'flashcards' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('flashcards')}
          title={isCollapsed ? 'Quản lý Flashcards' : undefined}
        >
          <BookOpen size={18} />
          {!isCollapsed && <span>Quản lý Flashcards</span>}
        </button>

        {/* ── QUẢN LÝ ĐẤU HẠNG (ACCORDION PARENT MENU) ── */}
        <div className="admin-nav-group">
          <button
            className={`admin-nav-item ${activeTab === 'league' ? 'is-active' : ''}`}
            onClick={handleLeagueParentClick}
            title={isCollapsed ? 'Quản lý đấu hạng' : undefined}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Trophy size={18} className="text-violet-400" />
              {!isCollapsed && <span>Quản lý đấu hạng</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown
                size={16}
                style={{
                  transform: isLeagueExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  opacity: 0.7,
                }}
              />
            )}
          </button>

          {/* Submenu: indented 4 sub-pages */}
          {!isCollapsed && isLeagueExpanded && (
            <div className="admin-nav-sublist">
              <button
                className={`admin-nav-subitem ${activeTab === 'league' && activeLeagueSubTab === 'overview' ? 'is-sub-active' : ''}`}
                onClick={() => handleSubTabClick('overview')}
              >
                <TrendingUp size={14} />
                <span>Tổng quan</span>
              </button>

              <button
                className={`admin-nav-subitem ${activeTab === 'league' && activeLeagueSubTab === 'seasons' ? 'is-sub-active' : ''}`}
                onClick={() => handleSubTabClick('seasons')}
              >
                <Calendar size={14} />
                <span>Quản lý mùa giải</span>
              </button>

              <button
                className={`admin-nav-subitem ${activeTab === 'league' && activeLeagueSubTab === 'leaderboard' ? 'is-sub-active' : ''}`}
                onClick={() => handleSubTabClick('leaderboard')}
              >
                <Trophy size={14} />
                <span>Quản lý bảng xếp hạng</span>
              </button>

              <button
                className={`admin-nav-subitem ${activeTab === 'league' && activeLeagueSubTab === 'summary' ? 'is-sub-active' : ''}`}
                onClick={() => handleSubTabClick('summary')}
              >
                <BarChart3 size={14} />
                <span>Tổng kết mùa giải</span>
              </button>
            </div>
          )}
        </div>

        <button
          className={`admin-nav-item ${activeTab === 'logs' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('logs')}
          title={isCollapsed ? 'Lịch sử thao tác' : undefined}
        >
          <Clock size={18} />
          {!isCollapsed && <span>Lịch sử thao tác</span>}
        </button>
      </nav>
    </aside>
  );
}


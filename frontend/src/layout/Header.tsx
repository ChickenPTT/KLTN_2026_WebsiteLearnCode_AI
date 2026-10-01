import { useState } from 'react';
import { BrainCircuit, Code2, Menu, X } from 'lucide-react';
import { Brand } from '@/components/Brand';
import { UserMenu } from '@/components/UserMenu';
import { useAuth } from '@/hooks/useAuth';
import type { AuthMode } from '@/types';

interface HeaderProps {
  onGoLanding?: () => void;
  onGoAuth?: (mode: AuthMode) => void;
  onGoTopics?: () => void;
  onScrollFeatures?: () => void;
  onGoProfile?: () => void;
  onGoProgress?: () => void;
  onGoHistory?: () => void;
  onGoAdmin?: () => void;
  onGoSettings?: () => void;
  onLoggedOut?: () => void;
  hideNav?: boolean;
  activeView?: string;
}

export function Header({
  onGoLanding,
  onGoAuth,
  onGoTopics,
  onScrollFeatures,
  onGoProfile,
  onGoProgress,
  onGoHistory,
  onGoAdmin,
  onGoSettings,
  onLoggedOut,
  hideNav = false,
  activeView,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  const handleBrandClick = () => {
    if (user?.role === 'admin' || user?.role === 'teacher') {
      if (onGoAdmin) {
        onGoAdmin();
        return;
      }
    }
    if (onGoLanding) {
      onGoLanding();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScrollFeatures = () => {
    if (onScrollFeatures) {
      onScrollFeatures();
    } else if (onGoLanding) {
      onGoLanding();
    }
    setMenuOpen(false);
  };

  const handleGoTopics = () => {
    onGoTopics?.();
    setMenuOpen(false);
  };

  return (
    <header className="topbar">
      <button className="brand-button" onClick={handleBrandClick}>
        <Brand />
      </button>

      <button
        className="menu-toggle"
        aria-label="Mở menu"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Backdrop Overlay for Mobile Sidebar */}
      <div
        className={`mobile-nav-backdrop ${menuOpen ? 'is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Main Nav Drawer */}
      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`}>
        <div className="mobile-drawer-header">
          <Brand />
          <button
            className="mobile-drawer-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>

        {!hideNav && (
          <div className="mobile-nav-links">
            <button
              className={activeView === 'flashcards' ? 'is-active' : ''}
              onClick={handleScrollFeatures}
            >
              <Code2 size={18} /> Flashcards
            </button>
            <button
              className={activeView === 'quiz' ? 'is-active' : ''}
              onClick={handleScrollFeatures}
            >
              <BrainCircuit size={18} /> Trắc nghiệm
            </button>
            <button
              className={activeView === 'topics' || activeView === 'topic-detail' || activeView === 'practice' ? 'is-active' : ''}
              onClick={handleGoTopics}
            >
              <Code2 size={18} /> Code Practice
            </button>
          </div>
        )}

        {user ? (
          <UserMenu
            activeView={activeView}
            onGoProfile={() => {
              setMenuOpen(false);
              onGoProfile?.();
            }}
            onGoProgress={() => {
              setMenuOpen(false);
              onGoProgress?.();
            }}
            onGoHistory={() => {
              setMenuOpen(false);
              onGoHistory?.();
            }}
            onGoAdmin={() => {
              setMenuOpen(false);
              onGoAdmin?.();
            }}
            onGoSettings={() => {
              setMenuOpen(false);
              onGoSettings?.();
            }}
            onLoggedOut={() => {
              setMenuOpen(false);
              onLoggedOut?.();
            }}
          />
        ) : (
          <button
            className="login-button"
            onClick={() => {
              setMenuOpen(false);
              onGoAuth?.('login');
            }}
          >
            Login
          </button>
        )}
      </nav>
    </header>
  );
}

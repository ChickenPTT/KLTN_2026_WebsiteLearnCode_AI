import { useState, useRef } from 'react';
import { BrainCircuit, Code2, Menu, X, BookOpen, Compass, Library, ChevronDown } from 'lucide-react';
import { Brand } from '@/components/Brand';
import { UserMenu } from '@/components/UserMenu';
import { useAuth } from '@/hooks/useAuth';
import type { AuthMode } from '@/types';

interface HeaderProps {
  onGoLanding?: () => void;
  onGoAuth?: (mode: AuthMode) => void;
  onGoTopics?: () => void;
  onGoFlashcards?: () => void;
  onGoFlashcardLibrary?: () => void;
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
  onGoFlashcards,
  onGoFlashcardLibrary,
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
  const [flashcardDropdownOpen, setFlashcardDropdownOpen] = useState(false);
  const [mobileFlashcardExpanded, setMobileFlashcardExpanded] = useState(false);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user } = useAuth();

  const handleBrandClick = () => {
    if (user?.role === 'admin' || user?.role === 'teacher') {
      if (onGoAdmin) { onGoAdmin(); return; }
    }
    if (onGoLanding) { onGoLanding(); }
    else { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  const handleScrollFeatures = () => {
    if (onScrollFeatures) { onScrollFeatures(); }
    else if (onGoLanding) { onGoLanding(); }
    setMenuOpen(false);
  };

  const handleGoTopics = () => {
    onGoTopics?.();
    setMenuOpen(false);
  };

  // Dropdown hover handlers
  const handleMouseEnterFlashcard = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setFlashcardDropdownOpen(true);
  };
  const handleMouseLeaveFlashcard = () => {
    dropdownTimeoutRef.current = setTimeout(() => setFlashcardDropdownOpen(false), 120);
  };

  const isFlashcardActive =
    activeView === 'flashcards' ||
    activeView === 'flashcard-detail' ||
    activeView === 'flashcard-library' ||
    activeView === 'create-flashcard';

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

            {/* ── FLASHCARD DROPDOWN (Desktop hover / Mobile accordion) ── */}
            <div
              className="nav-dropdown-wrapper"
              onMouseEnter={handleMouseEnterFlashcard}
              onMouseLeave={handleMouseLeaveFlashcard}
            >
              {/* Desktop trigger button */}
              <button
                className={`nav-dropdown-trigger ${isFlashcardActive ? 'is-active' : ''}`}
                onClick={() => {
                  // On mobile: toggle accordion; On desktop: go directly
                  if (window.innerWidth <= 768) {
                    setMobileFlashcardExpanded(p => !p);
                  } else {
                    onGoFlashcards?.();
                    setMenuOpen(false);
                  }
                }}
              >
                <BookOpen size={18} /> Flashcards
                <ChevronDown
                  size={14}
                  className={`nav-dropdown-chevron ${flashcardDropdownOpen || mobileFlashcardExpanded ? 'rotated' : ''}`}
                />
              </button>

              {/* Desktop dropdown panel */}
              <div className={`nav-dropdown-panel ${flashcardDropdownOpen ? 'is-open' : ''}`}>
                <button
                  className="nav-dropdown-item"
                  onClick={() => { onGoFlashcards?.(); setFlashcardDropdownOpen(false); }}
                >
                  <span className="nav-dropdown-item-icon"><Compass size={16} /></span>
                  <span>
                    <strong>Khám phá flashcard</strong>
                    <em>Bộ thẻ có sẵn trên hệ thống</em>
                  </span>
                </button>
                <button
                  className="nav-dropdown-item"
                  onClick={() => { onGoFlashcardLibrary?.(); setFlashcardDropdownOpen(false); }}
                >
                  <span className="nav-dropdown-item-icon"><Library size={16} /></span>
                  <span>
                    <strong>Thư viện của bạn</strong>
                    <em>Bộ thẻ đã học xong</em>
                  </span>
                </button>
              </div>

              {/* Mobile accordion sub-links */}
              {mobileFlashcardExpanded && (
                <div className="nav-mobile-sub">
                  <button
                    className="nav-mobile-sub-item"
                    onClick={() => { onGoFlashcards?.(); setMenuOpen(false); setMobileFlashcardExpanded(false); }}
                  >
                    <Compass size={15} /> Khám phá flashcard
                  </button>
                  <button
                    className="nav-mobile-sub-item"
                    onClick={() => { onGoFlashcardLibrary?.(); setMenuOpen(false); setMobileFlashcardExpanded(false); }}
                  >
                    <Library size={15} /> Thư viện của bạn (Đã học xong)
                  </button>
                </div>
              )}
            </div>

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
            onGoProfile={() => { setMenuOpen(false); onGoProfile?.(); }}
            onGoProgress={() => { setMenuOpen(false); onGoProgress?.(); }}
            onGoHistory={() => { setMenuOpen(false); onGoHistory?.(); }}
            onGoAdmin={() => { setMenuOpen(false); onGoAdmin?.(); }}
            onGoSettings={() => { setMenuOpen(false); onGoSettings?.(); }}
            onLoggedOut={() => { setMenuOpen(false); onLoggedOut?.(); }}
          />
        ) : (
          <button
            className="login-button"
            onClick={() => { setMenuOpen(false); onGoAuth?.('login'); }}
          >
            Login
          </button>
        )}
      </nav>
    </header>
  );
}

import { useState, useEffect } from 'react';
import { Header } from '@/layout/Header';
import { Footer } from '@/layout/Footer';
import type { AuthMode, FlashcardItem } from '@/types';
import {
  BookOpen,
  Search,
  SlidersHorizontal,
  Plus,
  Binary,
  Database,
  Cpu,
  Code2,
  BrainCircuit,
  Globe,
  Pencil,
  Trash2,
  Library,
  Shuffle,
  X,
  AlertCircle,
  Check,
} from 'lucide-react';
import {
  MOCK_FLASHCARD_SETS,
  MOCK_USER_FLASHCARD_SETS,
  deleteFlashcardSet,
  getCompletedFlashcardSets,
  combineAndShuffleFlashcards,
  type FlashcardMockSet,
  type CompletedFlashcardSet,
  type CardIcon,
} from '@/data/flashcardMockData';

interface FlashcardsPageProps {
  onBack: () => void;
  onAuth?: (mode: AuthMode) => void;
  onGoLanding?: () => void;
  onGoTopics?: () => void;
  onGoFlashcards?: () => void;
  onGoFlashcardLibrary?: () => void;
  onGoCreateSet?: () => void;
  onEditSet?: (setId: string) => void;
  onGoProfile?: () => void;
  onGoProgress?: () => void;
  onGoHistory?: () => void;
  onGoAdmin?: () => void;
  onGoSettings?: () => void;
  onGoLeague?: () => void;
  onLoggedOut?: () => void;
  onSelectSet: (setId: string) => void;
  onStartMultiSetPractice?: (cards: FlashcardItem[], title: string) => void;
  initialTab?: Tab;
}

const ICON_MAP: Record<CardIcon, React.ElementType> = {
  Binary,
  Database,
  Cpu,
  Code2,
  BrainCircuit,
  Globe,
};

export type Tab = 'explore' | 'my-sets' | 'learning';

export function FlashcardsPage({
  onAuth,
  onGoLanding,
  onGoTopics,
  onGoFlashcards,
  onGoFlashcardLibrary,
  onGoCreateSet,
  onEditSet,
  onGoProfile,
  onGoProgress,
  onGoHistory,
  onGoAdmin,
  onGoSettings,
  onGoLeague,
  onLoggedOut,
  onSelectSet,
  onStartMultiSetPractice,
  initialTab = 'explore',
}: FlashcardsPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSets, setUserSets] = useState<FlashcardMockSet[]>([...MOCK_USER_FLASHCARD_SETS]);

  // Modal ôn luyện ngẫu nhiên từ nhiều bộ hoàn thành
  const [isRandomModalOpen, setIsRandomModalOpen] = useState(false);
  const [completedSets, setCompletedSets] = useState<CompletedFlashcardSet[]>([]);
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);
  const [randomModalError, setRandomModalError] = useState<string | null>(null);

  const handleOpenRandomModal = () => {
    const list = getCompletedFlashcardSets();
    setCompletedSets(list);
    setSelectedSetIds([]);
    setRandomModalError(null);
    setIsRandomModalOpen(true);
  };

  const handleToggleSelectSet = (id: string) => {
    setSelectedSetIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        return prev; // Đã chọn tối đa 3 bộ, không thể chọn bộ thứ 4
      }
      return [...prev, id];
    });
  };

  const handleStartRandomPractice = () => {
    if (selectedSetIds.length === 0) return;
    const chosen = completedSets.filter((s) => selectedSetIds.includes(s.id));
    const combinedCards = combineAndShuffleFlashcards(chosen);

    if (combinedCards.length === 0) {
      setRandomModalError('Các bộ đã chọn không có từ vựng hợp lệ để ôn luyện.');
      return;
    }

    setIsRandomModalOpen(false);
    onStartMultiSetPractice?.(
      combinedCards,
      `Ôn luyện ngẫu nhiên (${chosen.length} bộ, ${combinedCards.length} từ)`
    );
  };

  // Luôn đồng bộ danh sách bộ thẻ tự tạo khi mở trang
  useEffect(() => {
    setUserSets([...MOCK_USER_FLASHCARD_SETS]);
  }, []);

  const handleDeleteSet = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc muốn xóa bộ flashcard này?')) {
      deleteFlashcardSet(id);
      setUserSets([...MOCK_USER_FLASHCARD_SETS]);
    }
  };

  const currentSource = activeTab === 'my-sets' 
    ? userSets 
    : activeTab === 'learning'
    ? MOCK_FLASHCARD_SETS.slice(0, 2)
    : MOCK_FLASHCARD_SETS;

  const filteredSets = currentSource.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-shell">
      <Header
        activeView={activeTab === 'my-sets' ? 'flashcards' : 'flashcards'}
        onGoLanding={onGoLanding}
        onGoAuth={onAuth}
        onGoTopics={onGoTopics}
        onGoFlashcards={() => {
          setActiveTab('explore');
          onGoFlashcards?.();
        }}
        onGoFlashcardLibrary={onGoFlashcardLibrary}
        onGoProfile={onGoProfile}
        onGoProgress={onGoProgress}
        onGoHistory={onGoHistory}
        onGoAdmin={onGoAdmin}
        onGoSettings={onGoSettings}
        onGoLeague={onGoLeague}
        onLoggedOut={onLoggedOut}
      />

      <main className="progress-main">
        {/* Page Header (Đồng bộ font & vị trí với Tiến độ học tập) */}
        <div className="page-header">
          <h1 className="page-title">
            <BookOpen size={26} className="page-title-icon" /> Bộ Từ Vựng Flashcard
          </h1>
          <p className="page-sub">
            Khám phá các bộ flashcard có sẵn trên hệ thống hoặc tự tạo và quản lý bộ thẻ cá nhân.
          </p>
        </div>

        {/* Search Bar */}
        <div className="fc-search-bar">
          <Search size={18} className="fc-search-icon" />
          <input
            type="text"
            className="fc-search-input"
            placeholder={activeTab === 'my-sets' ? "Tìm kiếm trong bộ thẻ đã tạo của bạn..." : "Tìm kiếm bộ flashcard..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button className="fc-search-filter-btn" aria-label="Bộ lọc">
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="fc-tabs">
          <button
            className={`fc-tab${activeTab === 'explore' ? ' fc-tab--active' : ''}`}
            onClick={() => setActiveTab('explore')}
          >
            Khám phá
          </button>
          <button
            className={`fc-tab${activeTab === 'my-sets' ? ' fc-tab--active' : ''}`}
            onClick={() => setActiveTab('my-sets')}
          >
            Bộ thẻ của tôi ({userSets.length})
          </button>
          <button
            className={`fc-tab${activeTab === 'learning' ? ' fc-tab--active' : ''}`}
            onClick={() => setActiveTab('learning')}
          >
            Đang học
          </button>
        </div>

        {/* Section Header */}
        <div className="fc-section-header">
          <div>
            <h2 className="fc-section-title">
              {activeTab === 'my-sets' 
                ? `Bộ thẻ đã tạo (${userSets.length})` 
                : activeTab === 'learning' 
                ? 'Đang học' 
                : 'Bộ thẻ có sẵn'}
            </h2>
            <p className="fc-section-sub">
              {activeTab === 'my-sets' 
                ? 'Danh sách các bộ từ vựng bạn đã tự biên tập và lưu trữ' 
                : activeTab === 'learning' 
                ? 'Tiếp tục ôn luyện các bộ flashcard đang dang dở' 
                : 'Các bộ từ vựng được biên soạn bởi hệ thống'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="fc-random-study-btn"
              onClick={handleOpenRandomModal}
              title="Ôn luyện tổng hợp ngẫu nhiên từ tối đa 3 bộ flashcard đã hoàn thành"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              <Shuffle size={16} /> Ôn luyện ngẫu nhiên
            </button>
            <button className="fc-create-btn" onClick={() => onGoCreateSet?.()}>
              <Plus size={16} /> Tạo bộ thẻ
            </button>
          </div>
        </div>

        {/* Render theo Tab */}
        {activeTab === 'my-sets' ? (
          /* TAB: BỘ THẺ CỦA TÔI (Chuyển toàn bộ quản lý bộ thẻ đã tạo sang đây) */
          filteredSets.length > 0 ? (
            <div className="fc-hcard-list">
              {filteredSets.map((set) => {
                const IconComp = ICON_MAP[set.iconName] || Code2;
                return (
                  <div key={set.id} className="fc-hcard">
                    {/* Bên trái: Icon và thông tin */}
                    <div className="fc-hcard-left">
                      <div
                        className="fc-hcard-icon"
                        style={{ background: set.iconBg, color: set.iconColor }}
                      >
                        <IconComp size={28} />
                      </div>

                      <div className="fc-hcard-info">
                        <div className="fc-hcard-title-row">
                          <h3 className="fc-hcard-title">{set.title}</h3>
                          <span className="fc-hcard-badge">Tự tạo</span>
                          {set.isPublic !== undefined && (
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: set.isPublic ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                                color: set.isPublic ? '#059669' : '#64748b',
                                border: `1px solid ${set.isPublic ? 'rgba(16, 185, 129, 0.25)' : 'rgba(100, 116, 139, 0.25)'}`,
                              }}
                            >
                              {set.isPublic ? 'Public' : 'Riêng tư'}
                            </span>
                          )}
                        </div>
                        <p className="fc-hcard-sub">{set.subtitle}</p>
                        <div className="fc-hcard-meta">
                          <span className="fc-hcard-meta-item">
                            <BookOpen size={14} /> {set.wordCount} thuật ngữ
                          </span>
                          <span className="fc-hcard-dot">•</span>
                          <span className="fc-hcard-meta-item">Đã tạo bởi bạn</span>
                        </div>
                      </div>
                    </div>

                    {/* Bên phải: Nút Chỉnh sửa & Học ngay & Xóa */}
                    <div className="fc-hcard-actions">
                      <button
                        className="fc-hcard-edit-btn"
                        title="Chỉnh sửa toàn bộ bộ thẻ"
                        onClick={() => onEditSet?.(set.id)}
                      >
                        <Pencil size={15} /> Chỉnh sửa
                      </button>
                      <button
                        className="fc-hcard-study-btn"
                        onClick={() => onSelectSet(set.id)}
                      >
                        Học ngay
                      </button>
                      <button
                        className="fc-hcard-delete-btn"
                        title="Xóa bộ thẻ"
                        onClick={(e) => handleDeleteSet(set.id, e)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="fc-library-empty">
              <div className="fc-library-empty-icon">
                <Library size={40} />
              </div>
              <h3>{searchQuery ? 'Không tìm thấy bộ thẻ phù hợp' : 'Bạn chưa có bộ thẻ nào'}</h3>
              <p>
                {searchQuery
                  ? 'Thử tìm kiếm với từ khóa khác.'
                  : 'Bắt đầu tạo bộ flashcard đầu tiên của bạn để thuận tiện ôn tập và học từ vựng.'}
              </p>
              <div className="fc-library-empty-actions">
                <button
                  className="fc-create-btn"
                  style={{ padding: '12px 28px', fontSize: '15px' }}
                  onClick={() => onGoCreateSet?.()}
                >
                  <Plus size={16} /> Tạo bộ thẻ mới
                </button>
                <button className="fc-library-explore-btn" onClick={() => setActiveTab('explore')}>
                  <BookOpen size={16} /> Khám phá flashcard hệ thống
                </button>
              </div>
            </div>
          )
        ) : (
          /* TAB: KHÁM PHÁ & ĐANG HỌC (Grid tiêu chuẩn) */
          <>
            <div className="fc-new-grid">
              {filteredSets.map(set => {
                const IconComp = ICON_MAP[set.iconName] || Code2;
                return (
                  <div key={set.id} className="fc-new-card">
                    {/* Banner */}
                    <div className="fc-new-card-banner" style={{ background: set.iconBg }}>
                      <IconComp size={36} color={set.iconColor} />
                    </div>

                    {/* Body */}
                    <div className="fc-new-card-body">
                      <h3 className="fc-new-card-title">{set.title}</h3>
                      <p className="fc-new-card-sub">{set.subtitle}</p>
                      <div className="fc-new-card-meta">
                        <BookOpen size={14} />
                        <span>{set.wordCount} từ</span>
                      </div>
                      <button
                        className="fc-study-btn"
                        onClick={() => onSelectSet(set.id)}
                      >
                        Học ngay
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredSets.length === 0 && (
              <div className="fc-empty-state">
                <BookOpen size={40} />
                <p>Không tìm thấy bộ từ vựng nào phù hợp.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── MODAL CHỌN BỘ FLASHCARD ĐỂ ÔN LUYỆN NGẪU NHIÊN ── */}
      {isRandomModalOpen && (
        <div
          className="fc-modal-overlay"
          onClick={() => setIsRandomModalOpen(false)}
        >
          <div
            className="fc-modal-box"
            style={{ maxWidth: '540px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="fc-modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shuffle size={18} color="#6366f1" /> Chọn bộ Flashcard để ôn luyện
              </h3>
              <button
                type="button"
                className="fc-modal-close"
                onClick={() => setIsRandomModalOpen(false)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="fc-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {completedSets.length === 0 ? (
                /* Trường hợp không có bộ nào hoàn thành */
                <div style={{ padding: '24px 12px', textAlign: 'center' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto',
                    }}
                  >
                    <AlertCircle size={28} />
                  </div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
                    Chưa có bộ thẻ hoàn thành
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.5 }}>
                    Bạn chưa có bộ Flashcard nào hoàn thành. Hãy hoàn thành một bộ để bắt đầu ôn luyện tổng hợp.
                  </p>
                  <div className="fc-modal-footer" style={{ marginTop: '24px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="fc-modal-cancel-btn"
                      onClick={() => setIsRandomModalOpen(false)}
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              ) : (
                /* Danh sách các bộ đã hoàn thành */
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '14px',
                      fontSize: '13px',
                      color: 'var(--text-secondary, #94a3b8)',
                    }}
                  >
                    <span>Chọn từ 1 đến 3 bộ Flashcard đã hoàn thành:</span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: selectedSetIds.length === 3 ? '#10b981' : '#6366f1',
                        background: selectedSetIds.length === 3 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: `1px solid ${selectedSetIds.length === 3 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(99, 102, 241, 0.25)'}`,
                      }}
                    >
                      Đã chọn {selectedSetIds.length}/3 bộ
                    </span>
                  </div>

                  {randomModalError && (
                    <div
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '8px',
                        fontSize: '13px',
                        marginBottom: '12px',
                      }}
                    >
                      {randomModalError}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {completedSets.map((s) => {
                      const isSelected = selectedSetIds.includes(s.id);
                      const isMaxReached = selectedSetIds.length >= 3 && !isSelected;
                      const IconComp = ICON_MAP[s.iconName] || Code2;
                      const cardCount = (s.cards && s.cards.length > 0) ? s.cards.length : s.wordCount;

                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            if (!isMaxReached) {
                              handleToggleSelectSet(s.id);
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: `1.5px solid ${
                              isSelected
                                ? '#6366f1'
                                : 'var(--border-color, rgba(255, 255, 255, 0.1))'
                            }`,
                            background: isSelected
                              ? 'rgba(99, 102, 241, 0.08)'
                              : 'var(--bg-card, rgba(255, 255, 255, 0.02))',
                            cursor: isMaxReached ? 'not-allowed' : 'pointer',
                            opacity: isMaxReached ? 0.5 : 1,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {/* Checkbox Indicator */}
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '6px',
                              border: `1.5px solid ${isSelected ? '#6366f1' : '#64748b'}`,
                              background: isSelected ? '#6366f1' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              flexShrink: 0,
                            }}
                          >
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </div>

                          {/* Icon bộ thẻ */}
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '8px',
                              background: s.iconBg,
                              color: s.iconColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <IconComp size={20} />
                          </div>

                          {/* Thông tin bộ thẻ */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4
                                style={{
                                  margin: 0,
                                  fontSize: '14.5px',
                                  fontWeight: 600,
                                  color: 'var(--text-primary, #f8fafc)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {s.title}
                              </h4>
                            </div>
                            {s.subtitle && (
                              <p
                                style={{
                                  margin: '2px 0 0 0',
                                  fontSize: '12.5px',
                                  color: 'var(--text-secondary, #94a3b8)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {s.subtitle}
                              </p>
                            )}
                          </div>

                          {/* Số lượng từ */}
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: 'var(--text-secondary, #94a3b8)',
                              flexShrink: 0,
                            }}
                          >
                            <BookOpen size={13} /> {cardCount} từ
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div
                    className="fc-modal-footer"
                    style={{
                      marginTop: '20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)' }}>
                      Tối đa 30 từ ngẫu nhiên
                    </span>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        className="fc-modal-cancel-btn"
                        onClick={() => setIsRandomModalOpen(false)}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleStartRandomPractice}
                        disabled={selectedSetIds.length === 0}
                        style={{
                          padding: '9px 20px',
                          borderRadius: '8px',
                          background: selectedSetIds.length === 0
                            ? 'rgba(99, 102, 241, 0.4)'
                            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          color: '#ffffff',
                          fontSize: '14px',
                          fontWeight: 600,
                          border: 'none',
                          cursor: selectedSetIds.length === 0 ? 'not-allowed' : 'pointer',
                          opacity: selectedSetIds.length === 0 ? 0.6 : 1,
                          boxShadow: selectedSetIds.length === 0 ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.3)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Shuffle size={15} /> Bắt đầu ôn luyện
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

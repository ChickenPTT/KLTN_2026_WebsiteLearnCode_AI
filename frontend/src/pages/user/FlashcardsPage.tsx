import { useState, useEffect } from 'react';
import { Header } from '@/layout/Header';
import { Footer } from '@/layout/Footer';
import type { AuthMode } from '@/types';
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
} from 'lucide-react';
import {
  flashcardApi,
  type BackendFlashcardDeck,
} from '@/lib/api';
import type { CardIcon } from '@/data/flashcardMockData';

/** Bridge type: backend deck + UI-only fields */
interface FlashcardDisplaySet {
  id: string;
  backendId: number;
  title: string;
  subtitle: string;
  wordCount: number;
  viewCount: number;
  authorName: string;
  iconName: CardIcon;
  iconBg: string;
  iconColor: string;
  isPublic?: boolean;
  authorRole?: 'admin' | 'teacher' | 'student';
}

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
  onLoggedOut?: () => void;
  onSelectSet: (setId: string) => void;
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

// Icon presets cho deck backend (vì backend không lưu icon)
const ICON_PRESETS: { icon: CardIcon; bg: string; color: string }[] = [
  { icon: 'Binary', bg: '#EEF2FF', color: '#4F46E5' },
  { icon: 'Database', bg: '#ECFDF5', color: '#059669' },
  { icon: 'Cpu', bg: '#FFF7ED', color: '#EA580C' },
  { icon: 'Code2', bg: '#EFF6FF', color: '#2563EB' },
  { icon: 'BrainCircuit', bg: '#FDF4FF', color: '#9333EA' },
  { icon: 'Globe', bg: '#F0FDF4', color: '#16A34A' },
];

function backendDeckToDisplay(deck: BackendFlashcardDeck, index: number): FlashcardDisplaySet {
  const preset = ICON_PRESETS[index % ICON_PRESETS.length];
  return {
    id: String(deck.id),
    backendId: deck.id,
    title: deck.name,
    subtitle: deck.description ?? 'Bộ flashcard',
    wordCount: deck.terms?.length ?? 0,
    viewCount: 0,
    authorName: 'Hệ thống',
    iconName: preset.icon,
    iconBg: preset.bg,
    iconColor: preset.color,
    isPublic: true,
    authorRole: 'admin' as const,
  };
}

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
  onLoggedOut,
  onSelectSet,
  initialTab = 'explore',
}: FlashcardsPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [allDecks, setAllDecks] = useState<FlashcardDisplaySet[]>([]);
  const [loading, setLoading] = useState(true);

  // Tải danh sách decks từ backend
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    flashcardApi.listDecks()
      .then(decks => {
        if (!cancelled) {
          const display = decks.map((d, i) => backendDeckToDisplay(d, i));
          setAllDecks(display);
          setLoading(false);
        }
      })
      .catch(() => {
        // Backend chưa chạy — fallback về mảng rỗng
        if (!cancelled) {
          setAllDecks([]);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const handleDeleteSet = async (displaySet: FlashcardDisplaySet, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc muốn xóa bộ flashcard này?')) return;
    try {
      await flashcardApi.deleteDeck(displaySet.backendId);
      setAllDecks(prev => prev.filter(s => s.backendId !== displaySet.backendId));
    } catch {
      alert('Không thể xóa bộ flashcard.');
    }
  };

  const currentSource = allDecks;

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
            Bộ thẻ của tôi ({allDecks.length})
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
                ? `Bộ thẻ đã tạo (${allDecks.length})` 
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
          <button className="fc-create-btn" onClick={() => onGoCreateSet?.()}>
            <Plus size={16} /> Tạo bộ thẻ
          </button>
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
                        onClick={(e) => handleDeleteSet(set, e)}
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

      <Footer />
    </div>
  );
}

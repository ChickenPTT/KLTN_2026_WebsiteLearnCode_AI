import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/layout/Header';
import { Footer } from '@/layout/Footer';
import type { AuthMode } from '@/types';
import type { FlashcardItem } from '@/types';
import {
  Library,
  BookOpen,
  Search,
  SlidersHorizontal,
  Binary,
  Database,
  Cpu,
  Code2,
  BrainCircuit,
  Globe,
  CheckCircle2,
  Clock,
  Compass,
  ArrowLeft,
  RefreshCw,
  RotateCcw,
  Check,
  X,
} from 'lucide-react';
import { quizApi, flashcardApi, type QuizSession, type FlashcardStudyProgress } from '@/lib/api';

interface FlashcardLibraryPageProps {
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
  onGoMatch?: (setId: string) => void;
}

type CardIcon = 'Binary' | 'Database' | 'Cpu' | 'Code2' | 'BrainCircuit' | 'Globe';

const ICON_MAP: Record<CardIcon, React.ElementType> = {
  Binary,
  Database,
  Cpu,
  Code2,
  BrainCircuit,
  Globe,
};

const ICON_PRESETS: { icon: CardIcon; bg: string; color: string }[] = [
  { icon: 'Binary', bg: '#EEF2FF', color: '#4F46E5' },
  { icon: 'Database', bg: '#ECFDF5', color: '#059669' },
  { icon: 'Cpu', bg: '#FFF7ED', color: '#EA580C' },
  { icon: 'Code2', bg: '#EFF6FF', color: '#2563EB' },
  { icon: 'BrainCircuit', bg: '#FDF4FF', color: '#9333EA' },
  { icon: 'Globe', bg: '#F0FDF4', color: '#16A34A' },
];

type RoleFilter = 'all' | 'system' | 'user';

// Completed set type — matches the library display needs
interface CompletedFlashcardSet {
  id: string;
  title: string;
  subtitle: string;
  wordCount: number;
  viewCount: number;
  authorName: string;
  authorRole: 'admin' | 'teacher' | 'student';
  iconName: CardIcon;
  iconBg: string;
  iconColor: string;
  cards: FlashcardItem[];
  completedAt: string;
  masteryPercent: number;
  knownCards: number;
}

// Format createdAt to relative time string
function formatCompletedAt(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

// ── Circular donut chart ─────────────────────────────────────────────────────
function ProgressDonut({ known, total }: { known: number; total: number }) {
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeTotal = total > 0 ? total : 1;
  const percent = Math.round((known / safeTotal) * 100);
  const knownLength = Math.min((known / safeTotal) * circumference, circumference);
  const remaining = total - known;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      {/* Donut */}
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            className="fc-donut-track"
            strokeWidth={strokeWidth}
          />
          {/* Known arc */}
          {known > 0 && (
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              fill="none"
              stroke="#10b981"
              strokeWidth={strokeWidth}
              strokeDasharray={`${knownLength} ${circumference}`}
              strokeLinecap="round"
            />
          )}
        </svg>
        {/* Center label */}
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {percent === 100 ? (
            <Check size={32} strokeWidth={3} color="#10b981" />
          ) : (
            <span className="fc-donut-center-text">
              {percent}%
            </span>
          )}
        </div>
      </div>

      {/* Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {/* Đã biết */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '7px 14px', borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.12)', color: '#059669',
          border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '13.5px', fontWeight: 600,
        }}>
          <span>Đã biết</span>
          <span style={{ fontSize: '15px' }}>{known}</span>
        </div>
        {/* Đang học */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '7px 14px', borderRadius: '8px',
          background: 'rgba(249, 115, 22, 0.12)', color: '#ea580c',
          border: '1px solid rgba(249, 115, 22, 0.25)', fontSize: '13.5px', fontWeight: 600,
        }}>
          <span>Đang học</span>
          <span style={{ fontSize: '15px' }}>0</span>
        </div>
        {/* Còn lại */}
        <div className="fc-bar-remaining">
          <span>Còn lại</span>
          <span style={{ fontSize: '15px' }}>{remaining > 0 ? remaining : 0}</span>
        </div>
      </div>
    </div>
  );
}

// ── Detail view for a completed set ─────────────────────────────────────────
function CompletedSetDetail({
  set,
  onClose,
  onRestudy,
  onGoMatch,
}: {
  set: CompletedFlashcardSet;
  onClose: () => void;
  onRestudy: () => void;
  onGoMatch?: (setId: string) => void;
}) {
  const cards = set.cards || [];
  const knownCount = set.knownCards;
  const totalCount = cards.length || set.wordCount;

  return (
    <div>
      {/* ── Result card – giống màn hoàn thành Quizlet ── */}
      <div className="fc-completion-card">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h2 className="fc-completion-title">
              Chà, bạn nắm bài thật chắc!
            </h2>
            <p className="fc-completion-sub">
              Bạn đã sắp xếp tất cả các thẻ trong <strong>{set.title}</strong>
            </p>
          </div>

          {/* Party popper */}
          <div style={{ width: '76px', height: '76px', flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <path d="M72 26 L88 42 L42 88 L26 72 Z" fill="#f59e0b" />
              <path d="M72 26 L88 42 L96 34 L80 18 Z" fill="#fbbf24" />
              <path d="M68 14 Q74 6 82 10" stroke="#3b82f6" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M36 32 Q26 26 30 16" stroke="#f43f5e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M54 36 Q48 50 40 44" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M80 48 Q88 56 84 64" stroke="#8b5cf6" strokeWidth="3" fill="none" strokeLinecap="round" />
              <circle cx="86" cy="58" r="3.5" fill="#3b82f6" />
              <circle cx="64" cy="22" r="3" fill="#ec4899" />
              <circle cx="44" cy="30" r="3.5" fill="#10b981" />
              <circle cx="32" cy="46" r="3" fill="#f59e0b" />
            </svg>
          </div>
        </div>

        {/* 2-column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '36px',
          alignItems: 'start',
        }}>
          {/* LEFT: Tiến độ */}
          <div>
            <h3 className="fc-completion-sub" style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0' }}>
              Tiến độ của bạn
            </h3>
            <ProgressDonut known={knownCount} total={totalCount} />
            <button
              type="button"
              className="fc-link-btn"
              style={{ marginTop: '16px' }}
              onClick={onClose}
            >
              <ArrowLeft size={16} /> Quay lại câu hỏi cuối cùng
            </button>
          </div>

          {/* RIGHT: Bước tiếp theo */}
          <div>
            <h3 className="fc-completion-sub" style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0' }}>
              Bước tiếp theo
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Ôn luyện lại */}
              <button
                type="button"
                onClick={() => {
                  if (onGoMatch) onGoMatch(set.id);
                  else onRestudy();
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '10px', height: '48px', borderRadius: '999px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  color: '#ffffff', border: 'none', fontSize: '15px', fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <RefreshCw size={17} /> Ôn luyện với các câu hỏi
              </button>

              {/* Đặt lại thẻ */}
              <button
                type="button"
                onClick={onRestudy}
                className="fc-link-btn"
                style={{ justifyContent: 'center', padding: '6px' }}
              >
                <RotateCcw size={15} /> Đặt lại Thẻ ghi nhớ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Danh sách từ đã học ── */}
      {cards.length > 0 && (
        <div>
          <h3 className="fc-section-title-themed">
            <BookOpen size={20} color="#4f46e5" />
            Từ vựng đã học ({cards.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cards.map((card, idx) => (
              <div
                key={card.id}
                className="fc-learned-card"
              >
                {/* Số thứ tự */}
                <span className="fc-learned-num">
                  {idx + 1}
                </span>

                {/* Nội dung */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span className="fc-learned-term">
                      {card.term}
                    </span>
                    {/* Badge đã học */}
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '3px',
                      fontSize: '11px', fontWeight: 700,
                      padding: '2px 8px', borderRadius: '20px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#059669',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                    }}>
                      <Check size={11} strokeWidth={3} /> Đã biết
                    </span>
                  </div>
                  <p className="fc-learned-def">
                    {card.definition}
                  </p>
                  {card.example && (
                    <p className="fc-learned-example">
                      "{card.example}"
                    </p>
                  )}
                </div>

                {/* Icon trạng thái */}
                <div style={{ flexShrink: 0, paddingTop: '2px' }}>
                  <Check size={18} color="#10b981" strokeWidth={2.5} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback khi set không có cards chi tiết */}
      {cards.length === 0 && (
        <div className="fc-completion-card" style={{ textAlign: 'center', padding: '32px' }}>
          <X size={36} color="#94a3b8" style={{ marginBottom: '12px' }} />
          <p className="fc-completion-sub">
            Bộ thẻ này chưa có dữ liệu từ chi tiết. Hãy ôn luyện để xem lại từng từ vựng.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export function FlashcardLibraryPage({
  onAuth,
  onGoLanding,
  onGoTopics,
  onGoFlashcards,
  onGoFlashcardLibrary,
  onGoProfile,
  onGoProgress,
  onGoHistory,
  onGoAdmin,
  onGoSettings,
  onLoggedOut,
  onSelectSet,
  onGoMatch,
}: FlashcardLibraryPageProps) {
  const [completedSets, setCompletedSets] = useState<CompletedFlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [selectedSet, setSelectedSet] = useState<CompletedFlashcardSet | null>(null);

  // Load completed quiz history from backend, then enrich with deck details
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Gộp 2 nguồn: tiến độ học lật thẻ (study-progress) + phiên quiz đã hoàn thành
    Promise.all([
      flashcardApi.getMyStudyProgress().catch(() => [] as FlashcardStudyProgress[]),
      quizApi.getQuizHistory().catch(() => [] as QuizSession[]),
    ])
      .then(async ([progressList, sessions]) => {
        if (cancelled) return;
        // Mỗi deck giữ lần hoàn thành gần nhất
        const byDeck = new Map<number, { completedAt: string; known?: number; total?: number; wordCount?: number; deckName?: string | null }>();
        const keepLatest = (deckId: number, entry: { completedAt: string; known?: number; total?: number; wordCount?: number; deckName?: string | null }) => {
          const prev = byDeck.get(deckId);
          if (!prev || new Date(entry.completedAt) > new Date(prev.completedAt)) {
            // Giữ số thẻ đã thuộc từ lần học lật thẻ nếu lần mới nhất là quiz
            byDeck.set(deckId, { ...prev, ...entry, known: entry.known ?? prev?.known, total: entry.total ?? prev?.total });
          } else if (entry.known != null && prev.known == null) {
            byDeck.set(deckId, { ...prev, known: entry.known, total: entry.total });
          }
        };
        for (const p of progressList) {
          keepLatest(p.deckId, { completedAt: p.completedAt, known: p.knownCards, total: p.totalCards });
        }
        for (const s of sessions) {
          if (s.status === 'COMPLETED' && s.deckId != null) {
            keepLatest(s.deckId, { completedAt: s.createdAt, wordCount: s.deckWordCount, deckName: s.deckName });
          }
        }
        if (byDeck.size === 0) {
          setCompletedSets([]);
          return;
        }
        // Fetch deck details for each unique deck (deck đã bị xóa thì bỏ qua)
        const deckPromises = Array.from(byDeck.entries()).map(async ([deckId, info]) => {
          const deck = await flashcardApi.getDeck(deckId).catch(() => null);
          if (!deck) return null;
          const preset = ICON_PRESETS[deckId % ICON_PRESETS.length];
          // Backend trả role viết hoa (ADMIN/TEACHER/STUDENT) -> chuẩn hóa cho bộ lọc
          const role = ((deck.authorRole ?? 'admin').toLowerCase()) as 'admin' | 'teacher' | 'student';
          const cards: FlashcardItem[] = (deck.terms ?? []).map(t => ({
            id: String(t.id),
            term: t.term,
            definition: t.definition,
          }));
          const wordCount = cards.length || (info.wordCount ?? 0);
          const knownCards = info.known != null ? Math.min(info.known, wordCount) : wordCount;
          const total = info.total || wordCount;
          return {
            id: String(deckId),
            title: deck.name || info.deckName || `Deck #${deckId}`,
            subtitle: deck.description || 'Bộ flashcard',
            wordCount,
            viewCount: deck.viewCount ?? 0,
            authorName: deck.authorName || 'Hệ thống',
            authorRole: role,
            iconName: preset.icon,
            iconBg: preset.bg,
            iconColor: preset.color,
            cards,
            completedAt: formatCompletedAt(info.completedAt),
            masteryPercent: total > 0 ? Math.round((Math.min(info.known ?? total, total) / total) * 100) : 0,
            knownCards,
          } as CompletedFlashcardSet;
        });
        const sets = (await Promise.all(deckPromises)).filter((s): s is CompletedFlashcardSet => s !== null);
        if (!cancelled) {
          setCompletedSets(sets);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('[FlashcardLibrary] Failed to load quiz history:', err);
          setCompletedSets([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filteredSets = completedSets.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (roleFilter === 'system') return s.authorRole === 'admin' || s.authorRole === 'teacher';
    if (roleFilter === 'user') return s.authorRole === 'student';
    return true;
  });

  return (
    <div className="page-shell">
      <Header
        activeView="flashcard-library"
        onGoLanding={onGoLanding}
        onGoAuth={onAuth}
        onGoTopics={onGoTopics}
        onGoFlashcards={onGoFlashcards}
        onGoFlashcardLibrary={onGoFlashcardLibrary ?? (() => {})}
        onGoProfile={onGoProfile}
        onGoProgress={onGoProgress}
        onGoHistory={onGoHistory}
        onGoAdmin={onGoAdmin}
        onGoSettings={onGoSettings}
        onLoggedOut={onLoggedOut}
      />

      <main className="progress-main">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Đang tải thư viện...</h2>
          </div>
        ) : selectedSet ? (
          /* ── Chi tiết bộ đã học xong ── */
          <CompletedSetDetail
            set={selectedSet}
            onClose={() => setSelectedSet(null)}
            onGoMatch={onGoMatch}
            onRestudy={() => {
              setSelectedSet(null);
              onSelectSet(selectedSet.id);
            }}
          />
        ) : (
          /* ── Danh sách thư viện ── */
          <>
            {/* Page Header */}
            <div className="page-header">
              <h1 className="page-title">
                <Library size={26} className="page-title-icon" /> Thư viện của bạn
              </h1>
              <p className="page-sub">
                Danh sách các bộ từ vựng flashcard bạn đã học xong. Bấm vào bộ thẻ để xem kết quả chi tiết.
              </p>
            </div>

            {/* Search Bar */}
            <div className="fc-search-bar" style={{ marginBottom: '16px' }}>
              <Search size={18} className="fc-search-icon" />
              <input
                type="text"
                className="fc-search-input"
                placeholder="Tìm kiếm trong các bộ thẻ đã học xong..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="fc-search-filter-btn" aria-label="Bộ lọc">
                <SlidersHorizontal size={18} />
              </button>
            </div>

            {/* Filter Badges */}
            <div className="fc-filter-pills-row">
              <button
                type="button"
                className={`fc-filter-pill ${roleFilter === 'all' ? 'is-active' : ''}`}
                onClick={() => setRoleFilter('all')}
              >
                Tất cả ({completedSets.length})
              </button>
              <button
                type="button"
                className={`fc-filter-pill ${roleFilter === 'system' ? 'is-active' : ''}`}
                onClick={() => setRoleFilter('system')}
              >
                Bộ thẻ hệ thống ({completedSets.filter((s) => s.authorRole === 'admin' || s.authorRole === 'teacher').length})
              </button>
              <button
                type="button"
                className={`fc-filter-pill ${roleFilter === 'user' ? 'is-active' : ''}`}
                onClick={() => setRoleFilter('user')}
              >
                Bộ thẻ tự tạo ({completedSets.filter((s) => s.authorRole === 'student').length})
              </button>
            </div>

            {/* Section Header */}
            <div className="fc-section-header">
              <div>
                <h2 className="fc-section-title">Bộ thẻ đã học xong ({filteredSets.length})</h2>
                <p className="fc-section-sub">
                  Bấm vào một bộ thẻ để xem kết quả học tập và danh sách từ vựng bạn đã nắm vững
                </p>
              </div>
              <button
                className="fc-create-btn"
                style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
                onClick={() => onGoFlashcards?.()}
              >
                <Compass size={16} /> Khám phá thêm bộ thẻ
              </button>
            </div>

            {/* Cards list */}
            {filteredSets.length > 0 ? (
              <div className="fc-hcard-list">
                {filteredSets.map((set) => {
                  const IconComp = ICON_MAP[set.iconName] || Code2;
                  return (
                    <div
                      key={set.id}
                      className="fc-hcard"
                      onClick={() => setSelectedSet(set)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Left */}
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
                          </div>
                          <p className="fc-hcard-sub">{set.subtitle}</p>
                          <div className="fc-hcard-meta">
                            <span className="fc-hcard-meta-item">
                              <BookOpen size={14} /> {set.wordCount} thuật ngữ
                            </span>
                            <span className="fc-hcard-dot">•</span>
                            <span className="fc-hcard-meta-item">
                              <Clock size={14} /> {set.completedAt}
                            </span>
                            <span className="fc-hcard-dot">•</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Chỉ hiển thị arrow indicator */}
                      <div className="fc-hcard-actions" style={{ paddingRight: '4px' }}>
                        <span style={{
                          fontSize: '13px', fontWeight: 600,
                          color: '#4f46e5',
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                        }}>
                          Xem kết quả →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="fc-library-empty">
                <div className="fc-library-empty-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                  <CheckCircle2 size={42} />
                </div>
                <h3>{searchQuery ? 'Không tìm thấy bộ thẻ phù hợp' : 'Chưa có bộ thẻ nào học xong'}</h3>
                <p>
                  {searchQuery
                    ? 'Thử tìm kiếm với từ khóa khác.'
                    : 'Khi bạn hoàn thành tất cả các từ trong một bộ flashcard, bộ thẻ sẽ tự động được lưu vào thư viện này.'}
                </p>
                <div className="fc-library-empty-actions">
                  <button
                    className="fc-create-btn"
                    style={{ padding: '12px 28px', fontSize: '15px' }}
                    onClick={() => onGoFlashcards?.()}
                  >
                    <Compass size={16} /> Khám phá flashcard để học ngay
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

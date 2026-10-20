import { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from '@/layout/Header';
import { Footer } from '@/layout/Footer';
import type { AuthMode, FlashcardItem } from '@/types';
import {
  ArrowLeft,
  Check,
  X,
  RefreshCw,
  Volume2,
  Maximize,
  RotateCcw,
} from 'lucide-react';
import { ALL_FLASHCARD_SETS, markSetCompleted, type FlashcardMockSet } from '@/data/flashcardMockData';

interface FlashcardDetailPageProps {
  setId: string;
  onBack: () => void;
  onAuth?: (mode: AuthMode) => void;
  onGoLanding?: () => void;
  onGoTopics?: () => void;
  onGoProfile?: () => void;
  onGoProgress?: () => void;
  onGoHistory?: () => void;
  onGoAdmin?: () => void;
  onGoSettings?: () => void;
  onLoggedOut?: () => void;
  onGoMatch?: (setId: string) => void;
}

// Circular Donut Progress component matching Quizlet completion screen
function ProgressDonut({
  known,
  learning,
  total,
}: {
  known: number;
  learning: number;
  total: number;
}) {
  const size = 114;
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const safeTotal = total > 0 ? total : 1;
  const percent = Math.round((known / safeTotal) * 100);

  const totalStudied = known + learning;
  const totalLength = Math.min((totalStudied / safeTotal) * circumference, circumference);
  const knownLength = Math.min((known / safeTotal) * circumference, circumference);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="fc-donut-track"
          strokeWidth={strokeWidth}
        />
        {/* Learning (Orange) track */}
        {learning > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f97316"
            strokeWidth={strokeWidth}
            strokeDasharray={`${totalLength} ${circumference}`}
            strokeLinecap="round"
          />
        )}
        {/* Known (Green) track */}
        {known > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#10b981"
            strokeWidth={strokeWidth}
            strokeDasharray={`${knownLength} ${circumference}`}
            strokeLinecap="round"
          />
        )}
      </svg>
      {/* Percentage Center Text */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <span
          className="fc-donut-center-text"
          style={{
            fontSize: '24px',
            letterSpacing: '-0.5px',
          }}
        >
          {percent}%
        </span>
      </div>
    </div>
  );
}

export function FlashcardDetailPage({
  setId,
  onBack,
  onAuth,
  onGoLanding,
  onGoTopics,
  onGoProfile,
  onGoProgress,
  onGoHistory,
  onGoAdmin,
  onGoSettings,
  onLoggedOut,
  onGoMatch,
}: FlashcardDetailPageProps) {
  const set: FlashcardMockSet | undefined = ALL_FLASHCARD_SETS.find((s) => s.id === setId);

  const initialCards: FlashcardItem[] = useMemo(() => {
    if (set && set.cards && set.cards.length > 0) return set.cards;
    return [
      { id: '1', term: 'Hello', definition: 'Xin chào', example: 'Hello, how are you?' },
      { id: '2', term: 'Goodbye', definition: 'Tạm biệt', example: 'Goodbye, see you later!' },
      { id: '3', term: 'Thank you', definition: 'Cảm ơn', example: 'Thank you very much.' },
    ];
  }, [set]);

  // Flashcard Deck States
  const [activeCards, setActiveCards] = useState<FlashcardItem[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Learning progress tracking
  const [knownCardIds, setKnownCardIds] = useState<Set<string>>(new Set());
  const [learningCardIds, setLearningCardIds] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);

  // Sync when initialCards change
  useEffect(() => {
    setActiveCards(initialCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCardIds(new Set());
    setLearningCardIds(new Set());
    setIsCompleted(false);
  }, [initialCards]);

  // Mark set as completed in library
  useEffect(() => {
    if (isCompleted && set) {
      markSetCompleted(set.id, knownCardIds.size, initialCards.length);
    }
  }, [isCompleted, set, knownCardIds.size, initialCards.length]);

  const currentCard = activeCards[currentIndex] || activeCards[0] || initialCards[0];

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Đánh dấu X: Chưa thuộc (Cần học lại)
  const handleMarkLearning = useCallback(() => {
    if (!currentCard) return;
    setLearningCardIds((prev) => new Set(prev).add(currentCard.id));
    setKnownCardIds((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });

    setIsFlipped(false);
    if (currentIndex + 1 >= activeCards.length) {
      setTimeout(() => setIsCompleted(true), 180);
    } else {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 150);
    }
  }, [currentCard, currentIndex, activeCards.length]);

  // Đánh dấu ✓: Đã thuộc (Đã biết)
  const handleMarkKnown = useCallback(() => {
    if (!currentCard) return;
    setKnownCardIds((prev) => new Set(prev).add(currentCard.id));
    setLearningCardIds((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });

    setIsFlipped(false);
    if (currentIndex + 1 >= activeCards.length) {
      setTimeout(() => setIsCompleted(true), 180);
    } else {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 150);
    }
  }, [currentCard, currentIndex, activeCards.length]);

  // Quay lại câu hỏi cuối cùng từ trang kết quả
  const handleBackToLastCard = () => {
    setIsCompleted(false);
    setIsFlipped(false);
    setCurrentIndex(Math.max(0, activeCards.length - 1));
  };

  // Làm lại cả bộ (Đặt lại Thẻ ghi nhớ)
  const handleResetAll = () => {
    setActiveCards(initialCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCardIds(new Set());
    setLearningCardIds(new Set());
    setIsCompleted(false);
  };

  // Tập trung vào học các thẻ chưa thuộc
  const handleStudyLearningCards = () => {
    const unlearned = initialCards.filter((c) => learningCardIds.has(c.id));
    if (unlearned.length > 0) {
      setActiveCards(unlearned);
      setCurrentIndex(0);
      setIsFlipped(false);
      setKnownCardIds(new Set());
      setLearningCardIds(new Set());
      setIsCompleted(false);
    }
  };

  // Keyboard Navigation: Space / Up / Down = Flip, ArrowLeft / 1 = X, ArrowRight / 2 = ✓
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (!isCompleted) {
        if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          flipCard();
        } else if (e.key === 'ArrowLeft' || e.key === '1') {
          e.preventDefault();
          handleMarkLearning();
        } else if (e.key === 'ArrowRight' || e.key === '2') {
          e.preventDefault();
          handleMarkKnown();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompleted, flipCard, handleMarkLearning, handleMarkKnown]);

  // Text to Speech
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Fullscreen
  const handleToggleFullscreen = () => {
    const el = document.querySelector('.fc-viewer-container');
    if (!document.fullscreenElement && el) {
      el.requestFullscreen().catch(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  if (!set) {
    return (
      <div className="page-shell">
        <Header activeView="flashcard-detail" />
        <main style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Không tìm thấy bộ từ vựng</h2>
          <button onClick={onBack} className="secondary-button" style={{ marginTop: '16px' }}>
            Quay lại
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const knownCount = knownCardIds.size;
  const learningCount = learningCardIds.size;
  const totalDeckCount = activeCards.length;

  return (
    <div className="page-shell">
      <Header
        activeView="flashcard-detail"
        onGoLanding={onGoLanding}
        onGoAuth={onAuth}
        onGoTopics={onGoTopics}
        onGoProfile={onGoProfile}
        onGoProgress={onGoProgress}
        onGoHistory={onGoHistory}
        onGoAdmin={onGoAdmin}
        onGoSettings={onGoSettings}
        onLoggedOut={onLoggedOut}
      />

      <main className="fc-detail-main">
        {/* Top Header */}
        <div className="fc-detail-header">
          <button className="fc-back-btn" onClick={onBack}>
            <ArrowLeft size={20} /> Quay lại
          </button>
          <h1 className="fc-detail-title">{set.title}</h1>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TRƯỜNG HỢP 1: TRANG KẾT QUẢ HOÀN THÀNH (QUIZLET STYLE COMPLETION)
           ══════════════════════════════════════════════════════════════════ */}
        {isCompleted ? (
          <div className="fc-completion-card" style={{ marginBottom: '40px' }}>
            {/* Header: Title + Confetti Party Popper */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '32px',
              }}
            >
              <div>
                <h2 className="fc-completion-title" style={{ fontSize: '28px' }}>
                  Bạn làm rất tốt! Đừng dừng lại nhé.
                </h2>
                <span className="fc-completion-sub">
                  Bộ thẻ: <strong>{set.title}</strong>
                </span>
              </div>

              {/* Colorful Party Popper Illustration */}
              <div style={{ width: '76px', height: '76px', flexShrink: 0, position: 'relative' }}>
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

            {/* 2-Column Content Layout */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '36px',
                alignItems: 'start',
              }}
            >
              {/* CỘT TRÁI: Tiến độ của bạn */}
              <div>
                <h3
                  className="fc-completion-sub"
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    margin: '0 0 18px 0',
                  }}
                >
                  Tiến độ của bạn
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '22px', marginBottom: '22px' }}>
                  {/* Circular Donut Ring */}
                  <ProgressDonut known={knownCount} learning={learningCount} total={totalDeckCount} />

                  {/* 3 Progress Bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    {/* Đã biết */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '7px 14px',
                        borderRadius: '8px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: '#059669',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        fontSize: '13.5px',
                        fontWeight: 600,
                      }}
                    >
                      <span>Đã biết</span>
                      <span style={{ fontSize: '15px' }}>{knownCount}</span>
                    </div>

                    {/* Đang học */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '7px 14px',
                        borderRadius: '8px',
                        background: 'rgba(249, 115, 22, 0.12)',
                        color: '#ea580c',
                        border: '1px solid rgba(249, 115, 22, 0.25)',
                        fontSize: '13.5px',
                        fontWeight: 600,
                      }}
                    >
                      <span>Đang học</span>
                      <span style={{ fontSize: '15px' }}>{learningCount}</span>
                    </div>

                    {/* Còn lại */}
                    <div className="fc-bar-remaining">
                      <span>Còn lại</span>
                      <span style={{ fontSize: '15px' }}>0</span>
                    </div>
                  </div>
                </div>

                {/* Nút: Quay lại câu hỏi cuối cùng */}
                <button
                  type="button"
                  onClick={handleBackToLastCard}
                  className="fc-link-btn"
                >
                  <ArrowLeft size={16} /> Quay lại câu hỏi cuối cùng
                </button>
              </div>

              {/* CỘT PHẢI: Bước tiếp theo */}
              <div>
                <h3
                  className="fc-completion-sub"
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    margin: '0 0 18px 0',
                  }}
                >
                  Bước tiếp theo
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Nút 1: Ôn luyện với các câu hỏi */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onGoMatch && set) {
                        onGoMatch(set.id);
                      } else {
                        handleResetAll();
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      height: '48px',
                      borderRadius: '999px',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <RefreshCw size={17} /> Ôn luyện với các câu hỏi
                  </button>

                  {/* Nút 2: Tập trung vào học X thẻ */}
                  <button
                    type="button"
                    className="fc-study-learning-btn"
                    onClick={handleStudyLearningCards}
                    disabled={learningCount === 0}
                  >
                    {learningCount > 0 ? (
                      `Tập trung vào học ${learningCount} thẻ`
                    ) : (
                      'Đã nắm vững toàn bộ thẻ! 🎉'
                    )}
                  </button>

                  {/* Nút 3: Đặt lại Thẻ ghi nhớ */}
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="fc-link-btn"
                    style={{
                      justifyContent: 'center',
                      marginTop: '6px',
                      padding: '6px',
                    }}
                  >
                    <RotateCcw size={15} /> Đặt lại Thẻ ghi nhớ
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════════════
              TRƯỜNG HỢP 2: BỘ XEM FLASHCARD ĐANG HỌC (CARD VIEWER)
             ══════════════════════════════════════════════════════════════════ */
          <div className="fc-viewer-container">
            {/* Top Toolbar: Counter + Indicators + Audio + Fullscreen */}
            <div className="fc-viewer-controls">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="fc-counter">
                  {currentIndex + 1} / {activeCards.length}
                </span>

                {/* Live Pill Counts for Known & Learning */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#10b981',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                    }}
                    title="Số từ đã thuộc"
                  >
                    <Check size={12} strokeWidth={3} /> {knownCount}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#f97316',
                      background: 'rgba(249, 115, 22, 0.1)',
                      border: '1px solid rgba(249, 115, 22, 0.25)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                    }}
                    title="Số từ cần học lại"
                  >
                    <X size={12} strokeWidth={3} /> {learningCount}
                  </span>
                </div>
              </div>

              <div className="fc-actions">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => handleSpeak(currentCard.term)}
                  title="Phát âm tiếng Anh"
                >
                  <Volume2 size={18} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={handleToggleFullscreen}
                  title="Toàn màn hình"
                >
                  <Maximize size={18} />
                </button>
              </div>
            </div>

            {/* 3D Flip Card */}
            <div
              className={`fc-card-3d-wrapper ${isFlipped ? 'flipped' : ''}`}
              onClick={flipCard}
              title="Click hoặc nhấn Space để lật thẻ"
            >
              <div className="fc-card-3d-inner">
                {/* Mặt trước */}
                <div className="fc-card-front">
                  <h2 className="fc-term">{currentCard.term}</h2>
                  <div className="fc-hint">Click để lật thẻ</div>
                </div>

                {/* Mặt sau */}
                <div className="fc-card-back">
                  <h2 className="fc-term">{currentCard.term}</h2>
                  <p className="fc-definition">{currentCard.definition}</p>
                  {currentCard.example && (
                    <div className="fc-example">
                      <strong>Ví dụ: </strong>
                      <span>"{currentCard.example}"</span>
                    </div>
                  )}
                  <div className="fc-hint">Click để lật thẻ</div>
                </div>
              </div>
            </div>

            {/* ── BỘ ĐIỀU KHIỂN: NÚT X (Chưa nhớ) | LẬT THẺ | NÚT TICK (Đã nhớ) ── */}
            <div className="fc-nav-controls">
              {/* Nút X: Chưa thuộc (Học lại) */}
              <button
                type="button"
                className="fc-rate-btn fc-rate-btn--wrong"
                onClick={handleMarkLearning}
                title="Chưa nhớ (Cần học lại) - Phím 1 hoặc Mũi tên Trái"
              >
                <X size={28} strokeWidth={2.8} />
              </button>

              {/* Nút giữa: Lật thẻ */}
              <button
                type="button"
                className="fc-rate-btn fc-rate-btn--flip"
                onClick={flipCard}
                title="Lật thẻ - Phím Space hoặc Mũi tên Lên/Xuống"
              >
                <RefreshCw size={20} />
              </button>

              {/* Nút Tick: Đã thuộc */}
              <button
                type="button"
                className="fc-rate-btn fc-rate-btn--correct"
                onClick={handleMarkKnown}
                title="Đã thuộc - Phím 2 hoặc Mũi tên Phải"
              >
                <Check size={28} strokeWidth={2.8} />
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

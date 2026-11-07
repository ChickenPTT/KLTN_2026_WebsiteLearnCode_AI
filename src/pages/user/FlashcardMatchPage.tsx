import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '@/layout/Header';
import { Footer } from '@/layout/Footer';
import type { AuthMode } from '@/types';
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  Trophy,
  BookOpen,
  Binary,
  Database,
  Cpu,
  Code2,
  BrainCircuit,
  Globe,
} from 'lucide-react';
import {
  ALL_FLASHCARD_SETS,
  getFlashcardMatchCards,
  type FlashcardMockSet,
  type CardIcon,
} from '@/data/flashcardMockData';
import type { FlashcardItem } from '@/types';

interface FlashcardMatchPageProps {
  setId?: string;
  customCards?: FlashcardItem[];
  customTitle?: string;
  isMultiSetMode?: boolean;
  onBack: () => void;
  onAuth?: (mode: AuthMode) => void;
  onGoLanding?: () => void;
  onGoTopics?: () => void;
  onGoFlashcards?: () => void;
  onGoFlashcardLibrary?: () => void;
  onGoProfile?: () => void;
  onGoProgress?: () => void;
  onGoHistory?: () => void;
  onGoAdmin?: () => void;
  onGoSettings?: () => void;
  onGoLeague?: () => void;
  onLoggedOut?: () => void;
}

const ICON_MAP: Record<CardIcon, React.ElementType> = {
  Binary,
  Database,
  Cpu,
  Code2,
  BrainCircuit,
  Globe,
};

interface MatchTile {
  tileId: string;
  termId: string;
  type: 'term' | 'definition';
  text: string;
}

// Hàm xáo trộn mảng Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Tạo 12 thẻ (6 thuật ngữ + 6 định nghĩa) cho 1 trang 6 từ
function generateTilesForWords(words: FlashcardItem[], pagePrefix: string): MatchTile[] {
  const tiles: MatchTile[] = [];
  words.forEach((w, idx) => {
    tiles.push({
      tileId: `${pagePrefix}-term-${w.id || idx}`,
      termId: w.id || `term-${idx}`,
      type: 'term',
      text: w.term,
    });
    tiles.push({
      tileId: `${pagePrefix}-def-${w.id || idx}`,
      termId: w.id || `term-${idx}`,
      type: 'definition',
      text: w.definition,
    });
  });
  return shuffleArray(tiles);
}

export function FlashcardMatchPage({
  setId,
  customCards,
  customTitle,
  isMultiSetMode = false,
  onBack,
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
  onGoLeague,
  onLoggedOut,
}: FlashcardMatchPageProps) {
  const set: FlashcardMockSet | undefined = isMultiSetMode
    ? undefined
    : ALL_FLASHCARD_SETS.find((s) => s.id === setId);

  // Danh sách từ vựng: lấy từ customCards nếu là chế độ ôn luyện nhiều bộ,
  // hoặc lấy 12 từ vựng chuẩn của bộ thẻ nếu là chế độ ghép thẻ 1 bộ cũ
  const allWords = useMemo<FlashcardItem[]>(() => {
    if (isMultiSetMode && customCards && customCards.length > 0) {
      return customCards;
    }
    return getFlashcardMatchCards(set);
  }, [isMultiSetMode, customCards, set]);

  // Phân trang: mỗi trang 6 từ vựng (tương ứng 6 cặp = 12 thẻ)
  const WORDS_PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(allWords.length / WORDS_PER_PAGE));

  const getWordsForPage = useCallback(
    (pageNum: number): FlashcardItem[] => {
      const start = (pageNum - 1) * WORDS_PER_PAGE;
      return allWords.slice(start, start + WORDS_PER_PAGE);
    },
    [allWords]
  );

  // Trang hiện tại
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Tiles cho từng trang: Record<number, MatchTile[]>
  const [pageTiles, setPageTiles] = useState<Record<number, MatchTile[]>>({});

  // Các cặp đã ghép thành công cho từng trang: Record<number, Set<string>>
  const [pageMatched, setPageMatched] = useState<Record<number, Set<string>>>({});

  // Thẻ đang được chọn lần 1
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);

  // 2 thẻ ghép sai đang nháy đỏ
  const [wrongTileIds, setWrongTileIds] = useState<string[]>([]);

  // Thống kê & Đồng hồ
  const [seconds, setSeconds] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isGameActive, setIsGameActive] = useState(true);

  // Khởi tạo thẻ cho tất cả các trang khi bắt đầu hoặc bấm chơi lại
  const resetGame = useCallback(() => {
    const newTiles: Record<number, MatchTile[]> = {};
    const newMatched: Record<number, Set<string>> = {};

    for (let p = 1; p <= totalPages; p++) {
      const pWords = getWordsForPage(p);
      newTiles[p] = generateTilesForWords(pWords, `p${p}`);
      newMatched[p] = new Set<string>();
    }

    setPageTiles(newTiles);
    setPageMatched(newMatched);
    setSelectedTileId(null);
    setWrongTileIds([]);
    setSeconds(0);
    setAttempts(0);
    setIsGameActive(true);
    setCurrentPage(1);
  }, [totalPages, getWordsForPage]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Đồng hồ bấm giờ
  useEffect(() => {
    if (!isGameActive) return;
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameActive]);

  // Format mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Dữ liệu trang hiện tại
  const currentWords = getWordsForPage(currentPage);
  const currentTiles = pageTiles[currentPage] || [];
  const currentMatched = pageMatched[currentPage] || new Set<string>();
  const isCurrentPageDone = currentWords.length > 0 && currentMatched.size >= currentWords.length;

  // Kiểm tra toàn bộ các trang đã hoàn thành chưa
  const isAllDone = useMemo(() => {
    if (totalPages === 0) return false;
    for (let p = 1; p <= totalPages; p++) {
      const words = getWordsForPage(p);
      const matched = pageMatched[p];
      if (!matched || matched.size < words.length) return false;
    }
    return true;
  }, [totalPages, getWordsForPage, pageMatched]);

  // Dừng đồng hồ khi hoàn thành toàn bộ tất cả các trang
  useEffect(() => {
    if (isAllDone && isGameActive) {
      setIsGameActive(false);
    }
  }, [isAllDone, isGameActive]);

  // Xử lý khi click vào 1 thẻ
  const handleTileClick = (tile: MatchTile) => {
    // Không cho click nếu thẻ đã ghép xong hoặc đang trong animation báo lỗi
    if (currentMatched.has(tile.termId) || wrongTileIds.length > 0) return;

    // Nếu bấm lại chính thẻ đang chọn -> Bỏ chọn
    if (selectedTileId === tile.tileId) {
      setSelectedTileId(null);
      return;
    }

    // Nếu chưa có thẻ nào được chọn -> Chọn thẻ này
    if (!selectedTileId) {
      setSelectedTileId(tile.tileId);
      return;
    }

    // Đã có thẻ thứ nhất -> Tìm thẻ thứ nhất
    const firstTile = currentTiles.find((t) => t.tileId === selectedTileId);
    if (!firstTile) {
      setSelectedTileId(tile.tileId);
      return;
    }

    setAttempts((prev) => prev + 1);

    // Kiểm tra MATCH: Cùng termId nhưng khác loại (1 term + 1 definition)
    if (firstTile.termId === tile.termId && firstTile.type !== tile.type) {
      // Ghép đúng!
      setPageMatched((prev) => {
        const nextSet = new Set(prev[currentPage] || []);
        nextSet.add(tile.termId);
        return {
          ...prev,
          [currentPage]: nextSet,
        };
      });
      setSelectedTileId(null);
    } else {
      // Ghép sai! Báo đỏ và rung trong 500ms
      setWrongTileIds([firstTile.tileId, tile.tileId]);
      setTimeout(() => {
        setWrongTileIds([]);
        setSelectedTileId(null);
      }, 500);
    }
  };

  const displayTitle = isMultiSetMode
    ? (customTitle || `Ôn luyện ngẫu nhiên (${allWords.length} từ)`)
    : `Ghép thẻ: ${set?.title || 'Bộ từ vựng'}`;

  return (
    <div className="page-shell">
      <Header
        activeView="flashcards"
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
        onGoLeague={onGoLeague}
        onLoggedOut={onLoggedOut}
      />

      <main className="fc-match-shell">
        {/* ── TOP CONTROLS BAR ── */}
        <div className="fc-match-topbar">
          <div className="fc-match-title-group">
            <h1 className="fc-match-page-title">
              {displayTitle}
            </h1>
          </div>

          {/* Stats: Đồng hồ & Tiến độ & Nút Chơi lại */}
          <div className="fc-match-stats-group">
            <div className="fc-match-timer-pill" title="Thời gian chơi">
              <Clock size={15} />
              <span>{formatTime(seconds)}</span>
            </div>
            <div className="fc-match-progress-pill" title="Tiến độ trang hiện tại">
              <CheckCircle2 size={15} />
              <span>Trang {currentPage}/{totalPages}: {currentMatched.size}/{currentWords.length} cặp</span>
            </div>
            <button
              type="button"
              className="fc-match-reset-btn"
              onClick={resetGame}
              title="Xáo trộn và chơi lại từ đầu"
            >
              <RotateCcw size={14} /> Chơi lại
            </button>
          </div>
        </div>

        {/* ── MAIN CONTENT AREA ── */}
        {isAllDone ? (
          /* TRƯỜNG HỢP: HOÀN THÀNH TOÀN BỘ TẤT CẢ CÁC TRANG */
          <div className="fc-match-victory-box">
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Trophy size={36} />
            </div>
            <h2 className="fc-completion-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
              Xuất sắc! Bạn đã ghép thành công tất cả thẻ!
            </h2>
            <p className="fc-completion-sub" style={{ fontSize: '15px', marginBottom: '24px' }}>
              Bạn đã hoàn thành ghép cả {totalPages} trang ({allWords.length} từ vựng) trong thời gian <strong>{formatTime(seconds)}</strong> với <strong>{attempts}</strong> lượt ghép.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="fc-match-reset-btn"
                style={{
                  padding: '12px 24px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: 700,
                  background: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                }}
                onClick={resetGame}
              >
                <RotateCcw size={16} /> Chơi lại lần nữa
              </button>
              <button
                type="button"
                className="fc-link-btn"
                style={{
                  padding: '12px 24px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: '1px solid var(--border-color, #e2e8f0)',
                }}
                onClick={onBack}
              >
                {isMultiSetMode ? 'Quay lại Khám phá' : 'Quay lại bộ thẻ'}
              </button>
            </div>
          </div>
        ) : isCurrentPageDone ? (
          /* TRƯỜNG HỢP: HOÀN THÀNH TRANG HIỆN TẠI (CHƯA XONG TOÀN BỘ CÁC TRANG) */
          <div className="fc-match-victory-box">
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h2 className="fc-completion-title" style={{ fontSize: '24px', marginBottom: '8px' }}>
              Tuyệt vời! Đã hoàn thành {currentWords.length}/{currentWords.length} cặp của Trang {currentPage}!
            </h2>
            <p className="fc-completion-sub" style={{ fontSize: '14.5px', marginBottom: '20px' }}>
              {currentPage < totalPages
                ? `Hãy chuyển sang Trang ${currentPage + 1} để tiếp tục thử thách ${getWordsForPage(currentPage + 1).length} từ tiếp theo.`
                : 'Bạn có thể chuyển về các trang trước để hoàn thành nếu còn từ chưa ghép.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {currentPage < totalPages ? (
                <button
                  type="button"
                  className="fc-match-reset-btn"
                  style={{
                    padding: '10px 22px',
                    borderRadius: '999px',
                    background: '#3b82f6',
                    color: '#ffffff',
                    fontWeight: 700,
                    border: 'none',
                  }}
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                    setSelectedTileId(null);
                    setWrongTileIds([]);
                  }}
                >
                  Sang Trang {currentPage + 1} tiếp tục →
                </button>
              ) : (
                <button
                  type="button"
                  className="fc-match-reset-btn"
                  style={{
                    padding: '10px 22px',
                    borderRadius: '999px',
                    background: '#3b82f6',
                    color: '#ffffff',
                    fontWeight: 700,
                    border: 'none',
                  }}
                  onClick={() => {
                    for (let p = 1; p <= totalPages; p++) {
                      if ((pageMatched[p]?.size || 0) < getWordsForPage(p).length) {
                        setCurrentPage(p);
                        break;
                      }
                    }
                    setSelectedTileId(null);
                    setWrongTileIds([]);
                  }}
                >
                  Chuyển đến trang còn từ chưa ghép
                </button>
              )}
              <button
                type="button"
                className="fc-match-reset-btn"
                style={{ padding: '10px 20px', borderRadius: '999px' }}
                onClick={() => {
                  setPageTiles((prev) => ({
                    ...prev,
                    [currentPage]: generateTilesForWords(currentWords, `p${currentPage}`),
                  }));
                  setPageMatched((prev) => ({
                    ...prev,
                    [currentPage]: new Set<string>(),
                  }));
                  setSelectedTileId(null);
                  setWrongTileIds([]);
                }}
              >
                <RotateCcw size={15} /> Chơi lại trang này
              </button>
            </div>
          </div>
        ) : (
          /* ── GRID THẺ GHÉP CỦA TRANG HIỆN TẠI (4 CỘT x 3 HÀNG) ── */
          <div className="fc-match-grid">
            {currentTiles.map((tile) => {
              const isMatched = currentMatched.has(tile.termId);
              const isSelected = selectedTileId === tile.tileId;
              const isWrong = wrongTileIds.includes(tile.tileId);

              let tileClass = 'fc-match-tile';
              if (isMatched) tileClass += ' is-matched';
              if (isSelected) tileClass += ' is-selected';
              if (isWrong) tileClass += ' is-wrong';

              return (
                <div
                  key={tile.tileId}
                  className={tileClass}
                  onClick={() => handleTileClick(tile)}
                >
                  <span>{tile.text}</span>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

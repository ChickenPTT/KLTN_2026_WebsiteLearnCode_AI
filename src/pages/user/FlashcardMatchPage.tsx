import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '@/layout/Header';
import { Footer } from '@/layout/Footer';
import type { AuthMode } from '@/types';
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  Trophy,
  ChevronLeft,
  ChevronRight,
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
  setId: string;
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
  onLoggedOut,
}: FlashcardMatchPageProps) {
  const set: FlashcardMockSet | undefined = ALL_FLASHCARD_SETS.find((s) => s.id === setId);
  const IconComp = set ? ICON_MAP[set.iconName] || Code2 : Code2;

  // Lấy 12 từ vựng chuẩn (chia thành 2 trang x 6 từ)
  const all12Words = useMemo(() => {
    return getFlashcardMatchCards(set);
  }, [set]);

  const page1Words = useMemo(() => all12Words.slice(0, 6), [all12Words]);
  const page2Words = useMemo(() => all12Words.slice(6, 12), [all12Words]);

  // Phân trang: 1 hoặc 2
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);

  // Tiles cho từng trang
  const [tilesP1, setTilesP1] = useState<MatchTile[]>([]);
  const [tilesP2, setTilesP2] = useState<MatchTile[]>([]);

  // Các cặp đã ghép thành công
  const [matchedP1, setMatchedP1] = useState<Set<string>>(new Set());
  const [matchedP2, setMatchedP2] = useState<Set<string>>(new Set());

  // Thẻ đang được chọn lần 1
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);

  // 2 thẻ ghép sai đang nháy đỏ
  const [wrongTileIds, setWrongTileIds] = useState<string[]>([]);

  // Thống kê & Đồng hồ
  const [seconds, setSeconds] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isGameActive, setIsGameActive] = useState(true);

  // Khởi tạo thẻ cho 2 trang khi tải trang hoặc ấn chơi lại
  const resetGame = useCallback(() => {
    setTilesP1(generateTilesForWords(page1Words, 'p1'));
    setTilesP2(generateTilesForWords(page2Words, 'p2'));
    setMatchedP1(new Set());
    setMatchedP2(new Set());
    setSelectedTileId(null);
    setWrongTileIds([]);
    setSeconds(0);
    setAttempts(0);
    setIsGameActive(true);
    setCurrentPage(1);
  }, [page1Words, page2Words]);

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

  // Trang hiện tại
  const currentTiles = currentPage === 1 ? tilesP1 : tilesP2;
  const currentMatched = currentPage === 1 ? matchedP1 : matchedP2;
  const isCurrentPageDone = currentMatched.size >= 6;
  const isAllDone = matchedP1.size >= 6 && matchedP2.size >= 6;

  // Dừng đồng hồ khi hoàn thành toàn bộ 2 trang
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
      if (currentPage === 1) {
        setMatchedP1((prev) => new Set(prev).add(tile.termId));
      } else {
        setMatchedP2((prev) => new Set(prev).add(tile.termId));
      }
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
        onLoggedOut={onLoggedOut}
      />

      <main className="fc-match-shell">
        {/* ── TOP CONTROLS BAR ── */}
        <div className="fc-match-topbar">
          <div className="fc-match-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="fc-match-page-title">
                Ghép thẻ: {set?.title || 'Bộ từ vựng'}
              </h1>
            </div>
          </div>

          {/* Stats: Đồng hồ & Tiến độ & Nút Chơi lại */}
          <div className="fc-match-stats-group">
            <div className="fc-match-timer-pill" title="Thời gian chơi">
              <Clock size={15} />
              <span>{formatTime(seconds)}</span>
            </div>
            <div className="fc-match-progress-pill" title="Tiến độ trang hiện tại">
              <CheckCircle2 size={15} />
              <span>Trang {currentPage}: {currentMatched.size}/6 cặp</span>
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
          /* TRƯỜNG HỢP: HOÀN THÀNH TOÀN BỘ CẢ 2 TRANG (12 TỪ) */
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
              Bạn đã hoàn thành ghép cả 2 trang (12 từ vựng) trong thời gian <strong>{formatTime(seconds)}</strong> với <strong>{attempts}</strong> lượt ghép.
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
                Quay lại bộ thẻ
              </button>
            </div>
          </div>
        ) : isCurrentPageDone ? (
          /* TRƯỜNG HỢP: HOÀN THÀNH TRANG HIỆN TẠI (CHƯA XONG TRANG CÒN LẠI) */
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
              Tuyệt vời! Đã hoàn thành 6/6 từ của Trang {currentPage}!
            </h2>
            <p className="fc-completion-sub" style={{ fontSize: '14.5px', marginBottom: '20px' }}>
              {currentPage === 1
                ? 'Hãy chuyển sang Trang 2 để tiếp tục thử thách 6 từ tiếp theo.'
                : 'Bạn có thể chuyển về Trang 1 để hoàn thành nếu còn từ chưa ghép.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
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
                  setCurrentPage(currentPage === 1 ? 2 : 1);
                  setSelectedTileId(null);
                  setWrongTileIds([]);
                }}
              >
                {currentPage === 1 ? 'Sang Trang 2 tiếp tục →' : 'Quay lại Trang 1'}
              </button>
              <button
                type="button"
                className="fc-match-reset-btn"
                style={{ padding: '10px 20px', borderRadius: '999px' }}
                onClick={() => {
                  if (currentPage === 1) {
                    setTilesP1(generateTilesForWords(page1Words, 'p1'));
                    setMatchedP1(new Set());
                  } else {
                    setTilesP2(generateTilesForWords(page2Words, 'p2'));
                    setMatchedP2(new Set());
                  }
                  setSelectedTileId(null);
                  setWrongTileIds([]);
                }}
              >
                <RotateCcw size={15} /> Chơi lại trang này
              </button>
            </div>
          </div>
        ) : (
          /* ── GRID 12 THẺ (4 CỘT x 3 HÀNG TRÊN MÁY TÍNH | 3 CỘT x 4 HÀNG TRÊN ĐIỆN THOẠI) ── */
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

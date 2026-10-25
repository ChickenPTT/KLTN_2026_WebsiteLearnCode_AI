import { useState, useEffect } from 'react';
import { Header } from '@/layout/Header';
import { Footer } from '@/layout/Footer';
import type { AuthMode } from '@/types';
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  Trophy,
} from 'lucide-react';
import {
  quizApi,
  type GridCell as BackendGridCell,
  type RoundResponse as BackendRoundResponse,
  type QuizResultResponse as BackendQuizResultResponse,
} from '@/lib/api';

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

interface MatchTile {
  tileId: string;
  termId: number;
  type: 'term' | 'definition';
  text: string;
}

// Convert backend GridCell to MatchTile
function backendCellToTile(cell: BackendGridCell): MatchTile {
  return {
    tileId: cell.cellId,
    termId: cell.termId,
    type: cell.cellType === 'TERM' ? 'term' : 'definition',
    text: cell.displayText,
  };
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
  const backendDeckId = Number(setId);
  const deckTitle = setId ? `Deck #${setId}` : 'Bộ từ vựng';

  // Quiz state from backend
  const [round, setRound] = useState<BackendRoundResponse | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Current tiles for display
  const [tiles, setTiles] = useState<MatchTile[]>([]);
  const [matchedTermIds, setMatchedTermIds] = useState<Set<number>>(new Set());

  // Selected tile
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [wrongTileIds, setWrongTileIds] = useState<string[]>([]);

  // Timer
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);

  // Quiz result
  const [quizResult, setQuizResult] = useState<BackendQuizResultResponse | null>(null);

  // Start quiz on mount
  useEffect(() => {
    if (!backendDeckId) {
      setError('Không tìm thấy bộ flashcard.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    quizApi.startQuiz('BY_DECK', backendDeckId)
      .then(response => {
        if (!cancelled) {
          setRound(response);
          setSessionId(response.sessionId);
          setTiles(response.cells.map(backendCellToTile));
          setTimeRemaining(response.timeRemaining);
          setIsGameActive(true);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Không thể bắt đầu quiz. Vui lòng thử lại.');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [backendDeckId]);

  // Timer countdown
  useEffect(() => {
    if (!isGameActive) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameActive]);

  // Update timer from backend response
  useEffect(() => {
    if (round) {
      setTimeRemaining(round.timeRemaining);
    }
  }, [round]);

  // Format time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handle tile click
  const handleTileClick = async (tile: MatchTile) => {
    if (matchedTermIds.has(tile.termId) || wrongTileIds.length > 0 || !sessionId) return;

    // Deselect if clicking same tile
    if (selectedTileId === tile.tileId) {
      setSelectedTileId(null);
      return;
    }

    // First selection
    if (!selectedTileId) {
      setSelectedTileId(tile.tileId);
      return;
    }

    // Second selection — submit pair to backend
    const firstTile = tiles.find((t) => t.tileId === selectedTileId);
    if (!firstTile) {
      setSelectedTileId(tile.tileId);
      return;
    }

    try {
      const result = await quizApi.submitPair(sessionId, selectedTileId, tile.tileId);

      if (result.correct) {
        // Correct match
        setMatchedTermIds(prev => new Set(prev).add(tile.termId));
        setSelectedTileId(null);

        // Update progress from backend
        if (round) {
          setRound(prev => prev ? { ...prev, matchedPairs: result.matchedPairs, timeRemaining: result.timeRemaining } : null);
        }
      } else {
        // Wrong match — show red flash
        setWrongTileIds([firstTile.tileId, tile.tileId]);
        setTimeout(() => {
          setWrongTileIds([]);
          setSelectedTileId(null);
        }, 500);
      }

      // Kiểm tra hết round cho CẢ trường hợp sai: khi hết giờ backend trả correct=false + roundCompleted=true,
      // nếu chỉ xét trong nhánh đúng thì người chơi bị kẹt ở round đã hết giờ.
      if (result.roundCompleted) {
        if (result.quizCompleted) {
          // Quiz finished — fetch result
          setIsGameActive(false);
          const qr = await quizApi.getQuizResult(sessionId);
          setQuizResult(qr);
        } else {
          // Move to next round
          const nextRound = await quizApi.getNextRound(sessionId);
          setRound(nextRound);
          setTiles(nextRound.cells.map(backendCellToTile));
          setMatchedTermIds(new Set());
          setSelectedTileId(null);
          setWrongTileIds([]);
          setIsGameActive(true);
        }
      }
    } catch (err) {
      console.error('Lỗi khi gửi cặp:', err);
      setSelectedTileId(null);
    }
  };

  // Restart quiz
  const handleRestart = () => {
    setQuizResult(null);
    setMatchedTermIds(new Set());
    setSelectedTileId(null);
    setWrongTileIds([]);
    setSessionId(null);
    setRound(null);
    setTiles([]);
    if (backendDeckId) {
      setLoading(true);
      quizApi.startQuiz('BY_DECK', backendDeckId)
        .then(response => {
          setRound(response);
          setSessionId(response.sessionId);
          setTiles(response.cells.map(backendCellToTile));
          setTimeRemaining(response.timeRemaining);
          setIsGameActive(true);
          setLoading(false);
        })
        .catch(() => {
          setError('Không thể bắt đầu quiz.');
          setLoading(false);
        });
    }
  };

  const totalPairs = round?.totalPairs ?? 0;
  const matchedCount = round?.matchedPairs ?? matchedTermIds.size;
  const isAllDone = quizResult !== null;

  if (loading) {
    return (
      <div className="page-shell">
        <Header activeView="flashcards" />
        <main style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Đang tải quiz...</h2>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <Header activeView="flashcards" onGoLanding={onGoLanding} onGoAuth={onAuth} onGoTopics={onGoTopics} onGoFlashcards={onGoFlashcards} onGoFlashcardLibrary={onGoFlashcardLibrary} onGoProfile={onGoProfile} onGoProgress={onGoProgress} onGoHistory={onGoHistory} onGoAdmin={onGoAdmin} onGoSettings={onGoSettings} onLoggedOut={onLoggedOut} />
        <main style={{ padding: '40px', textAlign: 'center' }}>
          <h2>{error}</h2>
          <button onClick={onBack} className="secondary-button" style={{ marginTop: '16px' }}>
            Quay lại
          </button>
        </main>
        <Footer />
      </div>
    );
  }

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
                Ghép thẻ: {deckTitle}
              </h1>
            </div>
          </div>

          {/* Stats: Đồng hồ & Tiến độ & Nút Chơi lại */}
          <div className="fc-match-stats-group">
            <div className="fc-match-timer-pill" title="Thời gian còn lại">
              <Clock size={15} />
              <span>{formatTime(timeRemaining)}</span>
            </div>
            <div className="fc-match-progress-pill" title="Tiến độ">
              <CheckCircle2 size={15} />
              <span>Round {round?.roundNumber ?? '?'}/{round?.totalRounds ?? '?'}: {matchedCount}/{totalPairs} cặp</span>
            </div>
            <button
              type="button"
              className="fc-match-reset-btn"
              onClick={handleRestart}
              title="Chơi lại từ đầu"
            >
              <RotateCcw size={14} /> Chơi lại
            </button>
          </div>
        </div>

        {/* ── MAIN CONTENT AREA ── */}
        {isAllDone ? (
          /* TRƯỜNG HỢP: HOÀN THÀNH QUIZ */
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
              Xuất sắc! Bạn đã hoàn thành quiz!
            </h2>
            <p className="fc-completion-sub" style={{ fontSize: '15px', marginBottom: '24px' }}>
              Điểm: <strong>{quizResult?.totalScore ?? 0}</strong> / <strong>{quizResult?.totalPairs ?? 0}</strong> cặp đúng trong <strong>{quizResult?.totalRounds ?? 0}</strong> round.
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
                onClick={handleRestart}
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
        ) : (
          /* ── GRID THẺ ── */
          <div className="fc-match-grid">
            {tiles.map((tile) => {
              const isMatched = matchedTermIds.has(tile.termId);
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

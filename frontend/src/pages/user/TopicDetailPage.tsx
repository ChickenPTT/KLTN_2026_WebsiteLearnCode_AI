import { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Play,
  Code2,
  ChevronLeft,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  AlignJustify,
  ArrowDownWideNarrow,
  KeyRound,
  Layers,
  Link2,
  ListOrdered,
  MoveHorizontal,
  Repeat,
  Share2,
  TreePine,
  Type,
  CheckCircle2,
  Clock,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react';
import {
  type TopicInfo,
  type AuthMode,
  type SkillLevel,
  LEVEL_COLORS,
  LEVEL_LABELS,
  LEVEL_ORDER,
} from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { usePublishedProblems } from '@/hooks/usePublishedProblems';
import { useSubmissionStatus } from '@/hooks/useSubmissionStatus';
import { sameTopic } from '@/lib/problemsApi';
import { normalizeDifficulty } from '@/lib/difficulty';
import { Pagination } from '@/components/Pagination';
import { LoginModal } from '@/components/LoginModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/layout/Header';
import { Footer } from '@/layout/Footer';

const ICON_MAP: Record<string, LucideIcon> = {
  ListOrdered,
  Type,
  KeyRound,
  MoveHorizontal,
  Link2,
  Layers,
  AlignJustify,
  Repeat,
  ArrowDownWideNarrow,
  Search,
  TreePine,
  Share2,
};

const LEVEL_WEIGHT: Record<SkillLevel, number> = {
  beginner: 1,
  basic: 2,
  intermediate: 3,
  advanced: 4,
  expert: 5,
};

const ITEMS_PER_PAGE = 6;

interface TopicDetailPageProps {
  topic: TopicInfo;
  onBack: () => void;
  onGoPractice: (problemId: string) => void;
  onGoLanding: () => void;
  onGoAuth: (mode: AuthMode) => void;
  onGoTopics: () => void;
  onGoProfile?: () => void;
  onGoProgress?: () => void;
  onGoAdmin?: () => void;
  onGoSettings?: () => void;
  onGoLeague?: () => void;
  onLoggedOut?: () => void;
  onGoFlashcards?: () => void;
  onGoFlashcardLibrary?: () => void;
}

export function TopicDetailPage({
  topic,
  onBack,
  onGoPractice,
  onGoLanding,
  onGoAuth,
  onGoTopics,
  onGoProfile,
  onGoProgress,
  onGoAdmin,
  onGoSettings,
  onGoLeague,
  onLoggedOut,
  onGoFlashcards,
  onGoFlashcardLibrary,
}: TopicDetailPageProps) {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState<'all' | SkillLevel>('all');
  const [sortOrder, setSortOrder] = useState<'default' | 'name' | 'diff-asc' | 'diff-desc'>('default');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Trinh do tu danh gia cua hoc vien cho chu de nay (lay tu backend, khong doc localStorage)
  const { getSelfAssessment } = useAuth();
  const [userTopicLevel, setUserTopicLevel] = useState<SkillLevel | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    getSelfAssessment()
      .then((scores) => {
        if (!cancelled) setUserTopicLevel(scores.find((s) => sameTopic(s.topic, topic.name))?.level);
      })
      .catch(() => {
        if (!cancelled) setUserTopicLevel(undefined);
      });
    return () => {
      cancelled = true;
    };
  }, [getSelfAssessment, topic.name]);

  const TopicIcon = ICON_MAP[topic.icon] ?? Code2;

  const { problems, loading, error, reload } = usePublishedProblems();
  const submissionMap = useSubmissionStatus();
  const allProblems = useMemo(() => problems.filter((p) => sameTopic(p.topic, topic.name)), [problems, topic]);
  // Dem tu du lieu that (topic co the duoc khoi phuc tu URL voi so lieu mau)
  const difficultyCounts = useMemo(() => {
    const counts: Record<SkillLevel, number> = { beginner: 0, basic: 0, intermediate: 0, advanced: 0, expert: 0 };
    allProblems.forEach((p) => {
      counts[p.difficulty] += 1;
    });
    return counts;
  }, [allProblems]);

  // Filtering & Sorting
  const filteredProblems = useMemo(() => {
    return allProblems
      .filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase());
        const pDiff = normalizeDifficulty(p.difficulty) || p.difficulty;
        const matchesDiff = diffFilter === 'all' || pDiff === diffFilter;
        return matchesSearch && matchesDiff;
      })
      .sort((a, b) => {
        const aDiff = (normalizeDifficulty(a.difficulty) || a.difficulty) as SkillLevel;
        const bDiff = (normalizeDifficulty(b.difficulty) || b.difficulty) as SkillLevel;
        if (sortOrder === 'name') return a.title.localeCompare(b.title);
        if (sortOrder === 'diff-asc') return (LEVEL_WEIGHT[aDiff] ?? 3) - (LEVEL_WEIGHT[bDiff] ?? 3);
        if (sortOrder === 'diff-desc') return (LEVEL_WEIGHT[bDiff] ?? 3) - (LEVEL_WEIGHT[aDiff] ?? 3);
        return 0;
      });
  }, [allProblems, search, diffFilter, sortOrder]);

  // Pagination Math
  const totalPages = Math.ceil(filteredProblems.length / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProblems = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredProblems.slice(start, start + pageSize);
  }, [filteredProblems, safeCurrentPage, pageSize]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  return (
    <div className="site-shell">
      <Header
        onGoLanding={onGoLanding}
        onGoAuth={onGoAuth}
        onGoTopics={onGoTopics}
        onGoFlashcards={onGoFlashcards}
        onGoFlashcardLibrary={onGoFlashcardLibrary}
        onGoProfile={onGoProfile}
        onGoProgress={onGoProgress}
        onGoAdmin={onGoAdmin}
        onGoSettings={onGoSettings}
        onGoLeague={onGoLeague}
        onLoggedOut={onLoggedOut}
      />

      <main className="topic-detail-main">
        <ErrorBoundary fallbackTitle="Không thể tải chi tiết chủ đề" onReset={onBack}>
        {/* Top navigation back button */}
        <div className="topic-detail-nav">
          <button
            type="button"
            className="topic-detail-back-btn"
            onClick={onBack}
            title="Quay lại danh sách các chủ đề"
          >
            <ArrowLeft size={16} /> Danh sách chủ đề
          </button>
        </div>

        {/* Hero Header */}
        <div className="topic-detail-hero">
          <div className="topic-detail-hero-icon">
            <TopicIcon size={32} strokeWidth={1.7} />
          </div>
          <div className="topic-detail-hero-text">
            <div className="topic-detail-eyebrow">Chủ đề luyện tập</div>
            <h1>{topic.name}</h1>
            <p>{topic.description}</p>
            <div className="topic-detail-stats-pills">
              <span className="stat-pill total">
                <Code2 size={14} /> {allProblems.length} bài tập
              </span>
              {(['beginner', 'basic', 'intermediate', 'advanced', 'expert'] as SkillLevel[]).map((lvl) => {
                const count = difficultyCounts[lvl];
                if (count === 0) return null;
                return (
                  <span
                    key={lvl}
                    className="stat-pill"
                    style={{
                      color: LEVEL_COLORS[lvl],
                      borderColor: `${LEVEL_COLORS[lvl]}44`,
                      background: `${LEVEL_COLORS[lvl]}15`,
                    }}
                  >
                    {LEVEL_LABELS[lvl]}: {count}
                  </span>
                );
              })}
              {userTopicLevel && (
                <span
                  className="stat-pill user-level"
                  style={{
                    color: LEVEL_COLORS[userTopicLevel],
                    borderColor: LEVEL_COLORS[userTopicLevel],
                    background: `${LEVEL_COLORS[userTopicLevel]}22`,
                    fontWeight: 600,
                  }}
                >
                  Trình độ của bạn: {LEVEL_LABELS[userTopicLevel]}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="topic-controls-bar">
          {/* Search Box */}
          <div className="topic-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm bài tập..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Difficulty Filter Tabs */}
          <div className="topic-filter-tabs">
            <Filter size={14} className="filter-icon" />
            <button
              className={`filter-tab ${diffFilter === 'all' ? 'is-active' : ''}`}
              onClick={() => {
                setDiffFilter('all');
                setCurrentPage(1);
              }}
            >
              Tất cả
            </button>
            {LEVEL_ORDER.map((lvl) => (
              <button
                key={lvl}
                className={`filter-tab ${diffFilter === lvl ? 'is-active' : ''}`}
                style={
                  diffFilter === lvl
                    ? {
                        borderColor: LEVEL_COLORS[lvl],
                        color: LEVEL_COLORS[lvl],
                        backgroundColor: `${LEVEL_COLORS[lvl]}18`,
                      }
                    : undefined
                }
                onClick={() => {
                  setDiffFilter(lvl);
                  setCurrentPage(1);
                }}
              >
                {LEVEL_LABELS[lvl]}
                {userTopicLevel === lvl && (
                  <span
                    style={{
                      marginLeft: '6px',
                      fontSize: '10px',
                      padding: '1px 5px',
                      borderRadius: '10px',
                      background: LEVEL_COLORS[lvl],
                      color: '#fff',
                    }}
                  >
                    Phù hợp
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sort Select */}
          <div className="topic-sort-wrap">
            <SlidersHorizontal size={14} className="sort-icon" />
            <select
              className="topic-sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
            >
              <option value="default">Sắp xếp: Mặc định</option>
              <option value="name">Tên bài A-Z</option>
              <option value="diff-asc">Độ khó: Thấp đến Cao</option>
              <option value="diff-desc">Độ khó: Cao đến Thấp</option>
            </select>
          </div>
        </div>

        {/* Problem Grid */}
        <div className="topic-problems-container">
          {loading ? (
            <div className="empty-problems-state">
              <Clock size={40} strokeWidth={1.2} />
              <h3>Đang tải bài tập...</h3>
            </div>
          ) : error ? (
            <div className="empty-problems-state">
              <Code2 size={40} strokeWidth={1.2} />
              <h3>Không tải được bài tập</h3>
              <p>{error}</p>
              <button className="assessment-ghost" onClick={reload}>Thử lại</button>
            </div>
          ) : allProblems.length === 0 ? (
            <div className="empty-problems-state">
              <Code2 size={40} strokeWidth={1.2} />
              <h3>Chưa có bài tập nào cho chủ đề này</h3>
              <p>Giảng viên chưa xuất bản bài tập thuộc chủ đề {topic.name}.</p>
            </div>
          ) : paginatedProblems.length === 0 ? (
            <div className="empty-problems-state">
              <Code2 size={40} strokeWidth={1.2} />
              <h3>Không tìm thấy bài tập phù hợp</h3>
              <p>Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc độ khó khác.</p>
            </div>
          ) : (
            <div className="topic-problems-grid">
              {paginatedProblems.map((p) => {
                const subStatus = submissionMap.get(p.id);

                return (
                  <article
                    key={p.id}
                    className={`problem-item-card ${subStatus ? `is-${subStatus}` : ''}`}
                  >
                    <div className="problem-item-head">
                      <div className="problem-item-title-wrap">
                        <Code2 size={18} className="problem-code-icon" />
                        <h3 className="problem-item-title">{p.title}</h3>
                        {subStatus === 'passed' && (
                          <span className="problem-status-badge passed">
                            <CheckCircle2 size={11} /> Đã luyện
                          </span>
                        )}
                        {subStatus === 'failed' && (
                          <span className="problem-status-badge failed">
                            <Clock size={11} /> Chưa đạt
                          </span>
                        )}
                      </div>
                      <span
                        className="problem-diff-badge"
                        style={{
                          color: LEVEL_COLORS[normalizeDifficulty(p.difficulty) || p.difficulty] || '#5e8dfa',
                          backgroundColor: `${LEVEL_COLORS[normalizeDifficulty(p.difficulty) || p.difficulty] || '#5e8dfa'}15`,
                          borderColor: `${LEVEL_COLORS[normalizeDifficulty(p.difficulty) || p.difficulty] || '#5e8dfa'}40`,
                        }}
                      >
                        {LEVEL_LABELS[normalizeDifficulty(p.difficulty) || p.difficulty] || p.difficulty}
                      </span>
                    </div>

                    <p className="problem-item-desc">{p.description}</p>

                    <div className="problem-item-footer">
                      <span className="problem-topic-tag">{p.topic}</span>
                      <button
                        className={`assessment-primary problem-action-btn ${
                          subStatus === 'passed' ? 'btn-passed' : ''
                        }`}
                        onClick={() => {
                          if (!isLoggedIn) {
                            setShowLoginModal(true);
                            return;
                          }
                          onGoPractice(p.id);
                        }}
                      >
                        {subStatus === 'passed' ? (
                          <>
                            <RotateCcw size={12} /> Luyện lại
                          </>
                        ) : subStatus === 'failed' ? (
                          <>
                            <Play size={12} /> Thử lại
                          </>
                        ) : (
                          <>
                            <Play size={12} /> Luyện bài này
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination Section */}
        {filteredProblems.length > 0 && (
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredProblems.length}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        )}
        </ErrorBoundary>
      </main>

      <Footer />

      {/* ── Modal yêu cầu đăng nhập ── */}
      <LoginModal
        isOpen={showLoginModal}
        actionLabel="Luyện bài"
        onLogin={(mode) => {
          setShowLoginModal(false);
          onGoAuth(mode);
        }}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}

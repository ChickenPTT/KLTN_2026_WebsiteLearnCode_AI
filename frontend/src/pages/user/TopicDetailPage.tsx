import { useState, useMemo } from 'react';
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
import { PRACTICE_PROBLEMS, type PracticeProblem, type TopicInfo, type AuthMode } from '@/types';
import { MOCK_SUBMISSIONS } from '@/data/userMockData';
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

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#f43f5e',
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
  onLoggedOut?: () => void;
}

// Helper to get exact practice problems for a topic
function getTopicProblems(topic: TopicInfo): PracticeProblem[] {
  return PRACTICE_PROBLEMS.filter(
    (p) => p.topic.toLowerCase() === topic.name.toLowerCase() && p.isPublic !== false
  );
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
  onLoggedOut,
}: TopicDetailPageProps) {
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [sortOrder, setSortOrder] = useState<'default' | 'name' | 'diff-asc' | 'diff-desc'>('default');
  const [currentPage, setCurrentPage] = useState(1);

  const TopicIcon = ICON_MAP[topic.icon] ?? Code2;

  const allProblems = useMemo(() => getTopicProblems(topic), [topic]);

  // Filtering & Sorting
  const filteredProblems = useMemo(() => {
    return allProblems
      .filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase());
        const matchesDiff = diffFilter === 'All' || p.difficulty === diffFilter;
        return matchesSearch && matchesDiff;
      })
      .sort((a, b) => {
        if (sortOrder === 'name') return a.title.localeCompare(b.title);
        const weight = { Easy: 1, Medium: 2, Hard: 3 };
        if (sortOrder === 'diff-asc') return weight[a.difficulty] - weight[b.difficulty];
        if (sortOrder === 'diff-desc') return weight[b.difficulty] - weight[a.difficulty];
        return 0;
      });
  }, [allProblems, search, diffFilter, sortOrder]);

  // Pagination Math
  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE) || 1;
  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProblems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProblems, currentPage]);

  // Submission status mapping
  const submissionMap = useMemo(() => {
    const map = new Map<string, 'passed' | 'failed'>();
    MOCK_SUBMISSIONS.forEach((sub) => {
      map.set(sub.problem.toLowerCase(), sub.status);
    });
    return map;
  }, []);

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
        onGoProfile={onGoProfile}
        onGoProgress={onGoProgress}
        onGoAdmin={onGoAdmin}
        onGoSettings={onGoSettings}
        onLoggedOut={onLoggedOut}
      />

      <main className="topic-detail-main">
        {/* Top navigation back button */}
        <div className="topic-detail-nav">
          <button className="topic-detail-back-btn" onClick={onBack}>
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
                <Code2 size={14} /> {topic.problemCount} bài tập
              </span>
              <span className="stat-pill easy">
                Cơ bản: {topic.difficulties.easy}
              </span>
              <span className="stat-pill medium">
                Trung bình: {topic.difficulties.medium}
              </span>
              <span className="stat-pill hard">
                Nâng cao: {topic.difficulties.hard}
              </span>
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
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map((lvl) => (
              <button
                key={lvl}
                className={`filter-tab ${diffFilter === lvl ? 'is-active' : ''}`}
                onClick={() => {
                  setDiffFilter(lvl);
                  setCurrentPage(1);
                }}
              >
                {lvl === 'All'
                  ? 'Tất cả'
                  : lvl === 'Easy'
                  ? 'Cơ bản'
                  : lvl === 'Medium'
                  ? 'Trung bình'
                  : 'Nâng cao'}
              </button>
            ))}
          </div>

          {/* Sort Select */}
          <div className="topic-sort-wrap">
            <SlidersHorizontal size={14} className="sort-icon" />
            <select
              className="topic-sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
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
          {paginatedProblems.length === 0 ? (
            <div className="empty-problems-state">
              <Code2 size={40} strokeWidth={1.2} />
              <h3>Không tìm thấy bài tập phù hợp</h3>
              <p>Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc độ khó khác.</p>
            </div>
          ) : (
            <div className="topic-problems-grid">
              {paginatedProblems.map((p) => {
                const subStatus =
                  submissionMap.get(p.title.toLowerCase()) ||
                  (p.id === 'two-sum' ||
                  p.id === 'valid-parentheses' ||
                  p.id === 'reverse-linked-list' ||
                  p.id === 'best-time-to-buy-stock'
                    ? 'passed'
                    : p.id === 'binary-search'
                    ? 'failed'
                    : undefined);

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
                          color: DIFFICULTY_COLORS[p.difficulty],
                          backgroundColor: `${DIFFICULTY_COLORS[p.difficulty]}15`,
                          borderColor: `${DIFFICULTY_COLORS[p.difficulty]}40`,
                        }}
                      >
                        {p.difficulty === 'Easy'
                          ? 'Cơ bản'
                          : p.difficulty === 'Medium'
                          ? 'Trung bình'
                          : 'Nâng cao'}
                      </span>
                    </div>

                    <p className="problem-item-desc">{p.description}</p>

                    <div className="problem-item-footer">
                      <span className="problem-topic-tag">{p.topic}</span>
                      <button
                        className={`assessment-primary problem-action-btn ${
                          subStatus === 'passed' ? 'btn-passed' : ''
                        }`}
                        onClick={() => onGoPractice(p.id)}
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
        {totalPages > 1 && (
          <div className="topic-pagination">
            <span className="pagination-info">
              Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredProblems.length)} trên tổng số{' '}
              {filteredProblems.length} bài
            </span>

            <div className="pagination-buttons">
              <button
                className="pagination-arrow"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`pagination-num ${currentPage === pageNum ? 'is-active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button
                className="pagination-arrow"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

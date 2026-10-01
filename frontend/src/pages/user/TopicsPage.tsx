import { useState } from 'react';
import {
  AlignJustify,
  ArrowDownWideNarrow,
  Code2,
  KeyRound,
  Layers,
  Link2,
  ListOrdered,
  Lock,
  MoveHorizontal,
  Play,
  Repeat,
  Search,
  Share2,
  TreePine,
  Type,
  Sparkles,
  Shuffle,
  Zap,
  X,
  type LucideIcon,
} from 'lucide-react';
import { TOPIC_INFOS, PRACTICE_PROBLEMS, type TopicInfo, type AuthMode } from '@/types';
import { SearchableSelect } from '@/components/SearchableSelect';
import { MOCK_SUBMISSIONS } from '@/data/userMockData';
import { Brand } from '@/components/Brand';
import { Footer } from '@/layout/Footer';
import { Header } from '@/layout/Header';
import { useAuth } from '@/hooks/useAuth.tsx';

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

interface TopicsPageProps {
  onBack: () => void;
  onAuth: (mode: AuthMode) => void;
  onSelectTopic: (topic: TopicInfo) => void;
  onGoPractice: (problemId?: string) => void;
  onGoProfile?: () => void;
  onGoProgress?: () => void;
  onGoAdmin?: () => void;
  onGoSettings?: () => void;
  onLoggedOut?: () => void;
}

export function TopicsPage({
  onBack,
  onAuth,
  onSelectTopic,
  onGoPractice,
  onGoProfile,
  onGoProgress,
  onGoAdmin,
  onGoSettings,
  onLoggedOut,
}: TopicsPageProps) {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [randomDiff, setRandomDiff] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const solvedCount = MOCK_SUBMISSIONS.filter((s) => s.status === 'passed').length;
  const userLevelLabel =
    solvedCount < 3 ? 'Cơ bản (Easy)' : solvedCount < 8 ? 'Trung bình (Medium)' : 'Nâng cao (Hard)';

  const filteredTopics = TOPIC_INFOS.filter((topic) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      topic.name.toLowerCase().includes(q) ||
      topic.description.toLowerCase().includes(q) ||
      topic.slug.toLowerCase().includes(q)
    );
  });

  const handleTopicCardClick = (topic: TopicInfo) => {
    onSelectTopic(topic);
  };

  const handleStartRandomPractice = () => {
    if (!isLoggedIn) {
      onAuth('signup');
      return;
    }
    let pool = PRACTICE_PROBLEMS.filter((p) => p.isPublic !== false);
    if (randomDiff !== 'all') {
      pool = pool.filter((p) => p.difficulty === randomDiff);
    }
    if (pool.length === 0) {
      pool = PRACTICE_PROBLEMS;
    }
    const picked = pool[Math.floor(Math.random() * pool.length)];
    onGoPractice(picked.id);
  };

  return (
    <div className="site-shell">
      <Header
        activeView="topics"
        onGoLanding={onBack}
        onGoAuth={onAuth}
        onGoTopics={() => {}}
        onGoProfile={onGoProfile}
        onGoProgress={onGoProgress}
        onGoAdmin={onGoAdmin}
        onGoSettings={onGoSettings}
        onLoggedOut={onLoggedOut}
      />

      <main className="topics-main">
        <div className="topics-hero">
          <p className="eyebrow">Chủ đề luyện code</p>
          <h1>Khám phá {TOPIC_INFOS.length} chủ đề, {TOPIC_INFOS.reduce((acc, t) => acc + t.problemCount, 0)} bài tập mẫu</h1>
          <p className="topics-hero-copy">
            {isLoggedIn
              ? `Xin chào ${user.name?.split(' ').pop()}! Chọn chủ đề bên dưới hoặc thử thách chế độ sinh bài tập ngẫu nhiên AI phù hợp năng lực.`
              : 'Duyệt xem các chủ đề và bài tập mà hệ thống cung cấp. Để bắt đầu luyện tập, bạn cần đăng ký tài khoản và đánh giá năng lực.'}
          </p>
        </div>

        {/* ── Banner Luyện tập ngẫu nhiên theo năng lực AI (Compact & Theme Responsive) ── */}
        <div
          className="ai-random-banner"
          style={{
            marginBottom: '28px',
            borderRadius: '12px',
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 340px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span className="ai-random-banner-badge">
                <Sparkles size={13} /> AI Thích Ứng
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                Luyện Bài Ngẫu Nhiên Theo Năng Lực
              </h3>
            </div>
            <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.4 }}>
              Phân tích trình độ (<strong>{userLevelLabel}</strong>) & tự động gợi ý bài tập luyện bứt phá.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <SearchableSelect
              options={[
                { label: '🎲 Ngẫu nhiên tất cả', value: 'all' },
                { label: '🟢 Bài Dễ (Easy)', value: 'Easy' },
                { label: '🟡 Bài Vừa (Medium)', value: 'Medium' },
                { label: '🔴 Bài Khó (Hard)', value: 'Hard' },
              ]}
              value={randomDiff}
              onChange={(val) => setRandomDiff(val)}
              showSearch={false}
              style={{ width: '180px' }}
            />

            <button
              className="primary-button"
              onClick={handleStartRandomPractice}
              style={{
                padding: '9px 18px',
                fontSize: '13.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 0,
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              }}
            >
              <Shuffle size={15} /> Bắt đầu ngay
            </button>
          </div>
        </div>

        {/* ── Thanh Tìm Kiếm Chủ Đề ── */}
        <div className="topic-controls-bar">
          <div className="topic-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm nhanh chủ đề (ví dụ: Mảng, Chuỗi, Cây, Quy hoạch động, Con trỏ...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  opacity: 0.6,
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Xóa tìm kiếm"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', opacity: 0.85 }}>
            <span>
              Hiển thị <strong>{filteredTopics.length}</strong> / {TOPIC_INFOS.length} chủ đề
            </span>
          </div>
        </div>

        {filteredTopics.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 20px',
              borderRadius: '12px',
              border: '1px dashed rgba(255,255,255,0.12)',
              margin: '20px 0',
            }}
            className="no-topics-found"
          >
            <Search size={36} style={{ opacity: 0.4, marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
              Không tìm thấy chủ đề phù hợp
            </h3>
            <p style={{ fontSize: '13.5px', opacity: 0.7, marginBottom: '16px' }}>
              Không có chủ đề nào khớp với từ khóa "<strong>{searchQuery}</strong>".
            </p>
            <button
              className="primary-button"
              onClick={() => setSearchQuery('')}
              style={{ padding: '8px 18px', fontSize: '13px' }}
            >
              Xem tất cả chủ đề
            </button>
          </div>
        ) : (
          <div className="topics-grid">
            {filteredTopics.map((topic) => {
              const Icon = ICON_MAP[topic.icon] ?? Code2;
              return (
                <article
                  className="topic-card is-unlocked"
                  key={topic.name}
                  onClick={() => handleTopicCardClick(topic)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="topic-card-head">
                    <div className="topic-card-icon">
                      <Icon size={22} strokeWidth={1.7} />
                    </div>
                  </div>
                  <h3 className="topic-card-name">{topic.name}</h3>
                  <p className="topic-card-desc">{topic.description}</p>
                  <div className="topic-card-stats">
                    <span className="topic-stat">{topic.problemCount} bài</span>
                    <span className="topic-diff-bits">
                      <span className="diff-bit easy">{topic.difficulties.easy}</span>
                      <span className="diff-bit medium">{topic.difficulties.medium}</span>
                      <span className="diff-bit hard">{topic.difficulties.hard}</span>
                    </span>
                  </div>
                  <button
                    className="topic-card-cta unlocked"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTopicCardClick(topic);
                    }}
                  >
                    <Play size={14} /> Xem danh sách bài
                  </button>
                </article>
              );
            })}
          </div>
        )}

        {!isLoggedIn && (
          <div className="topics-cta-banner" style={{ marginTop: '36px' }}>
            <div className="topics-cta-icon">
              <Code2 size={28} strokeWidth={1.5} />
            </div>
            <div className="topics-cta-text">
              <h3>Sẵn sàng bắt đầu?</h3>
              <p>Đăng ký tài khoản miễn phí, đánh giá năng lực và bắt đầu luyện code ngay hôm nay.</p>
            </div>
            <div className="topics-cta-actions">
              <button className="assessment-primary" onClick={() => onAuth('signup')}>
                Đăng ký miễn phí
              </button>
              <button className="assessment-ghost" onClick={() => onAuth('login')}>
                Đã có tài khoản
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

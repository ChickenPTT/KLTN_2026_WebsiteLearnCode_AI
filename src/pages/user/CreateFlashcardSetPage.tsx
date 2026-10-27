import { useState, useRef, useEffect } from 'react';
import { Header } from '@/layout/Header';
import { Footer } from '@/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import type { AuthMode, FlashcardItem } from '@/types';
import {
  Trash2,
  Equal,
  CheckCircle,
} from 'lucide-react';
import {
  addUserFlashcardSet,
  updateUserFlashcardSet,
  ALL_FLASHCARD_SETS,
  type FlashcardMockSet,
} from '@/data/flashcardMockData';

const DRAFT_STORAGE_KEY = 'flashcard_create_draft_v1';

interface CardDraft {
  id: string;
  term: string;
  definition: string;
}

interface CardErrors {
  term?: string;
  definition?: string;
}

interface CreateFlashcardSetPageProps {
  editSetId?: string | null;
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
  onCreated: (setId: string, studyNow: boolean) => void;
}

export function CreateFlashcardSetPage({
  editSetId,
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
  onCreated,
}: CreateFlashcardSetPageProps) {
  const { user } = useAuth();
  const isEditing = Boolean(editSetId && typeof editSetId === 'string' && editSetId.trim().length > 0);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<CardDraft[]>([
    { id: '1', term: '', definition: '' },
    { id: '2', term: '', definition: '' },
  ]);

  // Inline errors state (Báo lỗi ngay tại dòng tương ứng)
  const [titleError, setTitleError] = useState('');
  const [cardErrors, setCardErrors] = useState<{ [cardId: string]: CardErrors }>({});
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  // Load dữ liệu khi chỉnh sửa bộ thẻ HOẶC khôi phục bản nháp khi tạo mới
  useEffect(() => {
    if (isEditing && typeof editSetId === 'string') {
      const existingSet = ALL_FLASHCARD_SETS.find((s) => s.id === editSetId);
      if (existingSet) {
        setTitle(existingSet.title);
        setDescription(existingSet.subtitle);
        if (existingSet.cards && existingSet.cards.length > 0) {
          setCards(
            existingSet.cards.map((c, i) => ({
              id: c.id || String(i + 1),
              term: c.term || '',
              definition: c.definition || '',
            }))
          );
        } else {
          setCards([
            { id: '1', term: '', definition: '' },
            { id: '2', term: '', definition: '' },
          ]);
        }
      }
    } else {
      // Khôi phục bản nháp tự động từ localStorage
      try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.title) setTitle(parsed.title);
          if (parsed.description) setDescription(parsed.description);
          if (parsed.cards && parsed.cards.length > 0) setCards(parsed.cards);
          if (parsed.savedTime) setDraftSavedAt(parsed.savedTime);
        }
      } catch (e) {
        console.error('Lỗi đọc bản nháp flashcard', e);
      }
    }
  }, [editSetId]);

  // Tự động lưu bản nháp vào localStorage (chỉ áp dụng khi tạo mới)
  useEffect(() => {
    if (isEditing) return;

    const hasAnyContent =
      title.trim() ||
      description.trim() ||
      cards.some((c) => c.term.trim() || c.definition.trim());

    if (hasAnyContent) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            title,
            description,
            cards,
            savedTime: timeStr,
          })
        );
        setDraftSavedAt(timeStr);
      } catch (e) {
        console.error('Lỗi lưu bản nháp flashcard', e);
      }
    }
  }, [title, description, cards, isEditing]);

  // Ref theo dõi thẻ đang kéo
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [isDraggingIndex, setIsDraggingIndex] = useState<number | null>(null);

  const handleAddCard = () => {
    const newId = String(Date.now());
    setCards([...cards, { id: newId, term: '', definition: '' }]);
  };

  const handleRemoveCard = (index: number) => {
    if (cards.length <= 1) {
      alert('Bộ thẻ cần ít nhất 1 thẻ!');
      return;
    }
    const cardToRemove = cards[index];
    setCards(cards.filter((_, i) => i !== index));
    // Xóa lỗi của thẻ đó nếu có
    if (cardErrors[cardToRemove.id]) {
      const updated = { ...cardErrors };
      delete updated[cardToRemove.id];
      setCardErrors(updated);
    }
  };

  const handleUpdateCard = (index: number, field: 'term' | 'definition', value: string) => {
    const updated = [...cards];
    updated[index][field] = value;
    setCards(updated);

    // Xóa lỗi ngay khi người dùng nhập dữ liệu vào ô đó
    const cardId = updated[index].id;
    if (cardErrors[cardId]?.[field]) {
      setCardErrors((prev) => ({
        ...prev,
        [cardId]: {
          ...prev[cardId],
          [field]: undefined,
        },
      }));
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (titleError && val.trim()) {
      setTitleError('');
    }
  };

  // Kéo thả thẻ (Drag and Drop)
  const handleDragStart = (index: number) => {
    dragItem.current = index;
    setIsDraggingIndex(index);
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (
      dragItem.current !== null &&
      dragOverItem.current !== null &&
      dragItem.current !== dragOverItem.current
    ) {
      const updated = [...cards];
      const [dragged] = updated.splice(dragItem.current, 1);
      updated.splice(dragOverItem.current, 0, dragged);
      setCards(updated);
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setIsDraggingIndex(null);
  };

  // Lưu và tạo / cập nhật bộ thẻ
  const handleSubmit = (studyNow: boolean) => {
    let hasError = false;
    const newCardErrors: { [cardId: string]: CardErrors } = {};

    // 1. Kiểm tra Tiêu đề (Báo lỗi ngay tại ô tiêu đề)
    if (!title.trim()) {
      setTitleError('Vui lòng nhập tiêu đề cho bộ thẻ.');
      hasError = true;
    } else {
      setTitleError('');
    }

    // 2. Kiểm tra từng thẻ (Báo lỗi ngay tại ô thuật ngữ hoặc định nghĩa)
    cards.forEach((card) => {
      const termEmpty = !card.term.trim();
      const defEmpty = !card.definition.trim();

      if (termEmpty || defEmpty) {
        hasError = true;
        newCardErrors[card.id] = {
          term: termEmpty ? 'Vui lòng nhập thuật ngữ.' : undefined,
          definition: defEmpty ? 'Vui lòng nhập định nghĩa.' : undefined,
        };
      }
    });

    setCardErrors(newCardErrors);

    if (hasError) {
      // Focus vào ô lỗi đầu tiên nếu có
      if (!title.trim()) {
        const titleEl = document.querySelector('.cfc-input-title') as HTMLInputElement;
        titleEl?.focus();
      }
      return;
    }

    const validCards: FlashcardItem[] = cards.map((c, i) => ({
      id: c.id || `card-${i + 1}-${Date.now()}`,
      term: c.term.trim(),
      definition: c.definition.trim(),
    }));

    if (isEditing && editSetId) {
      // CHẾ ĐỘ CHỈNH SỬA: Cập nhật bộ thẻ hiện tại
      const currentSet = ALL_FLASHCARD_SETS.find((s) => s.id === editSetId);
      const updatedSet: FlashcardMockSet = {
        id: editSetId,
        title: title.trim(),
        subtitle: description.trim() || 'Tự biên soạn',
        wordCount: validCards.length,
        viewCount: currentSet ? currentSet.viewCount : 1,
        authorName: currentSet ? currentSet.authorName : (user?.name || 'Sinh viên Demo'),
        iconName: currentSet ? currentSet.iconName : 'Code2',
        iconBg: currentSet ? currentSet.iconBg : '#EFF6FF',
        iconColor: currentSet ? currentSet.iconColor : '#2563EB',
        cards: validCards,
      };

      updateUserFlashcardSet(updatedSet);
      onCreated(editSetId, studyNow);
    } else {
      // CHẾ ĐỘ TẠO MỚI: Thêm mới và xóa bản nháp
      const newSetId = `user-fc-${Date.now()}`;
      const newSet: FlashcardMockSet = {
        id: newSetId,
        title: title.trim(),
        subtitle: description.trim() || 'Tự biên soạn',
        wordCount: validCards.length,
        viewCount: 1,
        authorName: user?.name || 'Sinh viên Demo',
        iconName: 'Code2',
        iconBg: '#EFF6FF',
        iconColor: '#2563EB',
        cards: validCards,
      };

      addUserFlashcardSet(newSet);
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {
        console.error(e);
      }
      onCreated(newSetId, studyNow);
    }
  };

  return (
    <div className="page-shell">
      <Header
        activeView="create-flashcard"
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
        {/* Top Header: Tiêu đề trang & Trạng thái lưu nháp */}
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 className="page-title">
              {isEditing ? 'Chỉnh sửa bộ thẻ' : 'Tạo bộ thẻ mới'}
            </h1>
            <p className="page-sub">
              {isEditing
                ? 'Cập nhật tiêu đề, mô tả và nội dung các thẻ từ vựng của bạn.'
                : 'Tạo bộ thẻ flashcard của riêng bạn với các cặp thuật ngữ và định nghĩa.'}
            </p>
          </div>

          {/* Badge thông báo đã tự động lưu nháp */}
          {!isEditing && draftSavedAt && (
            <div className="cfc-draft-indicator">
              <CheckCircle size={14} className="cfc-draft-icon" />
              <span>Đã lưu bản nháp lúc {draftSavedAt}</span>
            </div>
          )}
        </div>

        {/* Tiêu đề & Mô tả */}
        <div className="cfc-header-inputs">
          <div className="cfc-input-group">
            <input
              type="text"
              className={`cfc-input-title ${titleError ? 'cfc-input-error' : ''}`}
              placeholder="Tiêu đề"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              autoFocus
            />
            {titleError && <span className="cfc-error-msg">{titleError}</span>}
          </div>

          <input
            type="text"
            className="cfc-input-desc"
            placeholder="Thêm mô tả..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Danh sách thẻ */}
        <div className="cfc-cards-list">
          {cards.map((card, index) => {
            const err = cardErrors[card.id];
            return (
              <div
                key={card.id}
                className={`cfc-card-item ${isDraggingIndex === index ? 'cfc-card-item--dragging' : ''}`}
                onDragEnter={() => handleDragEnter(index)}
                onDragOver={(e) => e.preventDefault()}
              >
                {/* Header của thẻ: số thứ tự + drag handle & xóa */}
                <div className="cfc-card-header">
                  <span className="cfc-card-index">{index + 1}</span>

                  <div className="cfc-card-actions">
                    {/* Drag handle */}
                    <div
                      className="cfc-card-drag-btn"
                      title="Giữ và kéo để đổi vị trí thẻ"
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragEnd={handleDragEnd}
                    >
                      <Equal size={20} />
                    </div>

                    {/* Nút xóa thẻ */}
                    <button
                      className="cfc-card-trash-btn"
                      title="Xóa thẻ này"
                      onClick={() => handleRemoveCard(index)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Hàng 2 cột: Thuật ngữ & Định nghĩa */}
                <div className="cfc-card-body">
                  {/* Cột 1: Thuật ngữ */}
                  <div className="cfc-col">
                    <div className="cfc-input-wrapper">
                      <input
                        type="text"
                        className={`cfc-input-term ${err?.term ? 'cfc-input-error' : ''}`}
                        placeholder="Nhập thuật ngữ..."
                        value={card.term}
                        onChange={(e) => handleUpdateCard(index, 'term', e.target.value)}
                      />
                      <span className="cfc-input-label">THUẬT NGỮ</span>
                      {err?.term && <span className="cfc-error-msg">{err.term}</span>}
                    </div>
                  </div>

                  {/* Cột 2: Định nghĩa */}
                  <div className="cfc-col">
                    <div className="cfc-input-wrapper">
                      <input
                        type="text"
                        className={`cfc-input-def ${err?.definition ? 'cfc-input-error' : ''}`}
                        placeholder="Nhập định nghĩa..."
                        value={card.definition}
                        onChange={(e) => handleUpdateCard(index, 'definition', e.target.value)}
                      />
                      <span className="cfc-input-label">ĐỊNH NGHĨA</span>
                      {err?.definition && <span className="cfc-error-msg">{err.definition}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nút Thêm Thẻ to ở giữa */}
        <div className="cfc-add-card-wrap">
          <button className="cfc-add-card-btn" onClick={handleAddCard}>
            Thêm thẻ
          </button>
        </div>

        {/* Bottom Bar Actions */}
        <div className="cfc-bottom-actions">
          <button className="cfc-btn-secondary" onClick={() => handleSubmit(false)}>
            {isEditing ? 'Lưu thay đổi' : 'Tạo'}
          </button>
          <button className="cfc-btn-primary" onClick={() => handleSubmit(true)}>
            {isEditing ? 'Lưu và ôn luyện' : 'Tạo và ôn luyện'}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

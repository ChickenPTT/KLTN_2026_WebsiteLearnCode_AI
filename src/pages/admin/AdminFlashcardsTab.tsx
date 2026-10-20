import { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  Binary,
  Database,
  Cpu,
  Code2,
  BrainCircuit,
  Globe,
  X,
  Check,
  AlertTriangle,
  Users,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { Pagination } from '@/components/Pagination';
import { useAuth } from '@/hooks/useAuth';
import {
  ALL_FLASHCARD_SETS,
  addSystemFlashcardSet,
  updateFlashcardSet,
  deleteFlashcardSet,
  type FlashcardMockSet,
  type CardIcon,
} from '@/data/flashcardMockData';
import type { FlashcardItem } from '@/types';

const ICON_MAP: Record<CardIcon, React.ElementType> = {
  Binary,
  Database,
  Cpu,
  Code2,
  BrainCircuit,
  Globe,
};

const COLOR_PRESETS = [
  { bg: '#EEF2FF', color: '#4F46E5', label: 'Indigo' },
  { bg: '#EFF6FF', color: '#2563EB', label: 'Blue' },
  { bg: '#ECFDF5', color: '#059669', label: 'Green' },
  { bg: '#FFF7ED', color: '#EA580C', label: 'Orange' },
  { bg: '#FDF4FF', color: '#9333EA', label: 'Purple' },
  { bg: '#FEF2F2', color: '#DC2626', label: 'Rose' },
];

interface AdminFlashcardsTabProps {
  onLogActivity?: (action: 'CREATE' | 'UPDATE' | 'DELETE' | 'TOGGLE', target: string) => void;
}

export function AdminFlashcardsTab({ onLogActivity }: AdminFlashcardsTabProps) {
  const { user } = useAuth();
  const [sets, setSets] = useState<FlashcardMockSet[]>([...ALL_FLASHCARD_SETS]);
  const [filterType, setFilterType] = useState<'all' | 'system' | 'user'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'teacher' | 'student'>('all');
  const [searchKey, setSearchKey] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Helper xác định role của tác giả
  const getAuthorRole = (set: FlashcardMockSet): 'admin' | 'teacher' | 'student' => {
    if (set.authorRole) return set.authorRole;
    if (set.id.startsWith('my-fc') || set.id.startsWith('user-fc')) return 'student';
    if (set.authorName.toLowerCase().includes('giảng viên')) return 'teacher';
    return 'admin';
  };

  // Modal States
  const [previewSet, setPreviewSet] = useState<FlashcardMockSet | null>(null);
  const [editingSet, setEditingSet] = useState<FlashcardMockSet | null>(null);
  const [deletingSet, setDeletingSet] = useState<FlashcardMockSet | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form State for Add / Edit Modal
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('Hệ thống Mnemonic');
  const [formIcon, setFormIcon] = useState<CardIcon>('Code2');
  const [formIconBg, setFormIconBg] = useState('#EFF6FF');
  const [formIconColor, setFormIconColor] = useState('#2563EB');
  const [formIsPublic, setFormIsPublic] = useState(true);
  const [formCards, setFormCards] = useState<FlashcardItem[]>([]);
  const [formErrors, setFormErrors] = useState<string>('');

  // Overview metrics
  const totalSets = sets.length;
  const systemSetsCount = sets.filter((s) => s.authorName !== 'Tôi' && !s.id.startsWith('user-fc') && !s.id.startsWith('my-fc')).length;
  const userSetsCount = totalSets - systemSetsCount;
  const unpublicSetsCount = sets.filter((s) => s.isPublic === false).length;
  const totalWords = sets.reduce((sum, s) => sum + (s.cards?.length || s.wordCount || 0), 0);
  const adminCount = sets.filter((s) => getAuthorRole(s) === 'admin').length;
  const teacherCount = sets.filter((s) => getAuthorRole(s) === 'teacher').length;
  const studentCount = sets.filter((s) => getAuthorRole(s) === 'student').length;

  // Filtered & Sorted sets
  const filteredSets = useMemo(() => {
    return sets
      .filter((set) => {
        const isSystem = set.authorName !== 'Tôi' && !set.id.startsWith('user-fc') && !set.id.startsWith('my-fc');
        if (filterType === 'system' && !isSystem) return false;
        if (filterType === 'user' && isSystem) return false;

        const role = getAuthorRole(set);
        if (roleFilter !== 'all' && role !== roleFilter) return false;

        if (searchKey.trim()) {
          const q = searchKey.toLowerCase();
          const matchTitle = set.title.toLowerCase().includes(q);
          const matchSub = set.subtitle?.toLowerCase().includes(q);
          const matchAuthor = set.authorName.toLowerCase().includes(q);
          if (!matchTitle && !matchSub && !matchAuthor) return false;
        }
        return true;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [sets, filterType, roleFilter, searchKey]);

  // Pagination
  const totalPages = Math.ceil(filteredSets.length / pageSize) || 1;
  const pagedSets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSets.slice(start, start + pageSize);
  }, [filteredSets, currentPage, pageSize]);

  // Handlers for Add/Edit
  const handleOpenCreateModal = () => {
    setIsCreatingNew(true);
    setEditingSet(null);
    setFormTitle('');
    setFormSubtitle('Tiếng Anh chuyên ngành CNTT');
    setFormAuthor('Hệ thống Mnemonic');
    setFormIcon('Binary');
    setFormIconBg('#EEF2FF');
    setFormIconColor('#4F46E5');
    setFormIsPublic(true);
    setFormCards([
      { id: `c-${Date.now()}-1`, term: '', definition: '', example: '' },
      { id: `c-${Date.now()}-2`, term: '', definition: '', example: '' },
    ]);
    setFormErrors('');
  };

  const handleOpenEditModal = (set: FlashcardMockSet) => {
    setIsCreatingNew(false);
    setEditingSet(set);
    setFormTitle(set.title);
    setFormSubtitle(set.subtitle);
    setFormAuthor(set.authorName);
    setFormIcon(set.iconName || 'Code2');
    setFormIconBg(set.iconBg || '#EFF6FF');
    setFormIconColor(set.iconColor || '#2563EB');
    setFormIsPublic(set.isPublic !== false);
    setFormCards(
      set.cards && set.cards.length > 0
        ? [...set.cards]
        : [
            { id: `c-${Date.now()}-1`, term: '', definition: '', example: '' },
            { id: `c-${Date.now()}-2`, term: '', definition: '', example: '' },
          ]
    );
    setFormErrors('');
  };

  const handleAddCardRow = () => {
    setFormCards((prev) => [
      ...prev,
      { id: `c-${Date.now()}-${prev.length + 1}`, term: '', definition: '', example: '' },
    ]);
  };

  const handleRemoveCardRow = (index: number) => {
    if (formCards.length <= 1) {
      alert('Bộ thẻ cần ít nhất 1 thẻ!');
      return;
    }
    setFormCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCardFieldChange = (index: number, field: keyof FlashcardItem, value: string) => {
    setFormCards((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormErrors('Vui lòng nhập tên bộ thẻ.');
      return;
    }

    const validCards = formCards
      .map((c) => ({
        id: c.id,
        term: c.term.trim(),
        definition: c.definition.trim(),
        example: c.example?.trim() || '',
      }))
      .filter((c) => c.term || c.definition);

    if (validCards.length === 0) {
      setFormErrors('Vui lòng nhập ít nhất 1 thẻ có thuật ngữ và định nghĩa.');
      return;
    }

    if (isCreatingNew) {
      const newId = `fc-admin-${Date.now()}`;
      const newSet: FlashcardMockSet = {
        id: newId,
        title: formTitle.trim(),
        subtitle: formSubtitle.trim() || 'Hệ thống biên soạn',
        wordCount: validCards.length,
        viewCount: 0,
        authorName: user?.name || (user?.role === 'teacher' ? 'Giảng viên Demo' : 'Quản trị viên Demo'),
        authorRole: (user?.role as 'admin' | 'teacher') || 'admin',
        isPublic: formIsPublic,
        iconName: formIcon,
        iconBg: formIconBg,
        iconColor: formIconColor,
        cards: validCards,
      };

      addSystemFlashcardSet(newSet);
      setSets([...ALL_FLASHCARD_SETS]);
      onLogActivity?.('CREATE', `Tạo bộ flashcard hệ thống "${newSet.title}" (${validCards.length} từ)`);
    } else if (editingSet) {
      const updatedSet: FlashcardMockSet = {
        ...editingSet,
        title: formTitle.trim(),
        subtitle: formSubtitle.trim() || 'Hệ thống biên soạn',
        wordCount: validCards.length,
        authorName: editingSet.authorName,
        authorRole: editingSet.authorRole || getAuthorRole(editingSet),
        isPublic: formIsPublic,
        iconName: formIcon,
        iconBg: formIconBg,
        iconColor: formIconColor,
        cards: validCards,
      };

      updateFlashcardSet(updatedSet);
      setSets([...ALL_FLASHCARD_SETS]);
      onLogActivity?.('UPDATE', `Cập nhật bộ flashcard "${updatedSet.title}"`);
    }

    setIsCreatingNew(false);
    setEditingSet(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingSet) return;
    deleteFlashcardSet(deletingSet.id);
    setSets([...ALL_FLASHCARD_SETS]);
    onLogActivity?.('DELETE', `Xóa bộ flashcard "${deletingSet.title}"`);
    setDeletingSet(null);
    if (previewSet?.id === deletingSet.id) {
      setPreviewSet(null);
    }
  };

  const handleTogglePublic = (id: string) => {
    setSets((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const newStatus = !(s.isPublic !== false);
          const updated = { ...s, isPublic: newStatus };
          updateFlashcardSet(updated);
          onLogActivity?.(
            'UPDATE',
            `Chuyển trạng thái bộ flashcard "${s.title}" sang: ${newStatus ? 'Public' : 'Chưa public'}`
          );
          return updated;
        }
        return s;
      })
    );
  };

  return (
    <div className="admin-flashcards-tab">
      {/* ── TOP HEADER ── */}
      <div className="admin-header-row" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="admin-page-title">Quản lý Flashcards & Từ vựng</h1>
          <p className="admin-page-sub">
            Quản lý kho từ vựng chuyên ngành, các bộ thẻ hệ thống và kiểm duyệt các bộ thẻ do sinh viên tự biên soạn.
          </p>
        </div>

        <button className="assessment-primary" onClick={handleOpenCreateModal}>
          <Plus size={16} /> Thêm bộ thẻ hệ thống
        </button>
      </div>

      {/* ── 3 KPI STAT CARDS ── */}
      <div className="kpi-grid-3" style={{ marginBottom: '24px' }}>
        <div className="kpi-card-compact">
          <div className="kpi-title" style={{ marginBottom: '6px' }}>Tổng số bộ thẻ</div>
          <div className="kpi-value" style={{ marginBottom: '4px' }}>{totalSets}</div>
          <div className="kpi-sub">{systemSetsCount} bộ hệ thống / {userSetsCount} bộ user tạo</div>
        </div>

        <div className="kpi-card-compact">
          <div className="kpi-title" style={{ marginBottom: '6px' }}>Tổng số thuật ngữ</div>
          <div className="kpi-value" style={{ marginBottom: '4px' }}>{totalWords.toLocaleString('vi-VN')}</div>
          <div className="kpi-sub">Từ vựng & định nghĩa</div>
        </div>

        <div className="kpi-card-compact">
          <div className="kpi-title" style={{ marginBottom: '6px' }}>Số bộ chưa public</div>
          <div className="kpi-value" style={{ marginBottom: '4px' }}>{unpublicSetsCount} / {totalSets}</div>
          <div className="kpi-sub">Chưa public / tổng số thẻ</div>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="history-filter-bar" style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search – bên trái */}
        <div className="history-search-wrap" style={{ flex: 1, minWidth: '240px', maxWidth: '380px' }}>
          <Search size={16} className="history-search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm bộ thẻ, tác giả..."
            value={searchKey}
            onChange={(e) => {
              setSearchKey(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Filter 1: Nguồn tạo */}
        <div className="history-select-wrap">
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as 'all' | 'system' | 'user');
              setCurrentPage(1);
            }}
          >
            <option value="all">Tất cả nguồn ({totalSets})</option>
            <option value="system">Hệ thống ({systemSetsCount})</option>
            <option value="user">Người dùng tạo ({userSetsCount})</option>
          </select>
        </div>

        {/* Filter 2: Role người tạo */}
        <div className="history-select-wrap">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as 'all' | 'admin' | 'teacher' | 'student');
              setCurrentPage(1);
            }}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Quản trị viên ({adminCount})</option>
            <option value="teacher">Giảng viên ({teacherCount})</option>
            <option value="student">Sinh viên ({studentCount})</option>
          </select>
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <div className="history-table-card">
        <table className="history-table full-history-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              <th>Bộ Flashcard</th>
              <th style={{ width: '120px' }}>Số thuật ngữ</th>
              <th style={{ width: '150px' }}>Tác giả</th>
              <th style={{ width: '100px' }}>Lượt học</th>
              <th style={{ width: '130px' }}>Trạng thái</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pagedSets.length > 0 ? (
              pagedSets.map((set, idx) => {
                const IconComp = ICON_MAP[set.iconName] || Code2;
                const actualIndex = (currentPage - 1) * pageSize + idx + 1;

                return (
                  <tr key={set.id}>
                    <td>
                      <span className="fc-admin-index-col">{actualIndex}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: set.iconBg || '#EFF6FF',
                            color: set.iconColor || '#2563EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <IconComp size={20} />
                        </div>
                        <div>
                          <strong className="fc-admin-item-title">
                            {set.title}
                          </strong>
                          <span className="fc-admin-id-tag">ID: {set.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 9px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#2563eb',
                          border: '1px solid rgba(59, 130, 246, 0.25)',
                        }}
                      >
                        {set.cards?.length || set.wordCount} thẻ
                      </span>
                    </td>
                    <td>
                      {(() => {
                        const role = getAuthorRole(set);
                        if (role === 'admin') {
                          return (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                              <Sparkles size={12} /> {set.authorName}
                            </span>
                          );
                        }
                        if (role === 'teacher') {
                          return (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                              <GraduationCap size={13} /> {set.authorName}
                            </span>
                          );
                        }
                        return (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(168, 85, 247, 0.12)', color: '#9333ea', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 500 }}>
                            <Users size={12} /> {set.authorName}
                          </span>
                        );
                      })()}
                    </td>
                    <td>
                      <span className="fc-admin-views">
                        <Eye size={13} /> {(set.viewCount || 0).toLocaleString('vi-VN')}
                      </span>
                    </td>
                    {/* Trạng thái Public Toggle Switch */}
                    <td>
                      <div
                        className="toggle-switch-wrap"
                        onClick={() => handleTogglePublic(set.id)}
                        title={set.isPublic !== false ? 'Nhấp để chuyển sang Chưa public' : 'Nhấp để công khai bộ thẻ này'}
                      >
                        <div className={`toggle-switch-btn ${set.isPublic !== false ? 'is-public' : ''}`}>
                          <div className="toggle-switch-knob" />
                        </div>
                        <span className={`toggle-switch-label ${set.isPublic !== false ? 'is-public' : ''}`}>
                          {set.isPublic !== false ? 'Public' : 'Chưa public'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          className="icon-action-btn view"
                          title="Xem danh sách từ vựng"
                          onClick={() => setPreviewSet(set)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="icon-action-btn edit"
                          title="Chỉnh sửa bộ thẻ"
                          onClick={() => handleOpenEditModal(set)}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="icon-action-btn delete"
                          title="Xóa bộ thẻ"
                          onClick={() => setDeletingSet(set)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                  <BookOpen size={36} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>Không tìm thấy bộ flashcard nào phù hợp.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ── PAGINATION BAR ── */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredSets.length}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          1. MODAL XEM CHI TIẾT TỪ VỰNG (PREVIEW MODAL)
         ══════════════════════════════════════════════════════════════════ */}
      {previewSet && (
        <div className="dialog-overlay" onClick={() => setPreviewSet(null)}>
          <div
            className="dialog-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '720px', width: '92%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', textAlign: 'left', padding: '24px' }}
          >
            <button className="dialog-close" onClick={() => setPreviewSet(null)}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: previewSet.iconBg || '#EFF6FF',
                  color: previewSet.iconColor || '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BookOpen size={22} />
              </div>
              <div>
                <h3 className="dialog-title" style={{ margin: 0 }}>{previewSet.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                    {previewSet.cards?.length || previewSet.wordCount} thuật ngữ
                  </span>
                  <span style={{ color: '#334155' }}>•</span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: 'rgba(59,130,246,0.12)', color: '#60a5fa',
                    padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                  }}>
                    <Users size={11} /> Tác giả: {previewSet.authorName}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ overflowY: 'auto', paddingRight: '6px', flex: 1, marginBottom: '20px' }}>
              {previewSet.cards && previewSet.cards.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {previewSet.cards.map((card, i) => (
                    <div
                      key={card.id || i}
                      className="fc-admin-card-row"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong className="fc-admin-card-term">
                          #{i + 1}. {card.term}
                        </strong>
                      </div>
                      <p className="fc-admin-card-def">
                        {card.definition}
                      </p>
                      {card.example && (
                        <div className="fc-admin-card-example">
                          Ví dụ: {card.example}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
                  <p>Bộ thẻ này chưa có danh sách từ vựng chi tiết.</p>
                </div>
              )}
            </div>

            <div className="dialog-actions" style={{ justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="dialog-cancel"
                onClick={() => setPreviewSet(null)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="assessment-primary"
                onClick={() => {
                  const set = previewSet;
                  setPreviewSet(null);
                  handleOpenEditModal(set);
                }}
              >
                <Edit3 size={15} /> Chỉnh sửa bộ thẻ này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          2. MODAL THÊM / CHỈNH SỬA BỘ THẺ (CREATE & EDIT MODAL)
         ══════════════════════════════════════════════════════════════════ */}
      {(isCreatingNew || editingSet) && (
        <div className="dialog-overlay" onClick={() => { setIsCreatingNew(false); setEditingSet(null); }}>
          <div
            className="dialog-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '800px', width: '94%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', textAlign: 'left', padding: '24px' }}
          >
            <button
              className="dialog-close"
              onClick={() => { setIsCreatingNew(false); setEditingSet(null); }}
            >
              <X size={18} />
            </button>

            <h3 className="dialog-title" style={{ marginBottom: '16px' }}>
              {isCreatingNew ? 'Thêm bộ Flashcard hệ thống mới' : 'Chỉnh sửa bộ Flashcard'}
            </h3>

            <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ overflowY: 'auto', paddingRight: '8px', flex: 1, marginBottom: '16px' }}>
                {formErrors && (
                  <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', fontSize: '13px', marginBottom: '14px' }}>
                    {formErrors}
                  </div>
                )}

                {/* Thông tin cơ bản */}
                <div style={{ marginBottom: '12px' }}>
                  <div className="fc-form-group">
                    <label className="fc-admin-modal-label">Tên bộ thẻ *</label>
                    <input
                      type="text"
                      className="admin-input"
                      required
                      placeholder="VD: Cấu trúc dữ liệu nâng cao..."
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Tác giả (read-only) + Icon */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="fc-form-group">
                    <label className="fc-admin-modal-label">Tác giả / Người tạo</label>
                    <div className="fc-admin-author-box">
                      <Users size={15} style={{ color: '#3b82f6', flexShrink: 0 }} />
                      <span className="fc-admin-author-name">
                        {isCreatingNew
                          ? (user?.name || 'Sinh viên Demo')
                          : (editingSet?.authorName || user?.name || 'Sinh viên Demo')}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b', marginLeft: 'auto' }}>Không thể sửa</span>
                    </div>
                  </div>

                  <div className="fc-form-group">
                    <label className="fc-admin-modal-label">Biểu tượng (Icon)</label>
                    <select
                      className="admin-input"
                      value={formIcon}
                      onChange={(e) => setFormIcon(e.target.value as CardIcon)}
                    >
                      <option value="Binary">Binary (Số học, Thuật toán)</option>
                      <option value="Database">Database (Cơ sở dữ liệu)</option>
                      <option value="Cpu">Cpu (Kiến trúc máy tính)</option>
                      <option value="Code2">Code2 (Lập trình, Thuật toán)</option>
                      <option value="BrainCircuit">BrainCircuit (AI, Học máy)</option>
                      <option value="Globe">Globe (Mạng máy tính, Web)</option>
                    </select>
                  </div>
                </div>

                {/* Trạng thái công khai Toggle */}
                <div style={{ marginBottom: '16px' }}>
                  <label className="fc-admin-modal-label">Trạng thái công khai</label>
                  <div
                    className="toggle-switch-wrap"
                    onClick={() => setFormIsPublic((prev) => !prev)}
                    style={{ width: 'fit-content' }}
                  >
                    <div className={`toggle-switch-btn ${formIsPublic ? 'is-public' : ''}`}>
                      <div className="toggle-switch-knob" />
                    </div>
                    <span className={`toggle-switch-label ${formIsPublic ? 'is-public' : ''}`}>
                      {formIsPublic ? 'Public (Công khai)' : 'Chưa public (Bản nháp)'}
                    </span>
                  </div>
                </div>

                {/* Chọn màu chủ đạo */}
                <div style={{ marginBottom: '18px' }}>
                  <label className="fc-admin-modal-label">
                    Màu sắc nhận diện:
                  </label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {COLOR_PRESETS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setFormIconBg(preset.bg);
                          setFormIconColor(preset.color);
                        }}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '8px',
                          background: preset.color,
                          border: formIconColor === preset.color ? '3px solid #ffffff' : '2px solid transparent',
                          cursor: 'pointer',
                          boxShadow: formIconColor === preset.color ? '0 0 10px rgba(255,255,255,0.4)' : 'none',
                        }}
                        title={preset.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Danh sách thẻ con (Card Items Manager) */}
                <div className="fc-admin-section-divider">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 className="fc-admin-modal-heading">
                      Danh sách thuật ngữ ({formCards.length})
                    </h4>
                    <button
                      type="button"
                      className="dialog-cancel"
                      onClick={handleAddCardRow}
                      style={{ padding: '6px 14px', fontSize: '13px' }}
                    >
                      <Plus size={14} /> Thêm từ mới
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {formCards.map((card, idx) => (
                      <div
                        key={card.id || idx}
                        className="fc-admin-card-row"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="fc-admin-card-term">Thẻ #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCardRow(idx)}
                            style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px 4px' }}
                            title="Xóa thẻ này"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px' }}>
                          <input
                            type="text"
                            className="admin-input"
                            placeholder="Thuật ngữ (Term)..."
                            value={card.term}
                            onChange={(e) => handleCardFieldChange(idx, 'term', e.target.value)}
                          />
                          <input
                            type="text"
                            className="admin-input"
                            placeholder="Định nghĩa (Definition)..."
                            value={card.definition}
                            onChange={(e) => handleCardFieldChange(idx, 'definition', e.target.value)}
                          />
                        </div>

                        <input
                          type="text"
                          className="admin-input"
                          placeholder="Ví dụ minh họa (Tùy chọn)..."
                          value={card.example || ''}
                          onChange={(e) => handleCardFieldChange(idx, 'example', e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="dialog-actions" style={{ justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="dialog-cancel"
                  onClick={() => { setIsCreatingNew(false); setEditingSet(null); }}
                >
                  Hủy
                </button>
                <button type="submit" className="assessment-primary" style={{ gap: '6px' }}>
                  <Check size={16} /> {isCreatingNew ? 'Tạo bộ thẻ' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          3. MODAL XÁC NHẬN XÓA (CONFIRM DELETE MODAL)
         ══════════════════════════════════════════════════════════════════ */}
      {deletingSet && (
        <div className="dialog-overlay" onClick={() => setDeletingSet(null)}>
          <div
            className="dialog-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px' }}
          >
            <div className="dialog-icon danger">
              <AlertTriangle size={28} />
            </div>

            <h3 className="dialog-title">
              Xác nhận xóa bộ Flashcard?
            </h3>
            <p className="dialog-message">
              Bạn có chắc chắn muốn xóa bộ thẻ <strong>"{deletingSet.title}"</strong> gồm{' '}
              <strong>{deletingSet.cards?.length || deletingSet.wordCount}</strong> thuật ngữ?
              Hành động này không thể hoàn tác.
            </p>

            <div className="dialog-actions">
              <button
                type="button"
                className="dialog-cancel"
                onClick={() => setDeletingSet(null)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="dialog-confirm danger"
                onClick={handleConfirmDelete}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

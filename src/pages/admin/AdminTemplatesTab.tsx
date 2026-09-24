import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  FileSpreadsheet,
  Search,
  Filter,
  Layers,
  Eye,
  Edit3,
  Trash2,
  Code2,
  ListOrdered,
  Type,
  KeyRound,
  MoveHorizontal,
  Link2,
  AlignJustify,
  Repeat,
  ArrowDownWideNarrow,
  TreePine,
  Share2,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import { SearchableSelect } from '@/components/SearchableSelect';
import { TOPIC_INFOS, LEVEL_LABELS, LEVEL_COLORS, type TopicInfo } from '@/types';
import type { SampleTemplate } from './admin.types';

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

interface AdminTemplatesTabProps {
  templates: SampleTemplate[];
  onOpenAddTplModal: () => void;
  onOpenImportExcelModal: () => void;
  onOpenDetailModal: (tpl: SampleTemplate) => void;
  onOpenEditModal: (tpl: SampleTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export function AdminTemplatesTab({
  templates,
  onOpenAddTplModal,
  onOpenImportExcelModal,
  onOpenDetailModal,
  onOpenEditModal,
  onDeleteTemplate,
}: AdminTemplatesTabProps) {
  // Navigation & Selected Topic State
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Topic Management State
  const [topicsList, setTopicsList] = useState<TopicInfo[]>(TOPIC_INFOS);

  // Confirmation Modals State
  const [deletingTopic, setDeletingTopic] = useState<string | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<SampleTemplate | null>(null);
  const [editingTemplateConfirm, setEditingTemplateConfirm] = useState<SampleTemplate | null>(null);

  // Search & Filters
  const [searchKey, setSearchKey] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  // Count templates per topic
  const templateCountByTopic = useMemo(() => {
    const counts: Record<string, number> = {};
    templates.forEach((tpl) => {
      const topic = tpl.topic || 'Khác';
      counts[topic] = (counts[topic] || 0) + 1;
    });
    return counts;
  }, [templates]);

  // Templates in current selected topic
  const topicTemplates = useMemo(() => {
    if (!selectedTopic) return [];
    return templates.filter((tpl) => {
      const isTopicMatch = tpl.topic === selectedTopic;
      const isSearchMatch =
        tpl.title.toLowerCase().includes(searchKey.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchKey.toLowerCase());
      const isLevelMatch = levelFilter === 'all' || tpl.level === levelFilter;
      return isTopicMatch && isSearchMatch && isLevelMatch;
    });
  }, [templates, selectedTopic, searchKey, levelFilter]);

  // Handle Delete Topic
  const handleConfirmDeleteTopic = () => {
    if (!deletingTopic) return;
    setTopicsList((prev) => prev.filter((t) => t.name !== deletingTopic));
    if (selectedTopic === deletingTopic) {
      setSelectedTopic(null);
    }
    setDeletingTopic(null);
  };

  const currentTopicInfo = topicsList.find((t) => t.name === selectedTopic);

  return (
    <div className="admin-tab-content">
      {/* 1. Delete Topic Confirmation Modal */}
      {deletingTopic && (
        <div className="dialog-overlay" onClick={() => setDeletingTopic(null)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-icon danger">
              <AlertTriangle size={28} />
            </div>
            <h3 className="dialog-title">Xóa chủ đề bài tập?</h3>
            <p className="dialog-message">
              Bạn có chắc chắn muốn xóa chủ đề "<strong>{deletingTopic}</strong>" không? Thao tác này sẽ gỡ chủ đề khỏi danh sách quản lý.
            </p>
            <div className="dialog-actions">
              <button
                className="dialog-cancel"
                onClick={() => setDeletingTopic(null)}
              >
                Hủy bỏ
              </button>
              <button
                className="dialog-confirm danger"
                onClick={handleConfirmDeleteTopic}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Delete Template Confirmation Modal */}
      {deletingTemplate && (
        <div className="dialog-overlay" onClick={() => setDeletingTemplate(null)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-icon danger">
              <AlertTriangle size={28} />
            </div>
            <h3 className="dialog-title">Xóa Template bài mẫu?</h3>
            <p className="dialog-message">
              Bạn có chắc chắn muốn xóa bài mẫu "<strong>{deletingTemplate.title}</strong>" không? Thao tác này không thể hoàn tác.
            </p>
            <div className="dialog-actions">
              <button
                className="dialog-cancel"
                onClick={() => setDeletingTemplate(null)}
              >
                Hủy bỏ
              </button>
              <button
                className="dialog-confirm danger"
                onClick={() => {
                  onDeleteTemplate(deletingTemplate.id);
                  setDeletingTemplate(null);
                }}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Edit Template Confirmation Modal */}
      {editingTemplateConfirm && (
        <div className="dialog-overlay" onClick={() => setEditingTemplateConfirm(null)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-icon primary">
              <Edit3 size={28} />
            </div>
            <h3 className="dialog-title">Chỉnh sửa Template bài mẫu?</h3>
            <p className="dialog-message">
              Bạn có muốn mở trình chỉnh sửa nội dung cho bài mẫu "<strong>{editingTemplateConfirm.title}</strong>" không?
            </p>
            <div className="dialog-actions">
              <button
                className="dialog-cancel"
                onClick={() => setEditingTemplateConfirm(null)}
              >
                Hủy bỏ
              </button>
              <button
                className="dialog-confirm primary"
                onClick={() => {
                  onOpenEditModal(editingTemplateConfirm);
                  setEditingTemplateConfirm(null);
                }}
              >
                Xác nhận chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 1: TRANG NGOÀI - QUẢN LÝ DANH SÁCH CHỦ ĐỀ TEMPLATE AI ── */}
      {!selectedTopic ? (
        <>
          {/* Header */}
          <div className="admin-header-row">
            <div>
              <h1 className="admin-page-title">Quản lý Template Mẫu AI Engine</h1>
              <p className="admin-page-sub">
                Các Template mẫu nội bộ dùng làm cơ sở cho AI Engine sinh đề tự động ({topicsList.length} chủ đề).
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="dialog-cancel"
                onClick={onOpenImportExcelModal}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FileSpreadsheet size={16} /> Import Excel / JSON
              </button>
              <button className="assessment-primary" onClick={onOpenAddTplModal}>
                <Plus size={16} /> Tạo Template mới
              </button>
            </div>
          </div>

          {/* Search bar for topics */}
          <div className="history-filter-bar" style={{ marginBottom: '24px' }}>
            <div className="history-search-wrap" style={{ flex: 1 }}>
              <Search size={16} className="history-search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm tên chủ đề hoặc mô tả..."
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
              />
            </div>
          </div>

          {/* Grid các thẻ Chủ đề */}
          <div className="admin-topics-grid">
            {topicsList
              .filter(
                (t) =>
                  t.name.toLowerCase().includes(searchKey.toLowerCase()) ||
                  t.description.toLowerCase().includes(searchKey.toLowerCase())
              )
              .map((topic) => {
                const Icon = ICON_MAP[topic.icon] ?? Layers;
                const count = templateCountByTopic[topic.name] || 0;

                return (
                  <article key={topic.name} className="admin-topic-card">
                    <div className="admin-topic-card-head">
                      <div className="admin-topic-icon-wrap">
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="admin-topic-card-name">{topic.name}</h3>
                        <span className="topic-badge-count">{count} template mẫu</span>
                      </div>
                    </div>

                    <p className="admin-topic-card-desc">{topic.description}</p>

                    {/* 2 Nút thao tác chính: Xem danh sách & Xóa chủ đề */}
                    <div className="admin-topic-card-actions">
                      <button
                        type="button"
                        className="assessment-primary admin-topic-btn-view"
                        onClick={() => setSelectedTopic(topic.name)}
                      >
                        <Eye size={14} /> Xem danh sách
                      </button>
                      <button
                        type="button"
                        className="history-view-btn danger admin-topic-btn-delete"
                        onClick={() => setDeletingTopic(topic.name)}
                        title="Xóa chủ đề này"
                      >
                        <Trash2 size={14} /> Xóa chủ đề
                      </button>
                    </div>
                  </article>
                );
              })}
          </div>
        </>
      ) : (
        /* ── VIEW 2: TRANG TRONG - DANH SÁCH TEMPLATE CỦA CHỦ ĐỀ ĐƯỢC CHỌN ── */
        <>
          {/* Back Navigation Button */}
          <div style={{ marginBottom: '20px' }}>
            <button
              className="topic-detail-back-btn"
              onClick={() => {
                setSelectedTopic(null);
                setSearchKey('');
              }}
            >
              <ArrowLeft size={16} /> Quay lại danh sách chủ đề
            </button>
          </div>

          {/* Inner Header */}
          <div className="admin-header-row">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 className="admin-page-title" style={{ margin: 0 }}>
                  Chủ đề Template: {selectedTopic}
                </h1>
                <span className="topic-badge-count">
                  {templateCountByTopic[selectedTopic] || 0} bài mẫu AI
                </span>
              </div>
              <p className="admin-page-sub" style={{ marginTop: '6px' }}>
                {currentTopicInfo?.description || 'Danh sách các Template mẫu làm cơ sở sinh đề.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="assessment-primary" onClick={onOpenAddTplModal}>
                <Plus size={16} /> Thêm Template mới
              </button>
            </div>
          </div>

          {/* Filter & Search Bar for Templates */}
          <div className="history-filter-bar" style={{ marginBottom: '24px' }}>
            <div className="history-search-wrap">
              <Search size={16} className="history-search-icon" />
              <input
                type="text"
                placeholder={`Tìm bài mẫu trong chủ đề ${selectedTopic}...`}
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
              />
            </div>

            <SearchableSelect
              options={[
                { label: 'Tất cả trình độ (5 levels)', value: 'all' },
                { label: `${LEVEL_LABELS.beginner} (Mức 1)`, value: 'beginner' },
                { label: `${LEVEL_LABELS.basic} (Mức 2)`, value: 'basic' },
                { label: `${LEVEL_LABELS.intermediate} (Mức 3)`, value: 'intermediate' },
                { label: `${LEVEL_LABELS.advanced} (Mức 4)`, value: 'advanced' },
                { label: `${LEVEL_LABELS.expert} (Mức 5)`, value: 'expert' },
              ]}
              value={levelFilter}
              onChange={(val) => setLevelFilter(val)}
              icon={<Filter size={15} />}
              showSearch={false}
            />
          </div>

          {/* Templates Grid for Selected Topic */}
          <div className="admin-templates-grid">
            {topicTemplates.length > 0 ? (
              topicTemplates.map((tpl) => (
                <article className="admin-template-card" key={tpl.id}>
                  <div className="admin-tpl-head">
                    <span
                      className="profile-role-badge"
                      style={{
                        background: `${LEVEL_COLORS[tpl.level]}18`,
                        color: LEVEL_COLORS[tpl.level],
                        borderColor: `${LEVEL_COLORS[tpl.level]}33`,
                      }}
                    >
                      {LEVEL_LABELS[tpl.level]}
                    </span>
                    <span className="admin-tpl-date">{tpl.updatedAt}</span>
                  </div>

                  <h3 className="admin-tpl-title">{tpl.title}</h3>
                  <p className="admin-tpl-desc" style={{ minHeight: '40px' }}>
                    {tpl.description}
                  </p>

                  {/* Random Constraints pill */}
                  {(tpl.minLength !== undefined || tpl.maxLength !== undefined || tpl.minValue !== undefined || tpl.maxValue !== undefined) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px', fontSize: '11px' }}>
                      {(tpl.minLength !== undefined || tpl.maxLength !== undefined) && (
                        <span style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>
                          Kích thước: {tpl.minLength ?? 0} → {tpl.maxLength ?? '∞'}
                        </span>
                      )}
                      {(tpl.minValue !== undefined || tpl.maxValue !== undefined) && (
                        <span style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>
                          Giá trị: {tpl.minValue ?? '-∞'} → {tpl.maxValue ?? '∞'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Code snippet preview */}
                  <div className="tpl-code-preview-box">
                    <span className="tpl-code-preview-label">
                      <Code2 size={12} /> Code mẫu làm cơ sở
                    </span>
                    <code className="tpl-code-preview-text">
                      {tpl.starterCode}
                    </code>
                  </div>

                  {/* Individual Template Action Buttons: Xem / Sửa / Xóa */}
                  <div className="admin-card-actions">
                    <button
                      type="button"
                      className="history-view-btn"
                      onClick={() => onOpenDetailModal(tpl)}
                      title="Xem chi tiết template"
                    >
                      <Eye size={13} /> Xem
                    </button>
                    <button
                      type="button"
                      className="history-view-btn"
                      onClick={() => setEditingTemplateConfirm(tpl)}
                      title="Chỉnh sửa bài mẫu"
                    >
                      <Edit3 size={13} /> Sửa
                    </button>
                    <button
                      type="button"
                      className="history-view-btn danger"
                      onClick={() => setDeletingTemplate(tpl)}
                      title="Xóa bài mẫu"
                    >
                      <Trash2 size={13} /> Xóa
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '50px 20px',
                  background: '#111520',
                  border: '1px solid #252c3d',
                  borderRadius: '16px',
                  color: '#7d8599',
                }}
              >
                <FileSpreadsheet
                  size={40}
                  strokeWidth={1.2}
                  style={{ color: '#3a4d7a', marginBottom: '10px' }}
                />
                <p style={{ margin: 0, fontSize: '14px', color: '#a0aec0' }}>
                  Chưa có Template bài mẫu nào trong chủ đề này.
                </p>
                <button
                  className="assessment-primary"
                  onClick={onOpenAddTplModal}
                  style={{ marginTop: '14px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <Plus size={14} /> Thêm Template mới ngay
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

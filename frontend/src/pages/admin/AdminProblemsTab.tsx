import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FlaskConical,
  Layers,
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
  Play,
  Check,
  X,
  Code2,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { TOPICS, type PracticeProblem } from '@/types';
import { AdminGeneratorModal } from './AdminGeneratorModal';
import { SearchableSelect, type SelectOption } from '@/components/SearchableSelect';

const TOPIC_ICON_MAP: Record<string, LucideIcon> = {
  Array: ListOrdered,
  String: Type,
  'Hash Table': KeyRound,
  'Two Pointers': MoveHorizontal,
  'Linked List': Link2,
  Stack: Layers,
  Queue: AlignJustify,
  Recursion: Repeat,
  Sorting: ArrowDownWideNarrow,
  'Binary Search': Search,
  Tree: TreePine,
  Graph: Share2,
};

const TOPIC_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Tất cả kiểu bài' },
  ...TOPICS.map((t) => ({ value: t, label: t, icon: TOPIC_ICON_MAP[t] || Layers })),
];

const DIFF_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Mọi cấp độ' },
  { value: 'Easy', label: 'Dễ (Easy)' },
  { value: 'Medium', label: 'Trung bình (Medium)' },
  { value: 'Hard', label: 'Khó (Hard)' },
];

const VERIFY_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Tất cả kiểm thử' },
  { value: 'verified', label: '🟢 Đã test AI' },
  { value: 'pending', label: '🟡 Chờ kiểm thử' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'public', label: '🟢 Public' },
  { value: 'draft', label: '⚪ Bản nháp' },
];

const DIFFICULTY_COLORS: Record<string, { bg: string; color: string; border: string; label: string }> = {
  Easy: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)', label: 'Dễ (Easy)' },
  Medium: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)', label: 'Trung bình' },
  Hard: { bg: 'rgba(244, 63, 94, 0.12)', color: '#f43f5e', border: 'rgba(244, 63, 94, 0.3)', label: 'Khó (Hard)' },
};

interface AdminProblemsTabProps {
  problems: PracticeProblem[];
  onAddProblem: (newProb?: PracticeProblem) => void;
  onEditProblem: (problem: PracticeProblem) => void;
  onDeleteProblem: (id: string) => void;
  onTogglePublicStatus: (id: string) => void;
  onViewDetail: (problem: PracticeProblem) => void;
  onAddGeneratedProblems?: (newProblems: PracticeProblem[]) => void;
}

export function AdminProblemsTab({
  problems,
  onAddProblem,
  onEditProblem,
  onDeleteProblem,
  onTogglePublicStatus,
  onViewDetail,
  onAddGeneratedProblems,
}: AdminProblemsTabProps) {
  // Source Tab State ('manual': do thêm tay | 'ai': do AI generate)
  const [activeSourceTab, setActiveSourceTab] = useState<'manual' | 'ai'>('manual');

  // Search & Filters
  const [searchKey, setSearchKey] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [diffFilter, setDiffFilter] = useState<string>('all');
  const [verifyFilter, setVerifyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [deletingProblem, setDeletingProblem] = useState<PracticeProblem | null>(null);
  const [testingProblem, setTestingProblem] = useState<PracticeProblem | null>(null);
  const [viewingProblem, setViewingProblem] = useState<PracticeProblem | null>(null);
  const [editingProblem, setEditingProblem] = useState<PracticeProblem | null>(null);
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false);
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);

  // Local verification state map
  const [verifiedMap, setVerifiedMap] = useState<Record<string, boolean>>({});

  // Local state for editing form
  const [editFormData, setEditFormData] = useState<Partial<PracticeProblem>>({});
  const [addFormData, setAddFormData] = useState<Partial<PracticeProblem>>({
    title: '',
    topic: TOPICS[0],
    difficulty: 'Easy',
    description: '',
    inputExample: 'nums = [2, 7, 11, 15], target = 9',
    outputExample: '[0, 1]',
    constraints: '1 ≤ N ≤ 10⁵',
  } as any);

  // Active language tab in detail modal
  const [detailLangTab, setDetailLangTab] = useState<'java' | 'python'>('java');

  // Count total manual vs total AI generated problems
  const totalManualCount = useMemo(() => problems.filter((p) => !p.isAiGenerated).length, [problems]);
  const totalAiCount = useMemo(() => problems.filter((p) => p.isAiGenerated).length, [problems]);

  // Check if a problem is verified (Manual is default verified true, AI follows verifiedMap or prob.isVerified)
  const isProblemVerified = (prob: PracticeProblem) => {
    if (verifiedMap[prob.id] !== undefined) return verifiedMap[prob.id];
    if (!prob.isAiGenerated) return true; // Manual problems are verified by default
    return prob.isVerified === true;
  };

  const handleToggleVerification = (prob: PracticeProblem) => {
    // If not verified, open Sandbox test modal first
    if (!isProblemVerified(prob)) {
      setTestingProblem(prob);
    } else {
      setVerifiedMap((prev) => ({ ...prev, [prob.id]: false }));
    }
  };

  const handleTogglePublicClick = (prob: PracticeProblem) => {
    const verified = isProblemVerified(prob);
    // If problem is AI generated and NOT verified yet, require Sandbox testing first
    if (prob.isAiGenerated && !verified && prob.isPublic === false) {
      setTestingProblem(prob);
      return;
    }
    onTogglePublicStatus(prob.id);
  };

  // Filtered problems list according to active tab and selected filters
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      // 1. Tab source match
      const isSourceMatch = activeSourceTab === 'ai' ? Boolean(p.isAiGenerated) : !p.isAiGenerated;
      if (!isSourceMatch) return false;

      // 2. Search match
      const isSearchMatch =
        p.title.toLowerCase().includes(searchKey.toLowerCase()) ||
        p.description.toLowerCase().includes(searchKey.toLowerCase()) ||
        p.topic.toLowerCase().includes(searchKey.toLowerCase());
      if (!isSearchMatch) return false;

      // 3. Topic match
      if (topicFilter !== 'all' && p.topic !== topicFilter) return false;

      // 4. Difficulty match
      if (diffFilter !== 'all' && p.difficulty !== diffFilter) return false;

      // 5. Verification status match
      const verified = isProblemVerified(p);
      if (verifyFilter === 'verified' && !verified) return false;
      if (verifyFilter === 'pending' && verified) return false;

      // 6. Public/Draft status match
      const isPublic = p.isPublic !== false;
      if (statusFilter === 'public' && !isPublic) return false;
      if (statusFilter === 'draft' && isPublic) return false;

      return true;
    });
  }, [problems, activeSourceTab, searchKey, topicFilter, diffFilter, verifyFilter, statusFilter, verifiedMap]);

  // ── PAGINATION LOGIC (20 ITEMS PER PAGE) ──
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProblems = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredProblems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProblems, safeCurrentPage]);

  const startItemIdx = filteredProblems.length > 0 ? (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
  const endItemIdx = Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredProblems.length);

  // Handlers that reset page to 1
  const handleTabChange = (tab: 'manual' | 'ai') => {
    setActiveSourceTab(tab);
    setCurrentPage(1);
  };
  const handleSearchChange = (val: string) => {
    setSearchKey(val);
    setCurrentPage(1);
  };
  const handleTopicFilterChange = (val: string) => {
    setTopicFilter(val);
    setCurrentPage(1);
  };
  const handleDiffFilterChange = (val: string) => {
    setDiffFilter(val);
    setCurrentPage(1);
  };
  const handleVerifyFilterChange = (val: string) => {
    setVerifyFilter(val);
    setCurrentPage(1);
  };
  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  // Open Edit Modal
  const openEditModal = (prob: PracticeProblem) => {
    setEditingProblem(prob);
    setEditFormData({
      title: prob.title,
      topic: prob.topic,
      difficulty: prob.difficulty,
      description: prob.description,
      inputExample: prob.examples?.[0]?.input || '',
      outputExample: prob.examples?.[0]?.output || '',
      constraints: prob.constraints?.[0] || '1 ≤ N ≤ 10⁵',
    } as any);
  };

  // Submit Edit Form
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProblem) return;

    const updatedProb: PracticeProblem = {
      ...editingProblem,
      title: editFormData.title || editingProblem.title,
      topic: editFormData.topic || editingProblem.topic,
      difficulty: editFormData.difficulty || editingProblem.difficulty,
      description: editFormData.description || editingProblem.description,
      examples: [
        {
          input: (editFormData as any).inputExample || editingProblem.examples?.[0]?.input || '',
          output: (editFormData as any).outputExample || editingProblem.examples?.[0]?.output || '',
          explanation: editingProblem.examples?.[0]?.explanation || 'Đã cập nhật',
        },
      ],
      constraints: [(editFormData as any).constraints || '1 ≤ N ≤ 10⁵'],
    };

    onEditProblem(updatedProb);
    setEditingProblem(null);
  };

  // Submit Add Manual Problem Form
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newProb: PracticeProblem = {
      id: `manual-${Date.now()}`,
      title: addFormData.title || 'Bài tập thực hành mới',
      topic: addFormData.topic || TOPICS[0],
      difficulty: addFormData.difficulty || 'Easy',
      description: addFormData.description || 'Mô tả bài tập thực hành',
      examples: [
        {
          input: (addFormData as any).inputExample || 'nums = [1, 2, 3]',
          output: (addFormData as any).outputExample || '6',
          explanation: 'Ví dụ mẫu tạo bởi giảng viên',
        },
      ],
      starterCode: `class Solution {\n    public int solve(int[] nums) {\n        return 0;\n    }\n}`,
      starterCodes: {
        java: `class Solution {\n    public int solve(int[] nums) {\n        return 0;\n    }\n}`,
        python: `class Solution:\n    def solve(self, nums: list[int]) -> int:\n        return 0`,
      },
      language: 'java',
      constraints: [(addFormData as any).constraints || '1 ≤ N ≤ 10⁵'],
      isPublic: true,
      isAiGenerated: false,
      isVerified: true,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onAddGeneratedProblems?.([newProb]);
    onAddProblem?.(newProb);
    setIsAddingModalOpen(false);
  };

  return (
    <div className="admin-tab-content">
      {/* 1. Generator Popup Modal */}
      <AdminGeneratorModal
        isOpen={isGenModalOpen}
        onClose={() => setIsGenModalOpen(false)}
        onGenerateSuccess={(newProblems) => {
          onAddGeneratedProblems?.(newProblems);
          setActiveSourceTab('ai');
        }}
      />

      {/* 2. Delete Problem Confirmation Modal */}
      {deletingProblem && (
        <div className="dialog-overlay" onClick={() => setDeletingProblem(null)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-icon danger">
              <AlertTriangle size={28} />
            </div>
            <h3 className="dialog-title">Xóa bài tập khỏi hệ thống?</h3>
            <p className="dialog-message">
              Bạn có chắc chắn muốn xóa bài "<strong>{deletingProblem.title}</strong>" không? Thao tác này sẽ gỡ bài khỏi ngân hàng đề thi.
            </p>
            <div className="dialog-actions">
              <button
                className="dialog-cancel"
                onClick={() => setDeletingProblem(null)}
              >
                Hủy bỏ
              </button>
              <button
                className="dialog-confirm danger"
                onClick={() => {
                  onDeleteProblem(deletingProblem.id);
                  setDeletingProblem(null);
                }}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. AI Sandbox Test & Verification Modal */}
      {testingProblem && (
        <div className="dialog-overlay" onClick={() => setTestingProblem(null)}>
          <div className="dialog-box" style={{ maxWidth: '620px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(169, 149, 255, 0.15)', color: '#a995ff', padding: '10px', borderRadius: '10px' }}>
                  <FlaskConical size={22} />
                </div>
                <div>
                  <h3 className="dialog-title admin-modal-title" style={{ margin: 0, fontSize: '18px' }}>
                    Chạy Sandbox Kiểm thử AI Test Cases
                  </h3>
                  <span className="admin-modal-sub">Biên dịch & Chạy mã nguồn kiểm tra Output mẫu</span>
                </div>
              </div>
              <button className="dialog-close" onClick={() => setTestingProblem(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="sandbox-modal-card">
              <div className="sandbox-card-title">
                Bài tập: {testingProblem.title}
              </div>
              <div className="sandbox-card-desc">
                {testingProblem.description}
              </div>

              <div className="sandbox-results-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="sandbox-status-passed">
                    <CheckCircle2 size={14} /> SANDBOX RUNNER: 3/3 TEST CASES PASSED
                  </span>
                  <span className="sandbox-metrics">Time: 28ms | Memory: 14.2MB</span>
                </div>
                <div className="sandbox-code-preview">
                  <div><strong>Input:</strong> {testingProblem.examples?.[0]?.input || 'nums = [3, 8, 12, 5], k = 15'}</div>
                  <div className="sandbox-output-text"><strong>Actual Output (Verified):</strong> [0, 2]</div>
                </div>
              </div>
            </div>

            <div className="sandbox-alert-banner">
              ✓ Đã xác nhận Output kiểm thử chính xác. Khi bấm nút bên dưới, bài tập sẽ được đánh dấu <strong>Đã test AI</strong> và tự động kích hoạt trạng thái <strong>Public</strong>.
            </div>

            <div className="dialog-actions">
              <button className="dialog-cancel" onClick={() => setTestingProblem(null)}>
                Đóng
              </button>
              <button
                className="dialog-confirm"
                style={{ background: '#4b78f5' }}
                onClick={() => {
                  setVerifiedMap((prev) => ({ ...prev, [testingProblem.id]: true }));
                  if (testingProblem.isPublic === false) {
                    onTogglePublicStatus(testingProblem.id);
                  }
                  setTestingProblem(null);
                }}
              >
                <Check size={16} /> Xác nhận Đã kiểm thử & Setup Public
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. VIEW DETAIL PROBLEM MODAL */}
      {viewingProblem && (
        <div className="dialog-overlay" onClick={() => setViewingProblem(null)}>
          <div className="dialog-box" style={{ maxWidth: '680px', textAlign: 'left', padding: '28px 32px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      background: DIFFICULTY_COLORS[viewingProblem.difficulty]?.bg || '#78d39e18',
                      color: DIFFICULTY_COLORS[viewingProblem.difficulty]?.color || '#78d39e',
                      border: `1px solid ${DIFFICULTY_COLORS[viewingProblem.difficulty]?.border || '#78d39e33'}`,
                    }}
                  >
                    {viewingProblem.difficulty}
                  </span>
                  <span className="prob-topic-badge" style={{ fontSize: '11.5px', padding: '2px 8px' }}>
                    {viewingProblem.topic}
                  </span>
                  {viewingProblem.isAiGenerated ? (
                    <span className="prob-badge-tag ai">AI Generate</span>
                  ) : (
                    <span className="prob-badge-tag manual">Thêm tay</span>
                  )}
                </div>
                <h2 className="dialog-title admin-modal-title" style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                  {viewingProblem.title}
                </h2>
              </div>
              <button className="dialog-close" onClick={() => setViewingProblem(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
              {/* Mô tả */}
              <div>
                <h4 className="admin-modal-section-title">Mô tả bài tập</h4>
                <p className="admin-modal-section-body">
                  {viewingProblem.description}
                </p>
              </div>

              {/* Ví dụ Input / Output */}
              {viewingProblem.examples?.[0] && (
                <div className="admin-example-card">
                  <h4 className="admin-example-title">
                    <Code2 size={14} /> Ví dụ mẫu Input / Output
                  </h4>
                  <div className="admin-example-code-box">
                    <div><strong>Input:</strong> {viewingProblem.examples[0].input}</div>
                    <div><strong>Output:</strong> {viewingProblem.examples[0].output}</div>
                    {viewingProblem.examples[0].explanation && (
                      <div className="admin-example-explanation">
                        💡 {viewingProblem.examples[0].explanation}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Starter Code */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 className="admin-modal-section-title" style={{ margin: 0 }}>Khung Code Ban Đầu (Starter Code)</h4>
                  <div className="admin-lang-tabs">
                    <button
                      type="button"
                      className={`admin-lang-tab-btn ${detailLangTab === 'java' ? 'active-java' : ''}`}
                      onClick={() => setDetailLangTab('java')}
                    >
                      Java
                    </button>
                    <button
                      type="button"
                      className={`admin-lang-tab-btn ${detailLangTab === 'python' ? 'active-python' : ''}`}
                      onClick={() => setDetailLangTab('python')}
                    >
                      Python
                    </button>
                  </div>
                </div>

                <pre className="admin-starter-code-block">
                  {detailLangTab === 'java'
                    ? viewingProblem.starterCodes?.java || viewingProblem.starterCode
                    : viewingProblem.starterCodes?.python || '# Python starter code\ndef solve(nums):\n    pass'}
                </pre>
              </div>
            </div>

            <div className="dialog-actions" style={{ marginTop: '20px' }}>
              <button className="dialog-cancel" onClick={() => setViewingProblem(null)}>
                Đóng
              </button>
              <button
                className="dialog-confirm"
                style={{ background: '#4b78f5' }}
                onClick={() => {
                  const probToEdit = viewingProblem;
                  setViewingProblem(null);
                  openEditModal(probToEdit);
                }}
              >
                <Edit3 size={15} /> Chỉnh sửa bài này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. EDIT PROBLEM MODAL */}
      {editingProblem && (
        <div className="dialog-overlay" onClick={() => setEditingProblem(null)}>
          <div className="dialog-box" style={{ maxWidth: '640px', textAlign: 'left', padding: '28px 32px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="dialog-title" style={{ margin: 0, fontSize: '19px', color: '#f1f5f9' }}>
                Chỉnh Sửa Bài Tập: {editingProblem.title}
              </h3>
              <button className="dialog-close" onClick={() => setEditingProblem(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label className="auth-field">
                <span className="auth-label" style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>Tên bài tập</span>
                <input
                  type="text"
                  className="admin-modal-input"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  required
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="auth-field">
                  <span className="auth-label" style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Chủ đề / Kiểu bài</span>
                  <SearchableSelect
                    options={TOPICS.map((t) => ({ label: t, value: t }))}
                    value={editFormData.topic || TOPICS[0]}
                    onChange={(val) => setEditFormData({ ...editFormData, topic: val })}
                    showSearch={true}
                  />
                </div>

                <div className="auth-field">
                  <span className="auth-label" style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Độ khó</span>
                  <SearchableSelect
                    options={[
                      { label: 'Dễ (Easy)', value: 'Easy' },
                      { label: 'Trung bình (Medium)', value: 'Medium' },
                      { label: 'Khó (Hard)', value: 'Hard' },
                    ]}
                    value={editFormData.difficulty || 'Easy'}
                    onChange={(val) => setEditFormData({ ...editFormData, difficulty: val as any })}
                    showSearch={false}
                  />
                </div>
              </div>

              <label className="auth-field">
                <span className="auth-label" style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>Mô tả chi tiết bài toán</span>
                <textarea
                  className="admin-modal-input"
                  rows={3}
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label className="auth-field">
                  <span className="auth-label" style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>Ví dụ Input</span>
                  <input
                    type="text"
                    className="admin-modal-input"
                    value={(editFormData as any).inputExample || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, inputExample: e.target.value } as any)}
                  />
                </label>

                <label className="auth-field">
                  <span className="auth-label" style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>Ví dụ Output</span>
                  <input
                    type="text"
                    className="admin-modal-input"
                    value={(editFormData as any).outputExample || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, outputExample: e.target.value } as any)}
                  />
                </label>
              </div>

              <div className="dialog-actions" style={{ marginTop: '12px' }}>
                <button type="button" className="dialog-cancel" onClick={() => setEditingProblem(null)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="dialog-confirm" style={{ background: '#4b78f5' }}>
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ADD MANUAL PROBLEM MODAL */}
      {isAddingModalOpen && (
        <div className="dialog-overlay" onClick={() => setIsAddingModalOpen(false)}>
          <div className="dialog-box" style={{ maxWidth: '640px', textAlign: 'left', padding: '28px 32px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="dialog-title" style={{ margin: 0, fontSize: '19px', color: '#f1f5f9' }}>
                Thêm Bài Tập Mới (Thêm Tay)
              </h3>
              <button className="dialog-close" onClick={() => setIsAddingModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label className="auth-field">
                <span className="auth-label" style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>Tên bài tập</span>
                <input
                  type="text"
                  className="admin-modal-input"
                  placeholder="Nhập tên bài tập..."
                  value={addFormData.title || ''}
                  onChange={(e) => setAddFormData({ ...addFormData, title: e.target.value })}
                  required
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="auth-field">
                  <span className="auth-label" style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Chủ đề / Kiểu bài</span>
                  <SearchableSelect
                    options={TOPICS.map((t) => ({ label: t, value: t }))}
                    value={addFormData.topic || TOPICS[0]}
                    onChange={(val) => setAddFormData({ ...addFormData, topic: val })}
                    showSearch={true}
                  />
                </div>

                <div className="auth-field">
                  <span className="auth-label" style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Độ khó</span>
                  <SearchableSelect
                    options={[
                      { label: 'Dễ (Easy)', value: 'Easy' },
                      { label: 'Trung bình (Medium)', value: 'Medium' },
                      { label: 'Khó (Hard)', value: 'Hard' },
                    ]}
                    value={addFormData.difficulty || 'Easy'}
                    onChange={(val) => setAddFormData({ ...addFormData, difficulty: val as any })}
                    showSearch={false}
                  />
                </div>
              </div>

              <label className="auth-field">
                <span className="auth-label" style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>Mô tả chi tiết</span>
                <textarea
                  className="admin-modal-input"
                  rows={3}
                  placeholder="Nhập đề bài & yêu cầu thuật toán..."
                  value={addFormData.description || ''}
                  onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label className="auth-field">
                  <span className="auth-label" style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>Ví dụ Input</span>
                  <input
                    type="text"
                    className="admin-modal-input"
                    value={(addFormData as any).inputExample || ''}
                    onChange={(e) => setAddFormData({ ...addFormData, inputExample: e.target.value } as any)}
                  />
                </label>

                <label className="auth-field">
                  <span className="auth-label" style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>Ví dụ Output</span>
                  <input
                    type="text"
                    className="admin-modal-input"
                    value={(addFormData as any).outputExample || ''}
                    onChange={(e) => setAddFormData({ ...addFormData, outputExample: e.target.value } as any)}
                  />
                </label>
              </div>

              <div className="dialog-actions" style={{ marginTop: '12px' }}>
                <button type="button" className="dialog-cancel" onClick={() => setIsAddingModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="dialog-confirm" style={{ background: '#4b78f5' }}>
                  <Plus size={16} /> Tạo bài mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── HEADER ROW ── */}
      <div className="admin-header-row">
        <div>
          <h1 className="admin-page-title">Quản lý Ngân hàng Bài tập & Trạng thái Công khai</h1>
          <p className="admin-page-sub">
            Ngân hàng hiện có <strong>{problems.length}</strong> bài tập ({totalManualCount} bài thêm tay & {totalAiCount} bài AI generated).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="dialog-cancel"
            onClick={() => setIsGenModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#a995ff',
              borderColor: 'rgba(169, 149, 255, 0.3)',
              background: 'rgba(169, 149, 255, 0.1)',
            }}
          >
            <Sparkles size={16} /> Generate đề thi AI
          </button>
          <button className="assessment-primary" onClick={() => setIsAddingModalOpen(true)}>
            <Plus size={16} /> Thêm bài mới
          </button>
        </div>
      </div>

      {/* ── UNIFIED CONTROL BAR (PILL TABS + FILTERS) ── */}
      <div className={`admin-unified-control-bar theme-${activeSourceTab}`}>
        {/* Left Pill Toggle Tabs */}
        <div className="unified-toggle-tabs">
          <button
            type="button"
            className={`unified-tab-btn ${activeSourceTab === 'manual' ? 'is-active' : ''}`}
            onClick={() => handleTabChange('manual')}
          >
            <Edit3 size={15} />
            <span>Đề thêm tay ({totalManualCount})</span>
          </button>
          <button
            type="button"
            className={`unified-tab-btn ${activeSourceTab === 'ai' ? 'is-active' : ''}`}
            onClick={() => handleTabChange('ai')}
          >
            <Sparkles size={15} />
            <span>AI Generate ({totalAiCount})</span>
          </button>
        </div>

        <div className="unified-v-divider" />

        {/* Dropdown Filters Group */}
        <div className="unified-filters-group">
          {/* Lọc theo Kiểu bài / Chủ đề */}
          <SearchableSelect
            options={TOPIC_OPTIONS}
            value={topicFilter}
            onChange={handleTopicFilterChange}
            icon={Filter}
            placeholder="Kiểu bài"
          />

          {/* Lọc theo Độ khó */}
          <SearchableSelect
            options={DIFF_OPTIONS}
            value={diffFilter}
            onChange={handleDiffFilterChange}
            icon={Filter}
            placeholder="Độ khó"
            showSearch={false}
          />

          {/* Lọc theo Tình trạng AI Test */}
          <SearchableSelect
            options={VERIFY_OPTIONS}
            value={verifyFilter}
            onChange={handleVerifyFilterChange}
            icon={FlaskConical}
            placeholder="Kiểm thử AI"
            showSearch={false}
          />

          {/* Lọc theo Trạng thái Công khai */}
          <SearchableSelect
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={handleStatusFilterChange}
            icon={Globe}
            placeholder="Trạng thái"
            showSearch={false}
          />
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER (DATA TABLE LIST - NO OUTER HEAVY BORDER FRAME) ── */}
      <div className={`admin-framed-tab-box theme-${activeSourceTab}`}>
        {/* Header Info */}
        <div className="admin-framed-tab-header">
          <div className="framed-tab-info-tag">
            {activeSourceTab === 'manual' ? (
              <span className="info-tag-content manual">
                <Edit3 size={13} /> Khung Đề do Giảng viên / Admin Thêm tay ({filteredProblems.length} bài)
              </span>
            ) : (
              <span className="info-tag-content ai">
                <Sparkles size={13} /> Khung Bài tập do AI Engine Generate ({filteredProblems.length} bài)
              </span>
            )}
          </div>
        </div>

        {/* Content Body: Data Table */}
        <div className="admin-framed-tab-body">
          {filteredProblems.length > 0 ? (
            <>
              <div className="admin-table-container">
                <table className="admin-problems-table">
                  <thead>
                    <tr>
                      <th style={{ width: '35px', textAlign: 'center' }}>#</th>
                      <th>Tên bài tập</th>
                      <th>Kiểu bài / Chủ đề</th>
                      <th>Độ khó</th>
                      <th>Tình trạng AI Test</th>
                      <th>Công khai</th>
                      <th style={{ textAlign: 'center', width: '120px' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProblems.map((prob, idx) => {
                      const TopicIcon = TOPIC_ICON_MAP[prob.topic] || Layers;
                      const diffStyle = DIFFICULTY_COLORS[prob.difficulty] || DIFFICULTY_COLORS.Easy;
                      const isVerified = isProblemVerified(prob);
                      const isPublic = prob.isPublic !== false;

                      return (
                        <tr key={prob.id}>
                          {/* 1. STT */}
                          <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>
                            {startItemIdx + idx}
                          </td>

                          {/* 2. Tên bài tập */}
                          <td>
                            <div className="prob-title-wrap">
                              <div className="prob-title-text" title={prob.title}>
                                <span>{prob.title}</span>
                                {prob.isAiGenerated ? (
                                  <span className="prob-badge-tag ai">
                                    <Sparkles size={10} /> AI Generate
                                  </span>
                                ) : (
                                  <span className="prob-badge-tag manual">
                                    <Edit3 size={10} /> Thêm tay
                                  </span>
                                )}
                              </div>
                              <div className="prob-desc-snippet" title={prob.description}>
                                {prob.description}
                              </div>
                            </div>
                          </td>

                          {/* 3. Kiểu bài / Chủ đề */}
                          <td>
                            <div className="prob-topic-badge">
                              <TopicIcon size={13} style={{ color: '#5e8dfa' }} />
                              <span>{prob.topic}</span>
                            </div>
                          </td>

                          {/* 4. Độ khó */}
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                background: diffStyle.bg,
                                color: diffStyle.color,
                                border: `1px solid ${diffStyle.border}`,
                              }}
                            >
                              {diffStyle.label}
                            </span>
                          </td>

                          {/* 5. Tình trạng AI Test */}
                          <td>
                            <span
                              className={`verify-status-badge ${isVerified ? 'verified' : 'pending'}`}
                              onClick={() => handleToggleVerification(prob)}
                              title={isVerified ? 'Bài đã được test thành công' : 'Bấm để mở Sandbox chạy test kiểm thử AI'}
                            >
                              {isVerified ? (
                                <>
                                  <CheckCircle2 size={13} /> Đã test AI
                                </>
                              ) : (
                                <>
                                  <FlaskConical size={13} /> Chờ kiểm thử
                                </>
                              )}
                            </span>
                          </td>

                          {/* 6. Công khai Toggle Switch */}
                          <td>
                            <div
                              className="toggle-switch-wrap"
                              onClick={() => handleTogglePublicClick(prob)}
                              title={
                                !isVerified
                                  ? 'Cần chạy test Sandbox thành công trước khi công khai bài này'
                                  : isPublic
                                    ? 'Nhấp để chuyển sang Bản nháp (Ẩn)'
                                    : 'Nhấp để công khai bài tập'
                              }
                            >
                              <div className={`toggle-switch-btn ${isPublic ? 'is-public' : ''}`}>
                                <div className="toggle-switch-knob" />
                              </div>
                              <span className={`toggle-switch-label ${isPublic ? 'is-public' : ''}`}>
                                {isPublic ? 'Public' : 'Bản nháp'}
                              </span>
                            </div>
                          </td>

                          {/* 7. Bộ thao tác (ICON ONLY) */}
                          <td>
                            <div className="action-icon-group" style={{ justifyContent: 'center' }}>
                              {/* Icon Xem Chi Tiết */}
                              <button
                                type="button"
                                className="icon-action-btn view"
                                onClick={() => {
                                  setViewingProblem(prob);
                                  onViewDetail(prob);
                                }}
                                title="Xem chi tiết bài tập"
                              >
                                <Eye size={14} />
                              </button>

                              {/* Icon Chạy Test Sandbox */}
                              <button
                                type="button"
                                className="icon-action-btn test"
                                onClick={() => setTestingProblem(prob)}
                                title="Test thử nghiệm kết quả AI trong Sandbox"
                              >
                                <Play size={14} />
                              </button>

                              {/* Icon Chỉnh Sửa */}
                              <button
                                type="button"
                                className="icon-action-btn edit"
                                onClick={() => openEditModal(prob)}
                                title="Chỉnh sửa bài tập"
                              >
                                <Edit3 size={14} />
                              </button>

                              {/* Icon Xóa */}
                              <button
                                type="button"
                                className="icon-action-btn delete"
                                onClick={() => setDeletingProblem(prob)}
                                title="Xóa bài tập"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── PAGINATION CONTROLS BAR (20 ITEMS PER PAGE) ── */}
              <div
                className="admin-pagination-bar"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div className="pagination-info" style={{ fontSize: '13px' }}>
                  Hiển thị bài thứ <strong>{startItemIdx} - {endItemIdx}</strong> trên tổng số <strong>{filteredProblems.length}</strong> bài tập (Trang {safeCurrentPage}/{totalPages})
                </div>

                <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={14} /> Trước
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`pagination-num ${pageNum === safeCurrentPage ? 'is-active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Sau <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                color: '#7d8599',
                background: 'rgba(255, 255, 255, 0.015)',
                borderRadius: '12px',
                border: '1px dashed #1e2638',
              }}
            >
              <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 600, color: '#94a3b8' }}>
                Không tìm thấy bài tập nào phù hợp với bộ lọc hiện tại.
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Thử thay đổi từ khóa tìm kiếm hoặc chọn lại các bộ lọc cấp độ, kiểu bài.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

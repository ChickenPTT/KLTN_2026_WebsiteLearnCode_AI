import { useCallback, useEffect, useState } from 'react';
import {
  Sliders,
  RefreshCw,
  Sparkles,
  FileCode,
  CheckCircle2,
  Globe,
  Check,
  FlaskConical,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { SearchableSelect } from '@/components/SearchableSelect';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  problemsApi,
  templateApi,
  titleFromStatement,
  toDifficulty,
  LANGUAGE_LABELS,
  type AdminProblem,
  type BackendTemplate,
  type VerifyResult,
} from '@/lib/problemsApi';
import { AdminVerifyModal } from './AdminVerifyModal';
import { apiErrorMessage } from './adminApi.utils';

interface AdminGeneratorTabProps {
  /** Chi ADMIN duoc xoa bai (giang vien nhan 403) */
  canDelete: boolean;
  /** Ghi nhat ky thao tac (Audit Log tren Dashboard) */
  onLog?: (action: 'CREATE' | 'DELETE' | 'TOGGLE', target: string) => void;
}

const DIFF_COLORS: Record<string, string> = { Easy: '#78d39e', Medium: '#f5c95d', Hard: '#f08a8a' };

function templateLabel(t: BackendTemplate): string {
  const parts = [t.name, t.topic?.name, t.level].filter((s): s is string => Boolean(s));
  return parts.join(' · ');
}

export function AdminGeneratorTab({ canDelete, onLog }: AdminGeneratorTabProps) {
  // Danh sach template tu DB
  const [templates, setTemplates] = useState<BackendTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  // Tham so sinh de
  const [templateId, setTemplateId] = useState<string>('');
  const [genCount, setGenCount] = useState<number>(3);
  const [useAi, setUseAi] = useState(false);

  // Tien trinh sinh
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [genErrors, setGenErrors] = useState<string[]>([]);
  const [generated, setGenerated] = useState<AdminProblem[]>([]);

  // Thao tac tren tung bai
  const [busyId, setBusyId] = useState<number | null>(null);
  const [verifying, setVerifying] = useState<AdminProblem | null>(null);
  const [verifyMap, setVerifyMap] = useState<Record<number, VerifyResult>>({});
  const [deleting, setDeleting] = useState<AdminProblem | null>(null);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadTemplates = useCallback(() => {
    setTemplatesLoading(true);
    setTemplatesError(null);
    templateApi
      .list()
      .then((list) => {
        setTemplates(list);
        setTemplateId((cur) => (cur && list.some((t) => String(t.id) === cur) ? cur : list[0] ? String(list[0].id) : ''));
      })
      .catch((err: unknown) => setTemplatesError(apiErrorMessage(err)))
      .finally(() => setTemplatesLoading(false));
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const selectedTemplate = templates.find((t) => String(t.id) === templateId) ?? null;

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    const total = Math.max(1, Math.min(10, genCount));
    setIsGenerating(true);
    setBannerMsg(null);
    setActionError(null);
    setGenErrors([]);
    setProgress({ done: 0, total });

    let ok = 0;
    let consecutiveFails = 0;
    for (let i = 0; i < total; i++) {
      setProgress({ done: i, total });
      try {
        const p = await templateApi.generate(selectedTemplate.id, useAi);
        ok++;
        consecutiveFails = 0;
        setGenerated((prev) => [p, ...prev]);
      } catch (err) {
        consecutiveFails++;
        const msg = apiErrorMessage(err);
        setGenErrors((prev) => [...prev, `Biến thể ${i + 1}: ${msg}`]);
        // Mat ket noi / het quyen / loi lien tiep -> dung lai, khong spam backend
        if (consecutiveFails >= 2 || msg.startsWith('Không kết nối') || msg.startsWith('Bạn không có quyền')) {
          if (i < total - 1) {
            setGenErrors((prev) => [...prev, `Đã dừng sau ${i + 1}/${total} lần sinh do lỗi.`]);
          }
          break;
        }
      }
    }

    setProgress(null);
    setIsGenerating(false);
    if (ok > 0) {
      setBannerMsg(`Đã sinh ${ok}/${total} bài nháp từ template "${selectedTemplate.name}". Hãy Kiểm tra rồi Xuất bản.`);
      onLog?.('CREATE', `Sinh ${ok} bài nháp từ template "${selectedTemplate.name}"${useAi ? ' (AI viết lại đề)' : ''}`);
    }
  };

  const replaceGenerated = (p: AdminProblem) => setGenerated((prev) => prev.map((x) => (x.id === p.id ? p : x)));

  const handlePublish = async (p: AdminProblem) => {
    setBusyId(p.id);
    setActionError(null);
    try {
      const updated = await problemsApi.publish(p.id);
      replaceGenerated(updated);
      const title = titleFromStatement(p.statement, p.id);
      setBannerMsg(`Đã xuất bản bài "${title}" cho sinh viên.`);
      onLog?.('TOGGLE', `Xuất bản bài "${title}"`);
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (p: AdminProblem) => {
    setDeleting(null);
    setBusyId(p.id);
    setActionError(null);
    try {
      await problemsApi.remove(p.id);
      setGenerated((prev) => prev.filter((x) => x.id !== p.id));
      onLog?.('DELETE', `Xóa bài "${titleFromStatement(p.statement, p.id)}"`);
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const templateOptions = templates.map((t) => ({ label: templateLabel(t), value: String(t.id) }));

  return (
    <div className="admin-tab-content">
      <div className="admin-header-row">
        <div>
          <h1 className="admin-page-title">Sinh đề tự động từ Template</h1>
          <p className="admin-page-sub">
            Chọn template, hệ thống sinh biến thể đề bài (test input ngẫu nhiên, output chạy từ lời giải mẫu trên Judge0) và lưu ở trạng thái <strong>Nháp</strong>.
            Bấm <strong>Kiểm tra</strong> để chạy lại toàn bộ test case, sau đó <strong>Xuất bản</strong> cho sinh viên.
          </p>
        </div>
      </div>

      {bannerMsg && (
        <div
          style={{
            background: 'rgba(120, 211, 158, 0.12)',
            border: '1px solid rgba(120, 211, 158, 0.35)',
            color: '#78d39e',
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckCircle2 size={18} />
          {bannerMsg}
        </div>
      )}

      {actionError && (
        <div
          style={{
            background: 'rgba(240, 138, 138, 0.12)',
            border: '1px solid rgba(240, 138, 138, 0.35)',
            color: '#f08a8a',
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertTriangle size={18} />
          {actionError}
        </div>
      )}

      <div className="admin-generator-layout">
        {/* Panel tham so sinh de */}
        <div className="admin-card-box">
          <h3 className="admin-card-title">
            <Sliders size={18} /> Thiết Lập Sinh Đề
          </h3>

          <div className="profile-form">
            <div className="auth-field">
              <span className="auth-label" style={{ marginBottom: '6px' }}>Template</span>
              {templatesLoading ? (
                <span style={{ color: '#7d8599', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={14} className="spin" /> Đang tải danh sách template...
                </span>
              ) : templatesError ? (
                <div style={{ color: '#f08a8a', fontSize: '13px' }}>
                  {templatesError}{' '}
                  <button type="button" className="history-view-btn" onClick={loadTemplates}>
                    <RefreshCw size={12} /> Thử lại
                  </button>
                </div>
              ) : templates.length === 0 ? (
                <span style={{ color: '#7d8599', fontSize: '13px' }}>Chưa có template nào trong DB.</span>
              ) : (
                <SearchableSelect
                  options={templateOptions}
                  value={templateId}
                  onChange={(val) => setTemplateId(val)}
                  showSearch={true}
                />
              )}
            </div>

            {selectedTemplate && (
              <div style={{ fontSize: '12.5px', color: '#7d8599', lineHeight: 1.6 }}>
                Chủ đề: <strong>{selectedTemplate.topic?.name ?? 'Khác'}</strong> · Độ khó:{' '}
                <strong>{selectedTemplate.level ?? '—'}</strong> · Ngôn ngữ lời giải:{' '}
                <strong>{LANGUAGE_LABELS[selectedTemplate.languageId] ?? `#${selectedTemplate.languageId}`}</strong>
              </div>
            )}

            <label className="auth-field">
              <span className="auth-label">Số lượng biến thể ({genCount} bài)</span>
              <input
                type="range"
                min={1}
                max={10}
                value={genCount}
                onChange={(e) => setGenCount(Number(e.target.value))}
                disabled={isGenerating}
                style={{ accentColor: '#5e8dfa' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={useAi}
                onChange={(e) => setUseAi(e.target.checked)}
                disabled={isGenerating}
                style={{ accentColor: '#5e8dfa' }}
              />
              Dùng AI viết lại đề bài
            </label>

            <button
              className="assessment-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
              onClick={handleGenerate}
              disabled={isGenerating || !selectedTemplate}
            >
              {isGenerating && progress ? (
                <>
                  <RefreshCw size={16} className="spin" /> Đang sinh {progress.done + 1}/{progress.total}...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Sinh đề ngay
                </>
              )}
            </button>

            {genErrors.length > 0 && (
              <div style={{ color: '#f08a8a', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {genErrors.map((e, i) => (
                  <span key={i}>{e}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel danh sach bai nhap vua sinh */}
        <div className="admin-card-box">
          <h3 className="admin-card-title" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCode size={18} /> Bài vừa sinh & Duyệt xuất bản
            </span>
          </h3>

          {generated.length > 0 ? (
            <div className="admin-gen-results">
              <div className="gen-results-header">
                <span className="gen-exam-tag">
                  <CheckCircle2 size={14} /> {generated.length} bài trong phiên này
                </span>
              </div>

              <div className="gen-question-list">
                {generated.map((p) => {
                  const isPub = p.status === 'PUBLISHED';
                  const diff = toDifficulty(p.level);
                  const vr = verifyMap[p.id];
                  const busy = busyId === p.id;
                  return (
                    <div className="gen-question-item" key={p.id} style={{ borderColor: isPub ? '#78d39e44' : undefined }}>
                      <div className="gen-q-head" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <strong>#{p.id} {titleFromStatement(p.statement, p.id)}</strong>
                          <span className="practice-difficulty" style={{ color: DIFF_COLORS[diff] }}>
                            {p.level ?? diff}
                          </span>
                          <span style={{ fontSize: '12px', color: '#7d8599' }}>
                            {p.topic ?? p.template?.topic?.name ?? 'Khác'} · {p.testCases.length} test case
                          </span>
                          {vr && (
                            <span style={{ fontSize: '12px', fontWeight: 600, color: vr.allPassed ? '#78d39e' : '#f08a8a' }}>
                              {vr.allPassed ? 'Kiểm tra: Đạt' : 'Kiểm tra: Lỗi'}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            className="history-view-btn"
                            onClick={() => setVerifying(p)}
                            disabled={busy}
                            title="Chạy lời giải mẫu với toàn bộ test case"
                          >
                            <FlaskConical size={12} /> Kiểm tra
                          </button>

                          {isPub ? (
                            <span
                              style={{
                                fontSize: '11px',
                                padding: '3px 10px',
                                borderRadius: '12px',
                                background: '#78d39e18',
                                color: '#78d39e',
                                border: '1px solid #78d39e44',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Check size={12} /> Đã xuất bản
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="assessment-primary"
                              onClick={() => handlePublish(p)}
                              disabled={busy}
                              style={{ fontSize: '11px', padding: '4px 10px', gap: '4px' }}
                              title="Xuất bản bài này cho sinh viên"
                            >
                              <Globe size={12} /> Xuất bản
                            </button>
                          )}

                          <button
                            type="button"
                            className="icon-action-btn delete"
                            onClick={() => setDeleting(p)}
                            disabled={busy || !canDelete}
                            style={!canDelete ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
                            title={canDelete ? 'Xóa bài này' : 'Chỉ admin được xóa bài'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <pre className="gen-code-preview" style={{ whiteSpace: 'pre-wrap' }}>
                        <code>{p.statement}</code>
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="admin-empty-preview">
              <Sparkles size={40} strokeWidth={1.2} style={{ color: '#3a4d7a', marginBottom: '12px' }} />
              <p style={{ color: '#7d8599', fontSize: '14px', margin: 0 }}>
                Chọn template và nhấn <strong>Sinh đề ngay</strong>. Các bài nháp vừa sinh sẽ hiện ở đây (và trong mục Quản lý bài tập).
              </p>
            </div>
          )}
        </div>
      </div>

      {verifying && (
        <AdminVerifyModal
          problem={verifying}
          onClose={() => setVerifying(null)}
          onResult={(id, res) => setVerifyMap((prev) => ({ ...prev, [id]: res }))}
          onPublish={async (p) => {
            const updated = await problemsApi.publish(p.id);
            replaceGenerated(updated);
            const title = titleFromStatement(p.statement, p.id);
            setBannerMsg(`Đã xuất bản bài "${title}" cho sinh viên.`);
            onLog?.('TOGGLE', `Xuất bản bài "${title}"`);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={deleting !== null}
        title="Xóa bài nháp?"
        message={deleting ? `Xóa bài #${deleting.id} "${titleFromStatement(deleting.statement, deleting.id)}" khỏi hệ thống?` : ''}
        confirmLabel="Xác nhận xóa"
        variant="danger"
        onConfirm={() => {
          if (deleting) void handleDelete(deleting);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
